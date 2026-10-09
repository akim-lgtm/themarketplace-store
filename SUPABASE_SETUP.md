# Supabase account setup

1. **Completed for the current Supabase project:** [`supabase-schema.sql`](./supabase-schema.sql) was run in its SQL Editor. The `profiles` table, row-level security, profile policies, private storage bucket, and image access policies were verified.
2. **Completed for local preview:** Supabase **Authentication → URL Configuration** now uses `http://127.0.0.1:8765` as the Site URL and allows `http://127.0.0.1:8765/index.html` as an auth redirect.
3. GitHub Pages deploys the repository root using [`.github/workflows/pages.yml`](./.github/workflows/pages.yml). The intended test URL is `https://mthulisisibanda.github.io/nova-muse-store/`.
4. **Before using Supabase Auth on the deployed site:** set the Supabase Site URL to `https://mthulisisibanda.github.io/nova-muse-store` and add `https://mthulisisibanda.github.io/nova-muse-store/index.html` to the allowed Redirect URLs. The localhost callback will not serve the deployed site.
5. **Before production email:** enable email confirmation in **Authentication → Providers → Email** and configure a production SMTP sender. Supabase's default email service is for testing and is rate-limited; SMTP host, port, sender address, and credentials must come from the chosen email provider.
6. Keep the project URL and publishable key in [`supabase-config.js`](./supabase-config.js). Never put a `service_role` key, database password, or other secret in browser code.

The storefront uses Supabase Auth, a row-level-secured `profiles` table, and a private `profile-media` storage bucket. Profile pictures and seller banners are limited to JPG, PNG, WebP, or AVIF; uploaded image limits are 5 MB and 8 MB respectively. Existing local demo accounts are not migrated; shoppers and sellers must create Supabase accounts. Test accounts and profile data created on the public test site use the real Supabase project.
