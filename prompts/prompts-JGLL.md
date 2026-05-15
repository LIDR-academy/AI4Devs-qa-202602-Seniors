# Prompts utilizados — JGLL

1. "Install the skill defined in https://github.com/lackeyjb/playwright-skill/blob/main/README.md, using option 2 and Project-Specific Installation"

2. "Create an E2E test using Playwright for the Position page.

Use the installed playwright-skill and follow the existing project conventions and patterns.

Test scenario: "Position page loads correctly"

The test must validate the following:

1. The Position page loads successfully.
2. The position title is visible on screen.
3. All process phase columns are displayed correctly.
4. Candidates are shown in the correct column according to their current process stage.

Additional requirements:
- Use stable selectors whenever possible (data-testid preferred).
- Avoid arbitrary waits and use proper Playwright waiting strategies.
- Keep the test readable and maintainable.
- Reuse existing helpers/fixtures if they already exist in the project.
- Add clear assertions and meaningful test descriptions.
- If mock data or API interception is already used in the project, follow the same approach.
- Generate production-quality test code.

Expected high-level flow:
- Navigate to the Position page.
- Wait until the page is fully loaded.
- Assert the position title is visible.
- Assert all expected stage columns are rendered.
- Assert each candidate appears under the correct stage column."

3. "Create an E2E test using Playwright for candidate stage movement in the Position page.

Use the installed playwright-skill and follow the existing project conventions and patterns.

Test scenario: "Candidate stage change"

The test must validate the following:

1. A candidate card can be dragged from one stage column to another.
2. The candidate card appears visually in the destination column after the movement.
3. The backend is updated correctly through:
   PUT /candidate/:id

The test must specifically validate that:
- A PUT request is triggered when moving the candidate.
- The candidate id in the request URL matches the moved candidate.
- The request body contains the new stage/phase.
- The backend response is successful.

Additional requirements:
- Use stable selectors whenever possible (data-testid preferred).
- Avoid arbitrary waits and use proper Playwright waiting strategies.
- Keep the test readable and maintainable.
- Reuse existing helpers/fixtures if they already exist in the project.
- Add clear assertions and meaningful test descriptions.
- If mock data or API interception is already used in the project, follow the same approach.
- Validate both frontend behavior and network interaction.
- Generate production-quality test code.

Expected high-level flow:
- Navigate to the Position page.
- Wait until candidates and columns are loaded.
- Identify a candidate card in its initial phase column.
- Drag and drop the candidate card into another phase column.
- Assert the candidate card is now visible in the destination column.
- Intercept and validate the PUT /candidate/:id request:
  - correct HTTP method
  - correct candidate id
  - correct updated phase in the request body
- Assert the response status is successful."

4. "Execute the the tests created and store an evidence in teh project, or a screenshot or a report in html format"
