# Coding Academy

A working coding-education platform. Students create an account, pick a language
(Java, Python or HTML), and work through ordered modules. Each module ends with an
assessment; scoring **80% or higher** completes the module and unlocks the next one.
Content is managed through an admin area, not by editing source.

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Database:** PostgreSQL via Prisma ORM (local: docker-compose; production: Google Cloud SQL)
- **Styling:** Tailwind CSS v4, server-rendered syntax highlighting with Shiki
- **Auth:** first-party email/password with server-side sessions (bcrypt hashes, httpOnly cookies)
- **Deploy:** Firebase App Hosting — see [DEPLOY.md](DEPLOY.md)

---

## Quick start

```bash
npm install
docker compose up -d          # local PostgreSQL on :5432 (or use a native install)
cp .env.example .env          # then set AUTH_SECRET at least
npm run db:migrate            # apply the schema
npm run db:seed               # load the three courses + an admin account
npm run dev                   # http://localhost:3000
```

No Docker? Install PostgreSQL natively (`brew install postgresql@16 && brew services start postgresql@16`,
then `createdb codestart`) and point `DATABASE_URL` at it.

Seed accounts (change the password before any real deployment — see `.env`):

| Role  | Email                        | Password         |
| ----- | ---------------------------- | ---------------- |
| Admin | `admin@codingacademy.test`   | `Admin!Passw0rd` |

Students are created through the sign-up form.

---

## Scripts

| Command             | Purpose                                             |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Development server                                  |
| `npm run build`     | `prisma generate` + production build                |
| `npm start`         | Serve the production build                          |
| `npm run lint`      | ESLint                                              |
| `npm run typecheck` | `tsc --noEmit`                                      |
| `npm test`          | Vitest unit tests                                   |
| `npm run test:e2e`  | Playwright E2E (builds + seeds the `codestart_e2e` database on port 3100; set `E2E_DATABASE_URL` to override) |
| `npm run db:migrate`| Create/apply a dev migration                        |
| `npm run db:deploy` | Apply migrations in production (`prisma migrate deploy`) |
| `npm run db:seed`   | Seed courses + admin                                |
| `npm run db:reset`  | Drop and recreate the dev database                  |
| `npm run db:studio` | Prisma Studio                                       |

---

## 1. What was built

- Public marketing site: home, course catalogue, per-course outline, how-it-works, about, custom 404.
- Authentication: sign-up (with language choice), sign-in, sign-out, password change, session revocation.
- Student experience: dashboard, per-course view, module pages, readable lessons with
  syntax-highlighted code, module assessments, results with per-question explanations,
  progress tracking, multi-course enrolment, account settings.
- Server-enforced module progression (the 80% rule).
- Admin area: overview, student list + per-student progress, full CRUD for courses /
  modules / lessons / quizzes / questions, drag-free reordering, module-completion and
  course statistics, configurable pass mark.
- Technical SEO: per-page metadata, canonical URLs, Open Graph + Twitter cards, JSON-LD
  (`EducationalOrganization`, `WebSite`, `Course`, `BreadcrumbList`), `robots.txt`,
  `sitemap.xml`, `llms.txt`, generated favicon and social image.
- Security headers / CSP, rate limiting, server-side validation everywhere.
- Unit tests (Vitest) and end-to-end tests (Playwright).

## 2. Technology stack

| Layer            | Choice                                                             |
| ---------------- | ----------------------------------------------------------------- |
| Frontend         | Next.js 16 App Router, React 19 Server Components, Tailwind CSS v4 |
| Backend          | Next.js Route Handlers + Server Actions (Node runtime)             |
| ORM / DB         | Prisma 6 + `pg` driver adapter, PostgreSQL (Cloud SQL in prod, via the Cloud SQL connector) |
| Auth             | `bcryptjs` password hashing, DB-backed sessions, httpOnly cookies  |
| Validation       | Zod on every request body                                          |
| Markdown / code  | `markdown-it` (HTML disabled) + Shiki (build-time highlighting)    |
| Tests            | Vitest (unit), Playwright (E2E)                                    |

## 3. Database structure

Relational, defined in [`prisma/schema.prisma`](prisma/schema.prisma).

```
User ──< Session
User ──< Enrollment >── Course ──< Module ──< Lesson
User ──< ModuleProgress >── Module          Module ──1 Quiz ──< Question ──< AnswerOption
User ──< LessonProgress >── Lesson
User ──< QuizAttempt >── Quiz               QuizAttempt ──< AttemptAnswer >── Question / AnswerOption
AppSetting (single row: defaultPassingScore)
```

- `User.role` (`STUDENT` | `ADMIN`) is the only authorization signal.
- `User.activeCourseId` is the student's current learning path.
- `Module.passingScore` (default 80) is the pass mark for that module.
- `ModuleProgress` stores `bestScore`, `attemptsCount`, `passed`, `state`, timestamps.
- `QuizAttempt` stores the server-computed `score`, `percentage`, `passed`, `passingScore`.
- Foreign keys use `onDelete: Cascade` for owned data and `SetNull` where a reference is optional.
- Unique constraints prevent duplicate enrolments, duplicate progress rows and duplicate slugs.

## 4. Authentication architecture

- Passwords hashed with bcrypt (cost 12). Plaintext is never stored or logged.
- On sign-in/sign-up the server creates a `Session` row and sets an opaque token in an
  `httpOnly`, `SameSite=Lax`, `Secure` (in production) cookie. Only a salted SHA-256
  **hash** of the token is stored, so a read-only DB leak cannot resurrect sessions.
- Every authenticated request re-resolves the user from the session (`src/lib/session.ts`).
- Sign-out deletes the session row; changing a password revokes **all** sessions.
- Login is rate-limited per IP and per email; failed logins return one generic message
  and always run a bcrypt comparison to avoid user enumeration and timing leaks.
- `src/proxy.ts` (Next.js "proxy" / middleware) redirects unauthenticated users away from
  `/dashboard`, `/account`, `/learn`, `/admin` — a UX layer only; real checks run in the handlers.

## 5. Admin architecture

- `/admin/*` pages: `requirePageAdmin()` in the layout redirects non-admins to `/dashboard`
  (the admin area is never revealed).
- `/api/admin/*` routes: every handler is wrapped by `adminRoute()`
  (`src/lib/admin-api.ts`), which calls `requireAdmin()` before the body runs. A student
  hitting the URL directly gets `403`; an anonymous request gets `401`.
- All admin input is validated with Zod (`src/lib/validation.ts`).
- Content is fully editable without code: courses, modules, lessons (Markdown), quizzes,
  questions/answers, module order, lesson order, per-module pass mark, and the platform
  default pass mark.

## 6. Module progression logic

Pure functions in [`src/lib/progression.ts`](src/lib/progression.ts), unit-tested:

- Modules are ordered. Module 1 is always `AVAILABLE`.
- Module *N* is `AVAILABLE` **only if** module *N−1* has `passed === true`
  (`bestScore >= module N-1 passingScore`). Otherwise `LOCKED`.
- A module with a passed attempt is `COMPLETED`; one that has been started but not passed
  is `IN_PROGRESS`.
- A stale/forged progress row for a later module cannot "pull" an intermediate locked
  module open — each gate depends on the immediately preceding module only.
- Course completion = every module passed; sets `Enrollment.completedAt`.

Access is checked server-side on every lesson page, every quiz page, and the quiz
`start`/`submit` APIs (`getModuleAccessById`). URL guessing returns `403` with a reason.

## 7. How the 80% requirement works

1. Student opens a module's assessment → `POST /api/quiz/:course/:module/start` verifies
   module access, creates a `QuizAttempt`, and returns the questions **without** the
   `isCorrect` flags.
2. Student submits → `POST /api/quiz/attempts/:id/submit`. The server:
   - confirms the attempt belongs to the caller and is not already submitted,
   - ignores any `score`/`passed` fields in the body,
   - grades from the stored answer key, accepting only option ids that belong to each question,
   - `percentage = round(correct / total * 100)`, `passed = percentage >= module.passingScore`,
   - writes the attempt, updates `ModuleProgress` (`bestScore = max(old, new)`, `attemptsCount++`,
     `passed`, `state`), and marks the course complete if every module is now passed.
3. The response reports score, percentage, pass/fail, per-question correctness + explanation,
   and whether the next module unlocked.
4. Failing keeps the next module `LOCKED`; the student can retake it any number of times.
   Every attempt and score is stored.

Default pass mark is **80%**, set on `AppSetting.defaultPassingScore` and on each
`Module.passingScore`. Admins can change the default (optionally applying it to all
existing modules) and override any single module.

## 8. Security measures

- Authorization on every admin and student mutation (role + ownership checks); IDOR
  guarded (attempts, progress and results are filtered by `userId`).
- Passwords: bcrypt(12); password policy enforced; no plaintext anywhere.
- Sessions: opaque token, only its hash stored; `httpOnly` + `SameSite=Lax` + `Secure`;
  revoked on logout and on password change.
- Quiz scores and module unlocks computed only on the server; browser-supplied scores ignored.
- Zod validation on every request body; option ids validated against their question.
- Rate limiting on sign-up, sign-in, quiz start and quiz submit.
- Stored-XSS: lesson Markdown is rendered with raw HTML **disabled**; the one
  `dangerouslySetInnerHTML` consumes only that sanitised output.
- Response headers: `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, `Permissions-Policy`, and HSTS in production (`next.config.ts`).
- CSRF: cookies are `SameSite=Lax`; state-changing endpoints are POST/PATCH/DELETE only;
  Server Actions are same-origin enforced by the framework.
- Secrets come from environment variables; `.env` is gitignored; no credentials in source or client bundles.
- Error responses never include stack traces, SQL, or internal paths.

## 9. SEO features

- Unique `<title>` and meta description per page (`src/lib/seo.ts`), no duplicates.
- One `<h1>` per page; semantic landmarks (`header`/`nav`/`main`/`footer`).
- Canonical URL on every page, derived from `NEXT_PUBLIC_SITE_URL`.
- Open Graph + Twitter card metadata; generated 1200×630 social image (`/opengraph-image`).
- JSON-LD: `EducationalOrganization`, `WebSite`, `Course` (per course), `BreadcrumbList`.
- Breadcrumbs reflect real location (e.g. Dashboard → Python → Module → Lesson).
- `robots.txt` (references the sitemap; disallows `/admin`, `/api/`, `/dashboard`,
  `/account`, `/learn/`, `/login`, `/signup`).
- `sitemap.xml` — public pages and course outlines only, absolute canonical URLs.
- `llms.txt` describing the public content.
- Auth pages and every private/admin page send `noindex`.
- Favicon (`/icon.svg`) and web app manifest.

## 10. Performance optimizations

- Server Components by default; client JS is limited to forms and the quiz runner.
- Syntax highlighting runs at render time on the server — **zero** highlighting JS shipped.
- No UI component libraries; Tailwind only. No web-font downloads (system font stack).
- `productionBrowserSourceMaps: false` — no JS source maps served in production.
- `poweredByHeader: false`; images use explicit dimensions and native lazy loading.
- Route-level code splitting is automatic (App Router); admin code never loads for students.
- `sitemap.xml` / `llms.txt` cached for 1 hour.

## 11. Tests performed

Automated:

- **Unit (Vitest, 19 tests):** percentage rounding, pass threshold, `deriveModuleStates`
  (lock/unlock, custom pass marks, no skipping a locked module), course progress %,
  current-module selection, password policy + hashing, Zod schema behaviour.
- **E2E (Playwright, 5 tests):** full student journey (sign-up → language choice → locked
  module via direct URL → read lesson → fail assessment → module stays locked → pass
  assessment → module unlocks → logout invalidates session); student blocked from `/admin`
  and admin APIs (403); anonymous blocked from protected APIs (401); admin sign-in;
  forged score in the submit body is ignored.

Manual / scripted verification:

- API suite covering signup, duplicate-email, weak password, unknown course, generic
  login failure, admin login, cross-role API access, IDOR on attempts, double-submit,
  tampered option ids, rate limiting, logout.
- SEO crawl of all public pages: no duplicate titles/descriptions, canonical present,
  single h1, OG/Twitter/JSON-LD present, correct `noindex`, valid `robots.txt` /
  `sitemap.xml` / `llms.txt`, custom 404.
- Accessibility spot checks: landmarks, labelled controls, `fieldset`/`legend` groups,
  visible focus, heading order, `lang`, skip link, image alt text.
- Lint, type-check and production build all clean.
- Responsive check at 375px and desktop widths.

## 12. Known issues / notes

- Local dev needs a PostgreSQL instance (`docker compose up -d`, or a native install).
- One dev-only advisory remains: `deepmerge-ts` (via `@prisma/config`, a Prisma CLI
  dependency). It is not in the runtime bundle and does not affect the running app.
  It clears when Prisma updates that transitive dependency.
- The CSP allows inline scripts (`'unsafe-inline'`) because the Next.js App Router runtime
  injects inline bootstrap scripts. Moving to a nonce-based CSP is possible but was not done.
- Every page renders per-request (the header reflects the signed-in user). All pages are
  still fully server-rendered and indexable; there is just no static HTML cache.
- The Turbopack dev cache under `.next/` occasionally corrupts after an interrupted build
  ("Failed to open database … invalid digit"). Fix: `rm -rf .next && npm run dev`.
- During content development, `npm run db:seed` deletes and recreates the three seeded
  courses, which cascades to student progress in those courses. This is intentional for
  iterating on content; do not run it against production data.

## 13. Environment variables

| Variable                   | Where            | Notes                                                              |
| -------------------------- | ---------------- | --------------------------------------------------------------- |
| `DATABASE_URL`             | local + CI + build | Postgres connection string. In production it is only used by `prisma generate`; the running app uses the Cloud SQL connector. |
| `NEXT_PUBLIC_SITE_URL`     | everywhere       | SEO / canonical / sitemap / OG / JSON-LD. Production origin, no trailing slash. |
| `AUTH_SECRET`              | everywhere       | Session token hashing. `openssl rand -base64 48`                   |
| `INSTANCE_CONNECTION_NAME` | production       | `PROJECT:REGION:INSTANCE` — switches `db.ts` to the Cloud SQL connector. |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | production | Cloud SQL credentials used by the connector.                  |
| `CLOUD_SQL_IP_TYPE`        | production       | `PUBLIC` (default in `apphosting.yaml`) or `PRIVATE`.              |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` | `db:seed` only | The admin account the seed creates. |

See [`.env.example`](.env.example) for local values and [DEPLOY.md](DEPLOY.md) for production.

## 14. Custom domain configuration

The production URL lives in **one** place: `NEXT_PUBLIC_SITE_URL`.

1. Register your domain and point it at the host (below).
2. Set `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` in the host's environment
   (no trailing slash). It is read at build time.
3. Rebuild / redeploy. These update automatically:
   - canonical `<link>` tags — `src/lib/seo.ts`
   - `sitemap.xml` — `src/app/sitemap.ts`
   - `robots.txt` (`Sitemap:` + `Host:`) — `src/app/robots.ts`
   - Open Graph / Twitter URLs and the social image URL — `src/lib/seo.ts`
   - JSON-LD `url` fields — `src/components/seo/JsonLd.tsx`
   - `llms.txt` — `src/app/llms.txt/route.ts`
4. Nothing else references a hard-coded domain (`grep -rn "http" src/config` confirms only
   the env read and a `localhost` fallback).

`src/config/site.ts` also holds the brand name and the `EducationalOrganization` contact
details used in JSON-LD and the footer — edit those there if they change.

## 15. Deployment

Target is **Firebase App Hosting + Google Cloud SQL**. The full step-by-step runbook is in
**[DEPLOY.md](DEPLOY.md)** — it covers the Blaze upgrade, creating the Cloud SQL instance,
running migrations + seed, wiring secrets, connecting the GitHub repo, creating the
App Hosting backend, and granting `roles/cloudsql.client`.

The repo is already prepared for it: `apphosting.yaml`, `.firebaserc` (→ `codestart-learn`),
the Postgres migration, and `src/lib/db.ts` connecting through the Cloud SQL Node.js
connector (no VPC required).

Nothing about the app is Firebase-specific, so it also runs on any Node host (Render,
Railway, Fly.io, a VM) given a `DATABASE_URL` to a Postgres database and the env vars above.

For multi-instance deployments, replace the in-memory rate limiter
(`src/lib/rate-limit.ts`) with a shared store (e.g. Redis).
