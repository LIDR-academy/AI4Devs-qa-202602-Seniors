# Prompts Used — LR

1. I want to create a claude.md as an orchestrator agent for implementing e2e tests in a project with a React frontend and Node.js backend. The project has sufficient documentation to understand architecture, technologies, and tasks to complete. Can you help me create this agent acting as a prompt engineering expert with meta-prompting techniques? Can you ask me what you need for the task?

Q: Which E2E testing framework are you going to use?
A: Playwright

Q: How are subordinate agents organized?
A: I'm not sure yet

Q: What information does the agent have available in the project? (Select all applicable options)
A: README with architecture

Q: What is the expected workflow of the orchestrator? What should it do first, second, etc.?
A: Read docs → analyze → plan tests → delegate implementation → validate

Q: What level of autonomy should the orchestrator have?
A: Medium: ask when facing ambiguities or critical decisions

Q: What critical constraints or behaviors must it respect? (Select all applicable options)
A: Do not run destructive commands (drop DB, rm, etc.), Respect project naming conventions, Generate report/summary at the end

Q: Where should Playwright test files be created?
A: Where the README specifies

Q: What is the success criterion to consider tests complete?
A: Based on tasks defined in the README

2. CLAUDE.md
3. openspec/specs/project.md, openspec/changes/implement-position-e2e-tests/design.md, openspec/changes/implement-position-e2e-tests/proposal.md, openspec/changes/implement-position-e2e-tests/tasks.md

4. "Install Playwright for me. Here's the link: https://playwright.dev/docs/intro"

5. "Propose a new change with all artifacts generated in one step - CLAUDE.md" (using /opsx:propose skill to create the change specification)

6. "Implement tasks from an OpenSpec change" (using /opsx:apply skill to implement the E2E tests)

7. The implementation included creating:
   - playwright.config.ts with headless parallel workers configuration for Chrome, Firefox, and WebKit
   - helpers.ts with TestDataManager class for dynamic test data creation via API
   - cleanup.ts with TestCleanup class for test data teardown
   - position.spec.ts with 13 test cases covering:
     - Position page load validation (title, columns, candidate distribution)
     - Candidate phase change via drag-and-drop with API verification
     - Support for all three browsers in parallel mode
     - Dynamic test data creation (no hardcoded IDs)
     - Proper test isolation with beforeEach/afterEach hooks
