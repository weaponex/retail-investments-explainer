import { products } from "./products.js";

const riskRank = { Low: 1, Moderate: 2, High: 3 };

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
      : f.taxResidency === "Non-resident"
        ? "ineligible"
        : "eligible";
  const contributionRoute = ["Internal cash contribution", "External cash contribution"].includes(state.fundingMethod);
  const roomConfirmed = Boolean(f.reportedContributionRoom && f.reportedContributionRoom.trim() !== "" && f.reportedContributionRoom !== "Unknown");
  const fundingStatus = contributionRoute && (!roomConfirmed || f.taxResidency !== "Canada") ? "needs-information" : "ready";
  const followUpRequired = f.thirdParty === "Yes" || f.pepStatus === "Yes" || f.hioStatus === "Yes";
  let identityStatus = state.identityMethod && state.identityResult === "Passed" ? "complete" : "needs-information";
  if (state.identityResult === "Follow-up required" || (followUpRequired && !state.enhancedReviewCompleted)) identityStatus = "follow-up";
  const calculatedNetWorth = Number(f.totalAssets) - Number(f.liabilities);
  const needsPresent = Boolean(f.goal && Number(f.horizonMonths) > 0 && f.riskTolerance && riskRank[f.riskTolerance] &&
    f.investmentKnowledge && f.investmentKnowledge !== "Unknown" &&
    String(f.annualIncome ?? "").trim() !== "" && Number(f.annualIncome) >= 0 &&
    String(f.totalAssets ?? "").trim() !== "" && Number(f.totalAssets) >= 0 &&
    String(f.financialAssets ?? "").trim() !== "" && Number(f.financialAssets) >= 0 && Number(f.financialAssets) <= Number(f.totalAssets) &&
    String(f.liabilities ?? "").trim() !== "" && Number(f.liabilities) >= 0);
  // A transparent, fictional training signal: very concentrated exposure or
  // negative net worth lowers financial capacity; moderate concentration caps
  // it at Moderate. It is a teaching prompt, never a regulatory threshold.
  const amount = Number(f.investmentAmount) || 0;
  const investableAssets = Number(f.financialAssets) || 0;
  const income = Number(f.annualIncome) || 0;
  const negativeNetWorth = calculatedNetWorth < 0;
  const highConcentration = negativeNetWorth || (amount > 0 && (investableAssets <= 0 || calculatedNetWorth <= 0 || income <= 0)) ||
    (investableAssets > 0 && amount > investableAssets) || (calculatedNetWorth > 0 && amount > calculatedNetWorth) || (income > 0 && amount > income);
  const moderateConcentration = !highConcentration && ((investableAssets > 0 && amount / investableAssets >= 0.25) ||
    (calculatedNetWorth > 0 && amount / calculatedNetWorth >= 0.25) || (income > 0 && amount / income >= 0.25));
  const financialCapacitySignal = highConcentration ? "Low" : moderateConcentration ? "Moderate" : "High";
  const effectiveCapacity = financialCapacitySignal;
  const knowledgeDisclosureRequired = f.investmentKnowledge === "Limited" && !state.knowledgeDisclosureConfirmed;
  let riskProfile = "Needs discussion";
  let riskProfileLimiter = "";
  if (riskRank[f.riskTolerance] && riskRank[effectiveCapacity]) {
    if (riskRank[f.riskTolerance] < riskRank[effectiveCapacity]) {
      riskProfile = f.riskTolerance;
      riskProfileLimiter = "Limited by willingness to accept loss";
    } else if (riskRank[effectiveCapacity] < riskRank[f.riskTolerance]) {
      riskProfile = effectiveCapacity;
      riskProfileLimiter = "Limited by the fictional financial capacity assessment";
    } else {
      riskProfile = f.riskTolerance;
      riskProfileLimiter = "Tolerance and capacity are aligned";
    }
  }
  const proposedAmount = amount;
  const financialAssets = investableAssets;
  const financialReviewRequired = needsPresent && proposedAmount > financialAssets;
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
  if (financialReviewRequired) {
    decisionStatus = "needs-information";
    reasons.push("The proposed amount exceeds the client's stated financial assets. Clarify the funding source or correct the client information before assessing a product; do not change facts just to pass this check.");
    sourceIds.push("SRC-CIRO-RISK-PROFILE", "SRC-BANK-TRAINING-RULES");
  }
  if (knowledgeDisclosureRequired) {
    decisionStatus = "needs-information";
    reasons.push("With limited investment knowledge, the advisor must complete the required client disclosure before product comparison or selection.");
    sourceIds.push("SRC-CIRO-MFD-KYC", "SRC-BANK-TRAINING-RULES");
  }
  if (selected && selected.type === "Mutual fund") {
    sourceIds = [...new Set([...sourceIds, "SRC-CIRO-MFD-KYC", "SRC-CIRO-MFD-SUIT", "SRC-CIRO-RISK-PROFILE"])];
    if (!needsPresent || !state.mutualFundKycConfirmed) {
      decisionStatus = "needs-information";
      reasons.push("Complete and confirm the mutual-fund KYC conversation before considering a recommendation.");
    }
    if (riskProfile === "Low") {
      decisionStatus = "training-mismatch";
      reasons.push("The overall risk profile is Low based on the client's risk tolerance and financial capacity. This fictional Release 1 rule blocks mutual-fund choices and points to a lower-volatility deposit discussion.");
      alternatives = ["GIC-CASH-1Y"];
      sourceIds.push("SRC-BANK-TRAINING-RULES");
    } else if (selected.id === "MF-BALANCED" && Number(f.horizonMonths) < selected.minimumHorizonMonths) {
      decisionStatus = "training-mismatch";
      reasons.push("The client's " + f.horizonMonths + "-month planning horizon is shorter than this fictional balanced fund's " + selected.minimumHorizonMonths + "-month practice horizon.");
      alternatives = ["MF-CONSERVATIVE", "GIC-CASH-1Y"];
      sourceIds.push("SRC-BANK-TRAINING-RULES");
    } else if (Number(f.horizonMonths) < selected.minimumHorizonMonths) {
      decisionStatus = "training-mismatch";
      reasons.push("The client's " + f.horizonMonths + "-month planning horizon is shorter than this fictional fund's " + selected.minimumHorizonMonths + "-month practice horizon.");
      alternatives = ["GIC-CASH-1Y"];
      sourceIds.push("SRC-BANK-TRAINING-RULES");
    }
  }
  if (selected && selected.id === "GIC-LOCK-3Y" && Number(f.horizonMonths) < selected.termMonths) {
    decisionStatus = "training-mismatch";
    reasons.push("The client's " + f.horizonMonths + "-month investment horizon is shorter than this non-redeemable GIC's 36-month term.");
    alternatives = ["GIC-CASH-1Y"];
    sourceIds.push("SRC-BANK-TRAINING-RULES", "SRC-BANK-GIC-TERMS");
  }
  if (selected && selected.id === "GIC-LOCK-3Y" && Number(f.horizonMonths) >= selected.termMonths &&
      productAmount(f, selected) <= 0) {
    decisionStatus = "training-mismatch";
    reasons.push("The full proposed amount is needed for the client's near-term liquidity reserve, leaving no amount for this three-year GIC. Choose a liquid option or adjust the amount after discussing the reserve.");
    alternatives = ["GIC-CASH-1Y"];
    sourceIds.push("SRC-BANK-TRAINING-RULES", "SRC-BANK-GIC-TERMS");
  }
  const orderReady = registrationStatus === "eligible" && fundingStatus === "ready" && identityStatus === "complete" &&
    needsPresent && !financialReviewRequired && !knowledgeDisclosureRequired && decisionStatus === "allowed" &&
    (!selected || selected.type !== "Mutual fund" || state.mutualFundKycConfirmed);
  return { registrationStatus, fundingStatus, identityStatus, needsPresent, knowledgeDisclosureRequired, calculatedNetWorth, financialCapacitySignal, effectiveCapacity, riskProfile, riskProfileLimiter, financialReviewRequired, decisionStatus, selected, reasons, sourceIds: [...new Set(sourceIds)], alternatives, orderReady };
}

export function productAmount(facts, product) {
  const total = Number(facts.investmentAmount) || 0;
  if (product.id !== "GIC-LOCK-3Y" || Number(facts.liquidityNeedMonths) > product.termMonths) return total;
  const reserve = Math.min(total, Number(facts.liquidityNeedAmount) || 0);
  return Math.max(0, total - reserve);
}
