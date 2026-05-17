Feature: Tablero Kanban de gestión de candidatos por fase de entrevista
  Como reclutador de la empresa
  Quiero visualizar y gestionar el proceso de selección en un tablero Kanban
  Para mover candidatos entre las distintas fases del proceso de entrevista
  y mantener el estado actualizado en el sistema

  Background:
    Given el reclutador accede al tablero de la posición "Senior Full-Stack Engineer"

  Scenario: Carga correcta del tablero Kanban con fases y candidatos
    Then el título de la posición es visible en la página
    And todas las fases del proceso de selección están representadas como columnas
    And cada candidato aparece en la columna correspondiente a su fase actual

  Scenario: Mover un candidato a la siguiente fase del proceso
    Given el candidato "Carlos García" se encuentra en la fase "Initial Screening"
    When el reclutador mueve al candidato "Carlos García" a la fase "Technical Interview"
    Then el candidato "Carlos García" aparece en la columna "Technical Interview"
    And el sistema registra el cambio de fase del candidato en el backend
