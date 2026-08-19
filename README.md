# LoneStar CR · The Writing Studio

A prototype reconception of **LoneStar CR** — from a narrow SCR/ECR test-prep tool into a **digital writer's workshop**, where SCR/ECR is one module inside a real writing-development program.

> **Guiding principle:** *Feedback develops the writer, not the paper.* The AI conferring partner asks Socratic questions and **never writes or rewrites** the student's work — which is also the academic-integrity story districts will grill us on.

This is an early, clickable prototype for team feedback — not production code.

---

## What's in it

### Student experience
- **My Writing** — sortable/filterable assignment list (search, format, type, due date), each card tagged **SCR** or **ECR**.
  - **Ways to Write** — Quick Write, Free Write, and a **Fluency Game** (Sentence Stretch).
  - **Peer Revision Challenge** — revise a robot's intentionally weak draft (not the student's own → integrity-safe practice).
  - **Luna's Writing Nook** — condensed scope-&-sequence spine (SCR → ECR → Stellar Writers).
- **The Writing Studio** — draft editor + **version history**, an **AI Socratic conference** (asks, never writes; redirects "just write it for me"), and **6-Traits feedback**.
- **My Growth** — selectable focus **goals** (5 presets + custom, goal → coins on completion), **monthly progress** toggled by SCR/ECR, **trait snapshot**, **writing habits**, a **growth story** (Draft 1 → latest), a **Share Wall**, a **next-step nudge**, and **teacher shout-outs**.
- **ClassCade** hook — coins reward the *behaviors that make writers* (drafting, conferring, revising, keeping the pen), never the grade.

> **V1 note:** this fork is the **student experience only** — the teacher views were removed while they're out of scope, and the dashboard no longer runs a weekday mission path: students land straight on the open dashboard with every option available.

---

## Running it locally

```bash
npm install
npm run dev
```

Then open **http://localhost:5173**. The app opens as the student (Kayla Scott); the floating control bottom-left resets the demo data.

`npm run dev` starts two things together:
- the **Vite** frontend on `:5173`
- a tiny zero-dependency **Node API** on `:8788` (Vite proxies `/api` to it)

> If Vite fails to start on a fresh install, run `npm rebuild esbuild` once, then `npm run dev` again.

### The AI conference (optional but recommended)
Out of the box the conference runs on a **scripted fallback** so the whole UX is explorable with no setup. To enable **live Claude** conferences and trait feedback:

```bash
cp .env.example .env
# add your key:  ANTHROPIC_API_KEY=sk-ant-...
```

Restart `npm run dev`. The conference badge flips from "● scripted" to "● live (claude-sonnet-5)". The API key stays server-side only and `.env` is git-ignored.

---

## Architecture

| Layer | What |
|------|------|
| Frontend | React + Vite (`src/`) |
| Backend | Zero-dependency Node HTTP server (`server/`) — holds the API key and **enforces the Socratic guardrails server-side** so a student can't bypass them |
| AI | `claude-sonnet-5` via the Anthropic API; graceful scripted fallback with no key |
| Data | In-memory + JSON file (`server/data.json`, git-ignored); seeded demo roster. `POST /api/reset` restores the seed |

The Socratic system prompt and the 6-Traits prompt live in `server/prompts.mjs` — the pedagogical core.

---

*Prototype built for internal ClearK12 review. References released TEA item formats only — never secured/live test content.*
