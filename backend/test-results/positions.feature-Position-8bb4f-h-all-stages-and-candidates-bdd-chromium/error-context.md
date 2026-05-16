# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: positions.feature.spec.js >> Position Board Kanban Management >> Position board loads correctly with all stages and candidates
- Location: .features-gen/positions.feature.spec.js:11:7

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 3
Received:    0
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Volver al Dashboard" [ref=e4] [cursor=pointer]
  - heading "Posiciones" [level=2] [ref=e5]
  - generic [ref=e6]:
    - textbox "Buscar por título" [ref=e8]
    - textbox [ref=e10]:
      - /placeholder: Buscar por fecha
    - combobox [ref=e12]:
      - option "Estado" [selected]
      - option "Abierto"
      - option "Contratado"
      - option "Cerrado"
      - option "Borrador"
    - combobox [ref=e14]:
      - option "Manager" [selected]
      - option "John Doe"
      - option "Jane Smith"
      - option "Alex Jones"
  - generic [ref=e15]:
    - generic [ref=e18]:
      - generic [ref=e19]: Senior Full-Stack Engineer
      - paragraph [ref=e20]:
        - strong [ref=e21]: "Manager:"
        - text: hr@lti.com
        - strong [ref=e22]: "Deadline:"
        - text: 31/12/2024
      - generic [ref=e23]: Open
      - generic [ref=e24]:
        - button "Ver proceso" [ref=e25] [cursor=pointer]
        - button "Editar" [ref=e26] [cursor=pointer]
    - generic [ref=e29]:
      - generic [ref=e30]: Data Scientist
      - paragraph [ref=e31]:
        - strong [ref=e32]: "Manager:"
        - text: hr@lti.com
        - strong [ref=e33]: "Deadline:"
        - text: 31/12/2024
      - generic [ref=e34]: Open
      - generic [ref=e35]:
        - button "Ver proceso" [ref=e36] [cursor=pointer]
        - button "Editar" [ref=e37] [cursor=pointer]
```

# Test source

```ts
  1   | import { createBdd } from 'playwright-bdd';
  2   | import { expect, Page } from '@playwright/test';
  3   | 
  4   | const { Given, When, Then } = createBdd();
  5   | 
  6   | let lastRequestBody: any;
  7   | let lastRequestStatus: number;
  8   | let putRequestFired = false;
  9   | 
  10  | Given('I navigate to the positions page', async ({ page }) => {
  11  |   await page.goto('http://localhost:3000/positions');
  12  | });
  13  | 
  14  | Given('the position board has loaded with all interview stages', async ({ page }) => {
  15  |   await page.waitForSelector('[class*="stage"], [class*="column"], .kanban-board', { timeout: 5000 }).catch(() => null);
  16  | });
  17  | 
  18  | Then('I see the position title is displayed', async ({ page }) => {
  19  |   const titleLocator = page.locator('h1, [class*="title"]').first();
  20  |   await expect(titleLocator).toBeVisible({ timeout: 3000 });
  21  | });
  22  | 
  23  | Then('all interview stages are rendered as columns', async ({ page }) => {
  24  |   const stageColumns = await page.locator('[class*="stage"], [class*="column"]').all();
> 25  |   expect(stageColumns.length).toBeGreaterThanOrEqual(3);
      |                               ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  26  | });
  27  | 
  28  | Then('each candidate appears in the column matching their current interview stage', async ({ page }) => {
  29  |   const candidateCards = await page.locator('[class*="candidate"], [class*="card"]').all();
  30  |   expect(candidateCards.length).toBeGreaterThan(0);
  31  |   const firstCard = candidateCards[0];
  32  |   await expect(firstCard).toBeVisible();
  33  | });
  34  | 
  35  | When('I move the candidate from {string} to {string}', async ({ page }, fromStage: string, toStage: string) => {
  36  |   const putRequestPromise = page.waitForResponse(response => 
  37  |     response.request().method() === 'PUT' && response.url().includes('/candidates/')
  38  |   );
  39  | 
  40  |   const candidateCard = page.locator('[class*="candidate"], .candidate-card').first();
  41  |   const targetColumn = page.locator(`text="${toStage}"`).locator('..').first();
  42  |   
  43  |   await candidateCard.dragTo(targetColumn);
  44  |   
  45  |   const response = await putRequestPromise;
  46  |   lastRequestStatus = response.status();
  47  |   lastRequestBody = await response.request().postDataJSON().catch(() => null);
  48  | });
  49  | 
  50  | Then('the candidate appears in the {string} column', async ({ page }, stage: string) => {
  51  |   const stageColumn = page.locator(`text="${stage}"`).locator('..').first();
  52  |   const candidateInStage = stageColumn.locator('[class*="candidate"]').first();
  53  |   await expect(candidateInStage).toBeVisible({ timeout: 2000 });
  54  | });
  55  | 
  56  | Then('a PUT request was made to update the candidate stage', async () => {
  57  |   expect(lastRequestStatus).toBeDefined();
  58  |   expect([200, 201]).toContain(lastRequestStatus);
  59  | });
  60  | 
  61  | Then('the request body contains the correct applicationId and currentInterviewStep', async () => {
  62  |   expect(lastRequestBody).toBeDefined();
  63  |   expect(lastRequestBody).toHaveProperty('applicationId');
  64  |   expect(lastRequestBody).toHaveProperty('currentInterviewStep');
  65  |   expect(typeof lastRequestBody.applicationId).toBe('number');
  66  |   expect(typeof lastRequestBody.currentInterviewStep).toBe('number');
  67  | });
  68  | 
  69  | Then('the backend responds with a 2xx status', async () => {
  70  |   expect(lastRequestStatus).toBeGreaterThanOrEqual(200);
  71  |   expect(lastRequestStatus).toBeLessThan(300);
  72  | });
  73  | 
  74  | When('I attempt to move a candidate to a new stage', async ({ page }) => {
  75  |   await page.route('**/api/candidates/*', async route => {
  76  |     if (route.request().method() === 'PUT') {
  77  |       await route.abort('failed');
  78  |       lastRequestStatus = 500;
  79  |     } else {
  80  |       await route.continue();
  81  |     }
  82  |   });
  83  | 
  84  |   const candidateCard = page.locator('[class*="candidate"]').first();
  85  |   const targetColumn = page.locator('[class*="stage"], [class*="column"]').nth(1);
  86  |   
  87  |   await candidateCard.dragTo(targetColumn).catch(() => null);
  88  |   await page.waitForTimeout(500);
  89  | });
  90  | 
  91  | When('the backend returns a 500 error', async () => {
  92  |   expect(lastRequestStatus).toBe(500);
  93  | });
  94  | 
  95  | Then('the candidate remains in their original stage', async ({ page }) => {
  96  |   const firstColumn = page.locator('[class*="stage"], [class*="column"]').first();
  97  |   const candidate = firstColumn.locator('[class*="candidate"]').first();
  98  |   await expect(candidate).toBeVisible();
  99  | });
  100 | 
  101 | Then('an error message is displayed to the user', async ({ page }) => {
  102 |   const errorMsg = page.locator('[class*="error"], [role="alert"]').first();
  103 |   await expect(errorMsg).toBeVisible({ timeout: 2000 });
  104 | });
  105 | 
  106 | When('I reorder a candidate within the same {string} stage', async ({ page }, stage: string) => {
  107 |   putRequestFired = false;
  108 |   
  109 |   page.on('request', request => {
  110 |     if (request.method() === 'PUT' && request.url().includes('/candidates/')) {
  111 |       putRequestFired = true;
  112 |     }
  113 |   });
  114 | 
  115 |   const stageColumn = page.locator(`text="${stage}"`).locator('..').first();
  116 |   const candidates = await stageColumn.locator('[class*="candidate"]').all();
  117 |   
  118 |   if (candidates.length >= 2) {
  119 |     await candidates[0].dragTo(candidates[1]).catch(() => null);
  120 |     await page.waitForTimeout(300);
  121 |   }
  122 | });
  123 | 
  124 | Then('no PUT request is made to the backend', async () => {
  125 |   expect(putRequestFired).toBe(false);
```