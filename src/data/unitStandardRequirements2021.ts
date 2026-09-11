export interface UnitStandardRequirementDefinition {
  id: number;
  unitStandardId: number;
  usId: string;
  requirementType: 
    | 'THEORY_LEARNER_BOOK'
    | 'PRACTICAL_EVALUATION'
    | 'SUMMATIVE_ASSESSMENT'
    | 'ASSESSOR_FEEDBACK'
    | 'WORKPLACE_WEEK_2'
    | 'WORKPLACE_WEEK_3'
    | 'WORKPLACE_WEEK_4';
  requirementName: string;
  sequenceNo: number;
  mandatory: boolean;
}

export const requirementTypesList = [
  { type: 'THEORY_LEARNER_BOOK', name: 'Theory Learner Book', seq: 1 },
  { type: 'PRACTICAL_EVALUATION', name: 'Practical Evaluation', seq: 2 },
  { type: 'SUMMATIVE_ASSESSMENT', name: 'Summative Assessment', seq: 3 },
  { type: 'ASSESSOR_FEEDBACK', name: 'Assessor Feedback', seq: 4 },
  { type: 'WORKPLACE_WEEK_2', name: 'Workplace Week 2', seq: 5 },
  { type: 'WORKPLACE_WEEK_3', name: 'Workplace Week 3', seq: 6 },
  { type: 'WORKPLACE_WEEK_4', name: 'Workplace Week 4', seq: 7 },
];

import { unitStandards2021 } from './unitStandards2021.js';

export const unitStandardRequirements2021: UnitStandardRequirementDefinition[] = [];

let reqIdCounter = 1;
unitStandards2021.forEach((us) => {
  requirementTypesList.forEach((rt) => {
    unitStandardRequirements2021.push({
      id: reqIdCounter++,
      unitStandardId: us.id,
      usId: us.usId,
      requirementType: rt.type as any,
      requirementName: `${us.usId} — ${rt.name}`,
      sequenceNo: rt.seq,
      mandatory: true
    });
  });
});

export const expectedRequirementCount = 23 * 7; // 161
