<div align="center">

<img src="https://img.shields.io/badge/Campus%20Compass-Elite%20WorkPlus-10b981?style=for-the-badge&labelColor=0f172a" alt="Campus Compass Elite WorkPlus" />

<h1>🎓 Campus Compass Elite WorkPlus</h1>

<p><strong>A modern, full-stack student management system for academic institutions.</strong><br/>
Built with TanStack Start · React 19 · TypeScript · Supabase · Tailwind CSS v4 · Cloudflare Workers</p>

<p>
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?logo=tailwindcss&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3ecf8e?logo=supabase&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/Cloudflare-Workers-f38020?logo=cloudflare&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white&style=flat-square" />
</p>

</div>

---

## ✨ Overview

Campus Compass Elite WorkPlus is a production-ready academic management platform. It gives **administrators** a live command centre, **teachers** a focused classroom view, and **students** a personal self-service portal — all from a single codebase deployed to the edge.

---

## 🚀 Features

<details open>
<summary><strong>🔐 Role-Based Access Control</strong></summary>

Three distinct roles — `admin`, `teacher`, `student` — each with a tailored layout, route-level guards, and Supabase Row Level Security enforced all the way down to the database.

</details>

<details open>
<summary><strong>📊 Admin Dashboard</strong></summary>

Real-time KPI cards for total enrollment, active student rate, fees collected, and active courses — powered by Supabase Realtime subscriptions so the numbers stay live without a page refresh.

</details>

<details open>
<summary><strong>🎓 Student Management</strong></summary>

Full CRUD for student records: personal details, guardian contacts, course enrollment, GPA tracking, and status management.

</details>

<details open>
<summary><strong>👩‍🏫 Teacher & Staff Directory</strong></summary>

Staff profiles covering department, title, qualifications, specialization, and office location.

</details>

<details open>
<summary><strong>📚 Course Management</strong></summary>

Course catalogue with credits, scheduling, capacity, semester, and instructor assignment. Displays live enrollment counts.

</details>

<details open>
<summary><strong>📋 Attendance Tracking</strong></summary>

Daily attendance logging per student per course. Bulk entry with Present / Late / Absent cycling. Fully exportable.

</details>

<details open>
<summary><strong>📝 Exams & Grades</strong></summary>

Schedule exams, enter scores per student, and auto-compute letter grades. Supports bulk entry and export.

</details>

<details open>
<summary><strong>💳 Fee Management</strong></summary>

Invoice tracking with Paid / Pending / Overdue status, due dates, payment method recording, and per-term summary statistics.

</details>

<details open>
<summary><strong>📤 Export Anywhere (PDF & CSV)</strong></summary>

Every major data table ships with one-click export to a branded PDF (via jsPDF + jspdf-autotable) or a UTF-8 CSV ready for Excel.

</details>

**Plus:** Library catalogue · Announcements with priority & pinning · Academic Calendar · Aggregated Reports · Teacher "My Classes" view · Student self-service portal

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [TanStack Start](https://tanstack.com/start) — React 19, file-based SSR routing |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui + Radix UI primitives |
| **Backend / Auth / DB** | [Supabase](https://supabase.com) — PostgreSQL, Auth, Realtime, RLS |
| **Data Fetching** | TanStack Query v5 |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **PDF Export** | jsPDF + jspdf-autotable |
| **Build Tool** | Vite 7 |
| **Deployment** | Cloudflare Workers (`@cloudflare/vite-plugin`) |
| **Package Manager** | Bun (npm lockfile also committed) |

---

## 📁 Project Structure

```
campus-compass-elite-workplus/
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui component library
│   │   ├── AppShell.tsx         # Sidebar navigation shell
│   │   ├── ExportMenu.tsx       # PDF / CSV export widget
│   │   ├── LoadingScreen.tsx
│   │   └── Modal.tsx
│   ├── hooks/
│   │   └── use-mobile.tsx
│   ├── integrations/
│   │   └── supabase/            # Client, server client, auth middleware, generated types
│   ├── lib/
│   │   ├── api.ts               # All data-fetching hooks & mutations
│   │   ├── auth.tsx             # AuthProvider + useAuth hook
│   │   ├── export.ts            # PDF / CSV export utilities
│   │   └── utils.ts
│   └── routes/                  # File-based pages (TanStack Router)
│       ├── index.tsx            # Admin dashboard
│       ├── students.tsx
│       ├── teachers.tsx
│       ├── courses.tsx
│       ├── attendance.tsx
│       ├── exams.tsx
│       ├── fees.tsx
│       ├── library.tsx
│       ├── announcements.tsx
│       ├── calendar.tsx
│       ├── reports.tsx
│       ├── my-classes.tsx       # Teacher view
│       ├── me.tsx               # Student self-service
│       ├── login.tsx / signup.tsx
│       └── ...
└── supabase/
    ├── config.toml
    └── migrations/              # Versioned SQL migrations
```

---

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+ or [Bun](https://bun.sh)
- A [Supabase](https://supabase.com) project
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) *(optional — for Cloudflare deployment)*

### 1 · Clone

```bash
git clone https://github.com/your-username/campus-compass-elite-workplus.git
cd campus-compass-elite-workplus
```

### 2 · Install dependencies

```bash
bun install
# or
npm install
```

### 3 · Configure environment variables

Create a `.env` file at the project root. **Never commit this file.**

```env
SUPABASE_PROJECT_ID=your_project_id
SUPABASE_URL=https://your_project_id.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_anon_public_key

VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=https://your_project_id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_public_key
```

> **Why two sets?** The server runtime reads the unprefixed keys; Vite exposes the `VITE_*` ones to the browser bundle.

### 4 · Apply database migrations

```bash
npx supabase link --project-ref your_project_id
npx supabase db push
```

This creates all tables, enums, RLS policies, and triggers:

| Schema object | Purpose |
|---|---|
| `profiles`, `user_roles` | Auth identity & role assignment |
| `students`, `teachers` | People records |
| `courses`, `attendance` | Academic data |
| `exams`, `exam_roster` | Assessment & grading |
| `fees`, `books` | Finance & library |
| `announcements`, `calendar_events` | Communication |

### 5 · Start the dev server

```bash
bun run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🧰 Scripts

| Command | Description |
|---|---|
| `dev` | Start Vite dev server with HMR |
| `build` | Production build |
| `build:dev` | Development build (unminified) |
| `preview` | Preview production build locally |
| `lint` | Run ESLint |
| `format` | Run Prettier across the codebase |

---

## 🔑 Authentication & Roles

Every new signup is automatically assigned the `student` role via a Postgres trigger. Admins can promote users via the `user_roles` table.

| Role | Lands on | Can access |
|---|---|---|
| `admin` | `/` Dashboard | Everything |
| `teacher` | `/my-classes` | Assigned courses & students |
| `student` | `/me` | Own profile, grades, fees, attendance |

---

## ☁️ Deployment

### Cloudflare Workers

The project ships with `wrangler.jsonc` pre-configured.

```bash
bun run build
npx wrangler deploy
```

Set your Supabase credentials as [Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/):

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_PUBLISHABLE_KEY
```

---

## 🌍 Environment Variable Reference

| Variable | Description |
|---|---|
| `SUPABASE_PROJECT_ID` | Supabase project reference ID |
| `SUPABASE_URL` | Supabase project REST URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase `anon` public key |
| `VITE_SUPABASE_PROJECT_ID` | Same — browser-exposed via Vite |
| `VITE_SUPABASE_URL` | Same — browser-exposed via Vite |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Same — browser-exposed via Vite |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch → `git checkout -b feature/your-feature`
3. Commit using conventional commits → `git commit -m "feat: add your feature"`
4. Push → `git push origin feature/your-feature`
5. Open a Pull Request

Please run `npm run lint && npm run format` before submitting.

---

## 📄 License

This project is private. All rights reserved.

---

<div align="center">
  <sub>Built with ❤️ using TanStack Start + Supabase</sub>
</div>
