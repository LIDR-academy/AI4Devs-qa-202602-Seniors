---
id: NOV-14
title: "E2E Tests for Position Interface with Playwright"
status: triage
priority: high
assignee: null
labels:
  - e2e
  - playwright
  - testing
  - frontend
created_at: 2026-05-17T16:36:00Z
updated_at: 2026-05-17T16:36:00Z
linear_url: "https://linear.app/nova-code/issue/NOV-14/e2e-tests-for-position-interface-with-playwright"
team: Nova-code
---

# E2E Tests for Position Interface with Playwright

## [original]

## Contexto

Aplicar pruebas End-to-End (E2E) usando Playwright para validar la interfaz position que has creado anteriormente.

## Requisitos

1. **Configurar Playwright** en /frontend
2. **Crear pruebas E2E para position:**

### Escenario 1: Carga de la página de Position

- Verificar título de posición
- Verificar columnas de fases
- Verificar tarjetas de candidatos en columna correcta

### Escenario 2: Cambio de fase de candidato

- Arrastrar tarjeta a nueva columna
- Validar PUT /candidate/:id
- Verificar body contiene nueva fase

## Entrega

- /frontend/tests/e2e/position.spec.ts
- /prompts/prompts-[iniciales].md

## Notas

- Fases esperadas: Aplicado, Entrevista, Prueba Técnica, Oferta, Contratado, Rechazado
- Verificar que se dispara petición PUT al mover candidato
- El body de la petición debe contener la nueva fase

---

## [enhanced]

### Requisitos

### 1. Configurar Playwright en `/frontend`

**Instalación:**
```bash
cd frontend
pnpm add -D @playwright/test
pnpm exec playwright install --with-deps
```

**Archivo `frontend/playwright.config.ts`:**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  baseURL: 'http://localhost:3000',
  webServer: {
    command: 'pnpm start',
    port: 3000,
    reuseExisting: true,
  },
  use: {
    headless: true,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
```

### 2. Agregar `data-testid` a componentes existentes

**`frontend/src/components/PositionDetails.js`** (línea ~109):
```jsx
<h2 className="text-center mb-4" data-testid="position-title">{positionName}</h2>
```

**`frontend/src/components/StageColumn.js`** (línea ~7):
```jsx
<Card data-testid={`phase-column-${stage.title.toLowerCase().replace(/\s+/g, '-')}`}>
```

**`frontend/src/components/CandidateCard.js`** (línea ~8):
```jsx
<Card data-testid={`candidate-card-${candidate.id}`}>
```

### 3. Pruebas E2E — archivo `frontend/tests/e2e/position.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Position Interface - Kanban Board', () => {

  const POSITION_ID = '1';

  test.beforeEach(async ({ page }) => {
    await page.goto(`/position/${POSITION_ID}`);
  });

  // Escenario 1: Carga de la página de Position
  test('should display position title', async ({ page }) => {
    await expect(page.locator('[data-testid="position-title"]')).toBeVisible();
    const title = await page.locator('[data-testid="position-title"]').textContent();
    expect(title).not.toBe('');
  });

  test('should display all phase columns', async ({ page }) => {
    const phases = ['Aplicado', 'Entrevista', 'Prueba Técnica', 'Oferta', 'Contratado', 'Rechazado'];
    for (const phase of phases) {
      const selector = `[data-testid="phase-column-${phase.toLowerCase().replace(/\s+/g, '-')}"]`;
      await expect(page.locator(selector)).toBeVisible();
    }
  });

  test('should display candidate cards in correct phase columns', async ({ page }) => {
    const firstCandidateCard = page.locator('[data-testid^="candidate-card-"]').first();
    await expect(firstCandidateCard).toBeVisible();
  });

  // Escenario 2: Cambio de fase de candidato (drag and drop)
  test('should fire PUT /candidates/:id with new phase on drag-and-drop', async ({ page }) => {
    const [apiRequest] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/candidates/') && resp.request().method() === 'PUT'),
    ]);

    const candidateCard = page.locator('[data-testid^="candidate-card-"]').first();
    await candidateCard.waitFor({ state: 'visible' });

    const destColumn = page.locator('[data-testid="phase-column-entrevista"]');
    await candidateCard.dragTo(destColumn);

    const response = await apiRequest;
    expect(response.status()).toBe(200);

    const body = await response.request().postDataJSON();
    expect(body).toHaveProperty('currentInterviewStep');
  });

  test('should visually move candidate card to new column after drag', async ({ page }) => {
    const candidateCard = page.locator('[data-testid^="candidate-card-"]').first();
    const destColumn = page.locator('[data-testid="phase-column-prueba-técnica"]');

    await candidateCard.dragTo(destColumn);

    await expect(destColumn.locator('[data-testid^="candidate-card-"]')).toBeVisible();
  });
});
```

### Archivos a modificar/crear

| Archivo | Acción |
|---|---|
| `frontend/playwright.config.ts` | **Crear** — configuración base de Playwright |
| `frontend/src/components/PositionDetails.js` | **Modificar** — agregar `data-testid="position-title"` al `<h2>` |
| `frontend/src/components/StageColumn.js` | **Modificar** — agregar `data-testid` dinámico a cada `<Card>` |
| `frontend/src/components/CandidateCard.js` | **Modificar** — agregar `data-testid` dinámico a cada `<Card>` |
| `frontend/tests/e2e/position.spec.ts` | **Crear** — archivo de pruebas E2E |

### Definición de Done

- [ ] `playwright.config.ts` existe en `/frontend` y pasa validación (`npx playwright test --dry-run`)
- [ ] Los 3 `data-testid` están agregados en los componentes
- [ ] `position.spec.ts` contiene los 5 tests y todos pasan en headless
- [ ] La petición PUT se intercepta correctamente y su body incluye `currentInterviewStep`
- [ ] El drag-and-drop mueve visualmente la tarjeta a la columna destino
- [ ] `prompts/prompts-[iniciales].md` documenta los prompts utilizados

### Notas técnicas

- **Fases esperadas (orden kanban):** Aplicado → Entrevista → Prueba Técnica → Oferta → Contratado → Rechazado
- **Backend endpoint:** `PUT http://localhost:3010/candidates/:id`
  - Body: `{ applicationId: number, currentInterviewStep: number }`
- **Selectores:** usar `data-testid` en lugar de selectores CSS para evitar regressions
- **CI/CD:** las pruebas corren headless (`pnpm exec playwright test` sin flags)