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

5. Frameworks de agentes con IA para automatización del navegador
Estos no son tests E2E tradicionales sino agentes que automatizan navegadores con razonamiento LLM. Útiles para exploración automática, generación de casos y self-healing.

image.png
6. Riesgos y límites del flujo E2E con IA
Coste en tokens en suites grandes (mitigable con CLI sobre MCP).

No-determinismo de los agentes en flujos complejos.

Datos sensibles: enviar producción a un LLM externo puede violar GDPR. Usa entornos seed o datos sintéticos.

Dependencia de proveedores: si Anthropic/OpenAI tienen un downtime, tu pipeline también.

La revisión humana del código generado sigue siendo no negociable.

ℹ Visión panorámica del testing con IA: Esta sección cubre solo la IA aplicada al flujo E2E. Para una vista taxonómica completa del ecosistema (IA tradicional vs generativa, plataformas SaaS, visual regression, generación de unit tests con IA, self-healing por categorías), ver la sección "3- Testing Asistido por AI".

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

Ejemplo de Herramientas:
Playwright (recomendado)

Cypress

Selenium (contexto JVM/Python)

4. Comparación
image