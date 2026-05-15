Feature: Application smoke test

  Scenario: Application loads successfully
    Given the application is running
    Then the page title should be visible
