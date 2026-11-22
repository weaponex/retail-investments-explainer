export const products = [
  { id: "GIC-CASH-1Y", name: "One-year cashable GIC", type: "GIC", risk: "Low", rate: 0.03, annualFee: 0, termMonths: 12, interest: "Interest paid at maturity", redemption: "Fictional terms allow redemption after 30 days; early redemption uses a 0.50% annual rate.", accountTypes: ["TFSA"], summary: "A fixed-rate deposit with a one-year maturity and fictional early-redemption terms.", sourceIds: ["SRC-BANK-GIC-TERMS", "SRC-CRA-TFSA-OPEN"] },
  { id: "GIC-LOCK-3Y", name: "Three-year fixed GIC", type: "GIC", risk: "Low", rate: 0.04, annualFee: 0, termMonths: 36, interest: "Annual compounding; paid at maturity", redemption: "Non-redeemable before maturity under this fictional product term.", accountTypes: ["TFSA"], summary: "A longer fixed term. Access before maturity is not available in this fictional product.", sourceIds: ["SRC-BANK-GIC-TERMS", "SRC-CRA-TFSA-OPEN"] },
  { id: "MF-CONSERVATIVE", name: "Conservative income fund", type: "Mutual fund", risk: "Low-to-medium", rate: null, annualFee: 0.0125, termMonths: null, interest: null, redemption: "Can be sold on a business day; sale price and settlement timing vary.", accountTypes: ["TFSA"], summary: "A fictional fixed-income fund. Its value can rise or fall; it is not a deposit or a guaranteed investment.", sourceIds: ["SRC-CIRO-MFD-KYC", "SRC-CIRO-MFD-SUIT"] },
  { id: "MF-BALANCED", name: "Balanced portfolio fund", type: "Mutual fund", risk: "Medium", rate: null, annualFee: 0.0175, termMonths: null, interest: null, redemption: "Can be sold on a business day; sale price and settlement timing vary.", accountTypes: ["TFSA"], summary: "A fictional balanced fund. Its value can rise or fall and its return is not guaranteed.", sourceIds: ["SRC-CIRO-MFD-KYC", "SRC-CIRO-MFD-SUIT"] }
];

export function gicMaturityValue(product, principal) {
  if (product.type !== "GIC" || !Number.isFinite(principal)) return null;
  return principal * (1 + product.rate) ** (product.termMonths / 12);
}
