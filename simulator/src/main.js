import { scenarioList } from "./scenarios.js";
import { products, gicMaturityValue } from "./products.js";
import { sourcesFor } from "./citations.js";
import { evaluate } from "./rules.js";
import { createSession, addTimeline } from "./session.js";

const root = document.querySelector("#app");
const restartButton = document.querySelector("#restart-button");
const steps = ["Scenario", "Account", "Identity / AML", "Needs / KYC", "Product fit", "Review / service"];
let state = null;
let explanationOpen = false;
const fmt = (s, ...values) => s.replace(/~(\d+)~/g, (_, n) => values[Number(n)] ?? "");
const esc = (v = "") => String(v).replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;" }[c]));
const money = (v) => new Intl.NumberFormat("en-CA", { style:"currency", currency:"CAD", maximumFractionDigits:2 }).format(Number(v) || 0);
const activeScenario = () => scenarioList.find((s) => s.id === state.scenarioId);
const result = () => evaluate(state);
function addEvent(kind, text) { addTimeline(state, kind, text); }

function start(id) {
  const s = scenarioList.find((item) => item.id === id);
  state = createSession(s);
  addEvent("client", s.prompts.account);
  render();
}
function changeFact(key, value) {
  state.facts[key] = value;
  state.transaction = null;
  if (key === "sinToken") state.facts.sinProvided = Boolean(value);
  if (key === "dateOfBirth" && value) {
    const birth = new Date(value + "T00:00:00");
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age -= 1;
    state.facts.age = age;
  }
  const profileKeys = ["riskTolerance","riskCapacity","investmentKnowledge","horizonMonths","liquidityNeedMonths","liquidityNeedAmount","goal","annualIncome","financialAssets","netWorth","liabilities"];
  if (profileKeys.includes(key)) {
    state.selectedProductId = "";
    state.mutualFundKycConfirmed = false;
    state.mutualFundUnderstandingConfirmed = false;
  }
  if (["investmentAmount","taxResidency"].includes(key)) state.selectedProductId = "";
  if (key === "investmentKnowledge") state.mutualFundUnderstandingConfirmed = false;
  state.finished = false;
}
function canVisit(step) {
  const r = result();
  if (step <= 1) return true;
  if (step === 2) return r.registrationStatus === "eligible";
  if (step === 3) return r.registrationStatus === "eligible" && r.identityStatus === "complete";
  if (step === 4) return r.registrationStatus === "eligible" && r.identityStatus === "complete" && r.needsPresent;
  if (step === 5) return r.orderReady;
  return false;
}
function go(step) {
  if (step < 1 || step > 5) return;
  if (step > state.step && !canVisit(step)) {
    addEvent("rule", "Resolve the required account, identity, funding, or product step before continuing.");
    render(); return;
  }
  state.step = step;
  explanationOpen = false;
  addEvent("advisor", "Opened " + steps[step] + ".");
  render();
}
function options(values, selected) {
  return values.map((v) => fmt("<option value='~0~' ~1~>~2~</option>", esc(v), selected === v ? "selected" : "", esc(v))).join("");
}
function sourceCards(ids) {
  return sourcesFor(ids).map((s) => fmt("<article class='source-item'><div><span class='source-type'>~0~</span><strong>~1~ · ~2~</strong><small>~3~</small><p>~4~</p></div>~5~</article>",
    esc(s.type), esc(s.authority), esc(s.title), esc(s.section), esc(s.note),
    s.url ? fmt("<a href='~0~' target='_blank' rel='noopener noreferrer'>Open source ↗</a>", esc(s.url)) : "<span class='fictional-label'>Fictional source</span>")).join("");
}
function callout(title, text, type) {
  return fmt("<div class='callout ~0~'><strong>~1~</strong><p>~2~</p></div>", type || "info", esc(title), esc(text));
}
function explainer(title, text, ids) {
  if (!explanationOpen) return "";
  return fmt("<section class='explainer-panel'><div class='panel-heading'><div><span class='eyebrow'>Why this matters</span><h3>~0~</h3></div><button type='button' class='icon-button' data-explain aria-label='Close explanation'>×</button></div><p>~1~</p>~2~</section>", esc(title), esc(text), sourceCards(ids));
}
function horizon(months) {
  const n = Number(months) || 0;
  return n >= 12 ? (n / 12) + " year" + (n >= 24 ? "s" : "") : n + " months";
}
function maturityDate(product) {
  const date = new Date();
  date.setMonth(date.getMonth() + product.termMonths);
  return date.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}
function statusPanel() {
  const r = result();
  const issues = [];
  const add = (text, step, label) => issues.push(fmt("<li><span>~0~</span><button type='button' data-step='~1~'>~2~</button></li>", esc(text), step, esc(label)));
  if (r.registrationStatus !== "eligible") add(r.registrationStatus === "ineligible" ? "TFSA eligibility check failed. Review age, tax residency and required registration details." : "Complete the required account details. Confirm name, date of birth, Ontario address, tax residency and SIN reference.", 1, "Open account details");
  if (r.identityStatus !== "complete" && r.registrationStatus === "eligible") add(r.identityStatus === "follow-up" ? "Identity / AML follow-up is incomplete. Complete the prompted follow-up and record a passed scenario result." : "Choose an identity method and record a passed scenario result before continuing.", 2, "Open identity / AML");
  if (!r.needsPresent && r.identityStatus === "complete") add("Complete the client needs and financial profile before reviewing products.", 3, "Open needs / KYC");
  if (r.fundingStatus !== "ready") add("Contribution room or residency needs confirmation before a cash contribution can be simulated.", 1, "Review funding details");
  if (r.selected && r.decisionStatus !== "allowed") add(r.reasons.join(" "), 4, "Review product fit");
  if (state.step >= 4 && !r.selected) add("Select a product to run its client-specific scenario check.", 4, "Choose a product");
  const kind = issues.length ? "warning" : r.orderReady ? "success" : "info";
  const title = issues.length ? "Action needed" : r.orderReady ? "Configured checks passed" : "Progress check";
  const description = issues.length ? "Amber items block the indicated action. Use a link to return to the step that needs attention." : r.orderReady ? "The current account, identity, KYC, funding and product checks allow you to continue to review." : "Grey is information only and does not block progress. Complete the current step to see the next check.";
  return fmt("<section class='journey-status ~0~' role='~1~'><h3>~2~</h3><p>~3~</p>~4~<div class='status-legend'><span><i class='legend-dot amber'></i>Action required</span><span><i class='legend-dot green'></i>Ready</span><span><i class='legend-dot grey'></i>Information</span></div></section>", kind, issues.length ? "alert" : "status", title, description, issues.length ? "<ul>" + issues.join("") + "</ul>" : "");
}
function renderShell(content) {
  let progress = "";
  let timeline = "";
  if (state) {
    const active = state.step;
    const buttons = steps.map((name, i) => fmt("<button type='button' data-step='~0~' class='~1~' ~2~><span class='step-number'>~3~</span>~4~</button>",
      i, i === active ? "active" : "", (i === 0 || (i > active && !canVisit(i))) ? "disabled" : "", i + 1, esc(name))).join("");
    progress = fmt("<section class='journey-strip'><div class='journey-title'><div><span class='eyebrow'>~0~</span><h1>~1~</h1></div><span class='step-count'>Step ~2~ of 6</span></div><div class='progress-track'><span style='width:~3~%'></span></div><nav class='step-nav' aria-label='Journey steps'>~4~</nav></section>",
      esc(activeScenario().title), esc(steps[active]), active + 1, ((active + 1) / 6) * 100, buttons);
    const events = state.timeline.slice(-9).map((e) => fmt("<li class='timeline-event ~0~'><span class='timeline-dot'></span><div><span class='event-type'>~1~</span><p>~2~</p><time>~3~</time></div></li>",
      esc(e.kind), esc(e.kind), esc(e.text), new Intl.DateTimeFormat("en-CA", { hour:"numeric", minute:"2-digit" }).format(e.time))).join("");
    timeline = fmt("<aside class='timeline-card'>~0~<div class='panel-heading'><div><span class='eyebrow'>Scenario record</span><h2>Client / advisor timeline</h2></div><span class='count-pill'>~1~ events</span></div><ol class='timeline-list'>~2~</ol><div class='fact-mini'><strong>Client facts carried forward</strong><dl><div><dt>Goal</dt><dd>~3~</dd></div><div><dt>Horizon</dt><dd>~4~</dd></div><div><dt>Risk tolerance</dt><dd>~5~</dd></div><div><dt>Risk capacity</dt><dd>~6~</dd></div><div><dt>Knowledge</dt><dd>~7~</dd></div><div><dt>Liquidity</dt><dd>~8~</dd></div></dl></div></aside>",
      statusPanel(), state.timeline.length, events, esc(state.facts.goal), horizon(state.facts.horizonMonths), esc(state.facts.riskTolerance), esc(state.facts.riskCapacity), esc(state.facts.investmentKnowledge),
      state.facts.liquidityNeedAmount ? money(state.facts.liquidityNeedAmount) + " by month " + esc(state.facts.liquidityNeedMonths) : "No near-term need reported");
  }
  root.innerHTML = progress + fmt("<div class='~0~'><section class='main-panel'>~1~</section>~2~</div>", state ? "workspace-grid" : "", content, timeline);
  restartButton.disabled = !state;
  root.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => go(Number(b.dataset.step))));
  root.querySelectorAll("[data-explain]").forEach((b) => b.addEventListener("click", () => { explanationOpen = !explanationOpen; render(); }));
}
function render() {
  if (!state) {
    const cards = scenarioList.map((s) => fmt("<button class='scenario-card' type='button' data-start='~0~'><span class='scenario-icon'>↗</span><span><strong>~1~</strong><small>~2~</small><em>~3~</em></span><b aria-hidden='true'>→</b></button>",
      esc(s.id), esc(s.title), esc(s.subtitle), esc(s.description))).join("");
    const future = ["RRSP","RESP","LIRA","FHSA","Non-registered"].map((x) => fmt("<span class='disabled-chip' aria-disabled='true'>~0~<small>Later release</small></span>", x)).join("");
    const welcome = fmt("<section class='welcome-layout'><div class='welcome-copy'><span class='eyebrow'>Practice a client conversation</span><h1>Learn the steps behind an investment recommendation.</h1><p>Work through a fictional Ontario bank scenario. Your answers carry forward into account checks, identity steps, KYC, product options and a simulated order review.</p><div class='welcome-points'><div><span>01</span><div><strong>Use client facts</strong><p>Product checks respond to what the client has told you.</p></div></div><div><span>02</span><div><strong>Open the rule notes</strong><p>See whether a result comes from a public source or a fictional bank procedure.</p></div></div><div><span>03</span><div><strong>Practice safely</strong><p>There are no real identity checks, account connections or orders.</p></div></div></div></div><div class='scenario-picker'><span class='eyebrow'>Choose a scenario</span><h2>New TFSA client</h2><p class='muted'>Both variations use the same six-step journey. Client facts and prompts differ.</p>~0~<div class='future-accounts'><strong>Other account types</strong><div class='future-grid'>~1~</div><p>These options are visible but disabled in Release 1; no partial application can be opened.</p></div></div></section>", cards, future);
    renderShell(welcome);
    root.querySelectorAll("[data-start]").forEach((b) => b.addEventListener("click", () => start(b.dataset.start)));
    return;
  }
  const views = [null, accountView, identityView, needsView, productView, reviewView];
  renderShell(views[state.step]());
  wireCommon();
  if (state.step === 1) wireAccount();
  if (state.step === 2) wireIdentity();
  if (state.step === 3) wireNeeds();
  if (state.step === 4) wireProducts();
  if (state.step === 5) wireReview();
}
function accountView() {
  const f = state.facts, r = result();
  const cash = ["Internal cash contribution","External cash contribution"].includes(state.fundingMethod);
  const laterTypes = ["RRSP","RESP","LIRA","FHSA","Non-registered"].map((x) => fmt("<option disabled>~0~ · disabled · later release</option>", x)).join("");
  const fundingOptions = ["Internal cash contribution","External cash contribution","Direct TFSA-to-TFSA transfer","Maturing GIC in existing TFSA"].map((x) => fmt("<option value='~0~' ~1~>~0~</option>", esc(x), state.fundingMethod === x ? "selected" : "")).join("");
  const designations = "<div class='section-divider'><span>Optional designation</span><span class='muted'>Fictional details only</span></div><div class='choice-row'><label class='check-label'><input type='checkbox' data-fact='beneficiary' " + (f.beneficiary ? "checked" : "") + "> Beneficiary</label><label class='check-label'><input type='checkbox' data-fact='successorHolder' " + (f.successorHolder ? "checked" : "") + "> Eligible spouse/partner as successor holder</label></div>";
  const roomMessage = cash && f.reportedContributionRoom === "Unknown"
    ? callout("Contribution room is not confirmed","Continue the account-opening conversation, but do not simulate this contribution until the client confirms their room.","warning") : "";
  const residencyMessage = f.taxResidency === "Other"
    ? callout("Check the non-resident path","CRA guidance notes that a non-resident may hold a TFSA but cannot make tax-free contributions. Confirm the issuer's account process; this simulation will not allow a cash contribution on this answer.","warning") : "";
  const html = fmt("<div class='screen-heading'><div><span class='eyebrow'>1 · Registration and funding</span><h2>Open the TFSA</h2><p>Capture registration facts first. Account eligibility and contribution room are separate checks.</p></div><button type='button' class='link-button' data-explain>Why these fields?</button></div><div class='account-type-row'><label for='account-type'>Account type</label><select id='account-type'><option selected>TFSA · enabled · Release 1</option>~0~</select></div>~1~<div class='form-grid'><label>Legal name<input data-fact='legalName' value='~2~'></label><label>Date of birth<input data-fact='dateOfBirth' type='date' value='~3~'><small>Fictional scenario age: ~4~.</small></label><label>SIN reference (fictional)<input data-fact='sinToken' value='~5~'><small>Simulator token only; not a Canadian SIN.</small></label><label>Residential address<input data-fact='residentialAddress' value='~6~'></label><label>Tax residency<select data-fact='taxResidency'>~7~</select></label><label>Other tax residencies / TIN, if applicable<input data-fact='foreignTaxResidencies' value='~8~'></label></div><div class='section-divider'><span>Funding</span><button type='button' class='link-button' data-explain>Contribution room and funding</button></div><div class='form-grid'><label>Funding method<select id='funding-method'>~9~</select></label><label>~10~<input data-fact='reportedContributionRoom' value='~11~'><small>The simulator does not connect to CRA or calculate room.</small></label><label>Amount to fund<input data-fact='investmentAmount' type='number' min='0' step='100' value='~12~'></label><label>Other institution / masked reference<input data-fact='fundingReference' value='~13~' placeholder='Conditional on route'></label></div>~14~~15~~16~<div class='screen-actions'><span class='field-note'>All account and funding actions are simulated.</span><button class='primary-button' id='to-identity'>Continue to identity / AML →</button></div>",
    laterTypes, r.registrationStatus === "eligible" ? callout("Registration facts complete","The scenario's TFSA opening checks pass. This does not determine contribution room.","success") : r.registrationStatus === "ineligible" ? callout("Registration needs a different path","Current answers do not meet this scenario's TFSA opening check.","warning") : callout("Complete the registration facts","Check the amber action panel for required account fields.","warning"),
    esc(f.legalName), esc(f.dateOfBirth), esc(f.age), esc(f.sinToken), esc(f.residentialAddress),
    options(["Canada","Other","Unknown"], f.taxResidency), esc(f.foreignTaxResidencies), fundingOptions,
    cash ? "Client-reported TFSA contribution room" : "Transfer amount / maturity details",
    esc(f.reportedContributionRoom), esc(f.investmentAmount), esc(f.fundingReference || ""), roomMessage + residencyMessage, designations,
    explainer("TFSA opening and contribution room","CRA opening information is separate from contribution-room tracking. Ask the client to verify room and history; the simulator never calculates a real person's room.",["SRC-CRA-TFSA-OPEN","SRC-CRA-TFSA-ROOM"]));
  return html;
}
function identityView() {
  const f=state.facts,r=result();
  const methods=["Government-issued photo ID","Credit file","Dual-process","Affiliate or member","Reliance"].map((x)=>fmt("<option value='~0~' ~1~>~0~</option>",x,state.identityMethod===x?"selected":"")).join("");
  const pepFollow=f.pepStatus==="Yes"||f.hioStatus==="Yes"||f.thirdParty==="Yes";
  const extra=pepFollow ? "<label class='check-label follow-up'><input id='enhanced-review' type='checkbox' " + (state.enhancedReviewCompleted?"checked":"") + "> I completed the scenario's required follow-up conversation</label>" : "";
  return fmt("<div class='screen-heading'><div><span class='eyebrow'>2 · Identity and account controls</span><h2>Confirm who the client is</h2><p>Choose a simulated method and record required scenario follow-up.</p></div><button class='link-button' data-explain>About identity checks</button></div>~0~<div class='form-grid'><label>Occupation<input data-fact='occupation' value='~1~'></label><label>Employer<input data-fact='employer' value='~2~'></label><label>Employer business address<input data-fact='employerAddress' value='~3~'></label><label>Identity verification method<select id='identity-method'><option value=''>Choose a method</option>~4~</select></label><label>Fictional method result<select id='identity-result'><option value=''>Choose result</option>~5~</select><small>Authored scenario result, not real verification.</small></label></div><fieldset class='fieldset-card'><legend>Account and relationship questions</legend><div class='form-grid'><label>Someone else directing or benefiting?~6~</label><label>PEP / HIO status~7~</label><label>Related or close associate status~8~</label></div></fieldset>~9~~10~~11~~12~<div class='screen-actions'><button class='secondary-button' data-back>← Back to account</button><button class='primary-button' id='to-needs'>Continue to needs / KYC →</button></div>",
    callout("Simulation only","No document, credit file, screening result, or external identity service is accessed."),
    esc(f.occupation),esc(f.employer),esc(f.employerAddress),methods,
    options(["Passed","Follow-up required"],state.identityResult),
    options(["No","Yes","Unknown"],f.thirdParty),options(["No","Yes","Unknown"],f.pepStatus),options(["No","Yes","Unknown"],f.hioStatus),
    f.thirdParty==="Yes"?callout("Third-party follow-up","Clarify who directs the activity and who benefits; follow the fictional bank process.","warning"):"",
    f.pepStatus==="Yes"||f.hioStatus==="Yes"?callout("Additional AML follow-up triggered","The scenario asks for risk-based follow-up. A PEP/HIO answer alone is not an automatic refusal.","warning"):"",
    extra,
    r.identityStatus==="complete"?callout("Simulated identity step complete","The fictional method is marked passed. No document was checked.","success"):callout("Identity step incomplete","Choose a method, record a passed scenario result, and complete any prompted follow-up. See the amber action panel for next steps.","warning"),
    explainer("FINTRAC identity methods and follow-up","FINTRAC guidance describes several identity methods. Which method is available and when it must be used depends on the reporting entity and circumstances. This screen teaches method choice without verifying a person.",["SRC-FINTRAC-ID","SRC-FINTRAC-PEP-HIO"]));
}
function needsView() {
  const f=state.facts;
  const fields=[
    ["Primary goal","goal","text"],["Investment horizon (months)","horizonMonths","number"],["When might money be needed? (months)","liquidityNeedMonths","number"],["Amount that may be needed","liquidityNeedAmount","number"],
    ["Annual income (fictional)","annualIncome","number"],["Financial assets (fictional)","financialAssets","number"],["Estimated net worth (fictional)","netWorth","number"],["Liabilities / borrowing to invest","liabilities","text"]
  ].map(([label,key,type])=>fmt("<label>~0~<input data-fact='~1~' type='~2~' value='~3~'></label>",label,key,type,esc(f[key]??""))).join("");
  const select=(label,key,values)=>fmt("<label>~0~<select data-fact='~1~'>~2~</select></label>",label,key,options(values,f[key]));
  const conflict=f.riskTolerance!==f.riskCapacity?callout("Discuss the difference","The client reports "+f.riskTolerance.toLowerCase()+" willingness to accept losses and "+f.riskCapacity.toLowerCase()+" ability to withstand losses. Ask what matters most before forming a profile.","warning"):"";
  const teachback=f.investmentKnowledge==="Limited"?"<label class='check-label confirm-check'><input id='mf-understanding' type='checkbox' "+(state.mutualFundUnderstandingConfirmed?"checked":"")+"> After an explanation, client can describe that mutual funds can lose value and returns are not guaranteed. <small>Scenario teach-back; this is not a waiver or guarantee of suitability.</small></label>":"";
  return fmt("<div class='screen-heading'><div><span class='eyebrow'>3 · Understand the client</span><h2>Discuss needs and KYC</h2><p>Check whether goals, finances, knowledge and risk answers fit together.</p></div><button class='link-button' data-explain>Why collect KYC?</button></div><div class='client-quote'><span>Client says</span><blockquote>“~0~”</blockquote></div><div class='form-grid'>~1~~2~~3~~4~</div>~5~~6~~7~~8~<div class='screen-actions'><button class='secondary-button' data-back>← Back to identity</button><button class='primary-button' id='to-products'>Review product fit →</button></div>",
    esc(activeScenario().prompts.needs),fields,
    select("Investment knowledge","investmentKnowledge",["Limited","Basic","Good","Extensive"]),
    select("Risk tolerance · willingness to accept loss","riskTolerance",["Low","Moderate","High","Unknown"]),
    select("Risk capacity · ability to withstand loss","riskCapacity",["Low","Moderate","High","Unknown"]),
    "<label class='check-label confirm-check'><input id='kyc-confirm' type='checkbox' "+(state.mutualFundKycConfirmed?"checked":"")+"> Client confirms the recorded mutual-fund KYC facts <small>Scenario confirmation only.</small></label>",
    conflict,teachback,
    explainer("KYC, risk profile and suitability","For the fictional mutual-fund dealer path, capture sufficient personal and financial circumstances, needs and objectives, investment knowledge, risk profile, and time horizon. Consider risk tolerance and capacity separately and address conflicts. Do not change client facts only to make a product fit.",["SRC-CIRO-MFD-KYC","SRC-CIRO-MFD-SUIT"]));
}
function productCard(p, check) {
  const selected=state.selectedProductId===p.id, alt=check.alternatives.includes(p.id);
  const productCheck=evaluate({...state,selectedProductId:p.id});
  const mismatch=productCheck.decisionStatus==="training-mismatch";
  const needsInformation=productCheck.decisionStatus==="needs-information";
  const fitHint=mismatch?fmt("<div class='product-fit-hint warning'><strong>Scenario mismatch</strong><span>~0~</span></div>",esc(productCheck.reasons.join(" "))):needsInformation?fmt("<div class='product-fit-hint warning'><strong>Action required before considering</strong><span>~0~</span></div>",esc(productCheck.reasons.join(" "))):"";
  const maturity=maturityDate(p);
  const details=p.type==="GIC"
    ? fmt("<dl class='product-details'><div><dt>Fictional rate</dt><dd>~0~% per year</dd></div><div><dt>Term / maturity</dt><dd>~1~ year~2~ · ~3~</dd></div><div><dt>Illustrative maturity value</dt><dd>~4~</dd></div><div><dt>Access</dt><dd>~5~</dd></div></dl>",(p.rate*100).toFixed(2),p.termMonths/12,p.termMonths>12?"s":"",maturity,money(gicMaturityValue(p,Number(state.facts.investmentAmount))),esc(p.redemption))
    : fmt("<dl class='product-details'><div><dt>Objective</dt><dd>~0~</dd></div><div><dt>Annual fee (fictional)</dt><dd>~1~%</dd></div><div><dt>Return</dt><dd>Not guaranteed; value can fall</dd></div><div><dt>Access</dt><dd>~2~</dd></div></dl>",p.id==="MF-CONSERVATIVE"?"Fixed income":"Balanced growth and income",(p.annualFee*100).toFixed(2),esc(p.redemption));
  return fmt("<article class='product-card ~0~ ~1~ ~2~'><div class='product-top'><span class='product-type'>~3~</span><span class='risk-badge'>~4~ risk</span></div><h3>~5~</h3><p>~6~</p>~7~~8~<button class='~9~' data-product='~10~'>~11~</button></article>",selected?"selected":"",alt?"alternative":"",mismatch?"mismatch":"",esc(p.type),esc(p.risk),esc(p.name),esc(p.summary),fitHint,details,selected?"selected-button":"secondary-button",esc(p.id),selected?"Selected":alt?"Choose suggested alternative":mismatch?"Select to review mismatch":"Select product");
}
function productView() {
  const check=result(),p=check.selected;
  let notice="";
  if(p && check.decisionStatus==="training-mismatch"){
    notice=fmt("<section class='decision-box warning' role='alert'><div class='decision-label'>Scenario training gate · choose another option</div><h3>This selection conflicts with client information.</h3><ul>~0~</ul><p>This is a scenario rule, not a universal legal prohibition. Review source types and choose an allowed alternative.</p>~1~</section>",check.reasons.map((x)=>fmt("<li>~0~</li>",esc(x))).join(""),sourceCards(check.sourceIds));
  } else if(p && check.decisionStatus==="needs-information"){
    notice=fmt("<section class='decision-box warning' role='alert'><div class='decision-label'>Action required</div><h3>Complete the required conversation before proceeding.</h3><ul>~0~</ul>~1~</section>",check.reasons.map((x)=>fmt("<li>~0~</li>",esc(x))).join(""),sourceCards(check.sourceIds));
  } else if(p) notice=fmt("<section class='decision-box success'><div class='decision-label'>Scenario check passed</div><h3>~0~ can proceed to client review.</h3><p>This reflects the configured scenario rules; it is not personalized advice.</p>~1~</section>",esc(p.name),sourceCards(check.sourceIds));
  const summary=fmt("<div class='client-summary-strip'><div><small>Goal</small><strong>~0~</strong></div><div><small>Horizon</small><strong>~1~</strong></div><div><small>Risk tolerance / capacity</small><strong>~2~ / ~3~</strong></div><div><small>Liquidity need</small><strong>~4~</strong></div><button class='text-button' id='edit-needs'>Edit client facts</button></div>",
    esc(state.facts.goal),horizon(state.facts.horizonMonths),esc(state.facts.riskTolerance),esc(state.facts.riskCapacity),state.facts.liquidityNeedAmount?money(state.facts.liquidityNeedAmount)+" in "+state.facts.liquidityNeedMonths+" mo.":"None reported");
  return fmt("<div class='screen-heading'><div><span class='eyebrow'>4 · Compare and discuss</span><h2>Product fit</h2><p>Options reflect the client profile. Amber cards show a mismatch or required conversation; selecting one explains the issue, but it cannot proceed to review.</p></div><button class='link-button' data-explain>How are options checked?</button></div>~0~<div class='product-grid'>~1~</div>~2~~3~<div class='screen-actions'><button class='secondary-button' data-back>← Back to needs / KYC</button><button class='primary-button' id='to-review' ~4~>Continue to client review →</button></div>",
    summary,products.filter((x)=>x.accountTypes.includes(state.accountType)).map((x)=>productCard(x,check)).join(""),
    p?notice:"<p class='field-note'>Select a product to see its scenario check.</p>",
    explainer("How product fit is checked","The simulator uses account compatibility, client facts, product terms, and explicit scenario rules. It does not rank by compensation or turn a teaching gate into a legal rule.",["SRC-CIRO-MFD-SUIT","SRC-BANK-TRAINING-RULES"]),
    check.orderReady?"":"disabled");
}
function reviewView() {
  const check=result(),p=check.selected,amount=Number(state.facts.investmentAmount)||0;
  if (state.finished) {
    const facts=fmt("<ul class='recap-facts'><li>Goal: ~0~</li><li>Time horizon: ~1~</li><li>Risk tolerance / capacity: ~2~ / ~3~</li><li>Liquidity need: ~4~</li></ul>",
      esc(state.facts.goal),horizon(state.facts.horizonMonths),esc(state.facts.riskTolerance),esc(state.facts.riskCapacity),
      state.facts.liquidityNeedAmount?money(state.facts.liquidityNeedAmount)+" by month "+esc(state.facts.liquidityNeedMonths):"No near-term need reported");
    return fmt("<div class='screen-heading'><div><span class='eyebrow'>Scenario complete</span><h2>Rules and choices recap</h2><p>Review the fictional client facts and the sources shown during the conversation.</p></div></div><section class='review-card'><h3>Client facts used</h3>~0~<h3>Selected product</h3><p>~1~ · ~2~</p><h3>Training result</h3><p>~3~</p><h3>Source references</h3>~4~</section><div class='screen-actions'><button class='secondary-button' id='restart-variation'>Restart this variation</button><button class='primary-button' id='restart-new'>Choose another scenario</button></div>",
      facts,esc(p ? p.name : "None"),money(amount),esc(check.reasons.join(" ") || "The configured scenario checks allowed the selection."),sourceCards(check.sourceIds));
  }
  let productInfo="";
  if(p && p.type==="GIC"){
    productInfo=fmt("<div><dt>Illustrative maturity date</dt><dd>~0~</dd></div><div><dt>Illustrative value at maturity</dt><dd>~1~</dd></div><div><dt>Early redemption</dt><dd>~2~</dd></div>",
      maturityDate(p),money(gicMaturityValue(p,amount)),esc(p.redemption));
  } else if(p) productInfo=fmt("<div><dt>Annual fee</dt><dd>~0~% (fictional)</dd></div><div><dt>Return</dt><dd>Not guaranteed; value can fall</dd></div><div><dt>Risk</dt><dd>~1~</dd></div>",(p.annualFee*100).toFixed(2),esc(p.risk));
  const card=p?fmt("<section class='review-card'><div class='review-title'><div><span class='product-type'>~0~</span><h3>~1~</h3></div><span class='simulation-tag'>Simulation only</span></div><dl class='review-grid'><div><dt>Account</dt><dd>~2~</dd></div><div><dt>Funding method</dt><dd>~3~</dd></div><div><dt>Amount</dt><dd>~4~</dd></div>~5~</dl><div class='client-quote compact'><span>Client prompt</span><blockquote>“~6~”</blockquote></div><label class='check-label confirm-check'><input id='review-confirm' type='checkbox' ~7~> I reviewed the fictional terms and explained what is guaranteed and what is not.</label></section>",
      esc(p.type),esc(p.name),esc(state.accountType),esc(state.fundingMethod),money(amount),productInfo,esc(activeScenario().prompts.review),state.reviewConfirmed?"checked":"")
    :callout("No product selected","Return to product fit and choose an option that passes the scenario check.","warning");
  const confirmation=state.transaction?fmt("<section class='confirmation-card'><span class='success-mark'>✓</span><div><span class='eyebrow'>Fictional confirmation</span><h3>Practice transaction recorded</h3><p>Reference <strong>~0~</strong> · ~1~ · ~2~</p><p>No account, order or money movement occurred.</p></div></section><section class='service-card'><h3>Continue the service conversation</h3><p>Discuss the next service checkpoint, product maturity or redemption timing, and when client facts may need review.</p><button class='secondary-button' id='service-event'>Add service note to timeline</button></section>",esc(state.transaction.reference),esc(state.transaction.productName),money(state.transaction.amount)):"";
  const action=state.transaction?"<button class='primary-button' id='finish-scenario'>Finish and recap →</button>":fmt("<button class='primary-button' id='simulate-order' ~0~>Record simulated order →</button>",check.orderReady&&state.reviewConfirmed?"":"disabled");
  return fmt("<div class='screen-heading'><div><span class='eyebrow'>5 · Review / service</span><h2>Review with the client</h2><p>Explain terms in plain language, confirm understanding, then create a fictional confirmation.</p></div><button class='link-button' data-explain>Review rule sources</button></div>~0~~1~~2~<div class='screen-actions'><button class='secondary-button' data-back>← Back to product fit</button>~3~</div>",
    card,confirmation,explainer("Sources used in this review","Each source is labeled by type. Public sources inform the learning context; fictional bank rules and product terms are simulation data.",check.sourceIds),action);
}
function wireCommon() { root.querySelectorAll("[data-back]").forEach((b)=>b.addEventListener("click",()=>go(Math.max(1,state.step-1)))); }
function wireAccount() {
  root.querySelectorAll("[data-fact]").forEach((c)=>c.addEventListener("change",()=>{
    const k=c.dataset.fact; changeFact(k,c.type==="checkbox"?c.checked:c.type==="number"?Number(c.value):c.value);
    addEvent("advisor","Updated "+k.replace(/[A-Z]/g,(m)=>" "+m.toLowerCase())+".");render();
  }));
  root.querySelector("#account-type").addEventListener("change",(e)=>{e.target.selectedIndex=0;});
  root.querySelector("#funding-method").addEventListener("change",(e)=>{
    state.fundingMethod=e.target.value;addEvent("advisor","Selected funding method: "+state.fundingMethod+".");
    if(state.facts.reportedContributionRoom==="Unknown" && ["Internal cash contribution","External cash contribution"].includes(state.fundingMethod))addEvent("client",activeScenario().prompts.funding);
    render();
  });
  root.querySelector("#to-identity").addEventListener("click",()=>{
    if(result().registrationStatus!=="eligible"){addEvent("rule","TFSA registration facts are incomplete or need follow-up.");render();return;}
    addEvent("rule","TFSA registration scenario checks passed. Contribution room remains separate.");go(2);
  });
}
function wireIdentity() {
  root.querySelectorAll("[data-fact]").forEach((c)=>c.addEventListener("change",()=>{
    changeFact(c.dataset.fact,c.value);
    if(["pepStatus","hioStatus","thirdParty"].includes(c.dataset.fact))state.enhancedReviewCompleted=false;
    addEvent("advisor","Recorded "+c.dataset.fact+" for the fictional client.");render();
  }));
  root.querySelector("#identity-method").addEventListener("change",(e)=>{state.identityMethod=e.target.value;state.identityResult="";addEvent("advisor","Selected identity method.");render();});
  root.querySelector("#identity-result").addEventListener("change",(e)=>{state.identityResult=e.target.value;addEvent("rule",e.target.value==="Passed"?"Fictional identity method marked passed.":"Identity follow-up required.");render();});
  root.querySelector("#enhanced-review")?.addEventListener("change",(e)=>{state.enhancedReviewCompleted=e.target.checked;addEvent("advisor","Updated simulated follow-up status.");render();});
  root.querySelector("#to-needs").addEventListener("click",()=>{
    if(result().identityStatus!=="complete"){addEvent("rule","Complete simulated identity and any triggered follow-up before continuing.");render();return;}
    addEvent("client",activeScenario().prompts.needs);go(3);
  });
}
function wireNeeds() {
  root.querySelectorAll("[data-fact]").forEach((c)=>c.addEventListener("change",()=>{
    const k=c.dataset.fact;changeFact(k,c.type==="number"?Number(c.value):c.value);
    addEvent("advisor","Updated client KYC fact: "+k+".");render();
  }));
  root.querySelector("#kyc-confirm").addEventListener("change",(e)=>{state.mutualFundKycConfirmed=e.target.checked;addEvent("client",e.target.checked?"Client confirmed the fictional KYC summary.":"Client confirmation removed.");render();});
  root.querySelector("#mf-understanding")?.addEventListener("change",(e)=>{state.mutualFundUnderstandingConfirmed=e.target.checked;addEvent("client",e.target.checked?"Client completed the fictional mutual-fund risk teach-back.":"Mutual-fund risk teach-back removed.");render();});
  root.querySelector("#to-products").addEventListener("click",()=>{if(!result().needsPresent){addEvent("rule","Complete the required client needs and financial profile before reviewing products.");render();return;}addEvent("rule","Client facts saved for product comparison.");go(4);});
}
function wireProducts() {
  root.querySelectorAll("[data-product]").forEach((b)=>b.addEventListener("click",()=>{
    state.selectedProductId=b.dataset.product;state.transaction=null;
    const p=products.find((x)=>x.id===b.dataset.product),r=result();
    addEvent("advisor","Selected "+p.name+".");addEvent("rule",r.reasons[0]||"Configured scenario checks allow this selection.");render();
  }));
  root.querySelector("#edit-needs").addEventListener("click",()=>go(3));
  root.querySelector("#to-review").addEventListener("click",()=>{if(!result().orderReady)return;state.step=5;state.reviewConfirmed=false;addEvent("advisor","Prepared product for client review.");render();});
}
function wireReview() {
  root.querySelector("#review-confirm")?.addEventListener("change",(e)=>{state.reviewConfirmed=e.target.checked;addEvent("advisor",e.target.checked?"Confirmed fictional client review.":"Removed review confirmation.");render();});
  root.querySelector("#simulate-order")?.addEventListener("click",()=>{
    if(!result().orderReady||!state.reviewConfirmed)return;
    const p=result().selected;state.transaction={reference:"PRACTICE-"+Math.random().toString(36).slice(2,8).toUpperCase(),productName:p.name,amount:Number(state.facts.investmentAmount)};
    addEvent("transaction","Recorded simulated purchase "+state.transaction.reference+". No real transaction occurred.");render();
  });
  root.querySelector("#service-event")?.addEventListener("click",()=>{addEvent("service","Discussed a service checkpoint and fictional product terms.");render();});
  root.querySelector("#finish-scenario")?.addEventListener("click",()=>{state.finished=true;addEvent("recap","Scenario recap: review client facts, choices, rule outcomes and sources.");render();});
  root.querySelector("#restart-variation")?.addEventListener("click",()=>start(state.scenarioId));
  root.querySelector("#restart-new")?.addEventListener("click",()=>{state=null;render();});
}
restartButton.addEventListener("click",()=>{state=null;explanationOpen=false;render();});
render();

