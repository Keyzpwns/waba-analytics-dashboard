-- Remove public write paths. OpenRouter ingestion should use a backend/service role.

alter table public.ai_news enable row level security;
alter table public.digests enable row level security;
alter table public.models enable row level security;
alter table public.workflows enable row level security;

drop policy if exists "anon insert news" on public.ai_news;
drop policy if exists "anon update news" on public.ai_news;
drop policy if exists "anon insert digests" on public.digests;
drop policy if exists "anon update digests" on public.digests;
drop policy if exists "anon insert models" on public.models;
drop policy if exists "anon update models" on public.models;
drop policy if exists "public insert workflows" on public.workflows;
drop policy if exists "public update workflows" on public.workflows;

revoke all on table public.ai_news from anon, authenticated;
revoke all on table public.digests from anon, authenticated;
revoke all on table public.models from anon, authenticated;
revoke all on table public.workflows from anon, authenticated;

grant select on table public.ai_news to anon, authenticated;
grant select on table public.digests to anon, authenticated;
grant select on table public.models to anon, authenticated;
grant select on table public.workflows to anon, authenticated;

revoke all on table public.app_members from anon, authenticated;
revoke all on table public.weekly_reports from anon, authenticated;
revoke all on table public.weekly_posts from anon, authenticated;

grant select on table public.app_members to authenticated;
grant select on table public.weekly_reports to authenticated;
grant select on table public.weekly_posts to authenticated;

drop policy if exists "Members can read their own active invite" on public.app_members;
create policy "Members can read their own active invite"
on public.app_members
for select
to authenticated
using (
  active = true
  and email = lower(((select auth.jwt()) ->> 'email'))::citext
);

drop policy if exists "Invited members can read weekly reports" on public.weekly_reports;
create policy "Invited members can read weekly reports"
on public.weekly_reports
as restrictive
for select
to authenticated
using (
  exists (
    select 1
    from public.app_members
    where app_members.email = lower(((select auth.jwt()) ->> 'email'))::citext
      and app_members.active = true
  )
);

drop policy if exists "Invited members can read weekly posts" on public.weekly_posts;
create policy "Invited members can read weekly posts"
on public.weekly_posts
as restrictive
for select
to authenticated
using (
  exists (
    select 1
    from public.app_members
    where app_members.email = lower(((select auth.jwt()) ->> 'email'))::citext
      and app_members.active = true
  )
);
