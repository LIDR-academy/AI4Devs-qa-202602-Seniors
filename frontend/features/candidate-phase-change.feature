Feature: Candidate moves between interview phases

  Background:
    Given the recruiter navigates to the position page

  Scenario: Candidate card moves to a new phase column
    When the recruiter drags a candidate to a different phase column
    Then the candidate card should appear in the destination column
    And the candidate card should no longer be in the source column

  Scenario: Phase change triggers a PUT request with correct data
    When the recruiter drags a candidate to a different phase column
    Then a PUT request should be sent to the candidates endpoint
    And the request body should contain the new interview step
    And the request body should contain the application id

  Scenario: Backend confirms the phase change
    When the recruiter drags a candidate to a different phase column
    Then the backend should respond with a successful status
