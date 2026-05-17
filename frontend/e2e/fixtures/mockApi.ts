import type { Page, Request } from '@playwright/test';
import interviewFlowFixture from './interviewFlow.json';
import candidatesFixture from './candidates.json';
import candidateDetailFixture from './candidateDetail.json';

export const POSITION_ID = '42';
export const API_BASE = 'http://localhost:3010';

export type Phase = { id: number; name: string; orderIndex: number };
export type Candidate = {
  candidateId: number;
  fullName: string;
  currentInterviewStep: string;
  averageScore: number;
  applicationId: number;
};
export type InterviewFlowPayload = typeof interviewFlowFixture;

export const DEFAULT_PHASES: Phase[] = interviewFlowFixture.interviewFlow.interviewFlow.interviewSteps;
export const DEFAULT_POSITION_NAME: string = interviewFlowFixture.interviewFlow.positionName;
export const DEFAULT_CANDIDATES: Candidate[] = candidatesFixture as Candidate[];

export const phaseNames = (phases: Phase[] = DEFAULT_PHASES): string[] =>
  phases.map((p) => p.name);

export const cloneFlow = (): InterviewFlowPayload =>
  JSON.parse(JSON.stringify(interviewFlowFixture));

export const cloneCandidates = (): Candidate[] =>
  JSON.parse(JSON.stringify(candidatesFixture));

export type RouteResponse<T = unknown> = {
  status?: number;
  body?: T;
  delayMs?: number;
  abort?: 'timedout' | 'failed' | 'aborted';
};

export type UpdateLog = {
  url: string;
  method: string;
  candidateId: string;
  body: { applicationId: number; currentInterviewStep: number };
};

export type SetupOptions = {
  positionId?: string;
  interviewFlow?: RouteResponse<unknown>;
  candidates?: RouteResponse<Candidate[]>;
  updateCandidate?: RouteResponse<unknown>;
  candidateDetail?: RouteResponse<unknown>;
  onUpdate?: (log: UpdateLog) => void;
};

const wait = (ms?: number) =>
  ms && ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve();

export async function setupPositionRoutes(
  page: Page,
  opts: SetupOptions = {},
): Promise<UpdateLog[]> {
  const positionId = opts.positionId ?? POSITION_ID;
  const flow = opts.interviewFlow ?? { status: 200, body: cloneFlow() };
  const cands = opts.candidates ?? { status: 200, body: cloneCandidates() };
  const upd = opts.updateCandidate ?? { status: 200, body: { message: 'ok' } };
  const detail = opts.candidateDetail ?? { status: 200, body: candidateDetailFixture };

  const updateLog: UpdateLog[] = [];

  await page.route(
    `${API_BASE}/positions/${positionId}/interviewFlow`,
    async (route) => {
      if (flow.abort) return route.abort(flow.abort);
      await wait(flow.delayMs);
      await route.fulfill({
        status: flow.status ?? 200,
        contentType: 'application/json',
        body: JSON.stringify(flow.body ?? {}),
      });
    },
  );

  await page.route(
    `${API_BASE}/positions/${positionId}/candidates`,
    async (route) => {
      if (cands.abort) return route.abort(cands.abort);
      await wait(cands.delayMs);
      await route.fulfill({
        status: cands.status ?? 200,
        contentType: 'application/json',
        body: JSON.stringify(cands.body ?? []),
      });
    },
  );

  await page.route(/\/candidates\/\d+(\?.*)?$/, async (route, request: Request) => {
    const url = request.url();
    const match = url.match(/\/candidates\/(\d+)/);
    const candidateId = match?.[1] ?? '';
    if (request.method() === 'PUT') {
      let body: UpdateLog['body'] = { applicationId: 0, currentInterviewStep: 0 };
      try {
        body = JSON.parse(request.postData() ?? '{}');
      } catch {
        /* leave defaults */
      }
      const entry: UpdateLog = {
        url,
        method: 'PUT',
        candidateId,
        body,
      };
      updateLog.push(entry);
      opts.onUpdate?.(entry);
      if (upd.abort) return route.abort(upd.abort);
      await wait(upd.delayMs);
      await route.fulfill({
        status: upd.status ?? 200,
        contentType: 'application/json',
        body: JSON.stringify(upd.body ?? {}),
      });
      return;
    }
    if (detail.abort) return route.abort(detail.abort);
    await wait(detail.delayMs);
    await route.fulfill({
      status: detail.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(detail.body ?? candidateDetailFixture),
    });
  });

  return updateLog;
}

export const stepIdFor = (phaseName: string, phases: Phase[] = DEFAULT_PHASES): number => {
  const step = phases.find((p) => p.name === phaseName);
  if (!step) throw new Error(`Unknown phase: ${phaseName}`);
  return step.id;
};
