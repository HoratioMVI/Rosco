import { initialLearners } from './learners';
import { schedule2021RealData } from './schedule2021Real';

export interface DailyAttendanceRecord {
  id: string;
  learnerId: string;
  learnerNo: string;
  learnerName: string;
  date: string;
  usId: string;
  unitStandardTitle: string;
  status: 'Present' | 'Absent' | 'Catch-up';
  reason?: string;
}

export const dailyAttendanceData: DailyAttendanceRecord[] = [];

const absentReasons = ['Sick', 'Family Duty', 'Other Allowed Reasons'];

let counter = 1;

// Determine which learners have perfect attendance (63%)
const perfectLearnerIndices = new Set<number>();
while (perfectLearnerIndices.size < 63) {
  perfectLearnerIndices.add(Math.floor(Math.random() * 100));
}

initialLearners.forEach((learner, learnerIndex) => {
  const learnerNo = `L${String(learnerIndex + 1).padStart(3, '0')}`;
  const learnerName = `${learner.firstName} ${learner.secondName ? learner.secondName + ' ' : ''}${learner.surname}`;
  const isPerfect = perfectLearnerIndices.has(learnerIndex);

  schedule2021RealData.forEach((sched) => {
    let status: 'Present' | 'Absent' = 'Present';
    let reason = '';

    if (!isPerfect) {
      // 10% chance to be absent on any given day for non-perfect learners
      if (Math.random() < 0.1) {
        status = 'Absent';
        reason = absentReasons[Math.floor(Math.random() * absentReasons.length)];
      }
    }

    dailyAttendanceData.push({
      id: `ATT-${String(counter++).padStart(5, '0')}`,
      learnerId: learner.id,
      learnerNo,
      learnerName,
      date: sched.theoryDate,
      usId: sched.usId,
      unitStandardTitle: sched.title,
      status,
      reason
    });

    // If absent, we should also generate a catch-up record some days later.
    if (status === 'Absent') {
      const dateObj = new Date(sched.theoryDate);
      dateObj.setDate(dateObj.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 days later
      
      const catchUpDate = dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      dailyAttendanceData.push({
        id: `ATT-${String(counter++).padStart(5, '0')}`,
        learnerId: learner.id,
        learnerNo,
        learnerName,
        date: catchUpDate,
        usId: sched.usId,
        unitStandardTitle: sched.title + ' (Catch-up)',
        status: 'Catch-up',
        reason: 'Catching up for previous absence'
      });
    }
  });
});
