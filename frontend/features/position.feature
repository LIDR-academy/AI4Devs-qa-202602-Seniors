Feature: Position Kanban Board
  As a recruiter
  I want to view and manage candidates on the position kanban board
  So that I can track the interview pipeline for each open position

  Background:
    Given the position page for "Senior Full-Stack Engineer" is loaded with its candidates

  Scenario: Page load validation
    Then the position title "Senior Full-Stack Engineer" is visible
    And the following phase columns are displayed:
      | phase               |
      | Initial Screening   |
      | Technical Interview |
      | Manager Interview   |
    And "Mia Tanaka" is in the "Initial Screening" phase
    And "Bob Chen" is in the "Technical Interview" phase
    And "Alice Brown" is in the "Technical Interview" phase

  Scenario Outline: Drag-and-drop phase change
    When the recruiter moves "<candidate>" from "<source phase>" to "<destination phase>"
    Then a phase change request is sent for "<candidate>" to "<destination phase>"
    And the backend confirms the phase change with a successful response
    And "<candidate>" appears in the "<destination phase>" column

    Examples:
      | candidate  | source phase      | destination phase   |
      | Mia Tanaka | Initial Screening | Technical Interview |
