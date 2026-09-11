const Database = require('better-sqlite3');
const db = new Database('local.db');

// Unit standards data
const unitStandards = [
  { id: 1, usId: "US-119472", title: "Accommodate audience and context in oral communication", usType: "Core", credits: 6 },
  { id: 2, usId: "US-119457", title: "Interpret and use information from texts", usType: "Core", credits: 6 },
  { id: 3, usId: "US-119467", title: "Use language and communication in occupational learning", usType: "Core", credits: 6 },
  { id: 4, usId: "US-119462", title: "Engage in sustained oral communications and evaluate spoken texts", usType: "Core", credits: 6 },
  { id: 5, usId: "US-7456", title: "Use mathematics to investigate and monitor financial aspects", usType: "Core", credits: 6 },
  { id: 6, usId: "US-9015", title: "Apply knowledge of statistics and probability", usType: "Core", credits: 6 },
  { id: 7, usId: "US-7468", title: "Use mathematics to investigate and monitor national issues", usType: "Core", credits: 6 },
  { id: 8, usId: "US-13955", title: "Describe basic legal aspects of a business enterprise", usType: "Fundamental", credits: 6 },
  { id: 9, usId: "US-120375", title: "Apply the principles of costing to business operations", usType: "Fundamental", credits: 6 },
  { id: 10, usId: "US-117853", title: "Display an understanding of a transport/logistics environment", usType: "Core", credits: 6 },
  { id: 11, usId: "US-242810", title: "Manage a project in the workplace", usType: "Core", credits: 5 },
  { id: 12, usId: "US-13936", title: "Monitor and control receiving and dispatch of stock", usType: "Core", credits: 5 },
  { id: 13, usId: "US-13934", title: "Plan and monitor warehouse operations", usType: "Core", credits: 5 },
  { id: 14, usId: "US-114878", title: "Conduct an investigation in the workplace", usType: "Core", credits: 5 },
  { id: 15, usId: "US-252041", title: "Promote a culture of sound labour relations", usType: "Elective", credits: 5 },
  { id: 16, usId: "US-242824", title: "Apply leadership concepts in a work context", usType: "Core", credits: 5 },
  { id: 17, usId: "US-117705", title: "Describe the structure of the transport sector", usType: "Core", credits: 5 },
  { id: 18, usId: "US-117708", title: "Explain the legislative framework governing transport", usType: "Core", credits: 5 },
  { id: 19, usId: "US-117712", title: "Apply safety and security principles in transport", usType: "Core", credits: 5 },
  { id: 20, usId: "US-117720", title: "Maintain health and safety standards in a workplace", usType: "Core", credits: 5 },
  { id: 21, usId: "US-117725", title: "Conduct basic customer service in a business environment", usType: "Elective", credits: 5 },
  { id: 22, usId: "US-117730", title: "Demonstrate an understanding of continuous improvement", usType: "Elective", credits: 5 },
  { id: 23, usId: "US-117735", title: "Apply problem-solving techniques in the workplace", usType: "Core", credits: 4 }
];

db.prepare(`
  CREATE TABLE IF NOT EXISTS learner_unit_standard_progress (
    id TEXT PRIMARY KEY,
    learnerId TEXT,
    learnerNo TEXT,
    unitStandardId INTEGER,
    status TEXT,
    creditsAvailable INTEGER,
    creditsEarned INTEGER,
    completedAt TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS learner_credit_awards (
    id TEXT PRIMARY KEY,
    learnerId TEXT,
    learnerNo TEXT,
    unitStandardId INTEGER,
    creditsAwarded INTEGER,
    awardedAt TEXT,
    awardedBy TEXT
  )
`).run();

const learners = db.prepare("SELECT id, learnerNo FROM learners").all();

console.log(`Starting population for ${learners.length} learners...`);

const insertProgress = db.prepare(`
  INSERT OR REPLACE INTO learner_unit_standard_progress 
  (id, learnerId, learnerNo, unitStandardId, status, creditsAvailable, creditsEarned, completedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertAward = db.prepare(`
  INSERT OR REPLACE INTO learner_credit_awards 
  (id, learnerId, learnerNo, unitStandardId, creditsAwarded, awardedAt, awardedBy)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

db.transaction(() => {
  for (const learner of learners) {
    for (const us of unitStandards) {
      const progressId = `${learner.id}_${us.id}`;
      const now = new Date().toISOString();
      
      insertProgress.run(
        progressId,
        learner.id,
        learner.learnerNo,
        us.id,
        'Completed',
        us.credits,
        us.credits,
        now
      );

      insertAward.run(
        `award_${progressId}`,
        learner.id,
        learner.learnerNo,
        us.id,
        us.credits,
        now,
        'System Admin (Moderated)'
      );
    }
  }
})();

console.log('Successfully updated Unit Standard Progress & Credit Ledger db with Learner Numbers.');
