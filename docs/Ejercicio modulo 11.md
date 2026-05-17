3. Requisitos del ejercicio
3.1 Configurar Playwright en el proyecto
Si el proyecto aún no tiene Playwright configurado, instálalo dentro de la carpeta /frontend:

bash

cd frontend npm install -D @playwright/test npx playwright install

Opcionalmente, puedes inicializar la configuración base con:

bash

npx playwright init

Esto generará archivos como:

playwright.config.js

o, si el proyecto usa TypeScript:

playwright.config.ts

4. Crear pruebas E2E para la interfaz position
Debes crear pruebas E2E que validen los siguientes escenarios:

Escenario 1: Carga de la página de Position
Crear una prueba que valide que la pantalla de position carga correctamente. La prueba debe verificar:

Que el título de la posición se muestra correctamente.

Que se muestran las columnas correspondientes a cada fase del proceso de contratación.

Que las tarjetas de los candidatos se muestran en la columna correcta según su fase actual.

Ejemplos de fases que podrían existir:

Aplicado Entrevista Prueba Técnica Oferta Contratado Rechazado

Las fases exactas deben coincidir con las implementadas en la interfaz.

Escenario 2: Cambio de fase de un candidato
Crear una prueba que simule el movimiento de un candidato de una fase a otra. La prueba debe verificar:

Que se puede arrastrar una tarjeta de candidato desde una columna hacia otra.

Que la tarjeta del candidato aparece visualmente en la nueva columna.

Que la fase del candidato se actualiza correctamente en el backend mediante el endpoint:

PUT /candidate/:id

La prueba debe validar que al mover el candidato:

Se dispara una petición PUT.

El id del candidato corresponde al candidato movido.

El body de la petición contiene la nueva fase.

La respuesta del backend es exitosa.

5. Ejecución de pruebas
Modo interactivo (UI):

bash
npx playwright test --ui

Modo headless:

bash
npx playwright test

Prueba específica:

bash
npx playwright test tests/e2e/position.spec.ts

Ver reporte HTML:

bash
npx playwright show-report

6. Entrega del ejercicio
Debes realizar un Pull Request en el repositorio incluyendo:

Los cambios realizados en la interfaz dentro de la carpeta /frontend.

La configuración de Playwright, si no existía previamente.

El archivo de prueba:

/frontend/tests/e2e/position.spec.ts

o /frontend/tests/e2e/position.spec.js

Un archivo /prompts/prompts-[tus-iniciales].md con la lista de prompts utilizados con IA durante el ejercicio.

Entrega final esperada
El Pull Request debe incluir el archivo de prompts-[tus iniciales].md

Evidencia: Adjuntar captura o resultado de la ejecución exitosa de las pruebas.