const fs = require('fs');
const path = require('path');

const targetRoot = path.join(process.cwd(), 'corse_documents');

function createDummyPdf(filePath, title, usId) {
  if (fs.existsSync(filePath)) return;
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 120 >>
stream
BT
/F1 16 Tf
50 720 Td
(ROSCO LMS - COURSE DOCUMENT: ${title}) Tj
0 -30 Td
/F1 12 Tf
(Unit Standard Reference: ${usId || 'NC General Security Practice 58577'}) Tj
0 -20 Td
(Official Training Document for SASSETA NC General Security Practice 58577) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000227 00000 n 
0000000401 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
468
%%EOF`;
  fs.writeFileSync(filePath, content, 'utf8');
}

function createDummyDocx(filePath, title, usId) {
  if (fs.existsSync(filePath)) return;
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  // Word doc representation / header
  const content = `ROSCO TRAINING MATERIAL - OFFICIAL DOCUMENT\n\nTitle: ${title}\nUnit Standard: ${usId}\nQualification: National Certificate: General Security Practice (NQF Level 3, SAQA ID 58577)\nRepository: corse_documents\nIntrosoft SASSETA Document Management System\n`;
  fs.writeFileSync(filePath, content, 'utf8');
}

const structure = [
  // Fundamentals
  { dir: 'Fundamentals/learner guides', file: '9010-LG.pdf', title: '9010 Learner Guide - Mathematical Literacy', us: '9010', type: 'pdf' },
  { dir: 'Fundamentals/learner guides', file: '9012-LG.pdf', title: '9012 Learner Guide - Mathematical Literacy', us: '9012', type: 'pdf' },
  { dir: 'Fundamentals/learner guides', file: '9013-LG.pdf', title: '9013 Learner Guide - Mathematical Literacy', us: '9013', type: 'pdf' },
  { dir: 'Fundamentals/learner guides', file: '7456-LG.pdf', title: '7456 Learner Guide - Mathematics in Real Contexts', us: '7456', type: 'pdf' },
  { dir: 'Fundamentals/learner guides', file: '119457-LG.pdf', title: '119457 Learner Guide - Communication at NQF Level 3', us: '119457', type: 'pdf' },
  { dir: 'Fundamentals/learner guides', file: '119465-LG.pdf', title: '119465 Learner Guide - Write texts for workplace communication', us: '119465', type: 'pdf' },
  { dir: 'Fundamentals/learner guides', file: '119467-LG.pdf', title: '119467 Learner Guide - Oral communication in workplace', us: '119467', type: 'pdf' },
  { dir: 'Fundamentals/learner guides', file: '119472-LG.pdf', title: '119472 Learner Guide - Accommodate audience and context', us: '119472', type: 'pdf' },

  { dir: 'Fundamentals/learner workbooks', file: '9010-LW.pdf', title: '9010 Learner Workbook', us: '9010', type: 'pdf' },
  { dir: 'Fundamentals/learner workbooks', file: '9012-LW.pdf', title: '9012 Learner Workbook', us: '9012', type: 'pdf' },
  { dir: 'Fundamentals/learner workbooks', file: '9013-LW.pdf', title: '9013 Learner Workbook', us: '9013', type: 'pdf' },
  { dir: 'Fundamentals/learner workbooks', file: '119457-LW.pdf', title: '119457 Learner Workbook', us: '119457', type: 'pdf' },
  { dir: 'Fundamentals/learner workbooks', file: '119465-LW.docx', title: '119465 Learner Workbook', us: '119465', type: 'docx' },

  { dir: 'Fundamentals/facilitator guides', file: '9010-FG.pdf', title: '9010 Facilitator Guide', us: '9010', type: 'pdf' },
  { dir: 'Fundamentals/facilitator guides', file: '119457-FG.pdf', title: '119457 Facilitator Guide', us: '119457', type: 'pdf' },
  { dir: 'Fundamentals/facilitator guides', file: '119467-FG.docx', title: '119467 Facilitator Guide', us: '119467', type: 'docx' },
  { dir: 'Fundamentals/summative assessments', file: '9010-SA.pdf', title: '9010 Summative Assessment Tool', us: '9010', type: 'pdf' },
  { dir: 'Fundamentals/summative assessments', file: '119457-SA.pdf', title: '119457 Summative Assessment Tool', us: '119457', type: 'pdf' },

  // Core
  { dir: 'Core/learner guides', file: '244184-LG.pdf', title: '244184 Learner Guide - Apply legal aspects in a security environment', us: '244184', type: 'pdf' },
  { dir: 'Core/learner guides', file: '244182-LG.pdf', title: '244182 Learner Guide - Give evidence in a court of law', us: '244182', type: 'pdf' },
  { dir: 'Core/learner guides', file: '244176-LG.pdf', title: '244176 Learner Guide - Access and egress control', us: '244176', type: 'pdf' },
  { dir: 'Core/learner guides', file: '244181-LG.pdf', title: '244181 Learner Guide - Conduct security at an installation', us: '244181', type: 'pdf' },
  { dir: 'Core/learner guides', file: '244177-LG.pdf', title: '244177 Learner Guide - Patrol security operations', us: '244177', type: 'pdf' },
  { dir: 'Core/learner guides', file: '244179-LG.pdf', title: '244179 Learner Guide - Handle complaints and incidents', us: '244179', type: 'pdf' },
  { dir: 'Core/learner guides', file: '244189-LG.pdf', title: '244189 Learner Guide - Conduct a security search', us: '244189', type: 'pdf' },
  { dir: 'Core/learner guides', file: '246694-LG.pdf', title: '246694 Learner Guide - Explain the requirements for becoming a security service provider', us: '246694', type: 'pdf' },

  { dir: 'Core/learner workbooks', file: '244184-LW.pdf', title: '244184 Learner Workbook', us: '244184', type: 'pdf' },
  { dir: 'Core/learner workbooks', file: '244182-LW.pdf', title: '244182 Learner Workbook', us: '244182', type: 'pdf' },
  { dir: 'Core/learner workbooks', file: '244176-LW.pdf', title: '244176 Learner Workbook', us: '244176', type: 'pdf' },
  { dir: 'Core/learner workbooks', file: '244189-LW.docx', title: '244189 Learner Workbook', us: '244189', type: 'docx' },

  { dir: 'Core/facilitator guides', file: '244184-FG.pdf', title: '244184 Facilitator Guide', us: '244184', type: 'pdf' },
  { dir: 'Core/facilitator guides', file: '244189-FG.pdf', title: '244189 Facilitator Guide', us: '244189', type: 'pdf' },

  { dir: 'Core/portfolio of evidence', file: '244184-POE.pdf', title: '244184 PoE Guide & Assessment Instruments', us: '244184', type: 'pdf' },
  { dir: 'Core/portfolio of evidence', file: '244189-POE.docx', title: '244189 PoE Guide', us: '244189', type: 'docx' },

  // Electives
  { dir: 'Electives/113852', file: '113852-LG.pdf', title: '113852 Learner Guide - Apply occupational health and safety', us: '113852', type: 'pdf' },
  { dir: 'Electives/113852', file: '113852-LW.pdf', title: '113852 Learner Workbook', us: '113852', type: 'pdf' },
  { dir: 'Electives/113852', file: '113852-FG.docx', title: '113852 Facilitator Guide', us: '113852', type: 'docx' },

  { dir: 'Electives/11505', file: '11505-LG.pdf', title: '11505 Learner Guide - Identify, describe and access the primary role of security officers in guarding', us: '11505', type: 'pdf' },
  { dir: 'Electives/11505', file: '11505-LW.pdf', title: '11505 Learner Workbook', us: '11505', type: 'pdf' },

  { dir: 'Electives/11508', file: '11508-LG.pdf', title: '11508 Learner Guide - Write security reports and keep records', us: '11508', type: 'pdf' },
  { dir: 'Electives/11508', file: '11508-LW.pdf', title: '11508 Learner Workbook', us: '11508', type: 'pdf' },

  { dir: 'Electives/117705', file: '117705-LG.pdf', title: '117705 Learner Guide - Demonstrate knowledge of the Firearms Control Act 60 of 2000', us: '117705', type: 'pdf' },
  { dir: 'Electives/117705', file: '117705-LW.docx', title: '117705 Learner Workbook', us: '117705', type: 'docx' },

  { dir: 'Electives/114941', file: '114941-LG.pdf', title: '114941 Learner Guide - Apply business ethics in a work environment', us: '114941', type: 'pdf' },
  { dir: 'Electives/242825', file: '242825-LG.pdf', title: '242825 Learner Guide - Conduct evacuations and emergency drills', us: '242825', type: 'pdf' },
  { dir: 'Electives/252250', file: '252250-LG.pdf', title: '252250 Learner Guide - Fire Fighting Principles', us: '252250', type: 'pdf' },
  { dir: 'Electives/252250', file: '252250-LW.pdf', title: '252250 Learner Workbook', us: '252250', type: 'pdf' },
  { dir: 'Electives/252250', file: '252250-FG.docx', title: '252250 Facilitator Guide', us: '252250', type: 'docx' },

  // Qualification Overview
  { dir: 'Qualification_58577_Overview', file: '58577-Curriculum-Matrix.xlsx', title: '58577 Curriculum Alignment Matrix', us: '58577', type: 'docx' },
  { dir: 'Qualification_58577_Overview', file: '58577-Qualification-Rules-and-PoE-Guidelines.pdf', title: '58577 Qualification Rules and PoE Guidelines', us: '58577', type: 'pdf' },
  { dir: 'Qualification_58577_Overview', file: '58577-Master-Assessor-Guide.docx', title: '58577 Master Assessor & Moderator Guide', us: '58577', type: 'docx' }
];

let createdCount = 0;
for (const item of structure) {
  const targetDir = path.join(targetRoot, item.dir);
  const targetFile = path.join(targetDir, item.file);
  if (item.type === 'pdf') {
    createDummyPdf(targetFile, item.title, item.us);
  } else {
    createDummyDocx(targetFile, item.title, item.us);
  }
  createdCount++;
}

console.log(`Successfully seeded ${createdCount} course documents into ${targetRoot}`);
