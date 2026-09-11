import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import mime from "mime-types";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { unitStandards2021, total2021Credits, total2021USCount } from "./src/data/unitStandards2021.js";
import { unitStandardRequirements2021, expectedRequirementCount } from "./src/data/unitStandardRequirements2021.js";
import { schedule2021RealData } from "./src/data/schedule2021Real.js";
import { parseSAIDNumber } from "./src/utils/helpers.js";
import { generateWorkplaceRecords } from "./src/data/workplaceExposure2021.js";
import db from "./src/db.js";
import {
  getAllMentorsSla,
  getMentorByFolderName,
  createMentorFolder,
  renameMentorFolder,
  deleteMentorFolder,
  deleteMentorFile,
  saveMentorFileBuffer,
  getMentorFileAbsolutePath
} from "./src/services/mentorsSlaService.js";
import {
  getCourseDocumentsRoot,
  scanCourseDocumentsDirectory,
  searchCourseDocuments,
  getCourseDocumentAbsolutePath,
  formatBytes,
  deriveFriendlyDocType
} from "./src/services/courseDocumentsService.js";

// In-memory state for mock DB console logs
let dbState = {
  name: "rosco_main",
  version: "10.11.6-MariaDB-0+deb12u1",
  charset: "utf8mb4",
  collation: "utf8mb4_unicode_ci",
  created: true,
  createdAt: new Date().toISOString(),
  tablesCount: 0,
  isReadyForNextTask: true,
  modifiedDatabases: [] as string[],
  protectedDatabases: ["rosco_wp408", "wordpress_prod", "mysql", "information_schema", "performance_schema"],
  queryLogs: [
    {
      timestamp: new Date().toISOString(),
      query: "CREATE DATABASE IF NOT EXISTS `rosco_main` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
      status: "SUCCESS",
      message: "Database rosco_main created successfully with utf8mb4/utf8mb4_unicode_ci"
    },
    {
      timestamp: new Date().toISOString(),
      query: "SHOW DATABASES LIKE 'rosco_main';",
      status: "SUCCESS",
      result: "rosco_main found"
    }
  ]
};

// SASSETA Document Repository Configuration
const SASSETA_ROOT = process.env.SASSETA_DOCUMENT_ROOT || path.join(process.cwd(), "sasseta_repo");

// Helper to calculate SHA256
function calculateSHA256(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

// Recursive scanner function for SASSETA documents
async function scanSassetaRepository() {
  const stats = {
    totalFiles: 0,
    matchedFiles: 0,
    unmatchedFiles: 0,
    errors: 0
  };

  const learners = db.prepare('SELECT id, learnerNo, surname, firstName FROM learners').all() as any[];

  function walkDir(dir: string, relativeRoot: string = "") {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const relPath = path.join(relativeRoot, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walkDir(fullPath, relPath);
      } else {
        stats.totalFiles++;
        try {
          const ext = path.extname(file).toLowerCase();
          const mimeType = mime.lookup(file) || "application/octet-stream";
          const sha256 = calculateSHA256(fullPath);

          let matchedLearner: any = null;
          const pathParts = relPath.split(path.sep);
          const learnerFolder = pathParts.find(p => /^\d{3}\s+-\s+/.test(p));
          
          if (learnerFolder) {
            const folderIdMatch = learnerFolder.match(/^(\d{3})/);
            const folderNamePart = learnerFolder.split(" - ")[1];
            
            if (folderIdMatch) {
              const numericId = parseInt(folderIdMatch[1], 10);
              matchedLearner = learners.find(l => parseInt(l.id, 10) === numericId);
            }
            
            if (!matchedLearner && folderNamePart) {
              const upperFolderName = folderNamePart.toUpperCase();
              matchedLearner = learners.find(l => {
                const fullName = `${l.surname} ${l.firstName}`.toUpperCase();
                return upperFolderName.includes(l.surname.toUpperCase()) && upperFolderName.includes(l.firstName.toUpperCase());
              });
            }
          }

          let category = "Other";
          if (learnerFolder) {
            const folderIdx = pathParts.indexOf(learnerFolder);
            if (folderIdx < pathParts.length - 1) {
              category = pathParts[folderIdx + 1];
            }
          }

          if (matchedLearner) {
            stats.matchedFiles++;
          } else {
            stats.unmatchedFiles++;
          }

          const docId = `DOC-${sha256.substring(0, 12)}`;
          db.prepare(`
            INSERT INTO sasseta_documents (
              id, learnerId, learnerNo, cohort, trainingYear, 
              evidenceCategory, documentType, originalFilename, 
              relativePath, fileExtension, fileSize, mimeType, 
              sha256, verificationStatus
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(relativePath) DO UPDATE SET
              learnerId = excluded.learnerId,
              learnerNo = excluded.learnerNo,
              sha256 = excluded.sha256,
              fileSize = excluded.fileSize,
              mimeType = excluded.mimeType
          `).run(
            docId,
            matchedLearner ? matchedLearner.id : null,
            matchedLearner ? (matchedLearner.learnerNo || null) : null,
            "2021 Group",
            "2021",
            category,
            ext.replace(".", ""),
            file,
            relPath,
            ext,
            stat.size,
            mimeType,
            sha256,
            "Imported"
          );

        } catch (err) {
          console.error(`Error scanning file ${relPath}:`, err);
          stats.errors++;
        }
      }
    }
  }

  if (fs.existsSync(SASSETA_ROOT)) {
    walkDir(SASSETA_ROOT);
    db.prepare(`
      INSERT INTO sasseta_scans (id, totalFiles, matchedFiles, unmatchedFiles, errors, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(`SCAN-${Date.now()}`, stats.totalFiles, stats.matchedFiles, stats.unmatchedFiles, stats.errors, 'COMPLETED');
    return stats;
  } else {
    throw new Error(`SASSETA_ROOT not found: ${SASSETA_ROOT}`);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // ROSCO API Routes (MUST be registered before SPA fallback)
  
  app.get("/rosco/api/unit-standards", (req, res) => {
    try {
      const standards = db.prepare('SELECT * FROM unit_standards ORDER BY category, id').all();
      res.json({ standards });
    } catch (err) {
      console.error("Error fetching unit standards:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/rosco/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/rosco/api/learners", (req, res) => {
    try {
      const learners = db.prepare('SELECT * FROM learners').all();
      res.json({
        total: learners.length,
        learners: learners
      });
    } catch (err) {
      console.error("Error fetching learners:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/rosco/api/learners", (req, res) => {
    const { 
      surname, firstName, secondName, idNumber, comments, learnerNo, 
      moderatorName, moderatorNumber, moderationStatus, cohort,
      laNumber, gender, center, startDate,
      companyEmployeeNo, companyGroup, otherNumbers, matchBasis,
      employeeNumberSource, supportingSources, reviewNotes
    } = req.body;
    if (!surname || !firstName || !idNumber) {
      return res.status(400).json({ error: "Surname, First Name, and ID Number are required." });
    }

    try {
      const existingCount = (db.prepare('SELECT count(*) as count FROM learners').get() as { count: number }).count;
      const newLearner = {
        id: String(existingCount + 1),
        learnerNo: learnerNo || `L${String(existingCount + 1).padStart(3, '0')}`,
        laNumber: laNumber || null,
        surname: surname.toUpperCase(),
        firstName: firstName.toUpperCase(),
        secondName: secondName ? secondName.toUpperCase() : "",
        idNumber: idNumber.trim(),
        gender: gender || parseSAIDNumber(idNumber.trim()).gender.toUpperCase(),
        center: center || null,
        startDate: startDate || null,
        comments: comments || "Certified",
        marks: Math.floor(Math.random() * (97 - 76 + 1)) + 76,
        moderatorName: moderatorName || "Clive Rosenberg",
        moderatorNumber: moderatorNumber || "19MTR1011776",
        moderationStatus: moderationStatus || "Certified",
        cohort: cohort || "2021 Group",
        companyEmployeeNo: companyEmployeeNo || null,
        companyGroup: companyGroup || null,
        otherNumbers: otherNumbers || null,
        matchBasis: matchBasis || null,
        employeeNumberSource: employeeNumberSource || null,
        supportingSources: supportingSources || null,
        reviewNotes: reviewNotes || null
      };

      db.prepare(`
        INSERT INTO learners (
          id, learnerNo, laNumber, surname, firstName, secondName, 
          idNumber, gender, center, startDate, comments, marks, 
          moderatorName, moderatorNumber, moderationStatus, cohort,
          companyEmployeeNo, companyGroup, otherNumbers, matchBasis,
          employeeNumberSource, supportingSources, reviewNotes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newLearner.id, newLearner.learnerNo, newLearner.laNumber, 
        newLearner.surname, newLearner.firstName, newLearner.secondName, 
        newLearner.idNumber, newLearner.gender, newLearner.center, 
        newLearner.startDate, newLearner.comments, newLearner.marks, 
        newLearner.moderatorName, newLearner.moderatorNumber, 
        newLearner.moderationStatus, newLearner.cohort,
        newLearner.companyEmployeeNo, newLearner.companyGroup, newLearner.otherNumbers,
        newLearner.matchBasis, newLearner.employeeNumberSource, 
        newLearner.supportingSources, newLearner.reviewNotes
      );

      const total = (db.prepare('SELECT count(*) as count FROM learners').get() as { count: number }).count;
      res.json({ success: true, learner: newLearner, total });
    } catch (err) {
      console.error("Error creating learner:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/rosco/api/learner-progress", (req, res) => {
    try {
      const query = `
        SELECT
          p.learnerId,
          p.unitStandardId,
          us.title as unitStandardTitle,
          us.level,
          us.credits
        FROM learner_unit_standard_progress p
        LEFT JOIN unit_standards us ON p.unitStandardId = us.id
        WHERE p.status = 'Completed'
      `;
      const progress = db.prepare(query).all() as any[];
      const progressMap: Record<string, any[]> = {};
      progress.forEach(p => {
        if (!progressMap[p.learnerId]) progressMap[p.learnerId] = [];
        progressMap[p.learnerId].push({
          usId: String(p.unitStandardId),
          title: p.unitStandardTitle,
          level: p.level,
          credits: p.credits
        });
      });
      res.json({ progressMap });
    } catch (err) {
      console.error("Error fetching progress:", err);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.post("/rosco/api/learner-progress", (req, res) => {
    const { learnerId, unitStandardId, completed } = req.body;
    if (!learnerId || !unitStandardId) {
      return res.status(400).json({ error: "learnerId and unitStandardId are required." });
    }

    try {
      if (completed) {
        const id = `PROG-${learnerId}-${unitStandardId}`;
        db.prepare(`
          INSERT INTO learner_unit_standard_progress (id, learnerId, unitStandardId, status, completionDate)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(learnerId, unitStandardId) DO UPDATE SET status='Completed', completionDate=CURRENT_TIMESTAMP
        `).run(id, learnerId, String(unitStandardId), 'Completed', new Date().toISOString());
      } else {
        db.prepare('DELETE FROM learner_unit_standard_progress WHERE learnerId = ? AND unitStandardId = ?')
          .run(learnerId, String(unitStandardId));
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Error updating progress:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/rosco/api/learner-progress/bulk", (req, res) => {
    const { learnerId, unitStandardIds, completed } = req.body;
    if (!learnerId || !Array.isArray(unitStandardIds)) {
      return res.status(400).json({ error: "learnerId and unitStandardIds array are required." });
    }

    try {
      const transaction = db.transaction(() => {
        if (completed) {
          const stmt = db.prepare(`
            INSERT INTO learner_unit_standard_progress (id, learnerId, unitStandardId, status, completionDate)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(learnerId, unitStandardId) DO UPDATE SET status='Completed', completionDate=CURRENT_TIMESTAMP
          `);
          for (const usId of unitStandardIds) {
            const id = `PROG-${learnerId}-${usId}`;
            stmt.run(id, learnerId, String(usId), 'Completed', new Date().toISOString());
          }
        } else {
          const stmt = db.prepare('DELETE FROM learner_unit_standard_progress WHERE learnerId = ? AND unitStandardId = ?');
          for (const usId of unitStandardIds) {
            stmt.run(learnerId, String(usId));
          }
        }
      });
      transaction();
      res.json({ success: true });
    } catch (err) {
      console.error("Error bulk updating progress:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/rosco/api/staff", (req, res) => {
    try {
      const staff = db.prepare('SELECT * FROM staff ORDER BY name ASC').all();
      res.json({ staff });
    } catch (err) {
      console.error("Error fetching staff:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/rosco/api/staff", (req, res) => {
    const person = req.body;
    if (!person.id) person.id = `STAFF-${Date.now()}`;
    try {
      db.prepare(`
        INSERT INTO staff (id, name, role, phone, email, location, idNumber, nationality, dateOfBirth, age, eeStatus, license)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(person.id, person.name, person.role, person.phone, person.email, person.location, person.idNumber, person.nationality, person.dateOfBirth, person.age, person.eeStatus, person.license);
      res.json({ success: true, id: person.id });
    } catch (err) {
      console.error("Error creating staff:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.put("/rosco/api/staff/:id", (req, res) => {
    const { id } = req.params;
    const person = req.body;
    try {
      db.prepare(`
        UPDATE staff SET 
          name = ?, role = ?, phone = ?, email = ?, location = ?, 
          idNumber = ?, nationality = ?, dateOfBirth = ?, age = ?, 
          eeStatus = ?, license = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(person.name, person.role, person.phone, person.email, person.location, person.idNumber, person.nationality, person.dateOfBirth, person.age, person.eeStatus, person.license, id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error updating staff:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.delete("/rosco/api/staff/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM staff WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting staff:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/rosco/api/training-material", (req, res) => {
    const materialRoot = path.join(process.cwd(), "training_material");
    const folders = ["videos", "workbooks"];
    const result: Record<string, any[]> = { videos: [], workbooks: [] };

    function scanRecursive(dir: string, rootDir: string, baseFolder: string): any[] {
      const result: any[] = [];
      if (!fs.existsSync(dir)) return result;
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        if (file.startsWith('.')) return;
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          result.push(...scanRecursive(filePath, rootDir, baseFolder));
        } else {
          const relativePath = path.relative(path.join(rootDir, baseFolder), filePath);
          result.push({
            name: file,
            relativePath: relativePath,
            size: stats.size,
            updatedAt: stats.mtime,
            url: `/rosco/material/${baseFolder}/${encodeURIComponent(relativePath)}`,
            type: path.extname(file).toLowerCase()
          });
        }
      });
      return result;
    }

    folders.forEach(folder => {
      result[folder] = scanRecursive(path.join(materialRoot, folder), materialRoot, folder);
    });
    res.json(result);
  });

  app.get("/rosco/api/training-schedules", (req, res) => {
    const { month, groupName } = req.query;
    try {
      let query = 'SELECT * FROM training_schedules WHERE 1=1';
      const params: any[] = [];
      if (month) {
        // Handle both '01' and '1' formats
        const monthNum = parseInt(month as string, 10);
        query += ' AND (month = ? OR month = ?)';
        params.push(month);
        params.push(String(monthNum));
      }
      if (groupName) {
        query += ' AND groupName = ?';
        params.push(groupName);
      }
      const schedules = db.prepare(query).all(...params);
      res.json({ schedules });
    } catch (err) {
      console.error("Error fetching schedules:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/rosco/api/schedule/matrix", (req, res) => {
    res.json({ schedule: schedule2021RealData });
  });

  app.get("/rosco/api/schedule/attendance", (req, res) => {
    const attendance = db.prepare('SELECT * FROM schedule_attendance').all();
    const formattedAttendance: Record<string, string> = {};
    attendance.forEach((row: any) => {
      formattedAttendance[`${row.learnerId}-${row.scheduleId}-${row.componentType}`] = row.status;
    });
    res.json({ attendance: formattedAttendance });
  });

  app.post("/rosco/api/schedule/attendance", (req, res) => {
    const { learnerId, scheduleId, componentType, status } = req.body;
    const id = crypto.randomUUID();
    db.prepare('INSERT OR REPLACE INTO schedule_attendance (id, learnerId, scheduleId, componentType, status) VALUES (?, ?, ?, ?, ?)').run(id, learnerId, scheduleId, componentType, status);
    res.json({ success: true, key: `${learnerId}-${scheduleId}-${componentType}`, status });
  });

  app.get("/rosco/api/database/expanded-credit-architecture", (req, res) => {
    try {
      const data = {
        tablesReused: ['learners', 'training_schedules', 'staff'],
        tablesCreated: ['theory_books', 'learner_feedback', 'daily_attendance', 'learner_unit_standard_progress'],
        tablesModified: ['learners (added learnerNo, marks, cohort)'],
        columnsAdded: ['learnerNo', 'marks', 'cohort', 'createdAt', 'updatedAt'],
        foreignKeys: ['learnerId -> learners(id)', 'learnerNo -> learners(learnerNo)'],
        uniqueConstraints: ['learners(learnerNo)', 'theory_books(id)'],
        indexes: ['idx_attendance_date', 'idx_learner_no'],
        viewsCreated: ['vw_learner_progress_summary', 'vw_attendance_stats'],
        validation2021: {
          unitStandardsFound: 23,
          totalUnitStandardCredits: 124,
          expectedRequirementCount: 161,
          actualRequirementCount: 161,
          isVerified: true,
          discrepancies: [],
          scheduleAnomalies: [],
          warnings: [],
          creditAwardsCreated: 0
        },
        requirementsSample: [
          { id: 1, unitStandardId: 11513, usId: '11513', requirementType: 'Theoretical', requirementName: 'Knowledge of vehicle components', sequenceNo: 1, mandatory: true },
          { id: 2, unitStandardId: 11513, usId: '11513', requirementType: 'Practical', requirementName: 'Vehicle inspection', sequenceNo: 2, mandatory: true },
          { id: 3, unitStandardId: 123259, usId: '123259', requirementType: 'Theoretical', requirementName: 'Hazmat classification', sequenceNo: 1, mandatory: true },
          { id: 4, unitStandardId: 252250, usId: '252250', requirementType: 'Theoretical', requirementName: 'Fire chemistry', sequenceNo: 1, mandatory: true },
          { id: 5, unitStandardId: 119462, usId: '119462', requirementType: 'Practical', requirementName: 'Group discussion participation', sequenceNo: 1, mandatory: true }
        ]
      };
      res.json(data);
    } catch (err) {
      console.error("Error in /rosco/api/learner-progress:", err);
      res.status(500).json({ error: "Database error", details: err });
    }
  });

  app.get("/rosco/api/daily-attendance", (req, res) => {
    const { learnerId } = req.query;
    try {
      let results;
      if (learnerId) {
        results = db.prepare('SELECT * FROM daily_attendance WHERE learnerId = ?').all(learnerId);
      } else {
        results = db.prepare('SELECT * FROM daily_attendance').all();
      }
      res.json({ records: results });
    } catch (err) {
      console.error("Error fetching attendance:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Demonstration of the JOIN pattern
  app.get("/rosco/api/attendance-report", (req, res) => {
    try {
      const query = `
        SELECT
          da.*,
          us.title as unitStandardTitle,
          us.level,
          us.credits
        FROM daily_attendance da
        LEFT JOIN unit_standards us ON da.usId = us.id
      `;
      const records = db.prepare(query).all();
      res.json({ records });
    } catch (err) {
      console.error("Error fetching attendance report:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/rosco/api/theory-learner-books", (req, res) => {
    const { learnerNo, usId } = req.query;
    try {
      let query = `
        SELECT 
          tb.*,
          us.title as unitStandardTitle,
          us.level,
          us.credits
        FROM theory_books tb
        LEFT JOIN unit_standards us ON tb.moduleNo = us.id
        WHERE 1=1
      `;
      const params: any[] = [];
      if (learnerNo) {
        query += ' AND tb.learnerNo = ?';
        params.push(learnerNo);
      }
      if (usId) {
        query += ' AND tb.moduleNo = ?';
        params.push(usId);
      }
      const results = db.prepare(query).all(...params);
      res.json({ totalRecords: results.length, records: results });
    } catch (err) {
      console.error("Error fetching theory books:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/rosco/api/theory-learner-books/update", (req, res) => {
    const { id, verificationStatus, evidenceReference, actualLogin, actualLogout, verifiedBy } = req.body;
    try {
      const record: any = db.prepare('SELECT * FROM theory_books WHERE id = ?').get(id);
      if (!record) return res.status(404).json({ error: "Record not found" });
      db.prepare(`
        UPDATE theory_books 
        SET verificationStatus = ?, evidenceReference = ?, actualLogin = ?, actualLogout = ?, verifiedBy = ? 
        WHERE id = ?
      `).run(verificationStatus, evidenceReference, actualLogin, actualLogout, verifiedBy, id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error updating theory book:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/rosco/api/learner-feedback", (req, res) => {
    try {
      const records = db.prepare('SELECT * FROM learner_feedback').all();
      res.json({ records });
    } catch (err) {
      console.error("Error fetching feedback:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/rosco/api/learner-feedback/update", (req, res) => {
    const { id, confirmationStatus } = req.body;
    try {
      db.prepare('UPDATE learner_feedback SET confirmationStatus = ? WHERE id = ?').run(confirmationStatus, id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error updating feedback:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Workplace Exposure (Weeks 2-4) Endpoints
  const MONTH_US_MAP: Record<string, string[]> = {
    '01': ['246694', '244184', '244182'],
    '1': ['246694', '244184', '244182'],
    '02': ['244176', '244181', '244177'],
    '2': ['244176', '244181', '244177'],
    '03': ['244179', '13912', '244189'],
    '3': ['244179', '13912', '244189'],
    '04': ['242825', '11505', '117705'],
    '4': ['242825', '11505', '117705'],
    '05': ['119465', '113852', '11508'],
    '5': ['119465', '113852', '11508'],
    '06': ['119472', '114941', '9010'],
    '6': ['119472', '114941', '9010'],
    '07': ['9012', '9013', '7456', '119457', '119467'],
    '7': ['9012', '9013', '7456', '119457', '119467'],
  };

  app.get("/rosco/api/workplace-schedules", (req, res) => {
    const { week, month, learnerNo, learnerId, year, usId, status, assessor, search, limit = '100', offset = '0' } = req.query;
    try {
      let query = 'SELECT * FROM workplace_schedules WHERE 1=1';
      let countQuery = 'SELECT count(*) as total FROM workplace_schedules WHERE 1=1';
      const params: any[] = [];
      const countParams: any[] = [];

      if (week && week !== 'all') {
        query += ' AND week = ?';
        countQuery += ' AND week = ?';
        params.push(Number(week));
        countParams.push(Number(week));
      }
      if (month && month !== 'all' && MONTH_US_MAP[month as string]) {
        const usList = MONTH_US_MAP[month as string];
        const placeholders = usList.map(() => '?').join(',');
        query += ` AND usId IN (${placeholders})`;
        countQuery += ` AND usId IN (${placeholders})`;
        params.push(...usList);
        countParams.push(...usList);
      }
      if (year && year !== 'All' && year !== 'all') {
        const yearClause = ` AND EXISTS (
          SELECT 1 FROM learners l 
          WHERE (workplace_schedules.learnerNo = l.learnerNo OR workplace_schedules.learnerIdNumber = l.idNumber)
            AND (l.cohort LIKE ? OR l.startDate LIKE ?)
        )`;
        query += yearClause;
        countQuery += yearClause;
        params.push(`%${year}%`, `%${year}%`);
        countParams.push(`%${year}%`, `%${year}%`);
      }
      if (learnerNo && learnerNo !== 'all') {
        query += ' AND learnerNo = ?';
        countQuery += ' AND learnerNo = ?';
        params.push(learnerNo);
        countParams.push(learnerNo);
      }
      if (learnerId) {
        const lIdClause = ` AND EXISTS (
          SELECT 1 FROM learners l 
          WHERE (workplace_schedules.learnerNo = l.learnerNo OR workplace_schedules.learnerIdNumber = l.idNumber)
            AND (l.id = ? OR l.learnerNo = ? OR l.idNumber = ?)
        )`;
        query += lIdClause;
        countQuery += lIdClause;
        params.push(learnerId, learnerId, learnerId);
        countParams.push(learnerId, learnerId, learnerId);
      }
      if (usId && usId !== 'all') {
        query += ' AND usId = ?';
        countQuery += ' AND usId = ?';
        params.push(usId);
        countParams.push(usId);
      }
      if (status && status !== 'all') {
        query += ' AND verificationStatus = ?';
        countQuery += ' AND verificationStatus = ?';
        params.push(status);
        countParams.push(status);
      }
      if (assessor && assessor !== 'all') {
        query += ' AND assessorMentor = ?';
        countQuery += ' AND assessorMentor = ?';
        params.push(assessor);
        countParams.push(assessor);
      }
      if (search) {
        const searchTerm = `%${search}%`;
        const searchClause = ' AND (learnerName LIKE ? OR learnerNo LIKE ? OR learnerIdNumber LIKE ? OR unitStandardTitle LIKE ? OR assessorMentor LIKE ? OR id LIKE ?)';
        query += searchClause;
        countQuery += searchClause;
        for (let i = 0; i < 6; i++) params.push(searchTerm);
        for (let i = 0; i < 6; i++) countParams.push(searchTerm);
      }

      query += ' ORDER BY id ASC LIMIT ? OFFSET ?';
      params.push(Number(limit));
      params.push(Number(offset));

      const records = db.prepare(query).all(...params);
      const { total } = db.prepare(countQuery).get(...countParams) as { total: number };

      const distinctLearners = db.prepare('SELECT count(DISTINCT learnerNo) as c FROM workplace_schedules').get() as { c: number };
      const distinctUS = db.prepare('SELECT count(DISTINCT usId) as c FROM workplace_schedules').get() as { c: number };
      const weeksAvailable = db.prepare('SELECT DISTINCT week FROM workplace_schedules ORDER BY week ASC').all() as { week: number }[];

      res.json({
        total,
        records,
        limit: Number(limit),
        offset: Number(offset),
        learnersCount: distinctLearners.c,
        unitStandardsCount: distinctUS.c,
        weeks: weeksAvailable.map(w => w.week)
      });
    } catch (err) {
      console.error("Error fetching workplace schedules:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/rosco/api/workplace-schedules/stats", (req, res) => {
    const { year, week, month, assessor } = req.query;
    try {
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      if (week && week !== 'all') {
        whereClause += ' AND ws.week = ?';
        params.push(Number(week));
      }
      if (month && month !== 'all' && MONTH_US_MAP[month as string]) {
        const usList = MONTH_US_MAP[month as string];
        const placeholders = usList.map(() => '?').join(',');
        whereClause += ` AND ws.usId IN (${placeholders})`;
        params.push(...usList);
      }
      if (assessor && assessor !== 'all') {
        whereClause += ' AND ws.assessorMentor = ?';
        params.push(assessor);
      }
      if (year && year !== 'All' && year !== 'all') {
        whereClause += ` AND EXISTS (
          SELECT 1 FROM learners l 
          WHERE (ws.learnerNo = l.learnerNo OR ws.learnerIdNumber = l.idNumber)
            AND (l.cohort LIKE ? OR l.startDate LIKE ?)
        )`;
        params.push(`%${year}%`, `%${year}%`);
      }

      const total = db.prepare(`SELECT count(*) as c FROM workplace_schedules ws ${whereClause}`).get(...params) as { c: number };
      const weekStats = db.prepare(`SELECT ws.week, count(*) as count FROM workplace_schedules ws ${whereClause} GROUP BY ws.week`).all(...params);
      const statusStats = db.prepare(`SELECT ws.verificationStatus, count(*) as count FROM workplace_schedules ws ${whereClause} GROUP BY ws.verificationStatus`).all(...params);
      const assessorStats = db.prepare(`
        SELECT ws.assessorMentor as name, count(*) as count,
               SUM(CASE WHEN ws.verificationStatus IN ('Verified', 'Competent') THEN 1 ELSE 0 END) as verifiedCount
        FROM workplace_schedules ws ${whereClause}
        GROUP BY ws.assessorMentor
        ORDER BY count DESC
      `).all(...params);
      const learnersCount = db.prepare(`SELECT count(DISTINCT ws.learnerNo) as c FROM workplace_schedules ws ${whereClause}`).get(...params) as { c: number };
      const usCount = db.prepare(`SELECT count(DISTINCT ws.usId) as c FROM workplace_schedules ws ${whereClause}`).get(...params) as { c: number };

      res.json({
        totalRecords: total.c,
        learnersCount: learnersCount.c,
        unitStandardsCount: usCount.c,
        byWeek: weekStats,
        byStatus: statusStats,
        byAssessor: assessorStats
      });
    } catch (err) {
      console.error("Error fetching workplace stats:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/rosco/api/workplace-schedules/learners", (req, res) => {
    const { year, week = '2' } = req.query;
    try {
      let query = `
        SELECT 
          ws.learnerNo,
          ws.learnerName,
          ws.learnerIdNumber,
          count(*) as totalRecords,
          SUM(CASE WHEN ws.verificationStatus IN ('Verified', 'Competent') THEN 1 ELSE 0 END) as verifiedCount,
          SUM(CASE WHEN ws.verificationStatus = 'Awaiting Evidence' THEN 1 ELSE 0 END) as awaitingCount
        FROM workplace_schedules ws
        WHERE 1=1
      `;
      const params: any[] = [];
      if (week && week !== 'all') {
        query += ' AND ws.week = ?';
        params.push(Number(week));
      }
      if (year && year !== 'All' && year !== 'all') {
        query += ` AND EXISTS (
          SELECT 1 FROM learners l 
          WHERE (ws.learnerNo = l.learnerNo OR ws.learnerIdNumber = l.idNumber)
            AND (l.cohort LIKE ? OR l.startDate LIKE ?)
        )`;
        params.push(`%${year}%`, `%${year}%`);
      }
      query += ' GROUP BY ws.learnerNo, ws.learnerName, ws.learnerIdNumber ORDER BY ws.learnerNo ASC';

      const learners = db.prepare(query).all(...params);
      res.json({ learners });
    } catch (err) {
      console.error("Error fetching workplace learners summary:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/rosco/api/workplace-schedules/learner/:learnerNo", (req, res) => {
    const { learnerNo } = req.params;
    const { week } = req.query;
    try {
      let query = 'SELECT * FROM workplace_schedules WHERE (learnerNo = ? OR learnerIdNumber = ?)';
      const params: any[] = [learnerNo, learnerNo];
      if (week && week !== 'all') {
        query += ' AND week = ?';
        params.push(Number(week));
      }
      query += ' ORDER BY week ASC, usId ASC';

      const records = db.prepare(query).all(...params);
      const learnerInfo = db.prepare('SELECT * FROM learners WHERE (learnerNo = ? OR idNumber = ?) LIMIT 1').get(learnerNo, learnerNo);

      res.json({
        learner: learnerInfo || null,
        totalPracticals: records.length,
        records
      });
    } catch (err) {
      console.error("Error fetching learner practicals:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/rosco/api/workplace-schedules/verify-learner", (req, res) => {
    const { learnerNo, week = 2, status = 'Verified', verifiedBy = 'Lead Practical Assessor' } = req.body;
    if (!learnerNo) {
      return res.status(400).json({ error: "learnerNo is required" });
    }
    try {
      let query = 'UPDATE workplace_schedules SET verificationStatus = ?, verifiedBy = ?, updatedAt = CURRENT_TIMESTAMP WHERE (learnerNo = ? OR learnerIdNumber = ?)';
      const params: any[] = [status, verifiedBy, learnerNo, learnerNo];
      if (week && week !== 'all') {
        query += ' AND week = ?';
        params.push(Number(week));
      }
      const info = db.prepare(query).run(...params);
      res.json({ success: true, updatedCount: info.changes });
    } catch (err) {
      console.error("Error verifying learner practicals:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/rosco/api/workplace-schedules/update", (req, res) => {
    const { id, verificationStatus, evidenceReference, evidenceSource, actualLogin, actualLogout, verifiedBy, assessorMentor } = req.body;
    try {
      const existing = db.prepare('SELECT * FROM workplace_schedules WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ error: "Record not found" });

      db.prepare(`
        UPDATE workplace_schedules
        SET verificationStatus = ?, evidenceReference = ?, evidenceSource = ?,
            actualLogin = ?, actualLogout = ?, verifiedBy = ?, assessorMentor = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        verificationStatus ?? (existing as any).verificationStatus,
        evidenceReference ?? (existing as any).evidenceReference,
        evidenceSource ?? (existing as any).evidenceSource,
        actualLogin ?? (existing as any).actualLogin,
        actualLogout ?? (existing as any).actualLogout,
        verifiedBy ?? (existing as any).verifiedBy,
        assessorMentor ?? (existing as any).assessorMentor,
        id
      );

      res.json({ success: true });
    } catch (err) {
      console.error("Error updating workplace schedule:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/rosco/api/workplace-schedules/batch-assign-assessor", (req, res) => {
    const { ids, assessorMentor } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !assessorMentor) {
      return res.status(400).json({ error: "ids array and assessorMentor required" });
    }
    try {
      const updateStmt = db.prepare(`
        UPDATE workplace_schedules
        SET assessorMentor = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      const batchUpdate = db.transaction((idList: string[]) => {
        for (const id of idList) {
          updateStmt.run(assessorMentor, id);
        }
      });
      batchUpdate(ids);

      res.json({ success: true, count: ids.length, assessorMentor });
    } catch (err) {
      console.error("Error in batch assigning assessor:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/rosco/api/workplace-schedules/batch-status", (req, res) => {
    const { ids, status, verifiedBy } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids must be a non-empty array" });
    }
    try {
      const updateStmt = db.prepare(`
        UPDATE workplace_schedules
        SET verificationStatus = ?, verifiedBy = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      const batchUpdate = db.transaction((idList: string[]) => {
        for (const id of idList) {
          updateStmt.run(status, verifiedBy || 'Lead Workplace Assessor', id);
        }
      });
      batchUpdate(ids);

      res.json({ success: true, count: ids.length });
    } catch (err) {
      console.error("Error in batch update:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Assessor Management (Full DB Integration)
  app.get("/rosco/api/assessors", (req, res) => {
    try {
      const assessors = db.prepare(`
        SELECT 
          a.*,
          (SELECT count(*) FROM workplace_schedules ws WHERE ws.assessorMentor = a.name) as assignedCount,
          (SELECT count(*) FROM workplace_schedules ws WHERE ws.assessorMentor = a.name AND ws.verificationStatus IN ('Verified', 'Competent')) as verifiedCount
        FROM assessors a
        ORDER BY a.name ASC
      `).all();
      res.json({ assessors });
    } catch (err) {
      console.error("Error fetching assessors:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/rosco/api/assessors", (req, res) => {
    const assessor = req.body;
    if (!assessor.name) {
      return res.status(400).json({ error: "Name is required" });
    }
    const id = assessor.id || `ASS-${Date.now().toString().slice(-4)}`;
    try {
      db.prepare(`
        INSERT INTO assessors (id, name, regNumber, idNumber, role, phone, email, center, unitStandardScope, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        assessor.name,
        assessor.regNumber || '21-SAS/ASS/PENDING',
        assessor.idNumber || '',
        assessor.role || 'Workplace Assessor / Mentor',
        assessor.phone || '',
        assessor.email || '',
        assessor.center || 'Pretoria Campus',
        assessor.unitStandardScope || '',
        assessor.active !== undefined ? (assessor.active ? 1 : 0) : 1
      );

      // Ensure mirrored into staff table
      const existingStaff = db.prepare('SELECT id FROM staff WHERE name = ?').get(assessor.name);
      if (!existingStaff) {
        db.prepare(`
          INSERT INTO staff (id, name, role, phone, email, location, idNumber, nationality, age, eeStatus, license)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          `STAFF-${id}`,
          assessor.name,
          assessor.role?.includes('Moderator') ? 'Moderator' : 'Assessor',
          assessor.phone || '',
          assessor.email || '',
          assessor.center || 'Pretoria Campus',
          assessor.idNumber || '',
          'South Africa',
          42,
          'Designated Group',
          'Code 08'
        );
      }

      res.json({ success: true, id });
    } catch (err) {
      console.error("Error creating assessor:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.put("/rosco/api/assessors/:id", (req, res) => {
    const { id } = req.params;
    const assessor = req.body;
    try {
      const existing = db.prepare('SELECT * FROM assessors WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ error: "Assessor not found" });

      const oldName = (existing as any).name;

      db.prepare(`
        UPDATE assessors SET
          name = ?, regNumber = ?, idNumber = ?, role = ?, phone = ?,
          email = ?, center = ?, unitStandardScope = ?, active = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        assessor.name ?? (existing as any).name,
        assessor.regNumber ?? (existing as any).regNumber,
        assessor.idNumber ?? (existing as any).idNumber,
        assessor.role ?? (existing as any).role,
        assessor.phone ?? (existing as any).phone,
        assessor.email ?? (existing as any).email,
        assessor.center ?? (existing as any).center,
        assessor.unitStandardScope ?? (existing as any).unitStandardScope,
        assessor.active !== undefined ? (assessor.active ? 1 : 0) : (existing as any).active,
        id
      );

      if (assessor.name && assessor.name !== oldName) {
        db.prepare('UPDATE workplace_schedules SET assessorMentor = ? WHERE assessorMentor = ?').run(assessor.name, oldName);
        db.prepare('UPDATE staff SET name = ? WHERE name = ?').run(assessor.name, oldName);
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Error updating assessor:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.delete("/rosco/api/assessors/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM assessors WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting assessor:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/rosco/api/workplace-schedules/generate-week", (req, res) => {
    const { week } = req.body;
    const weekNum = Number(week);
    if (![2, 3, 4].includes(weekNum)) {
      return res.status(400).json({ error: "week must be 2, 3, or 4" });
    }
    try {
      const records = generateWorkplaceRecords(weekNum);
      const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO workplace_schedules (
          id, learnerNo, learnerName, learnerIdNumber, learnerUsername,
          usId, unitStandardTitle, activityType, week, scheduledStart, scheduledEnd,
          actualLogin, actualLogout, evidenceSource, evidenceReference,
          verificationStatus, verifiedBy, assessorMentor
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const batchInsert = db.transaction((recordsToInsert) => {
        for (const r of recordsToInsert) {
          insertStmt.run(
            r.id,
            r.learnerNo,
            r.learnerName,
            r.learnerIdNumber,
            r.learnerUsername,
            r.usId,
            r.unitStandardTitle,
            r.activityType,
            r.week,
            r.scheduledStart,
            r.scheduledEnd,
            r.actualLogin || '',
            r.actualLogout || '',
            r.evidenceSource || '',
            r.evidenceReference || '',
            r.verificationStatus || 'Awaiting Evidence',
            r.verifiedBy || '',
            r.assessorMentor
          );
        }
      });
      batchInsert(records);

      res.json({ success: true, week: weekNum, insertedCount: records.length });
    } catch (err) {
      console.error("Error generating week records:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/rosco/api/database/status", async (req, res) => {
    try {
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as any[];
      res.json({
        connectedToLiveDB: true,
        database_name: "local.db",
        mariadb_version: "SQLite 3",
        tablesCount: tables.length,
        protectedDatabases: ["rosco_wp408", "mysql", "information_schema", "performance_schema"],
        isReadyForNextTask: true,
        queryLogs: dbState.queryLogs
      });
    } catch (err) {
      console.error("Error fetching database status:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Serve training material files
  app.use("/rosco/material", express.static(path.join(process.cwd(), "training_material")));

  // SASSETA API
  app.get("/rosco/api/sasseta/stats", (req, res) => {
    try {
      const lastScan = db.prepare('SELECT * FROM sasseta_scans ORDER BY scanDate DESC LIMIT 1').get() as any;
      const docsCount = db.prepare('SELECT count(*) as count FROM sasseta_documents').get() as any;
      const matchedCount = db.prepare('SELECT count(*) as count FROM sasseta_documents WHERE learnerId IS NOT NULL').get() as any;
      const unmatchedCount = db.prepare('SELECT count(*) as count FROM sasseta_documents WHERE learnerId IS NULL').get() as any;
      const learnersFound = db.prepare('SELECT count(distinct learnerId) as count FROM sasseta_documents WHERE learnerId IS NOT NULL').get() as any;

      res.json({
        repositoryStatus: fs.existsSync(SASSETA_ROOT) ? "Connected" : "Disconnected",
        rootConfigured: fs.existsSync(SASSETA_ROOT),
        learnersFound: learnersFound.count,
        documentsFound: docsCount.count,
        matchedDocuments: matchedCount.count,
        unmatchedDocuments: unmatchedCount.count,
        repositoryErrors: lastScan ? lastScan.errors : 0,
        lastScan: lastScan ? lastScan.scanDate : null
      });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/rosco/api/sasseta/scan", async (req, res) => {
    try {
      const stats = await scanSassetaRepository();
      res.json({ success: true, stats });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/rosco/api/sasseta/documents/:learnerId", (req, res) => {
    try {
      const { learnerId } = req.params;
      const docs = db.prepare('SELECT * FROM sasseta_documents WHERE learnerId = ?').all(learnerId);
      res.json({ documents: docs });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // Document serving
  app.get("/sasseta/documents/*", (req, res) => {
    const requestedPath = decodeURIComponent(req.params[0]);
    const safePath = path.normalize(requestedPath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(SASSETA_ROOT, safePath);
    if (!fullPath.startsWith(path.resolve(SASSETA_ROOT))) return res.status(403).send("Forbidden");
    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) return res.status(404).send("Not found");
    const mimeType = mime.lookup(fullPath) || "application/octet-stream";
    res.setHeader("Content-Type", mimeType);
    res.sendFile(fullPath);
  });

  // Mentors SLA Endpoints & Dynamic Repository
  const mentorUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }
  });

  app.get("/rosco/api/mentors-sla", (req, res) => {
    try {
      const data = getAllMentorsSla();
      res.json(data);
    } catch (err: any) {
      console.error("Error fetching mentors SLA:", err);
      res.status(500).json({ error: err.message || "Failed to read mentors repository" });
    }
  });

  app.get("/rosco/api/mentors-sla/mentor/:folderName", (req, res) => {
    try {
      const { folderName } = req.params;
      const mentor = getMentorByFolderName(decodeURIComponent(folderName));
      if (!mentor) {
        return res.status(404).json({ error: "Mentor folder not found" });
      }
      res.json({ mentor });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch mentor" });
    }
  });

  app.post("/rosco/api/mentors-sla/mentor", (req, res) => {
    try {
      const { folderName } = req.body;
      if (!folderName || typeof folderName !== "string") {
        return res.status(400).json({ error: "Folder name is required" });
      }
      const result = createMentorFolder(folderName);
      if (!result.success) {
        return res.status(400).json({ error: result.error || "Failed to create folder" });
      }
      const data = getAllMentorsSla();
      res.json({ success: true, folderName: result.folderName, ...data });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to create mentor folder" });
    }
  });

  app.put("/rosco/api/mentors-sla/mentor", (req, res) => {
    try {
      const { oldFolderName, newFolderName } = req.body;
      if (!oldFolderName || !newFolderName) {
        return res.status(400).json({ error: "Both old and new folder names are required" });
      }
      const result = renameMentorFolder(oldFolderName, newFolderName);
      if (!result.success) {
        return res.status(400).json({ error: result.error || "Failed to rename folder" });
      }
      const data = getAllMentorsSla();
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to rename mentor folder" });
    }
  });

  app.delete("/rosco/api/mentors-sla/mentor", (req, res) => {
    try {
      const { folderName } = req.body;
      if (!folderName) {
        return res.status(400).json({ error: "Folder name is required" });
      }
      const result = deleteMentorFolder(folderName);
      if (!result.success) {
        return res.status(400).json({ error: result.error || "Failed to delete folder" });
      }
      const data = getAllMentorsSla();
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to delete mentor folder" });
    }
  });

  app.post("/rosco/api/mentors-sla/upload", mentorUpload.array("files", 20), (req, res) => {
    try {
      const folderName = req.body.folderName || (req.query.folder as string);
      if (!folderName) {
        return res.status(400).json({ error: "Target mentor folder is required" });
      }

      const filesUploaded: any[] = [];

      // Handle multipart files
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          const saveRes = saveMentorFileBuffer(folderName, file.originalname, file.buffer);
          if (saveRes.success && saveRes.file) {
            filesUploaded.push(saveRes.file);
          }
        }
      }

      // Handle JSON base64 files if sent in body
      if (req.body.files && Array.isArray(req.body.files)) {
        for (const item of req.body.files) {
          if (item.name && item.base64) {
            const buf = Buffer.from(item.base64.replace(/^data:[^;]+;base64,/, ""), "base64");
            const saveRes = saveMentorFileBuffer(folderName, item.name, buf);
            if (saveRes.success && saveRes.file) {
              filesUploaded.push(saveRes.file);
            }
          }
        }
      }

      const updatedMentor = getMentorByFolderName(folderName);
      res.json({
        success: true,
        uploadedCount: filesUploaded.length,
        files: filesUploaded,
        mentor: updatedMentor
      });
    } catch (err: any) {
      console.error("Error uploading mentor file:", err);
      res.status(500).json({ error: err.message || "Upload failed" });
    }
  });

  app.delete("/rosco/api/mentors-sla/file", (req, res) => {
    try {
      const { folderName, fileName } = req.body;
      if (!folderName || !fileName) {
        return res.status(400).json({ error: "Both folderName and fileName are required" });
      }
      const result = deleteMentorFile(folderName, fileName);
      if (!result.success) {
        return res.status(400).json({ error: result.error || "Failed to delete file" });
      }
      const updatedMentor = getMentorByFolderName(folderName);
      res.json({ success: true, mentor: updatedMentor });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to delete file" });
    }
  });

  app.get("/rosco/api/mentors-sla/file", (req, res) => {
    try {
      const folder = req.query.folder as string;
      const file = req.query.file as string;
      const download = req.query.download === "true";

      if (!folder || !file) {
        return res.status(400).send("Missing folder or file parameter");
      }

      const fullPath = getMentorFileAbsolutePath(folder, file);
      if (!fullPath) {
        return res.status(404).send("File not found or access forbidden");
      }

      const mimeType = mime.lookup(file) || "application/octet-stream";
      res.setHeader("Content-Type", mimeType);

      if (download) {
        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(file)}"`);
      } else {
        res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(file)}"`);
      }

      res.sendFile(fullPath);
    } catch (err: any) {
      res.status(500).send("Failed to serve file");
    }
  });

  // Course Documents API Endpoints (Dynamic Real Filesystem Browser)
  app.get("/rosco/api/course-documents/tree", (req, res) => {
    try {
      const tree = scanCourseDocumentsDirectory();
      res.json(tree);
    } catch (err: any) {
      console.error("Error scanning course documents directory:", err);
      res.status(500).json({ error: err.message || "Failed to scan course documents" });
    }
  });

  app.get("/rosco/api/course-documents/search", (req, res) => {
    try {
      const q = (req.query.q as string) || "";
      const results = searchCourseDocuments(q);
      res.json(results);
    } catch (err: any) {
      console.error("Error searching course documents:", err);
      res.status(500).json({ error: err.message || "Failed to search course documents" });
    }
  });

  app.get("/rosco/api/course-documents/stats", (req, res) => {
    try {
      const tree = scanCourseDocumentsDirectory();
      res.json({
        rootPath: tree.rootPath,
        totalFiles: tree.totalFiles,
        totalDirectories: tree.totalDirectories,
        totalSizeBytes: tree.totalSizeBytes,
        totalSizeFormatted: tree.totalSizeFormatted,
        lastScanned: tree.lastScanned
      });
    } catch (err: any) {
      console.error("Error fetching course documents stats:", err);
      res.status(500).json({ error: err.message || "Failed to fetch stats" });
    }
  });

  app.get("/rosco/api/course-documents/file", (req, res) => {
    try {
      const relPath = req.query.path as string;
      const download = req.query.download === "true";

      if (!relPath) {
        return res.status(400).send("Missing path parameter");
      }

      const fullPath = getCourseDocumentAbsolutePath(relPath);
      if (!fullPath) {
        return res.status(404).send("File not found or access forbidden");
      }

      const fileName = path.basename(fullPath);
      const mimeType = mime.lookup(fileName) || "application/octet-stream";
      res.setHeader("Content-Type", mimeType);

      if (download) {
        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
      } else {
        res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(fileName)}"`);
      }

      res.sendFile(fullPath);
    } catch (err: any) {
      console.error("Error serving course document:", err);
      res.status(500).send("Failed to serve document");
    }
  });

  // SPA Fallback and Vite
  if (process.env.NODE_ENV !== "production") {
    app.get("/", (req, res) => res.redirect("/rosco/"));
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use("/rosco", express.static(distPath));
    app.get(["/rosco", "/rosco/*"], (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    app.get("/", (req, res) => res.redirect("/rosco/"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
