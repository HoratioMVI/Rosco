const Database = require('better-sqlite3');
const db = new Database('local.db');

try {
  db.prepare('ALTER TABLE learners ADD COLUMN cohort TEXT').run();
} catch (e) {
  console.log('cohort column might already exist');
}

// Update all learners with image data
const result = db.prepare("UPDATE learners SET comments = 'Certified', moderationStatus = 'Certified', moderatorName = 'Clive Rosenberg', moderatorNumber = '19MTR1011776', cohort = '2021 Group'").run();

console.log(`Updated ${result.changes} learners with full moderation data and cohort: 2021 Group`);
