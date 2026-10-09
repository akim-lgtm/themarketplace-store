# Supabase account setup

1. In the Supabase SQL Editor for this project, run [`supabase-schema.sql`](./supabase-schema.sql).
2. In **Authentication → URL Configuration**, allow the local preview callback `http://127.0.0.1:8765/index.html` and the deployed site's `index.html` URL. Supabase uses these URLs for email confirmation and password recovery.
3. Enable email confirmation in **Authentication → Providers → Email** and configure SMTP for production email delivery. Supabase's default email service is for testing and is rate-limited.
4. Keep the project URL and publishable key in [`supabase-config.js`](./supabase-config.js). Never put a `service_role` key, database password, or other secret in browser code.

The storefront uses Supabase Auth, a row-level-secured `profiles` table, and a private `profile-media` storage bucket. Profile pictures and seller banners are limited to JPG, PNG, WebP, or AVIF; uploaded image limits are 5 MB and 8 MB respectively. Existing local demo accounts are not migrated; shoppers and sellers must create Supabase accounts.
