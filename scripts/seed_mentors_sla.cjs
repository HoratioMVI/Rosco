const fs = require('fs');
const path = require('path');

const targetDir = path.join(process.cwd(), 'Mentors SLA');

const mentorsData = [
  {
    folder: '1. Boitumelo Mosidi',
    files: [
      { name: 'Boitumelo  National Certificate GSO.pdf', size: 672553, type: 'pdf' },
      { name: 'Boitumelo Incident Investigation-WEBINAR Certificate for Boitumelo Mosidi.pdf', size: 1112810, type: 'pdf' },
      { name: 'Boitumelo Mosidi MOU for Mentors.pdf', size: 256022, type: 'pdf' },
      { name: 'Boitumelo Mosidi MY FIRST AID LEVEL 1 Certificate.pdf', size: 127216, type: 'pdf' },
      { name: 'Boitumelo Mosidi Seesa Certificate Level 5.pdf', size: 127216, type: 'pdf' },
      { name: 'Boitumelo PSIRA.pdf', size: 441852, type: 'pdf' },
      { name: 'Mentor 2021 Learners under Boitumelo.xlsx', size: 10420, type: 'xlsx' }
    ]
  },
  {
    folder: '2. Xavier Kruger',
    files: [
      { name: 'Mentor 2021 Learners under Xavier.xlsx', size: 18929, type: 'xlsx' },
      { name: 'Xavier Grade A Psira.pdf', size: 373893, type: 'pdf' },
      { name: 'Xavier Kruger MOU for Mentors.pdf', size: 247911, type: 'pdf' },
      { name: 'Xavier National Certificate General Security Practice.pdf', size: 366984, type: 'pdf' }
    ]
  },
  {
    folder: '3. Sandile Mthimkulu',
    files: [
      { name: '1. Sandile Mthimkulu  Memorandum of understanding-signed.pdf', size: 420333, type: 'pdf' },
      { name: 'Mentor 2021 Learners under Sandile.xlsx', size: 10279, type: 'xlsx' },
      { name: 'Sandile  National Certificate GSO.pdf', size: 671445, type: 'pdf' },
      { name: 'Sandile Emergency Preparedness and Evacuation Procedures Certificate Sandile Mthimkhulu.pdf', size: 1098605, type: 'pdf' },
      { name: 'Sandile Mthimkulu MOU for Mentors.pdf', size: 246763, type: 'pdf' },
      { name: 'Sandile Psira Certificate.pdf', size: 441790, type: 'pdf' }
    ]
  },
  {
    folder: '4. Ndumiso Ntumbe',
    files: [
      { name: '1. Ndumiso Ntumbe Memorandum of understanding AXON-signed.pdf', size: 661940, type: 'pdf' },
      { name: 'Mentor 2021 Learners under Ndumiso.xlsx', size: 9910, type: 'xlsx' },
      { name: 'Ndumiso First Aid Competence Report retrieved on 2026-March-11 09 04.pdf', size: 895234, type: 'pdf' },
      { name: 'Ndumiso Incident Investigation - WEBINAR retrieved on 2026-March-11 09 04.pdf', size: 1503686, type: 'pdf' }
    ]
  },
  {
    folder: '5. Thabang Makgalemele',
    files: [
      { name: 'Mentor 2021 Learners under Thabang Makgalemele.xlsx', size: 10002, type: 'xlsx' },
      { name: 'Thabang Makgalemele MOU for Mentors.pdf', size: 251840, type: 'pdf' },
      { name: 'Thabang National certificate GSO.pdf', size: 356336, type: 'pdf' }
    ]
  },
  {
    folder: '6. Eugene Ramoshaba',
    files: [
      { name: 'Eugene ID.pdf', size: 118378, type: 'pdf' },
      { name: 'Eugene Ramoshaba CV.pdf', size: 275686, type: 'pdf' },
      { name: 'Eugene Ramoshaba ID.jpg', size: 193188, type: 'jpg' },
      { name: 'Eugene Ramoshaba MOU for Mentors.pdf', size: 247672, type: 'pdf' },
      { name: 'Eugene Ramoshaba-National Certificate GSO.pdf', size: 410652, type: 'pdf' },
      { name: 'Mentor 2021 Learners under Eugene Ramoshaba.xlsx', size: 10059, type: 'xlsx' }
    ]
  },
  {
    folder: '7. Faith Ramoshaba',
    files: [
      { name: 'Faith  National Certificate GSO.pdf', size: 699786, type: 'pdf' },
      { name: 'Faith CV.pdf', size: 113105, type: 'pdf' },
      { name: 'Faith Ramoshaba MOU for Mentors.pdf', size: 257652, type: 'pdf' },
      { name: 'id,drivers.pdf', size: 227455, type: 'pdf' },
      { name: 'matric.pdf', size: 149090, type: 'pdf' },
      { name: 'Mentor 2021 Learners under Faith Ramoshaba.xlsx', size: 10139, type: 'xlsx' },
      { name: 'merseta 1.pdf', size: 33173, type: 'pdf' },
      { name: 'merseta 2.pdf', size: 30260, type: 'pdf' }
    ]
  },
  {
    folder: '8. Orpheus Ndlovu',
    files: [
      { name: '2a. Orpheus Ndlovu_Comprehensive CV.pdf', size: 909143, type: 'pdf' },
      { name: '3a. Orpheus Ndlovu Sasseta Registration.pdf', size: 278735, type: 'pdf' },
      { name: '4. Orpheus Moderation Certificate.jpg', size: 431921, type: 'jpg' },
      { name: '5. Orpheus Assessor Certificate.jpg', size: 419581, type: 'jpg' },
      { name: 'Mentor 2021 Learners under Orpheus Ndlovu.xlsx', size: 10102, type: 'xlsx' },
      { name: 'Orheus Ndlovu MOU for Mentors.pdf', size: 246601, type: 'pdf' },
      { name: 'Orpheus Ndlovu MOU for Mentors.pdf', size: 246601, type: 'pdf' },
      { name: 'Orpheus Psira Certificate.pdf', size: 440440, type: 'pdf' }
    ]
  },
  {
    folder: '9. Thandazo Msiza',
    files: [
      { name: 'Mentor 2021 Learners under Thandazo.xlsx', size: 10094, type: 'xlsx' },
      { name: 'Thandazo ID.jpeg', size: 73269, type: 'jpg' },
      { name: 'Thandazo MOU for Mentors.pdf', size: 248303, type: 'pdf' },
      { name: 'Thandazo Msiza CV.pdf', size: 243195, type: 'pdf' }
    ]
  },
  {
    folder: '10. Arekerei Kajanu',
    files: [
      { name: 'Ale cv.pdf', size: 230182, type: 'pdf' },
      { name: 'Ale MOU for Mentors.pdf', size: 227371, type: 'pdf' },
      { name: 'Ale Passport.pdf', size: 197771, type: 'pdf' },
      { name: 'Ale Qualifications.pdf', size: 576223, type: 'pdf' },
      { name: 'Arekerei Kajanu National Certificate GSO.pdf', size: 293045, type: 'pdf' },
      { name: 'Arekerei Permit.pdf', size: 1126342, type: 'pdf' }
    ]
  }
];

function createDummyContent(type, size, filename) {
  if (type === 'pdf') {
    const pdfHeader = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n`;
    const buf = Buffer.alloc(size);
    const headerBuf = Buffer.from(pdfHeader);
    headerBuf.copy(buf, 0);
    return buf;
  } else if (type === 'xlsx') {
    const buf = Buffer.alloc(size);
    // PK zip signature for xlsx
    buf[0] = 0x50; buf[1] = 0x4B; buf[2] = 0x03; buf[3] = 0x04;
    return buf;
  } else if (type === 'jpg' || type === 'jpeg') {
    const buf = Buffer.alloc(size);
    // JPEG SOI marker
    buf[0] = 0xFF; buf[1] = 0xD8; buf[2] = 0xFF; buf[3] = 0xE0;
    return buf;
  } else {
    return Buffer.alloc(size, 'A');
  }
}

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

let totalCreated = 0;
for (const mentor of mentorsData) {
  const mDir = path.join(targetDir, mentor.folder);
  if (!fs.existsSync(mDir)) {
    fs.mkdirSync(mDir, { recursive: true });
  }

  for (const f of mentor.files) {
    const fPath = path.join(mDir, f.name);
    if (!fs.existsSync(fPath)) {
      const content = createDummyContent(f.type, f.size, f.name);
      fs.writeFileSync(fPath, content);
      totalCreated++;
    }
  }
}

console.log(`Successfully seeded ${mentorsData.length} mentor folders and ${totalCreated} files in ${targetDir}`);
