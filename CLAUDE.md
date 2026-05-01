# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AquaFlow Pro** is a swimming team training management system built with Next.js 16, deployed on Cloudflare Pages with Neon Serverless Postgres. It provides coaches with planning/attendance tools and athletes with workout tracking and feedback features.

Production URL: https://sw.sportsflow.best

## Key Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Cloudflare deployment
npm run preview          # Build & run locally with Wrangler
npm run deploy           # Build & deploy to Cloudflare Pages

# Database
npx prisma generate      # Generate Prisma client (runs on postinstall)
npx prisma studio        # Open Prisma Studio for DB browsing
npx prisma db push       # Push schema changes to DB

# Tests
npx vitest               # Run all tests
npx vitest --watch       # Run tests in watch mode
npx vitest <filename>    # Run specific test file
```

## Architecture

### App Structure (Next.js App Router)

- `app/` - Route-based pages using Next.js 16 App Router
  - `app/(driver)/` - Coach dashboard pages (route group with shared layout)
  - `app/(athlete)/` - Athathlete-facing pages (workout view, login)
  - `app/api/` - REST API route handlers
  - `app/poolside/` - Poolside quick-access page

### Data Layer

- **Prisma ORM** with Neon Postgres via WebSocket (`@prisma/adapter-neon` + `@neondatabase/serverless`)
- `lib/prisma.ts` - Fault-tolerant lazy-initialized Prisma singleton with build-phase bypass. Always use `getPrisma()` to get the client; the deprecated `prisma` export is a no-op stub.
- `lib/api-handler.ts` - Standard API error wrapper (`withApiHandler`) that catches Edge Runtime exceptions
- `lib/db.ts` - Additional DB utilities
- `lib/data.ts` - Data access helpers

### Key Dependencies

- **Next.js 16** with React 19
- **Tailwind CSS v4** + shadcn/ui (see `components.json`)
- **Framer Motion** for animations
- **Prisma** for database ORM
- **Neon Serverless** Postgres
- **opennextjs-cloudflare** + **Wrangler** for Cloudflare deployment

### Deployment

Deployed via `opennextjs-cloudflare build && wrangler deploy` to Cloudflare Pages. Custom domain: `sw.sportsflow.best` (configured in `wrangler.toml`).

## Patterns & Conventions

- API routes use `withApiHandler` wrapper for error handling; see `lib/api-handler.ts`
- Prisma client must be obtained via `getPrisma()` — top-level instantiation will crash in Cloudflare Edge
- Route groups `(driver)` and `(athlete)` separate coach vs athlete UI flows
- TypeScript is configured to ignore build errors (`next.config.ts`) — this is intentional for deployment stability
- Dates stored as `YYYY-MM-DD` strings throughout the codebase

## Database Schema

Core models: `Swimmer`, `TrainingPlan`, `Feedback`, `AttendanceRecord`, `PerformanceRecord`, `BlockTemplate`, `PlanAnalysis`, `WeeklyPlan`, `DailySession`, `WeeklyFeedback`, `DailyFeedback`, `FeedbackReminder`, `TargetedFeedback`. See `prisma/schema.prisma` for full definitions.

After modifying the schema, run `npx prisma db push` to sync.
