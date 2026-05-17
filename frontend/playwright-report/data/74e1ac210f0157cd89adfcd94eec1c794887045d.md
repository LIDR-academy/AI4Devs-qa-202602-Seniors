# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: position.spec.ts >> Candidate Phase Change >> PUT request body contains the new phase identifier
- Location: tests/e2e/position.spec.ts:292:7

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
  94  |     // Create candidates in different phases
  95  |     const candidate1 = await dataManager.createCandidate(
  96  |       positionId,
  97  |       'Alice Johnson',
  98  |       'alice@example.com',
  99  |       'Aplicado'
  100 |     );
  101 |     cleanup.trackCandidate(candidate1.id);
  102 | 
  103 |     const candidate2 = await dataManager.createCandidate(
  104 |       positionId,
  105 |       'Bob Smith',
  106 |       'bob@example.com',
  107 |       'Entrevista'
  108 |     );
  109 |     cleanup.trackCandidate(candidate2.id);
  110 | 
  111 |     const candidate3 = await dataManager.createCandidate(
  112 |       positionId,
  113 |       'Charlie Brown',
  114 |       'charlie@example.com',
  115 |       'Oferta'
  116 |     );
  117 |     cleanup.trackCandidate(candidate3.id);
  118 | 
  119 |     // Reload to see the candidates
  120 |     await page.reload();
  121 | 
  122 |     // Wait for candidates to load after reload
  123 |     await page.waitForSelector('[data-testid^="candidate-"]', { timeout: 5000 });
  124 | 
  125 |     // Verify candidates are in correct columns
  126 |     const aplicadoColumn = page.locator(
  127 |       '[data-testid="phase-column-aplicado"]'
  128 |     );
  129 |     await expect(
  130 |       aplicadoColumn.locator(`[data-testid="candidate-${candidate1.id}"]`)
  131 |     ).toBeVisible();
  132 | 
  133 |     const entrevistaColumn = page.locator(
  134 |       '[data-testid="phase-column-entrevista"]'
  135 |     );
  136 |     await expect(
  137 |       entrevistaColumn.locator(`[data-testid="candidate-${candidate2.id}"]`)
  138 |     ).toBeVisible();
  139 | 
  140 |     const ofertaColumn = page.locator(
  141 |       '[data-testid="phase-column-oferta"]'
  142 |     );
  143 |     await expect(
  144 |       ofertaColumn.locator(`[data-testid="candidate-${candidate3.id}"]`)
  145 |     ).toBeVisible();
  146 |   });
  147 | 
  148 |   test('Empty columns are displayed gracefully', async ({ page }) => {
  149 |     const phases = await discoverPhaseColumns(page);
  150 |     expect(phases.length).toBeGreaterThan(0);
  151 | 
  152 |     // All columns should be visible even if empty
  153 |     for (const phase of phases) {
  154 |       await expect(phase.locator).toBeVisible();
  155 |     }
  156 | 
  157 |     // Verify at least one column is empty (no candidates)
  158 |     const firstColumn = phases[0].locator;
  159 |     const candidateCards = firstColumn.locator('[data-testid^="candidate-"]');
  160 |     const count = await candidateCards.count();
  161 |     expect(count).toBe(0);
  162 |   });
  163 | });
  164 | 
  165 | test.describe('Candidate Phase Change', () => {
  166 |   let dataManager: TestDataManager;
  167 |   let cleanup: TestCleanup;
  168 |   let positionId: string;
  169 | 
  170 |   test.beforeEach(async ({ page }) => {
  171 |     dataManager = new TestDataManager(page);
  172 |     cleanup = new TestCleanup(page);
  173 | 
  174 |     // Create a test position
  175 |     const position = await dataManager.createPosition(
  176 |       'Senior Backend Engineer'
  177 |     );
  178 |     positionId = position.id;
  179 |     cleanup.trackPosition(positionId);
  180 | 
  181 |     // Create a test candidate
  182 |     const candidate = await dataManager.createCandidate(
  183 |       positionId,
  184 |       'David Wilson',
  185 |       'david@example.com',
  186 |       'Aplicado'
  187 |     );
  188 |     cleanup.trackCandidate(candidate.id);
  189 | 
  190 |     // Navigate to position page
  191 |     await page.goto(`/positions/${positionId}`);
  192 | 
  193 |     // Wait for candidates to load
> 194 |     await page.waitForSelector('[data-testid^="candidate-"]', { timeout: 5000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
  195 |   });
  196 | 
  197 |   test.afterEach(async () => {
  198 |     await cleanup.cleanup();
  199 |   });
  200 | 
  201 |   test('Candidate card can be dragged from one column to another', async ({
  202 |     page,
  203 |   }) => {
  204 |     const candidates = await dataManager.getCandidates(positionId);
  205 |     const candidateId = candidates[0].candidateId;
  206 |     const phases = await discoverPhaseColumns(page);
  207 | 
  208 |     expect(phases.length).toBeGreaterThanOrEqual(2);
  209 | 
  210 |     // Get candidate card from first column
  211 |     const candidateCard = page.locator(
  212 |       `[data-testid="candidate-${candidateId}"]`
  213 |     );
  214 |     await expect(candidateCard).toBeVisible();
  215 | 
  216 |     // Get target column (second phase)
  217 |     const targetColumn = phases[1].locator;
  218 | 
  219 |     // Wait for the response from the update request
  220 |     const responsePromise = page.waitForResponse(
  221 |       (response) =>
  222 |         response.url().includes(candidateId) && response.request().method() === 'PUT'
  223 |     );
  224 | 
  225 |     // Drag and drop using mouse events for react-beautiful-dnd compatibility
  226 |     await dragCandidateCard(page, candidateCard, targetColumn);
  227 | 
  228 |     // Wait for the update request to complete
  229 |     await responsePromise;
  230 | 
  231 |     // Wait a bit for the DOM to update
  232 |     await page.waitForTimeout(200);
  233 | 
  234 |     // Verify card moved to new column
  235 |     await expect(
  236 |       targetColumn.locator(`[data-testid="candidate-${candidateId}"]`)
  237 |     ).toBeVisible();
  238 |   });
  239 | 
  240 |   test('PUT /candidate/:id is called with correct HTTP method', async ({
  241 |     page,
  242 |   }) => {
  243 |     const candidates = await dataManager.getCandidates(positionId);
  244 |     const candidateId = candidates[0].candidateId;
  245 |     const phases = await discoverPhaseColumns(page);
  246 | 
  247 |     expect(phases.length).toBeGreaterThanOrEqual(2);
  248 | 
  249 |     // Intercept the PUT request
  250 |     const putPromise = page.waitForRequest(
  251 |       (request) =>
  252 |         request.method() === 'PUT' && request.url().includes(candidateId)
  253 |     );
  254 | 
  255 |     const candidateCard = page.locator(
  256 |       `[data-testid="candidate-${candidateId}"]`
  257 |     );
  258 |     const targetColumn = phases[1].locator;
  259 | 
  260 |     // Drag and drop
  261 |     await dragCandidateCard(page, candidateCard, targetColumn);
  262 | 
  263 |     // Verify PUT request was made
  264 |     const request = await putPromise;
  265 |     expect(request.method()).toBe('PUT');
  266 |   });
  267 | 
  268 |   test('PUT request URL contains correct candidate ID', async ({ page }) => {
  269 |     const candidates = await dataManager.getCandidates(positionId);
  270 |     const candidateId = candidates[0].candidateId;
  271 |     const phases = await discoverPhaseColumns(page);
  272 | 
  273 |     expect(phases.length).toBeGreaterThanOrEqual(2);
  274 | 
  275 |     // Intercept the PUT request
  276 |     const putPromise = page.waitForRequest(
  277 |       (request) =>
  278 |         request.method() === 'PUT' && request.url().includes(candidateId)
  279 |     );
  280 | 
  281 |     const candidateCard = page.locator(
  282 |       `[data-testid="candidate-${candidateId}"]`
  283 |     );
  284 |     const targetColumn = phases[1].locator;
  285 | 
  286 |     await dragCandidateCard(page, candidateCard, targetColumn);
  287 | 
  288 |     const request = await putPromise;
  289 |     expect(request.url()).toContain(`/candidates/${candidateId}`);
  290 |   });
  291 | 
  292 |   test('PUT request body contains the new phase identifier', async ({
  293 |     page,
  294 |   }) => {
```