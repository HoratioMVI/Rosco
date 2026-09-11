import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mime from 'mime-types';
import { MentorFile, MentorSlaRecord, MentorsSlaSummary } from '../types.js';

export function getMentorsSlaRoot(): string {
  if (process.env.MENTORS_SLA_DIR && fs.existsSync(process.env.MENTORS_SLA_DIR)) {
    return process.env.MENTORS_SLA_DIR;
  }
  const defaultDir = path.join(process.cwd(), 'Mentors SLA');
  if (fs.existsSync(defaultDir)) {
    return defaultDir;
  }
  const sassetaDir = path.join(process.cwd(), 'sasseta_repo', 'Mentors SLA');
  if (fs.existsSync(sassetaDir)) {
    return sassetaDir;
  }
  // Auto create defaultDir if not present
  fs.mkdirSync(defaultDir, { recursive: true });
  return defaultDir;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function classifyDocument(filename: string): { category: string; badgeColor: string } {
  const lower = filename.toLowerCase();

  if (lower.includes('mou') || lower.includes('memorandum of understanding') || lower.includes('sla') || lower.includes('agreement') || lower.includes('contract')) {
    return { category: 'MOU / SLA Agreement', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  }
  if (lower.includes('psira')) {
    return { category: 'PSIRA Accreditation', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
  }
  if (lower.includes('learner') || lower.includes('under') || lower.endsWith('.xlsx') || lower.endsWith('.csv') || lower.includes('roster')) {
    return { category: 'Learner Allocation Roster', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
  }
  if (lower.includes('first aid') || lower.includes('incident investigation') || lower.includes('webinar') || lower.includes('emergency') || lower.includes('seesa') || lower.includes('evacuation')) {
    return { category: 'Safety & Compliance Training', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
  }
  if (lower.includes('national certificate') || lower.includes('gso') || lower.includes('general security') || lower.includes('qualification') || lower.includes('degree') || lower.includes('matric') || lower.includes('merseta')) {
    return { category: 'National Qualifications', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
  }
  if (lower.includes('passport') || lower.includes('permit') || lower.includes('drivers') || lower.includes('id.') || lower.includes('id_') || lower.includes(' id ') || lower.includes('id,')) {
    return { category: 'Identity & Legal Documents', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
  }
  if (lower.includes('cv') || lower.includes('resume') || lower.includes('sasseta registration') || lower.includes('assessor certificate') || lower.includes('moderation certificate')) {
    return { category: 'CV & Assessor Credentials', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
  }

  return { category: 'Supporting Evidence', badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
}

function calculateFileSha256(filePath: string): string {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch {
    return '';
  }
}

export function parseMentorFolderName(folderName: string): { orderNumber: number; mentorName: string } {
  const match = folderName.match(/^(\d+)[\.\-\_\s]+(.*)$/);
  if (match) {
    return {
      orderNumber: parseInt(match[1], 10),
      mentorName: match[2].trim()
    };
  }
  return {
    orderNumber: 999,
    mentorName: folderName.trim()
  };
}

export function getAllMentorsSla(): { mentors: MentorSlaRecord[]; summary: MentorsSlaSummary } {
  const root = getMentorsSlaRoot();
  if (!fs.existsSync(root)) {
    return {
      mentors: [],
      summary: {
        repositoryPath: root,
        totalMentors: 0,
        totalFiles: 0,
        totalSizeBytes: 0,
        totalSizeFormatted: '0 Bytes',
        totalMOUCount: 0,
        totalPSIRACount: 0,
        totalLearnerListsCount: 0,
        categories: []
      }
    };
  }

  const entries = fs.readdirSync(root, { withFileTypes: true });
  const dirEntries = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));

  const mentors: MentorSlaRecord[] = [];
  let grandTotalBytes = 0;
  let grandTotalFiles = 0;
  let totalMOU = 0;
  let totalPSIRA = 0;
  let totalLearnerLists = 0;
  const categoryCounts: Record<string, number> = {};

  for (const dir of dirEntries) {
    const folderName = dir.name;
    const { orderNumber, mentorName } = parseMentorFolderName(folderName);
    const mentorDir = path.join(root, folderName);
    
    let mentorFiles: MentorFile[] = [];
    let mentorTotalBytes = 0;
    let latestMtime = new Date(0);

    try {
      const filesInDir = fs.readdirSync(mentorDir, { withFileTypes: true });
      for (const file of filesInDir) {
        if (!file.isFile() || file.name.startsWith('.')) continue;

        const fullPath = path.join(mentorDir, file.name);
        const stats = fs.statSync(fullPath);
        const ext = path.extname(file.name).toLowerCase();
        const mimeType = mime.lookup(file.name) || 'application/octet-stream';
        const classification = classifyDocument(file.name);
        const sha256 = calculateFileSha256(fullPath);

        if (stats.mtime > latestMtime) {
          latestMtime = stats.mtime;
        }

        mentorTotalBytes += stats.size;
        grandTotalBytes += stats.size;
        grandTotalFiles++;

        categoryCounts[classification.category] = (categoryCounts[classification.category] || 0) + 1;

        if (classification.category === 'MOU / SLA Agreement') totalMOU++;
        if (classification.category === 'PSIRA Accreditation') totalPSIRA++;
        if (classification.category === 'Learner Allocation Roster') totalLearnerLists++;

        const relativePath = path.join(folderName, file.name);

        mentorFiles.push({
          name: file.name,
          relativePath,
          size: stats.size,
          formattedSize: formatBytes(stats.size),
          extension: ext,
          mimeType,
          category: classification.category,
          lastModified: stats.mtime.toISOString(),
          sha256,
          previewUrl: `/rosco/api/mentors-sla/file?folder=${encodeURIComponent(folderName)}&file=${encodeURIComponent(file.name)}`
        });
      }
    } catch (err) {
      console.error(`Error reading mentor directory ${folderName}:`, err);
    }

    // Sort files alphabetically by category and then name
    mentorFiles.sort((a, b) => a.name.localeCompare(b.name));

    const categoriesPresent = Array.from(new Set(mentorFiles.map(f => f.category)));
    const hasMOU = mentorFiles.some(f => f.category === 'MOU / SLA Agreement');
    const hasPSIRA = mentorFiles.some(f => f.category === 'PSIRA Accreditation');
    const hasCertificates = mentorFiles.some(f => f.category === 'National Qualifications' || f.category === 'Safety & Compliance Training');
    const hasLearnerList = mentorFiles.some(f => f.category === 'Learner Allocation Roster');
    const hasIDorPassport = mentorFiles.some(f => f.category === 'Identity & Legal Documents');

    mentors.push({
      folderName,
      orderNumber,
      mentorName,
      fileCount: mentorFiles.length,
      totalSizeBytes: mentorTotalBytes,
      totalSizeFormatted: formatBytes(mentorTotalBytes),
      lastModified: latestMtime.getTime() > 0 ? latestMtime.toISOString() : new Date().toISOString(),
      categoriesPresent,
      hasMOU,
      hasPSIRA,
      hasCertificates,
      hasLearnerList,
      hasIDorPassport,
      files: mentorFiles
    });
  }

  // Sort mentors by orderNumber ascending, then name
  mentors.sort((a, b) => {
    if (a.orderNumber !== b.orderNumber) {
      return a.orderNumber - b.orderNumber;
    }
    return a.mentorName.localeCompare(b.mentorName);
  });

  const categoriesList = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));
  categoriesList.sort((a, b) => b.count - a.count);

  return {
    mentors,
    summary: {
      repositoryPath: root,
      totalMentors: mentors.length,
      totalFiles: grandTotalFiles,
      totalSizeBytes: grandTotalBytes,
      totalSizeFormatted: formatBytes(grandTotalBytes),
      totalMOUCount: totalMOU,
      totalPSIRACount: totalPSIRA,
      totalLearnerListsCount: totalLearnerLists,
      categories: categoriesList
    }
  };
}

export function getMentorByFolderName(folderName: string): MentorSlaRecord | null {
  const data = getAllMentorsSla();
  return data.mentors.find(m => m.folderName === folderName) || null;
}

export function createMentorFolder(folderName: string): { success: boolean; folderName: string; error?: string } {
  const root = getMentorsSlaRoot();
  const cleanName = path.basename(folderName.trim());
  if (!cleanName || cleanName === '.' || cleanName === '..') {
    return { success: false, folderName, error: 'Invalid folder name' };
  }

  const targetDir = path.join(root, cleanName);
  if (fs.existsSync(targetDir)) {
    return { success: false, folderName: cleanName, error: 'Mentor folder already exists' };
  }

  fs.mkdirSync(targetDir, { recursive: true });
  return { success: true, folderName: cleanName };
}

export function renameMentorFolder(oldFolderName: string, newFolderName: string): { success: boolean; error?: string } {
  const root = getMentorsSlaRoot();
  const safeOld = path.basename(oldFolderName.trim());
  const safeNew = path.basename(newFolderName.trim());

  if (!safeOld || !safeNew) {
    return { success: false, error: 'Invalid folder names' };
  }

  const oldPath = path.join(root, safeOld);
  const newPath = path.join(root, safeNew);

  if (!fs.existsSync(oldPath)) {
    return { success: false, error: 'Source folder not found' };
  }
  if (fs.existsSync(newPath)) {
    return { success: false, error: 'Target folder already exists' };
  }

  fs.renameSync(oldPath, newPath);
  return { success: true };
}

export function deleteMentorFolder(folderName: string): { success: boolean; error?: string } {
  const root = getMentorsSlaRoot();
  const safeFolder = path.basename(folderName.trim());
  const targetPath = path.join(root, safeFolder);

  if (!fs.existsSync(targetPath)) {
    return { success: false, error: 'Folder not found' };
  }

  fs.rmSync(targetPath, { recursive: true, force: true });
  return { success: true };
}

export function deleteMentorFile(folderName: string, fileName: string): { success: boolean; error?: string } {
  const root = getMentorsSlaRoot();
  const safeFolder = path.basename(folderName.trim());
  const safeFile = path.basename(fileName.trim());
  const filePath = path.join(root, safeFolder, safeFile);

  if (!fs.existsSync(filePath)) {
    return { success: false, error: 'File not found' };
  }

  fs.unlinkSync(filePath);
  return { success: true };
}

export function saveMentorFileBuffer(folderName: string, fileName: string, buffer: Buffer): { success: boolean; error?: string; file?: MentorFile } {
  const root = getMentorsSlaRoot();
  const safeFolder = path.basename(folderName.trim());
  const safeFile = path.basename(fileName.trim());
  const mentorDir = path.join(root, safeFolder);

  if (!fs.existsSync(mentorDir)) {
    fs.mkdirSync(mentorDir, { recursive: true });
  }

  const filePath = path.join(mentorDir, safeFile);
  fs.writeFileSync(filePath, buffer);

  const stats = fs.statSync(filePath);
  const ext = path.extname(safeFile).toLowerCase();
  const mimeType = mime.lookup(safeFile) || 'application/octet-stream';
  const classification = classifyDocument(safeFile);
  const sha256 = calculateFileSha256(filePath);

  return {
    success: true,
    file: {
      name: safeFile,
      relativePath: path.join(safeFolder, safeFile),
      size: stats.size,
      formattedSize: formatBytes(stats.size),
      extension: ext,
      mimeType,
      category: classification.category,
      lastModified: stats.mtime.toISOString(),
      sha256,
      previewUrl: `/rosco/api/mentors-sla/file?folder=${encodeURIComponent(safeFolder)}&file=${encodeURIComponent(safeFile)}`
    }
  };
}

export function getMentorFileAbsolutePath(folderName: string, fileName: string): string | null {
  const root = getMentorsSlaRoot();
  const safeFolder = path.basename(folderName.trim());
  const safeFile = path.basename(fileName.trim());
  const filePath = path.join(root, safeFolder, safeFile);

  // Security check: ensure path is inside root
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(root))) {
    return null;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return null;
  }

  return filePath;
}
