# CLAUDE.md — Calira Marketing

## Session continuity

At the start of every session, do the following before anything else:

1. Check `sessions/` for the most recent log file (files are named `YYYY-MM-DD.md`)
2. Read it
3. If the most recent log is from a **previous day** (i.e. a new day has started since the last log), say: "The last session on [date] was logged. Here's where things stood: [2–3 sentence summary of open items]." Then ask if Will wants to pick up where things left off or start something new.
4. If **no log exists at all**, say so briefly and continue.
5. If the log is from **today**, no need to mention it — just use it as context silently.

This runs automatically every session. Do not skip it.

## About Me
Solo B2B marketer (Head of Marketing) at Calira. I handle all marketing functions with limited budget and bandwidth. I use AI and automation heavily to stay productive. My goal is practical, usable output — not strategy decks that sit in a folder.

## About Calira
- **Product:** Equipment booking and management platform for shared R&D lab equipment. Replaces shared spreadsheets, Outlook calendars, and other makeshift systems.
- **Formerly:** Clustermarket (rebranded November 2025). Older assets and internal docs may still reference Clustermarket.
- **Website:** calira.co (not calira.com)
- **Stage:** ~$1.1M ARR, targeting $1.6–1.8M over the next 12 months. Pre-profitability, scaling.
- **Key framing:** Equipment booking, not "equipment scheduling." This distinction matters.
- **Market:** Life science R&D labs (biotech, pharma). Industry only, NOT academia.
- **One-liner:** Calira is a smart lab scheduling tool for lab ops professionals.
- **Elevator pitch:** Calira is an equipment booking platform for R&D teams who want to improve equipment utilisation, increase uptime, plan CapEx, and get AI-ready data about their lab.

## Value Themes
These are the six pillars of Calira's value. All messaging should map back to one or more of these:
1. **Track utilisation** — booking data, usage reports, utilisation rates per instrument
2. **Improve visibility** — equipment directory, labelling, room/location structure, searchability
3. **Reduce conflicts** — live calendars, booking rules, access groups, approval workflows
4. **Prevent downtime** — maintenance scheduling, service contracts, training enforcement, access control
5. **Plan CapEx** — purchase metadata, usage-based ROI, budget justification, multi-lab reporting
6. **Get AI-ready data** — structured booking data, API access, BI integration, ELN/LIMS sync

Top three by strategic priority: reduce conflicts, track utilisation, plan CapEx.

## Positioning Principles
- **Pain-first.** Lead with the operational problem, not the product category or transformation narrative.
- **Recognition.** Calira helps LabOps prove their value and make their work visible.
- **Professionalization.** Move labs beyond ad hoc tools toward something robust and professional.
- **Specialist use cases.** Distinct stories for scheduling, procurement, maintenance — not one generic platform message.
- **Integration humility.** "We don't try to do it all — we work well with the tools you already use."
- **Enterprise/scale relevance.** Messaging should speak to scaling labs, larger sites, and operational maturity.

## Category Entry Points
Triggers that bring prospects into market for our kind of solution:
1. Scheduling pain from inadequate/manual systems (easiest, strongest)
2. Instrument downtime, asset visibility, or under-utilisation
3. CapEx efficiency / ROI mandates / cost saving
4. Need for compliance or audit readiness
5. Purchasing new equipment
6. Headcount growth, site expansion, or merging
7. Changing or maturing ELN/LIMS platforms

## ICP & Target Segments
- **Industries:** Biotech and pharma in UK, US, EU, EEA
- **Primary champions:** Lab/facility/ops managers; Lab/facility/ops Directors and VPs
- **Secondary:** Scientists/Heads of research/departments; Automation engineers
- **Tertiary:** Procurement / finance; data science
- See `context/personas.md` for full detail including job titles, pain points, and messaging angles.
- See `context/value-prop-canvas.md` for the complete feature matrix, customer quotes, competitive landscape, and messaging matrix.

## Voice & Writing Rules
- **Brand voice:** Reliable, calm, credible, helpful. Like a smart colleague helping solve a real lab operations problem.
- Get to the point quickly. No fluff. Every sentence earns its place.
- Short, direct sentences. Problem-first framing. Specific claims over abstract promises.
- **Sentence case** in all headings and documents.
- **No emojis** in any output.
- **Never use:** "accelerate scientific workflows", "unlock insights", "streamline workflows", "empower your teams", "drive synergies", "transform your operations", or any generic SaaS/life science vendor-speak. If it sounds like a buzzword generator, don't write it.
- **No:** hype, tech-bro language, jokiness, excessive formality, vague transformation language, empty ROI claims without proof.
- **Quoting discipline:** When referencing transcripts, use exact word-for-word quotes only. Never paraphrase inside quotation marks. Always read transcripts fully before referencing them.

### Voice by Channel
- **LinkedIn:** Thoughtful, useful, pain-aware. Not punchy creator-style hooks or self-promotional fluff.
- **Email:** Clarity and purpose. Get to the point. Sound human. No salesy overstatement.
- **Blog/long-form:** Problem-first, insight-led. Teach, clarify, or reframe a problem rather than just promote product.
- **Sales collateral:** Precise, proof-oriented. Help sales have credible conversations. Concrete, not slogan-heavy.

## Tools
- HubSpot (CRM, email sequences, marketing automation, leads pipeline)
- Webflow (website, forms)
- Google Workspace (Docs, Sheets, Slides)
- Ahrefs (SEO, keyword research)
- LinkedIn Ads
- Google Ads
- Clay (data enrichment, outbound)
- Coefficient (pulls data from HubSpot/LinkedIn/Google Ads into Sheets for reporting)
- Dan Raubenheimer: freelance designer/developer, works 3 days/week
- Owen Jenkins-Garcia: Account Executive, joined April 2026

## How I Want to Work With Claude

### Full deliverable sets
When I give you a project (e.g. "webinar about X" or "product launch for Y"), generate ALL associated deliverables in one go. Show me the full checklist of what needs producing, then produce it all. Don't make me ask for each piece separately.

### Practical output
Default to ready-to-use copy I can edit, not outlines or suggestions. If I want a blog post, write the blog post. If I want emails, write the emails.

### Context retention
If I share additional documentation (brand guidelines, personas, product specs), incorporate them into future outputs without me re-explaining.

### Reporting
For reporting tasks, focus on clear summaries and actionable takeaways rather than restating raw data.

## Reference files

Global context (referenced from anywhere):
- `context/personas.md` — detailed persona profiles, pain points, messaging angles
- `context/value-prop-canvas.md` — feature matrix, customer quotes, competitive landscape, messaging matrix
- `context/competitors.md` — scored feature comparison across 11 competitors, pricing data, positioning notes
- `context/pov.md` — Calira's defensible positions, core organising principles, category stances, forbidden framings
- `context/writing-guidance.md` — avoiding AI-detectable writing patterns; applies to all Claude-produced content
- `context/templates.md` — recurring formats for case studies, events, task tracking, deliverable checklists
- `brand/Calira_BrandGuidelines_Sept2025.pdf` — logo usage, colour palette, typography hierarchy
- `PENDING-TASKS.md` — manual tasks requiring browser/platform access

Area-specific context auto-loads via subdirectory CLAUDE.md files:
- `seo/CLAUDE.md` — SEO strategy, research, content, help centre, structured data
- `events/CLAUDE.md` — event planning playbook and conventions
- `pmm/CLAUDE.md` — product marketing, demo transcripts, feature launches
- `reporting/CLAUDE.md` — two reporting systems: performance (leads, deals, ads) and spend (budget vs actuals)
- `outreach/CLAUDE.md` — outbound prospecting pipeline and methodology
