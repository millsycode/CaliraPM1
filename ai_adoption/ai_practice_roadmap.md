# AI practice roadmap
**Oct 28, 2026 @Lily**

## My position
I recommend pausing the push for more AI for now. It is not clear what problem more AI would solve: development is doing fine as it is. Where AI use does need work is QA, so that is where to start. If stakeholders want to see AI in use, regression automation already follows current best practice (listed below). More AI work without training and structure is more likely to create problems than to solve one.

## AI work is writing work
Every practice in this roadmap depends on plain English: context files, rules, plans, and reading and correcting what an agent produces. Someone has to write it, keep it current and review the output. Without that, the tools produce work faster than anyone can check it. I am not convinced the development team wants to take this on at the moment, and without it the rest will not work.

## It has a price, and we do not know it yet
Every step here costs money and time, and none of it is budgeted. Qure is free today; the quoted price is about 90 USD a month for a single user, and real usage may need a higher tier. Each further practice adds licenses, usage-based model costs, and hours spent writing and reviewing context. Unstructured attempts cost the most, because their output has to be redone. Spending this without a clear problem to solve is hard to justify.

## What regression automation already does:
* An engineered agent loop: Qure writes each test from a manual case, runs it, reads the failure, fixes and reruns, with a human reviewing before merge.
* Written rules the agent follows: 18 rule files in .qure/rules (framework, selectors, page objects, fixtures, isolation, test creation).
* Memory of known failures: a failure catalog, so environment problems are not hidden by changing selectors or waits.
* Structured context: per-feature notes in agent-context/ and 18 docs in docs/ covering behaviour, test data and decisions.
* Plan before code: written test and implementation plans before automation starts (for example equipment transfer, email invitations).
* Reusable skills: the monthly automation update and the review-apps lookup are repeatable agent workflows.
* Runs unattended: CI on review apps, TestRail and Slack reporting, automatic booking cleanup, staging-safe runs.

Six months, part time: 202 manual cases automated and 167 memories written. Each memory is a short note with recall cues for future work: why a decision was taken, a gotcha that was found, an app quirk the tests work around. They are the kind of writing item 1 asks for, produced as a by-product of the work. Today they live on one machine; moved into shared context files, they would serve developers, QAs and agents alike.

The roadmap below is how AI use could grow from here, if and when the team is ready. Six practices, in order, each built on written context and human review. The first can start next sprint; each later one depends on the ones before it.

## Principles
AI output is only as good as the context it gets and the checks it passes.

* **Write it down first.** Business rules, roles, test data and decisions live in files that people and agents both read.
* **Plan before generating.** Agree on what will be produced and how it will be checked before any code or test case is written.
* **Check against the real product.** Nothing generated counts until it has run against the app or been reviewed against it.
* **Keep a human in the loop** for anything that writes, publishes or sends.
* **Prefer plain, portable formats.** Markdown, repo files and standard test frameworks, so any person or tool can pick the work up.
* **Measure.** Track production bugs per 100 MRs and bugs caught before release, and judge each practice by them.

---

## 1. Context files first
Start writing down what the team knows, in files developers, QAs and agents all read; no automation yet. This can start next sprint, but not on a revenue-critical feature with a tight deadline.

### What and where
* One shared app-logic layer first: roles and permissions, lab and account scoping, booking rules, equipment states, integrations. Every feature context builds on it.
* Then one context file per feature or milestone, written before development starts and updated when behavior changes.
* One place, for example a `context/` folder in the app repo: `roles.md`, `business-rules/bookings.md`, `features/<feature>.md`. The e2e repo links to it instead of repeating it.
* Reviewed like code, in merge requests, with a named owner per file.
* Rails benefits as much as any stack. Conventions say where code goes, not what the business rules are.

### Reusing the e2e docs
About a third of the e2e docs is product behaviour developers can use; the rest is test-only (page objects, cleanup, reporting).

| Product facts already written down | Source in calira-e2e |
| :--- | :--- |
| Earliest booking start uses the user's current time; business hours are a user setting | `agent-context/earliest-booking-start.md` |
| Homepage calendar uses the browser timezone; lab and equipment calendars use the lab timezone. A slot that looks free in the UI can still conflict in the backend. 30-minute booking start step, both journeys. Quick release from the Lab Dashboard | `agent-context/repository-rules.md`, `docs/booking-conflicts.md`, `docs/start-step-bookings.md`, `docs/lab-dashboard-quick-release-test.md` |
| What resets when equipment moves to another lab | `docs/equipment-transfer-test-plan.md` |
| Project selection, multiple-equipment booking, QR codes | `docs/project-booking-selection.md`, `docs/multiple-equipment-booking.md`, `docs/equipment-qr-codes.md` |
| Staging labs, users and equipment and why they exist | `docs/lab-recovery.md` |

The structure is reusable too: one rules file, one note per feature, and gotcha notes that say why each rule exists.

### How it goes wrong
* **Out of date:** behaviour changes and the file does not, so agents confidently build the old behaviour.
* **Copied from AI output unchecked:** a wrong fact in a context file is repeated in every case and change built on it.
* **Intended, not actual:** the file describes the design or the ticket, not what the app does.
* **Written from the code:** it describes implementation, not the product rule, and inherits existing bugs.
* **Duplicated:** the same rule in three repos, slowly disagreeing.
* **Too long:** everything is in it, so the important rules get lost.
* **Secrets or customer data:** tokens, IDs or customer names pasted in.
* **No owner:** nobody is responsible for keeping it right.
* **Conflicting instructions:** one file says one thing and another the opposite, and the agent picks one.

### Training before automation
Before any context file feeds an automated agent, the team needs a short shared practice: what belongs in a context file, how to verify a fact against the app, how to review one, and when to update it. Start with people reading and writing them by hand for a few sprints.

---

## 2. Manual test case pipeline
Generate manual test cases through a writer, a reviewer and a human, and let the system learn from every human correction.

1. **Writer skill.** Reads the feature's context file, the ticket and the designs. Every case must have preconditions, named test data, an expected result per step, observable wording (what the tester sees, not what the code fetches), one outcome per case and a real ticket reference.
2. **Reviewer skill, run separately from the writer.** Checks each case against those rules and against staging: vague outcomes ("correct", "as expected"), hedges ("or equivalent"), UI names that do not exist, duplicates of existing cases.
3. **Loop.** Failed cases go back to the writer with the reviewer's notes, for a fixed number of rounds. Output: a suite marked ready for human review, plus a list of what still failed.
4. **Human review.** A QA corrects anything wrong and publishes to TestRail, recording AI use in the AI Model and AI Type fields.
5. **Learning from corrections.** An agent compares the published cases with the generated ones and proposes new writer or reviewer rules from each correction. A human approves every rule before it is added.

Start with one feature that has a good context file, and compare the time spent against writing the cases by hand.

---

## 3. Agent-agnostic API tests
API tests should follow the same practice as the e2e suite: plain code in a repo, so any QA or any AI tool can run and extend them.

Done looks like this:
* Plain Playwright API specs, one per resource, in an `external-api/` folder.
* Shared helpers written once: authentication per role, creating bookings, notes and uploads, cleanup.
* Context in repo files, not in one person's agent session: endpoint rules, confirmed responses, test data.
* Runs unattended in CI against staging and review apps, with tokens from CI secrets and automatic cleanup.
* Reports to TestRail and Slack like the e2e suite.
* Readable: a test is about 15 lines; a new QA can understand and change one in an afternoon.
* Closed API bugs become regression tests first.
* Postman stays useful for exploring new endpoints by hand. Confirmed cases move into the specs.

---

## 4. Loop engineering
Loop engineering means designing the cycle an agent runs (act, check, adjust, repeat) instead of writing one-off prompts. A good first use is triaging e2e pipeline failures automatically.

### What an engineered loop has
* **A trigger:** what starts it, such as a pipeline finishing.
* **Context:** the rules and known patterns it works from.
* **Actions:** the tools it may use, ideally read-only.
* **A check:** something outside the agent that says whether the result is right, such as a test run or a reviewer.
* **Stop conditions:** success, a maximum number of rounds, or a budget.
* **Memory:** what it learns is written back as rules a human approves.
* **A human checkpoint** before anything is changed or published.

### Qure is already one
Qure, the tool used to build the e2e suite, has these parts. It starts from a manual test case, works from the repo's rules in `.qure/rules` (framework, selectors, page objects, fixtures), writes the test, runs it, reads the failure, and fixes and reruns until it passes. Its `test-failure-catalog.md` is the memory: known failures and their real causes, so a missing lab setting is not "fixed" by changing a selector. The human reviews before anything is merged.

### The monthly automation update is another
The automation-update skill builds the monthly report for the all-hands, and it is a loop that runs month over month with little human input.

* **Trigger:** a scheduled task every Tuesday and Wednesday at 09:00. It continues only on the Tuesday before the all-hands (or the Wednesday after, to catch a missed run).
* **Context:** fixed counting rules, a map of spec files to feature areas, the current goal, and last month's published snapshot.
* **Actions, read-only:** lists the tests without running any, compares the counts with last month, and reads the merged work from git.
* **Output:** a report and a "By the numbers" dashboard. Anything a person would normally answer becomes a marked note to fill in.
* **Checks:** a converter rejects malformed report markup; the created Confluence draft is read back and verified.
* **Stop conditions:** wrong day, this month already published, or the repo not clean and up to date. It stops and notifies instead of fixing things itself.
* **Human checkpoint:** it only ever creates a Confluence draft. A person reviews and publishes.
* **Memory:** after publishing, it saves a snapshot taken from the page as published, including the person's edits. Next month starts from that, so carried-over items and corrections feed the next run.

### First use: post-pipeline failure triage
1. **Trigger:** the e2e pipeline finishes with failures.
2. **Read:** the Playwright report and traces, TestRail results, the Slack summary and the failure catalog.
3. **Classify each failure:** product bug, flaky test, environment (for example a staging 429 rate limit or a payment-plan lock banner), or test data.
4. **Check, read-only:** rerun a suspected race with tracing off, check whether the same case failed on previous runs, look for a matching known pattern.
5. **Report:** one summary per run in Slack, with a suggested next step per failure.
6. **Learn:** when a human disagrees with a classification, propose a new catalog entry.

The same loop works for development pipelines: unit test failures, build errors and deploy checks.

---

## 5. Context from designs
Generating a first draft of a feature's context file from Figma is an established practice and worth a pilot on one new feature.

* **How:** Figma's Dev Mode MCP server gives an agent a design's layout, components, design tokens and, through Code Connect, the code component each design element maps to.
* **What designs give:** screens, components, copy, visual states.
* **What they leave out:** business rules, permissions, empty and error states, edge cases, and which version is final.
* **New feature:** generate the draft, then the FE developer, the designer and a QA add the rules and states before development starts.
* **Change to an existing feature:** designs show the new state, not what changes. Use them alongside the feature's existing context file.
* **Prerequisites:** designs built from real components and variables; Dev Mode seats.

---

## 6. Connectors
Connect the tools each workflow needs, read-only where possible, and remove manual copy-and-paste from safe reads. Do not connect everything everywhere.

* **Good targets:** reading Jira and GitLab issues, TestRail cases and results, Sentry errors, pipeline logs, and searching Slack.
* **Read-only is about permissions, not intent.** A connector acts with the account's full rights unless its permissions are actually limited.
* **What an agent reads can steer it.** Bug reports, Slack messages and customer text can contain instructions. That is harmless when the session can only read, and risky when it can also write or send.
* **Customer data reaches the AI provider.** Check this against our customer contracts and privacy obligations.
* **More tools, worse agents.** Each connected tool adds choices and cost; connect per workflow.
* **Writes, publishes and messages always need a human approval.**

---

## Multi-agent work
Multi-agent work is a real practice with real benefits, but it only pays off once context files and simple loops are in place, so it is not for now.

### What it gives
* **Separate writer and reviewer.** A reviewer that did not write the work does not share the writer's assumptions, so it catches more.
* **Parallel independent work.** Separate agents handle separate parts at the same time.
* **Smaller context per agent.** Each agent sees only its part of a large codebase, which keeps it focused and accurate.

### How it relates to loops
Most engineered loops already have two roles: one that produces and one that checks. Running the checker as its own agent is the simplest multi-agent setup. The manual test case pipeline (item 2) is exactly that: a writer and a reviewer in a loop, with a human at theend.

### How it would fit a legacy monorepo
* One agent per area of the code (for example bookings, equipment, billing, API), each with that area's context file.
* A shared app-logic context file that every agent reads.
* A separate reviewer agent that checks changes against the business rules, not just the code style.
* Clear boundaries: an agent only changes code in its own area; changes that cross areas go to a human.

### Why not yet
Without context files, every agent guesses, and several agents guessing in parallel multiply the mistakes. Coordination also costs time and money. Context files (item 1) and one working loop (item 2 or 4) come first.