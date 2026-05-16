## ADDED Requirements

### Requirement: Candidate card can be dragged between columns
The system SHALL support drag-and-drop interaction to move a candidate from one phase column to another.

#### Scenario: Successful drag and drop
- **WHEN** a candidate card is dragged from one phase column to another
- **THEN** the card moves to the target column visually

### Requirement: Backend is notified of phase change
The system SHALL send a PUT request to the backend when a candidate is moved to a new phase.

#### Scenario: PUT request includes correct data
- **WHEN** a candidate is dragged to a new phase
- **THEN** a PUT request is sent to `/candidate/:id` with the new phase in the request body

#### Scenario: Request uses correct HTTP method
- **WHEN** a candidate phase is changed via drag and drop
- **THEN** the HTTP method of the backend request SHALL be PUT

#### Scenario: Correct candidate ID is used
- **WHEN** a candidate is dragged to a new phase
- **THEN** the PUT request URL contains the correct candidate ID

### Requirement: Backend response is handled successfully
The system SHALL handle the backend response after a phase change request.

#### Scenario: Successful response updates UI state
- **WHEN** the backend returns a 2xx status code for the PUT request
- **THEN** the candidate card remains in the new column and the UI reflects the successful update

#### Scenario: New phase is reflected in request body
- **WHEN** a candidate is moved to a new phase via drag and drop
- **THEN** the request body SHALL contain the new phase identifier
