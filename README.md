# MIVA Memes

An anonymous submission site for the MIVA community. Members can send text and optional images without creating an account. Submissions are private by default; only authenticated admins can read the inbox.

## Stack
- Next.js 14 + TypeScript + Tailwind CSS
- Supabase Postgres + private Storage bucket + Auth
- Installable Progressive Web App (PWA)

## Run locally
1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local` and add your Supabase project URL and publishable/anon key.
3. In Supabase SQL Editor, run `supabase/schema.sql` if you have not already.
4. Create admin users in Supabase Authentication. In each user's **app_metadata**, set `{"role":"admin"}` using a trusted admin method. Never put service-role keys in this app.
5. `npm install`
6. `npm run dev`

Open http://localhost:3000.

## New features
- Light, dark, and black-and-white themes; the choice is saved on the device.
- Password visibility toggle on the admin sign-in form.
- PWA manifest, app icon, service worker, and install-app button.
- Offline caching is limited to the app shell and static assets. Sending submissions and accessing the inbox still require an internet connection.

## Install
For installation on a phone or computer, deploy the site over HTTPS. On supported browsers, use **Install app**. If the browser does not show the install prompt, open its menu and choose **Install app** or **Add to Home Screen**. Localhost is also suitable for local testing.

## Important security notes
- Anonymous clients can INSERT submissions but cannot SELECT, UPDATE or DELETE them.
- The Storage bucket is private. Anonymous users can upload but cannot list or read objects. Admins can read/delete them.
- The admin role must be set in Supabase **app_metadata**, not user-editable `user_metadata`.
- Hosting/network providers may retain technical logs; do not promise absolute anonymity.
- Add CAPTCHA/Turnstile and server-side rate limiting before distributing widely.
- Keep all service-role keys server-side. Never commit `.env.local`.
