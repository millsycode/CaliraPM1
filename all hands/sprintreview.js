// Usage: node report.js [startDate] [endDate]   e.g. node report.js 2026-09-24 2026-10-22
// Requires the GitLab token in the GL environment variable. Writes all-hands-<endDate>.md.
// To run this 
// $env:GL = 'glpat-h5f8-RHd066Nw-3Oq5_-KGM6MQpvOjEKdTpobThqMQ8.01.17066w5fj'
// node sprintreview.js
const fs = require('fs'), path = require('path');
const T = process.env.GL;
if (!T) { console.error('Set the GL environment variable to your GitLab token.'); process.exit(1); }
const start = process.argv[2] || '2026-10-13', end = process.argv[3] || '2026-10-28';
const S = Date.parse(start + 'T00:00:00Z'), E = Date.parse(end + 'T00:00:00Z') + 86400000; // end date inclusive, UTC
const B = 'https://gitlab.com/api/v4/projects/clustermarket%2Fapp-clustermarket';

async function all(p) {
  const out = []; let page = 1;
  for (;;) {
    const r = await fetch(`${B}${p}${p.includes('?') ? '&' : '?'}per_page=100&page=${page}`, { headers: { 'PRIVATE-TOKEN': T } });
    if (!r.ok) throw new Error(r.status + ' ' + p);
    out.push(...await r.json());
    const n = r.headers.get('x-next-page');
    if (!n) break;
    page = +n;
  }
  return out;
}

async function fetchData() {
  const issues = await all(`/issues?issue_type=issue&state=all&updated_after=${start}T00:00:00Z`);
  const res = []; let i = 0;
  async function worker() {
    while (i < issues.length) {
      const is = issues[i++];
      const ev = await all(`/issues/${is.iid}/resource_label_events`);
      res.push({ iid: is.iid, title: is.title, url: is.web_url, weight: is.weight, labels: is.labels, closed_at: is.closed_at,
        events: ev.map(e => ({ a: e.action, l: e.label && e.label.name, t: e.created_at })) });
    }
  }
  await Promise.all([worker(), worker(), worker(), worker(), worker()]);
  return res;
}

function analyse(d) {
  const n = l => (l || '').toLowerCase().replace(/::\s*/, '::').trim(); // tolerate "Status:: Ready for Testing"
  const inW = t => { t = Date.parse(t); return t >= S && t < E; };
  const rel = [], stg = [], dev = [], tst = [];
  for (const i of d) {
    const add = i.events.filter(e => e.a === 'add').map(e => ({ l: n(e.l), t: e.t }));
    const addIn = l => add.some(e => e.l === l && inW(e.t));
    const released = i.closed_at && inW(i.closed_at);
    if (released) rel.push(i);
    else if (addIn('status::ready for staging') || addIn('status::testing (staging)')) stg.push(i);
    if (addIn('status::ready for testing')) dev.push(i);
    const rs = add.filter(e => e.l === 'status::ready for staging' && inW(e.t));
    if (rs.some(r => add.some(e => e.l === 'status::ready for testing' && Date.parse(e.t) < Date.parse(r.t)))) tst.push(i);
  }
  return { rel, stg, dev, tst };
}

function render({ rel, stg, dev, tst }) {
  const pts = (a, l) => a.filter(i => !l || i.labels.includes(l)).reduce((s, i) => s + (i.weight || 0), 0);
  const nw = a => a.filter(i => i.weight == null).length;
  const list = a => a.map(i => `- [${i.title.replace(/[\[\]]/g, '')}](${i.url})`).join('\n');
  const hdr = (t, a) => {
    const isBug = i => i.labels.includes('Bug') || i.labels.includes('production issue');
    const st = a.filter(i => !isBug(i)), bg = a.filter(isBug);
    return `## ${t} (${a.length})\n\n### Stories (${st.length})\n\n${list(st)}\n\n### Bugs (${bg.length})\n\n${list(bg)}\n`;
  };
  return `# Calira all-hands report\n\n**Period:** ${start} to ${end} inclusive (UTC). Data pulled ${new Date().toISOString().slice(0, 16)}Z; project clustermarket/app-clustermarket, issues only.\n\n## Story points\n\n| | Total | Frontend | Backend |\n|---|---|---|---|\n| Development (moved into Ready for Testing) | ${pts(dev)} | ${pts(dev, 'Frontend')} | ${pts(dev, 'Backend')} |\n| Testing (Ready for Testing → Ready for staging) | ${pts(tst)} | ${pts(tst, 'Frontend')} | ${pts(tst, 'Backend')} |\n\nDevelopment: ${dev.length} issues (${nw(dev)} without weight, counted as 0). Testing: ${tst.length} issues (${nw(tst)} without weight).\n\n${hdr('Released', rel)}\n${hdr('Moved to Ready for staging / Testing (staging), not yet released', stg)}`;
}

(async () => {
  const data = await fetchData();
  const md = render(analyse(data));
  const out = path.join(__dirname, `all-hands-${end}.md`);
  fs.writeFileSync(out, md);
  console.log(`${data.length} issues scanned. Wrote ${out}`);
})().catch(e => { console.error(e); process.exit(1); });
