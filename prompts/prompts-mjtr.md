# Prompts utilizados - MJTR

| Orden | Prompt | Finalidad trazable |
| --- | --- | --- |
| 1 | "Clona el repo del ejercicio al mismo nivel del directorio actual." | Preparar una copia local del repositorio objetivo en un directorio hermano. |
| 2 | "Prepara un plan con Superpowers para dejar listas primero las guias del repositorio, la trazabilidad de prompts y la documentacion auxiliar antes de tocar Playwright." | Definir el orden de trabajo inicial y separar la documentacion base de la implementacion E2E. |
| 3 | "Documenta el estado actual del repositorio para este ejercicio, incluyendo estructura, huecos de Playwright y necesidades de selectores estables para E2E." | Generar una referencia inicial del repo que conecte la estructura actual con los huecos detectados para Playwright. |
| 4 | "Configura Playwright en el frontend con scripts de ejecucion, reporter HTML y una base URL reutilizable para pruebas E2E." | Preparar la infraestructura minima para ejecutar specs E2E dentro del repo del ejercicio. |
| 5 | "Anade selectores `data-testid` estables en la vista `PositionDetails`, en cada `StageColumn` y en cada `CandidateCard`." | Hacer la interfaz automatizable sin depender de texto visible fragil o clases CSS. |
| 6 | "Crea un spec de Playwright para `position` que primero valide el hook del titulo, despues la carga de columnas y tarjetas, y por ultimo el movimiento de candidato con comprobacion del `PUT /candidates/:id`." | Construir las pruebas E2E siguiendo una secuencia TDD desde hooks basicos hasta el flujo completo de drag and drop. |
| 7 | "Aisla las pruebas de Playwright del backend real usando mocks de red para `interviewFlow`, `candidates` y la peticion `PUT` del cambio de fase." | Conseguir que las pruebas validen el comportamiento del frontend de forma determinista dentro del entorno local. |
