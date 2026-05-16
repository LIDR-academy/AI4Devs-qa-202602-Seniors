Feature: Position Board - Candidate Progression through Interview Stages

  Background:
    Given a position board with existing candidates and interview stages

  @happy
  Scenario: Position board loads with all stages and candidates
    When the recruiter views the position board
    Then the position title is displayed
    And all interview stages appear as columns
    And each candidate is shown in the column for its current interview stage

  @happy
  Scenario: A candidate is moved to the next interview stage
    When the recruiter moves a candidate to the next stage
    Then the candidate visually appears in the new stage column
    And a PUT request updates the candidate with applicationId and currentInterviewStep
    And the backend responds with status 200

  @sad
  Scenario: Backend failure prevents stage change
    When the recruiter attempts to move a candidate with backend error
    Then the candidate reverts to its original stage
    And an error message is displayed

  @edge
  Scenario: Reordering candidate within the same stage
    When the recruiter reorders a candidate within its current stage
    Then no PUT request is sent
    And the candidate remains in the same stage

  @edge
  Scenario: Empty interview stage renders as a drop target
    When the recruiter views the position board
    Then stages with no candidates still appear as columns
    And these empty columns accept drag-and-drop actions
