# Prompts utilizados - Módulo 11 E2E Playwright

## Contexto

Ejercicio del programa **AI4Devs (Módulo 11)**: implementar pruebas End-to-End con **Playwright** sobre el tablero Kanban de **Position** (`/positions/:id`) en el repositorio `AI4Devs-qa-202602-Seniors`.

Stack relevante: React (CRA) en frontend (`localhost:3000`), API Express + Prisma en backend (`localhost:3010`), PostgreSQL vía Docker Compose, drag & drop con `react-beautiful-dnd`.

El trabajo se realizó con asistencia de IA en **Cursor**, siguiendo el plan documentado en `docs/module-11-e2e-playwright-plan.md`, por fases (0–4), sin sustituir el drag visual por llamadas directas a la API.

---

## Prompt 1 - Análisis inicial y plan

**Goal**  
Analizar el repositorio sin implementar cambios funcionales y producir un plan E2E completo.

**Prompt summary**  
Actuar como Senior QA Automation Engineer; entender arquitectura, arranque, feature Position, endpoint `PUT /candidates/:id`, estado de Playwright y tests previos; detectar riesgos de drag & drop; crear `docs/module-11-e2e-playwright-plan.md` con objetivo, alcance, stack, escenarios Given/When/Then, fases, validación y notas IA-first. Sin instalar dependencias ni modificar código funcional.

**Output summary**  
Documento de plan con: rutas reales (`/positions/:id`), discrepancia `interviewFlow` vs `interviewflow`, ausencia de Playwright, tests Jest solo en backend, riesgos de RBD y falta de `data-testid`, plan por fases y commits previstos.

**Files impacted**  
- `docs/module-11-e2e-playwright-plan.md` (creado)

**Validation**  
Revisión manual del árbol del repo y de archivos clave (`PositionDetails.js`, `candidateRoutes.ts`, `package.json`). Sin ejecución de tests en esta fase.

---

## Prompt 2 - Preparación UI testeable

**Goal**  
Ejecutar Fase 0–1: alinear la API de interview flow y añadir `data-testid` mínimos para Playwright.

**Prompt summary**  
Corregir discrepancia frontend/backend en la ruta de interview flow; añadir `data-testid` en Kanban (`kanban-board`, `position-title`, `phase-column-{slug}`, `candidate-card-{id}`) con slug kebab-case; sin Playwright, sin tests, sin cambios de estilos ni backend si no es necesario.

**Output summary**  
- Frontend: `interviewFlow` → `interviewflow` en `PositionDetails.js`.  
- `data-testid` en título, contenedor Kanban, columnas y tarjetas.  
- Helper `toPhaseSlug` en `StageColumn.js`.  
- Diff de revisión en `docs/module-11-phase-0-1.diff.txt`.

**Files impacted**  
- `frontend/src/components/PositionDetails.js`  
- `frontend/src/components/StageColumn.js`  
- `frontend/src/components/CandidateCard.js`  
- `docs/module-11-phase-0-1.diff.txt`

**Validation**  
Comandos de validación manual documentados (curl a `/positions/1/interviewflow`, comprobación de `data-testid` en DevTools). Sin ejecución Playwright en esta fase.

---

## Prompt 3 - Revisión gestor de paquetes e instalación Playwright

**Goal**  
Confirmar gestor de paquetes antes de instalar Playwright; luego implementar solo Fase 2 (infraestructura E2E).

**Prompt summary (gestor)**  
Revisar `package-lock.json`, ausencia de `yarn.lock`/`pnpm-lock.yaml`, `frontend/package.json`, `backend/package.json` y `README.md`; recomendar comando de instalación y riesgos de lockfiles inconsistentes.

**Prompt summary (Fase 2)**  
Instalar `@playwright/test` con npm en `/frontend`, `npx playwright install`, crear `playwright.config.ts`, scripts `test:e2e*`, carpeta `tests/e2e`, ejecutar `npm audit` sin `npm audit fix --force`.

**Output summary**  
- Gestor: **npm** con `package-lock.json` en frontend y backend (lockfileVersion 3).  
- Playwright 1.60.0, config con `testDir`, `baseURL`, trace/screenshot/video, chromium, retries 1/2.  
- `npm audit`: 60 vulnerabilidades (mayoría stack CRA preexistente).

**Files impacted**  
- `frontend/package.json`  
- `frontend/package-lock.json`  
- `frontend/playwright.config.ts`  
- `frontend/tests/e2e/.gitkeep`  
- `docs/module-11-phase-2.diff.txt`

**Validation**  
- `npm install -D @playwright/test`  
- `npx playwright install chromium`  
- `npx playwright test --list` → 0 tests (carpeta vacía, esperado)  
- `npm audit` → 60 vulnerabilities (14 low, 14 moderate, 31 high, 1 critical); **no** se ejecutó `npm audit fix --force`

---

## Prompt 4 - Escenario E2E carga Position

**Goal**  
Fase 3: primer test E2E de carga del tablero Kanban.

**Prompt summary**  
Crear `frontend/tests/e2e/position.spec.ts` con Given/When/Then; navegar a `/positions/1`; validar título, `kanban-board`, tres columnas y Carlos García en Initial Screening; `waitForResponse` sin `waitForTimeout`; sin drag ni nuevas dependencias.

**Output summary**  
Test `muestra título, tablero, columnas y candidatos según seed` con constantes de seed y sincronización por respuestas HTTP de `interviewflow` y `candidates`.

**Files impacted**  
- `frontend/tests/e2e/position.spec.ts` (creado)  
- `frontend/tests/e2e/.gitkeep` (eliminado al añadir el spec)

**Validation**  
- `npx playwright test tests/e2e/position.spec.ts --list` → 1 test detectado  
- Ejecución completa del archivo en validación final (ver sección **Validación final**)

---

## Prompt 5 - Análisis drag & drop react-beautiful-dnd

**Goal**  
Analizar cómo automatizar el drag con Playwright **sin implementar** el test aún.

**Prompt summary**  
Revisar `PositionDetails.js`, `StageColumn.js`, `CandidateCard.js`; DOM de RBD, riesgos de `dragTo()`, necesidad de `mouse` manual, `data-testid` opcionales y propuesta de estructura del test de cambio de fase.

**Output summary**  
Informe con estrategia híbrida (dragTo + fallback mouse + assert PUT + DOM), riesgos (no HTML5 DnD, click vs drag, `droppableId` por índice), cambios UI opcionales (`phase-column-*-body`) y esqueleto de `position-drag` / helper `kanbanDrag.ts`.

**Files impacted**  
Ninguno (solo análisis).

**Validation**  
Revisión de código fuente y de atributos `data-rbd-*` en `node_modules/react-beautiful-dnd`. Sin ejecución de tests.

---

## Prompt 6 - Escenario E2E cambio de fase + PUT

**Goal**  
Fase 4: test de drag entre columnas con validación visual y de backend.

**Prompt summary**  
Añadir segundo test (o helper): Carlos García (`candidate-card-3`) de `phase-column-initial-screening` a `phase-column-technical-interview`; `waitForResponse` PUT `/candidates/3`; validar body (`applicationId`, `currentInterviewStep` desde interviewflow); helper con `dragTo` y fallback `mouse`; sin llamada API directa.

**Output summary**  
- `frontend/tests/e2e/helpers/kanbanDrag.ts`  
- Segundo `describe` en `position.spec.ts`  
- IDs de step y `applicationId` leídos de respuestas API (no hardcodeados)

**Files impacted**  
- `frontend/tests/e2e/position.spec.ts`  
- `frontend/tests/e2e/helpers/kanbanDrag.ts`

**Validation**  
- `npx playwright test tests/e2e/position.spec.ts --list` → 2 tests  
- Test de drag validado en ejecución headed (ver **Validación final**)

---

## Prompt 7 - Correcciones y estabilización

**Goal**  
Corregir fallos del drag: selector ambiguo, drop en columna origen (`currentInterviewStep: 1` en lugar de `2`), estabilizar trayectoria del ratón.

**Prompt summary (iteraciones)**  
1. Corregir selector `.card-body` que resolvía múltiples elementos → `:scope > .card-body`.  
2. Añadir `data-testid` `phase-column-{slug}-body` en `StageColumn.js` y target `${columnTestId}-body`; drop en centro del body.  
3. Revisión de duplicados en archivos.  
4. Hacer **mouse manual** estrategia principal; punto destino `y + 30`; waypoint intermedio entre columnas; `dragTo` como fallback.  
5. Generar `docs/module-11-phase-4.diff.txt`.

**Output summary**  
- `StageColumn.js`: `phase-column-{slug}-body` en `Card.Body`.  
- `kanbanDrag.ts`: `dragWithMouse` primero (origen → activación → punto intermedio fuera de columna origen → destino superior); `dragTo` en `catch`.  
- Diffs de revisión en `docs/module-11-phase-0-1.diff.txt` y `docs/module-11-phase-4.diff.txt`.

**Files impacted**  
- `frontend/src/components/StageColumn.js`  
- `frontend/tests/e2e/helpers/kanbanDrag.ts`  
- `docs/module-11-phase-4.diff.txt`

**Validation**  
- Revisión estática: un solo `Card.Body`, un `targetBody`, un `targetPosition`, un `endY`.  
- Test de drag en validación final con `--headed`.

---

## Validación final

**Entorno**  
- PostgreSQL: `docker compose up -d`  
- Backend: `npm run dev` (puerto 3010)  
- Frontend: `npm start` (puerto 3000)  

**Incidencia seed (constraint unique)**  
Al reejecutar `npx ts-node prisma/seed.ts` sobre una base ya poblada, Prisma puede fallar por restricción **unique** (p. ej. email de candidato duplicado).  
**Resolución aplicada:** no resetear la BD; reutilizar **datos ya cargados** del seed inicial y ejecutar los E2E contra `positionId=1` con candidato Carlos García (`candidateId=3`) en Initial Screening.

**Comandos ejecutados y resultado**

```bash
cd frontend
npx playwright test tests/e2e/position.spec.ts
# => 1 passed

npx playwright test tests/e2e/position.spec.ts -g "mueve candidato entre columnas" --headed
# => 1 passed

```

**Nota sobre auditoría de dependencias**  
Tras instalar Playwright, `npm audit` reportó **60 vulnerabilidades** (incl. dependencias transitivas de `react-scripts`/CRA). Se documentó el hallazgo y **no** se ejecutó `npm audit fix --force` para evitar cambios breaking en el stack CRA.

---

## Decisiones humanas

- Usar **npm** exclusivamente en `frontend/` y versionar `package-lock.json` (no yarn/pnpm).  
- Alinear la ruta del frontend a **`/interviewflow`** (minúsculas) sin modificar el backend.  
- Introducir `data-testid` en Fase 0–1 y, tras el análisis de drag, añadir **`phase-column-{slug}-body`** por ser necesario para un drop estable.  
- Mantener el drag como **gesto visual real**; la validación de contrato se hace con `waitForResponse` del PUT, no sustituyendo por `fetch` desde el test.  
- Priorizar **`dragWithMouse`** con waypoint intermedio frente a `dragTo` por comportamiento de `react-beautiful-dnd` (drop erróneo en columna origen con `currentInterviewStep: 1`).  
- Obtener `currentInterviewStep` y `applicationId` desde respuestas de **`/interviewflow`** y **`/candidates`**, no desde IDs mágicos fijos.  
- No ejecutar **`npm audit fix --force`** ante vulnerabilidades preexistentes del CRA.  
- Reutilizar datos seed ya cargados ante fallo de re-seed por constraint unique.  
- Revisar diffs (`docs/module-11-phase-*.diff.txt`) antes de commit, sin commits automáticos por parte de la IA.
