# Prompts utilizados — GFS

**Práctica 11 — AI4Devs · Pruebas E2E con Playwright sobre la interfaz `position`**
**Cohorte:** 202602-Seniors
**Herramienta IA:** Windsurf (Cascade) con modelo Claude Sonnet
**Asistencia de planning:** Claude Opus (chat web) para diseño de la secuencia de prompts y validación cruzada de resultados

---

## Secuencia de prompts

Listado en orden cronológico. Cada prompt fue pegado en Cascade dentro de Windsurf. Después de cada uno se validó el output antes de continuar.

## Prompt 1 — Contexto y exploración inicial

Análisis del proyecto antes de tocar código: leer README, identificar componentes clave (`PositionDetails.js`, `StageColumn.js`, `CandidateCard.js`), confirmar puertos (frontend 3000, backend 3010) y verificar el endpoint REAL implementado (`PUT /candidates/:id`, plural — el enunciado lo cita en singular).

```
pruebas E2E con Playwright sobre la interfaz `position` de un sistema de gestión de candidatos.

Antes de tocar nada quiero que entiendas el proyecto. Por favor:

1. Lee el README de la raíz del repo.
2. Lee los siguientes archivos del frontend y dime, en máximo 6 líneas cada uno, qué hace, qué endpoints llama y qué selectores estables hay disponibles para test:
   - frontend/src/App.js
   - frontend/src/components/PositionDetails.js
   - frontend/src/components/StageColumn.js
   - frontend/src/components/CandidateCard.js
3. Confirma en qué puerto corre el frontend y en cuál el backend.
4. Dime exactamente qué endpoint, método y body se dispara cuando se mueve un candidato de una columna a otra. Quiero el path real implementado, no el del enunciado.

No modifiques nada todavía. Solo análisis.
```

## Prompt 2 — Añadir `data-testid` al frontend

Cambios mínimos en 3 componentes para tener selectores estables sin romper los `provided.*` de `react-beautiful-dnd`.

```
Necesito selectores estables `data-testid` para los tests E2E con Playwright. Modifica solo lo imprescindible (no toques lógica de negocio ni cambies clases CSS) en estos tres archivos:

1. `frontend/src/components/PositionDetails.js` 
   - Al `<h2>` del título de la posición añade `data-testid="position-title"`.

2. `frontend/src/components/StageColumn.js` 
   - Al `<Card>` raíz de la columna añade:
     - `data-testid="stage-column"` 
     - `data-stage-name={stage.title}` 
   - Al `<Card.Header>` añade `data-testid="stage-column-header"`.

3. `frontend/src/components/CandidateCard.js` 
   - Al `<Card>` raíz de la tarjeta añade:
     - `data-testid="candidate-card"` 
     - `data-candidate-id={candidate.id}` 
     - `data-candidate-name={candidate.name}` 

Requisitos:
- Respeta la indentación existente del archivo (4 espacios).
- No toques los `{...provided.draggableProps}`, `{...provided.dragHandleProps}`, `{...provided.droppableProps}` ni `ref={provided.innerRef}` — son críticos para `react-beautiful-dnd`.
- Devuelve un diff resumido de los 3 archivos.
```

## Prompt 3 — Instalar y configurar Playwright

Instalación de `@playwright/test` + Chromium, creación de `playwright.config.ts`, scripts npm y entradas en `.gitignore`.

```
Configura Playwright en la carpeta `frontend/`. Pasos:

1. Instala las dependencias dev (sin lanzar `npx playwright init`, que genera archivos extra que no quiero):
   - `@playwright/test` 
   - Después: `npx playwright install chromium` (solo chromium, no hace falta firefox/webkit para esta práctica)

2. Crea `frontend/playwright.config.ts` con esta configuración:
   - testDir: `./tests/e2e` 
   - timeout por test: 45 segundos (drag-and-drop de react-beautiful-dnd necesita margen)
   - retries: 0 en local, 2 en CI
   - reporter: `[['html', { open: 'never' }], ['list']]` 
   - use:
     - baseURL: `http://localhost:3000` 
     - trace: `'on-first-retry'` 
     - video: `'retain-on-failure'` 
     - screenshot: `'only-on-failure'` 
   - projects: solo chromium con `devices['Desktop Chrome']` 
   - SIN `webServer` (el alumno arranca el front y el back manualmente; déjalo comentado con explicación).

3. Añade a `.gitignore` de la raíz del repo (si no existen) estas líneas:
   /frontend/test-results/
   /frontend/playwright-report/
   /frontend/playwright/.cache/
   /frontend/blob-report/

4. En `frontend/package.json` añade los siguientes scripts (sin tocar los existentes):
   - `"test:e2e": "playwright test"` 
   - `"test:e2e:ui": "playwright test --ui"` 
   - `"test:e2e:headed": "playwright test --headed"` 
   - `"test:e2e:report": "playwright show-report"` 

Comprueba al final que `npx playwright --version` responde sin error y muéstrame la versión instalada.
```

## Prompt 4 — Test del Escenario 1: carga de la página

Mocks con `page.route()` para `GET /positions/:id/interviewFlow` y `GET /positions/:id/candidates`. Verificación de título, columnas y candidatos por fase. Patrón Given/When/Then en comentarios.

```
Crea el archivo `frontend/tests/e2e/position.spec.ts` con el primer escenario. Reglas obligatorias:

**Estrategia general**
- Los tests NO dependen del estado real de la base de datos. Mockea los endpoints HTTP con `page.route()` antes de navegar.
- Usa selectores accesibles: `getByTestId`, `getByRole`, `getByText`. Nada de `nth-child` ni selectores CSS frágiles.
- Estructura tipo Given / When / Then en comentarios dentro de cada test para que un PM pueda leer la intención.

**Datos mock que debe servir el test**
- `GET http://localhost:3010/positions/1/interviewFlow` responde con:
```json
  {
    "interviewFlow": {
      "positionName": "Senior Full-Stack Engineer",
      "interviewFlow": {
        "id": 1,
        "description": "Standard development interview process",
        "interviewSteps": [
          { "id": 1, "interviewFlowId": 1, "name": "Initial Screening", "orderIndex": 1 },
          { "id": 2, "interviewFlowId": 1, "name": "Technical Interview", "orderIndex": 2 },
          { "id": 3, "interviewFlowId": 1, "name": "Manager Interview", "orderIndex": 3 },
          { "id": 4, "interviewFlowId": 1, "name": "Offer", "orderIndex": 4 }
        ]
      }
    }
  }
```

- `GET http://localhost:3010/positions/1/candidates` responde con:
```json
  [
    { "candidateId": 1, "fullName": "John Doe",       "currentInterviewStep": "Initial Screening",   "averageScore": 4, "applicationId": 10 },
    { "candidateId": 2, "fullName": "Jane Smith",     "currentInterviewStep": "Technical Interview", "averageScore": 5, "applicationId": 11 },
    { "candidateId": 3, "fullName": "Carlos Ruiz",    "currentInterviewStep": "Initial Screening",   "averageScore": 3, "applicationId": 12 },
    { "candidateId": 4, "fullName": "Maria Lopez",    "currentInterviewStep": "Manager Interview",   "averageScore": 4, "applicationId": 13 }
  ]
```

**Test 1 — debe llamarse "Escenario 1: la página de Position carga correctamente"**

Verifica:
1. Given los endpoints mockeados arriba, when navego a `/positions/1`, then el `data-testid="position-title"` muestra exactamente `"Senior Full-Stack Engineer"`.
2. Hay exactamente 4 elementos con `data-testid="stage-column"`.
3. Para cada una de las 4 fases ("Initial Screening", "Technical Interview", "Manager Interview", "Offer") existe una columna con ese `data-stage-name` y su header muestra el nombre.
4. La columna `Initial Screening` contiene 2 tarjetas con los nombres "John Doe" y "Carlos Ruiz".
5. La columna `Technical Interview` contiene 1 tarjeta con "Jane Smith".
6. La columna `Manager Interview` contiene 1 tarjeta con "Maria Lopez".
7. La columna `Offer` no contiene ninguna tarjeta (`toHaveCount(0)`).

Usa un `beforeEach` que registre los `page.route()` y que después haga `await page.goto('/positions/1')` + espera a que el título esté visible (anti-flakiness). No dupliques la lógica de navegación en cada test.

No incluyas todavía el Escenario 2. Quiero validar primero que el Escenario 1 pasa.
```

## Prompt 5 — Test del Escenario 2: drag-and-drop + intercepción del PUT

Helper `dragCard` con el patrón de mouse manual que `react-beautiful-dnd` necesita (`mousedown` → micro-movimiento → `mousemove` con steps → `mouseup`). Captura del `PUT /candidates/:id` con `page.waitForRequest` registrado ANTES del drag. Aserciones sobre URL, body (con tipos numéricos) y status.

```
Añade al mismo archivo `frontend/tests/e2e/position.spec.ts` el segundo escenario, manteniendo el `beforeEach` ya creado.

**Contexto técnico CRÍTICO**
- El frontend usa `react-beautiful-dnd`. El `page.dragTo()` nativo de Playwright NO funciona con esta librería porque RBD detecta el drag por una secuencia específica de eventos (`mousedown` → pequeño movimiento → `mousemove` con steps → `mouseup`).
- El endpoint real que dispara el frontend al mover una tarjeta es `PUT http://localhost:3010/candidates/:candidateId` (plural, no "candidate"), con body `{ applicationId: number, currentInterviewStep: number }`. Ambos son números (el id de la fase, no el nombre).

**Test 2 — debe llamarse "Escenario 2: mover candidato a otra fase dispara PUT /candidates/:id"**

Pasos:

1. Reutiliza el mock de los GET del `beforeEach`. Añade ADEMÁS una intercepción para `PUT http://localhost:3010/candidates/*`:
   - Captura la URL y el `postData` en una variable de test.
   - Responde con status 200 y body `{ "message": "Candidate updated successfully" }`.

2. Given la página cargada, cuando arrastro la tarjeta "John Doe" (data-candidate-id="1") desde la columna "Initial Screening" a la columna "Technical Interview":

   Implementa el drag con un helper interno `dragCard(page, sourceLocator, targetLocator)` que haga exactamente esto (es el patrón que funciona con react-beautiful-dnd en Playwright):
```ts
   const source = await sourceLocator.boundingBox();
   const target = await targetLocator.boundingBox();
   await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
   await page.mouse.down();
   // RBD necesita un micro-movimiento + delay para detectar el drag
   await page.mouse.move(source.x + source.width / 2 + 10, source.y + source.height / 2 + 10, { steps: 5 });
   await page.waitForTimeout(150);
   await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 20 });
   await page.waitForTimeout(150);
   await page.mouse.up();
```

3. Then verifica:
   - **UI**: La tarjeta "John Doe" ahora está dentro de la columna `data-stage-name="Technical Interview"` (usar `.locator('[data-stage-name="Technical Interview"]').getByText('John Doe')` con `toBeVisible()`).
   - **Backend**: Se disparó UNA petición `PUT` cuya URL termina en `/candidates/1` (id del candidato movido).
   - **Body**: El body de la petición incluye `currentInterviewStep: 2` (id de "Technical Interview" según el mock) y `applicationId: 10` (el de John Doe).
   - **Tipos**: Ambos campos son `number`, no string.
   - **Respuesta**: La promesa de la request resuelve con `status() === 200`.

Para capturar la petición de forma fiable usa `page.waitForRequest(req => req.method() === 'PUT' && req.url().includes('/candidates/1'))` ANTES de soltar el ratón, y luego `await` esa promesa después del `mouse.up()`.

Si después de un primer intento el drag no surte efecto en la UI (RBD a veces requiere ajuste de timings), aumenta el `waitForTimeout` intermedio a 250ms antes de pedírmelo. Quiero que valides la estabilidad ejecutando el test 3 veces seguidas sin fallos antes de dármelo por bueno.
```

## Prompt 6 — Ejecutar, depurar y capturar evidencia

Ejecución de la suite y generación del reporte HTML.

```
Los dos escenarios pasan estables (6/6 en 3 ejecuciones, ya validado en el paso anterior). Ahora genera la evidencia para el PR:

1. Ejecuta la suite completa una última vez con reporter HTML:
   cd frontend
   npx playwright test tests/e2e/position.spec.ts
   (esto genera el reporte en `frontend/playwright-report/`).

2. Confirma el resumen de la ejecución (nº de tests, duración total, todos verdes).

3. Dime el comando exacto para abrir el reporte HTML en el navegador y qué dos capturas concretas debería hacer para la evidencia del PR:
   - Una con la vista de resumen (los 2 tests verdes).
   - Una con el detalle del Escenario 2 (drag-and-drop) mostrando los pasos.

No abras tú el navegador. Yo me encargo de las capturas.
```

---

## Resultado

- **Tests creados:** 2 (Escenario 1 — carga / Escenario 2 — drag + PUT).
- **Estabilidad:** 6/6 ejecuciones verdes (3 repeticiones del Escenario 2 aislado + ejecución de suite completa repetida).
- **Tiempo de la suite final:** 7.1 s (1 worker, secuencial).
- **Componentes del frontend modificados:** `PositionDetails.js`, `StageColumn.js`, `CandidateCard.js` (solo añadidos `data-testid`).

## Iteración con la IA — bug detectado y corregido durante el proceso

Al ejecutar la suite completa por primera vez, el **Escenario 1 falló** con:

```
Locator: locator('[data-testid="stage-column"]').filter({ has: locator('[data-stage-name="Initial Screening"]') })
Error: element(s) not found
```

**Diagnóstico (de Cascade, confirmado en el chat de planning):** el filtro `has:` busca un *descendiente* que coincida con el selector interno, pero `data-testid="stage-column"` y `data-stage-name="..."` están en el MISMO nodo `<div>`. Un elemento no es descendiente de sí mismo.

**Fix:** sustituir el selector compuesto por uno con ambos atributos en el mismo nodo:

```ts
// Antes (incorrecto):
page.locator('[data-testid="stage-column"]', { has: page.locator(`[data-stage-name="${phase}"]`) })

// Después (correcto):
page.locator(`[data-testid="stage-column"][data-stage-name="${phase}"]`)
```

El fix se aplicó consistentemente en ambos escenarios. Tras la corrección, la suite completa pasó 3 veces seguidas sin flakiness.

## Decisiones técnicas relevantes

1. **Mocks con `page.route()` en lugar de BD real.** Los GET de `interviewFlow` y `candidates` se interceptan en el `beforeEach`. Ventaja: tests deterministas, independientes del estado de la base de datos y del backend. Necesarios para CI/CD.

2. **Patrón de drag manual en lugar de `locator.dragTo()`.** `react-beautiful-dnd` no detecta el drag con la API nativa de Playwright porque escucha una secuencia específica de eventos. El helper `dragCard` reproduce el patrón que sí funciona: `mousedown` → micro-movimiento con steps → delay → `mousemove` al destino con steps → delay → `mouseup`. Los `waitForTimeout(250)` intermedios resultaron suficientes (estabilidad validada con `--repeat-each=3`).

3. **Endpoint real difiere del enunciado.** La práctica describe `PUT /candidate/:id`, pero el frontend llama a `PUT /candidates/:id` (plural). Los tests validan contra el endpoint REAL implementado, no contra el del enunciado.

4. **`waitForRequest` registrado ANTES del drag.** Evita race conditions: si se registrara después del `mouse.up()`, el request ya podría haberse disparado y la promesa quedaría colgada. El patrón `promise = waitForRequest(...); action(); await promise;` es estándar para esto en Playwright.
