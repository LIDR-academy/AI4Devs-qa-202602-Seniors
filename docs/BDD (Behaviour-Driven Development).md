1⃣ Conceptos Básicos
Definición: Behavior-Driven Development (BDD) es una metodología de desarrollo ágil que mejora la comunicación entre los desarrolladores, QA y los stakeholders no técnicos mediante la creación de ejemplos específicos del comportamiento deseado del sistema.

Importancia: BDD asegura que todos los miembros del equipo entiendan y estén alineados con los requisitos del negocio, fomentando la colaboración y reduciendo malentendidos.

2⃣ Diferencia entre BDD y TDD
1. TDD (Test-Driven Development)
Definición:
Test-Driven Development (TDD) es una metodología de desarrollo de software en la cual los casos de prueba se crean antes de escribir el código funcional. El ciclo de TDD sigue los pasos: Red, Green, Refactor.

Objetivo:
Asegurar que el código cumpla con los requisitos funcionales mediante pruebas unitarias que validen cada pequeña unidad de código.

Características:
Foco en la Implementación: TDD se centra en la creación de pruebas unitarias para la implementación del código.

Red, Green, Refactor: Ciclo donde se escribe una prueba fallida (Red), se escribe el mínimo código para pasar la prueba (Green) y se refactoriza el código (Refactor).

Nivel de Prueba: Principalmente pruebas unitarias.

2. BDD (Behavior-Driven Development)
Definición:
BDD es una extensión de TDD que se centra en el comportamiento del software desde la perspectiva del usuario y los requisitos del negocio. Utiliza un lenguaje común y accesible (Gherkin) para definir las especificaciones.

Objetivo:
Alinear el desarrollo del software con los requisitos del negocio, facilitando la colaboración entre todos los miembros del equipo y asegurando que el software cumple con las expectativas del usuario.

Características:
Foco en el Comportamiento: BDD se centra en el comportamiento del sistema tal como lo entienden los stakeholders no técnicos.

Especificaciones en Lenguaje Natural: Utiliza el lenguaje Gherkin para escribir escenarios de prueba en un formato legible.

Nivel de Prueba: Incluye tanto pruebas unitarias como pruebas de integración y aceptación.

Ejemplo de BDD con Gherkin:
Feature: Login functionality

  Scenario: Successful login with valid credentials
    Given the user is on the login page
    When the user enters a valid username and password
    Then the user should be redirected to the dashboard
3. Comparación de BDD y TDD

3⃣ Escribir Especificaciones con Gherkin
Sintaxis de Gherkin:
Gherkin es un lenguaje de dominio específico utilizado en BDD para describir el comportamiento del software. Utiliza una sintaxis sencilla y accesible que permite definir las pruebas en un formato legible por todos los miembros del equipo.

Feature: Descripción general de lo que se está probando.

Scenario: Un caso específico de uso o situación.

Given: Configuración inicial del escenario.

When: Acción o evento que se está probando.

Then: Resultado esperado después de la acción.

And / But: Pasos adicionales encadenados al anterior.

Background: Pasos comunes que se ejecutan antes de cada escenario de la feature.

Scenario Outline + Examples: Plantilla de escenario parametrizada con tabla de datos.

Ejemplo:

Feature: User login

  Background:
    Given the user is on the login page

  Scenario Outline: Login attempts
    When the user enters "<username>" and "<password>"
    Then they should see "<result>"

    Examples:
      | username      | password      | result        |
      | valid_user    | valid_pass    | dashboard     |
      | invalid_user  | wrong_pass    | error message |
      |               | valid_pass    | error message |
4⃣ Herramientas de BDD
📊 Estado del ecosistema BDD en 2026: Cucumber.js sigue siendo el motor canónico (versión 12.x activa) pero su rol está cambiando: muchos equipos JS/TS nuevos lo usan ya como biblioteca de bajo nivel y prefieren playwright-bdd como runner. SpecFlow está oficialmente discontinuado desde diciembre 2024; Reqnroll es su sucesor en .NET.

1. Cucumber.js (motor BDD canónico para Node.js)
Descripción: Implementación oficial de Cucumber para JavaScript/TypeScript. Soporta Gherkin completo, hooks, tags, parameter types, parallel execution.

Paquete correcto: @cucumber/cucumber (con scope). El paquete legacy cucumber (sin scope) está abandonado desde 2021, ignorar cualquier tutorial que lo use.

Versión actual: 12.x (releases continuos en 2026, requiere Node 20+ o 24+).

Cuándo usarlo: tests de servicios sin UI (APIs, microservicios), contract testing, casos donde no necesitas un runner de navegador.

2. 🆕 playwright-bdd (recomendado para BDD E2E en JS/TS)
Descripción: Plugin que ejecuta archivos .feature con Playwright como runner, no con Cucumber.js. Convierte Gherkin en tests Playwright nativos.

Mantenedor: Vitaly Slobodin (vitalets/playwright-bdd).

Estado en 2026: Maduro y consolidado. Independencia total de Cucumber.js en runtime desde 2024.

Ventajas reales sobre Cucumber.js puro:

Paralelización, sharding y workers de Playwright aplicados a escenarios BDD.

Acceso a fixtures de Playwright (test.extend) en step definitions.

Reuso completo del HTML reporter de Playwright y del Trace Viewer para depurar.

Project dependencies (setup/teardown global) sin equivalente en Cucumber.js.

Decoradores TypeScript opcionales para Page Object Models.

Requisitos: Node ≥18 y @playwright/test ≥1.44.

3. 🆕 Cypress Cucumber Preprocessor (@badeball/cypress-cucumber-preprocessor)
Descripción: Preprocessor para ejecutar archivos .feature directamente en Cypress.

Estado en 2026: Activo. Versión 24.x soporta Cypress 14 y 15.

Importante: Es el sucesor de facto. Ignorar:

cypress-cucumber-preprocessor (sin scope) — archivado en 2021.

El fork de Klaveness — superado por @badeball/.

4. Reqnroll (sucesor de SpecFlow para .NET)
Descripción: Fork open-source de SpecFlow mantenido por la comunidad bajo licencia BSD-3.

Por qué importa: SpecFlow está oficialmente discontinuado desde diciembre de 2024 (Tricentis cerró el repo). Cualquier proyecto .NET nuevo o en mantenimiento debe migrar a Reqnroll.

Estado en 2026: Más de 5.000 proyectos en producción, soporte completo para .NET 8 y 9, extensiones para Visual Studio y JetBrains Rider.

5. Karate DSL (BDD para APIs en JVM)
Descripción: Framework BDD orientado a API testing donde los pasos Given/When/Then se escriben directamente sin step definitions.

Estado en 2026: Versión 1.5.x publicada bajo Karate Labs (nueva entidad de Peter Thomas), requiere Java 17+.

Cuándo usarlo: Tests de APIs en stack JVM. No aplica a Node.js, pero conviene conocerlo si trabajas en proyectos políglotas.

6. Behat (PHP)
Mantenido pero en declive. Mención mínima si el alumno tiene background PHP.

5⃣ Ejemplo Práctico
Implementación de un Escenario BDD utilizando Cucumber.js
Instalación:

npm install --save-dev @cucumber/cucumber
Estructura del Proyecto:

/project-root
  ├── /features
  │   ├── login.feature
  │   └── /step_definitions
  │       └── loginSteps.ts
  └── /src
      └── app.ts
Especificación en Gherkin (features/login.feature):

Feature: User login

  Scenario: User logs in with valid credentials
    Given the user is on the login page
    When the user enters a valid username and password
    Then the user should be redirected to the dashboard
Definición de Pasos (features/step_definitions/loginSteps.ts):

import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import { app } from '../../src/app';

Given('the user is on the login page', function () {
  // Navegar a la página de inicio de sesión
  app.navigateTo('/login');
});

When('the user enters a valid username and password', function () {
  // Introducir nombre de usuario y contraseña válidos
  app.login('testuser', 'testpassword');
});

Then('the user should be redirected to the dashboard', function () {
  // Verificar la redirección al dashboard
  assert.equal(app.currentPage(), 'dashboard');
});
Ejecución de las Pruebas:

npx cucumber-js
💡 Prueba esto ahora: Si tu proyecto ya usa Playwright, sustituye Cucumber.js por playwright-bdd: tendrás los mismos .feature, los step definitions con fixtures de Playwright, y depuración con Trace Viewer.

Configuración mínima de playwright-bdd (alternativa moderna)
Instalación:

npm install --save-dev playwright-bdd @playwright/test
playwright.config.ts:

import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/steps/*.ts',
});

export default defineConfig({ testDir });
Step con fixture de Playwright (features/steps/loginSteps.ts):

import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('the user is on the login page', async ({ page }) => {
  await page.goto('/login');
});

When('the user enters a valid username and password', async ({ page }) => {
  await page.getByLabel('Username').fill('testuser');
  await page.getByLabel('Password').fill('testpassword');
  await page.getByRole('button', { name: /log in/i }).click();
});

Then('the user should be redirected to the dashboard', async ({ page }) => {
  await page.waitForURL('/dashboard');
});
Ejecución:

npx bddgen && npx playwright test
6️⃣ Buenas Prácticas
Colaboración Activa:

Comunicación: Fomentar la comunicación continua entre desarrolladores, QA y stakeholders.

Three Amigos: Antes de codificar, juntar a desarrollador, QA y product/business para acordar ejemplos concretos.

Reuniones de Refinamiento: Utilizar reuniones regulares para refinar y discutir las especificaciones de BDD.

Documentación Clara:

Especificaciones Detalladas: Escribir especificaciones claras y detalladas en Gherkin.

Lenguaje Ubicuo: Usar el vocabulario del dominio (no de la implementación) y mantenerlo consistente entre features.

Actualización Continua: Mantener las especificaciones y las definiciones de pasos actualizadas a medida que el proyecto evoluciona.

Automatización:

Integración Continua: Integrar las pruebas BDD en el pipeline de CI/CD para asegurar la ejecución continua de las pruebas.

Reporte de Resultados: Generar reportes claros y accesibles (Cucumber Reports, Allure) para todo el equipo.

7⃣ BDD Asistido por IA
La IA generativa ha cambiado radicalmente cómo se escribe Gherkin y cómo se generan los step definitions. Bien usada, acelera el flujo BDD; mal usada, produce escenarios frágiles y desconectados del dominio.

1. Generación de escenarios Gherkin desde user stories
Usando Cursor, Claude Code o Copilot Chat con un prompt estructurado, podemos convertir una historia de usuario en escenarios BDD candidatos para refinar con el equipo.

Ejemplo de prompt efectivo:

"Como Product Manager del proyecto AI4Devs, tengo esta historia de usuario:

'Como manager, quiero filtrar candidatos por fase del proceso para revisar rápidamente el estado de cada uno.'

Una vez tienes los archivos .feature, el agente puede generar automáticamente los step definitions correspondientes:

Genera escenarios BDD en formato Gherkin (Feature + Scenarios) cubriendo:

(1) caso feliz, (2) sin candidatos en la fase, (3) filtro inválido, (4) combinación de filtros.

Playwright BDD (playwright-bdd): Plugin que permite ejecutar escenarios Gherkin directamente con Playwright como runner.

Reglas: un único When por escenario, lenguaje del dominio (no UI), evita 'click' o IDs técnicos. Usa Scenario Outline si los casos comparten estructura."

2. Generación automática de step definitions
Una vez tienes los .feature, el agente puede generar los step definitions correspondientes:

"Lee features/login.feature y genera los step definitions en TypeScript usando playwright-bdd. Usa queries accesibles (getByRole, getByLabel). Si el step ya existe en features/steps/, no lo dupliques."

3. Three Amigos asistido por IA y Example Mapping
Three Amigos: la IA NO sustituye a los tres roles humanos (developer, QA, business). Su rol útil es como cuarto participante que propone ejemplos adicionales y casos borde durante la sesión.

Example Mapping (técnica de Matt Wynne, Reglas → Ejemplos → Preguntas): pedir a la IA que, dado un set de reglas, genere ejemplos candidatos y preguntas no resueltas. Siempre validar con humano antes de ejecutar.

Validación INVEST: usar la IA como segundo revisor para comprobar si la user story cumple los criterios INVEST (Independent, Negotiable, Valuable, Estimable, Small, Testable). No como autor único.

4. Anti-patrones de Gherkin generado por IA (lista crítica)
Los LLMs tienden a producir estos errores; el alumnado debe aprender a detectarlos y corregirlos:

Escenarios imperativos (paso a paso de UI):

❌ When I click the submit button

✅ When the customer places the order

Demasiado técnicos: referencias a IDs de DOM, JSON payloads o nombres de columnas de BD.

Múltiples When/Then por escenario: un escenario debe describir UN solo evento de negocio.

Falta de Examples o sobrespecificación de datos cuando deberían usarse Scenario Outlines.

Lenguaje inconsistente: la misma acción descrita de tres formas distintas en features distintas.

"Escenarios fantasma": el LLM inventa precondiciones no acordadas con negocio porque "rellenan bien".

Pérdida del lenguaje ubicuo: el LLM sustituye términos del dominio por sinónimos genéricos ("usuario" en vez de "candidato", "elemento" en vez de "vacante").

5. Living documentation moderna
Cucumber Reports Service (messages.cucumber.io): publica HTML reports automáticamente con publish: true.

Allure Report: estándar de facto para reportes ricos, integrado con Cucumber.js, playwright-bdd y Cypress.

⚠ Pickles y SpecFlow+ LivingDoc: discontinuados, no usar.

MCP server específico para Cucumber/BDD: a abril de 2026 NO existe un MCP server oficial publicado por el proyecto Cucumber. La generación de Gherkin con IA hoy se hace desde IDEs generales (Cursor, Claude Code) con prompting, no desde MCPs dedicados.

ℹ Visión panorámica del testing con IA: Esta sección se centra exclusivamente en BDD. Para el panorama completo de plataformas SaaS, generación de unit tests con IA, visual regression y self-healing, ver la sección "3- Testing Asistido por AI".