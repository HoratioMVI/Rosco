const Database = require('better-sqlite3');
const db = new Database('local.db');

// Add new columns to daily_attendance if they don't exist
try {
  db.prepare('ALTER TABLE daily_attendance ADD COLUMN loginTime TEXT').run();
  db.prepare('ALTER TABLE daily_attendance ADD COLUMN logoutTime TEXT').run();
  db.prepare('ALTER TABLE daily_attendance ADD COLUMN activityLog TEXT').run();
} catch (e) {
  // Columns likely already exist
  console.log("Columns might already exist: ", e.message);
}

const records = db.prepare('SELECT id, date FROM daily_attendance').all();

function getRandomMinute(min, max) {
  const m = Math.floor(Math.random() * (max - min + 1)) + min;
  return m < 10 ? '0' + m : m.toString();
}

const updateStmt = db.prepare('UPDATE daily_attendance SET loginTime = ?, logoutTime = ?, activityLog = ? WHERE id = ?');

db.transaction(() => {
  for (const rec of records) {
    const d = new Date(rec.date);
    const day = d.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    
    // Play with times: login ~ 07:50-08:05, logout ~ 16:00-16:15
    const isLate = Math.random() > 0.85; // 15% chance of being slightly late
    const loginH = isLate ? '08' : '07';
    const loginM = isLate ? getRandomMinute(1, 10) : getRandomMinute(50, 59);
    
    const isEarly = Math.random() > 0.9;
    const logoutH = isEarly ? '15' : '16';
    const logoutM = isEarly ? getRandomMinute(50, 59) : getRandomMinute(0, 10);
    
    const loginTime = `${loginH}:${loginM}`;
    const logoutTime = `${logoutH}:${logoutM}`;
    
    let activityLog = '';
    
    if (day >= 1 && day <= 3) {
      // Mon - Wed
      activityLog = "08:00 - 10:00: Theory (Reading learner guides, watching explainer videos, Listening to word over text videos)\n10:00 - 10:15: Tea Break\n10:15 - 12:15: Open Discussions, Role Play, verbally answer knowledge quizzes\n12:15 - 13:15: LUNCH\n13:15 - 16:00: Completing the Open Book Test / Learner workbook";
    } else if (day === 4) {
      // Thursday
      activityLog = "08:00 - 10:00: Practical Observations by Mentors\n10:00 - 10:15: Tea Break\n10:15 - 12:15: Practical Observations continued\n12:15 - 13:15: LUNCH\n13:15 - 16:00: Practical Observations Wrap-up";
    } else if (day === 5) {
      // Friday
      activityLog = "08:00 - 10:00: Summative Assessments Observations\n10:00 - 10:15: Tea Break\n10:15 - 12:15: Summative Assessments continued\n12:15 - 13:15: LUNCH\n13:15 - 16:00: Summative Assessments Wrap-up";
    } else {
      activityLog = "Weekend / Off";
    }
    
    updateStmt.run(loginTime, logoutTime, activityLog, rec.id);
  }
})();

console.log("Successfully updated " + records.length + " daily attendance records with call logs and times.");
