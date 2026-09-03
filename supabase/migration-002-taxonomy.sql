-- Crystal Writing :: organise the library by state, grade and domain
-- Run this after schema.sql. Pure ASCII on purpose.
--
-- The library is browsed the way the work is divided: a state, a grade band, and
-- one of that state's domains. Texas content is what supplies LoneStar CR.

alter table public.paths add column if not exists state  text;
alter table public.paths add column if not exists domain text;

create index if not exists paths_browse_idx
  on public.paths (state, grade, domain);

-- Anything already loaded was Texas content.
update public.paths set state = 'TX' where state is null;
