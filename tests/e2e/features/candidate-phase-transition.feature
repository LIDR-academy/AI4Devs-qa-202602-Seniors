Feature: Recruiter advances a candidate through the hiring pipeline
  As a recruiter
  I want to move candidates between hiring phases on the pipeline board
  So that the team's view of each applicant's status stays aligned with the system of record

  Background:
    Given the hiring system is available with seeded test data
    And a published position "Senior Full-Stack Engineer" exists in the system
    And the recruiter has opened that position's hiring pipeline
    And the position's hiring pipeline defines these phases in order:
      | Applied         |
      | Interview       |
      | Technical Test  |
      | Offer           |
      | Hired           |
      | Rejected        |

  # --- Happy path scenarios ---

  @happy-path @drag-and-drop
  Scenario: Recruiter advances a candidate to the next hiring phase
    Given "John Doe" is in the "Applied" phase
    When the recruiter moves "John Doe" to the "Interview" phase
    Then "John Doe" appears under the "Interview" phase
    And "John Doe" no longer appears under the "Applied" phase
    And the candidate's phase is persisted in the system as "Interview"

  @happy-path @drag-and-drop
  Scenario Outline: Recruiter moves a candidate between non-adjacent phases
    Given "<candidate_name>" is in the "<source_phase>" phase
    When the recruiter moves "<candidate_name>" to the "<target_phase>" phase
    Then "<candidate_name>" appears under the "<target_phase>" phase
    And "<candidate_name>" no longer appears under the "<source_phase>" phase
    And the candidate's phase is persisted in the system as "<target_phase>"

    Examples:
      | candidate_name | source_phase   | target_phase   |
      | Jane Smith     | Applied        | Technical Test |
      | Carlos García  | Interview      | Rejected       |
      | John Doe       | Technical Test | Offer          |

  # --- Corner / edge case scenarios ---

  @corner-case @drag-and-drop
  Scenario: Recruiter drops a candidate back onto their current phase
    Given "Jane Smith" is in the "Interview" phase
    When the recruiter moves "Jane Smith" within the "Interview" phase without changing phase
    Then "Jane Smith" remains under the "Interview" phase
    And the candidate's phase in the system remains "Interview"

  @corner-case @drag-and-drop
  Scenario: Recruiter releases a candidate outside any hiring phase column
    Given "John Doe" is in the "Applied" phase
    When the recruiter starts moving "John Doe" but releases them outside any phase column
    Then "John Doe" remains under the "Applied" phase
    And the candidate's phase in the system remains "Applied"

  @corner-case @drag-and-drop
  Scenario: Recruiter advances the same candidate twice in succession
    Given "Carlos García" is in the "Applied" phase
    When the recruiter moves "Carlos García" to the "Interview" phase
    And the candidate's phase is persisted in the system as "Interview"
    And the recruiter moves "Carlos García" to the "Technical Test" phase
    Then "Carlos García" appears under the "Technical Test" phase
    And "Carlos García" no longer appears under the "Applied" or "Interview" phases
    And the candidate's phase is persisted in the system as "Technical Test"

  # --- Error case scenarios ---

  @error-case @network @drag-and-drop
  Scenario: Recruiter's phase change is rejected by the backend
    Given "John Doe" is in the "Applied" phase
    And the hiring system cannot accept phase updates for that candidate
    When the recruiter moves "John Doe" to the "Interview" phase
    Then "John Doe" returns to the "Applied" phase on the pipeline board
    And the candidate's phase in the system remains "Applied"
    And the recruiter is informed that the phase change could not be saved

  @error-case @network @drag-and-drop
  Scenario: Recruiter's phase change times out due to network issues
    Given "Jane Smith" is in the "Interview" phase
    And the hiring system does not respond within the expected time when saving a phase change
    When the recruiter moves "Jane Smith" to the "Technical Test" phase
    Then "Jane Smith" returns to the "Interview" phase on the pipeline board
    And the candidate's phase in the system remains "Interview"
    And the recruiter is informed that the phase change could not be completed

  @error-case @drag-and-drop
  Scenario Outline: Recruiter's invalid phase transition is rejected by the backend
    Given "<candidate_name>" is in the "<current_phase>" phase
    And the hiring system rejects advancing a candidate directly to "<invalid_target>" from "<current_phase>"
    When the recruiter moves "<candidate_name>" to the "<invalid_target>" phase
    Then "<candidate_name>" returns to the "<current_phase>" phase on the pipeline board
    And the candidate's phase in the system remains "<current_phase>"
    And the recruiter is informed that the phase change is not allowed

    Examples:
      | candidate_name | current_phase | invalid_target |
      | John Doe       | Applied       | Hired          |
      | Jane Smith     | Rejected      | Offer          |
