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
  const needsPresent = Boolean(f.goal && Number(f.horizonMonths) > 0 && f.riskTolerance && riskRank[f.riskTolerance] &&
    f.riskCapacity && riskRank[f.riskCapacity] && f.investmentKnowledge && f.investmentKnowledge !== "Unknown" &&
    String(f.annualIncome ?? "").trim() !== "" && String(f.netWorth ?? "").trim() !== "" &&
    String(f.financialAssets ?? "").trim() !== "" && f.liabilities);
  let riskProfile = "Needs discussion";
  let riskProfileLimiter = "";
  if (riskRank[f.riskTolerance] && riskRank[f.riskCapacity]) {
    if (riskRank[f.riskTolerance] < riskRank[f.riskCapacity]) {
      riskProfile = f.riskTolerance;
      riskProfileLimiter = "Limited by willingness to accept loss";
    } else if (riskRank[f.riskCapacity] < riskRank[f.riskTolerance]) {
      riskProfile = f.riskCapacity;
      riskProfileLimiter = "Limited by financial capacity for loss";
    } else {
      riskProfile = f.riskTolerance;
      riskProfileLimiter = "Tolerance and capacity are aligned";
    }
  }
  const proposedAmount = Number(f.investmentAmount) || 0;
  const financialAssets = Number(f.financialAssets);
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
  if (selected && selected.type === "Mutual fund") {
    sourceIds = [...new Set([...sourceIds, "SRC-CIRO-MFD-KYC", "SRC-CIRO-MFD-SUIT", "SRC-CIRO-RISK-PROFILE"])];
    if (!needsPresent || !state.mutualFundKycConfirmed) {
      decisionStatus = "needs-information";
      reasons.push("Complete and confirm the mutual-fund KYC conversation before considering a recommendation.");
    }
    if (f.investmentKnowledge === "Limited" && !state.mutualFundUnderstandingConfirmed) {
      decisionStatus = "needs-information";
      reasons.push("Pause to explain that mutual-fund values can fall and returns are not guaranteed. Continue only after the client can describe those risks in their own words.");
      sourceIds.push("SRC-BANK-TRAINING-RULES");
    }
    if (riskProfile === "Low") {
      decisionStatus = "training-mismatch";
      reasons.push("The overall risk profile is low, limited by " + (riskProfileLimiter === "Limited by willingness to accept loss" ? "the client's low willingness to accept loss" : "low financial capacity for loss") + ". This fictional Release 1 rule blocks mutual-fund choices and points to a lower-volatility deposit discussion.");
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
  if (selected && selected.id === "GIC-LOCK-3Y" &&
      (Number(f.horizonMonths) < selected.termMonths ||
        (Number(f.liquidityNeedMonths) <= selected.termMonths && Number(f.liquidityNeedAmount) > 0))) {
    decisionStatus = "training-mismatch";
    reasons.push("The client's time horizon or stated liquidity need is earlier than this non-redeemable GIC's 36-month maturity.");
    alternatives = ["GIC-CASH-1Y"];
    sourceIds.push("SRC-BANK-TRAINING-RULES", "SRC-BANK-GIC-TERMS");
  }
  const orderReady = registrationStatus === "eligible" && fundingStatus === "ready" && identityStatus === "complete" &&
    needsPresent && !financialReviewRequired && decisionStatus === "allowed" &&
    (!selected || selected.type !== "Mutual fund" || state.mutualFundKycConfirmed);
  return { registrationStatus, fundingStatus, identityStatus, needsPresent, riskProfile, riskProfileLimiter, financialReviewRequired, decisionStatus, selected, reasons, sourceIds: [...new Set(sourceIds)], alternatives, orderReady };
}