// Public API release report: current state of issues labelled "Writeable API" + "1st release post MVP".
// Read-only (GET requests only). Usage: $env:GL = "<token>"; node api-release-report.js
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GL;
if (!TOKEN) { console.error('Set the GL env var to your GitLab token.'); process.exit(1); }

const PROJECT = 'clustermarket%2Fapp-clustermarket';
const BASE = `https://gitlab.com/api/v4/projects/${PROJECT}`;
const RELEASE_LABEL = '1st release post MVP';

const STATUS_VALUES = {
  'backlog': -2,
  'ready for refinement': -1,
  'ready for development': 0,
  'to do': 1,
  'in progress': 2,
  'review': 3,
  'ready for testing': 4,
  'testing': 5,
  'ready for staging': 6,
  'testing (staging)': 7,
  'ready to release': 8,
};

const norm = s => s.toLowerCase().replace(/\s+/g, ' ').trim();
// Lowercase and drop whitespace after "::" so "Status:: Ready for Testing" matches.
const normLabel = s => norm(s).replace(/::\s*/, '::');
const isWriteableApi = l => ['writeable api', 'writable api'].includes(norm(l));

async function getAll(url) {
  const out = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}per_page=100&page=${page}`, {
      headers: { 'PRIVATE-TOKEN': TOKEN },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    const rows = await res.json();
    out.push(...rows);
    if (!res.headers.get('x-next-page')) break;
  }
  return out;
}

const csvCell = v => {
  const s = String(v ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

(async () => {
  const issues = await getAll(
    `${BASE}/issues?issue_type=issue&state=all&labels=${encodeURIComponent(RELEASE_LABEL)}`
  );

  const rows = [];
  for (const issue of issues) {
    const labels = issue.labels.map(normLabel);
    if (!issue.labels.some(isWriteableApi)) continue;
    if (!labels.includes(norm(RELEASE_LABEL))) continue;

    const bug = labels.includes('bug') || labels.includes('production issue') ? 'Yes' : 'No';

    const statuses = issue.labels
      .filter(l => normLabel(l).startsWith('status::'))
      .map(l => l.replace(/^status::\s*/i, '').trim());
    if (statuses.length > 1) {
      console.warn(`Warning: #${issue.iid} has multiple status labels: ${statuses.join(', ')} (using highest)`);
    }
    let best = null;
    for (const s of statuses) {
      const v = STATUS_VALUES[norm(s)];
      if (best === null || (v ?? -Infinity) > (best.value ?? -Infinity)) best = { text: s, value: v ?? null };
    }
    if (best && best.value === null) console.warn(`Note: #${issue.iid} status "${best.text}" has no Status Value`);

    rows.push({
      title: issue.title,
      bug,
      statusString: best ? best.text : '',
      statusValue: best && best.value !== null ? best.value : '',
    });
  }

  // Descending by Status Value; rows with no value (On Hold, Ice box, no status) go last.
  rows.sort((a, b) => (b.statusValue === '' ? -Infinity : b.statusValue) - (a.statusValue === '' ? -Infinity : a.statusValue));

  const header = ['Title', 'Bug', 'Status String', 'Status Value'];
  const lines = [header, ...rows.map(r => [r.title, r.bug, r.statusString, r.statusValue])]
    .map(r => r.map(csvCell).join(','));
  const date = new Date().toISOString().slice(0, 10);
  const file = path.join(__dirname, `api-release-report-${date}.csv`);
  fs.writeFileSync(file, '﻿' + lines.join('\r\n') + '\r\n', 'utf8'); // BOM so Excel reads UTF-8
  console.log(`${rows.length} issues written to ${file}`);
})().catch(e => { console.error(e); process.exit(1); });
