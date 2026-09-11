import { initialLearners } from './learners.js';
import { schedule2021RealData } from './schedule2021Real.js';

export interface TheoryLearnerBookRecord {
  id: string; // e.g. "1-00001"
  learnerNo: string; // e.g. "L001"
  learnerName: string; // e.g. "PHINDIWE SYLVIA MANYAKANYAKA"
  learnerIdNumber: string; // e.g. "7209161127089"
  usId: string; // e.g. "246694"
  unitStandardTitle: string;
  activityType: string; // "Theory Learner Book"
  scheduledStart: string;
  scheduledEnd: string;
  actualLogin: string;
  actualLogout: string;
  evidenceSource: string;
  evidenceReference: string;
  verificationStatus: string; // "Awaiting Evidence" | "Verified"
  verifiedBy: string;
  mentor: string; // "Online Facilitator"
}

export const theoryLearnerBooks2021Data: TheoryLearnerBookRecord[] = [];

let counter = 1;
initialLearners.forEach((learner, learnerIndex) => {
  const learnerNo = `L${String(learnerIndex + 1).padStart(3, '0')}`;
  const learnerName = `${learner.firstName} ${learner.secondName ? learner.secondName + ' ' : ''}${learner.surname}`;

  schedule2021RealData.forEach((sched) => {
    const recordNo = `1-${String(counter++).padStart(5, '0')}`;
    theoryLearnerBooks2021Data.push({
      id: recordNo,
      learnerNo,
      learnerName,
      learnerIdNumber: learner.idNumber,
      usId: sched.usId,
      unitStandardTitle: sched.title,
      activityType: 'Theory Learner Book',
      scheduledStart: `${sched.theoryDate} 00:00`,
      scheduledEnd: `${sched.theoryDate} 00:00`,
      actualLogin: '',
      actualLogout: '',
      evidenceSource: '',
      evidenceReference: '',
      verificationStatus: 'Awaiting Evidence',
      verifiedBy: '',
      mentor: 'Online Facilitator'
    });
  });
});
