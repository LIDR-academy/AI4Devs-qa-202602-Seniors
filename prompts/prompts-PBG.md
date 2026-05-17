1. "I am going to implement testing with playwright backed with AI agents. I need playwright's mcp and it would be convenient to set up an agents.md file plus a .cursor folder with its rules, commands and skills. How should I proceed?"
2. "Generate the files."
3. "I asked how to configure .cursor and agents.md and you went a long way but building everything. I see that you did it based in @README.md , which explains the tests that have to be implemented. So, with that objective in mind, what should I do? I add as context some of the contents which this exercise wants to reinforce:
 Pruebas de Integración
1. Conceptos Básicos
Definición: Las pruebas de integración son un nivel de prueba que verifica la interacción entre múltiples componentes o sistemas. El objetivo es identificar problemas en la interacción de las unidades individuales que ya han pasado pruebas unitarias.

Importancia: Las pruebas de integración aseguran que los diferentes módulos de una aplicación funcionen juntos correctamente. Detectan defectos en las interfaces y en el flujo de datos entre componentes, garantizando la cohesión del sistema.

2. Tipos de Pruebas de Integración
Pruebas de Integración Big Bang:

Descripción: Todos los componentes se integran al mismo tiempo y se prueban como un sistema completo.

Ventajas: Permite ver el sistema completo desde el inicio.

Desventajas: Dificultad para identificar la fuente de los errores, ya que todos los módulos se prueban simultáneamente.

Pruebas de Integración Incrementales:

Integración Ascendente (Bottom-up): Los módulos de bajo nivel se prueban primero, luego se integran con módulos de nivel superior.

Integración Descendente (Top-down): Los módulos de alto nivel se prueban primero y se integran progresivamente con módulos de nivel inferior.

Ventajas: Facilita la identificación de errores en la interfaz de módulos específicos.

Desventajas: Puede requerir más tiempo y recursos comparado con la integración Big Bang.

Pruebas de Integración Funcionales:

Descripción: Se enfoca en probar la funcionalidad completa de un subsistema o componente específico dentro del sistema.

Ventajas: Asegura que cada funcionalidad trabaja correctamente con los componentes integrados.

Desventajas: Puede no cubrir todas las interacciones entre todos los componentes.

3. Proceso de Pruebas de Integración
Planificación:

Definir Alcance: Establecer qué componentes y interfaces se probarán.

Diseño de Casos de Prueba: Crear casos de prueba detallados basados en la funcionalidad esperada y los requisitos del sistema.

Ambiente de Pruebas: Configurar un entorno de pruebas que imite el entorno de producción lo más posible.

Diseño de Casos de Prueba:

Identificación de Interfaces: Determinar las interfaces entre módulos que necesitan ser probadas.

Datos de Prueba: Crear datos de prueba que cubran casos normales, límites y excepciones.

Criterios de Éxito: Establecer los resultados esperados para cada caso de prueba.

Ejecución de Pruebas:

Ejecución de Casos de Prueba: Realizar las pruebas según lo planificado y documentar los resultados.

Registro de Defectos: Registrar cualquier defecto encontrado y asignarlo para su corrección.

Repetición de Pruebas: Repetir las pruebas después de la corrección de defectos para asegurar que los errores se hayan solucionado y no se hayan introducido nuevos problemas.

4. Herramientas y Frameworks
Jest (para Node.js y React):

Descripción: Framework de pruebas en JavaScript que permite realizar pruebas unitarias y de integración.

Características: Asserts y mocks integrados, fácil configuración con TypeScript.

Estado en 2026: Vigente. Jest 30 (junio 2025) requiere Node ≥18 y TypeScript ≥5.4. Sigue siendo obligatorio para React Native y dominante en código existente. ~30M descargas semanales.

🆕 Vitest (alternativa moderna):

Descripción: Framework de testing nativo del ecosistema Vite. API casi idéntica a Jest (migración con codemod oficial).

Características: ESM y TypeScript nativos, watch mode con HMR, Browser Mode (estable desde Vitest 4.0, octubre 2025) que corre tests en Chromium/Firefox/WebKit reales usando Playwright como provider.

Cuándo usarlo: Recomendado para nuevos proyectos con Vite, Next.js 15+ o React 19. Entre 4x y 10x más rápido que Jest en watch mode.

Cuándo no: En suites Jest grandes con muchos plugins o en proyectos React Native.

Supertest (para Node.js):

Descripción: Biblioteca que facilita las pruebas de APIs en Node.js.

Características: Permite realizar solicitudes HTTP y verificar respuestas.

Estado en 2026: Vigente. Funciona igual con Jest y Vitest.

Testing Library (para React):

Descripción: Conjunto de utilidades para probar componentes promoviendo la filosofía "test the user, not the implementation".

Estado en 2026: Plenamente vigente, framework-agnostic.

🆕 MSW (Mock Service Worker):

Descripción: Mockea peticiones HTTP a nivel de red usando Service Workers (frontend) o request interceptors (Node).

Por qué importa: Permite reutilizar los mismos mocks en pruebas de integración y E2E, y desarrollar contra una API que aún no existe.

5. Buenas Prácticas
Automatización de Pruebas:

Beneficios: Mayor eficiencia y consistencia en la ejecución de pruebas, detección temprana de errores.

Herramientas: Uso de herramientas como GitHub Actions o Jenkins para la integración continua y automatización de pruebas.

Reutilización de Casos de Prueba:

Modularidad: Diseñar casos de prueba que sean modulares y reutilizables en diferentes escenarios de pruebas.

Mantener Casos de Prueba Actualizados: Revisar y actualizar los casos de prueba regularmente para reflejar cambios en el sistema.

Documentación Detallada:

Registro de Resultados: Documentar los resultados de las pruebas de integración para un seguimiento efectivo.

Reportes de Defectos: Mantener un registro claro y detallado de todos los defectos encontrados, su estado y resolución.

6. Ejemplos Prácticos
Integración de Módulo de Autenticación con Base de Datos en Node.js:

Objetivo: Verificar que el módulo de autenticación puede acceder y autenticar usuarios correctamente desde la base de datos.

Caso de Prueba:

Given: El sistema está en la página de inicio de sesión.

When: Un usuario ingresa credenciales válidas.

Then: El sistema debe permitir el acceso y redirigir al dashboard del usuario.

Integración de API Externa para Obtener Datos en React:

Objetivo: Verificar que la aplicación puede comunicarse y recibir datos correctamente de una API externa.

Caso de Prueba:

Given: La aplicación está configurada con la URL de la API externa.

When: Se envía una solicitud para obtener datos.

Then: La aplicación recibe y muestra los datos correctos.

7. Ejemplo Detallado de Pruebas de Integración
Prueba de Integración de una API REST con Node.js (Jest + Supertest)
Instalación:

npm install --save-dev jest supertest @types/jest @types/supertest
Estructura del Proyecto:

/project-root
  ├── /src
  │   ├── app.ts
  │   ├── /routes
  │   │   └── userRoutes.ts
  │   └── /controllers
  │       └── userController.ts
  └── /tests
      └── integration
          └── userRoutes.test.ts
Ejemplo de Prueba:

// /tests/integration/userRoutes.test.ts
import request from 'supertest';
import app from '../../src/app';

describe('User Routes', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });

    expect(response.status).toBe(201);
    expect(response.body.username).toBe('testuser');
  });

  it('should not create a user with existing username', async () => {
    await request(app)
      .post('/api/users')
      .send({ username: 'existinguser', password: 'testpassword' });

    const response = await request(app)
      .post('/api/users')
      .send({ username: 'existinguser', password: 'testpassword' });

    expect(response.status).toBe(400);
  });
});
Prueba de Integración de un Componente React con Testing Library
Instalación:

npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
Estructura del Proyecto:

/project-root
  ├── /src
  │   ├── App.tsx
  │   ├── /components
  │   │   └── UserList.tsx
  │   └── /services
  │       └── userService.ts
  └── /tests
      └── integration
          └── UserList.test.tsx
Ejemplo de Prueba:

// /tests/integration/UserList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // ✅ import moderno (sin /extend-expect)
import UserList from '../../src/components/UserList';
import { getUsers } from '../../src/services/userService';

jest.mock('../../src/services/userService');
const mockGetUsers = getUsers as jest.MockedFunction<typeof getUsers>;

describe('UserList Component', () => {
  it('should display a list of users', async () => {
    mockGetUsers.mockResolvedValue([
      { id: 1, username: 'user1' },
      { id: 2, username: 'user2' },
    ]);

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });
  });
});
💡 Prueba esto ahora: Si tu proyecto usa Vite, sustituye jest por vitest en estos ejemplos. La API es idéntica salvo por import { describe, it, expect, vi } from 'vitest' y vi.mock en lugar de jest.mock.

2⃣ Pruebas End-to-End (E2E)
1. Conceptos Básicos
Definición: Las pruebas End-to-End (E2E) verifican el flujo completo de la aplicación desde el inicio hasta el final, asegurando que todos los componentes funcionen juntos correctamente en un entorno de producción simulado.

Importancia: Las pruebas E2E aseguran que los flujos de trabajo críticos funcionen correctamente de principio a fin y que todos los componentes del sistema interactúen de manera fluida y eficaz. Son esenciales para validar la integridad del sistema desde la perspectiva del usuario.

2. Frameworks y Herramientas para Pruebas E2E
📊 Estado del ecosistema en 2026: Playwright se ha consolidado como framework E2E por defecto para nuevos proyectos JS/TS (91% satisfacción en State of JS 2025, ~30M descargas semanales). Cypress sigue siendo una opción válida con excelente DX (~6,5M descargas semanales, 72% satisfacción). Selenium queda relegado a entornos legacy y JVM/Python. TestCafe ya no se recomienda para nuevos proyectos.

Playwright (framework principal recomendado)
Descripción: Framework moderno de Microsoft para automatización de navegadores, con soporte nativo para JavaScript/TypeScript, Python, Java y C#.

Características clave:

Multi-navegador real: Chromium, Firefox y WebKit (Safari) sin plugins.

Auto-waiting: los expect() esperan automáticamente a que los elementos sean accionables.

Multi-tab y multi-origin sin restricciones (a diferencia de Cypress).

Codegen: grabador oficial que genera tests en TypeScript.

Trace Viewer: replay completo del test con DOM, red, screenshots y consola.

Paralelización nativa gratuita (sin servicios cloud de pago).

API testing integrado mediante request context.

Versión actual: 1.59.x (Q1 2026).

Cypress (alternativa popular, JS-only)
Descripción: Herramienta E2E con experiencia de usuario muy pulida; ejecuta los tests dentro del navegador.

Características: Time-travel debugging, recarga automática, Test Replay (replay del DOM en producción desde Cypress Cloud), Component Testing maduro, Cypress Studio AI (anunciado en CypressConf 2026, genera aserciones y self-healing con prompts).

Limitaciones a conocer: sin soporte completo de Safari/WebKit, sin multi-tab, paralelización requiere Cypress Cloud (~67–75 USD/mes Team plan) o el plugin comunitario cypress-split.

Versión actual: 15.x (Q1 2026).

Selenium (contexto histórico / entornos JVM-Python)
Descripción: Pionero de la automatización web, soporta múltiples lenguajes y navegadores.

Estado en 2026: Sigue dominante en empresas con stack JVM/Python (~22% cuota global QA). En JavaScript/TypeScript ha cedido el terreno a Playwright. Mencionar como referencia, no recomendar para nuevos proyectos JS/TS.

⚠ TestCafe: se ha retirado de las recomendaciones para 2026. El proyecto open source recibe mantenimiento mínimo y el foco comercial se ha movido a TestCafe Studio (de pago). No es recomendable para nuevos proyectos.

3. Ejemplo Práctico con Playwright
Instalación:

npm init playwright@latest
El instalador configura playwright.config.ts, descarga los navegadores y crea ejemplos.

Estructura del Proyecto:

/project-root
  ├── /tests
  │   └── login.spec.ts
  ├── playwright.config.ts
  └── /src
      └── app.ts
Escribir una Prueba E2E (tests/login.spec.ts):

import { test, expect } from '@playwright/test';

test.describe('Flujo de Login', () => {
  test('un usuario válido accede al dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Correo electrónico').fill('alumno@ai4devs.dev');
    await page.getByLabel('Contraseña').fill('Secreta-123!');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /bienvenida/i })).toBeVisible();
  });

  test('credenciales inválidas muestran un error accesible', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Correo electrónico').fill('alumno@ai4devs.dev');
    await page.getByLabel('Contraseña').fill('incorrecta');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page.getByRole('alert')).toContainText(/credenciales/i);
  });
});
Ejecución de las pruebas:

npx playwright test                   # ejecuta todos los tests headless
npx playwright test --ui              # abre el UI Mode (recomendado para desarrollo)
npx playwright codegen localhost:3000 # graba acciones y genera código
npx playwright show-trace trace.zip   # abre el Trace Viewer
💡 Prueba esto ahora: lanza npx playwright codegen apuntando a tu app actual, navega manualmente por un flujo y observa cómo Playwright genera el test usando queries accesibles (getByRole, getByLabel).

5. Buenas Prácticas
Selectores accesibles antes que CSS frágiles: prioriza getByRole, getByLabel, getByTestId. Un cambio de clase no debe romper tus tests.

Automatización en CI/CD: integra los tests en GitHub Actions con sharding (--shard 1/4 en Playwright) y cachea ~/.cache/ms-playwright.

Datos de prueba realistas: usa fixtures, factories (@faker-js/faker) y entornos seed cercanos a producción.

Independencia entre tests: cada test debe poder ejecutarse aislado y en cualquier orden.

Trace y screenshots en fallos: activa trace: 'on-first-retry' en Playwright para depurar fallos de CI sin reproducir localmente.

Mantenimiento continuo: revisa y actualiza los tests cuando el sistema evoluciona; un test ignorado es deuda técnica.

IA Aplicada al Testing E2E e Integración
Esta sección refleja el cambio más importante del ecosistema de testing entre 2024 y 2026: la IA ha pasado del hype a la práctica diaria. Un developer en 2026 genera, mantiene y depura tests asistido por IA mediante MCP servers, agentes de coding y herramientas integradas en el flujo E2E.

1. Por qué la IA cambia el flujo de testing E2E
En el modelo tradicional, escribir tests E2E era trabajo manual, repetitivo y propenso a flakiness. En 2026 el flujo dominante es:

El developer describe el escenario en lenguaje natural.

El agente (Cursor, Claude Code, Copilot) navega la app real vía Playwright MCP/CLI.

El agente escribe el spec, lo ejecuta y lo refina hasta que pasa de forma estable.

El developer revisa y aprueba el código generado.

El rol del developer cambia de "tecleador de tests" a "arquitecto y revisor de calidad".

2. Playwright MCP: el cambio estructural más importante
¿Qué es? Servidor oficial de Microsoft (lanzado 22 de marzo de 2025) que expone Playwright como herramientas que cualquier LLM puede invocar mediante el protocolo MCP. Es el MCP server #1 del ecosistema según rankings públicos.

Cómo funciona: en lugar de basarse en screenshots y modelos de visión, su modo por defecto ("Snapshot Mode") usa el árbol de accesibilidad del navegador, lo que hace las acciones más rápidas, deterministas y baratas en tokens.

Instalación (una línea):

npx @playwright/mcp@latest
Configuración en Cursor / VS Code / Claude Desktop / Claude Code:

{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
Capacidades expuestas: navegación, snapshots de accesibilidad, click, type, press, screenshot, mocking de red (intercept/mock/modify/block), gestión de cookies/localStorage/sessionStorage, sesiones persistentes, capabilities opcionales vision, pdf y devtools.

💡 Prueba esto ahora: Configura Playwright MCP en Cursor o Claude Desktop y pide: "Genera un test E2E que verifique el flujo de login con credenciales válidas e inválidas en http://localhost:3000. Usa queries accesibles." Observa cómo el agente abre el navegador, explora la UI real y escribe el spec.

3. Playwright CLI: la opción recomendada para coding agents
A principios de 2026 Microsoft lanzó @playwright/cli como complemento orientado específicamente a agentes con acceso al sistema de ficheros (Claude Code, Cursor, Copilot Coding Agent).

Por qué importa: una tarea típica consume ~114k tokens vía MCP frente a ~27k tokens vía CLI (≈4x menos). La CLI guarda snapshots y screenshots como YAML en disco; el agente lee solo lo necesario.

Recomendación oficial de Microsoft (2026): usar CLI cuando el agente tiene filesystem, MCP cuando el cliente es chat puro (Claude Desktop sin filesystem).

Comandos típicos:

playwright-cli open <https://app.local>
playwright-cli click "button:has-text('Iniciar sesión')"
playwright-cli type "input[name=email]" "user@test.com"
playwright-cli screenshot login.png
playwright-cli state-save auth.json
4. Patrones de prompting efectivos para tests E2E
Lo que separa un buen test generado por IA de uno frágil suele ser el prompt. Patrones que funcionan:

Describir en Given/When/Then antes que en pseudocódigo.

"Genera un test Playwright. Given que estoy en /login, When introduzco credenciales válidas y hago click en 'Iniciar sesión', Then debo ser redirigido a /dashboard y ver un saludo de bienvenida."

Pedir explícitamente queries accesibles sobre selectores CSS frágiles.

"Usa getByRole, getByLabel y getByTestId. No uses selectores de clase ni IDs auto-generados."

Pedir verificación de estabilidad.

"Genera el test, ejecútalo y arréglalo hasta que pase tres veces seguidas sin flakiness."

Para Page Object Models en dos pasos.

"Paso 1: explora la app con Playwright MCP y propón un POM. Paso 2: cuando lo apruebe, reescribe los tests usando ese POM."

4⃣ Diferencias entre Pruebas Unitarias, de Integración y E2E
1. Pruebas Unitarias
Definición: Las pruebas unitarias se centran en verificar que cada unidad individual de código (generalmente una función o método) funcione correctamente de manera aislada.

Objetivo: Asegurarse de que cada componente individual cumpla con su propósito especificado y funcione correctamente de manera independiente.

Características:
Aislamiento: Se prueban unidades de código de forma aislada, sin dependencias externas.

Rapidez: Suelen ejecutarse rápidamente debido a su simplicidad y enfoque en pequeñas unidades de código.

Cobertura: Alta cobertura de código, ya que cada unidad se prueba exhaustivamente.

Simulación: Utilización de mocks, stubs, y fakes para simular dependencias externas.

Ejemplo de Herramientas:
Vitest, Jest (JavaScript/TypeScript)

Mocha + Chai (JavaScript/TypeScript)

React Testing Library (React)

2. Pruebas de Integración
Definición: Las pruebas de integración verifican la interacción entre múltiples componentes o sistemas, asegurando que funcionen correctamente en conjunto.

Objetivo: Detectar problemas en la interacción entre unidades individuales y verificar que los componentes funcionen juntos como se espera.

Características:
Interacción: Se enfocan en las interfaces y comunicación entre módulos.

Complejidad: Más complejas que las pruebas unitarias debido a la interacción entre múltiples componentes.

Cobertura de Flujo: Menor cobertura de código en comparación con las pruebas unitarias, pero mayor cobertura del flujo de datos y procesos.

Ambiente Realista: Se prueban en un entorno más cercano al entorno de producción.

Ejemplo de Herramientas:
Vitest/Jest + Supertest (Node.js)

React Testing Library + MSW (React)

Pact (contract testing entre microservicios)

3. Pruebas End-to-End (E2E)
Definición: Las pruebas E2E validan el flujo completo de la aplicación, desde la interfaz de usuario hasta el backend y las bases de datos, asegurando que todo el sistema funcione correctamente de principio a fin.

Objetivo: Asegurar que el sistema completo cumpla con los requisitos del usuario y funcione correctamente en un entorno de producción simulado.

Características:
Cobertura Completa: Validan el flujo completo del usuario, cubriendo todas las interacciones del sistema.

Realismo: Se realizan en un entorno que imita el entorno de producción.

Interacción Completa: Involucran todas las capas del sistema (frontend, backend, bases de datos, servicios externos).

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
"
4. "Open http://localhost:3000/positions/1, list columns and cards, and propose exact data-testid values for PositionDetails, StageColumn, and CandidateCard."

5. "Apply changes in the repo."

6. "Fix the testing so that any changes provoked by the tests is un-done (if necessary, if the test has been successful generating changes) at the end of the tests."
