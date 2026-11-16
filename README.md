# MIVA Memes

An NGL-inspired anonymous submission site for a private group. Members can send text and optional images without creating an account. Submissions are private by default; only an authenticated admin can read the inbox.

## Stack
- Next.js 14 + TypeScript + Tailwind CSS
- Supabase Postgres + private Storage bucket + Auth

## Run locally
1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local` and add your Supabase project URL and anon key.
3. In Supabase SQL Editor, run `supabase/schema.sql`.
4. In Supabase Storage, confirm the private `submissions` bucket exists (the SQL creates it).
5. Create your admin user in Supabase Authentication. In that user's **app_metadata**, set `"role": "admin"` using a trusted admin method. Do not put service-role keys in this app.
6. `npm install`
7. `npm run dev`

Open http://localhost:3000.

## Important security notes
- Anonymous clients can INSERT submissions but cannot SELECT, UPDATE or DELETE them.
- The Storage bucket is private. Anonymous users can upload into it but cannot list or read objects. Only the admin role can read them.
- The admin role must be set in Supabase **app_metadata**, not user-editable `user_metadata`.
- This starter does not collect names, email addresses or profile details. Hosting/network providers may still retain technical logs, so don't advertise absolute anonymity.
- Before sharing widely, add CAPTCHA/Turnstile and server-side rate limiting, set upload size/type limits, and test RLS with separate anonymous and admin accounts.
- Keep all service-role keys server-side. Never commit `.env.local`.

## Initial scope
Private inbox and admin-controlled review. No public feed is enabled. Admin can copy a submission to share it elsewhere.
