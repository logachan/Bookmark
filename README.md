🚀 Smart Bookmark Manager

A simple real-time bookmark manager built with:

Next.js (App Router)

Supabase (Auth + Database + Realtime)

Tailwind CSS

Deployed on Vercel

🌍 Live Demo

🔗 Live URL: https://your-app-name.vercel.app
🔗 GitHub Repo: https://github.com/your-username/smart-bookmark-app

✨ Features

✅ Google OAuth Login (No email/password)
✅ Add bookmark (Title + URL)
✅ Delete bookmark
✅ Private bookmarks per user (RLS enabled)
✅ Real-time updates across multiple tabs
✅ Fully deployed on Vercel

🚀 Deployment

The app is deployed on Vercel.

Deployment steps:

Push project to GitHub

Import repository into Vercel

Add environment variables:

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

Update Supabase:

Add Vercel domain to Site URL

Add Redirect URL for OAuth

⚠️ Problems Faced & Solutions

This section explains real-world issues encountered during development.

1️⃣ Problem: Google OAuth Redirect Error

Issue:
Redirect mismatch error during login.

Cause:
Supabase OAuth redirect URL did not match Vercel deployment URL.

Solution:
Added correct production URL in:
Supabase → Authentication → URL Configuration

2️⃣ Problem: RLS Blocking Inserts

Issue:
Insert operation failed silently.

Cause:
RLS was enabled but WITH CHECK condition was missing.

Solution:
Added:

with check (auth.uid() = user_id)

3️⃣ Problem: Real-time Not Updating

Issue:
Changes were not reflected across tabs.

Cause:
Replication was not enabled for the table.

Solution:
Enabled Realtime replication in:
Supabase → Database → Replication
