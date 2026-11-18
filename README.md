# MIVA Memes

An anonymous submission site for the MIVA community. Members can send text and optional images without creating an account. Submissions are private by default; only authenticated admins can read the inbox.

## Stack
- Next.js 14 + TypeScript + Tailwind CSS
- Supabase Postgres + private Storage bucket + Auth
- Installable Progressive Web App (PWA)

## Run locally
1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local` and add your Supabase project URL and publishable/anon key.
3. Run `npm install`.
4. In Supabase SQL Editor, run `supabase/schema.sql` if you have not already.
5. Create admin users in Supabase Authentication. In each user's `app_metadata`, set `{"role":"admin"}` using a trusted admin method. Never put service-role keys in this app.
6. Run `npm run dev` and open http://localhost:3000.

## Added features
- Animated first-visit splash screen with scrambled-to-readable “Shhh- it's anonymous” text and loading line.
- Open Graph and Twitter large-image metadata for link previews.
- Admin-only share-card generator: turns a submission and its image attachment (when available) into a branded MIVA Memes PNG. Uses the device share sheet where supported; otherwise downloads the PNG.
- Better error details for anonymous submissions.
- Light, dark, and black-and-white themes; password visibility toggle; installable PWA.

## Important security notes
- Anonymous clients can INSERT submissions but cannot SELECT, UPDATE or DELETE them.
- The Storage bucket is private. Anonymous users can upload but cannot list or read objects. Admins can read/delete them.
- The admin role must be set in Supabase `app_metadata`, not user-editable `user_metadata`.
- Hosting/network providers may retain technical logs; do not promise absolute anonymity.
- Add CAPTCHA/Turnstile and server-side rate limiting before distributing widely.
- Keep all service-role keys server-side. Never commit `.env.local`.
