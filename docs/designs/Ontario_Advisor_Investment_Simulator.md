# Ontario Advisor Investment Simulator

* **Author:** weaponex
* **Status:** Proposed
* **Date:** 2026-11-22

## Overview

This design proposes an interactive, simulation-only sales and service platform for training investment advisors at an Ontario bank. The first learner journey follows a fictional client through opening and funding a TFSA, completing know-your-client (KYC) and suitability steps, comparing fictional GIC and mutual fund options, and completing a simulated purchase. The learner follows a client/advisor narrative timeline that responds to their choices, receives rule-based feedback with regulatory citations, and finishes with a recap of the rules applied. Visual aids should reinforce the workflow and explainers, including a clear progress/timeline view and product comparison visuals that distinguish GIC terms and maturity from mutual fund risks and non-guaranteed outcomes. The design work will include low-fidelity wireframes for scenario selection, the client/advisor timeline, account and KYC entry, suitability and product comparison, unsuitable-choice feedback, and the end-of-scenario rule recap. These wireframes will make screen layout and interaction states reviewable before implementation. The scenario should be designed so it can gain more facts, decisions, and branches over time, and so other account types can be added later.

## The Problem

New advisors need to learn how account-opening and investment workflows connect in practice. Static explanations can describe requirements, but they do not let a learner see how information gathered earlier affects a later product choice, what happens when a choice conflicts with the client’s needs, or how the next step changes when the learner makes a different selection.

The proposed simulator provides a controlled way to practice those decisions using fictional clients, products, rules, and transactions. Its first scenario is a new TFSA client with variations for near-term liquidity needs and for a long time horizon paired with low comfort around investment losses. Product options and suitability outcomes must use client details entered in earlier screens. A choice that violates the scenario’s configured suitability rules is blocked; the learner sees why, relevant citations, and allowed alternatives before continuing.

The simulator must distinguish actual legislation and regulation, regulator guidance, and fictional bank procedures. It is a learning aid, not a live banking system, a substitute for the bank’s approved procedures, or a guarantee of regulatory compliance. It must not access real client data or create real transactions.

## Goals

* Let a trainee complete a guided, simulated TFSA account-opening, funding, KYC, suitability, product-comparison, and purchase journey.
* Show a client/advisor narrative timeline that advances in response to the trainee’s selections.
* Use visual aids to reinforce learning, including workflow progress, scenario timelines, and product comparisons. Visuals must not imply guaranteed mutual fund returns or replace written explanations and source citations.
* Provide low-fidelity wireframes for the main screens and interaction states, including unsuitable-product feedback and the rule recap, so the design can be reviewed before implementation.
* Use client information entered earlier in the journey to determine which fictional products are available under the scenario and which choices satisfy its rules.
* When a product choice violates the scenario’s suitability rules, block the purchase step and explain the mismatch, cite its sources, and offer allowed alternatives.
* End each scenario with a recap focused on the rules and citations, including the client facts and trainee choices that triggered them.
* Start with two TFSA scenario variations: a client who may need access to the money soon, and a client with a long time horizon but low comfort with investment losses.
* Keep the scenario structure open to adding client facts, decision points, and narrative branches, and to later adding non-registered, RRSP, RESP, LIRA, and FHSA journeys with account-specific rules.
* Keep the experience separate from production banking systems through fictional data and simulated transactions only.

## Non-Goals

* Opening or servicing real bank accounts, placing real orders, moving funds, or verifying real identities.
* Reading or storing real customer information or connecting to production banking, identity, payment, order, CRM, or customer-data systems.
* Providing personalized investment advice or representing the simulator as a complete interpretation of every Canadian or bank-specific requirement.
* Building all registered account types and every possible product/service combination in the first release.
* Choosing a product automatically based on a single client fact or implying that there is always one universally correct product.
* Using decorative visuals that obscure the client facts, product terms, risks, or rules behind a decision.

## Open Questions

* Which bank compliance, deposit-product, securities-dealer, tax, privacy, and training owners will approve the source map, fictional bank procedures, product shelf, and scenario outcomes before release?
* Which approved training environment will host the static application, and which desktop browsers and accessibility standard must it support?
* What usage, retention, and analytics requirements apply if a later release adds instructor reporting or saved sessions? Release 1 has no saved learner session or analytics service.

## Critical User Journeys

### CUJ 1: Open and fund a fictional TFSA

* **Given** a selected fictional scenario and no real client data, the trainee starts a TFSA application and sees the active step, progress, and client/advisor timeline.
* **When** the trainee enters registration details, confirms relevant eligibility and tax-residency information, chooses a funding route, and completes the simulated identity/AML steps required by the configured scenario.
* **Then** the application shows missing or inconsistent information, applicable rule explanations and source citations, and advances only when the scenario's required checks are resolved. Funding options and registration prompts reflect the selected account and prior answers.

### CUJ 2: Assess needs and select a suitable product

* **Given** the trainee has collected the account and client facts needed for the relevant product path, including financial circumstances, needs and objectives, knowledge, risk profile, time horizon, and liquidity needs where applicable.
* **When** the trainee compares a fictional GIC or mutual fund, selects an option, or changes a relevant client fact.
* **Then** the product list and suitability explanation use those facts and are recalculated after changes. A scenario-flagged mismatch shows the triggering facts, applicable source references, and allowed alternatives; the learner must choose an allowed alternative before continuing to simulated order review. A GIC-only path does not automatically inherit mutual-fund dealer steps.

### CUJ 3: Review, simulate, and recap

* **Given** an allowed selection and completed simulated prerequisites, the trainee reviews amount, funding, account, product terms, risks, and costs with the fictional client.
* **When** the trainee confirms the simulation and opens the recap.
* **Then** the app creates only a fictional in-memory confirmation, records the learner's steps in the session timeline, and explains which client facts and choices activated each rule. Restart clears the session.
## Initial Wireframes

These are low-fidelity desktop-workspace wireframes for discussion. They use fictional content and show structure and interaction states, not final branding, visual styling, or validated regulatory wording.

### Scenario Selection

```text
+--------------------------------------------------------------------------------+
| Advisor Learning Simulator                         SIMULATION ONLY   Help     |
+--------------------------------------------------------------------------------+
| Choose a scenario                                                              |
|                                                                                |
| [TFSA: New client]  First meeting · Account opening · GIC and mutual fund      |
|                                                                                |
| Scenario variations                                                           |
| (•) Client may need access to money soon                                       |
| ( ) Long time horizon, low comfort with investment losses                      |
|                                                                                |
| Learning focus: Gather client information, assess suitability, explain choices|
|                                                        [Start scenario]         |
+--------------------------------------------------------------------------------+
```

### Client/Advisor Workspace

```text
+--------------------------------------------------------------------------------+
| TFSA: New client             SIMULATION ONLY         Restart   Exit       |
| Progress: Scenario > Account > Identity/AML > Needs/KYC > Product fit > Review             |
+----------------------+----------------------------------+----------------------+
| Scenario timeline    | Current step                     | Explain this step    |
|                      |                                  |                      |
| ✓ Welcome            | CLIENT                           | Why this information |
| ✓ Goal discussion    | “I may need this money for a      | is collected         |
| → Account choice     | major expense in about two years.”| [Regulation] [Policy]|
|   Funding            |                                  | [Open citation]      |
|   KYC                | Advisor: [Ask a follow-up ▼]      |                      |
|   Suitability        |                                  | Client facts so far  |
|   Product choice     | [Continue]                       | Goal: ...            |
|   Review             |                                  | Horizon: ...         |
|                      |                                  | Liquidity: ...       |
+----------------------+----------------------------------+----------------------+
```

### Client Information and Suitability

```text
+--------------------------------------------------------------------------------+
| KYC and suitability                                      Step 4 of 6            |
+--------------------------------------------------------------------------------+
| Investment goal       [ Short-term savings                         v ]          |
| Time horizon          [ About 2 years                              v ]          |
| Need for access       [ May need funds before 2 years               v ]          |
| Comfort with losses   [ Low                                        v ]          |
|                                                                                |
| Client's own words:    [ “I want the money to be there when I need it.”       ] |
|                                                                                |
| [Save answers]       These answers will inform product options and checks.      |
|                                            [Back] [Continue to product choices] |
+--------------------------------------------------------------------------------+
```

### Product Comparison and Unsuitable-Choice State

```text
+--------------------------------------------------------------------------------+
| Product choice                                           Based on client facts |
+--------------------------------------------------------------------------------+
| Client needs: access may be needed in about 2 years; low comfort with losses    |
|                                                                                |
| [ Fictional GIC ]                     [ Fictional mutual fund ]                |
| Term: 3 years                         Risk: Medium                             |
| Maturity: [date]                      Value can rise or fall                    |
| Early access: [terms]                 Fees: [details]                          |
| [Select GIC]                           [Select fund]                           |
|                                                                                |
| Selection check: [Scenario rules checked against saved client facts]            |
|                                                                                |
| WARNING — this selection conflicts with the client's stated access needs.      |
| Why: the selected term extends beyond the stated time horizon.                  |
| Source: [Regulation/guidance citation] [Fictional bank policy citation]         |
| Consider these allowed options: [Option A] [Option B]                           |
|                                                                                |
| Purchase is unavailable until an allowed option is selected.                  |
+--------------------------------------------------------------------------------+
```

### Scenario Recap

```text
+--------------------------------------------------------------------------------+
| Scenario recap                                      SIMULATION ONLY             |
+--------------------------------------------------------------------------------+
| Decisions and client facts                                                    |
| • Client said funds may be needed in about 2 years.                            |
| • You selected [product]; the scenario rule flagged a mismatch.                |
| • You selected [allowed alternative].                                          |
|                                                                                |
| Rules and sources                                                              |
| • [Rule topic] — [regulation/guidance, section, effective date, link]           |
|   Applied because: [client fact and decision]                                   |
| • [Bank procedure] — Fictional training policy, version [x]                     |
|   Applied because: [client fact and decision]                                   |
|                                                                                |
| [Review timeline]                              [Restart variation]              |
+--------------------------------------------------------------------------------+
```


## Technical Plan (Architecture)

### Selected first-release architecture

The first release is a standalone browser application with no server, learner profiles, or saved sessions. Scenario and rule content is versioned with the application. The learner's fictional session exists only in browser memory and is cleared when the learner restarts or closes the session. This keeps the first release small while leaving clean boundaries between screens, scenario data, rule evaluation, and timeline events.

This is a design-only project folder. It contains briefs, wireframe artifacts, and no application source code or established framework. The architecture below defines logical components and their responsibilities, not stack-specific source paths. The detailed implementation plan must bind exact files and build commands to the eventual application repository and its existing conventions. No network API is required in this architecture.

### Components and responsibilities

* **Journey shell:** Shows the selected scenario, active step, progress, client/advisor narrative timeline, current client facts, contextual explainers, and navigation. Opening a citation must preserve the learner's current in-memory state.
* **Scenario catalog:** Holds fictional client variations, account context, funding routes, prompts, available product examples, and expected learning outcomes. The first release includes the two TFSA variations: near-term liquidity need, and longer horizon with low comfort around losses.
* **Account and funding steps:** Collect the fields relevant to the selected registration and route. Account-specific checks appear conditionally. The first release focuses on a TFSA; the design supports later RRSP, RESP, LIRA, FHSA, and non-registered journeys without treating their rules as identical.
* **Policy and product modules:** Keep deterministic checks separate from narration and screen layout. Checks cover account/product compatibility, funding-route constraints represented by the fictional scenario, and suitability learning outcomes. Product data distinguishes GIC rate, term, interest timing, maturity, and redemption terms from mutual fund objective, risk, costs, and non-guaranteed returns.
* **Explanation and citation catalog:** For each rule identifier, stores the outcome explanation, source type, citation, section or effective date where available, and allowed alternatives. Source types distinguish legislation/regulation, regulator guidance, and fictional bank procedure. The same rule result controls both the explanation and the available next actions.
* **Timeline and session state:** Records fictional learner actions, client prompts, rule outcomes, and simulated transaction events in memory. Each session pins the scenario and rule versions it started with. Restart clears the session; there is no profile, cross-device resume, or progress persistence in the first release.
* **Simulated transaction step:** Shows a review summary and creates a clearly fictional confirmation reference in memory. It has no connection to account, identity, payment, order, CRM, or customer-data services.

### Decision and explanation flow

```text
Client prompt + learner input
              |
              v
In-memory scenario state
              |
              v
Account / product / suitability checks
              |
              v
Structured outcome + rule IDs + citations
        |                        |
        v                        v
Allowed next actions      Explanation + timeline event
              |
              v
Mock transaction confirmation
```

When required facts are missing or inconsistent, the flow asks the learner to clarify them before showing a product recommendation. If relevant facts change, the checks run again and the screen explains why available choices changed. Any hard stop is labeled as a simulator training rule; it must not be presented as a universal legal requirement. For mutual funds, dealer KYC and suitability apply on that path. A GIC-only path follows the bank's deposit-product process and does not inherit mutual-fund-dealer steps.


### Regulatory field and decision coverage

The wireframes and implementation must expose the information needed to teach each configured check and make its source traceable. They must not imply that every field is a universal legal requirement for every product, bank, account, or distribution channel.

* **Account opening and registration:** legal name, date of birth, residential address, SIN where required for registration, account type, tax-residency declarations, applicable foreign tax-residency/TIN questions, and account-specific eligibility and designation prompts. For a TFSA, distinguish account opening/registration facts from contribution-room and contribution questions; do not claim that the simulator can determine a client's complete CRA room from a form alone.
* **Identity and AML:** show the verification method, what information or documents are checked, result, and follow-up path. The source catalog should cover the current FINTRAC-prescribed methods applicable to the fictional reporting entity (government-issued photo identification, credit-file, dual-process, affiliate/member, and reliance methods), plus the relevant recordkeeping and risk-based follow-up. Include occupation/employer and third-party determination where the applicable bank/AML process requires them. PEP/HIO and related family-member/close-associate questions and follow-up should be scenario-conditional and explained as applicable AML processes, not generic securities suitability fields.
* **Mutual-fund dealer KYC and suitability:** capture sufficient client personal and financial circumstances; annual income, financial assets, net worth, liquidity needs, and leverage/borrowing where applicable; investment needs and objectives; investment knowledge; time horizon; current account/portfolio context as applicable; and a risk profile that separately considers risk tolerance and risk capacity. Surface discrepancies for advisor follow-up, show client confirmation of collected information, and record the simulated reasoning for a recommendation or other investment action. The required depth and fields must be tied to the applicable dealer rules, service relationship, and bank procedures.
* **Product and order disclosures:** for a GIC, show fictional principal, rate, term, interest timing, maturity date, and early-redemption terms. For a mutual fund, show objective, risk, costs/fees, required disclosure reference, and that returns are not guaranteed. Explain the source of each constraint and distinguish legal/regulatory rules from fictional bank process and product terms.

The source catalog must store authority, rule/source identifier, exact section or guidance topic, source type, link, effective/version date when available, last review date, and the fact/outcome that makes the source relevant. Review current source versions before implementation and before each release. A warning or training gate is a simulator learning rule unless the citation supports a specific legal or regulatory obligation; the interface must not turn a scenario mismatch into a universal legal prohibition.
### Extension and release boundaries

New scenario variations should add versioned client facts, prompts, products, and rule references through the scenario catalog. New rules should have stable identifiers and deterministic outcomes. Shared account-opening steps may be reused, while account-specific eligibility, funding, and designation checks remain explicit. Add a server or LMS connection only if later requirements establish a need for saved progress, central scenario updates, instructor reporting, or course launch tracking; such a change would require a separate design decision and privacy review.

The first release should be checked against authored scenario cases: eligible and ineligible account/product combinations, missing client facts, changed suitability inputs, selected mismatch and required alternative, GIC maturity/redemption explanation, mutual-fund risk/cost explanation, reset behavior, and simulated confirmation. These checks validate the simulator's configured learning rules; they do not certify legal compliance or replace review by the bank's compliance and product owners.

## Alternatives Considered

### Static examples as the main learning experience

A fixed lesson could show sample account forms, product comparisons, and explanations without carrying learner choices forward. It would be easier to assemble, but would not let a trainee see how a changed client fact changes the next step or product options. **Rejected by author:** the simulator is meant to let advisors make choices in a fictional client journey and see the resulting rule feedback and timeline events.

### Build every account and product combination in the first release

The first release could include full TFSA, RRSP, RESP, LIRA, FHSA, and non-registered journeys, with every GIC and mutual fund combination. This would cover more examples at launch, but would create a larger rule set before the core workflow and source ownership are validated. **Rejected by author for the first release:** start with a complete TFSA journey and two scenario variations, while keeping steps and rules separable so later releases can add account-specific paths. FHSA remains a planned follow-on scenario.

### Use generated model decisions or explanations as the rule authority

A language model could decide whether an account or product is allowed and write the explanation. This may reduce hand-authored content, but the same inputs could produce different outcomes, and reviewers would have a harder time tracing a decision to a source. **Rejected by author:** eligibility and suitability learning outcomes use explicit, versioned rules with stable identifiers and authored explanations. Generated wording, if ever considered, must not decide outcomes or replace the cited rule.

### Connect the simulator to live bank systems

Live account, identity, payment, order, CRM, or customer-data services could make the workflow resemble a production advisor platform. They would also create real-data and real-transaction risks outside this training scope. **Rejected by author:** keep the first release fictional and simulation-only, with no production integrations or real transactions.

### Add a simulation service and saved learner sessions in the first release

A browser client backed by a service could centralize rule updates, save sessions, support cross-device resume, and provide instructor reports. It would require hosting, session controls, privacy decisions, and operational support. **Rejected by author for the first release:** use a standalone browser app without profiles or saved sessions. Revisit the service if central scenario management, reporting, or session resume becomes a confirmed need.

### Deliver the simulator as an LMS package

An LMS package could use existing course launch and completion tracking. It would tie delivery and updates to LMS compatibility and packaging rules that have not been established. **Rejected by author for the first release:** there is no stated LMS launch or reporting requirement. Revisit this if training operations require the simulator to launch from an LMS or report completion there.

### Build a general-purpose rules engine before the first journey is validated

A configurable rules engine could represent many future account and product cases up front. That adds abstractions and maintenance before the initial TFSA scenarios show which rule patterns recur. **Rejected by author for the first release:** begin with deterministic, testable policy modules and explicit scenario data. Add broader rule configuration only when later account journeys demonstrate a repeated need.

## Non-Functional Requirements

* **Privacy and isolation:** use only authored fictional data; no real customer data, authentication, profiles, persistent browser storage, network APIs, production-system connections, analytics, or third-party resources in Release 1.
* **Explainability and consistency:** deterministic, versioned rule outcomes drive both permitted actions and displayed explanations. Every nontrivial outcome resolves to a source and reason identifier. Keep legislation/regulation, regulator guidance, and fictional bank procedures visibly distinct.
* **Accessibility and usability:** keyboard operation, visible focus, semantic labels, announced warnings, readable contrast, responsive desktop layouts, and preservation of in-memory answers while viewing an explainer are required.
* **Operational boundary:** the local static server is for development only. Deployment location and operating controls must be selected by the bank's training owner; software verification does not certify legal compliance.
* **Performance and scale:** release 1 has no backend or external service. Establish hosting, concurrency, telemetry, and retention requirements only if a later release introduces those capabilities.

## Additional Resources

* [Concept brief](../../concepts_brief.md) — goals, first-release scope, and decisions that informed this design.
* [Wireframe artifact folder](../../artifacts/wireframes/README.md) — local screenshots and PDF exports. The set includes the final navigation wireframes and supporting screen captures.
* [TFSA opening guidance — CRA](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account/opening.html)
* [TFSA contributions and contribution room — CRA](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account/contributing/before.html)
* [Identity verification methods — FINTRAC](https://fintrac-canafe.canada.ca/guidance-directives/client-clientele/Guide11/11-eng)
* [PEP and HIO guidance — FINTRAC](https://fintrac-canafe.canada.ca/guidance-directives/client-clientele/pep/pep-eng)
* [CIRO Dealer Member Rules](https://www.ciro.ca/rules-and-enforcement/dealer-member-rules) — select the applicable rulebook for the bank’s distribution channel. For an investment-dealer path, review the current Investment Dealer and Partially Consolidated Rules, including Rule 3200 (KYC) and Rule 3400 (suitability determination); for a mutual-fund dealer path, review the current Mutual Fund Dealer Rules, including Rule 2.2.1. Confirm how Ontario securities law and the bank’s registrations apply.
* [KYC and suitability determination for retail clients — CIRO](https://www.ciro.ca/newsroom/publications/know-your-client-and-suitability-determination-retail-clients)
* [Joint CSA/CIRO Staff Notice 31-368 — KYC, KYP, and suitability review](https://www.ciro.ca/newsroom/publications/joint-canadian-securities-administrators-canadian-investment-regulatory-organization-staff-notice-31-0)
* [FHSA opening guidance — CRA](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account/opening-your-fhsas.html) — future account scenario reference.

These links are a starting source map, not a legal opinion or exhaustive statement of Ontario or federal obligations. Confirm the current consolidated rules, effective dates, applicable registrant category, and the bank's approved procedures with compliance and product owners before implementation.

## Future Improvements

* Add separate complete journeys for RRSP, RESP, LIRA, FHSA, and non-registered accounts. They remain visible but disabled in the first-release account selector, labeled for later releases, and must not open a partial application. Reuse shared workflow structure while keeping each account's eligibility, funding, transfer, designation, tax, and product rules explicit.
* Add scenario facts, advisor prompts, branch points, services, and product cases as evidence shows the first release's policy modules are recurring and stable.
* Consider an LMS or service layer for saved sessions, instructor reporting, or centrally managed rules only after training operations establish requirements and approve privacy, retention, access, and audit controls.
## Detailed Implementation Plan

This is a greenfield browser-only application under `./simulator/`. The project folder currently contains design documents and wireframe exports, not application source code. The first release implements the two TFSA scenario variations, funding, identity/AML simulation, the mutual-fund dealer KYC path, product comparison, the unsuitable-choice training gate, and simulated order review. Keep RRSP, RESP, LIRA, FHSA, and non-registered visible in the account selector, but visibly disabled and labeled for later releases. Only TFSA is enabled in Release 1, and no unimplemented journey may be entered.

### Ordered implementation and file inventory

1. **Create the static application shell and local development commands.**

   * `./simulator/index.html` — **Create.** Add semantic page regions, accessible screen titles, the persistent simulation label, an application mount point, and a module entry reference. Do not embed real client fields or load third-party scripts, fonts, or analytics.
   * `./simulator/styles.css` — **Create.** Style the six-step workspace, responsive form layout, client/timeline context, source-type labels, product comparison, mismatch callout, keyboard focus, and disabled future-account paths. Preserve readable contrast and avoid styling that could make fictional returns look guaranteed.
   * `./simulator/package.json` — **Create.** Mark the app as an ES module project and define `start` and `test` scripts using Node's built-in modules only. Do not add runtime or build dependencies.
   * `./simulator/tools/serve.js` — **Create.** Provide a small local development server for static files. Restrict file resolution to the `simulator` directory and reject path traversal. This server exposes no application API and is not the production hosting service.

2. **Define the fictional client scenarios and product shelf.**

   * `./simulator/src/scenarios.js` — **Create.** Define the two TFSA variations below as structured, versioned fixtures. Keep facts separate from prompt text. Represent unanswered or unclear facts as unknown; never infer them.
   * `./simulator/src/products.js` — **Create.** Define the fictional products below with stable IDs and account-compatibility metadata. GIC records include issuer label, principal, fictional rate, term, interest schedule, maturity-date inputs, and early-redemption terms. Mutual fund records include objective, fictional risk rating, annual fee, disclosure reference, and an explicit non-guaranteed-return statement. Label every product and term fictional.

   #### Release 1 scenario and product fixtures

   | Scenario ID | Seeded client facts | Client prompt and decision focus |
   | --- | --- | --- |
   | `TFSA-LIQUIDITY-01` | Ontario resident; age 34; valid SIN; Canadian tax resident; $10,000 to invest; goal is a planned expense in 18 months; needs at least $5,000 available by month 12; low risk tolerance; moderate risk capacity; basic mutual fund knowledge. TFSA contribution room is client-reported and must be verified; the simulator does not calculate it. | “I may need half this money in a year, and all of it in about 18 months.” Ask about timing and amount before comparing products. |
   | `TFSA-LONG-01` | Ontario resident; age 42; valid SIN; Canadian tax resident; $10,000 to invest; eight-year investment horizon; no planned withdrawal for five years; low risk tolerance; moderate risk capacity; limited mutual fund knowledge. | “I have time, but I do not want to see this investment lose value.” Clarify risk tolerance, risk capacity, and knowledge separately; do not infer a profile from one answer. |

   The fictional shelf contains `GIC-CASH-1Y` (one-year cashable GIC; 3.00% annual rate; fictional terms allow redemption after 30 days and reduce the rate to 0.50% on early redemption), `GIC-LOCK-3Y` (three-year non-redeemable GIC; 4.00% annual compounding; at $10,000, fictional maturity value $11,248.64 before any applicable account/tax treatment), `MF-CONSERVATIVE` (fixed-income objective; fictional low-to-medium risk rating; 1.25% annual fee), and `MF-BALANCED` (balanced objective; fictional medium risk rating; 1.75% annual fee). Mutual fund returns are not forecast or guaranteed. Product records and all rates, risk ratings, fees, and redemption terms are teaching data, not real offers.

   The authored scenario rules are training gates, not universal legal suitability rules:

   | Rule ID | Condition | Result and alternatives |
   | --- | --- | --- |
   | `TR-GIC-LIQUIDITY-01` | In `TFSA-LIQUIDITY-01`, select `GIC-LOCK-3Y` while the client needs $5,000 by month 12. | `training-mismatch`; block simulated order; explain that the fictional term conflicts with the stated cash need; offer `GIC-CASH-1Y`. Cite the fictional bank liquidity rule and show GIC terms. |
   | `TR-MF-RISK-01` | In `TFSA-LONG-01`, select `MF-BALANCED` while the seeded facts remain low risk tolerance and limited mutual fund knowledge. | `training-mismatch`; block simulated order; explain the client facts that conflict with the fictional medium-risk product rating; offer `MF-CONSERVATIVE`. Reassess only if the client provides new facts through a scenario prompt; do not let the trainee edit KYC values solely to bypass the gate. This is a scenario learning rule, not a legal prohibition. |
   | `TR-MF-KYC-COMPLETE-01` | Any mutual fund is selected before required KYC facts are collected or material discrepancies are discussed. | `needs-information`; do not present an actionable recommendation or enable order review. Identify the missing or inconsistent facts and applicable dealer source. |

   For the fictional securities path, assume the bank distributes mutual funds through a fictional CIRO-registered mutual fund dealer affiliate; cite the applicable current Mutual Fund Dealer Rules, including Rule 2.2.1 for KYC and Rule 2.2.6 for suitability, subject to compliance-owner confirmation before release. A GIC-only path uses the fictional bank deposit-product process and applicable FINTRAC obligations; it does not inherit securities-dealer steps.

3. **Implement source metadata and deterministic rule outcomes.**

   * `./simulator/src/citations.js` — **Create.** Store each source as structured metadata: stable source ID, source type (legislation/regulation, regulator guidance, or fictional bank procedure), authority/owner, title, exact section or guidance topic, URL, effective/version date, and review date. Seed `SRC-CRA-TFSA-OPEN`, `SRC-CRA-TFSA-ROOM`, `SRC-FINTRAC-ID`, `SRC-FINTRAC-PEP-HIO`, `SRC-CIRO-MFD-KYC`, `SRC-CIRO-MFD-SUIT`, and fictional `SRC-BANK-GIC-TERMS` / `SRC-BANK-TRAINING-RULES`. Store fictional procedures separately and label them as fictional. Do not present a bank procedure as law.
   * `./simulator/src/rules/account-checks.js` — **Create.** Evaluate only the TFSA registration facts and the funding-route checks represented by the fixtures. Return `registrationStatus` as `eligible`, `ineligible`, or `needs-information`. Keep CRA opening facts, the client-reported contribution-room verification prompt, identity/AML checks, and fictional bank process distinct. Do not calculate contribution room or activate later account types using TFSA checks.
   * `./simulator/src/rules/product-fit.js` — **Create.** Compare product compatibility and the structured client facts against the named fixture rules. A mismatch must return its rule ID, triggering facts, source IDs, and allowed alternatives. Apply mutual-fund dealer KYC/suitability only on the fictional CIRO MFD path; a GIC-only path follows the bank deposit-product and applicable AML process. Treat missing or inconsistent facts as a request for follow-up.
   * `./simulator/src/rules/index.js` — **Create.** Run applicable checks and return one structured result with `registrationStatus` (`eligible`, `ineligible`, or `needs-information`) and `decisionStatus` (`allowed`, `needs-information`, or `training-mismatch`), plus reason IDs, source IDs, triggering facts, and allowed alternative IDs. Enable simulated order review only when registration is eligible, required identity/AML steps are complete, required mutual-fund KYC is complete for that path, and `decisionStatus` is `allowed`. Re-evaluate and replace stale results whenever a relevant fact changes.

   Account and identity fields must follow the configured source rules rather than an invented universal checklist. The account screen includes legal name, date of birth, residential address, SIN where required, tax residency and foreign tax-residency declarations when applicable, funding route, and account-specific eligibility/designation fields. Identity/AML screens show the applicable FINTRAC-permitted verification method and result, occupation/employer, third-party determination, and conditional PEP/HIO follow-up when required by the scenario and source. For the mutual-fund path, use the fictional CIRO MFD affiliate assumption stated above and cite its KYC and suitability rules. Collect sufficient personal and financial circumstances, income, assets, net worth, liquidity needs, leverage where applicable, objectives, knowledge, time horizon, and separate risk tolerance/capacity; resolve inconsistencies and capture client confirmation as required by the applicable rules and bank procedure. These are not a blanket assertion that every field applies to every GIC or account. Label every hard stop as an eligibility result, an applicable process requirement, or a scenario training rule; do not describe a scenario mismatch as a universal legal prohibition. PEP/HIO follow-up and other enhanced AML measures appear only when the configured scenario condition triggers them. Compliance and product owners must confirm each source, section, effective date, fictional bank procedure, and product term before release.

4. **Add in-memory journey state and the client/advisor timeline.**

   * `./simulator/src/session.js` — **Create.** Hold the active scenario ID/version, rule-set version, account and funding answers, client facts, selected product, current step, decision results, and transaction simulation result in memory. Provide explicit actions for changing an answer, advancing/backtracking, and resetting. Do not use cookies, local storage, IndexedDB, a server, profiles, or cross-session identifiers.
   * `./simulator/src/timeline.js` — **Create.** Append a timeline event after each committed learner action, client prompt, rule result, explanation opened, and simulated order. Store only the fictional scenario data needed to render and replay the current session. Opening an explainer must not lose unsaved answers or move the learner to another step.

5. **Build the screens, explanation behavior, and mock transaction.**

   * `./simulator/src/main.js` — **Create.** Start a new scenario, connect UI actions to session transitions and rule evaluation, render the current state, and reset the session. Keep business decisions out of the UI event handlers.
   * `./simulator/src/ui/shell.js` — **Create.** Render shared navigation, current step, scenario summary, client/advisor timeline, and a persistent simulation-only marker on every screen.
   * `./simulator/src/ui/steps.js` — **Create.** Render the scenario picker, TFSA account/funding screen, simulated identity/AML screen, needs and conditional KYC screen, product fit screen, and review/service screen. Keep account-specific fields conditional. Show RRSP, RESP, LIRA, FHSA, and non-registered in the selector as visibly disabled, labeled later-release options until complete flows are added; selecting one must not open a partial application.
   * `./simulator/src/ui/explainers.js` — **Create.** Render field explanations, citations, suitability reasons, and allowed alternatives. Each explanation shows its source type and returns the learner to the same step with the same in-memory answers.
   * `./simulator/src/simulated-order.js` — **Create.** Build an order summary from the selected account, funding, amount, product, and passed decision. Produce a fictional confirmation reference only after the training gate and client-review confirmation are complete. No network request or real trade is possible.

6. **Add automated checks and operating instructions.**

   * `./simulator/tests/rules.test.js` — **Create.** Implement the named deterministic fixtures in the Verification plan. Assert registration and decision statuses, reason/source IDs, alternatives, and whether order review is enabled for each case.
   * `./simulator/tests/workflow.test.js` — **Create.** Cover both TFSA variations from scenario start through review, back/forward navigation, explainer open/return, required alternative after a mismatch, GIC-only versus mutual-fund paths, reset, and absence of saved sessions.
   * `./simulator/tests/content-integrity.test.js` — **Create.** Verify that scenario rule IDs, product IDs, alternatives, and citation IDs resolve; each rule has a source type and citation; future account types remain visible, disabled, and labeled for later releases; selecting one cannot enter an incomplete flow; and sample returns/product terms are marked fictional.
   * `./simulator/README.md` — **Create.** Document local setup (`npm start`), checks (`npm test`), supported first-release scenarios, how rule/citation records are updated and reviewed, reset behavior, and the prohibition on real data and production integrations.

   No existing files are deleted. The implementation creates only the listed files. `package-lock.json` is not needed because the plan adds no package dependencies. The application is served as static files from a bank-approved training location when a deployment owner selects that location; the local development server is not a production service.

### Verification plan

Implement and assert these input/output cases in `rules.test.js` and `workflow.test.js`:

| Test ID | Inputs | Expected result |
| --- | --- | --- |
| `TFSA-ELIGIBLE-01` | `TFSA-LIQUIDITY-01` age 34, Ontario, Canadian tax resident, valid SIN. | `registrationStatus=eligible`; funding step available; `SRC-CRA-TFSA-OPEN` present. Do not infer contribution room. |
| `TFSA-AGE-01` | Age 17, otherwise complete. | `registrationStatus=ineligible`; funding, product, and order steps unavailable; CRA opening source present. |
| `TFSA-UNKNOWN-01` | Tax residency unknown. | `registrationStatus=needs-information`; product list and order unavailable. |
| `ID-VERIFIED-01` | An explicitly configured FINTRAC-permitted identity method returns a successful match. | Identity step complete; method and `SRC-FINTRAC-ID` recorded. |
| `AML-PEP-01` | Scenario answer triggers PEP/HIO follow-up. | Follow-up status and `SRC-FINTRAC-PEP-HIO` shown; flag alone does not automatically reject the client. |
| `GIC-LIQUIDITY-01` | `TFSA-LIQUIDITY-01` selects `GIC-LOCK-3Y`. | `decisionStatus=training-mismatch`; order disabled; reason identifies month-12 liquidity need; `GIC-CASH-1Y` and fictional rule/source IDs displayed. |
| `MF-KYC-INCOMPLETE-01` | Mutual fund path with investment knowledge or risk capacity missing. | `decisionStatus=needs-information`; no actionable recommendation/order; applicable CIRO source ID displayed. |
| `MF-RISK-01` | `TFSA-LONG-01` selects `MF-BALANCED` with the seeded low risk tolerance and limited knowledge unchanged. | `decisionStatus=training-mismatch`; order disabled; reason identifies those facts; `MF-CONSERVATIVE` is offered with the applicable source IDs. |
| `FACT-CHANGE-01` | Client follow-up changes `TFSA-LIQUIDITY-01` from a month-18 expense with a month-12 cash need to no planned withdrawal for at least three years. | Rules rerun; prior decision/alternatives cleared; with all other prerequisites passed, `GIC-LOCK-3Y` returns `allowed` under the fictional horizon rule. |
| `RESET-01` | Restart after completing a simulated order. | Answers, timeline, decision, and confirmation are cleared; reload restores no saved session. |

* Run `npm test` from `./simulator/`; all policy, scenario-content, workflow, reset, and source-integrity cases must pass.
* Run `npm start` and walk both TFSA variations in a supported desktop browser. Check every account, funding, identity/AML, KYC, suitability, product, and review step against the wireframes.
* Change a relevant client fact after a product result appears. Confirm the product list, reason, allowed alternatives, and timeline are recalculated from the changed facts.
* Select a scenario-mismatched product. Confirm the warning identifies the triggering facts and sources, and that the simulated order stays unavailable until a permitted alternative is selected. Confirm the wording calls this a training gate, not a universal legal prohibition.
* Confirm a GIC-only path does not require securities-dealer KYC; confirm a mutual-fund path does not show product selection before the required KYC/suitability information is collected.
* Confirm GIC disclosures show fictional rate, interest timing, maturity and redemption terms; mutual fund content states risk, costs, and that returns are not guaranteed.
* Confirm reset clears all session answers and timeline events, and that reload does not restore a learner profile or saved session.
* Review keyboard operation, visible focus, field labels, warning announcements, and narrow-screen layout. Confirm the app makes no network calls and loads no third-party resources.
* Before release, have the designated bank compliance and product owners validate every regulation/guidance citation, effective date, fictional bank procedure, and product term. Passing software checks does not establish regulatory compliance.




