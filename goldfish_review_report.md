# Goldfish Annotated Review Report

**Target:** `docs/designs/Ontario_Advisor_Investment_Simulator.md` (Detailed Implementation Plan, lines 291–352)
**Status:** Resolved

## Prioritized Findings & AI Suggestions

### Release-one scenarios and rule outputs need fixed fixtures [egm-implementation-readiness] — Severity: Major

* **Affected Scope:** Lines 306–316 ([design](docs/designs/Ontario_Advisor_Investment_Simulator.md#L306-L316), scenarios, product shelf, citations, and rules).
* **Discrepancy Description:** The plan names the two scenario variations and product/rule modules but does not define their actual client facts, product records, rule conditions, expected outcomes, or allowed alternatives. It leaves the fictional bank’s dealer registration and applicable securities rulebook to be established later.
* **Rationale:** The implementer cannot determine what data to encode or what each client/product combination should produce. This also risks a false legal explanation if a future implementer guesses which dealer rulebook governs the mutual-fund path.
* ***AI Suggestion:*** PROPOSE FIX
* ***Justification:*** Make the training fixture set and fictional distribution model explicit. Keep the example values fictional; require compliance/product owner review of cited sources before release. Separate legal eligibility from scenario-level suitability guardrails.
* ***Proposed Edit:***
  * **Location:** After implementation item 2, before item 3; expand items 2 and 3.
  * **Change:** Add a scenario/product/rule matrix with these fixed Release 1 cases:
    * `TFSA-LIQUIDITY-01`: Ontario client age 34, Canadian tax resident, valid SIN, investment amount $10,000, planned use at month 18, needs at least $5,000 available by month 12, low risk tolerance, moderate risk capacity, and basic mutual-fund knowledge. Keep contribution room as a client-reported fact to verify; the simulator must not calculate complete CRA room from incomplete history.
    * `TFSA-LONG-01`: Ontario client age 42, investment horizon eight years, no planned withdrawals for five years, low risk tolerance, moderate risk capacity, and limited mutual-fund knowledge. Record the difference between risk tolerance and capacity and require a follow-up if they conflict; do not infer suitability from one fact.
    * Define fictional shelf IDs and terms: `GIC-CASH-1Y` (one-year cashable GIC, fictional 3.00% annual rate, with an explicit fictional redemption term); `GIC-LOCK-3Y` (three-year non-redeemable GIC, fictional 4.00% annual rate); `MF-CONSERVATIVE` (fictional low-risk fixed-income fund, 1.25% annual fee); and `MF-BALANCED` (fictional medium-risk balanced fund, 1.75% annual fee). Mark rates, fees, and all product terms as fictional; do not present sample mutual-fund returns as forecasts.
    * Define stable rule IDs and decisions: TFSA age/residency/SIN checks map to CRA source IDs; contribution-room checks prompt the trainee to verify the client-reported amount rather than decide it; identity verification methods and PEP/HIO follow-up map to FINTRAC sources; mutual-fund KYC/suitability maps to the chosen fictional CIRO mutual-fund-dealer channel and applicable current rules; GIC redemption/horizon constraints map to labeled fictional bank procedure IDs.
    * Set the fictional mutual-fund distribution channel explicitly to a bank-owned CIRO mutual fund dealer for this learning scenario. Treat GIC-only sales as the bank deposit-product path. Label both as simulation assumptions, not descriptions of a real bank.
    * Define outcome statuses as `eligible`, `ineligible`, `needs-information`, `allowed`, and `training-mismatch`. Specify that unknown mandatory facts return `needs-information`; account ineligibility blocks funding and product steps; a non-redeemable three-year GIC conflicts with the liquidity scenario and returns allowed alternatives `GIC-CASH-1Y` or another explicitly listed cashable/maturing-by-need-date option; and the balanced fund requires complete KYC plus a documented follow-up on risk mismatch before it can pass the training gate.
    * State that changed horizon, liquidity, risk tolerance, or capacity re-runs the rules and replaces stale results. List reason IDs, source IDs, status, and allowed alternative IDs in the shared decision result.
  
### Verification cases need expected results [egm-implementation-readiness] — Severity: Major

* **Affected Scope:** Lines 333–350 ([design](docs/designs/Ontario_Advisor_Investment_Simulator.md#L333-L350), test files and verification plan).
* **Discrepancy Description:** The tests are described by topic without concrete fixture values or expected statuses, reason IDs, source IDs, allowed alternatives, and order-gate results.
* **Rationale:** Test authors cannot tell whether a rule implementation is correct from broad statements such as “TFSA eligibility inputs” or “GIC horizon/liquidity mismatches.”
* ***AI Suggestion:*** PROPOSE FIX
* ***Justification:*** Add a table of named input/output cases and require assertions over the structured result, UI gate, and source metadata.
* ***Proposed Edit:***
  * **Location:** Under test items 6 and the Verification plan.
  * **Change:** Add at least these deterministic cases:
    * `TFSA-ELIGIBLE-01`: age 34, Ontario, Canadian tax resident, valid SIN → `eligible`; TFSA funding step available; CRA opening source ID present.
    * `TFSA-AGE-01`: age 17 → `ineligible`; funding and product steps unavailable; CRA opening source ID present.
    * `TFSA-UNKNOWN-01`: residency unknown → `needs-information`; no product list or simulated order.
    * `ID-VERIFIED-01`: a configured FINTRAC-permitted identity method completes successfully → identity check passed with method and FINTRAC source ID recorded.
    * `AML-PEP-01`: configured PEP/HIO fact triggers the scenario’s follow-up → enhanced review prompt and FINTRAC PEP/HIO source ID; no automatic rejection solely from the flag.
    * `GIC-HORIZON-01`: `TFSA-LIQUIDITY-01` selects `GIC-LOCK-3Y` → `training-mismatch`; order unavailable; triggering horizon/liquidity facts, bank-procedure source ID, and allowed alternative IDs displayed.
    * `MF-KYC-MISSING-01`: mutual fund selected with risk capacity or investment knowledge missing → `needs-information`; no recommendation/order; applicable CIRO source ID present.
    * `MF-RISK-01`: `TFSA-LONG-01` selects `MF-BALANCED` → mismatch or follow-up status per the authored scenario matrix, with reason/source IDs and alternatives; never silently rewrite KYC to fit the product.
    * `FACT-CHANGE-01`: changing the liquidity need or horizon recalculates allowed products and clears the old decision and alternatives.
    * `RESET-01`: reset clears answers, timeline, decision, and simulated confirmation; reload creates no saved session.
  
### Step count differs between implementation text and a wireframe [egm-style] — Severity: Nit

* **Affected Scope:** Line 300 and “Client Information and Suitability” wireframe (line 110).
* **Discrepancy Description:** The plan says “six-step workspace,” while the ASCII wireframe says “Step 4 of 7.” The navigation has six named items, and the current Whimsical board uses a six-step progress indicator.
* **Rationale:** A stale count can cause navigation and progress implementations to disagree.
* ***AI Suggestion:*** PROPOSE FIX
* ***Justification:*** Preserve the six-step navigation shown in the current board and align the embedded draft wireframe.
* ***Proposed Edit:***
  * **Location:** “Client Information and Suitability” wireframe.
  * **Change:** Replace `Step 4 of 7` with `Step 4 of 6`. Keep “six-step workspace” in line 300.

### Compliance boundary sentence repeats the preceding review requirement [egm-style] — Severity: Nit

* **Affected Scope:** Line 350.
* **Discrepancy Description:** The sentence “Passing software checks does not establish regulatory compliance” follows the requirement for compliance and product owners to validate the rules and terms.
* **Rationale:** The reviewer recommends removing repeated cautionary wording.
* ***AI Suggestion:*** DECLINE
* ***Justification:*** Keep the sentence. It states a material limit on what software tests establish in a design that teaches regulatory rules. This helps prevent readers from treating passing tests as legal approval.
* ***Proposed Edit:*** None; retain the sentence.

## Reviewer Findings Without Changes

* `egm-codebase-details` reported no findings. The plan marks each proposed file as **Create** and accurately describes this workspace as greenfield.

## Resolution Decisions

* Accepted and applied: add concrete scenario/product fixtures, the fictional dealer-channel assumption, explicit rule outcomes and statuses, source IDs, and a deterministic test matrix.
* Accepted and applied: align the embedded suitability wireframe count and navigation labels with the six-step journey.
* Declined and retained: the closing statement that software tests do not establish regulatory compliance, because it states an important limit on what test results prove.

## Re-audit

The updated Detailed Implementation Plan was re-read at lines 291–388 and reviewed once more in fresh contexts. Implementation readiness, codebase details, and style reviewers all completed and reported no remaining or new findings.

