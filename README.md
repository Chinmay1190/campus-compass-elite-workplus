<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Campus Compass Elite WorkPlus — README</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --fern:#154734;--fern2:#1b5c43;--sprout:#4caf7d;--gold:#c18e35;--gold-lt:#f0c96c;
  --mist:#f2f5f2;--glass:#ffffff;--soil:#282a26;--ink:#3d403b;--border:#d4e6d4;
  --red:#c05050;--shadow:0 4px 20px rgba(21,71,52,.10);
  --ff:'Times New Roman',Times,serif;--fm:'Courier New',Courier,monospace;
}
html{scroll-behavior:smooth}
body{font-family:var(--ff);background:var(--mist);color:var(--soil);line-height:1.78;font-size:16px}

/* ── Page wrapper ── */
.page{max-width:980px;margin:0 auto;padding:0 28px 100px}

/* ══ HERO ══ */
.hero{
  background:linear-gradient(140deg,#0d3324 0%,var(--fern) 45%,#1f7a50 100%);
  color:#fff;padding:80px 64px 72px;
  border-radius:0 0 40px 40px;
  position:relative;overflow:hidden;margin-bottom:64px;
}
.hero::before{
  content:'';position:absolute;top:-120px;right:-100px;
  width:420px;height:420px;
  background:radial-gradient(circle,rgba(76,175,125,.18) 0%,transparent 68%);
  border-radius:50%;pointer-events:none;
}
.hero::after{
  content:'';position:absolute;bottom:-80px;left:-80px;
  width:300px;height:300px;
  background:radial-gradient(circle,rgba(193,142,53,.15) 0%,transparent 68%);
  border-radius:50%;pointer-events:none;
}
.hero-top{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-bottom:8px}
.hero-logo{
  width:56px;height:56px;border-radius:16px;
  background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.22);
  display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;
}
.hero-eye{
  font-family:var(--fm);font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;
  color:rgba(255,255,255,.55);margin-bottom:14px;
}
.hero h1{
  font-size:clamp(34px,5.5vw,58px);font-weight:bold;line-height:1.08;
  margin-bottom:20px;position:relative;
}
.hero h1 em{color:#7de9a8;font-style:normal}
.hero-desc{font-size:17px;color:rgba(255,255,255,.78);max-width:580px;margin-bottom:36px;line-height:1.65}
.badge-row{display:flex;flex-wrap:wrap;gap:9px}
.badge{
  display:inline-flex;align-items:center;gap:6px;
  background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.20);
  color:rgba(255,255,255,.92);font-family:var(--fm);font-size:11px;
  padding:5px 13px;border-radius:20px;letter-spacing:.04em;
}
.badge.gold{background:rgba(193,142,53,.20);border-color:rgba(193,142,53,.40);color:#f0c96c}
.hero-stats{
  display:flex;gap:0;border:1px solid rgba(255,255,255,.15);
  border-radius:18px;overflow:hidden;margin-top:40px;
  background:rgba(255,255,255,.06);backdrop-filter:blur(8px);
}
.hero-stat{flex:1;text-align:center;padding:20px 16px;border-right:1px solid rgba(255,255,255,.12)}
.hero-stat:last-child{border-right:none}
.hero-stat .val{font-size:30px;font-weight:bold;color:#7de9a8;line-height:1;margin-bottom:5px}
.hero-stat .lbl{font-family:var(--fm);font-size:10px;letter-spacing:.12em;color:rgba(255,255,255,.55);text-transform:uppercase}

/* ══ SECTION ══ */
.section{margin-bottom:60px}
.section-eye{
  font-family:var(--fm);font-size:10px;letter-spacing:.22em;text-transform:uppercase;
  color:var(--sprout);margin-bottom:5px;
}
.section h2{
  font-size:27px;font-weight:bold;color:var(--fern);
  padding-bottom:12px;border-bottom:2.5px solid var(--border);margin-bottom:28px;
  display:flex;align-items:center;gap:12px;
}
.section h2 .h2-icon{
  width:38px;height:38px;border-radius:11px;
  background:linear-gradient(135deg,var(--sprout),var(--fern));
  display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;
}
p{margin-bottom:14px}

/* ══ CARDS ══ */
.grid{display:grid;gap:18px}
.g2{grid-template-columns:repeat(auto-fit,minmax(270px,1fr))}
.g3{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.g4{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}
.card{
  background:var(--glass);border:1px solid var(--border);
  border-radius:18px;padding:26px;
  box-shadow:var(--shadow);
  transition:transform .18s,box-shadow .18s;
}
.card:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(21,71,52,.13)}
.card-ico{
  width:46px;height:46px;border-radius:13px;
  background:linear-gradient(135deg,var(--sprout),var(--fern));
  display:flex;align-items:center;justify-content:center;
  font-size:20px;margin-bottom:16px;
}
.card h3{font-size:15.5px;font-weight:bold;color:var(--fern);margin-bottom:6px}
.card p{font-size:13.5px;color:var(--ink);margin:0;line-height:1.6}

/* ══ STAT CARDS ══ */
.stat-card{
  background:var(--glass);border:1px solid var(--border);
  border-radius:18px;padding:22px 18px;text-align:center;
  box-shadow:var(--shadow);position:relative;overflow:hidden;
}
.stat-card::before{
  content:'';position:absolute;top:-20px;right:-20px;
  width:80px;height:80px;border-radius:50%;
  background:radial-gradient(circle,rgba(76,175,125,.12),transparent 70%);
}
.stat-card .sv{font-size:36px;font-weight:bold;color:var(--fern);line-height:1;margin-bottom:7px}
.stat-card .sl{font-family:var(--fm);font-size:10.5px;letter-spacing:.1em;color:#7a8c7a;text-transform:uppercase}

/* ══ TABLES ══ */
.tbl{width:100%;border-collapse:collapse;font-size:14px}
.tbl th{
  background:var(--fern);color:#fff;padding:13px 16px;
  font-weight:bold;font-size:12.5px;letter-spacing:.04em;text-align:left;
}
.tbl th:first-child{border-radius:11px 0 0 0}
.tbl th:last-child{border-radius:0 11px 0 0}
.tbl td{padding:11px 16px;border-bottom:1px solid var(--border);color:var(--ink);vertical-align:top}
.tbl tr:last-child td{border-bottom:none}
.tbl tr:nth-child(even) td{background:#f7fbf7}
.tbl tr:hover td{background:#eef6ee}
.pill{
  display:inline-block;background:rgba(76,175,125,.14);color:var(--fern);
  font-family:var(--fm);font-size:11px;padding:2px 9px;border-radius:8px;font-weight:bold;
}
.pill-gold{background:rgba(193,142,53,.14);color:#7a5a1a}

/* ══ PERM TABLE ══ */
.ptbl{width:100%;border-collapse:collapse;font-size:13.5px}
.ptbl th{background:var(--fern);color:#fff;padding:12px 14px;font-weight:bold;font-size:12.5px}
.ptbl th:first-child{border-radius:11px 0 0 0;text-align:left}
.ptbl th:last-child{border-radius:0 11px 0 0}
.ptbl td{padding:10px 14px;border-bottom:1px solid var(--border);text-align:center}
.ptbl td:first-child{text-align:left;font-weight:bold;color:var(--ink)}
.ptbl tr:nth-child(even) td{background:#f7fbf7}
.ptbl tr:hover td{background:#eef6ee}
.ck{color:#1b9e55;font-size:17px}
.cx{color:var(--red);font-size:17px}

/* ══ ARCH DIAGRAM ══ */
.arch{
  background:var(--glass);border:1px solid var(--border);
  border-radius:22px;padding:40px 32px;overflow-x:auto;
}
.alayer{margin-bottom:8px}
.alabel{
  font-family:var(--fm);font-size:10px;letter-spacing:.18em;text-transform:uppercase;
  color:#9ab09a;text-align:center;margin-bottom:10px;
}
.arow{display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap}
.abox{
  border:2px solid var(--border);border-radius:12px;padding:13px 22px;
  font-size:13px;font-weight:bold;color:var(--fern);background:#f4fbf4;
  text-align:center;min-width:130px;line-height:1.4;
}
.abox small{display:block;font-weight:normal;font-size:11px;color:#7a8c7a;margin-top:2px}
.abox.pri{background:var(--fern);color:#fff;border-color:var(--fern);font-size:14.5px;padding:16px 32px}
.abox.pri small{color:rgba(255,255,255,.65)}
.abox.db{background:#fffbf0;border-color:#e0c875;color:#7a5a1a}
.abox.db small{color:#a08040}
.aarr{font-size:22px;color:var(--sprout)}
.adiv{height:36px;display:flex;align-items:center;justify-content:center;color:var(--sprout);font-size:22px}

/* ══ DB SCHEMA ══ */
.db-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(205px,1fr));gap:14px}
.dbt{background:var(--glass);border:1px solid var(--border);border-radius:14px;overflow:hidden;font-size:13px;box-shadow:var(--shadow)}
.dbth{background:var(--fern);color:#fff;padding:10px 14px;font-weight:bold;font-size:13px;display:flex;align-items:center;gap:7px}
.dbf{padding:7px 14px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:8px}
.dbf:last-child{border-bottom:none}
.dbf:hover{background:#f4fbf4}
.dbf .fn{color:var(--ink)}
.dbf .ft{font-family:var(--fm);font-size:10px;color:#7a5a1a;background:#fff8ec;border:1px solid #e8d5a0;padding:2px 7px;border-radius:5px}
.pk{color:var(--gold);font-size:10px;font-weight:bold;margin-right:3px}

/* ══ BAR CHART ══ */
.bchart{display:flex;flex-direction:column;gap:13px}
.brow{display:flex;align-items:center;gap:14px}
.brow label{min-width:140px;font-size:13px;color:var(--ink);text-align:right;font-weight:bold;flex-shrink:0}
.btrack{flex:1;background:#e4ede4;border-radius:7px;height:24px;overflow:hidden}
.bfill{height:100%;border-radius:7px;display:flex;align-items:center;padding-left:11px;font-family:var(--fm);font-size:11px;color:#fff;font-weight:bold}
.bg{background:linear-gradient(90deg,var(--fern),var(--sprout))}
.bb{background:linear-gradient(90deg,#1e60a0,#4a9cd8)}
.bo{background:linear-gradient(90deg,#a87428,var(--gold))}
.bp{background:linear-gradient(90deg,#5a2a88,#8a50cc)}

/* ══ FLOW ══ */
.flow{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:0;
  background:var(--glass);border:1px solid var(--border);border-radius:20px;padding:32px 24px}
.fstep{
  display:flex;flex-direction:column;align-items:center;
  background:#f4fbf4;border:1px solid var(--border);border-radius:14px;
  padding:18px 14px;min-width:108px;max-width:126px;text-align:center;flex:0 0 auto;
  transition:transform .18s,box-shadow .18s;
}
.fstep:hover{transform:translateY(-2px);box-shadow:0 4px 14px rgba(21,71,52,.1)}
.fn2{
  width:34px;height:34px;border-radius:50%;
  background:var(--fern);color:#fff;
  font-weight:bold;font-size:14px;
  display:flex;align-items:center;justify-content:center;margin-bottom:10px;
}
.fstep p{font-size:12px;color:var(--ink);margin:0;line-height:1.5}
.farr{display:flex;align-items:center;padding:0 4px;color:var(--sprout);font-size:24px;flex:0 0 auto;align-self:center}

/* ══ CODE ══ */
.code{
  background:#14201a;color:#9dd49d;font-family:var(--fm);font-size:13px;
  line-height:1.7;padding:26px 30px;border-radius:16px;overflow-x:auto;
  margin-bottom:20px;border:1px solid #243020;
}
.code .cm{color:#4a6a4a}.code .kw{color:#7dd88a}.code .vl{color:#d4b488}.code .cd{color:#f0c96c}

/* ══ STEPS ══ */
.steps{display:flex;flex-direction:column;gap:16px}
.step{
  display:flex;gap:20px;align-items:flex-start;
  background:var(--glass);border:1px solid var(--border);
  border-radius:16px;padding:22px 26px;box-shadow:var(--shadow);
  transition:transform .18s;
}
.step:hover{transform:translateX(4px)}
.snum{
  min-width:38px;height:38px;border-radius:50%;
  background:var(--fern);color:#fff;font-weight:bold;font-size:16px;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;
}
.sbody h4{font-size:15px;font-weight:bold;color:var(--fern);margin-bottom:5px}
.sbody p{font-size:13.5px;color:var(--ink);margin:0 0 10px}
.sinline{
  font-family:var(--fm);background:#14201a;color:#9dd49d;
  padding:9px 15px;border-radius:10px;font-size:12.5px;
  display:block;white-space:pre;overflow-x:auto;
}

/* ══ HIGHLIGHT STRIP ══ */
.strip{
  background:linear-gradient(135deg,var(--fern),#1f7a50);
  color:#fff;border-radius:18px;padding:30px 36px;
  margin-bottom:28px;display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;
}
.strip-icon{font-size:28px;flex-shrink:0;margin-top:2px}
.strip h3{font-size:17px;font-weight:bold;margin-bottom:6px}
.strip p{font-size:14px;color:rgba(255,255,255,.80);margin:0;line-height:1.65}

/* ══ MISC ══ */
hr.div{border:none;border-top:1px solid var(--border);margin:52px 0}
ul.nice{padding-left:0;list-style:none}
ul.nice li{
  padding:8px 0 8px 28px;position:relative;
  border-bottom:1px solid var(--border);font-size:14.5px;
}
ul.nice li:last-child{border-bottom:none}
ul.nice li::before{content:'◆';position:absolute;left:0;color:var(--sprout);font-size:9px;top:14px}
code{font-family:var(--fm);background:#eef7ee;padding:2px 7px;border-radius:5px;font-size:13px;color:var(--fern)}

footer{
  text-align:center;font-size:12.5px;color:#8ca88c;
  border-top:1px solid var(--border);padding-top:30px;margin-top:60px;
  font-family:var(--fm);letter-spacing:.04em;line-height:1.9;
}

@media(max-width:620px){
  .hero{padding:52px 28px 48px}
  .hero-stats{flex-direction:column}
  .hero-stat{border-right:none;border-bottom:1px solid rgba(255,255,255,.12)}
  .arow{flex-direction:column}
  .farr{transform:rotate(90deg)}
  .brow label{min-width:90px;font-size:11px}
}
</style>
</head>
<body>

<!-- ══ HERO ══ -->
<div class="hero">
  <div class="hero-eye">Open Source · Academic Management Platform · v1.0</div>
  <div class="hero-top">
    <div>
      <h1>Campus Compass<br><em>Elite WorkPlus</em></h1>
    </div>
    <div class="hero-logo">🌿</div>
  </div>
  <p class="hero-desc">
    A full-stack <strong>Student Management System</strong> for <strong>Verdant Academy</strong> —
    built with React 19, TanStack Router, Supabase, and deployed globally on Cloudflare Workers.
  </p>
  <div class="badge-row">
    <span class="badge">⚛ React 19</span>
    <span class="badge">🗄 Supabase</span>
    <span class="badge">⚡ Cloudflare Workers</span>
    <span class="badge">📦 TypeScript 5.8</span>
    <span class="badge">🔀 TanStack Router</span>
    <span class="badge gold">★ Role-Based Access</span>
    <span class="badge gold">★ PDF &amp; CSV Export</span>
  </div>
  <div class="hero-stats">
    <div class="hero-stat"><div class="val">12</div><div class="lbl">App Routes</div></div>
    <div class="hero-stat"><div class="val">3</div><div class="lbl">User Roles</div></div>
    <div class="hero-stat"><div class="val">8+</div><div class="lbl">DB Tables</div></div>
    <div class="hero-stat"><div class="val">110</div><div class="lbl">Source Files</div></div>
    <div class="hero-stat"><div class="val">40+</div><div class="lbl">UI Components</div></div>
  </div>
</div>

<div class="page">

<!-- ══ OVERVIEW ══ -->
<div class="section">
  <div class="section-eye">§ 01 — Overview</div>
  <h2><span class="h2-icon">📋</span> What Is Campus Compass Elite WorkPlus?</h2>
  <p>
    <strong>Campus Compass Elite WorkPlus</strong> is a production-ready <em>Student Information System (SIS)</em>
    that centralises student records, course catalogs, attendance, examinations, financial aid, faculty management,
    a digital library, and campus-wide announcements — all in one unified web application.
  </p>
  <p>
    The platform enforces strict <strong>role-based access control</strong> (Admin / Teacher / Student).
    Data is persisted in <strong>PostgreSQL</strong> via <strong>Supabase</strong> with Row-Level Security,
    and the app is edge-deployed on <strong>Cloudflare Workers</strong> for sub-100 ms global response times.
  </p>
  <div class="grid g4" style="margin-top:28px">
    <div class="stat-card"><div class="sv">12</div><div class="sl">Application Routes</div></div>
    <div class="stat-card"><div class="sv">3</div><div class="sl">User Roles</div></div>
    <div class="stat-card"><div class="sv">8+</div><div class="sl">Database Tables</div></div>
    <div class="stat-card"><div class="sv">110</div><div class="sl">Source Files</div></div>
  </div>
</div>

<!-- ══ FEATURES ══ -->
<div class="section">
  <div class="section-eye">§ 02 — Features</div>
  <h2><span class="h2-icon">✨</span> Core Feature Modules</h2>
  <div class="grid g3">
    <div class="card"><div class="card-ico">📊</div><h3>Growth Dashboard</h3><p>Live KPI tiles for total students, active rate, fees collected, and active courses with trend deltas per term.</p></div>
    <div class="card"><div class="card-ico">👥</div><h3>Student Records</h3><p>Full CRUD — GPA tracking, enrolment status, guardian contacts, date of birth, address, and course linkage.</p></div>
    <div class="card"><div class="card-ico">🎓</div><h3>Course Catalog</h3><p>Browse and manage courses with department, credits, schedule, capacity, and instructor assignment.</p></div>
    <div class="card"><div class="card-ico">✅</div><h3>Attendance</h3><p>Mark Present / Late / Absent per student per session with per-course attendance summaries.</p></div>
    <div class="card"><div class="card-ico">📋</div><h3>Exams &amp; Grades</h3><p>Schedule examinations, record grades, and compute GPA — all with per-role visibility controls.</p></div>
    <div class="card"><div class="card-ico">💳</div><h3>Financial Aid</h3><p>Invoice generation with Paid / Pending / Overdue status, term tracking, and payment method logging.</p></div>
    <div class="card"><div class="card-ico">👩‍🏫</div><h3>Faculty Directory</h3><p>Staff records with department, title, qualifications, specialisation, and office location fields.</p></div>
    <div class="card"><div class="card-ico">📚</div><h3>Library</h3><p>Track books by ISBN, author, shelf, total copies, and available copies in real time.</p></div>
    <div class="card"><div class="card-ico">📣</div><h3>Announcements</h3><p>Pinnable notices with Normal / Important / Urgent priority levels, audience targeting, and expiry dates.</p></div>
    <div class="card"><div class="card-ico">📅</div><h3>Calendar</h3><p>Shared academic calendar for events, deadlines, and term milestones visible to all roles.</p></div>
    <div class="card"><div class="card-ico">📈</div><h3>Reports</h3><p>Term-level analytics for admins and teachers with one-click PDF and CSV export.</p></div>
    <div class="card"><div class="card-ico">⚙️</div><h3>Settings</h3><p>Admin-only system preferences; personal profile management available to all roles.</p></div>
  </div>
</div>

<!-- ══ TECH STACK ══ -->
<div class="section">
  <div class="section-eye">§ 03 — Technology</div>
  <h2><span class="h2-icon">🔧</span> Technology Stack</h2>
  <table class="tbl">
    <thead><tr><th>Layer</th><th>Technology</th><th>Version</th><th>Purpose</th></tr></thead>
    <tbody>
      <tr><td><strong>UI Framework</strong></td><td>React</td><td><span class="pill">19.2</span></td><td>Component model, concurrent rendering</td></tr>
      <tr><td><strong>Routing</strong></td><td>TanStack Router</td><td><span class="pill">1.168</span></td><td>Type-safe file-based routing with SSR</td></tr>
      <tr><td><strong>Data Fetching</strong></td><td>TanStack Query</td><td><span class="pill">5.83</span></td><td>Server-state caching and synchronisation</td></tr>
      <tr><td><strong>Language</strong></td><td>TypeScript</td><td><span class="pill">5.8</span></td><td>End-to-end type safety across the stack</td></tr>
      <tr><td><strong>Build Tool</strong></td><td>Vite</td><td><span class="pill">7.3</span></td><td>HMR, Cloudflare plugin, SSR build pipeline</td></tr>
      <tr><td><strong>Styling</strong></td><td>Tailwind CSS</td><td><span class="pill">4.2</span></td><td>Utility-first design system with custom tokens</td></tr>
      <tr><td><strong>UI Components</strong></td><td>shadcn/ui + Radix UI</td><td><span class="pill">latest</span></td><td>Accessible, composable UI primitives (40+ components)</td></tr>
      <tr><td><strong>Icons</strong></td><td>Lucide React</td><td><span class="pill">0.575</span></td><td>Consistent icon set throughout the interface</td></tr>
      <tr><td><strong>Forms</strong></td><td>React Hook Form + Zod</td><td><span class="pill">7.71 / 3.24</span></td><td>Validated, schema-driven forms</td></tr>
      <tr><td><strong>Charts</strong></td><td>Recharts</td><td><span class="pill">2.15</span></td><td>Analytics visualisations in Reports module</td></tr>
      <tr><td><strong>PDF Export</strong></td><td>jsPDF + autoTable</td><td><span class="pill">4.2 / 5.0</span></td><td>Branded, table-aware PDF generation</td></tr>
      <tr><td><strong>Backend / Auth</strong></td><td>Supabase</td><td><span class="pill">2.104</span></td><td>Auth, PostgREST API, Realtime subscriptions</td></tr>
      <tr><td><strong>Database</strong></td><td>PostgreSQL (Supabase)</td><td><span class="pill">hosted</span></td><td>Relational data with Row-Level Security</td></tr>
      <tr><td><strong>Deployment</strong></td><td>Cloudflare Workers</td><td><span class="pill">Wrangler</span></td><td>Global edge runtime, zero cold starts</td></tr>
      <tr><td><strong>Package Manager</strong></td><td>Bun / npm</td><td><span class="pill">latest</span></td><td>Fast dependency installs with lockfile</td></tr>
      <tr><td><strong>Linting / Format</strong></td><td>ESLint 9 + Prettier 3</td><td><span class="pill">latest</span></td><td>Code quality and consistent formatting</td></tr>
    </tbody>
  </table>
</div>

<!-- ══ DEPENDENCY CHART ══ -->
<div class="section">
  <div class="section-eye">§ 04 — Dependencies</div>
  <h2><span class="h2-icon">📦</span> Dependency Breakdown</h2>
  <p>Approximate relative share of each category across the <code>package.json</code> dependency tree.</p>
  <div style="background:var(--glass);border:1px solid var(--border);border-radius:18px;padding:32px 36px;box-shadow:var(--shadow)">
    <div class="bchart">
      <div class="brow"><label>Radix / shadcn UI</label><div class="btrack"><div class="bfill bg" style="width:85%">85%</div></div></div>
      <div class="brow"><label>TanStack Ecosystem</label><div class="btrack"><div class="bfill bb" style="width:62%">62%</div></div></div>
      <div class="brow"><label>Supabase Integration</label><div class="btrack"><div class="bfill bo" style="width:46%">46%</div></div></div>
      <div class="brow"><label>Form &amp; Validation</label><div class="btrack"><div class="bfill bp" style="width:32%">32%</div></div></div>
      <div class="brow"><label>Data Viz &amp; Export</label><div class="btrack"><div class="bfill bg" style="width:26%">26%</div></div></div>
      <div class="brow"><label>Styling Utilities</label><div class="btrack"><div class="bfill bo" style="width:18%">18%</div></div></div>
    </div>
    <p style="font-size:12px;color:#8ca88c;margin-top:18px;text-align:center;font-family:var(--fm)">
      * Relative weight by dependency count per category in package.json
    </p>
  </div>
</div>

<!-- ══ ARCHITECTURE ══ -->
<div class="section">
  <div class="section-eye">§ 05 — Architecture</div>
  <h2><span class="h2-icon">🏗</span> System Architecture</h2>
  <div class="arch">
    <div class="alayer">
      <div class="alabel">Client Layer</div>
      <div class="arow">
        <div class="abox pri">🌐 Browser / PWA<small>React 19 + TanStack Router</small></div>
      </div>
    </div>
    <div class="adiv">↕</div>
    <div class="alayer">
      <div class="alabel">Edge Runtime Layer</div>
      <div class="arow">
        <div class="abox">⚡ Cloudflare Workers<small>Nitro + Vite build</small></div>
        <div class="aarr">↔</div>
        <div class="abox">🔐 Auth Middleware<small>Supabase JWT validation</small></div>
      </div>
    </div>
    <div class="adiv">↕</div>
    <div class="alayer">
      <div class="alabel">Backend-as-a-Service Layer</div>
      <div class="arow">
        <div class="abox db">🗄 PostgREST<small>Auto-generated REST API</small></div>
        <div class="aarr">↔</div>
        <div class="abox db">🔑 Supabase Auth<small>Email / password + roles</small></div>
        <div class="aarr">↔</div>
        <div class="abox db">⚡ Realtime<small>Live subscriptions</small></div>
      </div>
    </div>
    <div class="adiv">↕</div>
    <div class="alayer">
      <div class="alabel">Data Layer</div>
      <div class="arow">
        <div class="abox pri" style="background:#7a5a1a;border-color:#7a5a1a">🐘 PostgreSQL<small>Row-Level Security on all tables</small></div>
      </div>
    </div>
  </div>
</div>

<!-- ══ DATABASE SCHEMA ══ -->
<div class="section">
  <div class="section-eye">§ 06 — Database</div>
  <h2><span class="h2-icon">🗄</span> Database Schema</h2>
  <p>
    All tables live in the <code>public</code> schema with RLS enabled.
    Every table carries <code>created_at</code> and <code>updated_at</code> timestamps managed by a trigger.
  </p>
  <div class="db-grid">
    <div class="dbt">
      <div class="dbth">👤 profiles</div>
      <div class="dbf"><span><span class="pk">PK</span>id</span><span class="ft">uuid</span></div>
      <div class="dbf"><span>first_name</span><span class="ft">text</span></div>
      <div class="dbf"><span>last_name</span><span class="ft">text</span></div>
      <div class="dbf"><span>avatar_url</span><span class="ft">text</span></div>
      <div class="dbf"><span>phone</span><span class="ft">text</span></div>
    </div>
    <div class="dbt">
      <div class="dbth">🔑 user_roles</div>
      <div class="dbf"><span><span class="pk">PK</span>id</span><span class="ft">uuid</span></div>
      <div class="dbf"><span>user_id</span><span class="ft">uuid FK</span></div>
      <div class="dbf"><span>role</span><span class="ft">app_role</span></div>
    </div>
    <div class="dbt">
      <div class="dbth">🎓 students</div>
      <div class="dbf"><span><span class="pk">PK</span>id</span><span class="ft">uuid</span></div>
      <div class="dbf"><span>student_no</span><span class="ft">text UQ</span></div>
      <div class="dbf"><span>full_name</span><span class="ft">text</span></div>
      <div class="dbf"><span>email</span><span class="ft">text</span></div>
      <div class="dbf"><span>course_id</span><span class="ft">uuid FK</span></div>
      <div class="dbf"><span>year / gpa</span><span class="ft">int / num</span></div>
      <div class="dbf"><span>status</span><span class="ft">text</span></div>
    </div>
    <div class="dbt">
      <div class="dbth">📖 courses</div>
      <div class="dbf"><span><span class="pk">PK</span>id</span><span class="ft">uuid</span></div>
      <div class="dbf"><span>code</span><span class="ft">text UQ</span></div>
      <div class="dbf"><span>title</span><span class="ft">text</span></div>
      <div class="dbf"><span>department</span><span class="ft">text</span></div>
      <div class="dbf"><span>credits</span><span class="ft">int</span></div>
      <div class="dbf"><span>instructor_id</span><span class="ft">uuid FK</span></div>
      <div class="dbf"><span>capacity</span><span class="ft">int</span></div>
    </div>
    <div class="dbt">
      <div class="dbth">👩‍🏫 teachers</div>
      <div class="dbf"><span><span class="pk">PK</span>id</span><span class="ft">uuid</span></div>
      <div class="dbf"><span>staff_no</span><span class="ft">text UQ</span></div>
      <div class="dbf"><span>full_name</span><span class="ft">text</span></div>
      <div class="dbf"><span>department</span><span class="ft">text</span></div>
      <div class="dbf"><span>title</span><span class="ft">text</span></div>
    </div>
    <div class="dbt">
      <div class="dbth">💳 fees</div>
      <div class="dbf"><span><span class="pk">PK</span>id</span><span class="ft">uuid</span></div>
      <div class="dbf"><span>invoice_no</span><span class="ft">text UQ</span></div>
      <div class="dbf"><span>student_id</span><span class="ft">uuid FK</span></div>
      <div class="dbf"><span>amount</span><span class="ft">numeric</span></div>
      <div class="dbf"><span>status</span><span class="ft">text</span></div>
      <div class="dbf"><span>due_date</span><span class="ft">date</span></div>
    </div>
    <div class="dbt">
      <div class="dbth">✅ attendance</div>
      <div class="dbf"><span><span class="pk">PK</span>id</span><span class="ft">uuid</span></div>
      <div class="dbf"><span>student_id</span><span class="ft">uuid FK</span></div>
      <div class="dbf"><span>course_id</span><span class="ft">uuid FK</span></div>
      <div class="dbf"><span>date</span><span class="ft">date</span></div>
      <div class="dbf"><span>status</span><span class="ft">enum</span></div>
    </div>
    <div class="dbt">
      <div class="dbth">📚 books</div>
      <div class="dbf"><span><span class="pk">PK</span>id</span><span class="ft">uuid</span></div>
      <div class="dbf"><span>title / author</span><span class="ft">text</span></div>
      <div class="dbf"><span>isbn</span><span class="ft">text</span></div>
      <div class="dbf"><span>total_copies</span><span class="ft">int</span></div>
      <div class="dbf"><span>available</span><span class="ft">int</span></div>
      <div class="dbf"><span>shelf</span><span class="ft">text</span></div>
    </div>
  </div>
</div>

<!-- ══ RBAC ══ -->
<div class="section">
  <div class="section-eye">§ 07 — Access Control</div>
  <h2><span class="h2-icon">🔐</span> Role-Based Access Control</h2>
  <p>
    Roles are stored in <code>user_roles</code> and resolved via a PostgreSQL
    <code>has_role()</code> security-definer function. New signups automatically receive
    the <strong>student</strong> role. Admins promote roles manually via the database.
  </p>
  <table class="ptbl">
    <thead>
      <tr><th>Module</th><th>Admin</th><th>Teacher</th><th>Student</th></tr>
    </thead>
    <tbody>
      <tr><td>Dashboard</td><td><span class="ck">✔</span></td><td><span class="ck">✔</span></td><td><span class="ck">✔</span></td></tr>
      <tr><td>Student Records</td><td><span class="ck">✔</span></td><td><span class="ck">✔</span></td><td><span class="cx">✘</span></td></tr>
      <tr><td>Course Catalog</td><td><span class="ck">✔</span></td><td><span class="ck">✔</span></td><td><span class="ck">✔</span></td></tr>
      <tr><td>Attendance</td><td><span class="ck">✔</span></td><td><span class="ck">✔</span></td><td><span class="ck">✔</span></td></tr>
      <tr><td>Exams &amp; Grades</td><td><span class="ck">✔</span></td><td><span class="ck">✔</span></td><td><span class="ck">✔</span></td></tr>
      <tr><td>Financial Aid</td><td><span class="ck">✔</span></td><td><span class="cx">✘</span></td><td><span class="ck">✔</span></td></tr>
      <tr><td>Faculty Directory</td><td><span class="ck">✔</span></td><td><span class="ck">✔</span></td><td><span class="cx">✘</span></td></tr>
      <tr><td>Library</td><td><span class="ck">✔</span></td><td><span class="ck">✔</span></td><td><span class="ck">✔</span></td></tr>
      <tr><td>Announcements</td><td><span class="ck">✔</span></td><td><span class="ck">✔</span></td><td><span class="ck">✔</span></td></tr>
      <tr><td>Calendar</td><td><span class="ck">✔</span></td><td><span class="ck">✔</span></td><td><span class="ck">✔</span></td></tr>
      <tr><td>Reports</td><td><span class="ck">✔</span></td><td><span class="ck">✔</span></td><td><span class="cx">✘</span></td></tr>
      <tr><td>Settings</td><td><span class="ck">✔</span></td><td><span class="cx">✘</span></td><td><span class="cx">✘</span></td></tr>
    </tbody>
  </table>
</div>

<!-- ══ AUTH FLOW ══ -->
<div class="section">
  <div class="section-eye">§ 08 — Auth Flow</div>
  <h2><span class="h2-icon">🔄</span> Authentication Flow</h2>
  <div class="flow">
    <div class="fstep"><div class="fn2">1</div><p><strong>Visit</strong> /login or /signup</p></div>
    <div class="farr">→</div>
    <div class="fstep"><div class="fn2">2</div><p><strong>Zod</strong> client-side validation</p></div>
    <div class="farr">→</div>
    <div class="fstep"><div class="fn2">3</div><p><strong>Supabase Auth</strong> issues JWT</p></div>
    <div class="farr">→</div>
    <div class="fstep"><div class="fn2">4</div><p><strong>user_roles</strong> table queried</p></div>
    <div class="farr">→</div>
    <div class="fstep"><div class="fn2">5</div><p><strong>AuthContext</strong> populates roles</p></div>
    <div class="farr">→</div>
    <div class="fstep"><div class="fn2">6</div><p><strong>Router guards</strong> filter nav &amp; routes</p></div>
  </div>
  <p style="font-size:12.5px;color:#8ca88c;text-align:center;margin-top:16px;font-family:var(--fm)">
    New signups default to <strong>student</strong> role via DB trigger · Admins promote roles manually
  </p>
</div>

<!-- ══ PROJECT STRUCTURE ══ -->
<div class="section">
  <div class="section-eye">§ 09 — Structure</div>
  <h2><span class="h2-icon">📁</span> Project Structure</h2>
  <div class="code">
<span class="cm">campus-compass-elite-workplus/</span>
├── <span class="kw">src/</span>
│   ├── <span class="kw">components/</span>
│   │   ├── <span class="vl">AppShell.tsx</span>        <span class="cm"># Sidebar layout + role-filtered nav</span>
│   │   ├── <span class="vl">ExportMenu.tsx</span>      <span class="cm"># PDF / CSV export trigger UI</span>
│   │   ├── <span class="vl">LoadingScreen.tsx</span>
│   │   ├── <span class="vl">Modal.tsx</span>
│   │   └── <span class="kw">ui/</span>                 <span class="cm"># 40+ shadcn/ui components</span>
│   ├── <span class="kw">routes/</span>
│   │   ├── <span class="vl">index.tsx</span>           <span class="cm"># Growth Dashboard</span>
│   │   ├── <span class="vl">students.tsx</span>
│   │   ├── <span class="vl">courses.tsx</span>
│   │   ├── <span class="vl">attendance.tsx</span>
│   │   ├── <span class="vl">exams.tsx</span>
│   │   ├── <span class="vl">fees.tsx</span>
│   │   ├── <span class="vl">teachers.tsx</span>
│   │   ├── <span class="vl">library.tsx</span>
│   │   ├── <span class="vl">announcements.tsx</span>
│   │   ├── <span class="vl">calendar.tsx</span>
│   │   ├── <span class="vl">reports.tsx</span>
│   │   ├── <span class="vl">settings.tsx</span>
│   │   ├── <span class="vl">login.tsx</span>
│   │   └── <span class="vl">signup.tsx</span>
│   ├── <span class="kw">lib/</span>
│   │   ├── <span class="vl">api.ts</span>              <span class="cm"># All Supabase queries + TypeScript types</span>
│   │   ├── <span class="vl">auth.tsx</span>            <span class="cm"># AuthContext, AuthProvider, useAuth()</span>
│   │   └── <span class="vl">export.ts</span>           <span class="cm"># exportCsv() + exportPdf() utilities</span>
│   └── <span class="kw">integrations/supabase/</span>
│       ├── <span class="vl">client.ts</span>           <span class="cm"># Browser Supabase client</span>
│       ├── <span class="vl">client.server.ts</span>    <span class="cm"># Server-side Supabase client</span>
│       ├── <span class="vl">auth-middleware.ts</span>  <span class="cm"># Edge JWT validation</span>
│       └── <span class="vl">types.ts</span>            <span class="cm"># Auto-generated DB types</span>
├── <span class="kw">supabase/migrations/</span>        <span class="cm"># Timestamped SQL migration files</span>
├── <span class="vl">.env</span>                        <span class="cm"># Supabase credentials (not committed)</span>
├── <span class="vl">vite.config.ts</span>
├── <span class="vl">wrangler.jsonc</span>              <span class="cm"># Cloudflare Workers deployment config</span>
└── <span class="vl">package.json</span>
  </div>
</div>

<!-- ══ GETTING STARTED ══ -->
<div class="section">
  <div class="section-eye">§ 10 — Getting Started</div>
  <h2><span class="h2-icon">🚀</span> Installation &amp; Local Development</h2>

  <div class="strip">
    <div class="strip-icon">📋</div>
    <div>
      <h3>Prerequisites</h3>
      <p>Node.js 18+ or Bun (latest) · A Supabase project · A Cloudflare account for deployment</p>
    </div>
  </div>

  <div class="steps">
    <div class="step">
      <div class="snum">1</div>
      <div class="sbody">
        <h4>Clone the Repository</h4>
        <p>Clone the project to your local machine using Git.</p>
        <code class="sinline">git clone https://github.com/your-org/campus-compass-elite-workplus.git
cd campus-compass-elite-workplus</code>
      </div>
    </div>
    <div class="step">
      <div class="snum">2</div>
      <div class="sbody">
        <h4>Install Dependencies</h4>
        <p>Use Bun (recommended) or npm to install all packages.</p>
        <code class="sinline">bun install
# or
npm install</code>
      </div>
    </div>
    <div class="step">
      <div class="snum">3</div>
      <div class="sbody">
        <h4>Configure Environment Variables</h4>
        <p>Update <code>.env</code> with your Supabase project credentials.</p>
        <code class="sinline">VITE_SUPABASE_URL="https://&lt;your-project&gt;.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="&lt;your-anon-key&gt;"
SUPABASE_PROJECT_ID="&lt;your-project-id&gt;"</code>
      </div>
    </div>
    <div class="step">
      <div class="snum">4</div>
      <div class="sbody">
        <h4>Run Database Migrations</h4>
        <p>Push all migrations to create tables, enums, triggers, and RLS policies.</p>
        <code class="sinline">npx supabase link --project-ref &lt;project-id&gt;
npx supabase db push</code>
      </div>
    </div>
    <div class="step">
      <div class="snum">5</div>
      <div class="sbody">
        <h4>Start the Development Server</h4>
        <p>Launch Vite with HMR. App available at <strong>http://localhost:3000</strong>.</p>
        <code class="sinline">npm run dev</code>
      </div>
    </div>
    <div class="step">
      <div class="snum">6</div>
      <div class="sbody">
        <h4>Build &amp; Deploy to Cloudflare</h4>
        <p>Produce a Workers-compatible bundle and deploy via Wrangler.</p>
        <code class="sinline">npm run build
npx wrangler deploy</code>
      </div>
    </div>
  </div>
</div>

<!-- ══ SCRIPTS ══ -->
<div class="section">
  <div class="section-eye">§ 11 — Scripts</div>
  <h2><span class="h2-icon">⚡</span> Available Scripts</h2>
  <table class="tbl">
    <thead><tr><th>Command</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><code>npm run dev</code></td><td>Start Vite dev server with hot module replacement</td></tr>
      <tr><td><code>npm run build</code></td><td>Production build targeting Cloudflare Workers runtime</td></tr>
      <tr><td><code>npm run build:dev</code></td><td>Development-mode build for testing edge behaviour locally</td></tr>
      <tr><td><code>npm run preview</code></td><td>Serve the production build locally via Vite preview</td></tr>
      <tr><td><code>npm run lint</code></td><td>Run ESLint 9 across all TypeScript and TSX source files</td></tr>
      <tr><td><code>npm run format</code></td><td>Auto-format all files with Prettier 3</td></tr>
    </tbody>
  </table>
</div>

<!-- ══ EXPORT ══ -->
<div class="section">
  <div class="section-eye">§ 12 — Export</div>
  <h2><span class="h2-icon">📤</span> Export Capabilities</h2>
  <p>The reusable export engine in <code>src/lib/export.ts</code> powers downloads from any data table in the app.</p>
  <div class="grid g2">
    <div class="card">
      <div class="card-ico">📄</div>
      <h3>PDF Export — <em>jsPDF + autoTable</em></h3>
      <p>Generates branded PDFs with institution name, gold accent colours, and auto-sized table columns. Supports portrait and landscape orientation, optional subtitles for filter context, and custom per-column value accessors.</p>
    </div>
    <div class="card">
      <div class="card-ico">📊</div>
      <h3>CSV Export</h3>
      <p>UTF-8 BOM–prefixed files compatible with Excel, Google Sheets, and all major analytics tools. Fully RFC 4180 compliant — handles quoted fields, embedded commas, and multi-line cell values automatically.</p>
    </div>
  </div>
</div>

<!-- ══ CONTRIBUTING ══ -->
<div class="section">
  <div class="section-eye">§ 13 — Contributing</div>
  <h2><span class="h2-icon">🤝</span> Contributing</h2>
  <ul class="nice">
    <li><strong>Fork</strong> the repository and create a feature branch from <code>main</code>.</li>
    <li>Follow <strong>TypeScript strict mode</strong> conventions — no <code>any</code> escapes.</li>
    <li>Run <code>npm run lint</code> and <code>npm run format</code> before opening a pull request.</li>
    <li>New database columns must come with a <strong>Supabase migration file</strong> — never edit existing migrations.</li>
    <li>UI changes must respect the existing <strong>design tokens</strong> (fern / sprout / soil palette in <code>styles.css</code>).</li>
    <li>Open a <strong>GitHub Issue</strong> before starting large feature additions to align on approach.</li>
  </ul>
</div>

<!-- ══ LICENCE ══ -->
<div class="section">
  <div class="section-eye">§ 14 — Licence</div>
  <h2><span class="h2-icon">📜</span> Licence</h2>
  <p>
    This project is released under the <strong>MIT Licence</strong>.
    You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the software, provided the original copyright notice and permission notice
    are retained in all copies or substantial portions.
  </p>
</div>

<hr class="div"/>

<footer>
  <strong>Campus Compass Elite WorkPlus</strong> &nbsp;·&nbsp; Verdant Academy Student Management System<br>
  React 19 &nbsp;·&nbsp; TanStack Router &nbsp;·&nbsp; Supabase &nbsp;·&nbsp; Cloudflare Workers &nbsp;·&nbsp; TypeScript 5.8<br><br>
  README generated from source analysis of <em>campus-compass-elite-workplus-main.zip</em>
</footer>

</div>
</body>
</html>
