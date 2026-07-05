# Exam Clearance Planner

Production-ready Next.js planner for GATE Mechanical Engineering preparation. The planner locks syllabus completion to `2026-12-31`, keeps January 2027 for mocks, analysis, revision, and recovery, and targets the final exam date `2027-02-07`.

## Install Dependencies

```bash
npm install
```

## Configure Environment

Copy `.env.example` to `.env` and fill production values before deploying.

```bash
cp .env.example .env
```

Required production variables:

```bash
NEXT_PUBLIC_APP_NAME=Exam Clearance Planner
NEXT_PUBLIC_EXAM_DATE=2027-02-07
NEXT_PUBLIC_SYLLABUS_LOCK_DATE=2026-12-31
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_ENABLE_LOCAL_FALLBACK=true
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/exam_planner
JWT_SECRET=replace_with_strong_secret
NEXTAUTH_SECRET=replace_with_strong_secret
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NODE_ENV=production
```

Server-only secrets must never use `NEXT_PUBLIC_`.

## Database Setup

Generate the Prisma client:

```bash
npx prisma generate
```

Run migrations against PostgreSQL:

```bash
npx prisma migrate deploy
```

For local schema iteration:

```bash
npx prisma migrate dev
```

## Seed Database

The seed script validates the locked GATE ME planner data and prints idempotent seed payload metadata. It does not overwrite user progress.

```bash
npm run db:seed
```

Development default user is skipped in production unless explicitly enabled:

```bash
ENABLE_DEV_DEFAULT_USER=true npm run db:seed
```

Local development credentials when enabled:

```text
student@example.com
Student@123
```

## Run Dev Server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Build For Production

```bash
npm run build
```

Optional lint check:

```bash
npm run lint
```

## Deploy To Vercel

1. Link the project to Vercel.
2. Add `DATABASE_URL`, `JWT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and public variables in Vercel Environment Variables.
3. Deploy:

```bash
vercel --prod
```

The app uses Next.js API routes, so frontend and backend deploy together on Vercel.

## Backup And Restore

Open the Settings tab:

- Export full planner, syllabus, mock analysis, mistake notebook, and daily progress as CSV.
- Download all user planner data as JSON backup.
- Paste backup JSON to validate and restore.
- Clear local fallback data only after confirmation.

## Troubleshooting

- Login fails in production: seed or create a real user and confirm `JWT_SECRET` is set.
- API reports `needs_configuration`: fill missing production environment variables.
- Prisma migrate fails: verify `DATABASE_URL` points to a reachable PostgreSQL database.
- Local fallback active: confirm `NEXT_PUBLIC_ENABLE_LOCAL_FALLBACK=true` or fix API connectivity.
