-- Crystal Writing :: the publishing pipeline
-- Run after schema.sql. Pure ASCII on purpose. Safe to run twice.
--
-- A path's stage says where it is in someone's process, which is a different
-- question from whether it is sound. Proofing answers the second one and blocks
-- publishing on its own.

alter table public.paths drop constraint if exists paths_status_check;

update public.paths set status = 'reviewed' where status = 'in_review';
update public.paths set status = 'imported'
 where status is null or status not in ('imported','draft','reviewed','approved','qa','published');

alter table public.paths add constraint paths_status_check
  check (status in ('imported','draft','reviewed','approved','qa','published'));

create index if not exists paths_status_idx on public.paths (state, status);
