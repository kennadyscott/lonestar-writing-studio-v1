-- ClearK12 Studio :: a standard's identity includes its course
-- Run after core-schema.sql. Pure ASCII on purpose. Safe to run twice.
--
-- The same grade can carry more than one course. Grade 6 (Adopted 2012) and
-- Grade 6 Middle School Advanced Mathematics (Adopted 2025) both define 6.1A
-- with different wording, so keying on state+subject+grade+code alone makes the
-- second import overwrite the first and no one ever sees it happen.

alter table core.standards add column if not exists course  text not null default 'Grade Level';
alter table core.standards add column if not exists adopted text;

-- Drop the old four-column unique key, whatever Postgres named it.
do $$
declare c text;
begin
  select conname into c
    from pg_constraint
   where conrelid = 'core.standards'::regclass
     and contype = 'u'
     and array_length(conkey, 1) = 4;
  if c is not null then
    execute format('alter table core.standards drop constraint %I', c);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'standards_identity'
       and conrelid = 'core.standards'::regclass
  ) then
    alter table core.standards
      add constraint standards_identity
      unique (state, subject, grade, course, standard_id);
  end if;
end $$;

create index if not exists standards_course_idx on core.standards (state, subject, grade, course);
