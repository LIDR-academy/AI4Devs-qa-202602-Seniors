Feature: Position hiring board
  Recruiters need to review a position's hiring board
  so they can understand where each candidate is in the hiring process.

  Background:
    Given the position "Senior Full-Stack Engineer" has the following hiring stages:
      | stage               |
      | Initial Screening   |
      | Technical Interview |
      | Manager Interview   |
    And the position has the following candidates:
      | candidate     | stage               |
      | Carlos Garcia | Initial Screening   |
      | John Doe      | Technical Interview |
      | Jane Smith    | Technical Interview |

  Scenario: Position page shows candidates in their current hiring stages
    When the recruiter opens the position hiring board
    Then the position title "Senior Full-Stack Engineer" should be shown
    And the hiring stages should be shown
      | stage               |
      | Initial Screening   |
      | Technical Interview |
      | Manager Interview   |
    And the candidates should be shown in their current hiring stages
      | candidate     | stage               |
      | Carlos Garcia | Initial Screening   |
      | John Doe      | Technical Interview |
      | Jane Smith    | Technical Interview |

  Scenario: Candidate is moved to another hiring stage
    Given the candidate "Carlos Garcia" is in the "Initial Screening" hiring stage
    When the recruiter moves "Carlos Garcia" to the "Technical Interview" hiring stage
    Then "Carlos Garcia" should be shown in the "Technical Interview" hiring stage
    And the candidate stage change should be saved successfully
