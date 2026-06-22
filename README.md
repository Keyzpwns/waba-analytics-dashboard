# WABA Performance Signal

Weekly social analytics dashboard for We Are Black America (Instagram, TikTok, YouTube, Facebook). Reads from a Supabase database that is populated weekly by an n8n workflow pulling from Buffer.

## Stack

- React 18 + Vite + Tailwind CSS
- Supabase (auth + database)
- Recharts
- Deployed on Netlify

## Setup

```bash
npm install
npm run dev
```

Environment variables (already configured in Netlify, set locally via `.env`):

```
VITE_SUPABASE_URL=https://mcuyupghcbdxbkjefdjb.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

## Deploy

This repo is linked to the `waba-analytics` Netlify site. Pushes to `main` auto-deploy.

Build command: `npm run build` / Publish directory: `dist`

## Data model

- `weekly_reports` - one row per week (week_start, week_end, totals_by_platform, ai_report)
- `weekly_posts` - one row per post (foreign key to a report)

Both tables have RLS enabled - only authenticated Supabase users can read; only the n8n service-role key can write.

## Access

Access is invite-only.

1. In Supabase, turn off public signups: Authentication -> Providers -> Email -> disable "Allow new users to sign up".
2. Run `supabase/migrations/202606220001_invite_only_access.sql` in the Supabase SQL editor.
3. Confirm the owner email exists in `public.app_members`:

```sql
insert into public.app_members (email, invited_by)
values ('keyshawn@weareblackamerica.com', 'owner')
on conflict (email) do update set active = true;
```

To invite someone, send an invitation from the Supabase Auth dashboard, then add the same email to `public.app_members`. To remove access, set `active = false` for that email or delete the row.

The dashboard checks `app_members` after sign-in, and database RLS restricts `weekly_reports` and `weekly_posts` reads to active invited members.
