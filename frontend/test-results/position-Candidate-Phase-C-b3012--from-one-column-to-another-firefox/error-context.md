# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: position.spec.ts >> Candidate Phase Change >> Candidate card can be dragged from one column to another
- Location: tests/e2e/position.spec.ts:238:7

# Error details

```
TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('[data-testid^="candidate-"]') to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Volver a Posiciones" [ref=e4] [cursor=pointer]
  - heading "Senior Backend Engineer" [level=2] [ref=e5]
  - generic [ref=e6]:
    - generic [ref=e9]: Aplicado
    - generic [ref=e13]: Entrevista
    - generic [ref=e17]: Prueba Técnica
    - generic [ref=e21]: Oferta
    - generic [ref=e25]: Contratado
    - generic [ref=e29]: Rechazado
```

# Test source

```ts
  131 |     // Create candidates in different phases
  132 |     const candidate1 = await dataManager.createCandidate(
  133 |       positionId,
  134 |       'Alice Johnson',
  135 |       'alice@example.com',
  136 |       'Aplicado'
  137 |     );
  138 |     cleanup.trackCandidate(candidate1.id);
  139 | 
  140 |     const candidate2 = await dataManager.createCandidate(
  141 |       positionId,
  142 |       'Bob Smith',
  143 |       'bob@example.com',
  144 |       'Entrevista'
  145 |     );
  146 |     cleanup.trackCandidate(candidate2.id);
  147 | 
  148 |     const candidate3 = await dataManager.createCandidate(
  149 |       positionId,
  150 |       'Charlie Brown',
  151 |       'charlie@example.com',
  152 |       'Oferta'
  153 |     );
  154 |     cleanup.trackCandidate(candidate3.id);
  155 | 
  156 |     // Reload to see the candidates
  157 |     await page.reload();
  158 | 
  159 |     // Wait for candidates to load after reload
  160 |     await page.waitForSelector('[data-testid^="candidate-"]', { timeout: 5000 });
  161 | 
  162 |     // Verify candidates are in correct columns
  163 |     const aplicadoColumn = page.locator(
  164 |       '[data-testid="phase-column-aplicado"]'
  165 |     );
  166 |     await expect(
  167 |       aplicadoColumn.locator(`[data-testid="candidate-${candidate1.id}"]`)
  168 |     ).toBeVisible();
  169 | 
  170 |     const entrevistaColumn = page.locator(
  171 |       '[data-testid="phase-column-entrevista"]'
  172 |     );
  173 |     await expect(
  174 |       entrevistaColumn.locator(`[data-testid="candidate-${candidate2.id}"]`)
  175 |     ).toBeVisible();
  176 | 
  177 |     const ofertaColumn = page.locator(
  178 |       '[data-testid="phase-column-oferta"]'
  179 |     );
  180 |     await expect(
  181 |       ofertaColumn.locator(`[data-testid="candidate-${candidate3.id}"]`)
  182 |     ).toBeVisible();
  183 |   });
  184 | 
  185 |   test('Empty columns are displayed gracefully', async ({ page }) => {
  186 |     const phases = await discoverPhaseColumns(page, positionId);
  187 |     expect(phases.length).toBeGreaterThan(0);
  188 | 
  189 |     // All columns should be visible even if empty
  190 |     for (const phase of phases) {
  191 |       await expect(phase.locator).toBeVisible();
  192 |     }
  193 | 
  194 |     // Verify at least one column is empty (no candidates)
  195 |     const firstColumn = phases[0].locator;
  196 |     const candidateCards = firstColumn.locator('[data-testid^="candidate-"]');
  197 |     const count = await candidateCards.count();
  198 |     expect(count).toBe(0);
  199 |   });
  200 | });
  201 | 
  202 | test.describe('Candidate Phase Change', () => {
  203 |   let dataManager: TestDataManager;
  204 |   let cleanup: TestCleanup;
  205 |   let positionId: string;
  206 | 
  207 |   test.beforeEach(async ({ page }) => {
  208 |     dataManager = new TestDataManager(page);
  209 |     cleanup = new TestCleanup(page);
  210 | 
  211 |     // Create a test position
  212 |     const position = await dataManager.createPosition(
  213 |       'Senior Backend Engineer'
  214 |     );
  215 |     positionId = position.id;
  216 |     cleanup.trackPosition(positionId);
  217 | 
  218 |     // Create a test candidate
  219 |     const candidate = await dataManager.createCandidate(
  220 |       positionId,
  221 |       'David Wilson',
  222 |       'david@example.com',
  223 |       'Aplicado'
  224 |     );
  225 |     cleanup.trackCandidate(candidate.id);
  226 | 
  227 |     // Navigate to position page
  228 |     await page.goto(`/positions/${positionId}`);
  229 | 
  230 |     // Wait for candidates to load
> 231 |     await page.waitForSelector('[data-testid^="candidate-"]', { timeout: 5000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
  232 |   });
  233 | 
  234 |   test.afterEach(async () => {
  235 |     await cleanup.cleanup();
  236 |   });
  237 | 
  238 |   test('Candidate card can be dragged from one column to another', async ({
  239 |     page,
  240 |   }) => {
  241 |     const candidates = await dataManager.getCandidates(positionId);
  242 |     const candidateId = candidates[0].candidateId;
  243 |     const phases = await discoverPhaseColumns(page, positionId);
  244 | 
  245 |     expect(phases.length).toBeGreaterThanOrEqual(2);
  246 | 
  247 |     // Get candidate card from first column
  248 |     const candidateCard = page.locator(
  249 |       `[data-testid="candidate-${candidateId}"]`
  250 |     );
  251 |     await expect(candidateCard).toBeVisible();
  252 | 
  253 |     // Get target column (second phase)
  254 |     const targetColumn = phases[1].locator;
  255 | 
  256 |     // Wait for the response from the update request
  257 |     const responsePromise = page.waitForResponse(
  258 |       (response) =>
  259 |         response.url().includes(candidateId) && response.request().method() === 'PUT'
  260 |     );
  261 | 
  262 |     // Drag and drop using mouse events for react-beautiful-dnd compatibility
  263 |     await dragCandidateCard(page, candidateCard, targetColumn);
  264 | 
  265 |     // Wait for the update request to complete
  266 |     await responsePromise;
  267 | 
  268 |     // Wait a bit for the DOM to update
  269 |     await page.waitForTimeout(200);
  270 | 
  271 |     // Verify card moved to new column
  272 |     await expect(
  273 |       targetColumn.locator(`[data-testid="candidate-${candidateId}"]`)
  274 |     ).toBeVisible();
  275 |   });
  276 | 
  277 |   test('PUT /candidate/:id is called with correct HTTP method', async ({
  278 |     page,
  279 |   }) => {
  280 |     const candidates = await dataManager.getCandidates(positionId);
  281 |     const candidateId = candidates[0].candidateId;
  282 |     const phases = await discoverPhaseColumns(page, positionId);
  283 | 
  284 |     expect(phases.length).toBeGreaterThanOrEqual(2);
  285 | 
  286 |     // Intercept the PUT request
  287 |     const putPromise = page.waitForRequest(
  288 |       (request) =>
  289 |         request.method() === 'PUT' && request.url().includes(candidateId)
  290 |     );
  291 | 
  292 |     const candidateCard = page.locator(
  293 |       `[data-testid="candidate-${candidateId}"]`
  294 |     );
  295 |     const targetColumn = phases[1].locator;
  296 | 
  297 |     // Drag and drop
  298 |     await dragCandidateCard(page, candidateCard, targetColumn);
  299 | 
  300 |     // Verify PUT request was made
  301 |     const request = await putPromise;
  302 |     expect(request.method()).toBe('PUT');
  303 |   });
  304 | 
  305 |   test('PUT request URL contains correct candidate ID', async ({ page }) => {
  306 |     const candidates = await dataManager.getCandidates(positionId);
  307 |     const candidateId = candidates[0].candidateId;
  308 |     const phases = await discoverPhaseColumns(page, positionId);
  309 | 
  310 |     expect(phases.length).toBeGreaterThanOrEqual(2);
  311 | 
  312 |     // Intercept the PUT request
  313 |     const putPromise = page.waitForRequest(
  314 |       (request) =>
  315 |         request.method() === 'PUT' && request.url().includes(candidateId)
  316 |     );
  317 | 
  318 |     const candidateCard = page.locator(
  319 |       `[data-testid="candidate-${candidateId}"]`
  320 |     );
  321 |     const targetColumn = phases[1].locator;
  322 | 
  323 |     await dragCandidateCard(page, candidateCard, targetColumn);
  324 | 
  325 |     const request = await putPromise;
  326 |     expect(request.url()).toContain(`/candidates/${candidateId}`);
  327 |   });
  328 | 
  329 |   test('PUT request body contains the new phase identifier', async ({
  330 |     page,
  331 |   }) => {
```