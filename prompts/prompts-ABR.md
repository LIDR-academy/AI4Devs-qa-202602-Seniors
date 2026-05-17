# prompts-ABR — Posición / flujo de entrevistas / candidatos (QA + Playwright E2E)

Documento de referencia para el repo **`AI4Devs-qa-202602-Seniors`**: contratos HTTP del pipeline de contratación, pruebas automatizadas y **Playwright E2E** sobre la pantalla de position (`PositionDetails.js`).

---

## Contrato HTTP en este repositorio (referencia rápida)

| Método y ruta | Notas |
|---------------|--------|
| `GET /positions` | Listado de posiciones (`Positions.tsx`) |
| `GET /positions/:id/interviewFlow` | Respuesta: `{ interviewFlow: { positionName, interviewFlow: { interviewSteps } } }` |
| `GET /positions/:id/candidates` | Cada ítem: `fullName`, `currentInterviewStep`, `averageScore`, `candidateId`, `applicationId` |
| `PUT /candidates/:id` | `:id` = **candidateId**. Body: `{ applicationId, currentInterviewStep }` (números en el cliente QA) |

**Frontend (CRA):** las peticiones van a `http://localhost:3010` (hardcodeado en `PositionDetails.js` y `Positions.tsx`). Kanban con **react-beautiful-dnd**; ruta del tablero: `/positions/:id`.

**Código principal:** `frontend/src/components/PositionDetails.js`, `StageColumn.js`, `CandidateCard.js`.

---

## Estrategia y catálogo de pruebas

| Contexto | Herramienta | Estado en el repo |
|----------|-------------|-------------------|
| API Node.js | **Jest** | 4 suites en `backend/src/` |
| UI end-to-end (navegador) | **Playwright** | 2 tests en `frontend/e2e/` |

---

### Infraestructura Playwright E2E

| Recurso | Ruta | Función |
|---------|------|---------|
| Config | `frontend/playwright.config.ts` | `baseURL`, `webServer`, proyecto Chromium, timeouts |
| Tests E2E | `frontend/e2e/position-pipeline.spec.ts` | Escenarios Kanban (carga + drag & drop + PUT) |
| Fixtures | `frontend/e2e/fixtures/hiringPipeline.ts` | Datos mock (`HIRING_PHASES`, candidato) |
| Mock API | `frontend/e2e/helpers/mockHiringApi.ts` | Override de `fetch` stateful (GET/PUT a `localhost:3010`) sin backend |
| CI | `frontend/.github/workflows/playwright.yml` | `npx playwright test` en push/PR a `main`/`master` |

**Scripts (`frontend/package.json`):**

```bash
cd frontend
npm install                 # instala @playwright/test
npx playwright install      # navegadores (una vez)
npm run test:e2e            # playwright test
npm run test:e2e:ui         # playwright test --ui
npm run test:e2e:headed     # playwright test --headed
npx playwright show-report  # abre informe HTML (tras npm run test:e2e)
```

**Inicialización (referencia):** Playwright **no** tiene `npx playwright init`. Usar `npm init playwright@latest` o `npx create-playwright`. En este repo la configuración ya está creada.

#### Configuración `playwright.config.ts`

| Opción | Valor | Motivo |
|--------|-------|--------|
| `testDir` | `./e2e` | Tests E2E separados de Jest |
| `use.baseURL` | `http://localhost:3001` (puerto dedicado; evita conflicto con otro CRA en :3000) | `page.goto('/positions/2')` |
| `webServer.env.PORT` | `3001` | Arranca este frontend en puerto propio |
| `webServer.command` | `npm run start` | Arranca CRA antes de los tests |
| `webServer.env` | `BROWSER=none`, `CI=true` | Sin abrir ventana del navegador |
| `webServer.reuseExistingServer` | `!process.env.CI` | Reutiliza `npm start` si ya corre |
| `projects` | Chromium | Estable con react-beautiful-dnd |
| `timeout` | `60_000` ms | Primera compilación CRA |
| `reporter` | `html` | Informe en `playwright-report/` |

Los E2E **interceptan** `http://localhost:3010/...` con `addInitScript` (override de `fetch`; la app no usa proxy CRA). No hace falta levantar el backend para ejecutar `npm run test:e2e`.

**Nota técnica E2E:** En `beforeEach` se oculta `#webpack-dev-server-client-overlay` para que no bloquee el drag. Drag con selectores `data-rbd-draggable-id` / `data-rbd-droppable-id` (react-beautiful-dnd).

##### Fases validadas en E2E (posición `id = 2`, ruta `/positions/2`)

| Orden | `id` (paso) | Nombre en UI / cabecera de columna |
|-------|-------------|-------------------------------------|
| 1 | 1 | **Initial Screening** |
| 2 | 2 | **Technical Interview** |

**Datos de prueba (fixture E2E):**

| Campo | Valor |
|-------|-------|
| Título pantalla (`h2`) | `Data Scientist` |
| Candidato | `John Doe` |
| `candidateId` (path PUT, `data-rbd-draggable-id`) | `1` |
| `applicationId` (body PUT) | `2` |
| Fase inicial | `Initial Screening` |

Constante: `HIRING_PHASES` en `e2e/fixtures/hiringPipeline.ts`.

##### Escenarios E2E — `e2e/position-pipeline.spec.ts`

**Escenario 1 — Carga de la pantalla de position**

- Navega a `/positions/2`.
- Verifica título `Data Scientist`.
- Verifica columnas (`.card-header`) para cada fase de `HIRING_PHASES`.
- Verifica que `John Doe` está en **Initial Screening** y no en **Technical Interview**.

**Escenario 2 — Cambio de fase (drag & drop + PUT)**

- Arrastra con ratón (`data-rbd-draggable-id` → `data-rbd-droppable-id="1"`) por compatibilidad con react-beautiful-dnd.
- Valida **PUT** registrado en el mock (`window.__e2eHiringState`):
  - **URL lógica:** `PUT /candidates/1` (sin `/stage`)
  - **Body:** `{ "applicationId": 2, "currentInterviewStep": 2 }`
  - **Estado:** HTTP 200
- La tarjeta queda visible solo en **Technical Interview** (estado local tras `onDragEnd`).

##### Uso rápido Playwright (copiar al chat)

```
Ejecuta los E2E de position pipeline según prompts/prompts-ABR.md:
cd AI4Devs-qa-202602-Seniors/frontend && npm run test:e2e
Archivos: e2e/position-pipeline.spec.ts, e2e/helpers/mockHiringApi.ts
Fases: Initial Screening, Technical Interview (positionId=2)
```

---

### Catálogo frontend E2E — 2 tests (1 suite)

| Test | Qué valida |
|------|------------|
| Escenario 1: carga la pantalla… | Título, columnas por fase, candidato en columna correcta |
| Escenario 2: arrastra candidato… | DnD (mouse) + PUT vía mock `fetch` + tarjeta en columna destino |

---

### Endpoints cubiertos por tests E2E

| Método | Ruta | Playwright (mock `fetch`) |
|--------|------|---------------------------|
| `GET` | `/positions/:id/interviewFlow` | Sí (escenario 1) |
| `GET` | `/positions/:id/candidates` | Sí (mock stateful) |
| `PUT` | `/candidates/:id` | Sí (escenario 2, mock `fetch`) |

**No cubierto por E2E:** `GET /positions` (listado), `POST /candidates`, backend real sin mock.

---

### Resumen

| Métrica | Valor |
|---------|-------|
| Tests E2E Playwright | **2** |
| Suite | `e2e/position-pipeline.spec.ts` |
| BD en E2E | No requerida (mock `fetch`) |

**Ejecutar E2E:**

```bash
cd AI4Devs-qa-202602-Seniors/frontend
npm install
npx playwright install
npm run test:e2e
```

---

### Resultado de ejecución e informe HTML (`playwright show-report`)

Última verificación documentada: **2026-05-17** — entorno local, Windows, Node con Playwright 1.60.

#### Comandos

```bash
cd AI4Devs-qa-202602-Seniors/frontend
npm run test:e2e
# o, si ya corriste los tests y existe playwright-report/:
npx playwright show-report
```

`show-report` **no imprime el detalle de cada test en consola**; abre (o indica la URL de) el informe HTML generado en `frontend/playwright-report/`.

#### Salida de `npm run test:e2e` (reporter list + html)

```
Running 2 tests using 2 workers

  ok 1 [chromium] › e2e\position-pipeline.spec.ts › Position pipeline (Kanban) › Escenario 1: carga la pantalla de position con título, fases y candidatos (1.5s)
  ok 2 [chromium] › e2e\position-pipeline.spec.ts › Position pipeline (Kanban) › Escenario 2: arrastra candidato a otra fase y persiste con PUT al backend (2.4s)

  2 passed (4.0s)
```

#### Salida de `npx playwright show-report`

```
Serving HTML report at http://localhost:9323. Press Ctrl+C to quit.
```

Abrir esa URL en el navegador para ver el informe interactivo (árbol de suites, tiempos, trazas si hubo reintentos, capturas en fallo).

#### Resumen del informe (estado global)

| Campo | Valor |
|-------|-------|
| **Estado** | passed |
| **Total tests** | 2 |
| **Passed** | 2 |
| **Failed** | 0 |
| **Skipped** | 0 |
| **Proyecto** | chromium |
| **Duración total** | ~4,0–4,3 s |
| **Carpeta del informe** | `frontend/playwright-report/index.html` |
| **Metadatos última corrida** | `frontend/test-results/.last-run.json` → `{ "status": "passed", "failedTests": [] }` |

#### Detalle por test (informe HTML)

| # | Test | Duración aprox. | Resultado |
|---|------|-----------------|-----------|
| 1 | `Escenario 1: carga la pantalla de position con título, fases y candidatos` | 1,5 s | passed |
| 2 | `Escenario 2: arrastra candidato a otra fase y persiste con PUT al backend` | 2,4 s | passed |

**Escenario 1** — Comprueba título `Data Scientist`, columnas **Initial Screening** y **Technical Interview**, y candidato **John Doe** solo en la primera columna.

**Escenario 2** — Comprueba drag entre columnas (react-beautiful-dnd), body del PUT `{ applicationId: 2, currentInterviewStep: 2 }` vía mock `fetch`, respuesta 200 y tarjeta en **Technical Interview**.

#### Notas sobre el informe

- El reporter `html` está configurado en `playwright.config.ts`; cada ejecución de `playwright test` regenera `playwright-report/`.
- `playwright-report/` y `test-results/` están en `.gitignore` (artefactos locales/CI).
- En CI, el workflow suba el artefacto `playwright-report` (ver `frontend/.github/workflows/playwright.yml`).
- Si el puerto **9323** está ocupado, `show-report` puede usar otro puerto; la consola mostrará la URL efectiva.

---

*Nota:* Paridad con `AI4Devs-frontend-202602-Seniors`: mismo enfoque Playwright + mocks HTTP; en QA las rutas son `/positions/:id`, el PUT es `/candidates/:id` y el DnD usa react-beautiful-dnd.
