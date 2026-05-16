Feature: Position Board Kanban Management

  Background:
    Given I navigate to the positions page
    And the position board has loaded with all interview stages

  @happy
  Scenario: Position board loads correctly with all stages and candidates
    Then I see the position title is displayed
    And all interview stages are rendered as columns
    And each candidate appears in the column matching their current interview stage

  @happy
  Scenario: A candidate is moved to the next interview stage
    When I move the candidate from "Applied" to "Interview"
    Then the candidate appears in the "Interview" column
    And a PUT request was made to update the candidate stage
    And the request body contains the correct applicationId and currentInterviewStep
    And the backend responds with a 2xx status

  @sad
  Scenario: Backend fails to update candidate stage
    When I attempt to move a candidate to a new stage
    And the backend returns a 500 error
    Then the candidate remains in their original stage
    And an error message is displayed to the user

  @edge
  Scenario: Reordering candidate within the same interview stage
    When I reorder a candidate within the same "Interview" stage
    Then no PUT request is made to the backend
    And the candidate's position in the column is updated

  @edge
  Scenario: Empty interview stages render as drop targets
    Then I see the "Offer" stage column is displayed
    And the "Offer" column has no candidates
    And the "Offer" column is a valid drop target for drag-and-drop
