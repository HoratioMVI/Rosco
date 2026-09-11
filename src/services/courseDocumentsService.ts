import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mime from 'mime-types';
import { CourseDocumentNode, CourseDocumentsTreeResponse, CourseDocumentSearchItem } from '../types.js';
import { unitStandards2021 } from '../data/unitStandards2021.js';

/**
 * Fast lookup map from Unit Standard ID to unit standard details.
 */
export const unitStandardsMap: Record<string, { title: string; usType: string; credits: number; nqfLevel: string }> = {};
unitStandards2021.forEach(us => {
  unitStandardsMap[us.usId] = {
    title: us.title,
    usType: us.usType,
    credits: us.credits,
    nqfLevel: us.nqfLevel
  };
});

/**
 * Returns the resolved root path for course documents.
 * Priority:
 * 1. Environment variable COURSE_DOCUMENTS_ROOT
 * 2. Standard server location: /var/www/introsoft.co.za/public_html/rosco/corse_documents
 * 3. Local fallback directory: <cwd>/corse_documents
 */
export function getCourseDocumentsRoot(): string {
  if (process.env.COURSE_DOCUMENTS_ROOT && fs.existsSync(process.env.COURSE_DOCUMENTS_ROOT)) {
    return path.resolve(process.env.COURSE_DOCUMENTS_ROOT);
  }

  const serverDir = '/var/www/introsoft.co.za/public_html/rosco/corse_documents';
  if (fs.existsSync(serverDir)) {
    return path.resolve(serverDir);
  }

  const localDir = path.join(process.cwd(), 'corse_documents');
  if (!fs.existsSync(localDir)) {
    try {
      fs.mkdirSync(localDir, { recursive: true });
    } catch {
      // Ignored if cannot create
    }
  }
  return path.resolve(localDir);
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Derives a human-readable clean title from folder and subfolder names.
 * Formats underscores/hyphens, capitalizes words properly (Title Case),
 * expands common acronyms, and formats Unit Standard codes if found.
 */
export function deriveCleanTitleFromFolderName(folderName: string, relativePath?: string): string {
  const usId = extractUnitStandardId(folderName) || (relativePath ? extractUnitStandardId(relativePath) : null);
  
  // If the folder represents a unit standard folder (e.g., "US_9010", "9010", "US-244184")
  if (usId && unitStandardsMap[usId] && /^(us[-_\s]*)?\d+$/i.test(folderName.trim())) {
    const std = unitStandardsMap[usId];
    return `US ${usId}: ${std.title} (${std.usType}, ${std.credits} Credits)`;
  }

  // Clean and format arbitrary folder names nicely
  // Replace underscores and hyphens with spaces
  let clean = folderName
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Acronym & special word transformations
  clean = clean
    .replace(/\bLG\b/gi, 'Learner Guides')
    .replace(/\bLW\b/gi, 'Learner Workbooks')
    .replace(/\bFG\b/gi, 'Facilitator Guides')
    .replace(/\bSA\b/gi, 'Summative Assessments')
    .replace(/\bFA\b/gi, 'Formative Assessments')
    .replace(/\bPOE\b/gi, 'Portfolio of Evidence (PoE)')
    .replace(/\bSLA\b/gi, 'SLA & Agreements')
    .replace(/\bMOU\b/gi, 'MOU Agreements')
    .replace(/\bUS\b/gi, 'Unit Standard')
    .replace(/\bNQF\b/gi, 'NQF')
    .replace(/\bSAQA\b/gi, 'SAQA')
    .replace(/\bSASSETA\b/gi, 'SASSETA')
    .replace(/\bROSCO\b/gi, 'ROSCO');

  // Apply Title Case to words (unless already formatted acronyms like NQF/SAQA)
  clean = clean
    .split(' ')
    .map(word => {
      if (['NQF', 'SAQA', 'SASSETA', 'ROSCO', 'PoE', 'SLA', 'MOU', 'US'].includes(word)) {
        return word;
      }
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  return clean;
}

/**
 * Derives a human-readable clean title from the file name, removing extension,
 * formatting underscores/hyphens, and appending unit standard information if identified.
 */
export function deriveCleanTitleFromFileName(filename: string, usId?: string | null): string {
  const ext = path.extname(filename);
  const baseWithoutExt = path.basename(filename, ext);

  // If a unit standard is known in our accredited curriculum, combine it with the document classification
  if (usId && unitStandardsMap[usId]) {
    const std = unitStandardsMap[usId];
    const friendlyType = deriveFriendlyDocType(filename);
    return `${friendlyType}: ${std.title} (US ${usId})`;
  }

  // Clean and format arbitrary file names nicely
  // Replace underscores and hyphens with spaces, capitalize words
  let clean = baseWithoutExt
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If clean title is just a code (e.g. "9010 LG"), format it
  clean = clean.replace(/\bLG\b/gi, 'Learner Guide')
               .replace(/\bLW\b/gi, 'Learner Workbook')
               .replace(/\bFG\b/gi, 'Facilitator Guide')
               .replace(/\bSA\b/gi, 'Summative Assessment')
               .replace(/\bFA\b/gi, 'Formative Assessment')
               .replace(/\bPOE\b/gi, 'Portfolio of Evidence')
               .replace(/\bSLA\b/gi, 'SLA Agreement')
               .replace(/\bMOU\b/gi, 'MOU Agreement');

  // Capitalize first letter of words
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/**
 * Derives a friendly document classification based on standard SASSETA / ROSCO naming conventions.
 */
export function deriveFriendlyDocType(filename: string): string {
  const lower = filename.toLowerCase();

  if (lower.includes('-lg') || lower.includes('_lg') || lower.includes('learner guide') || lower.includes('lg-') || lower.includes('lg_')) {
    return 'Learner Guide';
  }
  if (lower.includes('-lw') || lower.includes('_lw') || lower.includes('learner workbook') || lower.includes('lw-') || lower.includes('lw_')) {
    return 'Learner Workbook';
  }
  if (lower.includes('-lb') || lower.includes('_lb') || lower.includes('learner book') || lower.includes('lb-')) {
    return 'Learner Book / Manual';
  }
  if (lower.includes('-fg') || lower.includes('_fg') || lower.includes('facilitator guide') || lower.includes('fg-') || lower.includes('facilitator')) {
    return 'Facilitator Guide';
  }
  if (lower.includes('-sa') || lower.includes('_sa') || lower.includes('summative assessment') || lower.includes('summative') || lower.includes('sa-')) {
    return 'Summative Assessment';
  }
  if (lower.includes('-fa') || lower.includes('_fa') || lower.includes('formative assessment') || lower.includes('formative') || lower.includes('fa-')) {
    return 'Formative Assessment';
  }
  if (lower.includes('-ma') || lower.includes('_ma') || lower.includes('model answer') || lower.includes('memorandum') || lower.includes('memo')) {
    return 'Model Answers / Memo';
  }
  if (lower.includes('-poe') || lower.includes('_poe') || lower.includes('portfolio of evidence') || lower.includes('poe guide')) {
    return 'Portfolio of Evidence (PoE)';
  }
  if (lower.includes('-ag') || lower.includes('_ag') || lower.includes('assessor guide')) {
    return 'Assessor Guide';
  }
  if (lower.includes('-mg') || lower.includes('_mg') || lower.includes('moderator guide')) {
    return 'Moderator Guide';
  }
  if (lower.includes('-lp') || lower.includes('_lp') || lower.includes('lesson plan')) {
    return 'Lesson Plan';
  }
  if (lower.includes('-cp') || lower.includes('_cp') || lower.includes('curriculum')) {
    return 'Curriculum Matrix';
  }
  if (lower.includes('matrix') || lower.includes('alignment')) {
    return 'Alignment Matrix';
  }
  if (lower.includes('sla') || lower.includes('mou') || lower.includes('agreement')) {
    return 'SLA / Agreement';
  }
  if (lower.includes('policy') || lower.includes('procedure')) {
    return 'Policy & Procedure';
  }
  if (lower.includes('logbook') || lower.includes('workplace log')) {
    return 'Workplace Logbook';
  }

  // Fallbacks by extension
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') return 'PDF Document';
  if (ext === '.docx' || ext === '.doc') return 'Word Document';
  if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') return 'Spreadsheet';
  if (ext === '.pptx' || ext === '.ppt') return 'Presentation';
  if (ext === '.txt' || ext === '.md') return 'Text Document';
  if (['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext)) return 'Image Asset';

  return 'Course Document';
}

/**
 * Extracts a Unit Standard ID (4 to 6 digit code) from a filename or path.
 */
export function extractUnitStandardId(text: string): string | null {
  const match = text.match(/\b(1\d{4,5}|2\d{4,5}|9\d{3}|7\d{3}|8\d{3})\b/);
  return match ? match[1] : null;
}

/**
 * Security validation: Ensures the requested relative path is strictly inside the root directory.
 * Prevents directory traversal attacks (`../`, `%2e%2e`, null bytes, etc.).
 */
export function getCourseDocumentAbsolutePath(relativePath: string): string | null {
  if (!relativePath || typeof relativePath !== 'string') return null;
  if (relativePath.includes('\0')) return null;

  const root = getCourseDocumentsRoot();
  const safeRelPath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  const resolvedPath = path.resolve(root, safeRelPath);
  const resolvedRoot = path.resolve(root);

  // Must strictly start with the root directory path
  if (!resolvedPath.startsWith(resolvedRoot)) {
    return null;
  }

  if (!fs.existsSync(resolvedPath)) {
    return null;
  }

  return resolvedPath;
}

/**
 * Calculates SHA256 checksum for verification.
 */
export function calculateFileSha256(filePath: string): string {
  try {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
  } catch {
    return '';
  }
}

/**
 * Recursively scans the course documents directory on-the-fly.
 * Dynamically builds the entire tree from the current filesystem state without caching or hardcoding.
 */
export function scanCourseDocumentsDirectory(): CourseDocumentsTreeResponse {
  const root = getCourseDocumentsRoot();

  let totalFiles = 0;
  let totalDirectories = 0;
  let totalSizeBytes = 0;

  function buildNode(currentPath: string, relativePath: string): CourseDocumentNode | null {
    try {
      const stats = fs.statSync(currentPath);
      const name = path.basename(currentPath);

      // Skip system or hidden entries
      if (name.startsWith('.') || name === 'node_modules' || name === 'Thumbs.db') {
        return null;
      }

      if (stats.isDirectory()) {
        totalDirectories++;
        const entries = fs.readdirSync(currentPath);
        const children: CourseDocumentNode[] = [];

        let dirFileCount = 0;
        let dirSubdirCount = 0;

        for (const entry of entries) {
          const entryFullPath = path.join(currentPath, entry);
          const entryRelPath = relativePath ? `${relativePath}/${entry}` : entry;
          const childNode = buildNode(entryFullPath, entryRelPath);
          if (childNode) {
            children.push(childNode);
            if (childNode.type === 'file') {
              dirFileCount++;
            } else {
              dirSubdirCount++;
              dirFileCount += childNode.fileCount || 0;
            }
          }
        }

        // Sort: directories first (alphabetically), then files (alphabetically)
        children.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
          }
          return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        });

        const cleanDirTitle = deriveCleanTitleFromFolderName(name, relativePath);

        return {
          name,
          title: cleanDirTitle,
          type: 'directory',
          path: relativePath,
          lastModified: stats.mtime.toISOString(),
          fileCount: dirFileCount,
          directoryCount: dirSubdirCount,
          children
        };
      } else {
        totalFiles++;
        totalSizeBytes += stats.size;
        const ext = path.extname(name).toLowerCase();
        const mimeType = (mime.lookup(name) as string) || 'application/octet-stream';
        const friendlyDocType = deriveFriendlyDocType(name);
        const unitStandardId = extractUnitStandardId(`${relativePath}/${name}`);
        const unitStandardTitle = unitStandardId && unitStandardsMap[unitStandardId] ? unitStandardsMap[unitStandardId].title : null;
        const cleanTitle = deriveCleanTitleFromFileName(name, unitStandardId);

        return {
          name,
          title: cleanTitle,
          type: 'file',
          path: relativePath,
          extension: ext,
          size: stats.size,
          formattedSize: formatBytes(stats.size),
          lastModified: stats.mtime.toISOString(),
          mimeType,
          friendlyDocType,
          unitStandardId,
          unitStandardTitle
        };
      }
    } catch (err) {
      console.error(`Error reading path ${currentPath}:`, err);
      return null;
    }
  }

  const rootEntries = fs.existsSync(root) ? fs.readdirSync(root) : [];
  const children: CourseDocumentNode[] = [];

  for (const entry of rootEntries) {
    const fullPath = path.join(root, entry);
    const node = buildNode(fullPath, entry);
    if (node) {
      children.push(node);
    }
  }

  // Sort root children
  children.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });

  return {
    name: 'corse_documents',
    type: 'directory',
    rootPath: root,
    totalFiles,
    totalDirectories,
    totalSizeBytes,
    totalSizeFormatted: formatBytes(totalSizeBytes),
    children,
    lastScanned: new Date().toISOString()
  };
}

/**
 * Searches all files under course documents dynamically by keyword.
 * Searches filename, folder path, extension, friendly type, and Unit Standard numbers.
 */
export function searchCourseDocuments(query: string): { results: CourseDocumentSearchItem[]; query: string; totalFound: number } {
  const root = getCourseDocumentsRoot();
  const cleanQuery = (query || '').trim().toLowerCase();
  const results: CourseDocumentSearchItem[] = [];

  if (!cleanQuery) {
    return { results: [], query: '', totalFound: 0 };
  }

  function walk(currentDir: string, relativePath: string) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir);

    for (const entry of entries) {
      if (entry.startsWith('.') || entry === 'node_modules' || entry === 'Thumbs.db') continue;
      const fullPath = path.join(currentDir, entry);
      const relPath = relativePath ? `${relativePath}/${entry}` : entry;

      try {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          walk(fullPath, relPath);
        } else {
          const ext = path.extname(entry).toLowerCase();
          const friendlyType = deriveFriendlyDocType(entry);
          const usId = extractUnitStandardId(`${relPath}/${entry}`);
          const unitStandardTitle = usId && unitStandardsMap[usId] ? unitStandardsMap[usId].title : null;
          const cleanTitle = deriveCleanTitleFromFileName(entry, usId);
          const folderPath = path.dirname(relPath) === '.' ? '' : path.dirname(relPath);

          const matches =
            entry.toLowerCase().includes(cleanQuery) ||
            cleanTitle.toLowerCase().includes(cleanQuery) ||
            relPath.toLowerCase().includes(cleanQuery) ||
            folderPath.toLowerCase().includes(cleanQuery) ||
            ext.toLowerCase().includes(cleanQuery) ||
            friendlyType.toLowerCase().includes(cleanQuery) ||
            (usId && usId.toLowerCase().includes(cleanQuery)) ||
            (unitStandardTitle && unitStandardTitle.toLowerCase().includes(cleanQuery));

          if (matches) {
            results.push({
              name: entry,
              title: cleanTitle,
              path: relPath,
              folderPath,
              extension: ext,
              size: stats.size,
              formattedSize: formatBytes(stats.size),
              lastModified: stats.mtime.toISOString(),
              mimeType: (mime.lookup(entry) as string) || 'application/octet-stream',
              friendlyDocType: friendlyType,
              unitStandardId: usId,
              unitStandardTitle
            });
          }
        }
      } catch (err) {
        console.error(`Error reading ${fullPath}:`, err);
      }
    }
  }

  if (fs.existsSync(root)) {
    walk(root, '');
  }

  return {
    results,
    query,
    totalFound: results.length
  };
}
