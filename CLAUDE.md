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

# Type checking
npx tsc --noEmit         # Run TypeScript type check (build ignores TS errors)

# Tests
npx vitest               # Run all tests
npx vitest --watch       # Run tests in watch mode
npx vitest tests/<file>  # Run specific test file
```

## Architecture

### App Structure (Next.js App Router)

- `app/` - Route-based pages using Next.js 16 App Router
  - `app/(driver)/` - Coach dashboard pages (route group with shared layout, requires `role: coach`)
    - `dashboard/` - Main dashboard, new-plan, plan/[id], athletes, attendance, attendance/stats, feedbacks, feedbacks/targeted, quick-plan, schedule, weekly-plan
    - `settings/` - Coach settings page
  - `app/(athlete)/` - Athlete-facing pages (route group, requires `role: athlete`)
    - `login/` - Athlete login page
    - `workout/` - Workout/training view
    - `profile/` - Athlete profile
    - `archive/` - Training archive/history
  - `app/api/` - REST API route handlers (all Edge Runtime, `force-dynamic`)
  - `app/poolside/` - Poolside quick-access page
  - `app/setup/` - Initial setup page

### Data Layer

**Two database access layers coexist:**

1. **Raw SQL via Neon** (`lib/db-pool.ts`) — **Primary method used by API routes**
   - `getNeon()` — Returns a `neon()` tagged-template SQL function for parameterized queries
   - `getPool()` — Returns a `Pool` instance for dynamic queries (e.g., runtime-determined columns)
   - All API routes use `getNeon()` with raw SQL, NOT Prisma

2. **Repository Pattern** (`lib/repos/`) — Entity-specific repos built on raw Neon SQL
   - `BaseRepo` (abstract class in `lib/repos/base.ts`) — shared utilities: JSON field parse/stringify, `requireOne()` for existence checks
   - Each entity has its own repo: `planRepo`, `swimmerRepo`, `feedbackRepo`, `attendanceRepo`, `performanceRepo`, `templateRepo`, `weeklyPlanRepo`, `announcementRepo`, `meetRepo`, `blockFeedbackRepo`, `feedbackReminderRepo`, `weeklyFeedbackRepo`
   - Custom errors: `NotFoundError`, `ValidationError` (in `lib/repos/errors.ts`)

3. **Prisma ORM** (`lib/prisma.ts`) — Fault-tolerant lazy-initialized singleton
   - `getPrisma()` — Always use this to get the Prisma client; top-level instantiation crashes in Cloudflare Edge
   - Includes build-phase bypass via Proxy for production builds
   - Uses `@prisma/adapter-neon` with `@neondatabase/serverless` WebSocket `Pool`
   - The `prisma` export is a no-op stub (deprecated)
   - `lib/db.ts` is a deprecated stub Proxy — use `getNeon()` instead

**Additional data utilities:**
- `lib/api-handler.ts` — `withApiHandler()` wraps route handlers, catches Edge Runtime exceptions, detects Neon quota errors (HTTP 402) and returns 503
- `lib/api-client.ts` — Frontend HTTP client with 30s timeout, exponential backoff retry (3 attempts), content-type validation, and `silent4xx` mode for polling
- `lib/store.tsx` — Global state management (React Context + useReducer), split into three sub-modules:
  - `lib/store/sync-engine.ts` — 30s polling sync across all API endpoints, 15s Mutation Guard prevents polling from overwriting optimistic updates
  - `lib/store/entity-crud.ts` — All CRUD operations go through store methods, never direct `fetch()`
  - `lib/store/persist-layer.ts` — localStorage persistence with 7-day TTL for offline resilience
  - Quota-exceeded detection (`isQuotaError`) sets `dbOffline` flag to stop polling
  - Optimistic updates with automatic rollback on server failure
- `lib/data.ts` — Mock data (MOCK_PLANS, MOCK_SWIMMERS, DEFAULT_TEMPLATES)

### Authentication

- **PBKDF2-SHA256** password hashing (100,000 iterations) via Web Crypto API (`lib/auth.ts`)
- **Custom JWT** with HMAC-SHA256 (Web Crypto API), 7-day expiration (`lib/jwt.ts`)
- Cookie-based sessions (`aquaflow_session`), HttpOnly + SameSite=Strict
- **Middleware** (`middleware.ts`) — Edge middleware protects routes:
  - `/dashboard/*` — Coach only (redirects to `/login?role=coach`)
  - `/workout/*`, `/athlete/*`, `/profile/*`, `/archive/*` — Athlete only (redirects to `/login?role=athlete`)
  - Public: `/`, `/login`, `/poolside`, `/setup`, `/api/auth/*`
- **API route guards** (`lib/auth-api.ts`):
  - `requireCoach(request)` — Returns JWTPayload or 401/403 NextResponse
  - `requireAthlete(request)` — Returns JWTPayload or 401/403 NextResponse
  - `requireAnyAuth(request)` — Returns JWTPayload or 401 NextResponse
  - `getOptionalAuth(request)` — Returns JWTPayload or null (no redirect)
- **Login rate limiting** — 10 attempts per IP per 5 minutes (in-memory Map in login route)
- **Coach registration** — `/api/auth/register-coach` for initial coach setup

### Key Dependencies

- **Next.js 16** with React 19
- **Tailwind CSS v4** + shadcn/ui ("new-york" style, see `components.json`)
- **Framer Motion** for animations
- **Neon Serverless** Postgres (`@neondatabase/serverless`)
- **Prisma** ORM (defined but API routes use raw Neon SQL)
- **opennextjs-cloudflare** + **Wrangler** for Cloudflare deployment
- **lucide-react** for icons

### Deployment

Deployed via `opennextjs-cloudflare build && wrangler deploy --minify` to Cloudflare Pages. Custom domain: `sw.sportsflow.best` (configured in `wrangler.toml`). R2 bucket `aquaflow-uploads` for file uploads.

- `serverExternalPackages` in `next.config.ts`: `@prisma/client`, `.prisma/client`
- `ignoreBuildErrors: true` in TypeScript config for deployment stability

## Patterns & Conventions

### API Routes
- All routes export `dynamic = 'force-dynamic'` (Edge Runtime)
- All handlers wrap with `withApiHandler()` to catch Edge Runtime exceptions
- All responses carry `V12_FINGERPRINT` headers (`X-Build: V12-STRATOSPHERE-RECOVERY`, `Cache-Control: no-store`)
- All POST/PUT bodies go through `flattenPayload()` to prevent nested data bugs (iteratively peels `{ data: { data: { ... } } }`)
- GET list responses return bare arrays `[]`, not `{ data: [...] }`
- JSON fields (blocks, targetedNotes, etc.) are `JSON.stringify`'d on write, `JSON.parse`'d on read
- Role guards checked at the top of each handler: `if (auth instanceof NextResponse) return auth`

### API Route Structure
- `app/api/<entity>/route.ts` — Standard CRUD endpoints (plans, swimmers, feedbacks, attendance, performances, templates, weekly-plans, announcements, meets, block-feedbacks, feedback-reminders, weekly-feedbacks)
- `app/api/auth/` — Authentication endpoints (login, register-coach, change-password)
- `app/api/upload` — File upload to R2 bucket
- `app/api/sync` — Polling sync endpoint
- `app/api/keep-alive` — Database keep-alive ping
- `app/api/diagnostic` — Error diagnostic endpoint
- `app/api/plan-analysis` — Plan OCR analysis
- `app/api/shop` — Avatar shop CRUD
- `app/api/buddy` — Buddy system endpoints
- `app/api/activity-feed` — Activity notification feed
- `app/api/archive` — Training archive

### Database
- API routes use `getNeon()` for raw SQL — tagged template literals with `${param}` for parameterization
- Table names are double-quoted (e.g., `"TrainingPlan"`, `"Swimmer"`) due to PascalCase naming
- Prisma client must be obtained via `getPrisma()` — top-level instantiation will crash in Cloudflare Edge
- Dates stored as `YYYY-MM-DD` strings throughout the codebase
- Use `lib/date-utils.ts` for date handling: `getLocalDateISOString()` for local-time date strings, `parseUTCDate()` for server timestamps

### Styling
- Dark mode is default and only mode (no `dark:` prefix needed)
- Use CSS variables for colors (`bg-primary`, `text-muted-foreground`), never hardcode hex values
- Design system: deep-sea dark theme (`#0a192f` background) with teal accent (`#64ffda`)
- Card border radius: `rounded-2xl` or `rounded-3xl`; buttons: `rounded-full` or `rounded-xl`
- Use `cn()` from `lib/utils.ts` for conditional className merging (clsx + tailwind-merge)
- Background themes available via `lib/background-themes.ts`

### State Management
- Global state accessed via `useStore()` — never direct API fetch from components
- Local UI state uses component `useState`
- `recordMutation()` called before any write to block 30s polling for 15s

### Build
- TypeScript build errors are intentionally ignored in `next.config.ts` for deployment stability
- Run `npx tsc --noEmit` before deploying to catch type issues
- Turbopack enabled in next.config.ts

## Database Schema

Core models: `CoachUser`, `Swimmer`, `TrainingPlan`, `Feedback`, `AttendanceRecord`, `PerformanceRecord`, `BlockTemplate`, `PlanAnalysis`, `WeeklyPlan`, `DailySession`, `WeeklyFeedback`, `DailyFeedback`, `FeedbackReminder`, `TargetedFeedback`, `CoachAnnouncement`, `AnnouncementBlock`.

Gamification & economy models: `ShopItem`, `XpTransaction`, `BuddyPair`, `ActivityFeedItem`.

Event management: `Meet`.

See `prisma/schema.prisma` for full definitions.

Key composite unique constraints:
- `WeeklyFeedback(swimmerId, weekStart)` — one weekly summary per swimmer per week
- `DailyFeedback(swimmerId, date)` — one daily feedback per swimmer per day
- `BlockFeedback(planId, blockId, swimmerId)` — one feedback per block per swimmer
- `TargetedFeedback(reminderId, swimmerId)` — one response per reminder per swimmer

After modifying the schema, run `npx prisma db push` to sync.

## Component Organization

- `components/athlete/` - Athlete-facing components (LoginForm, TrainingHistory, FeedbackForm, WeeklyFeedbackForm, PerformanceTracker, PerformanceChart, BlockFeedbackPanel, CoachReplyPanel, TargetedFeedbackForm)
- `components/dashboard/` - Coach dashboard components (PlanEditor ~60KB/largest, BlockEditor, PlanCard, AttendanceStats, TodayAttendance, AthletesFeedbackPanel, SwimmerStatusPanel, TeamStatsPanel, TeamFeedbackSummary, AnnouncementComposer, AIInsight, PaceCalculator, RichTextEditor, SessionRenderer, WorkoutLibrary, RefreshButton, SwimmerModal)
- `components/common/` - Shared components (BlockRenderer, ImageViewer, LanguageToggle, Toast)
- `components/auth/` - Authentication guards (CoachGuard)
- `components/layout/` - Layout components (Sidebar for desktop, MobileNav for mobile)
- `components/DbStatus.tsx` - Database status indicator
- `components/feed/` - Feed-related components
- `components/plan/` - Plan-related components
- `components/athlete/BottomTabBar.tsx` - Mobile bottom navigation for athlete routes

## Testing

- **Framework**: Vitest with jsdom environment
- **Config**: `vitest.config.ts` — globals enabled, `tests/setup.ts` as setup file
- **Test files**: `tests/**/*.test.{ts,tsx}` (ECC/ directory excluded)
- **Test categories**: API client, auth API, API flows, core API, extended API, component rendering, edge runtime mocks, utility functions

## Key Files Reference

| File | Purpose |
|------|---------|
| `lib/db-pool.ts` | Neon SQL client singleton — used by all API routes |
| `lib/repos/` | Repository pattern — entity-specific CRUD repos on raw Neon SQL |
| `lib/repos/base.ts` | BaseRepo abstract class with JSON parse/stringify, requireOne |
| `lib/prisma.ts` | Lazy Prisma singleton (build-safe Proxy) |
| `lib/api-handler.ts` | API error wrapper with Neon quota detection |
| `lib/store.tsx` | Global state with 30s polling + mutation guard + localStorage |
| `lib/store/sync-engine.ts` | Polling sync engine with mutation guard |
| `lib/store/entity-crud.ts` | CRUD operations for state entities |
| `lib/store/persist-layer.ts` | localStorage persistence layer |
| `lib/jwt.ts` | JWT utilities (generateJWT, verifyJWT, cookie helpers) |
| `lib/auth.ts` | Password hashing (PBKDF2) + re-exports from jwt.ts |
| `lib/auth-api.ts` | API route role guards (requireCoach, requireAthlete) |
| `lib/api-client.ts` | HTTP client with retry/backoff |
| `lib/dictionary.ts` | Bilingual dictionary (en/zh) |
| `lib/i18n.tsx` | Language provider (LanguageProvider, useLanguage) |
| `lib/date-utils.ts` | Date formatting with timezone safety |
| `lib/validation.ts` | Form validation helpers |
| `lib/utils.ts` | `cn()` className utility |
| `lib/sanitize-html.ts` | HTML sanitization (DOMPurify) |
| `lib/group-constants.ts` | Group level constants |
| `lib/background-themes.ts` | Background theme definitions |
| `middleware.ts` | Edge route protection with JWT verification |
| `wrangler.toml` | Cloudflare deployment config + R2 bindings |
| `next.config.ts` | Next.js config with turbopack + build error ignore |
| `types/index.ts` | All TypeScript type definitions |
| `vitest.config.ts` | Test configuration |
