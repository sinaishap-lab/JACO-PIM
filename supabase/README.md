# Supabase setup

JACO-PIM uses [Supabase](https://supabase.com) (managed Postgres + Storage) as
its backend. No Docker required for the hosted path.

## 1. Create a project

1. Sign in at [supabase.com](https://supabase.com) and create a new project.
2. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only secret!)
3. Copy `.env.example` to `.env.local` and paste the values in.

## 2. Apply the schema

Either paste `migrations/0001_init.sql` into the Supabase **SQL Editor** and run
it, or use the Supabase CLI:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

## 3. (Optional) Generate TypeScript types

Once the schema is applied, generate row-level types so the services are fully
typed end-to-end:

```bash
npx supabase gen types typescript --linked > lib/types/database.ts
```

## 4. Storage for media

A Storage bucket for product images will be added when the media module is
built. No action needed yet.

## Notes

- The `service_role` key bypasses Row Level Security. It is only read on the
  server (`lib/supabase/admin.ts`) and must never be exposed to the browser.
- Row Level Security policies are intentionally not defined yet — auth and
  multi-user access are a later milestone.
