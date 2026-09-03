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

---

## The Path Library (publisher platform)

Learning paths are content, not code. The library is where they get built,
proofed and approved, at `/publisher` (or `#publisher` on a static host).

**Draft → Proof → Approve.** A publisher edits a draft for as long as it takes.
Approving snapshots that draft into an immutable version and points the live
site at it. Students only ever read a version, so editing a path tomorrow cannot
change a worksheet under a class that is halfway through it today.

**Proofing is not a preview.** Every activity is walked the way a student walks
it: mazes are solved to confirm no gate can be sidestepped, every compose model
answer is run against the checks it will be graded by, and every fill-in is
tested for whether the sentence already gives the answer away. Problems come in
two weights — a **FIX** blocks approval because a student would hit a dead end;
a **LOOK** is a judgement call and never blocks. The publish route enforces the
same rule server-side, so it holds no matter who is calling.

### Running it

Local development needs nothing: with `SUPABASE_URL` unset the library stores
content in `server/library.json`, and with `PUBLISHER_PASSCODE` unset the console
is open. Open `/publisher` and press **Load the paths that ship with the app**.

### Deploying to Vercel + Supabase

1. Create a Supabase project and run `supabase/schema.sql` in its SQL editor.
2. In Vercel, set three environment variables:

   | Variable | Where it comes from |
   |---|---|
   | `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
   | `SUPABASE_SERVICE_KEY` | same page → `service_role` key |
   | `PUBLISHER_PASSCODE` | anything you choose; it is the shared console key |

   The service key is read only by the API route. It must never be given a
   `VITE_` prefix — that would compile it into the browser bundle.
3. Deploy. Open `/publisher`, enter the passcode, and load the shipped paths.

`GET /api/library/live` is the only public route; everything else requires the
key. Row level security is on for both tables with no policies at all, so the
anon key cannot read or write content even if it leaks.
