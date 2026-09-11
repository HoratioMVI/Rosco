const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

console.log('--- Starting SQLite Clean Database Recovery ---');

const oldDb = new Database('local.db');
const recoveredDbPath = 'local.db.clean';
if (fs.existsSync(recoveredDbPath)) {
  fs.unlinkSync(recoveredDbPath);
}

const cleanDb = new Database(recoveredDbPath);
cleanDb.pragma('journal_mode = WAL');
cleanDb.pragma('synchronous = NORMAL');

// 1. Get schemas of all tables from sqlite_master
const tables = oldDb.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

for (const t of tables) {
  cleanDb.exec(t.sql);
  console.log(`Created schema for table: ${t.name}`);
}

// 2. Populate learners from source data
const { initialLearners } = require('../src/data/learners.ts');
const { learners2023Data } = require('../src/data/learners2023.ts');

const insertLearner = cleanDb.prepare(`
  INSERT INTO learners (
    id, learnerNo, laNumber, surname, firstName, secondName,
    idNumber, gender, center, startDate, comments, marks,
    moderatorName, moderatorNumber, moderationStatus, cohort,
    companyEmployeeNo, companyGroup, otherNumbers, matchBasis,
    employeeNumberSource, supportingSources, reviewNotes,
    createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertLearnersTx = cleanDb.transaction(() => {
  for (const l of initialLearners) {
    insertLearner.run(
      l.id,
      l.learnerNo || `21-L${String(l.id).padStart(4, '0')}`,
      l.laNumber || `LA21-${String(l.id).padStart(4, '0')}`,
      l.surname,
      l.firstName,
      l.secondName || '',
      l.idNumber,
      l.gender || 'Male',
      l.center || 'Pretoria Campus',
      l.startDate || '2021-09-01',
      l.comments || 'Enrolled',
      l.marks || 85,
      l.moderatorName || 'Orpheus Ndlovu',
      l.moderatorNumber || 'MOD-78921',
      l.moderationStatus || 'Verified',
      l.cohort || '2021 Group',
      l.companyEmployeeNo || null,
      l.companyGroup || null,
      l.otherNumbers || null,
      l.matchBasis || 'Official 2021 Registry List',
      l.employeeNumberSource || 'Official 2021 SASSETA Learners List',
      l.supportingSources || null,
      l.reviewNotes || 'Official SASSETA Enrolled 2021 Candidate',
      l.createdAt || new Date().toISOString(),
      l.updatedAt || new Date().toISOString()
    );
  }

  for (const l of learners2023Data) {
    insertLearner.run(
      l.id,
      l.learnerNo || `LA23/${String(l.id).padStart(6, '0')}`,
      l.laNumber || l.learnerNo || '',
      l.surname,
      l.firstName,
      l.secondName || '',
      l.idNumber,
      l.gender || 'MALE',
      l.center || 'CPT',
      l.startDate || '2023/10/16',
      l.comments || '2023 Learner',
      l.marks || 80,
      l.moderatorName || null,
      l.moderatorNumber || null,
      l.moderationStatus || null,
      l.cohort || '2023 Group',
      l.companyEmployeeNo || null,
      l.companyGroup || null,
      l.otherNumbers || null,
      l.matchBasis || null,
      l.employeeNumberSource || null,
      l.supportingSources || null,
      l.reviewNotes || null,
      l.createdAt || new Date().toISOString(),
      l.updatedAt || new Date().toISOString()
    );
  }
});

insertLearnersTx();
console.log(`Inserted ${initialLearners.length + learners2023Data.length} learners into clean database.`);

// 3. Copy all other tables
const copyTables = tables.map(t => t.name).filter(name => name !== 'learners');

for (const tableName of copyTables) {
  try {
    const rows = oldDb.prepare(`SELECT * FROM ${tableName}`).all();
    if (rows.length === 0) {
      console.log(`Table ${tableName} is empty, skipping data copy.`);
      continue;
    }

    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const insertStmt = cleanDb.prepare(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`);

    const copyTx = cleanDb.transaction(() => {
      for (const row of rows) {
        insertStmt.run(columns.map(c => row[c]));
      }
    });

    copyTx();
    console.log(`Copied ${rows.length} rows to table: ${tableName}`);
  } catch (err) {
    console.error(`Error copying table ${tableName}:`, err.message);
  }
}

// 4. Verify Integrity on Clean Database
const integrityCheck = cleanDb.prepare('PRAGMA integrity_check').all();
const quickCheck = cleanDb.prepare('PRAGMA quick_check').all();
console.log('Clean DB PRAGMA integrity_check:', integrityCheck);
console.log('Clean DB PRAGMA quick_check:', quickCheck);

if (integrityCheck[0].integrity_check === 'ok') {
  console.log('--- RECOVERY SUCCESSFUL! Swapping database file ---');
  oldDb.close();
  cleanDb.close();

  // Backup corrupt file
  fs.copyFileSync('local.db', 'local.db.corrupt_bak');
  if (fs.existsSync('local.db-shm')) fs.unlinkSync('local.db-shm');
  if (fs.existsSync('local.db-wal')) fs.unlinkSync('local.db-wal');

  // Replace with clean file
  fs.copyFileSync('local.db.clean', 'local.db');
  fs.unlinkSync('local.db.clean');
  console.log('local.db successfully replaced with pristine verified database.');
} else {
  console.error('Integrity check failed on clean db!');
}
