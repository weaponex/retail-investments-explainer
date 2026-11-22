export function createSession(scenario) {
  return {
    scenarioId: scenario.id, scenarioVersion: "1.0.0", ruleVersion: "1.0.0",
    accountType: "TFSA", step: 1, facts: structuredClone(scenario.facts),
    fundingMethod: scenario.fundingMethod, identityMethod: "", identityResult: "",
    enhancedReviewCompleted: false, mutualFundKycConfirmed: false, selectedProductId: "",
    reviewConfirmed: false, finished: false, transaction: null,
    timeline: [{ id: crypto.randomUUID(), time: new Date(), kind: "scenario", text: "Started " + scenario.title + ". Fictional client data loaded." }]
  };
}

export function addTimeline(state, kind, text) {
  state.timeline.push({ id: crypto.randomUUID(), time: new Date(), kind, text });
}
