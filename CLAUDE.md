# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AquaFlow Pro** is a swimming team training management system built with Next.js 16, deployed on Cloudflare Pages with Neon Serverless Postgres. It serves coaches (1-2) and swimmers (10-30) in China with a bilingual (Chinese/English) interface.

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
  - `app/(driver)/` - Coach dashboard pages (route group with shared layout, requires `role: coach`)
  - `app/(athlete)/` - Athlete-facing pages (workout view, login)
  - `app/api/` - REST API route handlers (all Edge Runtime)
  - `app/poolside/` - Poolside quick-access page
  - `app/setup/` - Initial setup page

### Data Layer

- **Prisma ORM** with Neon Postgres via WebSocket (`@prisma/adapter-neon` + `@neondatabase/serverless`)
- `lib/prisma.ts` - Fault-tolerant lazy-initialized Prisma singleton with build-phase bypass. Always use `getPrisma()` to get the client; the deprecated `prisma` export is a no-op stub.
- `lib/api-handler.ts` - Standard API error wrapper (`withApiHandler`) that catches Edge Runtime exceptions
- `lib/api-client.ts` - HTTP request encapsulation for frontend
- `lib/store.tsx` - Global state management (React Context + useReducer):
  - 30s polling sync across all API endpoints
  - 15s Mutation Guard prevents polling from overwriting optimistic updates
  - All CRUD operations go through store methods, never direct `fetch()`
- `lib/db.ts` - Additional DB utilities
- `lib/data.ts` - Data access helpers

### Authentication

- **PBKDF2-SHA256** password hashing (100,000 iterations)
- **Custom JWT** with HMAC-SHA256 (Web Crypto API), 7-day expiration
- Cookie-based sessions (`aquaflow_session`)
- Middleware (`app/middleware.ts`) protects routes:
  - `/dashboard/*` - Coach only
  - `/workout/*`, `/profile/*` - Athlete only
  - Public: `/`, `/login`, `/poolside`, `/setup`, `/api/auth`

### Key Dependencies

- **Next.js 16** with React 19
- **Tailwind CSS v4** + shadcn/ui ("new-york" style, see `components.json`)
- **Framer Motion** for animations
- **Prisma** for database ORM
- **Neon Serverless** Postgres
- **opennextjs-cloudflare** + **Wrangler** for Cloudflare deployment

### Deployment

Deployed via `opennextjs-cloudflare build && wrangler deploy` to Cloudflare Pages. Custom domain: `sw.sportsflow.best` (configured in `wrangler.toml`). R2 bucket `aquaflow-uploads` for file uploads.

## Patterns & Conventions

### API Routes
- All routes wrap handlers with `withApiHandler()` to catch Edge Runtime exceptions
- All responses carry `V12_FINGERPRINT` headers
- All POST bodies go through `flattenPayload()` to prevent nested data bugs
- GET list responses return bare arrays `[]`, not `{ data: [...] }`

### Database
- Prisma client must be obtained via `getPrisma()` — top-level instantiation will crash in Cloudflare Edge
- Dates stored as `YYYY-MM-DD` strings throughout the codebase

### Styling
- Dark mode is default and only mode (no `dark:` prefix needed)
- Use CSS variables for colors (`bg-primary`, `text-muted-foreground`), never hardcode hex values
- Design system: deep-sea dark theme (`#0a192f` background) with teal accent (`#64ffda`)
- Card border radius: `rounded-2xl` or `rounded-3xl`; buttons: `rounded-full` or `rounded-xl`

### State Management
- Global state accessed via `useStore()` — never direct API fetch from components
- Local UI state uses component `useState`

### Build
- TypeScript build errors are intentionally ignored in `next.config.ts` for deployment stability
- Run `npx tsc --noEmit` before deploying to catch type issues

## Database Schema

Core models: `Swimmer`, `TrainingPlan`, `Feedback`, `AttendanceRecord`, `PerformanceRecord`, `BlockTemplate`, `PlanAnalysis`, `WeeklyPlan`, `DailySession`, `WeeklyFeedback`, `DailyFeedback`, `FeedbackReminder`, `TargetedFeedback`, `CoachAnnouncement`, `CoachUser`. See `prisma/schema.prisma` for full definitions.

Key composite unique constraints:
- `WeeklyFeedback(swimmerId, weekStart)` — one weekly summary per swimmer per week
- `DailyFeedback(swimmerId, date)` — one daily feedback per swimmer per day
- `BlockFeedback(planId, blockId, swimmerId)` — one feedback per block per swimmer
- `TargetedFeedback(reminderId, swimmerId)` — one response per reminder per swimmer

After modifying the schema, run `npx prisma db push` to sync.

## Component Organization

- `components/athlete/` - Athlete-facing components (LoginForm, AttendanceCalendar, FeedbackForm, WeeklyFeedbackForm, PerformanceTracker)
- `components/dashboard/` - Coach dashboard components (PlanEditor ~60KB/largest, AttendanceTracker, AthletesFeedbackPanel, SwimmerStatusPanel)
- `components/common/` - Shared components (ErrorBoundary, ImageViewer, LanguageToggle)
- `components/auth/` - Authentication guards (CoachGuard)
- `components/layout/` - Layout components (Sidebar for desktop, MobileNav for mobile)

## Key Files Reference

| File | Purpose |
|------|---------|
| `lib/prisma.ts` | Lazy Prisma singleton — always use `getPrisma()` |
| `lib/api-handler.ts` | API error wrapper |
| `lib/store.tsx` | Global state with 30s polling + mutation guard |
| `lib/auth.ts` | JWT auth utilities |
| `lib/api-client.ts` | HTTP client |
| `app/middleware.ts` | Route protection with edge-compatible JWT verification |
| `wrangler.toml` | Cloudflare deployment config + R2 bindings |
