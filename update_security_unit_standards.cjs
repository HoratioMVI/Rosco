const Database = require('better-sqlite3');
const db = new Database('local.db');

const unitStandards = [
  { id: 1, usId: "244176", title: "Use security equipment", usType: "Core", credits: 2, nqfLevel: "Level 2" },
  { id: 2, usId: "114941", title: "Apply knowledge of HIV/AIDS to a specific business sector and a workplace", usType: "Core", credits: 4, nqfLevel: "Level 3" },
  { id: 3, usId: "244184", title: "Apply legal aspects in a security environment", usType: "Core", credits: 8, nqfLevel: "Level 3" },
  { id: 4, usId: "244177", title: "Conduct a security patrol in an area of responsibility", usType: "Core", credits: 7, nqfLevel: "Level 3" },
  { id: 5, usId: "117705", title: "Demonstrate knowledge of the Firearms Control Act 2000 (Act No 60 of 2000) applicable to possessing a firearm", usType: "Core", credits: 3, nqfLevel: "Level 3" },
  { id: 6, usId: "246694", title: "Explain the requirements for becoming a security service provider", usType: "Core", credits: 4, nqfLevel: "Level 3" },
  { id: 7, usId: "244182", title: "Give evidence in court", usType: "Core", credits: 4, nqfLevel: "Level 3" },
  { id: 8, usId: "244179", title: "Handle complaints and problems", usType: "Core", credits: 6, nqfLevel: "Level 3" },
  { id: 9, usId: "244181", title: "Perform hand over and take over responsibilities", usType: "Core", credits: 2, nqfLevel: "Level 3" },
  { id: 10, usId: "244189", title: "Conduct access and egress control", usType: "Core", credits: 7, nqfLevel: "Level 4" },
  { id: 11, usId: "242825", title: "Conduct evacuations and emergency drills", usType: "Core", credits: 4, nqfLevel: "Level 4" },
  { id: 12, usId: "11505", title: "Identify, handle and defuse security related conflict", usType: "Core", credits: 12, nqfLevel: "Level 4" },
  { id: 13, usId: "119472", title: "Accommodate audience and context needs in oral/signed communication", usType: "Fundamental", credits: 5, nqfLevel: "Level 3" },
  { id: 14, usId: "9010", title: "Demonstrate an understanding of the use of different number bases and measurement units and an awareness of error in the context of relevant calculations", usType: "Fundamental", credits: 2, nqfLevel: "Level 3" },
  { id: 15, usId: "9013", title: "Describe, apply, analyse and calculate shape and motion in 2-and 3-dimensional space in different contexts", usType: "Fundamental", credits: 4, nqfLevel: "Level 3" },
  { id: 16, usId: "119457", title: "Interpret and use information from texts", usType: "Fundamental", credits: 5, nqfLevel: "Level 3" },
  { id: 17, usId: "9012", title: "Investigate life and work related problems using data and probabilities", usType: "Fundamental", credits: 5, nqfLevel: "Level 3" },
  { id: 18, usId: "119467", title: "Use language and communication in occupational learning programmes", usType: "Fundamental", credits: 5, nqfLevel: "Level 3" },
  { id: 19, usId: "7456", title: "Use mathematics to investigate and monitor the financial aspects of personal, business and national issues", usType: "Fundamental", credits: 5, nqfLevel: "Level 3" },
  { id: 20, usId: "119465", title: "Write/present/sign texts for a range of communicative contexts", usType: "Fundamental", credits: 5, nqfLevel: "Level 3" },
  { id: 21, usId: "13912", title: "Apply knowledge of self and team in order to develop a plan to enhance team performance", usType: "Elective", credits: 5, nqfLevel: "Level 3" },
  { id: 22, usId: "113852", title: "Apply occupational health, safety and environmental principles", usType: "Elective", credits: 10, nqfLevel: "Level 3" },
  { id: 23, usId: "11508", title: "Write security reports and take statements", usType: "Elective", credits: 10, nqfLevel: "Level 4" }
];

// Add the specific learner
const learnerIdNumber = '8502156021088';
const learnerNo = 'LA21/012345';
const surname = 'GXEKWA';
const firstName = 'ZOLANI ANDERSON';

console.log('Adding learner ZOLANI ANDERSON GXEKWA...');
db.prepare(`
  INSERT OR IGNORE INTO learners (id, learnerNo, surname, firstName, secondName, idNumber, comments, marks, moderatorName, moderatorNumber, moderationStatus, cohort)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  '176', 
  learnerNo,
  surname,
  firstName,
  '',
  learnerIdNumber,
  'Certified',
  85,
  'Courtney Rosenberg',
  '19MTR1011776',
  'Certified',
  '2021 Group'
);

// Clear old progress and awards
db.prepare("DELETE FROM learner_unit_standard_progress").run();
db.prepare("DELETE FROM learner_credit_awards").run();

const learners = db.prepare("SELECT id, learnerNo FROM learners").all();

console.log(`Populating progress for ${learners.length} learners...`);

const insertProgress = db.prepare(`
  INSERT INTO learner_unit_standard_progress 
  (id, learnerId, learnerNo, unitStandardId, status, creditsAvailable, creditsEarned, completedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertAward = db.prepare(`
  INSERT INTO learner_credit_awards 
  (id, learnerId, learnerNo, unitStandardId, creditsAwarded, awardedAt, awardedBy)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

db.transaction(() => {
  for (const learner of learners) {
    for (const us of unitStandards) {
      const progressId = `${learner.id}_${us.id}`;
      const now = '2024-03-22T00:00:00.000Z'; // Using the date from the certificate request
      
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
        'Courtney Rosenberg'
      );
    }
  }
})();

console.log('Successfully updated Database with NC: General Security Practice 58577 Unit Standards.');
