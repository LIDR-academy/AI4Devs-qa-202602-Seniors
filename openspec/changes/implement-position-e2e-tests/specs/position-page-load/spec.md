## ADDED Requirements

### Requirement: Position page displays correct title
The system SHALL display the position title prominently when the position page loads.

#### Scenario: Title is visible
- **WHEN** the position page loads
- **THEN** the position title is displayed in the page header

### Requirement: Hiring phase columns are rendered
The system SHALL display columns for each hiring phase in the Kanban board.

#### Scenario: All phase columns are present
- **WHEN** the position page loads
- **THEN** columns for all hiring phases (Aplicado, Entrevista, Prueba Técnica, Oferta, Contratado, Rechazado) are displayed

### Requirement: Candidate cards appear in correct columns
The system SHALL display candidate cards in the column matching their current phase.

#### Scenario: Candidates are distributed by phase
- **WHEN** the position page loads with existing candidates in various phases
- **THEN** each candidate card appears in the column corresponding to their current phase

#### Scenario: Empty columns are handled gracefully
- **WHEN** a hiring phase has no candidates assigned
- **THEN** the column is displayed empty but remains visible
