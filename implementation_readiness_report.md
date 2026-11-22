# Stage 9: Implementation Readiness Review

**Target:** `docs/designs/Ontario_Advisor_Investment_Simulator.md`  
**Scope:** Detailed Implementation Plan, lines 291–352  
**Review mode:** Implementation plan only  
**Context provided:** linked concept brief, wireframe README, and eight approved public-source snapshots in `docs/designs/review_context/`.

## Reviewer Status

| Reviewer | Status |
| --- | --- |
| `egm-implementation-readiness` | completed |
| `egm-codebase-details` | completed |
| `egm-style` | completed |

## Prioritized Findings

### Concrete scenario and rule fixtures are not specified — Severity: Major

* **Reviewer lens:** `egm-implementation-readiness`
* **Affected scope:** Lines 306–316; scenario, product, citation, and rule modules.
* **Discrepancy:** The plan names the two scenario variations and product/rule modules but does not define their actual client facts, product records, rule conditions, expected outcomes, or allowed alternatives. It also leaves the fictional bank’s dealer registration and applicable securities rulebook to be established later.
* **Rationale and recommendation:** Implementers cannot determine what data to encode or what result each client/product combination should produce. Define the release-one fixtures, deterministic decision inputs/outputs, alternatives, and approved source mapping before implementation. Keep owner validation as an approval step for the authored content.

### Test cases do not specify expected inputs and outcomes — Severity: Major

* **Reviewer lens:** `egm-implementation-readiness`
* **Affected scope:** Lines 333–350; automated checks and verification plan.
* **Discrepancy:** Tests are described by topic, such as “TFSA eligibility inputs,” “conditional identity/AML results,” and “GIC horizon/liquidity mismatches,” without concrete fixture values or expected statuses, reason IDs, source IDs, and allowed alternatives.
* **Rationale and recommendation:** Specify input/expected-output cases for eligible and ineligible registration facts, missing or inconsistent answers, conditional PEP/HIO follow-up, product mismatch, changed facts, and reset. Assertions should name the expected decision status, reason/source IDs, alternatives, and order-gate state.

### Workspace step count conflicts with a wireframe — Severity: Nit

* **Reviewer lens:** `egm-style`
* **Affected scope:** Line 300; also the “Client Information and Suitability” wireframe at line 110.
* **Discrepancy:** The implementation plan calls this a “six-step workspace,” while the wireframe labels the suitability screen “Step 4 of 7.” The six named navigation labels at line 326 suggest another count.
* **Rationale and recommendation:** Choose and use one step count across the wireframes and implementation plan, or remove the numeric count from line 300 and make the navigation data-driven.

### Compliance caveat repeats the preceding action — Severity: Nit

* **Reviewer lens:** `egm-style`
* **Affected scope:** Line 350.
* **Discrepancy:** “Passing software checks does not establish regulatory compliance” repeats the limit already implied by requiring compliance and product-owner validation immediately before it.
* **Rationale and recommendation:** Drop the final sentence, or move a specifically actionable compliance boundary to the source-validation step.

## No-Finding Review

* **`egm-codebase-details`:** No findings. The plan identifies the workspace as greenfield, marks every proposed path as **Create**, and does not claim that proposed application code already exists.

## Reviewer Context Verification

Reviewers reported that the required persona and context files were readable. All three reviews completed; no reviewer was recorded as not run.

## Re-audit After Resolution

**Scope:** Updated Detailed Implementation Plan, lines 291–388  
**Result:** Completed; no remaining or new findings.

| Reviewer | Status | Re-audit result |
| --- | --- | --- |
| `egm-implementation-readiness` | completed | Concrete fixtures, named rules, expected outcomes, source IDs, alternatives, and order-gate assertions are now specified. |
| `egm-codebase-details` | completed | Greenfield description, explicit Create file inventory, and current-state claims remain consistent with the project. |
| `egm-style` | completed | Six-step navigation labels are consistent; the retained compliance caveat is clear in context. |

All personas, standards, target, and context files were readable by the re-audit reviewers.

