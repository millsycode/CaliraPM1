# AI adoption: a QA view
**Oct 28, 2026 @Lily**

Do not expand developer AI next sprint. First fix how QA uses AI and bring production quality back to its 2023-2024 level. Production bugs per 100 merged MRs rose from 16.6 in 2023 to 25.2 in 2026, and AI tools were part of how the team worked during that period. 

Draft 1: start dates for AI use are still to be confirmed.

## Quality trend, 2023-2026

Fewer bugs are caught before release and more reach production, while QA headcount stayed at about two and developers per QA halved.

| Year | Devs (avg/month) | QA (avg/month) | Merged MRs | MRs per dev-month | Caught before release per 100 MRs | Caught before release per QA-month | Production bugs per 100 MRs | Share found in production | Labelled client-reported (minimum) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2026 (to 27 Oct) | 4.2 | 2.3 | 468 | 11.2 | 26.7 | 5.4 | 25.2 | 49% | 24 |
| 2025 | 5.0 | 2.0 | 777 | 12.9 | 35.4 | 11.2 | 22.8 | 39% | 25 |
| 2024 | 5.2 | 2.0 | 759 | 12.2 | 43.3 | 13.7 | 16.7 | 28% | 13 |
| 2023 | 7.2 | 1.9 | 849 | 9.9 | 49.4 | 18.2 | 16.6 | 25% | label not in use |

* Developers per QA fell from 3.7 (2023) to 1.8 (2026). Lack of QA capacity does not explain the drop in bugs caught before release. Based on the bug ledger, developer output per person rose about 25% in 2024-2025: 9.9 MRs per dev-month in 2023, 12.2 in 2024, 12.9 in 2025. In 2026 so far it is 11.2, about 13% above 2023. MR size is not measured.
* Client-reported bugs are a minimum. Customer success raises many issues in Slack and QA logs them, so the reporter field shows who logged a bug, not who found it.
* Excluding 13 external API bugs labelled as production issues in 2026, production bugs per 100 MRs is 22.4. The trend is the same.

## What "25% fewer bugs" means

Total bugs did fall, but merged work fell almost as much, and the bugs that disappeared are the ones caught before release.

| 1 Jan-27 Oct | Bugs logged | Merged MRs | Production bugs per 100 MRs |
| :--- | :--- | :--- | :--- |
| 2026 | 243 | 468 | 25.2 |
| 2024 | 374 | 636 | 16.0 |
| Change | -35% | -26% | +58% |

A lower bug count is not a quality improvement here. It reflects less work shipped and fewer bugs caught before release, while more reach production.

## Regression suite since November 2025

Since November 2025, 87% of new regression cases are machine-like, and most cannot be run or automated without rework.

| Created | Cases | Machine-like | Share |
| :--- | :--- | :--- | :--- |
| 2026 H2 | 126 | 105 | 83% |
| 2026 H1 | 125 | 107 | 86% |
| 2025 Dec | 23 | 23 | 100% |
| 2025 Nov | 255 | 224 | 88% |
| Before Nov 2025 | 674 | 0 | 0% |

The suite has 1,203 cases: 459 machine-like and 736 human-like. All 459 machine-like cases were created from November 2025 on. November 2025 alone added 255 cases (C108878-C109372), more than any other month.

## What is wrong with the machine-like cases

1. **Expected results only at the end.** In the first batch, 207 of 208 cases have an expected result only on the last step. A tester cannot tell where a case broke.
2. **Outcomes that cannot pass or fail.** 11% use "correct", "appropriate" or "as expected" without defining them (3% of human cases). Example: C109100, "all access groups and their actions work as expected".
3. **No preconditions or test data.** Preconditions appear in 0-4% of machine-like cases, against 96% of human free-form cases. Only 13% name a concrete value, against 31%.
4. **Wording from the code, not the screen.** 4% describe things a tester cannot see, such as C109213 "group data is fetched" (1% of human cases).
5. **Two outcomes in one case.** 5% cover opposites like "turned on or off" (C109035-C109039). No human case does this.
6. **Guessing at the UI.** 3% hedge, for example C109210 "Click Create Weblink invitation or equivalent action". No human case does this.
7. **Mismatches with the app.** C109025 points to a "Users tab" that does not exist. Only this case has been checked against staging so far.
8. **Duplicates between batches.** For example C109359-C109362 and C132057-C132060 have identical titles.
9. **Placeholder references.** "0000" in the References field of 44-64% of later machine-like cases (about 1% of human cases). The link to the requirement is lost.

## Worked example: C109025

| | TestRail case | Automated test |
| :--- | :--- | :--- |
| **Where** | "Users tab" (does not exist) | User access tab |
| **Check** | "Verify the correct users role are displayed" | Lists exactly the Admins ("No access group required") and the access group's members, each with their role |
| **Preconditions** | None | Lab uses both access paths; some users lack access; the group is the equipment's only access group |

Every machine-like case needs this kind of investigation before it can be run or automated. Human cases have weaknesses too (stale "as per design" Figma links, duplicates, very terse cases), but they are usually runnable.

## External API collection

The API testing finds real bugs, but the AI-generated Postman collection it lives in cannot be maintained, run automatically or handed to another QA.

### What it delivered
34 of the 38 external API bugs ever logged came from this testing, almost all since July 2026. 19 are closed. 
Several are serious: #7134 training records visible to non-admins, #7087 a booking owner can edit an admin's note, #7109 a maintenance contract from another lab is accepted, #6931 deleted equipment can be updated.

### Why it will not last

| Issue | Evidence |
| :--- | :--- |
| **Generated, not run against the API** | READMES: "No live API calls... were made while generating this collection." Checks were replayed against made-up responses (2,399 "synthetic assertions" for one story). |
| **Size** | One story (6985) is 6.2 MB: 152 requests, about 46,000 lines of script. Only 48 requests are tests; 104 are setup. |
| **One script copied everywhere** | All 152 requests carry the same ~300-line script; only line 1 differs. Any change means editing 152 copies or regenerating. |
| **Duplicates** | Three story folders are copied byte-for-byte inside other folders. |
| **Documentation drift** | The 6985 README says 180 requests; the collection has 152. |
| **Manual setup every run** | Tokens per role (2-hour expiry), files selected by hand, a working directory on one person's machine, equipment slots cleaned by hand. |
| **Tied to a temporary environment** | Six collections hard-code Review 5975 data and refuse to run elsewhere. |
| **Results look greener than they are** | Unconfirmed checks are skipped as "Manual verification required", not failed. |
| **No CI** | Interactive login, hand-picked files and the environment lock prevent automated runs. |

For comparison, a Playwright API test for case U01a would be about 15 lines plus shared helpers, against about 300 lines in the collection. The test plans, confirmed behaviours and sample files can be reused; the generated scripts cannot.

## Claims from the team session

Of the three claims, one holds, one is misleading and one is contradicted by our own bugs.

| Claim | What the evidence shows | Verdict |
| :--- | :--- | :--- |
| **25% fewer bugs than two years ago** | Merged work fell by almost as much; production bugs per 100 MRs rose 58% (see above). | Misleading |
| **Rails cannot benefit from context files, because of convention over configuration** | Conventions cover where code goes, not our business rules. Many API bugs break exactly those rules: #6947 booking increments, #6962 weekly booking limit, #6955 equipment schedule, #7134 who can see training records. | Contradicted |
| **No need for multi-agent work** | Nothing in our data argues for it yet. | Holds |

The invited speaker's practices (document everything, give structured context, plan before coding) match the approach used for the e2e automation suite.

## Why Rails benefits from context files

Convention over configuration tells an agent where code goes and how it is named. It says nothing about what this product must do, and that is what agents get wrong.

* Business rules are not conventions. Booking increments, weekly limits, earliest start, edit periods, schedules and who may see what are product decisions. Rails cannot infer them from file layout, and our API bugs break exactly these: #6947, #6951, #6955, #6961, #6962, #6963, #7134.
* Rails hides behaviour by design. Callbacks, concerns, default scopes and metaprogramming run code that is not visible where it takes effect. An agent reading one model or controller misses what happens around it unless a context file points to it.
* Every large app departs from convention. Service objects, custom validators, API versions, OAuth setup, background jobs and legacy workarounds are local decisions an agent has to be told about.
* Tenancy and permissions are domain knowledge. Which lab or account a record belongs to, and which role can act on it, has to be stated; the framework only provides the tools.
* Not every rule is in the database. Rules enforced in only one code path, or only in the UI, are invisible to an agent working on another path. Several API bugs are rules the UI enforces and the API did not.

Conventions make context files more effective, not unnecessary. Because Rails code is predictable, a short context file that lists the rules and the exceptions goes a long way. 

In short: Rails conventions answer "where", context files answer "what and why".

## Start, never, future

Start with QA's use of AI and quality tracking; leave more developer AI until production quality recovers.

### Start next sprint
1. Context files for the app and test repos: business rules, roles and permissions, test data, environments.
2. A review gate before any AI-written test case enters TestRail: preconditions, concrete test data, an expected result per step, a real ticket reference, and a check against staging.
3. Record AI use in TestRail's AI Model and AI Type fields. Today only 5 cases use them.
4. Triage the November 2025 batch, starting with the cases planned for automation.
5. Move confirmed external API cases into Playwright API tests that run in CI, starting with the 19 closed API bugs as regression checks.
6. Track monthly: production bugs per 100 MRs, bugs caught before release per 100 MRs, and client-reported bugs, with the client label applied consistently.

### Never
* Accept AI-generated tests or test cases that have not been run against the real product.
* Generate test cases in bulk from code or MR descriptions without product context.
* Keep AI-generated material that only one person or one tool can maintain.
* Use the raw bug count as a measure of quality.

### Future, once quality recovers
More developer AI should wait until production bugs per 100 MRs is back near 16-17 (the 2023-2024 level) for three months in a row; the threshold is a proposal. The longer-term plan is in the AI practice roadmap.

## Limits of this evidence

The data shows when things changed and that AI was in the picture; it does not show that AI caused the decline.

* Other changes at the same time. Tagged production releases start in November 2024 and run about weekly from 2025, when production bugs jumped. Developers were laid off in June 2023 and July 2026.
* Timing. The biggest jump in production bugs (Nov 2024 - Oct 2025) comes before the machine-like test cases (from November 2025).
* Labels. "Production issue" and "reported_by_client" depend on people applying them; the client label does not appear before 2024.
* Reporter is not finder. Customer success raises many issues in Slack and QA logs them.
* MR counts do not measure the size or value of the work.
* 2026 is partial, to 27 October.
* Test case style is not proof of authorship. The keyword checks are approximate.
* Creation date may mark when a case was copied into the suite, not when it was written.

## Open questions

- [ ] When did QA start using AI, which tools, and for what (test cases, bug reports, API collections)?
- [ ] When did developers start using AI, and how?
- [ ] What did the release process look like before November 2024?
- [ ] How long does reworking one machine-like case take before automation? An estimate per case is enough.
- [ ] Which 8 of the 1,203 regression cases are neither machine-like nor human-like?
- [ ] How many 2026 production bugs started as customer reports in Slack? Optional: the client label is already a minimum.

## Sources
* Bug ledger: GitLab bugs, merged MRs and releases, exported 27 October 2026. Yearly figures use the ledger's own Work delivered calculation.
* TestRail Regression suite export (1,203 cases) and its creation-date analysis.
* Postman Collection folder in the calira-e2e repo.
* Automated test for C109025: tests/equipment/equipment-details.spec.ts in calira-e2e.