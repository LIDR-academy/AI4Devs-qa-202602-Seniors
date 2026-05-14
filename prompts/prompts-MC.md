# Prompts utilizados — Mateo Costes (MC)

Registro completo de los prompts usados con Claude Code (claude.ai/code) durante el ejercicio de QA con Playwright. Fecha de sesión: 2026-05-14.

---

## 1. Inicialización y análisis del repositorio

**Prompt:**
> `/init`

**Contexto:** Al abrir el proyecto por primera vez, se utilizó el comando `/init` de Claude Code para que el asistente analizara automáticamente la estructura del repositorio y generara un archivo `CLAUDE.md`.

**Qué hizo Claude:**
- Exploró todos los directorios y archivos relevantes del monorepo (`backend/`, `frontend/`, `docker-compose.yml`, `README.md`, `package.json` de cada capa)
- Identificó el stack tecnológico: Node.js + Express + Prisma en el backend, React 18 + TypeScript + `react-beautiful-dnd` en el frontend
- Documentó los comandos de desarrollo (Docker, backend, frontend, Jest, Playwright)
- Mapeó los endpoints clave de la API y los componentes del Kanban
- Generó `CLAUDE.md` en la raíz con toda esa información para futuras sesiones

---

## 2. Registro del historial de prompts

**Prompt:**
> `guarda los prompts en @prompts/prompts-MC.md`

**Contexto:** El README del ejercicio exige documentar todos los prompts utilizados con IA en el archivo `prompts/prompts-[iniciales].md`. Se le indicó a Claude que iniciara ese registro.

**Qué hizo Claude:**
- Leyó el archivo existente `prompts/prompts-MC.md` (estaba vacío)
- Escribió las primeras entradas del historial con el formato estructurado que se mantiene en este documento

---

## 3. Creación de los tests E2E con Playwright

**Prompt:**
> "Lee el README.md y la estructura del proyecto, luego crea los tests E2E con Playwright para los dos escenarios que te voy a describir.
>
> **Escenario 1: Carga de la página de Position**
> Crear una prueba que valide que la pantalla de position carga correctamente. La prueba debe verificar:
> - Que el título de la posición se muestra correctamente.
> - Que se muestran las columnas correspondientes a cada fase del proceso de contratación.
> - Que las tarjetas de los candidatos se muestran en la columna correcta según su fase actual.
>
> **Escenario 2: Cambio de fase de un candidato**
> Crear una prueba que simule el movimiento de un candidato de una fase a otra. La prueba debe verificar:
> - Que se puede arrastrar una tarjeta de candidato desde una columna hacia otra.
> - Que la tarjeta del candidato aparece visualmente en la nueva columna.
> - Que la fase del candidato se actualiza correctamente en el backend mediante el endpoint PUT /candidate/:id.
> - Que se dispara una petición PUT, el id del candidato es correcto, el body contiene la nueva fase y la respuesta del backend es exitosa."

**Contexto:** Prompt principal del ejercicio. Se le proporcionaron todos los criterios de aceptación para los dos escenarios.

**Qué analizó Claude antes de escribir código:**
- Leyó `README.md` completo para entender los entregables y convenciones del ejercicio
- Leyó `PositionDetails.js` para entender el flujo de datos: dos `fetch` al cargar (interviewFlow + candidates), y `onDragEnd` que llama a `PUT /candidates/:id`
- Leyó `StageColumn.js` para ver que el `droppableId` es el índice numérico de la columna
- Leyó `CandidateCard.js` para ver que `draggableId` es `candidate.id` (string del candidateId)
- Leyó `playwright.config.ts` para entender la configuración existente (`baseURL` comentado, `testDir: './tests'`)

**Decisiones técnicas tomadas:**

| Decisión | Razón |
|---|---|
| Añadir `data-testid` a los tres componentes | Selectores estables, no acoplados a clases CSS ni texto visible |
| Slug para `stage-column-{título}` | Permite localizar columnas por nombre de fase, legible y consistente con el componente |
| Mockear los endpoints GET | Datos deterministas: los tests no dependen del estado de la base de datos |
| Interceptar el PUT con `waitForRequest` | Valida el payload (applicationId + currentInterviewStep) sin depender de efectos secundarios en DB |
| Drag via teclado (`Space` + `ArrowRight`) | `react-beautiful-dnd` implementa accesibilidad por teclado de forma nativa; es más fiable en tests automatizados que `page.dragAndDrop()` o simulación de ratón con `page.mouse` |
| Solo Chromium en `playwright.config.ts` | El comportamiento de drag & drop varía entre navegadores; Chromium es suficiente para validar la lógica |

**Archivos modificados o creados:**
- `frontend/src/components/PositionDetails.js` → `data-testid="position-title"` en el `<h2>`
- `frontend/src/components/StageColumn.js` → `data-testid="stage-column-{slug}"` en el `<Card>`
- `frontend/src/components/CandidateCard.js` → `data-testid="candidate-card-{id}"` en el `<Card>`
- `frontend/playwright.config.ts` → `baseURL` habilitado, reducido a Chromium
- `frontend/tests/e2e/position.spec.ts` → 6 tests organizados en 2 `describe` blocks

**Estructura del spec generado:**
```
Escenario 1: La página de Position carga correctamente
  ✅ muestra el título de la posición
  ✅ muestra todas las columnas del proceso de contratación
  ✅ muestra cada candidato en la columna correcta según su fase

Escenario 2: Cambio de fase de un candidato mediante drag & drop
  ✅ la tarjeta del candidato aparece visualmente en la nueva columna
  ✅ se dispara un PUT /candidates/:id con el id correcto y la nueva fase en el body
  ✅ la respuesta del backend al PUT es exitosa (2xx)
```

---
## 4. Resultado de la ejecución

**Salida del terminal:**
> `Running 6 tests using 6 workers`
> `6 passed (4.3s)`

Los 6 tests pasaron en la primera ejecución sin necesidad de ajustes adicionales.

---
