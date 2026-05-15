# Prompts utilizados — [CFGP]

1. `/create-instructions conventional commits`
2. Agent: playwright-test-planner `I need to test that the position page loads correctly: position title is shown, the columns process are present and the candidates are shown in their correct phase.`
3. Agent: playwright-test-generator `Generate tests for position page`
4. Agent: playwright-test-planner ´I need test to validate when a candidate is moved between phases: A candidate can be drad and dropped from one column to other, the candaidate is shown in the new column, there is a request to the backend to the proper endpoint with the proper params and the backed responds succesfully.´
5. Agent: playwright-test-generator `Generate tests for candidate drag and drop`
