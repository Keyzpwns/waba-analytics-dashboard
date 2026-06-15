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

Build command: `npm run build` · Publish directory: `dist`

## Data model

- `weekly_reports` — one row per week (week_start, week_end, totals_by_platform, ai_report)
- `weekly_posts` — one row per post (foreign key to a report)

Both tables have RLS enabled — only authenticated Supabase users can read; only the n8n service-role key can write.

## Access

Sign-up is open at /login. Create an account, then sign in. Add or remove users from the Supabase Auth dashboard.
