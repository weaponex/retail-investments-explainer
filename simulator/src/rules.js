import { products } from "./products.js";

export function evaluate(state) {
  const f = state.facts;
  const birth = f.dateOfBirth ? new Date(f.dateOfBirth + "T00:00:00") : null;
  const now = new Date();
  let age = Number(f.age);
  if (birth && !Number.isNaN(birth.getTime())) {
    age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age -= 1;
  }
  const missingRegistration = !f.legalName || !f.dateOfBirth || !f.residentialAddress ||
    f.taxResidency === "Unknown" || !f.sinProvided;
  const registrationStatus = missingRegistration
    ? "needs-information"
    : age < 18
      ? "ineligible"
      : f.taxResidency !== "Canada"
        ? "needs-information"
      : "eligible";
  const contributionRoute = ["Internal cash contribution", "External cash contribution"].includes(state.fundingMethod);
  const fundingStatus = contributionRoute && (f.reportedContributionRoom === "Unknown" || f.taxResidency !== "Canada") ? "needs-information" : "ready";
  const followUpRequired = f.thirdParty === "Yes" || f.pepStatus === "Yes" || f.hioStatus === "Yes";
  let identityStatus = state.identityMethod && state.identityResult === "Passed" ? "complete" : "needs-information";
  if (state.identityResult === "Follow-up required" || (followUpRequired && !state.enhancedReviewCompleted)) identityStatus = "follow-up";
  const selected = products.find((p) => p.id === state.selectedProductId) || null;
  const reasons = [];
  let decisionStatus = selected ? "allowed" : "needs-information";
  let sourceIds = selected ? [...selected.sourceIds] : [];
  let alternatives = [];
  if (!selected) reasons.push("Select a product to see the scenario check.");
  if (selected && !selected.accountTypes.includes(state.accountType)) {
    decisionStatus = "needs-information";
    reasons.push("This product is not configured for the selected account type.");
  }
  const needsPresent = Boolean(f.goal && f.horizonMonths && f.riskTolerance && f.riskCapacity && f.investmentKnowledge);
  if (selected && selected.type === "Mutual fund") {
    sourceIds = [...new Set([...sourceIds, "SRC-CIRO-MFD-KYC", "SRC-CIRO-MFD-SUIT"])];
    if (!needsPresent || !state.mutualFundKycConfirmed) {
      decisionStatus = "needs-information";
      reasons.push("Complete and confirm the mutual-fund KYC conversation before considering a recommendation.");
    }
    if (state.scenarioId === "TFSA-LONG-01" && selected.id === "MF-BALANCED" &&
        f.riskTolerance === "Low" && f.investmentKnowledge === "Limited") {
      decisionStatus = "training-mismatch";
      reasons.push("Low comfort with losses and limited mutual-fund knowledge conflict with this fictional medium-risk example.");
      alternatives = ["MF-CONSERVATIVE"];
      sourceIds.push("SRC-BANK-TRAINING-RULES");
    }
  }
  if (selected && selected.id === "GIC-LOCK-3Y" && state.scenarioId === "TFSA-LIQUIDITY-01" &&
      Number(f.liquidityNeedMonths) <= selected.termMonths && Number(f.liquidityNeedAmount) > 0) {
    decisionStatus = "training-mismatch";
    reasons.push("The client expects to need " + new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(Number(f.liquidityNeedAmount)) + " in " + f.liquidityNeedMonths + " months, before this non-redeemable GIC matures.");
    alternatives = ["GIC-CASH-1Y"];
    sourceIds.push("SRC-BANK-TRAINING-RULES", "SRC-BANK-GIC-TERMS");
  }
  const orderReady = registrationStatus === "eligible" && fundingStatus === "ready" &&
    identityStatus === "complete" && decisionStatus === "allowed" &&
    (!selected || selected.type !== "Mutual fund" || state.mutualFundKycConfirmed);
  return { registrationStatus, fundingStatus, identityStatus, decisionStatus, selected, reasons, sourceIds: [...new Set(sourceIds)], alternatives, orderReady };
}
