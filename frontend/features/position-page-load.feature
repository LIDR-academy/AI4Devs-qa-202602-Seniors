Feature: Position page displays correctly

  Background:
    Given the recruiter navigates to the position page

  Scenario: Position title is visible
    Then the position title should be displayed

  Scenario: All interview phase columns are displayed
    Then all phase columns should be visible
    And each column should display its phase name

  Scenario: Candidate cards appear in their correct phase column
    Then each candidate card should be inside its corresponding phase column
    And each candidate card should display the candidate name
