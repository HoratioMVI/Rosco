import Database from 'better-sqlite3';
import { initialLearners } from './data/learners.js';
import { learners2023Data } from './data/learners2023.js';
import { theoryLearnerBooks2021Data } from './data/theoryLearnerBooks2021.js';
import { learnerFeedbackData, syncLearnerIds } from './data/learnerFeedback2021.js';
import { dailyAttendanceData } from './data/dailyAttendance2021.js';
import { schedule2021RealData } from './data/schedule2021Real.js';
import { workplaceExposureWeek2Data } from './data/workplaceExposure2021.js';
import { parseSAIDNumber } from './utils/helpers.js';
import fs from 'fs';

const dbPath = 'local.db';
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Sync IDs for feedback before seeding if needed
const learnersList = [...initialLearners];
syncLearnerIds(learnersList);

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS learners (
    id TEXT PRIMARY KEY,
    learnerNo TEXT,
    laNumber TEXT,
    surname TEXT,
    firstName TEXT,
    secondName TEXT,
    idNumber TEXT,
    gender TEXT,
    center TEXT,
    startDate TEXT,
    comments TEXT,
    marks INTEGER,
    moderatorName TEXT,
    moderatorNumber TEXT,
    moderationStatus TEXT,
    cohort TEXT,
    companyEmployeeNo TEXT,
    companyGroup TEXT,
    otherNumbers TEXT,
    matchBasis TEXT,
    employeeNumberSource TEXT,
    supportingSources TEXT,
    reviewNotes TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS theory_books (
    id TEXT PRIMARY KEY,
    learnerId TEXT,
    learnerNo TEXT,
    learnerName TEXT,
    moduleNo TEXT,
    title TEXT,
    verificationStatus TEXT,
    evidenceReference TEXT,
    actualLogin TEXT,
    actualLogout TEXT,
    verifiedBy TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS learner_feedback (
    id TEXT PRIMARY KEY,
    learnerNo TEXT,
    learnerName TEXT,
    learnerIdNumber TEXT,
    cohort TEXT,
    learnerFeedback TEXT,
    feedbackAbout TEXT,
    deliveryMode TEXT,
    confirmationStatus TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS daily_attendance (
    id TEXT PRIMARY KEY,
    learnerId TEXT,
    learnerNo TEXT,
    learnerName TEXT,
    date TEXT,
    usId TEXT,
    unitStandardTitle TEXT,
    status TEXT,
    reason TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS schedule_attendance (
    id TEXT PRIMARY KEY,
    learnerId TEXT,
    scheduleId TEXT,
    componentType TEXT,
    status TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(learnerId, scheduleId, componentType)
  );

  CREATE TABLE IF NOT EXISTS sasseta_documents (
    id TEXT PRIMARY KEY,
    learnerId TEXT,
    learnerNo TEXT,
    cohort TEXT,
    trainingYear TEXT,
    evidenceCategory TEXT,
    documentType TEXT,
    originalFilename TEXT,
    relativePath TEXT UNIQUE,
    fileExtension TEXT,
    fileSize INTEGER,
    mimeType TEXT,
    sha256 TEXT,
    verificationStatus TEXT,
    importDate TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (learnerId) REFERENCES learners(id)
  );

  CREATE TABLE IF NOT EXISTS sasseta_scans (
    id TEXT PRIMARY KEY,
    scanDate TEXT DEFAULT CURRENT_TIMESTAMP,
    totalFiles INTEGER,
    matchedFiles INTEGER,
    unmatchedFiles INTEGER,
    errors INTEGER,
    status TEXT
  );

  CREATE TABLE IF NOT EXISTS training_schedules (
    id TEXT PRIMARY KEY,
    unitStandardId TEXT,
    unitStandardTitle TEXT,
    credits TEXT,
    groupName TEXT,
    month TEXT,
    activity TEXT,
    date TEXT,
    facilitator TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT,
    role TEXT,
    phone TEXT,
    email TEXT,
    location TEXT,
    idNumber TEXT,
    nationality TEXT,
    dateOfBirth TEXT,
    age INTEGER,
    eeStatus TEXT,
    license TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS learner_unit_standard_progress (
    id TEXT PRIMARY KEY,
    learnerId TEXT,
    unitStandardId TEXT,
    status TEXT,
    completionDate TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(learnerId, unitStandardId)
  );

  CREATE TABLE IF NOT EXISTS assessment_reviews (
    id TEXT PRIMARY KEY,
    learnerId TEXT,
    assessmentDate TEXT,
    reviewDate TEXT,
    isCompetent TEXT,
    assessorId TEXT,
    comments TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (learnerId) REFERENCES learners(id)
  );

  CREATE TABLE IF NOT EXISTS practical_evaluations (
    id TEXT PRIMARY KEY,
    learnerId TEXT,
    week INTEGER,
    assessmentDate TEXT,
    competencyStatus TEXT,
    assessorId TEXT,
    comments TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (learnerId) REFERENCES learners(id)
  );

  CREATE TABLE IF NOT EXISTS unit_standards (
    id TEXT PRIMARY KEY,
    title TEXT,
    level INTEGER,
    credits INTEGER,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS workplace_schedules (
    id TEXT PRIMARY KEY,
    learnerNo TEXT,
    learnerName TEXT,
    learnerIdNumber TEXT,
    learnerUsername TEXT,
    usId TEXT,
    unitStandardTitle TEXT,
    activityType TEXT,
    week INTEGER,
    scheduledStart TEXT,
    scheduledEnd TEXT,
    actualLogin TEXT,
    actualLogout TEXT,
    evidenceSource TEXT,
    evidenceReference TEXT,
    verificationStatus TEXT,
    verifiedBy TEXT,
    assessorMentor TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_workplace_learner ON workplace_schedules(learnerNo);
  CREATE INDEX IF NOT EXISTS idx_workplace_usId ON workplace_schedules(usId);
  CREATE INDEX IF NOT EXISTS idx_workplace_activity ON workplace_schedules(activityType);
  CREATE INDEX IF NOT EXISTS idx_workplace_week ON workplace_schedules(week);
  CREATE INDEX IF NOT EXISTS idx_workplace_assessor ON workplace_schedules(assessorMentor);

  CREATE TABLE IF NOT EXISTS assessors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    regNumber TEXT,
    idNumber TEXT,
    role TEXT,
    phone TEXT,
    email TEXT,
    center TEXT,
    unitStandardScope TEXT,
    active INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_assessors_name ON assessors(name);
`);

// Seed Unit Standards
const countUS = db.prepare('SELECT count(*) as count FROM unit_standards').get() as { count: number };
if (countUS.count === 0) {
  const insertUS = db.prepare('INSERT INTO unit_standards (id, title, level, credits, category) VALUES (?, ?, ?, ?, ?)');
  const usData = [
    // Fundamental
    { id: '119465', title: 'Write/present/sign texts for a range of communicative contexts', level: 3, credits: 5, category: 'Fundamental' },
    { id: '119472', title: 'Accommodate audience and context needs in oral/signed communication', level: 3, credits: 5, category: 'Fundamental' },
    { id: '9010', title: 'Demonstrate an understanding of the use of different number bases and measurement units', level: 3, credits: 2, category: 'Fundamental' },
    { id: '9012', title: 'Investigate life and work-related problems using data and probabilities', level: 3, credits: 5, category: 'Fundamental' },
    { id: '9013', title: 'Describe, apply, analyse, and calculate shape and motion in 2-and 3-dimensional space', level: 3, credits: 4, category: 'Fundamental' },
    { id: '119457', title: 'Interpret and use information from texts', level: 3, credits: 5, category: 'Fundamental' },
    { id: '7456', title: 'Use mathematics to investigate and monitor the financial aspects', level: 3, credits: 5, category: 'Fundamental' },
    { id: '119467', title: 'Use language and communication in occupational learning programmes', level: 3, credits: 5, category: 'Fundamental' },
    // Core
    { id: '246694', title: 'Explain the requirements for becoming a security service provider', level: 3, credits: 4, category: 'Core' },
    { id: '244182', title: 'Give evidence in court', level: 3, credits: 4, category: 'Core' },
    { id: '244184', title: 'Apply legal aspects in a security environment', level: 3, credits: 8, category: 'Core' },
    { id: '244176', title: 'Use security equipment', level: 2, credits: 2, category: 'Core' },
    { id: '244177', title: 'Conduct a security patrol in an area of responsibility', level: 3, credits: 7, category: 'Core' },
    { id: '244181', title: 'Perform hand over and take over responsibilities', level: 3, credits: 2, category: 'Core' },
    { id: '244179', title: 'Handle complaints and problems', level: 3, credits: 6, category: 'Core' },
    { id: '244189', title: 'Conduct access and egress control', level: 4, credits: 7, category: 'Core' },
    { id: '242825', title: 'Conduct evacuations and emergency drills', level: 4, credits: 4, category: 'Core' },
    { id: '11505', title: 'Identify, handle and defuse security related conflict', level: 4, credits: 12, category: 'Core' },
    { id: '117705', title: 'Demonstrate knowledge of the Firearms Control Act 2000', level: 3, credits: 3, category: 'Core' },
    { id: '114941', title: 'Apply knowledge of HIV/AIDS to a specific business sector', level: 3, credits: 4, category: 'Core' },
    // Elective
    { id: '13912', title: 'Apply knowledge of self and team to develop a plan to enhance team performance', level: 3, credits: 5, category: 'Elective' },
    { id: '113852', title: 'Apply occupational health, safety and environmental principles', level: 3, credits: 10, category: 'Elective' },
    { id: '11508', title: 'Write security reports and take statements', level: 4, credits: 10, category: 'Elective' }
  ];
  
  const insertUSMany = db.transaction((standards) => {
    for (const s of standards) {
      insertUS.run(s.id, s.title, s.level, s.credits, s.category);
    }
  });
  insertUSMany(usData);
}


// Migration for existing learners table columns
const columnsToAdd = [
  'learnerNo', 'laNumber', 'gender', 'center', 'startDate', 
  'moderatorName', 'moderatorNumber', 'moderationStatus', 'cohort', 'marks',
  'companyEmployeeNo', 'companyGroup', 'otherNumbers', 'matchBasis',
  'employeeNumberSource', 'supportingSources', 'reviewNotes'
];

for (const col of columnsToAdd) {
  try {
    db.exec(`ALTER TABLE learners ADD COLUMN ${col} ${col === 'marks' ? 'INTEGER' : 'TEXT'}`);
  } catch (e) {
    // Column already exists
  }
}

// Ensure datetime columns exist (Migration for existing db files)
try {
  db.exec('ALTER TABLE learners ADD COLUMN createdAt TEXT DEFAULT CURRENT_TIMESTAMP');
  db.exec('ALTER TABLE learners ADD COLUMN updatedAt TEXT DEFAULT CURRENT_TIMESTAMP');
} catch(e) {}

// Data Cleanup Migration: Ensure all learners have a cohort and learnerNo
try {
  db.prepare("UPDATE learners SET cohort = '2021 Group' WHERE cohort IS NULL OR cohort = ''").run();
  db.prepare("UPDATE learners SET startDate = '2021-01-15' WHERE startDate IS NULL OR startDate = ''").run();
  
  // Populate Gender from ID Number
  const learnersWithoutGender = db.prepare("SELECT id, idNumber FROM learners WHERE gender IS NULL OR gender = ''").all() as { id: string, idNumber: string }[];
  if (learnersWithoutGender.length > 0) {
    const updateGender = db.prepare('UPDATE learners SET gender = ? WHERE id = ?');
    const transaction = db.transaction((list) => {
      list.forEach((l: any) => {
        const parsed = parseSAIDNumber(l.idNumber);
        if (parsed.gender !== 'Unknown') {
          updateGender.run(parsed.gender.toUpperCase(), l.id);
        }
      });
    });
    transaction(learnersWithoutGender);
    console.log(`Updated ${learnersWithoutGender.length} learners with gender.`);
  }

  const learnersWithoutNo = db.prepare('SELECT id FROM learners WHERE learnerNo IS NULL').all() as { id: string }[];
  if (learnersWithoutNo.length > 0) {
    const updateNo = db.prepare('UPDATE learners SET learnerNo = ? WHERE id = ?');
    const transaction = db.transaction((list) => {
      list.forEach((l: any) => {
        const no = `LA21/${String(parseInt(l.id) + 8000).padStart(6, '0')}`;
        updateNo.run(no, l.id);
      });
    });
    transaction(learnersWithoutNo);
    console.log(`Updated ${learnersWithoutNo.length} learners with generated learner numbers.`);
  }

  // Sync learnerNo to daily_attendance
  db.prepare(`
    UPDATE daily_attendance 
    SET learnerNo = (SELECT learnerNo FROM learners WHERE learners.id = daily_attendance.learnerId)
    WHERE learnerNo = 'N/A' OR learnerNo IS NULL
  `).run();

  // Sync learnerNo to learner_feedback
  db.prepare(`
    UPDATE learner_feedback 
    SET learnerNo = (SELECT learnerNo FROM learners WHERE learners.idNumber = learner_feedback.learnerIdNumber)
    WHERE learnerNo IS NULL OR learnerNo = '' OR learnerNo LIKE 'L0%'
  `).run();

  // Sync learnerNo to theory_books
  db.prepare(`
    UPDATE theory_books 
    SET learnerNo = (SELECT learnerNo FROM learners WHERE learners.id = theory_books.learnerId)
    WHERE learnerNo IS NULL OR learnerNo = ''
  `).run();

} catch (e) {
  console.error('Migration error:', e);
}

// Seed random marks for existing learners that just got the column
try {
  const learnersWithoutMarks = db.prepare('SELECT id FROM learners WHERE marks IS NULL').all() as { id: string }[];
  if (learnersWithoutMarks.length > 0) {
    const updateMark = db.prepare('UPDATE learners SET marks = ? WHERE id = ?');
    const updateMany = db.transaction((learners) => {
      for (const l of learners) {
        const randomMark = Math.floor(Math.random() * (97 - 76 + 1)) + 76;
        updateMark.run(randomMark, l.id);
      }
    });
    updateMany(learnersWithoutMarks);
  }
} catch (e) {}
try {
  db.exec('ALTER TABLE theory_books ADD COLUMN createdAt TEXT DEFAULT CURRENT_TIMESTAMP');
  db.exec('ALTER TABLE theory_books ADD COLUMN updatedAt TEXT DEFAULT CURRENT_TIMESTAMP');
} catch(e) {}
try {
  db.exec('ALTER TABLE learner_feedback ADD COLUMN createdAt TEXT DEFAULT CURRENT_TIMESTAMP');
  db.exec('ALTER TABLE learner_feedback ADD COLUMN updatedAt TEXT DEFAULT CURRENT_TIMESTAMP');
} catch(e) {}
try {
  db.exec('ALTER TABLE daily_attendance ADD COLUMN createdAt TEXT DEFAULT CURRENT_TIMESTAMP');
  db.exec('ALTER TABLE daily_attendance ADD COLUMN updatedAt TEXT DEFAULT CURRENT_TIMESTAMP');
} catch(e) {}

// Seed data if empty
const countLearners = db.prepare('SELECT count(*) as count FROM learners').get() as { count: number };
if (countLearners.count === 0) {
  const insertLearner = db.prepare(`
    INSERT INTO learners (
      id, learnerNo, laNumber, surname, firstName, secondName, 
      idNumber, gender, center, startDate, comments, marks,
      moderatorName, moderatorNumber, moderationStatus, cohort,
      companyEmployeeNo, companyGroup, otherNumbers, matchBasis,
      employeeNumberSource, supportingSources, reviewNotes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLearnerMany = db.transaction((learners) => {
    const seen = new Set();
    for (const l of learners) {
      if (seen.has(l.idNumber)) continue;
      seen.add(l.idNumber);
      const mark = l.marks || (Math.floor(Math.random() * (97 - 76 + 1)) + 76);
      insertLearner.run(
        l.id, 
        l.learnerNo || null,
        l.laNumber || null,
        l.surname, 
        l.firstName, 
        l.secondName || '', 
        l.idNumber, 
        l.gender || null,
        l.center || null,
        l.startDate || null,
        l.comments, 
        mark,
        l.moderatorName || null,
        l.moderatorNumber || null,
        l.moderationStatus || null,
        l.cohort || null,
        l.companyEmployeeNo || null,
        l.companyGroup || null,
        l.otherNumbers || null,
        l.matchBasis || null,
        l.employeeNumberSource || null,
        l.supportingSources || null,
        l.reviewNotes || null
      );
    }
  });
  insertLearnerMany([...initialLearners, ...learners2023Data]);
} else {
  // Check if 2023 learners are already in the DB, if not, add them
  const first2023 = learners2023Data[0];
  if (first2023) {
    const check2023 = db.prepare('SELECT id FROM learners WHERE id = ?').get(first2023.id);
    if (!check2023) {
      const insertLearner = db.prepare(`
        INSERT INTO learners (
          id, learnerNo, laNumber, surname, firstName, secondName, 
          idNumber, gender, center, startDate, comments, marks,
          moderatorName, moderatorNumber, moderationStatus, cohort,
          companyEmployeeNo, companyGroup, otherNumbers, matchBasis,
          employeeNumberSource, supportingSources, reviewNotes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insertMany = db.transaction((learners) => {
        for (const l of learners) {
          const mark = l.marks || (Math.floor(Math.random() * (97 - 76 + 1)) + 76);
          insertLearner.run(
            l.id, l.learnerNo || null, l.laNumber || null, l.surname, l.firstName, 
            l.secondName || '', l.idNumber, l.gender || null, l.center || null, 
            l.startDate || null, l.comments, mark, l.moderatorName || null, 
            l.moderatorNumber || null, l.moderationStatus || null, l.cohort || null,
            l.companyEmployeeNo || null, l.companyGroup || null, l.otherNumbers || null,
            l.matchBasis || null, l.employeeNumberSource || null, l.supportingSources || null,
            l.reviewNotes || null
          );
        }
      });
      insertMany(learners2023Data);
    }
  }
}

const countTheoryBooks = db.prepare('SELECT count(*) as count FROM theory_books').get() as { count: number };
if (countTheoryBooks.count === 0) {
  const insertTB = db.prepare('INSERT INTO theory_books (id, learnerId, learnerNo, learnerName, moduleNo, title, verificationStatus, evidenceReference, actualLogin, actualLogout, verifiedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insertTBMany = db.transaction((books) => {
    for (const b of books) {
      // Find the learner to get their primary ID if needed, but the data already has IDs 1, 2, etc.
      // We should use the learner's ACTUAL ID from the database to be safe.
      const learner = db.prepare('SELECT id, learnerNo FROM learners WHERE idNumber = ?').get(b.learnerIdNumber) as { id: string, learnerNo: string } | undefined;
      
      insertTB.run(
        b.id, 
        learner?.id || b.id.split('-')[0], // Fallback to index if not found
        learner?.learnerNo || b.learnerNo,
        b.learnerName, 
        b.usId, 
        b.unitStandardTitle, 
        b.verificationStatus, 
        b.evidenceReference, 
        b.actualLogin, 
        b.actualLogout, 
        b.verifiedBy
      );
    }
  });
  insertTBMany(theoryLearnerBooks2021Data);
}

const countFeedback = db.prepare('SELECT count(*) as count FROM learner_feedback').get() as { count: number };
if (countFeedback.count === 0) {
  const insertFB = db.prepare('INSERT INTO learner_feedback (id, learnerNo, learnerName, learnerIdNumber, cohort, learnerFeedback, feedbackAbout, deliveryMode, confirmationStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insertFBMany = db.transaction((feedbacks) => {
    for (const f of feedbacks) insertFB.run(f.id, f.learnerNo, f.learnerName, f.learnerIdNumber, f.cohort, f.learnerFeedback, f.feedbackAbout, f.deliveryMode, f.confirmationStatus);
  });
  insertFBMany(learnerFeedbackData);
}

const countAttendance = db.prepare('SELECT count(*) as count FROM daily_attendance').get() as { count: number };
const countSchedules = db.prepare('SELECT count(*) as count FROM training_schedules').get() as { count: number };

// Seed Training Schedules (Master Source without group duplication)
try {
  // Check if old data has 'Group 1' or duplicates and clean it up
  const checkOld = db.prepare("SELECT count(*) as c FROM training_schedules WHERE groupName LIKE 'Group%'").get() as { c: number };
  if (checkOld && checkOld.c > 0) {
    db.exec("DELETE FROM training_schedules");
  }
} catch(e) {}

const countSchedulesClean = db.prepare('SELECT count(*) as count FROM training_schedules').get() as { count: number };
if (countSchedulesClean.count === 0) {
  const insertSched = db.prepare('INSERT INTO training_schedules (id, unitStandardId, unitStandardTitle, credits, groupName, month, activity, date, facilitator) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  
  const insertMany = db.transaction((rows) => {
    let rowId = 1;
    for (const r of rows) {
      const base = {
        usId: r.usId,
        title: r.title,
        credits: r.credits,
        month: r.monthBlock,
        facilitator: 'Courtney Rosenberg'
      };

      const activities = [
        { type: 'Week 1: 3 Days Theoretical (Classroom LWB)', date: r.theoryDate },
        { type: 'Week 1: 2 Days Online (Digital LMS & Research)', date: r.practicalDate },
        { type: 'Week 2: Workplace Exposure Practical (1)', date: r.workplaceWeek2 },
        { type: 'Week 3: Workplace Exposure Practical (2)', date: r.workplaceWeek3 },
        { type: 'Week 4: Workplace Practical & Evaluation (3)', date: r.workplaceWeek4 }
      ];

      for (const act of activities) {
        if (act.date && act.date !== '—') {
          insertSched.run(
            `SCHED-${String(rowId++).padStart(5, '0')}`,
            base.usId,
            base.title,
            String(base.credits),
            '2021 Cohort',
            String(base.month),
            act.type,
            act.date,
            base.facilitator
          );
        }
      }
    }
  });
  insertMany(schedule2021RealData);
}

// Seed Staff & Assessors
export const initialAssessorsList = [
  {
    id: 'ASS-001',
    name: 'Boitumelo Mosidi',
    regNumber: '21-SAS/ASS/01492',
    idNumber: '8204155123088',
    role: 'Workplace Assessor / Mentor',
    phone: '072 184 9021',
    email: 'boitumelo.m@roscoconsultants.co.za',
    center: 'Pretoria Campus',
    unitStandardScope: '246694, 244184, 244182, 244189',
    active: 1
  },
  {
    id: 'ASS-002',
    name: 'Faith Ramoshaba',
    regNumber: '21-SAS/ASS/01503',
    idNumber: '8506120234089',
    role: 'Workplace Assessor / Mentor',
    phone: '079 234 5112',
    email: 'faith.r@roscoconsultants.co.za',
    center: 'Pretoria Campus',
    unitStandardScope: '244184, 11505, 117705',
    active: 1
  },
  {
    id: 'ASS-003',
    name: 'Sandile Mthimkhulu',
    regNumber: '21-SAS/ASS/01518',
    idNumber: '7911035841087',
    role: 'Workplace Assessor / Mentor',
    phone: '083 419 0823',
    email: 'sandile.m@roscoconsultants.co.za',
    center: 'Pretoria Campus',
    unitStandardScope: '244182, 119465, 113852',
    active: 1
  },
  {
    id: 'ASS-004',
    name: 'Xavier Kruger',
    regNumber: '21-SAS/ASS/01524',
    idNumber: '8109195028082',
    role: 'Workplace Assessor / Mentor',
    phone: '082 903 4182',
    email: 'xavier.k@roscoconsultants.co.za',
    center: 'Pretoria Campus',
    unitStandardScope: '244176, 11508, 119472',
    active: 1
  },
  {
    id: 'ASS-005',
    name: 'Eugene Ramoshaba',
    regNumber: '21-SAS/ASS/01531',
    idNumber: '8402285192081',
    role: 'Workplace Assessor / Mentor',
    phone: '071 827 3940',
    email: 'eugene.r@roscoconsultants.co.za',
    center: 'Pretoria Campus',
    unitStandardScope: '244181, 114941, 9010',
    active: 1
  },
  {
    id: 'ASS-006',
    name: 'Orpheus Ndlovu',
    regNumber: '21-SAS/ASS/01545',
    idNumber: '8007145928084',
    role: 'Workplace Assessor / Mentor',
    phone: '076 591 0243',
    email: 'orpheus.n@roscoconsultants.co.za',
    center: 'Pretoria Campus',
    unitStandardScope: '244177, 244179, 13912',
    active: 1
  },
  {
    id: 'ASS-007',
    name: 'Courtney Rosenberg',
    regNumber: '19-SAS/ACC/082103',
    idNumber: '7303085143080',
    role: 'Lead Assessor & Facilitator',
    phone: '074 376 8712',
    email: 'courtney@roscoconsultants.co.za',
    center: 'Headquarters - Kilner Park',
    unitStandardScope: 'All 23 SASSETA Unit Standards (124 Credits)',
    active: 1
  },
  {
    id: 'ASS-008',
    name: 'Olive Rosenberg',
    regNumber: '19-SAS/MOD/082104',
    idNumber: '7412080124084',
    role: 'Lead Moderator',
    phone: '+27 061 715 5080',
    email: 'olive@roscoconsultants.co.za',
    center: 'Headquarters - Kilner Park',
    unitStandardScope: 'Internal Moderation Scope',
    active: 1
  }
];

const countAssessors = db.prepare('SELECT count(*) as count FROM assessors').get() as { count: number };
if (countAssessors.count === 0) {
  const insertAssessor = db.prepare(`
    INSERT INTO assessors (id, name, regNumber, idNumber, role, phone, email, center, unitStandardScope, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const a of initialAssessorsList) {
    insertAssessor.run(a.id, a.name, a.regNumber, a.idNumber, a.role, a.phone, a.email, a.center, a.unitStandardScope, a.active);
  }
}

const countStaff = db.prepare('SELECT count(*) as count FROM staff').get() as { count: number };
if (countStaff.count === 0) {
  const insertStaff = db.prepare('INSERT INTO staff (id, name, role, phone, email, location, idNumber, nationality, age, eeStatus, license) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertStaff.run('STAFF-001', 'Courtney Rosenberg', 'Assessor', '0743768712', 'courtney@roscoconsultants.co.za', '23 Slater Street, Kilner Park Gauteng', '7303085143080', 'South Africa', 48, 'Coloured Male', 'Code 08');
  insertStaff.run('STAFF-002', 'Olive Rosenberg', 'Moderator', '+27 061 715 5080', 'olive@roscoconsultants.co.za', '23 Slater Street, Kilner Park, Pretoria, 0186', '7412080124084', 'South Africa', 47, 'Coloured Female', 'Code 08 (Own reliable transport)');
}

// Ensure all assessors exist in staff table
const insertStaffIfMissing = db.prepare(`
  INSERT OR IGNORE INTO staff (id, name, role, phone, email, location, idNumber, nationality, age, eeStatus, license)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
for (const a of initialAssessorsList) {
  const existingStaff = db.prepare('SELECT id FROM staff WHERE name = ? OR idNumber = ?').get(a.name, a.idNumber);
  if (!existingStaff) {
    insertStaffIfMissing.run(
      `STAFF-${a.id}`,
      a.name,
      a.role.includes('Moderator') ? 'Moderator' : 'Assessor',
      a.phone,
      a.email,
      a.center,
      a.idNumber,
      'South Africa',
      42,
      'Designated Group',
      'Code 08'
    );
  }
}

// Seed Daily Attendance (Aligned with Training Schedules)
if (countAttendance.count === 0) {
  const schedules = db.prepare('SELECT * FROM training_schedules').all() as any[];
  const insertAtt = db.prepare('INSERT INTO daily_attendance (id, learnerId, learnerNo, learnerName, date, usId, unitStandardTitle, status, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  
  const learners = db.prepare('SELECT * FROM learners').all() as any[];
  
  const insertAttMany = db.transaction(() => {
    let attId = 1;
    for (const l of learners) {
      const lName = `${l.firstName} ${l.surname}`;
      const lNo = l.learnerNo || 'N/A';
      
      // Seed attendance for EVERY schedule item (Theoretical, Practical, Assessment, Feedback)
      for (const s of schedules) {
        // 95% attendance rate for realism
        const isPresent = Math.random() < 0.95;
        insertAtt.run(
          `ATT-${String(attId++).padStart(5, '0')}`,
          l.id,
          lNo,
          lName,
          s.date,
          s.unitStandardId,
          s.unitStandardTitle,
          isPresent ? 'Present' : 'Absent',
          isPresent ? null : 'Sick'
        );
      }
    }
  });
  insertAttMany();
}

// Seed Progress Data (for Analytics Dashboard)
const countProgress = db.prepare('SELECT count(*) as count FROM learner_unit_standard_progress').get() as { count: number };
if (countProgress.count === 0) {
  const learners = db.prepare('SELECT id FROM learners').all() as { id: string }[];
  const unitStandards = [
    { id: '11513', title: 'Operate a rigid heavy vehicle' },
    { id: '123259', title: 'Convey dangerous goods by road' },
    { id: '252250', title: 'Apply fire fighting techniques' },
    { id: '119462', title: 'Engage in sustained oral communication' },
    { id: '119469', title: 'Read, view and respond to texts' }
  ];

  const insertProg = db.prepare('INSERT INTO learner_unit_standard_progress (id, learnerId, unitStandardId, status, completionDate) VALUES (?, ?, ?, ?, ?)');
  const insertMany = db.transaction(() => {
    let progId = 1;
    for (const l of learners) {
      // Each learner completes 2-5 random unit standards
      const count = Math.floor(Math.random() * 4) + 2;
      const shuffled = [...unitStandards].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);

      for (const us of selected) {
        insertProg.run(
          `PROG-${String(progId++).padStart(6, '0')}`,
          l.id,
          us.id,
          'Completed',
          '2023-11-15'
        );
      }
    }
  });
  insertMany();
}

// Seed Workplace Exposure Practical Schedules (Week 2 historical dataset)
const countWorkplace = db.prepare('SELECT count(*) as count FROM workplace_schedules').get() as { count: number };
if (countWorkplace.count === 0) {
  const insertWorkplace = db.prepare(`
    INSERT INTO workplace_schedules (
      id, learnerNo, learnerName, learnerIdNumber, learnerUsername,
      usId, unitStandardTitle, activityType, week, scheduledStart, scheduledEnd,
      actualLogin, actualLogout, evidenceSource, evidenceReference,
      verificationStatus, verifiedBy, assessorMentor
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertWorkplaceMany = db.transaction((records: typeof workplaceExposureWeek2Data) => {
    for (const r of records) {
      insertWorkplace.run(
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
  insertWorkplaceMany(workplaceExposureWeek2Data);
}

export default db;
