# Supabase account setup

1. **Account and seller setup:** [`supabase-schema.sql`](./supabase-schema.sql) has been applied to the current Supabase project. The `profiles` table, seller-owned `marketplace_listings` table, row-level security policies, private `profile-media` bucket, and public `listing-media` bucket are configured.
2. **Completed for local preview:** Supabase **Authentication → URL Configuration** now uses `http://127.0.0.1:8765` as the Site URL and allows `http://127.0.0.1:8765/index.html` as an auth redirect.
3. GitHub Pages deploys the repository root using [`.github/workflows/pages.yml`](./.github/workflows/pages.yml). The local project folder is `TheMarketPlace` and the GitHub repository is `akim-lgtm/themarketplace-store`; the public site URL is `https://akim-lgtm.github.io/themarketplace-store/`.
4. **Supabase URL configuration:** The new auth redirect `https://akim-lgtm.github.io/themarketplace-store/index.html` is allowed. The Site URL is still set to the old `https://akim-lgtm.github.io/nova-muse-store/`; update it to `https://akim-lgtm.github.io/themarketplace-store/` in Supabase **Authentication → URL Configuration**. The dashboard did not confirm or persist the Site URL change during this rename. The auth callback is built relative to the current page in [`account.js`](./account.js).
5. **Before production email:** enable email confirmation in **Authentication → Providers → Email** and configure a production SMTP sender. Supabase's default email service is for testing and is rate-limited; SMTP host, port, sender address, and credentials must come from the chosen email provider.
6. Keep the project URL and publishable key in [`supabase-config.js`](./supabase-config.js). Never put a `service_role` key, database password, or other secret in browser code.

The storefront uses Supabase Auth, a row-level-secured `profiles` table, and a private `profile-media` storage bucket. Profile pictures and seller banners are limited to JPG, PNG, WebP, or AVIF; uploaded image limits are 5 MB and 8 MB respectively. Existing local demo accounts are not migrated; shoppers and sellers must create Supabase accounts. Test accounts and profile data created on the public test site use the real Supabase project.

## Seller listing setup

For this Supabase project, the seller listing migration completed successfully in the SQL Editor. When setting up a different Supabase project, run the complete [`supabase-schema.sql`](./supabase-schema.sql) there. Seller tools require an account registered with the **Seller** account type; shopper accounts cannot create listings. Listing creation and image upload should be smoke-tested with a seller account before launch.
