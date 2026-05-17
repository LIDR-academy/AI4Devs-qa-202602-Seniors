import type { Page } from '@playwright/test';
import { mockCandidate, mockInterviewFlowResponse } from '../fixtures/hiringPipeline';

const steps =
  mockInterviewFlowResponse.interviewFlow.interviewFlow.interviewSteps;

/** Mock stateful vía override de `fetch` (PositionDetails usa localhost:3010 absoluto). */
export function createHiringApiMock() {
  let currentStepName = mockCandidate.currentInterviewStep;

  return {
    get currentStepName() {
      return currentStepName;
    },
    reset() {
      currentStepName = mockCandidate.currentInterviewStep;
    },
    async install(page: Page, positionId = 2) {
      await page.addInitScript(
        ({ flow, candidate, positionId: posId, stepNames }) => {
          const state = {
            currentStepName: candidate.currentInterviewStep,
            steps: stepNames as { id: number; name: string }[],
            lastPut: null as {
              applicationId: number;
              currentInterviewStep: number;
            } | null,
            lastPutStatus: 0,
          };
          (window as unknown as { __e2eHiringState: typeof state }).__e2eHiringState =
            state;

          const originalFetch = window.fetch.bind(window);
          window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
            const url =
              typeof input === 'string'
                ? input
                : input instanceof URL
                  ? input.href
                  : input.url;
            const method = (init?.method ?? 'GET').toUpperCase();

            if (
              method === 'GET' &&
              url.includes(`/positions/${posId}/interviewFlow`)
            ) {
              return new Response(JSON.stringify(flow), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              });
            }

            if (
              method === 'GET' &&
              url.includes(`/positions/${posId}/candidates`)
            ) {
              return new Response(
                JSON.stringify([
                  { ...candidate, currentInterviewStep: state.currentStepName },
                ]),
                {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                }
              );
            }

            if (
              method === 'PUT' &&
              url.includes(`/candidates/${candidate.candidateId}`)
            ) {
              const body = JSON.parse(String(init?.body ?? '{}')) as {
                applicationId: number;
                currentInterviewStep: number;
              };
              const step = state.steps.find(
                (s) => s.id === body.currentInterviewStep
              );
              if (step) state.currentStepName = step.name;
              state.lastPut = body;
              state.lastPutStatus = 200;

              return new Response(
                JSON.stringify({
                  message: 'Candidate stage updated successfully',
                  data: {
                    id: candidate.applicationId,
                    positionId: posId,
                    candidateId: candidate.candidateId,
                    currentInterviewStep: body.currentInterviewStep,
                  },
                }),
                {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                }
              );
            }

            return originalFetch(input, init);
          };
        },
        {
          flow: mockInterviewFlowResponse,
          candidate: mockCandidate,
          positionId,
          stepNames: steps.map((s) => ({ id: s.id, name: s.name })),
        }
      );

    },
  };
}

export async function readLastPut(page: Page) {
  return page.evaluate(() => {
    const state = (
      window as unknown as {
        __e2eHiringState?: {
          lastPut: { applicationId: number; currentInterviewStep: number } | null;
          lastPutStatus: number;
        };
      }
    ).__e2eHiringState;
    return {
      body: state?.lastPut ?? null,
      status: state?.lastPutStatus ?? 0,
    };
  });
}
