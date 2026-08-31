# Deploying Coding Academy

This is a Next.js **server** app with a PostgreSQL database. It cannot run on
GitHub Pages (static hosting only). The simplest way to deploy it straight from a
GitHub repository — free, no credit card — is **Vercel + Neon**:

- **Vercel** builds and hosts the Next.js server, redeploying on every push.
- **Neon** is a free serverless PostgreSQL database (a connection string, nothing to run).

Anything that runs a Node server plus a Postgres URL works too (Render, Railway,
Fly.io, a VM). The steps below are for Vercel + Neon.

---

## 1. Push the code to GitHub

```bash
# from the coding-academy directory (it is its own git repo)
git remote add origin https://github.com/<you>/coding-academy.git
git push -u origin main
```

## 2. Create the database (Neon)

1. Sign up at <https://neon.com> (GitHub login, no card).
2. Create a project — pick a region near your users.
3. Copy the **pooled** connection string. It looks like:
   `postgresql://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require`

## 3. Load the schema and seed data

Run this once from your machine, pointing at Neon:

```bash
DATABASE_URL="<neon pooled string>" npx prisma migrate deploy

DATABASE_URL="<neon pooled string>" \
  SEED_ADMIN_EMAIL="you@example.com" \
  SEED_ADMIN_PASSWORD="<your admin password>" \
  SEED_ADMIN_NAME="Your Name" \
  npx tsx prisma/seed.ts
```

(Vercel also runs `prisma migrate deploy` on every build — see `vercel.json` — so
new migrations apply automatically. The seed is a one-off.)

## 4. Import the repo into Vercel

1. Sign up at <https://vercel.com> with GitHub (no card for the Hobby plan).
2. **Add New → Project → import `coding-academy`.** Vercel detects Next.js; leave
   the build settings as they are (`vercel.json` sets the build command).
3. Add **Environment Variables** (Production + Preview):

   | Name                   | Value                                                          |
   | ---------------------- | ------------------------------------------------------------- |
   | `DATABASE_URL`         | the Neon pooled connection string                              |
   | `AUTH_SECRET`          | output of `openssl rand -base64 48`                            |
   | `NEXT_PUBLIC_SITE_URL` | your Vercel URL, e.g. `https://coding-academy.vercel.app` (set after the first deploy, then redeploy) |

4. **Deploy.**

## 5. Set the canonical URL

After the first deploy Vercel shows your URL. Put it in `NEXT_PUBLIC_SITE_URL`
(Settings → Environment Variables), then **Redeploy** so canonical tags, the
sitemap, `robots.txt` and Open Graph point at the right origin.

## 6. Verify

- Open the URL — the three courses load.
- Sign in with the admin account from step 3; change the password from the account page.
- Check `<url>/robots.txt`, `<url>/sitemap.xml`, `<url>/llms.txt`.
- Create a student, pass a module assessment, confirm the next module unlocks.

## Custom domain

Vercel → Settings → Domains → add your domain and follow the DNS instructions.
Then set `NEXT_PUBLIC_SITE_URL` to `https://yourdomain.com` and redeploy.

## Ongoing

- Every push to `main` triggers a build + deploy; pull requests get preview URLs.
- New DB migration: `npm run db:migrate` locally, commit it, push — Vercel's build
  runs `prisma migrate deploy` against Neon before building.
- Rollbacks and logs: the Vercel dashboard.
- The in-memory rate limiter (`src/lib/rate-limit.ts`) is per-instance. For heavy
  traffic across many serverless instances, swap it for Upstash Redis.
