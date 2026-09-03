-- LoneStar CR :: Path Library
-- Run this once in the Supabase SQL editor. Pure ASCII on purpose.
--
-- Two tables. A PATH is the working copy a publisher edits; a PATH_VERSION is
-- an approved snapshot that never changes. Students only ever read a version,
-- which is why editing a path cannot disturb a class that is partway through it.

create table if not exists public.paths (
  id            text primary key,
  title         text not null default 'Untitled learning path',
  short         text,
  grade         int,
  standards     text,
  blurb         text,
  icon          text,
  sort          int,
  status        text not null default 'draft'
                check (status in ('draft', 'in_review', 'published')),
  live_version  int,
  draft         jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.path_versions (
  id          bigserial primary key,
  path_id     text not null references public.paths(id) on delete cascade,
  version     int not null,
  content     jsonb not null,
  note        text,
  points      int,
  approved_by text,
  created_at  timestamptz not null default now(),
  unique (path_id, version)
);

create index if not exists path_versions_path_idx
  on public.path_versions (path_id, version desc);

-- Row level security ON with no policies at all, deliberately: the anon key
-- that ships in the browser can read and write nothing here. Every request goes
-- through an API route holding the service key, so there is one door and it is
-- on the server.
alter table public.paths enable row level security;
alter table public.path_versions enable row level security;
