const fs = require('fs');
const path = require('path');

const repoRoot = path.join(process.cwd(), 'sasseta_repo');

const structures = [
  'Sasseta 2021 Locked PDFs/001 - MANYAKANYAKA PHINDIWE SYLVIA/ID copies/ID.pdf',
  'Sasseta 2021 Locked PDFs/001 - MANYAKANYAKA PHINDIWE SYLVIA/Summative Assessments/SA.pdf',
  'Sasseta 2021 Locked PDFs/001 - MANYAKANYAKA PHINDIWE SYLVIA/Learner workbooks/Workbook1.pdf',
  'Sasseta 2021 Locked PDFs/002 - MZINDA PHILISWA/ID copies/ID.pdf',
  'Sasseta 2021 Locked PDFs/002 - MZINDA PHILISWA/Summative Assessments/Assessment_Final.pdf',
  'Sasseta 2021 Locked PDFs/003 - TASE ASEMAHLE/ID copies/ID_Copy.pdf',
  'Sasseta 2021 Locked PDFs/003 - TASE ASEMAHLE/Portfolios/POE_2021.pdf',
  'Sasseta 2021 Locked PDFs/004 - NKOSI ZODWA/Qualifications/Degree.pdf',
  'Sasseta 2021 Locked PDFs/005 - MHLONGO SIPHO/Employment contracts/Contract.pdf'
];

function seedMockRepo() {
  console.log('Seeding mock SASSETA repository...');
  
  structures.forEach(relPath => {
    const fullPath = path.join(repoRoot, relPath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create a dummy PDF content
    fs.writeFileSync(fullPath, `Dummy PDF content for ${relPath}`);
    console.log(`Created: ${relPath}`);
  });
  
  // Add some extra root files mentioned in the prompt
  const rootFiles = [
    '1. Rollout plan 2021-2026 Course Start – End Dates/plan.pdf',
    '2. Attendance Registers (Example)/register_sample.xlsx',
    '3. Learner Lists (538)/list.csv',
    '7. Verification Tracker/tracker.xlsx'
  ];
  
  rootFiles.forEach(relPath => {
    const fullPath = path.join(repoRoot, relPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, `Dummy content for ${relPath}`);
    console.log(`Created: ${relPath}`);
  });

  console.log('Mock repository seeded successfully.');
}

seedMockRepo();
