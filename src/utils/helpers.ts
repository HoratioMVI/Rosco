export interface ParsedID {
  dob: string;
  gender: 'Male' | 'Female' | 'Unknown';
  age: number;
  citizenship: string;
}

export function parseSAIDNumber(idNumber: string): ParsedID {
  if (!idNumber || idNumber.length !== 13) {
    return { dob: 'Unknown', gender: 'Unknown', age: 0, citizenship: 'Unknown' };
  }

  const yy = parseInt(idNumber.substring(0, 2), 10);
  const mm = parseInt(idNumber.substring(2, 4), 10);
  const dd = parseInt(idNumber.substring(4, 6), 10);

  const currentYear = new Date().getFullYear();
  const century = yy <= (currentYear % 100) ? 2000 : 1900;
  const fullYear = century + yy;

  const dobDate = new Date(fullYear, mm - 1, dd);
  const dob = isNaN(dobDate.getTime()) ? 'Invalid Date' : dobDate.toISOString().split('T')[0];

  const genderSeq = parseInt(idNumber.substring(6, 10), 10);
  const gender = genderSeq < 5000 ? 'Female' : 'Male';

  const citCode = parseInt(idNumber.substring(10, 11), 10);
  const citizenship = citCode === 0 ? 'SA Citizen' : 'Permanent Resident';

  const today = new Date();
  let age = today.getFullYear() - fullYear;
  const m = today.getMonth() - (mm - 1);
  if (m < 0 || (m === 0 && today.getDate() < dd)) {
    age--;
  }

  return { dob, gender, age: Math.max(0, age), citizenship };
}
