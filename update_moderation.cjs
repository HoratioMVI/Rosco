const Database = require('better-sqlite3');
const db = new Database('local.db');

try {
  db.prepare('ALTER TABLE learners ADD COLUMN moderatorName TEXT').run();
} catch (e) {
  console.log('moderatorName column might already exist');
}
try {
  db.prepare('ALTER TABLE learners ADD COLUMN moderatorNumber TEXT').run();
} catch (e) {
  console.log('moderatorNumber column might already exist');
}
try {
  db.prepare('ALTER TABLE learners ADD COLUMN moderationStatus TEXT').run();
} catch (e) {
  console.log('moderationStatus column might already exist');
}

// Update status to 'Certified' for all learners as per user request
const result = db.prepare("UPDATE learners SET comments = 'Certified', moderationStatus = 'Certified', moderatorName = 'Clive Rosenberg', moderatorNumber = '19MTR1011776'").run();

console.log(`Updated ${result.changes} learners with moderation status: Certified`);
