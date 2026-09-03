-- ClearK12 Studio :: the shared reference layer
-- Run once in the Supabase SQL editor. Pure ASCII on purpose.
--
-- One schema, read by every product. Standards, topics and vocabulary are
-- curated slowly and consumed everywhere, so they live in exactly one place;
-- each product keeps its own content and its own student data in its own
-- schema, because a bad migration in one product must not reach the others.
--
-- Products READ core and WRITE only their own schema.
--
-- Every table carries "verified". Data lifted from screenshots, partial imports
-- and half-finished sourcing is normal; pretending it is finished is not. An
-- unverified row is usable and visibly provisional.

create schema if not exists core;

-- A standard, at the grain content is actually tagged at.
--
-- The breakout IS the row: 3.11D (xi) is what a worksheet teaches, not 3.11D.
-- Splitting standards from breakouts across two tables made every tag a join
-- and every query awkward, for a hierarchy nobody needs to walk. parent_id
-- keeps the grouping available without paying for it on every read.
--
-- standard_name is what makes this usable by a person: a publisher looks for
-- "Pronouns", not for 3.11D (vii).
create table if not exists core.standards (
  id            bigserial primary key,
  state         text not null default 'TX',    -- stored as a code, shown as "Texas"
  subject       text not null,                 -- ELAR | Math | Science | Social Studies
  grade         text not null,                 -- 'K' through '12', text so K is not a special case
  domain        text not null default '',      -- Composition, Multiple Genres, ...
  standard_id   text not null,                 -- '3.11D (xi)'
  standard_name text not null default '',      -- 'Spelling'
  description   text not null default '',      -- verbatim state language
  parent_id     text,                          -- '3.11D'
  kind          text,                          -- readiness | supporting | process
  source_url    text,
  verified      boolean not null default false,
  updated_at    timestamptz not null default now(),
  unique (state, subject, grade, standard_id)
);

-- How a year of teaching is grouped. Products hang their content off these.
create table if not exists core.topics (
  id           bigserial primary key,
  state        text not null default 'TX',
  subject      text not null,
  grade        text not null,
  name         text not null,
  domain       text not null,
  round        int,
  codes_raw    text,                          -- as written on the planning board
  lesson_count int,
  sort         int not null default 0,
  verified     boolean not null default false,
  unique (state, subject, grade, name)
);

-- One word, one meaning, everywhere. A term is not per-state: the definition a
-- child reads should not change because the standard code did.
create table if not exists core.vocab (
  id         bigserial primary key,
  term       text not null,
  subject    text,
  definition text not null default '',
  example    text,
  codes      jsonb not null default '[]'::jsonb,
  source     text,
  verified   boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (term, subject)
);

-- The same term, said the way a given grade can hear it.
create table if not exists core.vocab_grade (
  id         bigserial primary key,
  vocab_id   bigint not null references core.vocab(id) on delete cascade,
  grade      text not null,
  definition text not null default '',
  example    text,
  status     text not null default 'draft',
  unique (vocab_id, grade)
);

-- What exists, where it runs, and who owns it.
create table if not exists core.tools (
  id       text primary key,                  -- crystal_writing
  name     text not null,
  blurb    text,
  url      text,
  repo     text,
  status   text not null default 'active',    -- active | prototype | retired
  owner    text,
  sort     int not null default 0
);

-- Master cost log. Every product writes here so the total is answerable.
create table if not exists core.cost_log (
  id                 bigserial primary key,
  product            text not null,
  step               text,
  provider           text not null default '',
  model              text not null default '',
  input_tokens       int not null default 0,
  output_tokens      int not null default 0,
  cache_read_tokens  int not null default 0,
  cache_write_tokens int not null default 0,
  usd                numeric(12,6) not null default 0,
  ms                 int,
  ok                 boolean not null default true,
  note               text,
  created_at         timestamptz not null default now()
);

create index if not exists standards_browse_idx on core.standards (state, subject, grade, domain);
create index if not exists standards_name_idx   on core.standards (lower(standard_name));
create index if not exists standards_parent_idx on core.standards (parent_id);
create index if not exists topics_browse_idx    on core.topics (state, subject, grade);
create index if not exists vocab_term_idx       on core.vocab (lower(term));
create index if not exists cost_product_idx     on core.cost_log (product, created_at desc);

-- Same posture as the rest of the platform: RLS on, no policies, so the anon
-- key reads nothing. Products reach core through a server holding a key.
alter table core.standards          enable row level security;
alter table core.topics             enable row level security;
alter table core.vocab              enable row level security;
alter table core.vocab_grade        enable row level security;
alter table core.tools              enable row level security;
alter table core.cost_log           enable row level security;
