# Moving Crystal Writing content into the new CMS

This repo was the staging ground. The content in it is finished and should move;
the plumbing around it should not. This is the list of what to lift and the two
rules the new system must keep so that lifting is mechanical.

## Lift these

| What | Where | Why it matters |
|---|---|---|
| The four converted topics | `data/topic-*.json` | The actual content. Complete, proofed clean, standards verified against the catalog. |
| The bundled copy of the same | `data/topics.mjs` | Generated from the JSON above. Regenerate rather than edit. |
| Solution videos | `public/solutions/*.mp4` | 132 recordings, compressed (CRF 30, 64k mono AAC). Filename = video id. |
| Worksheet art | `public/art/*.webp` | 19 illustrations trimmed from the decks, 480px tall. |
| The proof engine | `lib/proof/checks.mjs` | Pure functions, no dependency on this backend. Decides what may publish. |
| Taxonomy | `lib/content/taxonomy.mjs` | States, domains, grades, the TEKS code normalizer. |
| Pipeline | `lib/content/pipeline.mjs` | The six stages and what each means. |
| Student renderers | `src/student/ProofRoom.jsx` | Every activity kind, the passage container, the path. Consoles preview through these so preview cannot drift from what students see. |
| The importer | `src/publisher/folderImport.js` | Reads a topic folder in the browser: unzips .pptx natively, extracts text and art. |
| Video compression | `tools/compress-videos.sh` | Halves a recording without touching the handwriting. Uses the ffmpeg bundled with imageio-ffmpeg. |
| TEKS parser | in `cleark12-studio`, `tools/parse-teks.py` | Already moved. Two parser traps are documented in its header. |

## Leave these behind

`server/index.mjs`, `lib/server/store.mjs`, `lib/server/library.mjs`, `api/library.js`,
`vercel.json`, the Supabase `paths` and `path_versions` tables. That was the
scaffolding for proving the workflow. The new system has its own.

## Two invariants the CMS must keep

**1. A video id is its filename.** Content says `"video": "arg_claim-1"`. It never
says where the file lives. Put the files anywhere — R2, Supabase Storage, a CDN —
and resolve `id -> URL` in one place. Rename a file and every worksheet that
points at it breaks silently, because nothing checks that a video exists at
render time; proofing only warns.

**2. Content ids are stable.** `topic_argumentative`, `arg_claim`, `arg_sb_claim`,
`arg_full`. Skill builders are keyed by the id of the core worksheet they follow
(`skillBuilders.arg_claim`). Approvals, flags, student progress and the
core -> skill-builder link all hang off these. Re-generating ids on import would
orphan all of it.

## The shape, briefly

```
topic
  id, title, short, state, grade, domain, standards[], blurb, icon
  core[]           worksheets in path order
  skillBuilders{}  keyed by core worksheet id; one per core worksheet
  full             the capstone worksheet

worksheet
  id, title, skill, standards[], flag?, approved?, source?
  activities[]     played in order, scored as one piece of work

activity            kind: hunt | choose | fix | maze | compose | passage
  brief, hint, directions?, flag?, approved?, art?, artSide?, artMirror?
  hunt/choose  text with [[wrong|right]] markup, videos[] one per error
  fix          bank[], mode type|select|drag, items[{given, answer, options?, video?, flag?}]
  maze         grid[], gates{A..J: {wrong, right}}, video
  compose      items[{prompt, pieces[], checks[{label, rule}], model}]
  passage      sentences[], questions[{kind pick|blank|write, sentence, ask, ..., video?, flag?}]
```

`checks` rules are evaluated by `checkRule` in `server/peerTasks.mjs` — lift that
function too if compose/write questions keep their live checking.

## What the videos are, for the record

Per-item recordings of the paper worksheet being marked. They were the answer
key for everything the decks did not state: which words were the errors, which
option was circled, what the author meant a written answer to say. Where a
question has a video, a wrong answer plays it.

## Known gaps carried forward

- `standard_name` in the TEKS catalog is derived from the wording, not authored.
  Kennady has a dataset with real names; it has not been found yet.
- Edit Drafts capstone question 2 carries a flag: the paper calls it a pronoun
  error and it is a preposition. Someone decides whether to fix the paper.
- Three source-deck errors in Conjunctive Adverbs are documented in the commit
  that converted it, not fixed.
- Art uploaded through the browser importer cannot be stored on a serverless
  host. Art I attached by hand is in the repo and fine.
