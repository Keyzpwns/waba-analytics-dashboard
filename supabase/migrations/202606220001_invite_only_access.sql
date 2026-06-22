create extension if not exists citext;

create table if not exists public.app_members (
  email citext primary key,
  active boolean not null default true,
  invited_by text,
  invited_at timestamptz not null default now()
);

alter table public.app_members enable row level security;

drop policy if exists "Members can read their own active invite" on public.app_members;
create policy "Members can read their own active invite"
on public.app_members
for select
to authenticated
using (
  active = true
  and email = lower(auth.jwt() ->> 'email')::citext
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
    where app_members.email = lower(auth.jwt() ->> 'email')::citext
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
    where app_members.email = lower(auth.jwt() ->> 'email')::citext
      and app_members.active = true
  )
);

insert into public.app_members (email, invited_by)
values ('keyshawn@weareblackamerica.com', 'owner')
on conflict (email) do update set active = true;
