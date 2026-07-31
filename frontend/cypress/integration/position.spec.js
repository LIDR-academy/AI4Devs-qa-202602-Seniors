const POSITION_TITLE = 'Senior Full-Stack Engineer';
const API_URL = 'http://localhost:3010';

const dragCandidateToAdjacentStage = (candidateSelector, direction) => {
  const keyEvent = (key, code, keyCode) => ({
    key,
    code,
    keyCode,
    which: keyCode,
    force: true
  });

  cy.get(candidateSelector)
    .focus()
    .trigger('keydown', keyEvent(' ', 'Space', 32))
    .trigger(
      'keydown',
      direction === 'right'
        ? keyEvent('ArrowRight', 'ArrowRight', 39)
        : keyEvent('ArrowLeft', 'ArrowLeft', 37)
    )
    .trigger('keydown', keyEvent(' ', 'Space', 32));
};

describe('Position hiring process', () => {
  let position;
  let interviewFlow;
  let candidates;
  let cleanup;
  let candidateMovedSuccessfully;

  beforeEach(() => {
    cleanup = null;
    candidateMovedSuccessfully = false;

    cy.request(`${API_URL}/positions`).then(({ body: positions }) => {
      position = positions.find(({ title }) => title === POSITION_TITLE);
      expect(position, `seeded position ${POSITION_TITLE}`).to.exist;

      cy.intercept('GET', `${API_URL}/positions/${position.id}/interviewFlow`, (request) => {
        delete request.headers['if-none-match'];
      }).as('getInterviewFlow');
      cy.intercept('GET', `${API_URL}/positions/${position.id}/candidates`, (request) => {
        delete request.headers['if-none-match'];
      }).as('getCandidates');
      cy.visit(`/positions/${position.id}`);

      cy.wait('@getInterviewFlow').then(({ response }) => {
        expect(response.statusCode).to.eq(200);
        interviewFlow = response.body.interviewFlow;
      });

      cy.wait('@getCandidates').then(({ response }) => {
        expect(response.statusCode).to.eq(200);
        candidates = response.body;
      });
    });
  });

  afterEach(function () {
    if (!candidateMovedSuccessfully || !cleanup) {
      return;
    }

    const originalTestFailed = this.currentTest.state === 'failed';

    cy.window({ log: false }).then((win) =>
      win.fetch(`${API_URL}/candidates/${cleanup.candidateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId: cleanup.applicationId,
          currentInterviewStep: cleanup.originalStepId
        })
      }).then((response) => {
        if (!response.ok) {
          throw new Error(`Candidate cleanup failed with HTTP ${response.status}`);
        }
      }).catch((error) => {
        if (!originalTestFailed) {
          throw error;
        }

        Cypress.log({
          name: 'cleanup',
          message: `Cleanup also failed: ${error.message}`
        });
      })
    );
  });

  it('displays the position title, every hiring stage, and candidates in their current stage', () => {
    cy.get('[data-testid="position-title"]').should('have.text', interviewFlow.positionName);

    const steps = interviewFlow.interviewFlow.interviewSteps;
    cy.get('[data-testid^="stage-column-"]').should('have.length', steps.length);

    steps.forEach((step) => {
      cy.get(`[data-testid="stage-column-${step.id}"]`)
        .should('contain.text', step.name);
    });

    candidates.forEach((candidate) => {
      const currentStep = steps.find(({ name }) => name === candidate.currentInterviewStep);
      expect(currentStep, `stage for ${candidate.fullName}`).to.exist;

      cy.get(`[data-testid="stage-column-${currentStep.id}"]`)
        .find(`[data-testid="candidate-card-${candidate.candidateId}"]`)
        .should('contain.text', candidate.fullName);
    });
  });

  it('moves a candidate to another stage and persists the destination stage', () => {
    const steps = interviewFlow.interviewFlow.interviewSteps;
    const candidate = candidates[0];
    const sourceStep = steps.find(({ name }) => name === candidate.currentInterviewStep);

    expect(sourceStep, `current stage for ${candidate.fullName}`).to.exist;

    const sourceStepIndex = steps.findIndex(({ id }) => id === sourceStep.id);
    const destinationStepIndex = sourceStepIndex < steps.length - 1
      ? sourceStepIndex + 1
      : sourceStepIndex - 1;
    const destinationStep = steps[destinationStepIndex];
    const dragDirection = destinationStepIndex > sourceStepIndex ? 'right' : 'left';

    expect(destinationStep, 'a different destination stage').to.exist;

    cleanup = {
      candidateId: candidate.candidateId,
      applicationId: candidate.applicationId,
      originalStepId: sourceStep.id
    };

    const candidateSelector = `[data-testid="candidate-card-${candidate.candidateId}"]`;
    const sourceSelector = `[data-testid="stage-column-${sourceStep.id}"]`;
    const destinationSelector = `[data-testid="stage-column-${destinationStep.id}"]`;

    cy.get(sourceSelector)
      .find(candidateSelector)
      .should('contain.text', candidate.fullName);

    cy.intercept('PUT', `${API_URL}/candidates/${candidate.candidateId}`).as('updateCandidateStage');
    dragCandidateToAdjacentStage(candidateSelector, dragDirection);

    cy.wait('@updateCandidateStage').then(({ request, response }) => {
      candidateMovedSuccessfully = response.statusCode >= 200 && response.statusCode < 300;

      expect(request.method).to.eq('PUT');
      expect(request.body).to.deep.equal({
        applicationId: candidate.applicationId,
        currentInterviewStep: destinationStep.id
      });
      expect(response.statusCode).to.eq(200);
      expect(response.body.data.currentInterviewStep).to.eq(destinationStep.id);
    });

    cy.get(destinationSelector)
      .find(candidateSelector)
      .should('contain.text', candidate.fullName);
    cy.get(sourceSelector).find(candidateSelector).should('not.exist');
  });
});
