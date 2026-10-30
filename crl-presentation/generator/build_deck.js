// Calira – CRL post-bid presentation. Formatting copied from "Integration Pricing.pptx"
// (lime E4F038 title/closing slides with logo + dotted photo; white content slides with a
// small lime section pill, bold ink title, black-header tables, faint footer rule).
const pptxgen = require("pptxgenjs");
const path = require("path");
const A = (f) => path.join(__dirname, "assets", f);

const LIME = "E4F038", INK = "0B190D", GREY = "DDD4CD", LIGHT = "F4F5F7", MID = "535A6E",
  GREEN = "D9EAD3", WHITE = "FFFFFF", BLUE = "2A59DB";
const FONT = "Arial";

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in — same as the reference deck (720x405pt)
pres.author = "Calira";
pres.company = "Clustermarket Ltd DBA Calira";
pres.title = "Calira – Proposal summary for Charles River Laboratories";

let slideNo = 0;

// ---------- helpers ----------
function tag(s, text) {
  s.addShape(pres.ShapeType.roundRect, { x: 0.4, y: 0.3, w: 1.25, h: 0.24, fill: { color: LIME }, line: { color: LIME, width: 0 }, rectRadius: 0.12 });
  s.addText(text, { x: 0.4, y: 0.3, w: 1.25, h: 0.24, fontFace: FONT, fontSize: 7, bold: true, color: INK, align: "center", valign: "middle", margin: 0, isTextBox: true, charSpacing: 1 });
}
function title(s, text, sub) {
  s.addText(text, { x: 0.4, y: 0.58, w: 9.2, h: 0.5, fontFace: FONT, fontSize: 22, bold: true, color: INK, margin: 0, valign: "middle", isTextBox: true, fit: "shrink" });
  if (sub) s.addText(sub, { x: 0.4, y: 1.08, w: 9.2, h: 0.3, fontFace: FONT, fontSize: 11, color: MID, margin: 0, valign: "top", isTextBox: true });
}
function footer(s) {
  slideNo += 1;
  s.addShape(pres.ShapeType.line, { x: 0.4, y: 5.33, w: 9.2, h: 0, line: { color: GREY, width: 0.75 } });
  s.addText("Proposal summary for Charles River Laboratories", { x: 0.4, y: 5.36, w: 6, h: 0.2, fontFace: FONT, fontSize: 7, color: MID, margin: 0, isTextBox: true });
  s.addText(String(slideNo), { x: 9.0, y: 5.36, w: 0.6, h: 0.2, fontFace: FONT, fontSize: 7, color: MID, align: "right", margin: 0, isTextBox: true });
}
function content(tagText, titleText, sub) {
  const s = pres.addSlide();
  s.background = { color: WHITE };
  tag(s, tagText);
  title(s, titleText, sub);
  footer(s);
  return s;
}
function bullets(s, items, o) {
  const arr = items.map((t, i) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: i < items.length - 1 } }));
  s.addText(arr, Object.assign({ fontFace: FONT, fontSize: 11, color: INK, margin: 0, valign: "top", paraSpaceAfter: 5, isTextBox: true }, o));
}
function card(s, x, y, w, h, fill) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: fill || LIGHT }, line: { color: fill || LIGHT, width: 0 }, rectRadius: 0.08 });
}
function cardText(s, x, y, w, h, head, body, o) {
  o = o || {};
  card(s, x, y, w, h, o.fill);
  const pad = 0.15;
  let top = y + pad;
  if (o.icon) { s.addImage({ path: A(o.icon), x: x + pad, y: top, w: 0.36, h: 0.36 }); top += 0.42; }
  s.addText(head, { x: x + pad, y: top, w: w - 2 * pad, h: 0.3, fontFace: FONT, fontSize: o.headSize || 12, bold: true, color: INK, margin: 0, valign: "top", isTextBox: true });
  if (Array.isArray(body)) bullets(s, body, { x: x + pad, y: top + 0.32, w: w - 2 * pad, h: h - (top - y) - 0.4, fontSize: o.bodySize || 9.5, paraSpaceAfter: 3 });
  else s.addText(body, { x: x + pad, y: top + 0.32, w: w - 2 * pad, h: h - (top - y) - 0.4, fontFace: FONT, fontSize: o.bodySize || 9.5, color: INK, margin: 0, valign: "top", isTextBox: true });
}
function stat(s, x, y, w, h, num, label) {
  card(s, x, y, w, h);
  s.addText(num, { x, y: y + 0.12, w, h: 0.5, fontFace: FONT, fontSize: 16, bold: true, color: INK, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addText(label, { x, y: y + 0.6, w, h: 0.3, fontFace: FONT, fontSize: 9, color: MID, align: "center", margin: 0, isTextBox: true });
}
const TH = { fill: { color: INK }, color: WHITE, bold: true, fontFace: FONT, fontSize: 9, valign: "middle" };
function cellsRow(cells, o) { return cells.map((c) => ({ text: c, options: Object.assign({ fontFace: FONT, fontSize: 9, color: INK, valign: "middle" }, o || {}) })); }
function limeSlide(titleText, opts) {
  const s = pres.addSlide();
  s.background = { color: LIME };
  s.addImage({ path: A("logo.png"), x: 0.32, y: 0.3, w: 2.45, h: 0.87 });
  // photo with the reference deck's dot overlay
  s.addImage({ path: A(opts.photo), x: 5.0, y: 0.32, w: 4.68, h: 4.98, sizing: { type: "cover", w: 4.68, h: 4.98 } });
  s.addImage({ path: A("dots_yellow.png"), x: 5.0, y: 0.32, w: 4.68, h: 4.98, transparency: 15 });
  s.addText(titleText, { x: 0.32, y: opts.titleY || 1.6, w: 4.5, h: 1.6, fontFace: FONT, fontSize: opts.titleSize || 28, bold: true, color: INK, margin: 0, valign: "top", isTextBox: true });
  if (opts.sub) s.addText(opts.sub, { x: 0.32, y: (opts.titleY || 1.6) + 1.55, w: 4.5, h: 0.5, fontFace: FONT, fontSize: 11, bold: true, color: INK, margin: 0, isTextBox: true });
  if (opts.person) s.addText(opts.person, { x: 0.32, y: 4.35, w: 4.5, h: 0.7, fontFace: FONT, fontSize: 10, color: INK, margin: 0, valign: "top", isTextBox: true });
  s.addText("© 2026 calira.co All rights reserved", { x: 0.32, y: 5.28, w: 4, h: 0.2, fontFace: FONT, fontSize: 6, color: INK, margin: 0, isTextBox: true });
  return s;
}

// =====================================================================
// 1. TITLE
// =====================================================================
{
  const s = limeSlide("Enterprise equipment scheduling for Charles River Laboratories", {
    photo: "photo_person.png", titleSize: 26, titleY: 1.55,
    sub: "Proposal summary  ·  2026",
    person: [{ text: "Craig Davison", options: { bold: true, breakLine: true } }, { text: "Senior Account Executive, Calira", options: { breakLine: true } }, { text: "craig@calira.co", options: {} }],
  });
  s.addNotes("Timing: 0:00–0:30. Thank the panel; confirm attendees have read the written proposal; we will not walk through it line by line. Purpose today: the things that matter most and where Calira is different. Introduce anyone else on the call (Chris Mills, Head of Product / project manager; Morsal Amini, implementation lead).");
}

// =====================================================================
// 2. AGENDA
// =====================================================================
{
  const s = content("AGENDA", "What we will cover in the next 25 minutes", "Structured around the six areas you asked us to focus on");
  const rows = [
    ["1", "Calira in brief", "Who we are, scale, and our existing work inside CRL", "3 min"],
    ["2", "Your objectives and challenges", "What we heard, and how we read your requirements", "4 min"],
    ["3", "Proposed solution", "Key capabilities, scalability, and – candidly – the constraints", "6 min"],
    ["4", "Differentiators and value drivers", "Why Calira, and where the value comes from", "4 min"],
    ["5", "Implementation approach", "Lead site in 8 weeks, then rollout waves; team and KPIs", "4 min"],
    ["6", "Commercial, licensing and cost structure", "Licence model, services, terms and exceptions", "3 min"],
  ];
  rows.forEach((r, i) => {
    const y = 1.5 + i * 0.6;
    s.addShape(pres.ShapeType.ellipse, { x: 0.45, y: y + 0.08, w: 0.38, h: 0.38, fill: { color: LIME }, line: { color: LIME, width: 0 } });
    s.addText(r[0], { x: 0.45, y: y + 0.08, w: 0.38, h: 0.38, fontFace: FONT, fontSize: 11, bold: true, color: INK, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(r[1], { x: 1.0, y, w: 3.4, h: 0.28, fontFace: FONT, fontSize: 12, bold: true, color: INK, margin: 0, valign: "middle", isTextBox: true });
    s.addText(r[2], { x: 1.0, y: y + 0.27, w: 4.6, h: 0.25, fontFace: FONT, fontSize: 9, color: MID, margin: 0, valign: "top", isTextBox: true });
    s.addText(r[3], { x: 4.6, y, w: 0.9, h: 0.28, fontFace: FONT, fontSize: 9, color: MID, margin: 0, align: "right", valign: "middle", isTextBox: true });
  });
  s.addImage({ path: A("photo_lab.jpg"), x: 6.1, y: 1.45, w: 3.5, h: 3.6, sizing: { type: "cover", w: 3.5, h: 3.6 } });
  s.addImage({ path: A("dots_black.png"), x: 6.1, y: 1.45, w: 3.5, h: 3.6, transparency: 40 });
  s.addNotes("Timing: 0:30–1:00. Six sections mirror the panel's brief. ~24 minutes of content leaves time for questions; invite interruptions.");
}

// =====================================================================
// 3. ABOUT CALIRA
// =====================================================================
{
  const s = content("ABOUT CALIRA", "Built for R&D at scale – and already live inside CRL", "The world's leading R&D equipment scheduling platform · founded 2019 · rebranded from Clustermarket in 2025 · London, Sofia, Boston");
  const stats = [["11M+", "bookings"], ["84,000+", "active users"], ["66,000+", "instruments"], ["1,800+", "laboratories"], ["50+", "countries"]];
  stats.forEach((st, i) => stat(s, 0.4 + i * 1.12, 1.55, 1.02, 1.0, st[0], st[1]));
  // customer logos
  s.addText("Trusted by leading life-science organisations", { x: 0.4, y: 2.75, w: 5.2, h: 0.25, fontFace: FONT, fontSize: 10, bold: true, color: INK, margin: 0, isTextBox: true });
  const logos = ["logo_moderna.png", "logo_lilly.png", "logo_novo.png", "logo_takeda.png", "logo_bayer.png", "logo_lonza.png", "logo_cytiva.png", "logo_novonesis.png"];
  logos.forEach((l, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 0.4 + col * 1.35, y = 3.08 + row * 0.95;
    s.addShape(pres.ShapeType.roundRect, { x, y, w: 1.25, h: 0.85, fill: { color: WHITE }, line: { color: GREY, width: 0.75 }, rectRadius: 0.06 });
    s.addImage({ path: A(l), x: x + 0.12, y: y + 0.12, w: 1.01, h: 0.61, sizing: { type: "contain", w: 1.01, h: 0.61 } });
  });
  // CRL callout
  s.addShape(pres.ShapeType.roundRect, { x: 6.0, y: 1.55, w: 3.6, h: 3.5, fill: { color: LIME }, line: { color: LIME, width: 0 }, rectRadius: 0.08 });
  s.addText("Already a CRL partner", { x: 6.2, y: 1.7, w: 3.2, h: 0.35, fontFace: FONT, fontSize: 14, bold: true, color: INK, margin: 0, isTextBox: true });
  bullets(s, [
    "Live today in CRL's Chemistry department, Edinburgh, under an existing contract",
    "Day-to-day equipment scheduling plus insight into asset utilisation, revenue per asset and analysis success rates",
    "16 enterprise implementations of 500+ users as primary implementer; multi-site rollouts at Novo Nordisk, Moderna and Eli Lilly",
    "Year-on-year growth of 81% (2024–25) and 34% (2025–26); 17 staff, 9 in product and engineering",
  ], { x: 6.2, y: 2.1, w: 3.25, h: 2.9, fontSize: 10, paraSpaceAfter: 6 });
  s.addNotes("Timing: 1:00–4:00. Lead with scale (11M bookings, 84k users) then land the key point: we are not a new vendor to CRL – Edinburgh Chemistry runs on Calira today and that reference is available. Mention the team: Customer Success in London, engineering in Sofia, sales in Boston; Digital Craftsmen hold ISO 27001 and CE+ and give 24/7 infrastructure cover. Growth figures show a healthy, growing company without disclosing revenue.");
}

// =====================================================================
// 4. YOUR OBJECTIVES
// =====================================================================
{
  const s = content("YOUR OBJECTIVES", "What we heard: one enterprise scheduling method, with evidence you can act on");
  // left: objective
  card(s, 0.4, 1.35, 4.3, 3.8, INK);
  s.addText("Your strategic objective", { x: 0.6, y: 1.5, w: 3.9, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: LIME, margin: 0, isTextBox: true });
  s.addText("A unified, enterprise-scale platform that accelerates study delivery, optimises resource allocation and enables data-driven decisions – replacing a patchwork of local applications and shared spreadsheets with a single source of truth for planning, scheduling and execution.", { x: 0.6, y: 1.85, w: 3.9, h: 1.5, fontFace: FONT, fontSize: 10.5, color: WHITE, margin: 0, valign: "top", isTextBox: true });
  s.addText("Your requirements span eight areas", { x: 0.6, y: 3.35, w: 3.9, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: LIME, margin: 0, isTextBox: true });
  s.addText("Core scheduling · User experience · Governance · Integration · Global planning · Functional scheduling · Tasking · Execute & adjust", { x: 0.6, y: 3.65, w: 3.9, h: 1.3, fontFace: FONT, fontSize: 10, color: WHITE, margin: 0, valign: "top", isTextBox: true });
  // right: challenges
  s.addText("The scheduling challenges behind it", { x: 5.0, y: 1.35, w: 4.6, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: INK, margin: 0, isTextBox: true });
  const ch = [
    ["Local and inconsistent", "Scheduling is run site by site, in different tools and spreadsheets, with no common method."],
    ["Capacity you cannot see", "Instrument capacity is invisible at enterprise level, so it cannot be planned or shared across sites."],
    ["Time lost to coordination", "Scientists and lab managers spend effort negotiating access manually; conflicts delay studies."],
    ["Capital decisions without evidence", "Purchase, relocation and retirement decisions are taken without reliable utilisation data."],
  ];
  ch.forEach((c, i) => {
    const y = 1.75 + i * 0.85;
    s.addShape(pres.ShapeType.ellipse, { x: 5.0, y: y + 0.05, w: 0.34, h: 0.34, fill: { color: LIME }, line: { color: LIME, width: 0 } });
    s.addText(String(i + 1), { x: 5.0, y: y + 0.05, w: 0.34, h: 0.34, fontFace: FONT, fontSize: 10, bold: true, color: INK, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(c[0], { x: 5.5, y, w: 4.1, h: 0.28, fontFace: FONT, fontSize: 11, bold: true, color: INK, margin: 0, valign: "middle", isTextBox: true });
    s.addText(c[1], { x: 5.5, y: y + 0.28, w: 4.1, h: 0.5, fontFace: FONT, fontSize: 9.5, color: MID, margin: 0, valign: "top", isTextBox: true });
  });
  s.addNotes("Timing: 4:00–6:00. Play back CRL's objective in their words (from the RFP and our SOW background). The four challenges are the costs the SOW is designed to remove. Then set up the next slide: your requirement set is broad – from study-level scheduling to daily tasking – and we want to be precise about where Calira fits.");
}

// =====================================================================
// 5. WHERE CALIRA FITS (constraints)
// =====================================================================
{
  const s = content("SOLUTION", "Provantis runs the study; Calira runs the resources", "Our honest position on scope – stated openly in the C1 questionnaire and reflected in the SOW");
  // layered diagram (left)
  const lx = 0.4, lw = 4.6;
  s.addShape(pres.ShapeType.roundRect, { x: lx, y: 1.45, w: lw, h: 1.1, fill: { color: LIGHT }, line: { color: GREY, width: 0.75 }, rectRadius: 0.08 });
  s.addText("Study layer  –  Provantis, RPM, Apollo (CRL systems)", { x: lx + 0.15, y: 1.5, w: lw - 0.3, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: INK, margin: 0, isTextBox: true });
  s.addText("Study award to finalisation · milestones, endpoints and deliverables · protocols and study types · staffing and animal resources · portfolio and programme planning", { x: lx + 0.15, y: 1.8, w: lw - 0.3, h: 0.7, fontFace: FONT, fontSize: 9.5, color: MID, margin: 0, valign: "top", isTextBox: true });
  s.addShape(pres.ShapeType.roundRect, { x: lx + 1.3, y: 2.6, w: 2.0, h: 0.42, fill: { color: WHITE }, line: { color: INK, width: 1 }, rectRadius: 0.21 });
  s.addText("REST API  ·  discovery-gated integration", { x: lx + 1.3, y: 2.6, w: 2.0, h: 0.42, fontFace: FONT, fontSize: 8, bold: true, color: INK, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addShape(pres.ShapeType.roundRect, { x: lx, y: 3.07, w: lw, h: 2.0, fill: { color: LIME }, line: { color: LIME, width: 0 }, rectRadius: 0.08 });
  s.addText("Resource layer  –  Calira", { x: lx + 0.15, y: 3.13, w: lw - 0.3, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: INK, margin: 0, isTextBox: true });
  bullets(s, [
    "Equipment, rooms and specialised resources scheduled to the minute, across sites and time zones (UTC-stored)",
    "Booking rules, approvals, access groups and training-based access; recurring, group and multi-step workflow bookings",
    "Actual usage captured at the instrument (LabTrack) and at the point of use (Custom Forms)",
    "Utilisation, capacity and adoption data for every lab, department and site – exportable and API-accessible",
  ], { x: lx + 0.15, y: 3.45, w: lw - 0.3, h: 1.6, fontSize: 9.5, paraSpaceAfter: 3 });
  // right: what we don't do
  s.addText("What Calira does not do today", { x: 5.4, y: 1.45, w: 4.2, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: INK, margin: 0, isTextBox: true });
  bullets(s, [
    "Model studies or milestones, or generate schedules from them",
    "Schedule people or animals, or integrate HR, leave and skills data",
    "Automatically re-plan, cascade dependencies or optimise by weighting factors",
    "Gantt or study-calendar views; scheduled exports (CSV and API exports are supported)",
    "A complete 21 CFR Part 11 audit trail across all scheduling actions (on our roadmap) or GxP validation deliverables",
  ], { x: 5.4, y: 1.8, w: 4.2, h: 2.2, fontSize: 10, paraSpaceAfter: 5 });
  card(s, 5.4, 4.05, 4.2, 1.0, LIGHT);
  s.addText([{ text: "Why this is the right split. ", options: { bold: true } }, { text: "It keeps the study system of record where it already is, avoids duplicating Provantis, lowers total cost of ownership and lets CRL adopt the resource layer in weeks rather than years.", options: {} }], { x: 5.55, y: 4.12, w: 3.9, h: 0.88, fontFace: FONT, fontSize: 9.5, color: INK, margin: 0, valign: "top", isTextBox: true });
  s.addNotes("Timing: 6:00–8:00. This is the most important slide. Be direct: Calira is not a study-management or workforce-scheduling system and we did not pretend otherwise in the questionnaire. Calira is the resource layer – equipment, rooms, workflows, actual usage, utilisation truth – and it connects to the study layer through a REST API. The value of the split: no duplication of Provantis, faster adoption, lower TCO. Mention the audit-trail roadmap briefly if asked; do not over-promise dates.");
}

// =====================================================================
// 6. REQUIREMENT FIT CHART
// =====================================================================
{
  const s = content("SOLUTION", "Requirement fit: strongest where scheduling meets the bench", "Tally of our 73 responses in Exhibit C1 (Solution Requirements Questionnaire)");
  const labels = ["Core scheduling (study lifecycle)", "Global planning", "Integration", "Functional scheduling", "User experience", "Governance", "Execute & adjust", "Tasking (daily execution)"];
  const fully = [1, 0, 2, 2, 3, 3, 3, 5];
  const part = [7, 5, 3, 8, 5, 1, 1, 2];
  const not = [7, 6, 2, 3, 1, 1, 1, 1];
  s.addChart(pres.ChartType.bar, [
    { name: "Fully meets", labels, values: fully },
    { name: "Partially meets", labels, values: part },
    { name: "Does not meet", labels, values: not },
  ], {
    x: 0.4, y: 1.4, w: 5.9, h: 3.8, barDir: "bar", barGrouping: "stacked", barGapWidthPct: 45,
    chartColors: [INK, LIME, GREY], showValue: true, dataLabelPosition: "ctr", dataLabelFontSize: 8, dataLabelColor: MID, dataLabelFontFace: FONT,
    catAxisLabelFontSize: 9, catAxisLabelFontFace: FONT, catAxisLabelColor: INK, catAxisOrientation: "maxMin", catGridLine: { style: "none" },
    valAxisLabelFontSize: 8, valAxisLabelColor: MID, valGridLine: { color: "EEEEEE", size: 0.5 }, valAxisMaxVal: 16, valAxisMajorUnit: 4,
    showLegend: true, legendPos: "b", legendFontSize: 9, legendFontFace: FONT, legendColor: INK, showTitle: false,
  });
  // commentary
  cardText(s, 6.55, 1.4, 3.05, 1.2, "Strong fit", "Functional scheduling, tasking, execute & adjust, governance and user experience: the day-to-day of booking, using and reporting on shared resources.", { fill: LIGHT, bodySize: 9 });
  cardText(s, 6.55, 2.7, 3.05, 1.2, "Partial fit", "Global planning: multi-site utilisation and capacity views are native; study, portfolio and scenario modelling are not.", { fill: LIGHT, bodySize: 9 });
  cardText(s, 6.55, 4.0, 3.05, 1.2, "By design, not a gap", "Study-lifecycle scheduling stays in Provantis. Calira supplies the resource availability and actuals it needs.", { fill: LIME, bodySize: 9 });
  s.addNotes("Timing: 8:00–9:30. Overall 19 fully / 32 partially / 22 not met. Read the chart top to bottom: the 'does not meet' weight sits almost entirely in the study-lifecycle and global-planning areas, which is exactly the layer we propose stays in Provantis. Where the requirement is about booking, using, governing and reporting on shared resources, fit is strong. Offer a walk-through of any specific requirement in Q&A.");
}

// =====================================================================
// 7. KEY CAPABILITIES
// =====================================================================
{
  const s = content("SOLUTION", "What CRL gets on day one", "Configured, not custom-built – every capability below is standard product");
  const tiles = [
    ["Book and schedule", ["Drag-and-drop calendar, 15-minute slots", "Rules, quotas, cut-offs and approvals", "Recurring, group and workflow bookings"], "icon_tap.png"],
    ["Equipment estate", ["Bulk registration, metadata, documents, SOPs", "Rooms, parent/child equipment, locations", "Maintenance, service contracts and alerts"], "shot_equipment.png"],
    ["Access and governance", ["SAML 2.0 SSO, MFA, joiner/mover/leaver", "Seven roles plus access groups", "Training-based access; per-lab time zones"], "icon_sso.png"],
    ["Capture at the point of use", ["Custom Forms: results, sample IDs, files", "LabTrack: actual usage and instrument locking", "Live instrument status via the OEM Gateway"], "icon_qr.png"],
    ["Report and extract", ["Reports module, saved filters, CSV export", "Read/write REST API (OAuth2)", "Metabase dashboards at no extra cost; optional AI assistant"], "icon_api.png"],
    ["Connect", ["Outlook / Exchange calendar sync", "Benchling, eLabNext, RSpace; Essentim sensors", "Provantis, Maximo, Sapio via discovery-gated adapters"], "shot_integrations.png"],
  ];
  tiles.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.4 + col * 3.1, y = 1.45 + row * 1.92;
    cardText(s, x, y, 2.95, 1.8, t[0], t[1], { icon: t[2], bodySize: 9, headSize: 11.5 });
  });
  s.addNotes("Timing: 9:30–11:00. Do not read the tiles. Pick two stories: (1) a scientist books a confocal from Outlook or a QR code on the instrument, LabTrack records the real session, the Custom Form captures the result – all with no extra system to log into; (2) a lab manager sees utilisation across every site and exports it or queries it via API. Everything shown is standard product; the deployment is configuration, which is why implementation is fast and unpriced.");
}

// =====================================================================
// 8. SCALABILITY, RESILIENCE, SECURITY
// =====================================================================
{
  const s = content("SOLUTION", "Built to run enterprise-wide: scale, resilience and security");
  cardText(s, 0.4, 1.35, 2.95, 3.1, "Scale", [
    "Multi-tenant SaaS on AWS (Dublin), containerised on Kubernetes",
    "Horizontal and vertical auto-scaling – no licence impact when scaling",
    "1,800+ labs in 50+ countries; per-lab time zones with UTC storage",
    "Named-user licensing with unlimited instruments and sites",
    "Responsive web app on desktop, tablet and mobile; no client install (LabTrack optional, Windows)",
  ], { fill: LIGHT, headSize: 13, bodySize: 9.5 });
  cardText(s, 3.525, 1.35, 2.95, 3.1, "Resilience", [
    "Components across multiple availability zones; RDS with standby and automated failover",
    "Continuous point-in-time recovery (96 h), daily and weekly backups, encrypted and off-site",
    "Availability target 99.8% per month; SLA with service credits; status.calira.co",
    "24/7 monitoring (Grafana, Prometheus, Sentry, Coralogix, UptimeRobot); P1 response 30 min",
    "Zero-downtime CI/CD releases; DR restore within 24 h",
  ], { fill: LIGHT, headSize: 13, bodySize: 9.5 });
  cardText(s, 6.65, 1.35, 2.95, 3.1, "Security", [
    "Cloudflare WAF, DDoS protection and rate limiting at the edge; database reachable only inside the private network",
    "TLS 1.2+ in transit, AES-256 at rest; secrets in KMS",
    "SSO (SAML 2.0), MFA, least-privilege RBAC, quarterly access reviews",
    "Hosting partner ISO 27001 and Cyber Essentials Plus; annual penetration test",
    "GDPR-compliant, EEA-hosted; AI features can be disabled at account level",
  ], { fill: LIGHT, headSize: 13, bodySize: 9.5 });
  // proof-point strip
  const proofs = ["Hosting partner: ISO 27001 & Cyber Essentials Plus", "Annual penetration test · quarterly vulnerability scans", "GDPR · EEA-hosted · DPA with SCCs", "Public status page: status.calira.co"];
  proofs.forEach((p, i) => {
    const x = 0.4 + i * 2.325;
    s.addShape(pres.ShapeType.roundRect, { x, y: 4.62, w: 2.2, h: 0.5, fill: { color: LIME }, line: { color: LIME, width: 0 }, rectRadius: 0.25 });
    s.addText(p, { x: x + 0.1, y: 4.62, w: 2.0, h: 0.5, fontFace: FONT, fontSize: 8, bold: true, color: INK, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  s.addNotes("Timing: 11:00–12:00. Keep this brief; the architecture questionnaire covers it in depth. Three messages: it scales without licence penalties; it is resilient with an SLA and public status page; it is secured at the edge, in transit and at rest, with ISO 27001 hosting and CE+ – and the AI components are optional and switchable.");
}

// =====================================================================
// 9. INTEGRATIONS
// =====================================================================
{
  const s = content("SOLUTION", "Integrations: two standard, three discovery-gated", "You see each Discovery Report – and decide – before any integration build is priced");
  // hub (left) with spokes stacked to its right
  const cx = 1.15, cy = 3.35;
  const spokes = [
    ["Single Sign-On (IdP)", "Standard · configured in Phase 2", true],
    ["Outlook / Exchange", "Standard · configured in Phase 2", true],
    ["Sapio Sciences ELN", "Discovery in SOW · build by separate SOW", false],
    ["Provantis (Instem)", "Discovery in SOW · build by separate SOW", false],
    ["IBM Maximo", "Discovery in SOW · build by separate SOW", false],
  ];
  const bx = 2.45, bw = 2.7, bh = 0.62, gap = 0.12, by0 = 1.5;
  spokes.forEach((sp, i) => {
    const y = by0 + i * (bh + gap);
    const ex = cx + 0.7, ey = cy, tx = bx, ty = y + bh / 2;
    s.addShape(pres.ShapeType.line, { x: ex, y: Math.min(ey, ty), w: tx - ex, h: Math.abs(ty - ey), line: { color: GREY, width: 1 }, flipV: ty < ey });
  });
  s.addShape(pres.ShapeType.ellipse, { x: cx - 0.7, y: cy - 0.7, w: 1.4, h: 1.4, fill: { color: LIME }, line: { color: LIME, width: 0 } });
  s.addImage({ path: A("mark.png"), x: cx - 0.24, y: cy - 0.45, w: 0.48, h: 0.42 });
  s.addText("Calira", { x: cx - 0.7, y: cy + 0.05, w: 1.4, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: INK, align: "center", margin: 0, isTextBox: true });
  spokes.forEach((sp, i) => {
    const [name, note, live] = sp;
    const y = by0 + i * (bh + gap);
    s.addShape(pres.ShapeType.roundRect, { x: bx, y, w: bw, h: bh, fill: { color: live ? INK : WHITE }, line: { color: INK, width: 1 }, rectRadius: 0.08 });
    s.addText(name, { x: bx + 0.12, y: y + 0.05, w: bw - 0.24, h: 0.28, fontFace: FONT, fontSize: 10, bold: true, color: live ? WHITE : INK, margin: 0, valign: "middle", isTextBox: true });
    s.addText(note, { x: bx + 0.12, y: y + 0.32, w: bw - 0.24, h: 0.26, fontFace: FONT, fontSize: 7.5, color: live ? LIME : MID, margin: 0, valign: "top", isTextBox: true });
  });
  // right: why confident
  s.addText("Why we are confident on the three new systems", { x: 5.6, y: 1.4, w: 4.0, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: INK, margin: 0, isTextBox: true });
  bullets(s, [
    "One adapter framework for every integration: OAuth2/API-key auth, signed webhooks, background processing, central monitoring – a new vendor is a new adapter, not new infrastructure",
    "Provantis: our Head of Product spent 5+ years at Instem and knows the module architecture; Instem's new REST API and hosted SaaS delivery fit our pattern",
    "Maximo: enterprise-asset data mapping already scoped for Blue Mountain RAM; Maximo Manage REST API is mature and documented",
    "Sapio: live ELN integrations with Benchling and eLabNext follow the same REST-plus-webhook shape",
    "Each discovery ends in a report with data mapping, auth approach, dependencies and a build estimate – accepted by CRL before any build SOW",
  ], { x: 5.6, y: 1.75, w: 4.0, h: 3.5, fontSize: 9.5, paraSpaceAfter: 5 });
  s.addNotes("Timing: 12:00–13:30. Two integrations are standard and delivered in Phase 2 by configuration. For Provantis, Maximo and Sapio we said openly that we have no production integration yet; the SOW funds a technical discovery for all three, in parallel with the rollout, and CRL accepts each report before any build is priced. Emphasise the Instem experience for Provantis and the transferable EAM work for Maximo.");
}

// =====================================================================
// 10. DIFFERENTIATORS
// =====================================================================
{
  const s = content("DIFFERENTIATORS", "Why Calira for CRL", "Six things we would ask you to weigh against any alternative");
  const tiles = [
    ["Proven inside CRL", "Live in Edinburgh Chemistry under an existing contract – a reference you can call today, and a configuration baseline we can reuse.", "icon_tap.png"],
    ["Speed to value", "Lead site live in 8 weeks; each further site faster against the baseline. Standard implementation carries no services fee.", "icon_fast.png"],
    ["Adoption by design", "Researchers productive after 20–30 minutes of training; mobile and QR-code booking; contractual adoption KPIs.", "icon_qr.png"],
    ["Actuals, not assumptions", "LabTrack records real instrument sessions and locks equipment to bookings, so utilisation is measured, not guessed.", "shot_booking.png"],
    ["AI-native, optional", "Natural-language querying and anomaly detection over usage data – switchable off at account level if CRL prefers.", "icon_api.png"],
    ["A partner, not a ticket queue", "Named Solutions Manager through go-live, named Customer Success Manager after it, product leadership in the room.", "icon_sso.png"],
  ];
  tiles.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.4 + col * 3.1, y = 1.45 + row * 1.95;
    cardText(s, x, y, 2.95, 1.8, t[0], t[1], { icon: t[2], bodySize: 9.5, fill: i === 0 ? LIME : LIGHT });
  });
  s.addNotes("Timing: 13:30–15:30. The first tile is the one competitors cannot claim. Speed and adoption are backed by numbers in the SOW (KPIs). Actuals: LabTrack usage-logging and blocking modes. AI is a differentiator but reassure on control. Close on the partnership model – the people on this call are the people who deliver.");
}

// =====================================================================
// 11. VALUE DRIVERS
// =====================================================================
{
  const s = content("VALUE DRIVERS", "The value case: utilisation, time and capital");
  // big stat
  card(s, 0.4, 1.35, 3.0, 1.55, INK);
  s.addText("35%", { x: 0.4, y: 1.4, w: 3.0, h: 0.8, fontFace: FONT, fontSize: 40, bold: true, color: LIME, align: "center", margin: 0, isTextBox: true });
  s.addText("average utilisation of R&D lab equipment – mostly lost to short, unmanaged stoppages (McKinsey, 2021)", { x: 0.55, y: 2.2, w: 2.7, h: 0.65, fontFace: FONT, fontSize: 8.5, color: WHITE, align: "center", margin: 0, valign: "top", isTextBox: true });
  s.addImage({ path: A("chart_utilisation.png"), x: 0.4, y: 3.05, w: 3.0, h: 2.12, sizing: { type: "contain", w: 3.0, h: 2.12 } });
  // value rows
  const rows = [
    ["Fewer conflicts, less coordination", "One live calendar per resource with rules and approvals removes double-booking and the negotiation around it."],
    ["Higher utilisation, deferred capital", "Visibility plus measured actuals raise use of existing instruments before new ones are bought."],
    ["Enterprise capacity you can plan", "Utilisation and capacity rolled up across labs, departments and sites – shared, moved or retired on evidence."],
    ["A single source of truth", "Bookings, actual usage, maintenance and point-of-use records in one auditable place, exportable and API-accessible."],
    ["Lower total cost of ownership", "Configuration not customisation, no implementation fee, and best-of-breed integration rather than replacing Provantis."],
  ];
  rows.forEach((r, i) => {
    const y = 1.35 + i * 0.78;
    s.addShape(pres.ShapeType.rect, { x: 3.7, y: y + 0.08, w: 0.08, h: 0.55, fill: { color: LIME }, line: { color: LIME, width: 0 } });
    s.addText(r[0], { x: 3.95, y, w: 5.65, h: 0.28, fontFace: FONT, fontSize: 11, bold: true, color: INK, margin: 0, valign: "middle", isTextBox: true });
    s.addText(r[1], { x: 3.95, y: y + 0.28, w: 5.65, h: 0.45, fontFace: FONT, fontSize: 9.5, color: MID, margin: 0, valign: "top", isTextBox: true });
  });
  s.addNotes("Timing: 15:30–17:00. Anchor on the McKinsey 35% figure, then the observed utilisation improvement across four labs after deployment (chart from our standard deck). Translate into CRL's three costs from the SOW: coordination time, invisible capacity, capital decisions. Mention that the executive value report in Phase 4 quantifies this for CRL's own estate.");
}

// =====================================================================
// 12. IMPLEMENTATION APPROACH
// =====================================================================
{
  const s = content("IMPLEMENTATION", "Lead site live in 8 weeks, then rollout waves", "Three concurrent workstreams under our four-phase enterprise onboarding methodology");
  // week ruler: 8 weeks + a post-go-live column, all inside the 0.4–9.6 content width
  const x0 = 2.2, wk = 0.82, y0 = 1.42, post = x0 + 8 * wk; // post = 8.76
  for (let i = 0; i < 8; i++) {
    s.addText("Wk " + (i + 1), { x: x0 + i * wk, y: y0, w: wk, h: 0.2, fontFace: FONT, fontSize: 8, color: MID, align: "center", margin: 0, isTextBox: true });
  }
  s.addText("Post go-live", { x: post, y: y0, w: 9.6 - post, h: 0.2, fontFace: FONT, fontSize: 8, color: MID, align: "center", margin: 0, isTextBox: true });
  const bar = (label, row, xs, xe, fill, txtColor, sub) => {
    const y = 1.68 + row * 0.47, h = 0.38;
    s.addText(label, { x: 0.4, y, w: 1.75, h, fontFace: FONT, fontSize: 8.5, bold: true, color: INK, margin: 0, valign: "middle", isTextBox: true });
    s.addShape(pres.ShapeType.roundRect, { x: xs, y, w: xe - xs - 0.04, h, fill: { color: fill }, line: { color: fill, width: 0 }, rectRadius: 0.06 });
    s.addText(sub, { x: xs + 0.08, y, w: xe - xs - 0.2, h, fontFace: FONT, fontSize: 7.5, color: txtColor, margin: 0, valign: "middle", isTextBox: true });
  };
  const W = (n) => x0 + (n - 1) * wk; // left edge of week n
  bar("A · Phase 1 Kick-off", 0, W(1), W(3), INK, WHITE, "Goals, workflows, integrations, equipment data, go-live date");
  bar("A · Phase 2 Requirements & configuration", 1, W(3), W(5), INK, WHITE, "On-site workshop · admin training · equipment · SSO + Outlook");
  bar("A · Phase 3 Implementation & adoption", 2, W(5), W(9), INK, WHITE, "3 end-user workshops · UAT (10 days) · adoption dashboard · go-live readiness approval");
  bar("A · Phase 4 Hypercare & optimisation", 3, post, 9.6, LIME, INK, "CSM-led · value report · roadmaps");
  bar("B · Standard integrations", 4, W(3), W(5), GREY, INK, "SSO and Outlook / Exchange – configuration only");
  bar("C · Technical discovery ×3", 5, W(1), W(9), GREY, INK, "Provantis, Maximo and Sapio in parallel → three Discovery Reports for CRL acceptance");
  // rollout waves note
  card(s, 0.4, 4.58, 9.2, 0.68, LIGHT);
  s.addText([{ text: "Rollout waves. ", options: { bold: true } }, { text: "Each further site is onboarded against the Lead Site's configuration baseline, workflow library and training curriculum: Phase 1 reduced to site-specific confirmation, Phases 2–3 in full (on-site workshop per qualifying site), Phase 4 once at enterprise level. Sites are sequenced so each wave learns from the last.", options: {} }], { x: 0.55, y: 4.63, w: 8.9, h: 0.6, fontFace: FONT, fontSize: 9, color: INK, margin: 0, valign: "top", isTextBox: true });
  s.addNotes("Timing: 17:00–19:00. Walk the bars left to right. Lead site in 8 weeks is our standard, and the 8 weeks mostly reflects customer availability. Discovery runs in parallel so nothing waits on integrations. Effort from Calira per site is roughly 2–3 days (Phase 1), 9–10 (Phase 2), 12 (Phase 3), 4 (Phase 4). Rollout waves are how CRL's multi-site estate is covered without repeating full effort each time. Reference the Novo Nordisk three-site rollout: each site live within 8 weeks, scope unchanged across sites.");
}

// =====================================================================
// 13. TEAM AND KPIs
// =====================================================================
{
  const s = content("IMPLEMENTATION", "Your Calira team, and the adoption KPIs we sign up to");
  const team = [
    ["MA", "Morsal Amini", "Senior Solutions Manager · implementation lead, Phases 1–3 and all waves"],
    ["NB", "Nathan Beynon", "Customer Success Manager · Phase 4 hypercare, adoption and value reporting"],
    ["CM", "Chris Mills", "Head of Product · project manager; 25 years in R&D software, formerly Instem"],
    ["HT", "Hristo Tenev", "Integration Engineer · Provantis, Maximo and Sapio discovery and build"],
    ["CD", "Craig Davison", "Senior Account Executive · commercial lead and escalation"],
  ];
  team.forEach((t, i) => {
    const y = 1.4 + i * 0.66;
    s.addShape(pres.ShapeType.ellipse, { x: 0.4, y, w: 0.5, h: 0.5, fill: { color: INK }, line: { color: INK, width: 0 } });
    s.addText(t[0], { x: 0.4, y, w: 0.5, h: 0.5, fontFace: FONT, fontSize: 10, bold: true, color: LIME, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(t[1], { x: 1.05, y: y - 0.02, w: 3.3, h: 0.26, fontFace: FONT, fontSize: 10.5, bold: true, color: INK, margin: 0, valign: "middle", isTextBox: true });
    s.addText(t[2], { x: 1.05, y: y + 0.23, w: 3.4, h: 0.4, fontFace: FONT, fontSize: 8.5, color: MID, margin: 0, valign: "top", isTextBox: true });
  });
  s.addText("From CRL: project owner, IT (SSO, integrations), lab managers and admins, early-adopter users. All Calira staff are full-time employees; no implementation partner.", { x: 0.4, y: 4.7, w: 4.1, h: 0.55, fontFace: FONT, fontSize: 8.5, color: INK, margin: 0, valign: "top", isTextBox: true, italic: true });
  const rows = [
    [{ text: "KPI", options: TH }, { text: "Target", options: TH }, { text: "If missed", options: TH }],
    cellsRow(["Workshop attendance", "≥ 80% of invited SMEs per site", "Extra virtual workshop, no fee"]),
    cellsRow(["Administrator coverage", "100% attend a training session", "Extra admin session, no fee"]),
    cellsRow(["Training coverage", "100% of named users trained", "Go-live not sought until remedied"]),
    cellsRow(["User activation", "≥ 75% accept invitation within 10 days", "Adoption clinic + mitigation plan"]),
    cellsRow(["Booking adoption", "≥ 50% of activated users book within 30 days", "Support workshop + workflow review"]),
    cellsRow(["Sustained adoption", "≥ 50% of users active monthly, 3 months", "Further optimisation support"]),
    cellsRow(["Discovery quality", "Reports accepted without material rework", "Revised and resubmitted, no fee"]),
  ];
  s.addTable(rows, { x: 4.75, y: 1.4, w: 4.85, colW: [1.45, 1.9, 1.5], fontFace: FONT, fontSize: 8.5, border: { type: "solid", color: GREY, pt: 0.5 }, rowH: 0.42, margin: 0.05, autoPage: false });
  s.addText("Measured from the adoption dashboard and reported at each check-in; targets assume CRL releases users for training.", { x: 4.75, y: 4.85, w: 4.85, h: 0.4, fontFace: FONT, fontSize: 8, color: MID, margin: 0, valign: "top", isTextBox: true });
  s.addNotes("Timing: 19:00–20:30. Introduce the named team – the same people named in the SOW and RACI. The KPI table is contractual in the SOW; each miss has a stated remedy at no fee, which is unusual and worth pointing out. Close with what we need from CRL: a project owner with authority, IT for SSO, lab managers for workflows, and users released for training.");
}

// =====================================================================
// 14. COMMERCIALS
// =====================================================================
{
  const s = content("COMMERCIALS", "Named users, unlimited instruments, no implementation fees", "Headline figures from Exhibits D1A, D2a/b and the SOW – all list prices in USD");
  cardText(s, 0.4, 1.35, 2.95, 3.85, "Licence", [
    "Named-user annual subscription: $405 per user per year (list)",
    "Unlimited instruments, rooms, sites and bookings",
    "Volume tiers: 10% off from 501 users, 15% from 1,001, 20% from 1,501, 25% from 2,001 (applied per tier band)",
    "Multi-year: 10% off for 3 years, 15% for 5 years",
    "LabTrack real-time tracking optional: $140 per asset per year",
    "Site or enterprise licence available – open to discussion",
  ], { fill: LIGHT, headSize: 13, bodySize: 9.5 });
  cardText(s, 3.525, 1.35, 2.95, 3.85, "Services", [
    "Core implementation, training, SSO and Outlook: $0 (100% discount on standard implementation services)",
    "Technical discovery for Provantis, IBM Maximo and Sapio: $31,200 fixed (30 engineer days + project management)",
    "Integration builds priced by separate SOW after CRL accepts each Discovery Report",
    "Initial SOW capped at $40,000 not-to-exceed",
    "On-site workshops: no fee; travel and accommodation at cost, pre-approved",
    "Rate card locked for the term",
  ], { fill: LIGHT, headSize: 13, bodySize: 9.5 });
  cardText(s, 6.65, 1.35, 2.95, 3.85, "Terms", [
    "Pricing locked for 3 years; two further 1-year extensions on the same terms, increases capped to an agreed index",
    "Users added any time, pro-rata, co-terminating with the annual term; re-baseline up or down at each anniversary",
    "Payment 60 days from invoice (90 available if helpful)",
    "SLA: availability with service credits; 10% of monthly fees at risk; termination for persistent failure",
    "Global, non-exclusive term licence covering CRL and affiliates",
  ], { fill: LIME, headSize: 13, bodySize: 9.5 });
  s.addNotes("Timing: 20:30–22:00. Keep it simple: one licence line, no implementation fee, one fixed discovery fee, builds only after CRL sees the discovery reports. Tier discounts apply within bands (we said no to retroactive tier benefit for all users – be ready for the question). Multi-year and volume discounts stack. Site/enterprise licence is available but needs user and site numbers, which the RFP left open.");
}

// =====================================================================
// 15. COMMERCIAL PRINCIPLES
// =====================================================================
{
  const s = content("COMMERCIALS", "Commercial principles: 26 of 30 agreed, four flagged openly", "Exhibit C6 responses, which are contractually binding");
  const yes = [
    "3-year price lock, two 1-year extensions, index-capped increases",
    "Own resources for implementation and future services – no implementation partner",
    "User-based licensing; global, non-exclusive term licence for CRL and affiliates",
    "Ramp-up volumes, pro-rata additions, co-termination, annual re-baselining",
    "60-day payment terms; rates locked for the term",
    "99.5% uptime commitment, SLA credits, 10% of fees at risk, termination for persistent failure",
    "Proactive CX metrics, innovation tracking and demonstrable Agile delivery",
  ];
  const no = [
    ["GxP compliance", "Calira is not GxP-validated; validation deliverables (IQ/OQ/PQ, Part 11) are excluded from the SOW. CRL may validate the platform itself."],
    ["Retroactive tier pricing", "Tier discounts apply to users within each band, not to all users once a band is reached."],
    ["Credits for inactive users", "Annual named-user contracts; users can be removed at any date, but no monthly-activity credit."],
    ["Partial termination", "Termination rights are in whole, not by service line or geography."],
  ];
  s.addShape(pres.ShapeType.roundRect, { x: 0.4, y: 1.45, w: 4.5, h: 3.75, fill: { color: LIGHT }, line: { color: LIGHT, width: 0 }, rectRadius: 0.08 });
  s.addText("Agreed", { x: 0.55, y: 1.55, w: 4.2, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: INK, margin: 0, isTextBox: true });
  bullets(s, yes, { x: 0.55, y: 1.9, w: 4.2, h: 3.2, fontSize: 9.5, paraSpaceAfter: 5 });
  s.addShape(pres.ShapeType.roundRect, { x: 5.1, y: 1.45, w: 4.5, h: 3.75, fill: { color: WHITE }, line: { color: INK, width: 1 }, rectRadius: 0.08 });
  s.addText("Where we said no, or qualified our answer", { x: 5.25, y: 1.55, w: 4.2, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: INK, margin: 0, isTextBox: true });
  no.forEach((n, i) => {
    const y = 1.92 + i * 0.8;
    s.addText(n[0], { x: 5.25, y, w: 4.2, h: 0.25, fontFace: FONT, fontSize: 10, bold: true, color: INK, margin: 0, valign: "middle", isTextBox: true });
    s.addText(n[1], { x: 5.25, y: y + 0.25, w: 4.2, h: 0.55, fontFace: FONT, fontSize: 9, color: MID, margin: 0, valign: "top", isTextBox: true });
  });
  s.addNotes("Timing: 22:00–23:00. Panels respect suppliers who flag exceptions before contracting. GxP is the one to handle carefully: Calira holds booking and asset data, not study data, so validation risk is low; the SOW excludes validation deliverables but CRL can validate the platform if its QA function requires it. The other three are commercial mechanics and we are open to discussing them in negotiation.");
}

// =====================================================================
// 16. NEXT STEPS
// =====================================================================
{
  const s = content("NEXT STEPS", "From proposal to lead-site go-live");
  const steps = [
    ["1", "References and demo", "Reference calls with Novo Nordisk, Moderna, Eli Lilly and CRL Edinburgh; a hands-on demo against your workflows."],
    ["2", "Confirm scope", "Lead site, user and equipment counts, wave sequence and the integration priorities for discovery."],
    ["3", "Contract and kick-off", "MSA, SOW and DPA finalised; project owner nominated; go-live date set at the kick-off meeting."],
    ["4", "Week 8", "Lead site live and accepted; three Discovery Reports delivered; expansion plan agreed."],
  ];
  steps.forEach((st, i) => {
    const x = 0.4 + i * 2.32;
    s.addShape(pres.ShapeType.roundRect, { x, y: 1.5, w: 2.17, h: 2.7, fill: { color: i === 3 ? LIME : LIGHT }, line: { color: i === 3 ? LIME : LIGHT, width: 0 }, rectRadius: 0.08 });
    s.addText(st[0], { x: x + 0.15, y: 1.6, w: 1.9, h: 0.6, fontFace: FONT, fontSize: 30, bold: true, color: INK, margin: 0, isTextBox: true });
    s.addText(st[1], { x: x + 0.15, y: 2.2, w: 1.9, h: 0.3, fontFace: FONT, fontSize: 11.5, bold: true, color: INK, margin: 0, isTextBox: true });
    s.addText(st[2], { x: x + 0.15, y: 2.55, w: 1.9, h: 1.55, fontFace: FONT, fontSize: 9.5, color: INK, margin: 0, valign: "top", isTextBox: true });
    if (i < 3) s.addShape(pres.ShapeType.rightArrow, { x: x + 2.17 - 0.04, y: 2.7, w: 0.22, h: 0.3, fill: { color: INK }, line: { color: INK, width: 0 } });
  });
  s.addText("Questions", { x: 0.4, y: 4.45, w: 9.2, h: 0.5, fontFace: FONT, fontSize: 20, bold: true, color: INK, margin: 0, isTextBox: true });
  s.addText("We are happy to walk through any individual requirement response, the SOW, or the security and architecture questionnaires.", { x: 0.4, y: 4.9, w: 9.2, h: 0.35, fontFace: FONT, fontSize: 10, color: MID, margin: 0, isTextBox: true });
  s.addNotes("Timing: 23:00–24:00, then Q&A. Ask for the decision timeline and who the CRL project owner would be. Offer the CRL Edinburgh reference first – it is the fastest way for the panel to de-risk.");
}

// =====================================================================
// 17. THANK YOU
// =====================================================================
{
  const s = limeSlide("Thank you", { photo: "photo_lab.jpg", titleSize: 34, titleY: 1.9,
    person: [
      { text: "Craig Davison · Senior Account Executive", options: { bold: true, breakLine: true } },
      { text: "craig@calira.co  ·  +44 (0)75 4515 2687", options: { breakLine: true } },
      { text: "Chris Mills · Head of Product  ·  chris@calira.co", options: { breakLine: true } },
      { text: "Clustermarket Ltd DBA Calira · 34 Lime Street, London EC3M 7AT", options: { breakLine: true } },
      { text: "calira.co", options: {} },
    ] });
  s.addNotes("Leave contact details on screen during Q&A.");
}

pres.writeFile({ fileName: path.join(__dirname, "Calira - CRL Proposal Summary.pptx") }).then((f) => console.log("written", f));
