/** Fixtures E2E alineados con `PositionDetails.js` y el seed del backend QA. */

export const mockInterviewFlowResponse = {
  interviewFlow: {
    positionName: 'Data Scientist',
    interviewFlow: {
      id: 2,
      description: 'Data science interview process',
      interviewSteps: [
        {
          id: 1,
          interviewFlowId: 2,
          interviewTypeId: 1,
          name: 'Initial Screening',
          orderIndex: 1,
        },
        {
          id: 2,
          interviewFlowId: 2,
          interviewTypeId: 2,
          name: 'Technical Interview',
          orderIndex: 2,
        },
      ],
    },
  },
};

export const mockCandidate = {
  fullName: 'John Doe',
  currentInterviewStep: 'Initial Screening',
  averageScore: 5,
  candidateId: 1,
  applicationId: 2,
};

export const HIRING_PHASES =
  mockInterviewFlowResponse.interviewFlow.interviewFlow.interviewSteps.map(
    (s) => s.name
  );
