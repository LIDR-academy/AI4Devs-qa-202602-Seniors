# Módulo 11 — Plan E2E Playwright (Position / Kanban)

> Análisis de repositorio **sin implementación funcional**. Rama detectada: `module-11-playwright-position-e2e`.  
> Fecha de análisis: 2026-05-16.

---

## Objetivo del ejercicio

Implementar pruebas **End-to-End con Playwright** sobre el tablero Kanban de una posición de contratación, validando:

1. **Carga correcta** de la vista de proceso (`/positions/:id`): título, columnas de fases y candidatos en la columna esperada.
2. **Drag & drop** de un candidato entre columnas.
3. **Persistencia en backend** mediante `PUT /candidates/:id` con `applicationId` y `currentInterviewStep` (ID numérico del paso destino).

El ejercicio es **IA-first**: se documentan prompts en `/prompts/prompts-[iniciales].md` y se iteran pruebas con asistencia de Cursor/IA.

---

## Alcance

| Incluido | Excluido (fase actual) |
|----------|-------------------------|
| Vista Kanban `PositionDetails` (`/positions/:id`) | CRUD completo de posiciones |
| Listado `/positions` como navegación previa | `AddCandidateForm`, upload de CV |
| `PUT /candidates/:id` (cambio de fase) | Tests de contrato OpenAPI automatizados |
| Atributos `data-testid` en UI (pendiente) | Instalación de dependencias (solo planificado) |
| Config Playwright + `tests/e2e/position.spec.ts` | Refactor de `react-beautiful-dnd` |

---

## Stack detectado

| Capa | Tecnología | Versión / notas |
|------|------------|-----------------|
| **Frontend** | React 18 + Create React App (`react-scripts`) | Puerto **3000** |
| **Routing** | `react-router-dom` v6 | Rutas en `App.js` |
| **UI** | Bootstrap 5 + `react-bootstrap` | |
| **Drag & drop** | `react-beautiful-dnd` | Usado en Kanban; `react-dnd` está en `package.json` pero **no** se usa en Position |
| **Backend** | Node.js + **Express** + **TypeScript** | Puerto **3010** |
| **ORM** | **Prisma** + PostgreSQL | `backend/prisma/schema.prisma` |
| **BD local** | Docker Compose (`postgres`) | `.env` en raíz y `backend/.env` |
| **Tests backend** | **Jest** + `ts-jest` | 4 archivos `*.test.ts` |
| **Tests frontend** | Jest (CRA) referenciado en `package.json` | **Sin** `jest.config.js` ni specs en repo |
| **Tests E2E** | **Playwright** | **No instalado** (solo documentado en `README.md`) |
| **API contract** | `backend/api-spec.yaml` (OpenAPI) | Define `PUT /candidates/{id}` |

---

## Estructura del proyecto

```
AI4Devs-qa-202602-Seniors/
├── docker-compose.yml          # PostgreSQL
├── .env                        # DB_* + DATABASE_URL
├── package.json                # Prisma schema path (raíz)
├── README.md                   # Guía del ejercicio E2E
├── docs/
│   └── module-11-e2e-playwright-plan.md   # Este documento
├── frontend/
│   ├── src/
│   │   ├── App.js              # Rutas
│   │   ├── components/
│   │   │   ├── Positions.tsx           # Listado /positions
│   │   │   ├── PositionDetails.js      # Kanban /positions/:id  ★
│   │   │   ├── StageColumn.js          # Columna droppable
│   │   │   └── CandidateCard.js        # Tarjeta draggable
│   │   └── services/candidateService.js
│   └── package.json            # Sin @playwright/test
├── backend/
│   ├── src/
│   │   ├── index.ts            # Express app, CORS, puerto 3010
│   │   ├── routes/
│   │   │   ├── candidateRoutes.ts      # PUT /:id ★
│   │   │   └── positionRoutes.ts
│   │   ├── presentation/controllers/
│   │   └── application/services/
│   └── prisma/
│       ├── schema.prisma
│       ├── seed.ts             # Datos demo
│       └── migrations/
└── prompts/                    # No existe aún (entrega ejercicio)
```

**Arquitectura:** monorepo ligero con frontend SPA (CRA) y API REST en capas (routes → controllers → services → modelos Prisma). Sin BFF: el frontend llama directamente a `http://localhost:3010`.

---

## Cómo arrancar frontend y backend

> Comandos de referencia para desarrollo local. **No ejecutar `npm install` en esta fase de análisis** si el usuario lo restringió; se documentan para la fase de implementación.

### 1. Base de datos (PostgreSQL)

```bash
# Desde la raíz del repo
docker compose up -d
```

Variables en `.env`: `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` (5432), `DATABASE_URL`.

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy    # o: npx prisma db push
npx ts-node prisma/seed.ts   # datos demo (no hay script "seed" en package.json)
npm run dev                  # ts-node-dev → http://localhost:3010
```

Health check: `GET http://localhost:3010/` → `"Hola LTI!"`.

### 3. Frontend

```bash
cd frontend
npm install
npm start                    # http://localhost:3000
```

**Flujo manual hacia el Kanban:**

1. `http://localhost:3000/` → Dashboard → **Ir a Posiciones**
2. `http://localhost:3000/positions` → **Ver proceso** en una tarjeta
3. `http://localhost:3000/positions/:id` → tablero Kanban

---

## Ubicación de Position

| Concepto | Ubicación | Ruta UI |
|----------|-----------|---------|
| Listado de posiciones | `frontend/src/components/Positions.tsx` | `/positions` |
| **Tablero Kanban (feature principal)** | `frontend/src/components/PositionDetails.js` | `/positions/:id` |
| Columnas | `frontend/src/components/StageColumn.js` | — |
| Tarjetas candidato | `frontend/src/components/CandidateCard.js` | — |
| Registro de rutas | `frontend/src/App.js` | `Route path="/positions/:id"` |

**Nota:** El README del ejercicio habla de `/position`; en este repo la ruta real es **`/positions/:id`** (plural).

### APIs consumidas por `PositionDetails`

| Método | URL (frontend) | URL (backend registrada) |
|--------|----------------|---------------------------|
| GET | `/positions/:id/interviewFlow` | `/positions/:id/interviewflow` ⚠️ |
| GET | `/positions/:id/candidates` | `/positions/:id/candidates` ✓ |
| PUT | `/candidates/:candidateId` | `/candidates/:id` ✓ |

**Discrepancia crítica:** el frontend usa `interviewFlow` (camelCase) y la ruta Express es `interviewflow` (minúsculas). En Express las rutas son **case-sensitive** → riesgo de **404** y Kanban vacío hasta corregir alineación.

### Datos seed relevantes (posición id `1` tras seed limpio)

- **Posición:** `Senior Full-Stack Engineer`
- **Pasos:** `Initial Screening`, `Technical Interview`, `Manager Interview`
- **Candidatos en posición 1:** John Doe, Jane Smith (fase `Technical Interview`), Carlos García (`Initial Screening`) — útil para drag desde primera columna.

---

## Endpoint de cambio de fase

| Item | Detalle |
|------|---------|
| **Método y path** | `PUT /candidates/:id` |
| **Router** | `backend/src/routes/candidateRoutes.ts` → `updateCandidateStageController` |
| **Controller** | `backend/src/presentation/controllers/candidateController.ts` |
| **Service** | `updateCandidateStage` en `candidateService.ts` |
| **Body** | `{ "applicationId": number, "currentInterviewStep": number }` |
| **Respuesta 200** | `{ message, data }` con application actualizada |
| **OpenAPI** | `backend/api-spec.yaml` → `/candidates/{id}` PUT |

**Llamada desde el frontend** (`PositionDetails.js`):

```javascript
PUT http://localhost:3010/candidates/${candidateId}
Body: { applicationId, currentInterviewStep: destStageId }
```

`destStageId` es el `id` numérico del `InterviewStep` de la columna destino (no el nombre de la fase).

**Tests unitarios existentes:** `candidateController.test.ts`, `candidateService.test.ts` (mock de servicio; no E2E).

---

## Playwright y tests previos

| Elemento | Estado |
|----------|--------|
| `@playwright/test` en `frontend/package.json` | ❌ No presente |
| `playwright.config.ts` | ❌ No existe |
| `frontend/tests/e2e/` | ❌ No existe |
| `data-testid` en componentes | ❌ Solo recomendados en `README.md` |
| Tests backend Jest | ✅ 4 archivos |
| Tests frontend | ❌ Script `jest --config jest.config.js` sin `jest.config.js` ni specs |

---

## Estrategia E2E (Playwright 2026)

### Principios

- **Page Object Model ligero:** `pages/PositionKanbanPage.ts` con locators por `data-testid`.
- **Selectores:** prioridad `getByTestId` > `getByRole` > texto; evitar CSS frágil de Bootstrap.
- **Aislamiento:** `baseURL: http://localhost:3000`; API en `3010` vía `request` fixture o `page.waitForResponse`.
- **Estabilidad:** `await expect(locator).toBeVisible()`; evitar `waitForTimeout` fijos.
- **Validación doble:** UI (tarjeta en columna destino) + **network** (`page.waitForResponse` / `expect(request).toBeOK()`).
- **Datos:** usar seed conocido (`positionId=1`, candidato Carlos García en primera columna) o fixture API en `globalSetup` (fase 2).
- **CI:** `retries: 2` en CI, `trace: on-first-retry`, `screenshot: only-on-failure`, `video: retain-on-failure`.

### Configuración prevista (`frontend/playwright.config.ts`)

- `testDir: './tests/e2e'`
- `webServer`: levantar frontend (`npm start`) y opcionalmente script que verifique backend + DB
- `use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' }`
- Proyecto `chromium` como default; `firefox`/`webkit` opcional en CI

### Drag & drop con `react-beautiful-dnd`

Estrategia recomendada (orden de intento):

1. **`locator.dragTo(target, { sourcePosition, targetPosition })`** con offsets en centro de tarjeta y columna.
2. Si falla: **secuencia manual** `mouse.move` → `mouse.down` → `mouse.move` (steps) → `mouse.up` vía `page.mouse`.
3. **Último recurso documentado:** validar PUT con `page.route` / `waitForResponse` tras interacción híbrida, o exponer atributo `data-testid` + `force: true` solo si la librería lo permite.

No depender de `@testing-library/user-event` en E2E; Playwright controla el navegador real.

### Intercepción de red (escenario 2)

```typescript
const putPromise = page.waitForResponse(
  (res) =>
    res.url().includes('/candidates/') &&
    res.request().method() === 'PUT' &&
    res.status() === 200
);
// ... drag ...
const response = await putPromise;
const body = await response.request().postDataJSON();
// expect(body.currentInterviewStep).toBe(expectedStepId);
```

---

## Escenarios Given / When / Then

### Escenario 1 — Carga del tablero Position

```gherkin
Given el backend está disponible con datos seed en la posición "Senior Full-Stack Engineer" (id=1)
  And el frontend está en http://localhost:3000
When el usuario navega a "/positions/1"
Then se muestra el título de la posición "Senior Full-Stack Engineer"
  And existen columnas visibles para cada fase del interview flow
  And al menos un candidato aparece en la columna cuya cabecera coincide con su fase actual
```

**Assertions Playwright sugeridas:**

- `getByRole('heading', { name: 'Senior Full-Stack Engineer' })`
- `getByTestId('phase-column-initial-screening')` (tras añadir testids)
- Tarjeta `getByTestId('candidate-card-3')` visible en columna esperada

### Escenario 2 — Cambio de fase por drag & drop

```gherkin
Given el usuario está en "/positions/1"
  And el candidato "Carlos García" está en la columna "Initial Screening"
When arrastra la tarjeta del candidato a la columna "Technical Interview"
Then la tarjeta es visible en la columna destino
  And se envía PUT a "/candidates/3" con body:
    | campo                  | valor                    |
    | applicationId          | id de aplicación seed    |
    | currentInterviewStep   | id del step destino      |
  And la respuesta HTTP es 200
```

### Escenario 3 — Navegación desde listado (smoke)

```gherkin
Given el usuario está en "/positions"
When hace clic en "Ver proceso" de la primera posición
Then la URL coincide con "/positions/:id"
  And se carga el tablero Kanban
```

---

## Riesgos detectados

| # | Riesgo | Impacto E2E | Mitigación |
|---|--------|-------------|------------|
| 1 | **URL `interviewFlow` vs `interviewflow`** | Kanban sin columnas / test flaky | Alinear frontend o backend antes de E2E |
| 2 | **`react-beautiful-dnd` deprecado** + eventos custom | `dragTo` nativo puede fallar | Mouse steps, testids en handle, documentar workaround |
| 3 | **Sin `data-testid`** | Selectores frágiles (texto, estructura Bootstrap) | Añadir testids en `PositionDetails`, `StageColumn`, `CandidateCard` |
| 4 | **URLs API hardcodeadas** (`localhost:3010`) | Playwright en CI / otro host | `REACT_APP_API_URL` + `baseURL` / env en config |
| 5 | **Race en `useEffect`** (flow y candidates en paralelo) | Candidatos no aparecen intermitentemente | `waitForResponse` doble o fix de secuencia en app |
| 6 | **Mutación directa de state** en `onDragEnd` (`splice`) | Comportamiento React impredecible | Monitorear; posible fix fuera de scope QA |
| 7 | **CORS** solo `localhost:3000` | Falla si frontend en otro puerto | Mantener puerto 3000 o ampliar CORS en tests |
| 8 | **Dependencia de seed** | IDs cambian si BD no se resetea | `globalSetup` con seed o IDs leídos de API |
| 9 | **`jest.config.js` ausente** en frontend | Confusión con stack de tests | Separar claramente Jest (unit) vs Playwright (e2e) |
| 10 | **Click en tarjeta abre Offcanvas** (`CandidateDetails`) | Puede interferir con drag | Usar drag desde handle o `click: { position: ... }` |
| 11 | **React 18 Strict Mode** | Doble mount con RBD | Desactivar strict en test build o usar retry |
| 12 | **axios en `candidateService.js` sin dependencia explícita** | No bloquea Position E2E | — |

---

## Plan de implementación por fases

### Fase 0 — Pre-requisitos (sin Playwright)

- [ ] Corregir ruta `interviewFlow` / `interviewflow`
- [ ] Verificar manualmente Kanban en `/positions/1`
- [ ] Confirmar seed y Docker DB

### Fase 1 — Instrumentación UI

- [ ] Añadir `data-testid`: `position-title`, `phase-column-{slug}`, `candidate-card-{id}`, `kanban-board`
- [ ] Slug estable derivado de `stage.title` (ej. `initial-screening`)

### Fase 2 — Infraestructura Playwright

- [ ] `npm install -D @playwright/test` en `frontend`
- [ ] `npx playwright install`
- [ ] `playwright.config.ts` con `webServer` y `baseURL`
- [ ] Scripts: `"test:e2e": "playwright test"`, `"test:e2e:ui": "playwright test --ui"`

### Fase 3 — Escenario 1 (carga)

- [ ] `tests/e2e/position.spec.ts` — test de smoke carga columnas y candidatos
- [ ] Page object mínimo

### Fase 4 — Escenario 2 (drag + PUT)

- [ ] Implementar drag con fallback mouse
- [ ] Assert `waitForResponse` PUT + body
- [ ] Assert tarjeta en columna destino

### Fase 5 — Entrega

- [ ] `prompts/prompts-[iniciales].md`
- [ ] Evidencia: `npx playwright test` + report HTML
- [ ] PR según checklist del `README.md`

---

## Estrategia de validación

| Nivel | Qué validar | Herramienta |
|-------|-------------|-------------|
| Local dev | 2 escenarios verdes en `--ui` | Playwright UI Mode |
| Pre-PR | Headless + report | `npx playwright test && npx playwright show-report` |
| Regresión API | PUT sigue cubierto | `cd backend && npm test` |
| Manual exploratorio | Drag real en Chrome | 5 min tras cambios en RBD |
| CI (futuro) | `playwright test` en pipeline con servicios postgres + api + build frontend | GitHub Actions / similar |

**Criterios de aceptación:**

- Ambos escenarios del README pasan de forma repetible (≥3 ejecuciones seguidas).
- No hay `test.only` ni waits arbitrarios > 500 ms sin justificación.
- Selectores ≥ 80 % por `data-testid` en flujo Position.

---

## Commits previstos

Commits pequeños y revisables (mensajes sugeridos):

1. `docs: add module 11 e2e playwright analysis plan`
2. `fix: align interview flow API route with frontend`
3. `feat(frontend): add data-testid hooks for position kanban`
4. `chore(frontend): add playwright config and e2e scripts`
5. `test(e2e): add position page load scenario`
6. `test(e2e): add candidate phase drag and PUT validation`
7. `docs: add AI prompts trace for module 11`

---

## Notas IA-first para trabajar en Cursor

1. **Contexto mínimo en cada prompt:** pegar rutas reales (`/positions/:id`, `PUT /candidates/:id`) y fragmentos de `PositionDetails.js` / `candidateRoutes.ts` para evitar alucinación de `/position`.
2. **Orden recomendado con el agente:**
   - Análisis (este doc) → testids → Playwright config → spec carga → spec drag.
3. **Prompts efectivos (ejemplos):**
   - *"Añade data-testid a StageColumn y CandidateCard sin cambiar estilos; slug de fase en kebab-case."*
   - *"Genera playwright.config.ts con webServer que ejecute npm start en frontend y asuma backend en 3010."*
   - *"Escribe position.spec.ts que espere PUT /candidates/:id con currentInterviewStep numérico tras dragTo entre columnas con react-beautiful-dnd."*
4. **Depuración:** usar `npx playwright test --debug`, `page.pause()`, trace viewer; pedir a la IA que interprete **trace.zip** ante fallos de drag.
5. **Reglas Cursor:** crear regla `.cursor/rules/e2e-playwright.mdc` con: puertos 3000/3010, obligación de `data-testid`, prohibición de `waitForTimeout(5000)`.
6. **Validar siempre código generado:** revisar que no sustituya drag por llamada API directa (eso sería test de integración, no E2E UI) salvo como fallback documentado.
7. **Documentar prompts** en tiempo real en `prompts/prompts-[iniciales].md` (solo lista numerada, sin respuestas).

---

## Referencias rápidas de código

| Artefacto | Archivo |
|-----------|---------|
| Kanban + PUT | `frontend/src/components/PositionDetails.js` |
| Drag UI | `frontend/src/components/StageColumn.js`, `CandidateCard.js` |
| PUT route | `backend/src/routes/candidateRoutes.ts` |
| OpenAPI | `backend/api-spec.yaml` |
| Seed | `backend/prisma/seed.ts` |
| Ejercicio | `README.md` |
