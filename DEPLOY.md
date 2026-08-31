# Deploying to Firebase App Hosting + Cloud SQL

Target: Firebase project **`codestart-learn`**, Next.js server on App Hosting (Cloud Run),
PostgreSQL on Google Cloud SQL.

The repo is already prepared:

- `prisma/schema.prisma` uses `postgresql`; `prisma/migrations/00000000000000_init` is the Postgres schema.
- `src/lib/db.ts` connects to Cloud SQL via the **Cloud SQL Node.js Connector** when
  `INSTANCE_CONNECTION_NAME` is set — no VPC, no private IP, no allow-listed IPs.
- `apphosting.yaml` holds the runtime config and env-var/secret wiring.
- `.firebaserc` points the Firebase CLI at `codestart-learn`.

You need: the `gcloud` CLI (`brew install --cask google-cloud-sdk`), the Firebase CLI
(already installed), and a GitHub account.

---

## 0. Prerequisites (one-time)

**Upgrade the Firebase project to the Blaze plan.** App Hosting and Cloud SQL both need it.
<https://console.firebase.google.com/project/codestart-learn/usage/details>

**Authenticate the CLIs:**

```bash
gcloud auth login
gcloud config set project codestart-learn
gcloud auth application-default login   # lets the connector work from your machine
firebase login                          # already done
```

**Enable the APIs:**

```bash
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  firebaseapphosting.googleapis.com \
  developerconnect.googleapis.com
```

---

## 1. Create the Cloud SQL instance

```bash
# Smallest usable tier. europe-west1 (Belgium) — change region if you prefer.
gcloud sql instances create codestart-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=europe-west1 \
  --storage-size=10 \
  --storage-auto-increase \
  --edition=ENTERPRISE

# Application database + user
gcloud sql databases create codestart --instance=codestart-db

# Choose a strong password and keep it for step 3
DB_PASSWORD='<generate-a-strong-password>'
gcloud sql users create codestart --instance=codestart-db --password="$DB_PASSWORD"
```

Get the instance connection name (format `PROJECT:REGION:INSTANCE`):

```bash
gcloud sql instances describe codestart-db --format='value(connectionName)'
# e.g. codestart-learn:europe-west1:codestart-db
```

> `db-f1-micro` is roughly USD 8–10/month. There is no cheaper always-on Postgres on GCP.

---

## 2. Run migrations and seed the database

The instance has a public IP by default. Temporarily allow your machine, run the
migration + seed, then lock it back down.

```bash
MY_IP=$(curl -s https://api.ipify.org)
gcloud sql instances patch codestart-db --authorized-networks="$MY_IP/32"

PUBLIC_IP=$(gcloud sql instances describe codestart-db --format='value(ipAddresses[0].ipAddress)')

DATABASE_URL="postgresql://codestart:${DB_PASSWORD}@${PUBLIC_IP}:5432/codestart?sslmode=require" \
  npx prisma migrate deploy

DATABASE_URL="postgresql://codestart:${DB_PASSWORD}@${PUBLIC_IP}:5432/codestart?sslmode=require" \
  SEED_ADMIN_EMAIL="you@example.com" \
  SEED_ADMIN_PASSWORD="<your-admin-password>" \
  SEED_ADMIN_NAME="Your Name" \
  npx tsx prisma/seed.ts

# Lock the instance back down (the connector does not use authorized networks)
gcloud sql instances patch codestart-db --clear-authorized-networks
```

_Alternative without editing authorized networks:_ `brew install cloud-sql-proxy`, then
`cloud-sql-proxy <CONNECTION_NAME> &` and use
`DATABASE_URL="postgresql://codestart:${DB_PASSWORD}@127.0.0.1:5432/codestart"`.

Re-run `npx prisma migrate deploy` the same way whenever you add a migration.

---

## 3. Put secrets in Secret Manager

```bash
printf '%s' "$DB_PASSWORD" | firebase apphosting:secrets:set DB_PASSWORD --project codestart-learn --data-file -
openssl rand -base64 48 | firebase apphosting:secrets:set AUTH_SECRET --project codestart-learn --data-file -
```

(If your CLI version has no `--data-file`, run the commands without it and paste the value at the prompt.)

---

## 4. Fill in `apphosting.yaml`

Edit these placeholders:

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | leave for now; set it in step 7 |
| `INSTANCE_CONNECTION_NAME` | the value from step 1 (`codestart-learn:europe-west1:codestart-db`) |
| `DB_NAME` / `DB_USER` | `codestart` / `codestart` (already set) |

Commit the change.

---

## 5. Push the code to GitHub

App Hosting builds from a connected GitHub repo.

```bash
# from the coding-academy directory (it is its own git repo)
git remote add origin https://github.com/<you>/coding-academy.git
git push -u origin main
```

---

## 6. Create the App Hosting backend

```bash
firebase apphosting:backends:create --project codestart-learn
```

Answer the prompts:

- **Region:** match the Cloud SQL region (`europe-west1`).
- **GitHub connection:** authorise Firebase, pick the `coding-academy` repo.
- **Root directory:** `/`
- **Live branch:** `main`
- **Backend ID:** `codestart` (or any name).
- Automatic rollouts on push: **yes**.

The first rollout starts automatically. Watch it:

```bash
firebase apphosting:backends:get codestart --project codestart-learn
```

---

## 7. Grant Cloud SQL access and set the URL

Find the backend's compute service account (shown in `backends:get`, usually
`firebase-app-hosting-compute@codestart-learn.iam.gserviceaccount.com`) and grant it:

```bash
gcloud projects add-iam-policy-binding codestart-learn \
  --member="serviceAccount:firebase-app-hosting-compute@codestart-learn.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

Grant the same service account access to the secrets:

```bash
firebase apphosting:secrets:grantaccess DB_PASSWORD,AUTH_SECRET \
  --project codestart-learn --backend codestart
```

Get the backend URL from `backends:get` (e.g. `https://codestart--codestart-learn.europe-west1.hosted.app`),
put it in `apphosting.yaml` as `NEXT_PUBLIC_SITE_URL`, commit and push. That triggers a new
rollout with the correct canonical URLs.

---

## 8. Verify

- Open the backend URL. The three courses should load.
- Sign in with the admin credentials from step 2, change the password from the account page.
- Check `<url>/robots.txt`, `<url>/sitemap.xml`, `<url>/llms.txt`.
- Create a student account and pass a module assessment.

## Custom domain

`firebase apphosting:backends` → add a custom domain in the Firebase console, update the DNS
records it shows, then set `NEXT_PUBLIC_SITE_URL` to `https://yourdomain.com` in
`apphosting.yaml` and push.

## Ongoing

- Every push to `main` triggers a build + rollout.
- New DB migration: add it locally (`npm run db:migrate`), run `prisma migrate deploy` against
  Cloud SQL (step 2), then push the code.
- Rollbacks: `firebase apphosting:rollouts` or the Firebase console.
- Logs: Cloud Run logs for the backend service in the GCP console.
