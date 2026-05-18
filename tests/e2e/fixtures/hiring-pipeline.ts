export const POSITION_ID = '1';
export const POSITION_NAME = 'Senior Full-Stack Engineer';
export const BACKEND_BASE = 'http://localhost:3010';

export const PHASES = [
  { id: 1, name: 'Applied',        orderIndex: 1 },
  { id: 2, name: 'Interview',      orderIndex: 2 },
  { id: 3, name: 'Technical Test', orderIndex: 3 },
  { id: 4, name: 'Offer',          orderIndex: 4 },
  { id: 5, name: 'Hired',          orderIndex: 5 },
  { id: 6, name: 'Rejected',       orderIndex: 6 },
];

export const PHASE_ID: Record<string, number> = Object.fromEntries(
  PHASES.map(p => [p.name, p.id])
);

export const interviewFlowMock = {
  interviewFlow: {
    positionName: POSITION_NAME,
    interviewFlow: {
      interviewSteps: PHASES,
    },
  },
};

export type CandidateEntry = {
  candidateId: number;
  applicationId: number;
  fullName: string;
  averageScore: number;
  currentInterviewStep: string;
};

export const DEFAULT_CANDIDATES: CandidateEntry[] = [
  { candidateId: 1, applicationId: 1, fullName: 'John Doe',      averageScore: 3, currentInterviewStep: 'Applied' },
  { candidateId: 2, applicationId: 2, fullName: 'Jane Smith',    averageScore: 4, currentInterviewStep: 'Applied' },
  { candidateId: 3, applicationId: 3, fullName: 'Carlos García', averageScore: 2, currentInterviewStep: 'Interview' },
];
