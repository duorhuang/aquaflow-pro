# AquaFlow Pro — Complete Feature Guide

> **Last updated:** 2026-05-28
> **Production URL:** https://sw.sportsflow.best
> **Stack:** Next.js 16 + React 19, Tailwind CSS v4, Neon Serverless Postgres, Cloudflare Pages

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Authentication & Access Control](#2-authentication--access-control)
3. [Public Pages](#3-public-pages)
4. [Coach Dashboard — Pages & Features](#4-coach-dashboard--pages--features)
5. [Athlete App — Pages & Features](#5-athlete-app--pages--features)
6. [API Endpoints Reference](#6-api-endpoints-reference)
7. [Data Model](#7-data-model)
8. [Architecture & Implementation Details](#8-architecture--implementation-details)
9. [Gamification System](#9-gamification-system)
10. [State Management & Sync](#10-state-management--sync)

---

## 1. System Overview

AquaFlow Pro is a bilingual (English/Chinese) swimming team training management system. It serves two user roles:

- **Coaches** (1-2 users) — Create training plans, track attendance, review feedback, manage the team.
- **Athletes/Swimmers** (10-30 users) — View assigned plans, submit feedback, track performance, customize avatars.

### Design System

- **Theme:** Deep-sea dark (`#0a192f` background) with teal accent (`#64ffda`)
- **Typography:** System fonts via Tailwind defaults
- **Animations:** Framer Motion for transitions and micro-interactions
- **Icons:** Lucide React
- **Components:** shadcn/ui ("new-york" style)
- **Backgrounds:** Multiple animated themes with particle effects

### Key Infrastructure Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout: providers, theme, i18n, toast context |
| `app/(driver)/layout.tsx` | Coach dashboard layout: sidebar + mobile nav |
| `middleware.ts` | Edge middleware: route-level auth enforcement |
| `lib/store.tsx` | Global React Context state with polling sync |
| `lib/api-client.ts` | Frontend HTTP client with retry/backoff |
| `lib/api-handler.ts` | Backend error wrapper with quota detection |

---

## 2. Authentication & Access Control

### 2.1 Registration & Login

**Coach Registration** — `POST /api/auth/register-coach`
- **Page:** `/setup` (file: `app/setup/page.tsx`)
- **Implementation:** Creates the first coach account with username + password. Passwords are hashed with PBKDF2-SHA256 (100,000 iterations) via Web Crypto API. One-time setup; subsequent visits skip this page.

**Login** — `POST /api/auth/login`
- **Pages:** `/login?role=coach` (file: `app/(athlete)/login/page.tsx`, uses `components/athlete/LoginForm.tsx`)
- **Implementation:** Accepts username + password. On success, generates an HMAC-SHA256 JWT (7-day expiry) and sets it as an `HttpOnly`, `SameSite=Strict` cookie named `aquaflow_session`. Rate-limited to 10 attempts per IP per 5 minutes (in-memory Map).

**Logout** — `POST /api/auth/logout`
- **Implementation:** Clears the session cookie via `clearSessionCookie()` which sets an expired `Set-Cookie` header.

**Session Verification** — `GET /api/auth/me`
- **Implementation:** Returns the current user's JWT payload (`{ userId, role }`) or 401 if unauthenticated.

### 2.2 Route Protection

**Edge Middleware** (`middleware.ts`)

| Route Pattern | Required Role | Unauthenticated Behavior |
|---------------|---------------|-------------------------|
| `/`, `/login`, `/poolside/*`, `/setup`, `/api/auth/*`, static assets | Public | No redirect |
| `/dashboard/*`, `/settings/*` | `coach` | Redirect to `/login?role=coach&redirect=<path>` |
| `/workout/*`, `/profile/*`, `/archive/*` | `athlete` | Redirect to `/login?role=athlete&redirect=<path>` |

**API Route Guards** (`lib/auth-api.ts`)

| Function | Behavior |
|----------|----------|
| `requireCoach(req)` | Returns `JWTPayload` or `NextResponse` 401/403 |
| `requireAthlete(req)` | Returns `JWTPayload` or `NextResponse` 401/403 |
| `requireAnyAuth(req)` | Returns `JWTPayload` or `NextResponse` 401 |
| `getOptionalAuth(req)` | Returns `JWTPayload` or `null` (never errors) |

**CoachGuard Component** (`components/auth/CoachGuard.tsx`)
- Client-side role verification wrapper. Redirects non-coach users to login. Includes 15-second timeout for cold-start DB connections.

### 2.3 Password Hashing

**File:** `lib/auth.ts`
- Algorithm: PBKDF2-SHA256, 100,000 iterations, 16-byte random salt
- Storage format: `saltHex:iterations:hashHex`
- Uses Web Crypto API for Edge Runtime compatibility

### 2.4 JWT Token

**File:** `lib/jwt.ts`
- Algorithm: HMAC-SHA256 via `crypto.subtle`
- Expiry: 7 days
- Cookie: `aquaflow_session` (HttpOnly, SameSite=Strict)
- Production: adds `Domain=.sportsflow.best` and `Secure` flag

---

## 3. Public Pages

### 3.1 Home Page — `/`

**File:** `app/page.tsx`

**Functions:**
- Landing page with project overview and quick links
- Redirects authenticated users to their respective dashboards
- Unauthenticated visitors see a welcome/overview screen

### 3.2 Poolside Quick Access — `/poolside`

**File:** `app/poolside/page.tsx`

**Functions:**
- Minimal, large-touch interface for poolside use by coaches
- Quick attendance marking without full dashboard navigation
- Fast plan viewing without sidebar/nav overhead
- Designed for mobile phones used at the pool deck

### 3.3 Initial Setup — `/setup`

**File:** `app/setup/page.tsx`

**Functions:**
- First-time coach registration form
- Username + password + optional name fields
- Calls `POST /api/auth/register-coach`
- After successful registration, redirects to `/dashboard`

---

## 4. Coach Dashboard — Pages & Features

All coach pages are wrapped in `(driver)` route group with a shared layout (`app/(driver)/layout.tsx`) that renders `Sidebar` (desktop) or `MobileNav` (mobile).

### 4.1 Dashboard Home — `/dashboard`

**File:** `app/(driver)/dashboard/page.tsx`

The main landing page for coaches. Aggregates multiple panels:

#### 4.1.1 Today Attendance Panel (`TodayAttendance`)
- **Component:** `components/dashboard/TodayAttendance.tsx`
- **Functions:**
  - Shows today's attendance rate (attended / expected)
  - Progress bar visualization
  - Lists attended swimmers with checkmarks
  - Lists absent swimmers with names
- **Data:** `AttendanceRecord` table, filtered by today's date

#### 4.1.2 Athletes Feedback Panel (`AthletesFeedbackPanel`)
- **Component:** `components/dashboard/AthletesFeedbackPanel.tsx`
- **Functions:**
  - Shows today's feedback submission count
  - Per-swimmer latest feedback cards with RPE and soreness scores
  - Trend indicators (up/down arrows) for RPE and soreness compared to previous feedback
  - Auto-highlights swimmers with RPE >= 8 or soreness >= 7 in red
  - "Needs attention" banner for flagged swimmers
- **Data:** `Feedback` table, joined with `Swimmer`

#### 4.1.3 Swimmer Status Panel (`SwimmerStatusPanel`)
- **Component:** `components/dashboard/SwimmerStatusPanel.tsx`
- **Functions:**
  - Quick status overview of all swimmers
  - Portal-based modal for expanded swimmer details
  - Shows latest feedback summary per swimmer
  - Displays XP level and rewards
  - Readiness score indicator (0-100)
  - Injury status badges
- **Data:** `Swimmer`, `Feedback`, `XpTransaction` tables

#### 4.1.4 Team Stats Panel (`TeamStatsPanel`)
- **Component:** `components/dashboard/TeamStatsPanel.tsx`
- **Functions:**
  - Monthly total distance swum (summed from all plans)
  - Team attendance rate percentage
  - Active swimmers count
  - Personal Best (PB) count
  - Weekly load chart (distance per week visualization)
  - Total team XP and average level
- **Data:** Aggregated from `TrainingPlan`, `AttendanceRecord`, `PerformanceRecord`, `Swimmer`

#### 4.1.5 Team Feedback Summary (`TeamFeedbackSummary`)
- **Component:** `components/dashboard/TeamFeedbackSummary.tsx`
- **Functions:**
  - Shows which swimmers have submitted weekly feedback for current week
  - Submission tracking grid (swimmer x status)
  - "Replied" / "Unreplied" status indicators
- **Data:** `WeeklyFeedback` table

#### 4.1.6 Pace Calculator (`PaceCalculator`)
- **Component:** `components/dashboard/PaceCalculator.tsx`
- **Functions:**
  - Input: total time (MM:SS) and distance
  - Calculates pace per 100m
  - Projects times for standard distances (50m, 100m, 200m, 400m, 800m, 1500m)
  - Bidirectional: can also calculate from pace to time
- **Data:** Pure client-side calculation

#### 4.1.7 Recent Performances (`RecentPerformances`)
- **Component:** `components/dashboard/RecentPerformances.tsx`
- **Functions:**
  - Shows latest 5 competition/meet times
  - Displays swimmer name, event, time, date, meet name
  - PB indicator badge
- **Data:** `PerformanceRecord` table, ordered by date DESC, limit 5

#### 4.1.8 Announcements Feed
- **Component:** `components/feed/AnnouncementCard.tsx`
- **Functions:**
  - Coach-authored announcements displayed as feed cards
  - Multi-block content rendering (text, images, videos, links)
  - Star/unstar toggle for important announcements
  - Delete with confirmation
  - Author and timestamp display
  - Swimmer targeting indicators (who can see this)
- **Data:** `CoachAnnouncement`, `AnnouncementBlock` tables

#### 4.1.9 Announcement Composer (`AnnouncementComposer`)
- **Component:** `components/dashboard/AnnouncementComposer.tsx`
- **Functions:**
  - Multi-block composer (text, image upload, video embed, external link)
  - Rich text editing with formatting toolbar
  - Swimmer targeting: select specific swimmers or entire group
  - File upload to R2 bucket
  - Star toggle for pinning
  - Posts to `POST /api/announcements`
- **Data:** Creates `CoachAnnouncement` + `AnnouncementBlock` records

#### 4.1.10 AI Insight Panel (`AIInsight`)
- **Component:** `components/dashboard/AIInsight.tsx`
- **Functions:**
  - Analyzes training plans for injury risks
  - Detects shoulder injury risk when paddles are used
  - Flags high-volume training sessions
  - Suggests opportunities (recovery days, technique focus)
  - Displays as warning/info cards on dashboard
- **Data:** Analyzes `TrainingPlan.blocks` JSON, cross-references `Swimmer.injuries`

#### 4.1.11 Onboarding Checklist (`OnboardingChecklist`)
- **Component:** `components/dashboard/OnboardingChecklist.tsx`
- **Functions:**
  - 3-step guide for first-time coaches:
    1. Add swimmers
    2. Create a training plan
    3. Record attendance
  - Auto-detects completion status
  - Dismissable
- **Data:** Checks `Swimmer`, `TrainingPlan`, `AttendanceRecord` counts

#### 4.1.12 Refresh Button (`RefreshButton`)
- **Component:** `components/dashboard/RefreshButton.tsx`
- **Functions:**
  - Shows sync status (idle spinner, syncing spinner, error state)
  - Manual page reload trigger
  - Visual indicator of background polling state
- **Data:** Reads `syncStatus` from store

### 4.2 Plan Management — `/dashboard/quick-plan` and Plan Editor

**File:** `app/(driver)/dashboard/quick-plan/page.tsx`

#### 4.2.1 Training Plan Creation/Edit
- **Component:** `components/dashboard/PlanModuleEditor.tsx` (largest component, ~60KB)
- **Functions:**
  - **Block CRUD:** Add/remove/reorder training blocks (Warmup, Main Set, Drill Set, Cool Down, Custom)
  - **Item CRUD within blocks:** Each block contains plan items with:
    - Stroke type (Free, Back, Breast, Fly, IM, Choice)
    - Distance (meters)
    - Rounds/Repetitions
    - Equipment (paddles, pull buoy, fins, snorkel, parachute, etc.)
    - Interval mode: fixed time, on-send-off, rest interval, or free
    - Target time per rep
    - Notes/description
  - **Plan metadata:**
    - Date picker
    - Start/end time
    - Group selector (Junior, Intermediate, Advanced)
    - Focus area text
    - Training type tag (aerobic, anaerobic, lactate, sprint, recovery, etc.)
    - Primary stroke tag
    - Coach notes
    - Targeted notes (per-swimmer private annotations)
    - Star toggle
  - **Two plan modes:**
    1. Text/block mode: structured training blocks via PlanModuleEditor
    2. Photo mode: upload handwritten plan image via PhotoUpload
  - **Draft auto-save:** Saves to localStorage every 30s, restores within 24h
- **API:** `POST /api/plans` (create), `PUT /api/plans` (update)
- **Implementation:** JSON-serialized blocks stored in `TrainingPlan.blocks` column

#### 4.2.2 Workout Library (`WorkoutLibrary`)
- **Component:** `components/dashboard/WorkoutLibrary.tsx`
- **Functions:**
  - Template browser for pre-built training blocks
  - Tabs: Templates | Tools
  - Templates tab:
    - System templates (built-in) and user-saved templates
    - Filter by category (Warmup, Main Set, Drill, Cool Down)
    - Search by name
    - Click to insert template into current plan
    - Save current block as new template
  - Tools tab:
    - Pace calculator integration
    - Distance calculator
  - **Data:** `BlockTemplate` table
  - **API:** `GET /api/templates` (list), `POST /api/templates` (save), `PUT /api/templates` (update), `DELETE /api/templates` (remove)

#### 4.2.3 Plan OCR Analysis (`PlanAnalysis`)
- **Component:** Referenced via `/api/plan-analysis` endpoint
- **Functions:**
  - Upload photo of handwritten training plan
  - OCR extracts text from image
  - Parses structured training blocks from raw text
  - AI-generated coaching suggestions
  - Detected patterns (e.g., "swimmer prefers 400 IM warmup")
- **Data:** `PlanAnalysis` table linked to `TrainingPlan`
- **API:** `POST /api/plan-analysis` (analyze), `GET /api/plan-analysis` (retrieve), `DELETE /api/plan-analysis` (remove)

### 4.3 Weekly Plan — `/dashboard/weekly-plan`

**File:** `app/(driver)/dashboard/weekly-plan/page.tsx`

#### 4.3.1 Weekly Plan Creation
- **Functions:**
  - Create weekly training plan with Monday-Sunday date range
  - Add daily sessions within the week (e.g., "Wednesday", "Saturday AM", "Saturday PM")
  - Each session supports multiple content modes:
    1. **Block mode** (`editorMode: "block"`): Content blocks (text, image, video, link)
    2. **Rich mode** (`editorMode: "rich"`): WYSIWYG HTML editor
    3. **Plan mode** (`editorMode: "plan"`): Full PlanModuleEditor with training blocks
    4. **Legacy mode** (`editorMode: "legacy"`): Single photo upload (base64)
  - Target group selection (Junior, Intermediate, Advanced, or All)
  - Individual swimmer targeting (override group selection)
  - Publish/unpublish toggle
  - Overview image upload (R2)
  - Overview rich text notes
- **Component:** `BlockEditor` (for block mode), `RichTextEditor` (for rich mode), `PlanModuleEditor` (for plan mode)
- **API:** `POST /api/weekly-plans` (create), `PUT /api/weekly-plans` (update), `DELETE /api/weekly-plans` (delete)
- **Sessions API:** `POST /api/weekly-plans/sessions` (add), `PUT /api/weekly-plans/sessions` (update), `DELETE /api/weekly-plans/sessions` (delete)

#### 4.3.2 Weekly Plan Card (`WeeklyPlanCard`)
- **Component:** `components/dashboard/WeeklyPlanCard.tsx`
- **Functions:**
  - Displays weekly plan summary
  - Target group badge
  - Session count
  - Publish status indicator
  - Preview/click to expand

### 4.4 Attendance Management — `/dashboard/attendance`

**File:** `app/(driver)/dashboard/attendance/page.tsx`

#### 4.4.1 Attendance Marking
- **Functions:**
  - Grid view of swimmers x dates (calendar-style)
  - Click to toggle attendance status for each swimmer on each date
  - Batch mark all swimmers present for a given date
  - Batch unmark (undo attendance)
  - Status levels: present, absent, late, excused
  - Only coaches can mark attendance (exclusive permission)
- **API:** `POST /api/attendance` (mark), `DELETE /api/attendance` (unmark)
- **Implementation:** Batch endpoint supports multiple swimmer IDs in single request

#### 4.4.2 Attendance Stats — `/dashboard/attendance/stats`

**File:** `app/(driver)/dashboard/attendance/stats/page.tsx`

- **Component:** `components/dashboard/AttendanceStats.tsx`
- **Functions:**
  - Monthly attendance statistics
  - Per-date attendance counts
  - Per-swimmer attendance rate
  - Attendance trend visualization
  - Color-coded calendar heatmap
- **Data:** Aggregated from `AttendanceRecord` table

### 4.5 Schedule — `/dashboard/schedule`

**File:** `app/(driver)/dashboard/schedule/page.tsx`

#### 4.5.1 Training Schedule View
- **Functions:**
  - Calendar view of upcoming training plans
  - Weekly/monthly toggle
  - Color-coded by group (Junior, Intermediate, Advanced)
  - Click plan to edit
  - Drag-and-drop rescheduling (if implemented)
  - Today indicator highlight
- **Data:** `TrainingPlan` table, filtered by date range

### 4.6 Athletes Management — `/dashboard/athletes`

**File:** `app/(driver)/dashboard/athletes/page.tsx`

#### 4.6.1 Swimmer CRUD
- **Component:** `components/dashboard/SwimmerModal.tsx`
- **Functions:**
  - **Add swimmer:** Name, group (Junior/Intermediate/Advanced), username, initial password, gender
  - **Edit swimmer:** Modify name, group, credentials, reset password
  - **Delete swimmer:** Cascade delete all associated records (feedbacks, attendance, performances, etc.)
  - **Swimmer list:** Searchable, filterable table with:
    - Name, group, status, readiness score
    - XP level badge
    - Last activity timestamp
    - Injury status indicator
  - **Group management:** Assign swimmers to groups
  - **Password management:** Set/reset swimmer login credentials
- **API:** `POST /api/swimmers` (create), `PUT /api/swimmers` (update), `DELETE /api/swimmers` (delete)
- **Implementation:** Passwords hashed with PBKDF2-SHA256 before storage

#### 4.6.2 XP Reward System
- **Component:** Integrated in swimmer management
- **Functions:**
  - Manual XP award to individual swimmers
  - Reason/note for reward
  - Transaction ledger tracking
- **API:** `POST /api/swimmers/reward`
- **Implementation:** Creates `XpTransaction` record with positive amount, updates `Swimmer.totalXp` and `Swimmer.balance`

### 4.7 Feedbacks — `/dashboard/feedbacks`

**File:** `app/(driver)/dashboard/feedbacks/page.tsx`

#### 4.7.1 Daily Feedback Browser
- **Functions:**
  - Browse all daily feedback submissions
  - Filter by swimmer, date range, RPE threshold
  - Sort by date, RPE, soreness
  - Expand feedback cards to view full comments
  - Good points / improvement areas breakdown
  - Coach reply capability (inline)
  - Flag/highlight concerning feedback
- **Data:** `Feedback` table with `Swimmer` join
- **API:** `GET /api/feedbacks` (list), `POST /api/feedbacks` (create by athletes)

#### 4.7.2 Weekly Feedback Summary
- **Functions:**
  - View all weekly feedback submissions
  - Per-swimmer submission status for current week
  - Read/unread toggle
  - Coach reply interface
  - Bulk reply capability
- **Data:** `WeeklyFeedback` table with `DailyFeedback` nested
- **API:** `GET /api/weekly-feedbacks` (list), `PATCH /api/weekly-feedbacks` (reply)

#### 4.7.3 Targeted Feedback — `/dashboard/feedbacks/targeted`

**File:** `app/(driver)/dashboard/feedbacks/targeted/page.tsx`

- **Functions:**
  - **Create feedback reminder:** Compose message, select target swimmers (individuals or entire team), set date range
  - **View responses:** See which swimmers have responded to each reminder
  - **Reply to responses:** Inline coach reply to individual targeted feedback
  - **Reminder status:** Pending, responded, overdue indicators
- **Components:** `components/athlete/TargetedFeedbackForm.tsx` (for athlete response view)
- **Data:** `FeedbackReminder`, `TargetedFeedback` tables
- **API:** `POST /api/feedback-reminders` (create), `GET /api/feedback-reminders` (list), `PATCH /api/feedback-reminders` (reply)

### 4.8 Meets — `/dashboard/meets`

**File:** `app/(driver)/dashboard/meets/page.tsx`

#### 4.8.1 Meet Management
- **Functions:**
  - Create/edit/delete swim meets
  - Meet details: name, date, time, location, description
  - Active/inactive toggle
  - Upcoming meets displayed in athlete countdown
  - Meet name appears in performance records
- **Data:** `Meet` table
- **API:** `GET /api/meets` (list), `POST /api/meets` (create), `PUT /api/meets` (update), `DELETE /api/meets` (delete)

### 4.9 Injury Monitor — `/dashboard/injury-monitor`

**File:** `app/(driver)/dashboard/injury-monitor/page.tsx`

#### 4.9.1 Team Injury Dashboard
- **Functions:**
  - View all swimmers with reported injuries
  - Injury body map visualization
  - Injury severity levels (1-10 scale)
  - Injury notes from swimmers
  - Injury images (uploaded photos/diagrams)
  - Filter by injury type (shoulder, knee, back, ankle, other)
  - Heat map overlay showing team-wide injury patterns
- **Component:** `components/athlete/InjuryMap.tsx` (shared with athlete side)
- **Data:** `Swimmer.injuries`, `Swimmer.injuryNote`, `Swimmer.injuryBodyMap`, `Swimmer.injuryImageUrl`

### 4.10 Archive — `/dashboard/archive`

**File:** `app/(driver)/dashboard/archive/page.tsx`

#### 4.10.1 Training Archive
- **Functions:**
  - Browse historical training plans beyond the 14-day auto-hide window
  - Search by date, group, focus area
  - View archived announcements
  - Export/print plan history
- **Data:** `TrainingPlan` (all dates), `CoachAnnouncement` (archived)
- **API:** `GET /api/archive/feedbacks` (archived feedbacks)

### 4.11 Settings — `/settings`

**File:** `app/(driver)/settings/page.tsx`

#### 4.11.1 Coach Settings
- **Functions:**
  - Change coach password
  - Update coach name
  - Language preference (EN/中文)
  - Theme selection
- **API:** `POST /api/auth/change-password`

### 4.12 Shared Dashboard Components

#### 4.12.1 Session Renderer (`SessionRenderer`)
- **Component:** `components/dashboard/SessionRenderer.tsx`
- **Functions:**
  - Renders daily session content based on `editorMode`
  - Block mode: renders content blocks (text, image, video, link)
  - Rich mode: renders sanitized HTML
  - Legacy mode: renders base64 image
  - Plan mode: renders training blocks via PlanModuleEditor
  - Sanitizes HTML via DOMPurify (`lib/sanitize-html.ts`)

#### 4.12.2 Content Block Editor (`BlockEditor`)
- **Component:** `components/dashboard/BlockEditor.tsx`
- **Functions:**
  - Edit multi-block content (text, image, video, link)
  - File upload to R2 bucket
  - Video platform auto-detection (Xiaohongshu, Douyin, Bilibili, QQ Video, YouTube)
  - Drag-and-drop reordering
  - Thumbnail generation for videos
  - Link card preview with Open Graph metadata
- **Block types:**
  - `text`: Markdown/plain text
  - `image`: R2 URL with optional caption
  - `video`: Embed URL with platform detection
  - `link`: External URL with preview card

#### 4.12.3 Rich Text Editor (`RichTextEditor`)
- **Component:** `components/dashboard/RichTextEditor.tsx`
- **Functions:**
  - WYSIWYG HTML editor
  - Toolbar: bold, italic, underline, lists, links, images
  - Image upload inline
  - Undo/redo history
  - HTML output sanitized on save

#### 4.12.4 Block Renderer (`BlockRenderer`)
- **Component:** `components/common/BlockRenderer.tsx`
- **Functions:**
  - Renders a single content block based on type
  - Text: renders as paragraph
  - Image: renders with click-to-fullscreen viewer
  - Video: embeds iframe with platform-specific handling
  - Link: renders as preview card with favicon and title

#### 4.12.5 Image Viewer (`ImageViewer`)
- **Component:** `components/common/ImageViewer.tsx`
- **Functions:**
  - Full-screen image modal/lightbox
  - Triggered via global event emitter
  - Click-outside to close
  - Zoom support

#### 4.12.6 Confirm Dialog (`ConfirmDialog`)
- **Component:** `components/common/ConfirmDialog.tsx`
- **Functions:**
  - Accessible modal confirmation dialog
  - Danger variant for destructive actions
  - Customizable title, description, button labels
  - Used for delete confirmations throughout the app

#### 4.12.7 Photo Upload (`PhotoUpload`)
- **Component:** `components/plan/PhotoUpload.tsx`
- **Functions:**
  - Drag-and-drop image upload
  - Canvas-based compression (prevents large image timeouts)
  - Preview before upload
  - File size validation
  - Uploads to R2 via `POST /api/upload`

### 4.13 Coach Navigation

#### 4.13.1 Sidebar (`Sidebar`)
- **Component:** `components/layout/Sidebar.tsx`
- **Functions:**
  - Fixed left sidebar (desktop)
  - Brand logo and name
  - Navigation items: Dashboard, Quick Plan, Weekly Plan, Attendance, Schedule, Athletes, Feedbacks, Meets, Injury Monitor, Archive, Settings
  - Active route highlight
  - Language toggle
  - Logout button
  - Collapsible on narrow screens

#### 4.13.2 Mobile Navigation (`MobileNav`)
- **Component:** `components/layout/MobileNav.tsx`
- **Functions:**
  - Hamburger menu icon (top-right)
  - Slide-out drawer menu
  - Same navigation items as sidebar
  - Auto-closes on route change
  - Touch-friendly tap targets

#### 4.13.3 Breadcrumbs (`Breadcrumbs`)
- **Component:** `components/common/Breadcrumbs.tsx`
- **Functions:**
  - Auto-generates breadcrumb trail from URL path
  - Uses i18n dictionary for translated labels
  - Clickable navigation links

---

## 5. Athlete App — Pages & Features

Athlete pages are in the `(athlete)` route group without a shared layout. Navigation is via the `BottomTabBar` component on mobile.

### 5.1 Login — `/login`

**File:** `app/(athlete)/login/page.tsx`
**Component:** `components/athlete/LoginForm.tsx`

**Functions:**
- Username + password login form
- Mode selector: athlete (default) or coach (`?role=coach`)
- Password visibility toggle
- DB warming on mount (pings `GET /api/keep-alive` to wake Neon serverless)
- Error display for invalid credentials
- Redirect to original destination after login
- Loading spinner during authentication

### 5.2 Training / Workout — `/workout`

**File:** `app/(athlete)/workout/page.tsx`

The main athlete page. Displays today's assigned training plan and related tools.

#### 5.2.1 Today's Training Plan Display
- **Functions:**
  - Shows today's training plan for the athlete's group
  - Displays all training blocks (Warmup, Main Set, Drill, Cool Down)
  - Per-block: stroke type, distance, rounds, equipment, interval mode, target time
  - Total distance summary
  - Plan photo display (if photo mode)
  - Weekly plan sessions display (if weekly plan published)
  - Coach notes display (general + targeted private notes)
  - Plan analysis/OCR results if available
- **Data:** `TrainingPlan` + `WeeklyPlan` + `DailySession` tables

#### 5.2.2 Training History (`TrainingHistory`)
- **Component:** `components/athlete/TrainingHistory.tsx`
- **Functions:**
  - Shows past 7 days of training sessions
  - Attendance status per day
  - Feedback submission status
  - Click to view past plan details
- **Data:** `TrainingPlan` + `AttendanceRecord` + `Feedback` tables

#### 5.2.3 Daily Feedback Form (`FeedbackForm`)
- **Component:** `components/athlete/FeedbackForm.tsx`
- **Functions:**
  - Rate perceived exertion (RPE) on 1-10 scale
  - Rate muscle soreness on 1-10 scale
  - Free-text comments
  - Good points section
  - Areas for improvement section
  - One submission per day per swimmer (enforced by `@@unique([swimmerId, date])`)
  - Auto-marks attendance upon submission
- **Data:** Creates `Feedback` record, creates `AttendanceRecord`
- **API:** `POST /api/feedbacks`
- **XP reward:** +20 XP for submitting feedback

#### 5.2.4 Block Feedback Panel (`BlockFeedbackPanel`)
- **Component:** `components/athlete/BlockFeedbackPanel.tsx`
- **Functions:**
  - Feedback on individual training blocks
  - Like/dislike reaction buttons
  - Optional text comment
  - Tag selection (e.g., "Too Tight", "Shoulder Pain", "Just Right")
  - One submission per block per swimmer (enforced by `@@unique([planId, blockId, swimmerId])`)
  - Real-time submission count display for coaches
- **Data:** `BlockFeedback` table
- **API:** `POST /api/block-feedbacks` (create), `GET /api/block-feedbacks` (list), `DELETE /api/block-feedbacks` (delete)

#### 5.2.5 Weekly Feedback Form (`WeeklyFeedbackForm`)
- **Component:** `components/athlete/WeeklyFeedbackForm.tsx`
- **Functions:**
  - Weekly summary feedback submission
  - Per-day sub-feedbacks (RPE, soreness, reflection) for each day of the week
  - Weekly summary text
  - Auto-save draft to localStorage
  - View previous week's submissions
  - View coach replies to past weekly feedback
  - Submission status indicator
- **Data:** `WeeklyFeedback` + `DailyFeedback` tables
- **API:** `GET /api/weekly-feedbacks` (list), `POST /api/weekly-feedbacks` (create), `PATCH /api/weekly-feedbacks` (update)
- **Constraints:** `@@unique([swimmerId, weekStart])` — one per swimmer per week

#### 5.2.6 Attendance Calendar (`AttendanceCalendar`)
- **Component:** `components/athlete/AttendanceCalendar.tsx`
- **Functions:**
  - Monthly calendar view
  - Attendance dots per day (present, absent, late, excused)
  - Today's check-in status highlight
  - Navigation between months
  - Attendance rate percentage display
- **Data:** `AttendanceRecord` table, filtered by swimmer ID

#### 5.2.7 Coach Reply Panel (`CoachReplyPanel`)
- **Component:** `components/athlete/CoachReplyPanel.tsx`
- **Functions:**
  - Displays coach replies to athlete's weekly feedback
  - Displays coach replies to targeted feedback
  - Reply timestamp
  - Read/unread status
- **Data:** `WeeklyFeedback.coachReply`, `TargetedFeedback.coachReply`

### 5.3 Profile — `/profile`

**File:** `app/(athlete)/profile/page.tsx`

#### 5.3.1 Profile Display
- **Functions:**
  - Avatar display (customizable via Shop)
  - Name, group, level badge
  - XP total and balance
  - Current streak (consecutive training days)
  - Level progress bar

#### 5.3.2 Profile Update Modal (`ProfileUpdateModal`)
- **Component:** `components/athlete/ProfileUpdateModal.tsx`
- **Functions:**
  - Edit injury status: shoulder, knee, back, ankle, other, or none
  - Injury severity scale (1-10)
  - Injury notes (free text description)
  - Injury image upload (photo of injury/diagram)
  - Best times management (add/edit/delete personal records)
  - Main stroke preference
  - Last update timestamp
- **Data:** `Swimmer.injuries`, `Swimmer.injuryNote`, `Swimmer.injuryBodyMap`, `Swimmer.injuryImageUrl`, `Swimmer.bestTimes`, `Swimmer.mainStroke`

#### 5.3.3 Injury Map (`InjuryMap`)
- **Component:** `components/athlete/InjuryMap.tsx`
- **Functions:**
  - Interactive SVG body map
  - Click body regions to set injury severity
  - Color-coded injury levels (green = healthy, yellow = mild, orange = moderate, red = severe)
  - Team heat map mode (coach view): aggregates all swimmer injuries
  - Read-only mode for viewing without editing
  - Save updates to profile
- **Data:** `Swimmer.injuryBodyMap` (JSON: `{"leftShoulder": 5, "lowerBack": 3, ...}`)

#### 5.3.4 Performance Tracker (`PerformanceTracker`)
- **Component:** `components/athlete/PerformanceTracker.tsx`
- **Functions:**
  - Add/edit competition/meet times
  - Event selection (50 Free, 100 Back, 200 Breast, 400 IM, etc.)
  - Time entry (MM:SS.ms or HH:MM:SS.ms)
  - Meet name input
  - Notes field
  - Auto-detects Personal Best (PB) by comparing with existing records
  - Improvement calculation (time delta from previous best)
  - PB badge on new records
- **Data:** `PerformanceRecord` table
- **API:** `POST /api/performances` (create), `PUT /api/performances` (update), `DELETE /api/performances` (delete)

#### 5.3.5 Performance Chart (`PerformanceChart`)
- **Component:** `components/athlete/PerformanceChart.tsx`
- **Functions:**
  - Line chart of times for a specific event over time
  - Trend indicator (improving, declining, stable)
  - PB marker on chart
  - Hover for exact time and date
- **Data:** `PerformanceRecord` table, filtered by event

### 5.4 Archive — `/archive`

**File:** `app/(athlete)/archive/page.tsx`

#### 5.4.1 Training Archive
- **Functions:**
  - Browse personal training history
  - Filter by date range
  - View past plans, feedback, and attendance
  - Export training log
- **API:** `GET /api/archive/feedbacks`

### 5.5 Shared Athlete Components

#### 5.5.1 Bottom Tab Bar (`BottomTabBar`)
- **Component:** `components/athlete/BottomTabBar.tsx`
- **Functions:**
  - Mobile bottom navigation with 5 tabs:
    1. **Training** — Today's workout
    2. **Feedback** — Submit/view feedback
    3. **Achievements** — XP, level, shop
    4. **Health** — Injury map, attendance calendar
    5. **Profile** — Personal info, settings
  - Active tab highlight
  - Icon + label per tab
  - Route-aware navigation

#### 5.5.2 Meet Countdown (`MeetCountdown`)
- **Component:** `components/athlete/MeetCountdown.tsx`
- **Functions:**
  - Fetches next active meet from database
  - Live countdown: days, hours, minutes, seconds
  - Meet name, date, location display
  - Auto-updates every second
  - Hides when no active meet scheduled
- **Data:** `Meet` table, filtered by `isActive = true`, nearest future date

#### 5.5.3 Avatar Renderer (`AvatarRenderer`)
- **Component:** `components/athlete/AvatarRenderer.tsx`
- **Functions:**
  - Renders composite avatar from equipped items
  - Layer-based rendering (base body, skin tone, expression, hair, hat, top, bottom, shoes, handheld, accessory, background)
  - Gender-specific assets (male/female/unisex)
  - Animated variant (subtle idle animation)
  - Handles legacy character format migration
  - Multiple sizes (small badge, medium profile, large showcase)
- **Data:** `Swimmer.equippedItems` JSON, `ShopItem` assets

#### 5.5.4 Background Picker (`BackgroundPicker`)
- **Component:** `components/athlete/BackgroundPicker.tsx`
- **Functions:**
  - Theme selection modal
  - Auto mode: time-based (day/night) or training-based (changes with workout type)
  - Manual mode: pick from available themes
  - Preview before applying
  - Theme persistence to localStorage
- **Data:** `lib/background-themes.ts` theme definitions

#### 5.5.5 Background Particles (`BackgroundParticles`)
- **Component:** `components/athlete/BackgroundParticles.tsx`
- **Functions:**
  - Animated background effects based on current theme
  - Stars, fire, or other particle effects
  - CSS-based animations (no canvas)
  - Theme-aware particle types

#### 5.5.6 Activity Feed (`ActivityFeed`)
- **Component:** `components/athlete/ActivityFeed.tsx`
- **Functions:**
  - Real-time notification feed
  - Activity types: XP earned, coach reward, buddy sync, milestone, level up, meet reminder, purchase
  - Unread badge counter
  - Mark as read on view
  - Pull-to-refresh
- **Data:** `ActivityFeedItem` table
- **API:** `GET /api/activity-feed` (list), `POST /api/activity-feed` (create)

#### 5.5.7 Buddy System (`BuddySystem`)
- **Component:** `components/athlete/BuddySystem.tsx`
- **Functions:**
  - Search for swimmers to add as buddy
  - Send buddy request (pending status)
  - Accept/decline incoming requests
  - View buddy profile card
  - Track buddy training stats (joint attendance, etc.)
  - Dissolve buddy pairing
  - Buddy XP bonus for training together
- **Data:** `BuddyPair` table
- **API:** `GET /api/buddy` (list pairs), `POST /api/buddy` (create pair)

#### 5.5.8 Shop & Closet (`ShopAndCloset`)
- **Component:** `components/athlete/ShopAndCloset.tsx`
- **Functions:**
  - **Shop tab:**
    - Browse avatar items by category (hair, top, bottom, expression, handheld, accessory, background)
    - Tier badges: basic, entry, advanced, premium, legendary, ultimate
    - Price display in XP
    - Gender filter (male, female, unisex)
    - Preview item on avatar before buying
    - Purchase with balance deduction
    - Tier-gated items (require certain level)
  - **Closet tab:**
    - View owned items
    - Equip/unequip items
    - Slot-based equipment (one per slot: head, eyes, body, lower, feet, hand, background)
    - Wishlist (up to 3 items)
  - **Coin economy:**
    - Earn coins (XP balance) through attendance, feedback, streaks
    - Spend coins on shop items
    - Balance tracked separately from total XP
- **Data:** `ShopItem`, `Swimmer.inventory`, `Swimmer.equippedItems`, `Swimmer.wishlist`, `XpTransaction`
- **API:** `GET /api/shop` (browse), `POST /api/shop` (purchase), `POST /api/shop/seed` (seed default items)

#### 5.5.9 Targeted Feedback Form (`TargetedFeedbackForm`)
- **Component:** `components/athlete/TargetedFeedbackForm.tsx`
- **Functions:**
  - Load pending feedback reminders from coach
  - Read coach's message/instruction
  - Submit response with text, RPE, and soreness
  - View coach's reply to previous responses
  - One response per reminder per swimmer
- **Data:** `FeedbackReminder`, `TargetedFeedback` tables
- **API:** `GET /api/feedback-reminders` (list pending), `POST /api/feedback-reminders` (submit response)

### 5.6 Athlete Gamification Features

#### 5.6.1 XP System
- **Earning XP:**
  - Attendance check-in: +10 XP
  - Feedback submission: +20 XP
  - Streak bonus: additional XP for consecutive days
  - Buddy training: XP bonus when both buddies attend
  - Coach manual reward: arbitrary XP amount
  - Milestone achievements: one-time XP bonuses
  - Personal Best: XP for new PB records
  - Starter pack: initial XP for new swimmers
- **XP Tracks:**
  - `totalXp`: Cumulative XP (never decreases), used for level calculation
  - `balance`: Spendable currency (decreases on purchases)
  - Legacy `xp` field kept for backward compatibility
- **Transaction Ledger:**
  - Every XP change recorded in `XpTransaction`
  - Source tracking: attendance, feedback, streak, buddy, coach_reward, milestone, pb, purchase, levelup, starter_pack
  - Balance snapshot after each transaction

#### 5.6.2 Level System
- **Level calculation:** Derived from `totalXp`
- **Level display:** Badge on profile, swimmer cards, and status panels
- **Level gating:** Some shop items require minimum level

#### 5.6.3 Streak System
- **`currentStreak`:** Consecutive training-day check-ins
- **`lastCheckIn`:** ISO date of last check-in
- **Streak bonus:** Additional XP earned for maintaining streaks
- **Streak reset:** Streak breaks if a training day is missed

---

## 6. API Endpoints Reference

### Authentication

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | Public | Authenticate user, set session cookie |
| `/api/auth/logout` | POST | Any | Clear session cookie |
| `/api/auth/me` | GET | Public | Return current user payload or 401 |
| `/api/auth/register-coach` | POST | Public | Create first coach account |

### Training Plans

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/plans` | GET | Any | List all training plans |
| `/api/plans` | POST | Coach | Create new training plan |
| `/api/plans` | PUT | Coach | Update existing training plan |
| `/api/plans` | DELETE | Coach | Delete training plan |

### Weekly Plans

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/weekly-plans` | GET | Any | List weekly plans |
| `/api/weekly-plans` | POST | Coach | Create weekly plan |
| `/api/weekly-plans` | PUT | Coach | Update weekly plan |
| `/api/weekly-plans` | DELETE | Coach | Delete weekly plan |
| `/api/weekly-plans/sessions` | POST | Coach | Add daily session to weekly plan |
| `/api/weekly-plans/sessions` | PUT | Coach | Update daily session |
| `/api/weekly-plans/sessions` | DELETE | Coach | Delete daily session |

### Swimmers

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/swimmers` | GET | Coach | List all swimmers |
| `/api/swimmers` | POST | Coach | Create new swimmer |
| `/api/swimmers` | PUT | Coach | Update swimmer |
| `/api/swimmers` | DELETE | Coach | Delete swimmer |
| `/api/swimmers/reward` | POST | Coach | Award XP to swimmer |

### Attendance

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/attendance` | GET | Coach | List attendance records |
| `/api/attendance` | POST | Coach | Mark attendance (single or batch) |
| `/api/attendance` | DELETE | Coach | Unmark attendance |

### Feedback

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/feedbacks` | GET | Coach | List all feedbacks |
| `/api/feedbacks` | POST | Athlete | Submit daily feedback |
| `/api/weekly-feedbacks` | GET | Any | List weekly feedbacks |
| `/api/weekly-feedbacks` | POST | Athlete | Create weekly feedback |
| `/api/weekly-feedbacks` | PATCH | Coach | Reply to weekly feedback |
| `/api/feedback-reminders` | GET | Any | List feedback reminders |
| `/api/feedback-reminders` | POST | Coach | Create feedback reminder |
| `/api/feedback-reminders` | PATCH | Coach | Reply to targeted feedback |
| `/api/block-feedbacks` | GET | Coach | List block-level feedbacks |
| `/api/block-feedbacks` | POST | Athlete | Submit block feedback |
| `/api/block-feedbacks` | DELETE | Athlete | Delete block feedback |
| `/api/weekly-feedbacks` (additional) | GET/POST/PATCH | Both | Weekly summary feedback CRUD |

### Performances

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/performances` | GET | Any | List performance records |
| `/api/performances` | POST | Athlete | Add competition time |
| `/api/performances` | PUT | Athlete/Coach | Update performance record |
| `/api/performances` | DELETE | Athlete/Coach | Delete performance record |

### Templates

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/templates` | GET | Any | List block templates |
| `/api/templates` | POST | Coach | Save template |
| `/api/templates` | PUT | Coach | Update template |
| `/api/templates` | DELETE | Coach | Delete template |

### Announcements

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/announcements` | GET | Any | List announcements |
| `/api/announcements` | POST | Coach | Create announcement |
| `/api/announcements` | PUT | Coach | Update announcement |
| `/api/announcements` | DELETE | Coach | Delete announcement |

### Meets

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/meets` | GET | Any | List meets |
| `/api/meets` | POST | Coach | Create meet |
| `/api/meets` | PUT | Coach | Update meet |
| `/api/meets` | DELETE | Coach | Delete meet |

### Shop & Economy

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/shop` | GET | Any | List shop items |
| `/api/shop` | POST | Athlete | Purchase item |
| `/api/shop/seed` | POST | System | Seed default shop items |

### Buddy System

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/buddy` | GET | Athlete | List buddy pairs |
| `/api/buddy` | POST | Athlete | Create buddy pair |

### Activity Feed

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/activity-feed` | GET | Athlete | List activity notifications |
| `/api/activity-feed` | POST | System | Create activity item |

### Archive

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/archive/feedbacks` | GET | Any | List archived feedbacks |

### Utility

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/upload` | POST | Coach | Upload file to R2 bucket |
| `/api/sync` | GET | Any | Polling sync of all entities |
| `/api/keep-alive` | GET | Public | Database keep-alive ping |
| `/api/diagnostic` | GET | Public | Error diagnostic info |
| `/api/plan-analysis` | GET | Any | Get plan OCR analysis |
| `/api/plan-analysis` | POST | Coach | Analyze plan photo |
| `/api/plan-analysis` | DELETE | Coach | Delete plan analysis |
| `/api/test-error` | GET | Public | Trigger test error |

---

## 7. Data Model

### Core Entities

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `CoachUser` | Coach accounts | id, username, password (hashed), name, createdAt |
| `Swimmer` | Athlete profiles | id, name, group, status, readiness, username, password, gender, xp/totalXp/balance/level, inventory, equippedItems, injuries, bestTimes |
| `TrainingPlan` | Daily training plans | id, date, group, blocks (JSON), totalDistance, focus, status, isStarred, trainingType, primaryStroke, imageUrl, analysis |
| `Feedback` | Daily athlete feedback | id, swimmerId, planId, date, rpe, soreness, comments, unique(swimmerId, date) |
| `AttendanceRecord` | Attendance tracking | id, date, swimmerId, status, timestamp |
| `PerformanceRecord` | Competition times | id, swimmerId, event, time, date, isPB, improvement, meetName |
| `BlockTemplate` | Reusable training blocks | id, templateId, name, category, type, rounds, items (JSON) |

### Extended Entities

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `WeeklyPlan` | Weekly training folder | id, weekStart, weekEnd, group, title, isPublished, targetGroup, targetSwimmerIds |
| `DailySession` | Daily session within week | id, weeklyPlanId, label, date, contentBlocks/trainingBlocks/contentHtml, editorMode |
| `WeeklyFeedback` | Weekly summary feedback | id, swimmerId, weekStart, summary, isSubmitted, coachReply, unique(swimmerId, weekStart) |
| `DailyFeedback` | Daily sub-feedback | id, weeklyFeedbackId, swimmerId, date, rpe, soreness, reflection |
| `FeedbackReminder` | Coach-initiated reminders | id, message, targetSwimmerIds, periodStart, periodEnd |
| `TargetedFeedback` | Athlete response to reminder | id, reminderId, swimmerId, content, coachReply, unique(reminderId, swimmerId) |
| `BlockFeedback` | Per-block athlete feedback | id, planId, blockId, swimmerId, reaction, comment, tags, unique(planId, blockId, swimmerId) |
| `CoachAnnouncement` | Team announcements | id, targetSwimmerIds, targetGroup, isStarred |
| `AnnouncementBlock` | Content blocks in announcement | id, announcementId, type, content, sortOrder |
| `PlanAnalysis` | OCR/AI analysis of plans | id, planId, imageUrl, rawText, structuredData, coachInsights, aiSuggestions |
| `Meet` | Swim meets | id, name, date, time, location, description, isActive |
| `ShopItem` | Avatar shop items | id, name, category, tier, price, imageKey, slotType, gender |
| `XpTransaction` | XP transaction ledger | id, swimmerId, amount, source, description, balanceAfter, totalXpAfter |
| `BuddyPair` | Swimmer buddy pairs | id, swimmer1Id, swimmer2Id, status, unique(swimmer1Id, swimmer2Id) |
| `ActivityFeedItem` | Activity notifications | id, swimmerId, type, title, detail, xpAmount, isRead |

### Composite Unique Constraints

| Constraint | Table | Enforcement |
|------------|-------|-------------|
| One feedback per swimmer per day | `Feedback` | `@@unique([swimmerId, date])` |
| One block feedback per block per swimmer | `BlockFeedback` | `@@unique([planId, blockId, swimmerId])` |
| One weekly feedback per swimmer per week | `WeeklyFeedback` | `@@unique([swimmerId, weekStart])` |
| One daily feedback per swimmer per date | `DailyFeedback` | `@@unique([swimmerId, date])` |
| One targeted response per reminder per swimmer | `TargetedFeedback` | `@@unique([reminderId, swimmerId])` |
| One buddy pair per swimmer pair | `BuddyPair` | `@@unique([swimmer1Id, swimmer2Id])` |

### Cascade Deletes

All child records cascade-delete when parent `Swimmer` is deleted: feedbacks, attendance, performances, block feedbacks, weekly feedbacks, daily feedbacks, targeted feedbacks, XP transactions, buddy pairs, activity feed items.

---

## 8. Architecture & Implementation Details

### 8.1 Layered Architecture

```
┌─────────────────────────────────────────────┐
│  React Components (UI Layer)                │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │Dashboard│  │Athlete   │  │Common     │  │
│  │Components│ │Components│  │Components │  │
│  └────┬────┘  └────┬─────┘  └─────┬─────┘  │
└───────┼────────────┼──────────────┼────────┘
        │            │              │
┌───────▼────────────▼──────────────▼────────┐
│  Global Store (lib/store.tsx)              │
│  ┌──────────────┐  ┌────────────────────┐  │
│  │ Sync Engine  │  │ Entity CRUD        │  │
│  │ (polling +   │  │ (optimistic updates│  │
│  │  mut. guard) │  │  + rollback)       │  │
│  └──────────────┘  └────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │ Persist Layer (localStorage, 7d TTL) │  │
│  └──────────────────────────────────────┘  │
└─────────────────┬──────────────────────────┘
                  │
┌─────────────────▼──────────────────────────┐
│  API Client (lib/api-client.ts)            │
│  30s timeout, 3 retries, exp. backoff      │
└─────────────────┬──────────────────────────┘
                  │
┌─────────────────▼──────────────────────────┐
│  Next.js API Routes (Edge Runtime)         │
│  ┌──────────────────────────────────────┐  │
│  │ withApiHandler() error wrapper       │  │
│  │ Neon quota detection (402 -> 503)    │  │
│  │ Auth guards (requireCoach/Athlete)   │  │
│  └──────────────────────────────────────┘  │
└─────────────────┬──────────────────────────┘
                  │
┌─────────────────▼──────────────────────────┐
│  Repository Layer (lib/repos/)             │
│  ┌──────────────────────────────────────┐  │
│  │ BaseRepo: JSON parse/stringify       │  │
│  │ Entity repos: swimmer, plan, etc.    │  │
│  └──────────────────────────────────────┘  │
└─────────────────┬──────────────────────────┘
                  │
┌─────────────────▼──────────────────────────┐
│  Neon Serverless Postgres (lib/db-pool.ts) │
│  Raw SQL via tagged template literals      │
└────────────────────────────────────────────┘
```

### 8.2 API Route Pattern

All API routes follow this structure:

```typescript
export const dynamic = 'force-dynamic'; // Edge Runtime

export async function GET(req: NextRequest) {
  return withApiHandler(async (request: typeof req) => {
    const auth = await requireCoach(request);
    if (auth instanceof NextResponse) return auth;

    const sql = getNeon();
    const rows = await sql`SELECT * FROM "Swimmer"`;
    return NextResponse.json(rows);
  });
}
```

Key conventions:
- `dynamic = 'force-dynamic'` on all routes
- Wrapped in `withApiHandler()` for error handling
- Auth guard checked at top of handler
- Raw SQL via `getNeon()` tagged templates
- JSON fields: `JSON.stringify` on write, `JSON.parse` on read
- `flattenPayload()` for POST/PUT bodies to prevent nested data bugs
- GET list responses return bare arrays `[]`, not `{ data: [...] }`
- `V12_FINGERPRINT` headers on all responses

### 8.3 State Management

**Store Provider** (`lib/store.tsx`)
- React Context + useReducer pattern
- Manages 9 collections: plans, swimmers, feedbacks, attendance, performances, templates, weeklyPlans, announcements, archivedAnnouncements
- Derived values: `visiblePlans` (filters old plans, keeps starred), `visibleAnnouncements`, `totalXP`
- Access via `useStore()` hook — never direct API fetch from components

**Sync Engine** (`lib/store/sync-engine.ts`)
- 60-second polling interval
- 15-second mutation guard (prevents polling from overwriting optimistic updates)
- Quota detection: detects Neon HTTP 402 errors, sets `dbOffline` flag
- Sync status: idle | syncing | error

**Entity CRUD** (`lib/store/entity-crud.ts`)
- Optimistic updates: local state updated immediately
- Rollback on failure: reverts to server state if API call fails
- localStorage persistence on every mutation
- Auto XP rewards for attendance (+10) and feedback (+20)

**Persist Layer** (`lib/store/persist-layer.ts`)
- localStorage with `aquaflow_local_` prefix
- 7-day TTL: data older than 7 days is discarded
- Graceful JSON parse failure handling

### 8.4 File Upload

**R2 Bucket** (Cloudflare)
- Configured in `wrangler.toml`
- Bucket name: `aquaflow-uploads`
- Used for: plan photos, announcement images, avatar items, injury images
- Upload flow: `POST /api/upload` returns R2 URL, stored in database

**Image Compression**
- Canvas-based compression before upload
- Prevents large image timeouts on serverless functions
- Max dimensions enforced

### 8.5 Bilingual Support (i18n)

**Dictionary** (`lib/dictionary.ts`)
- English and Chinese translations
- Key-based lookup via `useLanguage()` hook
- `LanguageToggle` component for switching
- Breadcrumbs use i18n dictionary for translated labels

### 8.6 HTML Sanitization

**Library:** DOMPurify
**File:** `lib/sanitize-html.ts`
- Applied to all rich text editor output
- Applied to all HTML stored in database
- Prevents XSS in user-generated content

### 8.7 Date Handling

**File:** `lib/date-utils.ts`
- `getLocalDateISOString()` — local-time date strings (timezone-safe)
- `parseUTCDate()` — server timestamp parsing
- Dates stored as `YYYY-MM-DD` strings throughout
- Week calculations use Monday as week start

### 8.8 Deployment

**Platform:** Cloudflare Pages
**Build:** `opennextjs-cloudflare build && wrangler deploy --minify`
**Config:**
- `serverExternalPackages`: `@prisma/client`, `.prisma/client`
- `ignoreBuildErrors: true` for deployment stability
- Turbopack enabled in `next.config.ts`
- TypeScript build errors intentionally ignored

**Database:** Neon Serverless Postgres
- Cold start: database wakes on first request (~2-5 seconds)
- Quota limits: detected and handled gracefully (503 response, offline mode)
- Keep-alive: `GET /api/keep-alive` prevents idle timeout

---

## 9. Gamification System

### 9.1 XP Dual-Track System

| Track | Purpose | Increases | Decreases |
|-------|---------|-----------|-----------|
| `totalXp` | Level calculation | Always | Never |
| `balance` | Shop currency | Earn rewards | Purchases |

### 9.2 XP Sources

| Source | Amount | Trigger |
|--------|--------|---------|
| Attendance | +10 XP | Coach marks swimmer present |
| Feedback | +20 XP | Swimmer submits daily feedback |
| Streak bonus | Variable | Consecutive training days |
| Buddy sync | Variable | Both buddies attend same day |
| Coach reward | Arbitrary | Manual award via `/api/swimmers/reward` |
| Personal Best | Variable | New PB in `PerformanceRecord` |
| Milestone | Variable | Achievement milestones |
| Starter pack | Initial | New swimmer creation |

### 9.3 Level Calculation

Level is auto-calculated from `totalXp`. The exact formula is implemented in the store's derived `totalXP` calculation.

### 9.4 Shop Economy

**Shop Items** (`ShopItem` table)

| Tier | Price Range | Examples |
|------|-------------|----------|
| basic | Low | Default swim cap, basic goggles |
| entry | Low-Medium | Colored caps, simple tops |
| advanced | Medium | Patterned items, accessories |
| premium | Medium-High | Special designs, rare colors |
| legendary | High | Championship items, gold medals |
| ultimate | Very High | Exclusive, milestone items |

**Slot Types:** base, skinTone, expression, hair, hat, top, bottom, shoes, handheld, accessory, background, specialSkin

### 9.5 Streak System

- `currentStreak` tracks consecutive training-day check-ins
- `lastCheckIn` records the ISO date of the most recent check-in
- Streak bonus XP awarded for maintaining streaks
- Streak resets when a training day is missed

### 9.6 Buddy System

- Swimmers can pair up as training buddies
- `BuddyPair` status: pending → active → dissolved
- Buddy XP bonus when both attend on the same day
- Buddy profile cards with shared stats
- Activity feed notifications for buddy events

### 9.7 Activity Feed

Notification types:
- `xp_earned` — XP from any source
- `coach_reward` — Manual coach XP award
- `buddy_sync` — Buddy training event
- `milestone` — Achievement milestone
- `levelup` — Level increase
- `meet_reminder` — Upcoming meet notification
- `purchase` — Shop purchase

---

## 10. State Management & Sync

### 10.1 Data Flow

```
Component calls useStore().createSwimmer(data)
  → Entity CRUD: optimistic update to local state
  → Persist: save to localStorage
  → API call: POST /api/swimmers
  → recordMutation(): activate 15s mutation guard
  → On success: sync confirms state
  → On failure: rollback to pre-mutation state
```

### 10.2 Polling Sync Cycle

```
Every 60 seconds:
  1. Check mutation guard (15s lockout after last mutation)
  2. If guard active: skip polling
  3. If guard expired: fetch all endpoints
     - GET /api/swimmers
     - GET /api/plans
     - GET /api/feedbacks
     - GET /api/attendance
     - GET /api/performances
     - GET /api/templates
     - GET /api/weekly-plans
     - GET /api/announcements
  4. Merge server data into local state
  5. Persist to localStorage
```

### 10.3 Offline Resilience

- **Quota exceeded:** `isQuotaError()` detects Neon 402, sets `dbOffline` flag
- **Offline mode:** stops polling, serves from localStorage
- **Recovery:** when database wakes, manual refresh resumes sync
- **TTL:** localStorage data expires after 7 days

### 10.4 Optimistic Update Pattern

```typescript
// 1. Capture current state for rollback
const previousState = { ...currentState };

// 2. Apply optimistic update
setState(applyMutation(currentState, newData));

// 3. Persist locally
persist(newState);

// 4. Signal mutation guard
recordMutation();

// 5. Send to server
try {
  await api.entity.create(data);
} catch (error) {
  // 6. Rollback on failure
  setState(previousState);
  persist(previousState);
  throw error;
}
```

---

## Appendix A: File Structure Summary

```
app/
  layout.tsx                    # Root layout
  page.tsx                      # Home page
  globals.css                   # Global styles
  (athlete)/
    login/page.tsx              # Login page
    workout/page.tsx            # Training view
    profile/page.tsx            # Profile page
    archive/page.tsx            # Training archive
  (driver)/
    layout.tsx                  # Coach dashboard layout
    dashboard/page.tsx          # Dashboard home
    settings/page.tsx           # Coach settings
    dashboard/attendance/page.tsx           # Attendance marking
    dashboard/attendance/stats/page.tsx     # Attendance stats
    dashboard/schedule/page.tsx             # Training schedule
    dashboard/athletes/page.tsx             # Swimmer management
    dashboard/quick-plan/page.tsx           # Plan creation
    dashboard/weekly-plan/page.tsx          # Weekly plan
    dashboard/feedbacks/page.tsx            # Feedback browser
    dashboard/feedbacks/targeted/page.tsx   # Targeted feedback
    dashboard/archive/page.tsx              # Archive
    dashboard/injury-monitor/page.tsx       # Injury dashboard
    dashboard/meets/page.tsx                # Meet management
  api/                          # All API route handlers
  poolside/page.tsx             # Poolside quick access
  setup/page.tsx                # Initial setup

components/
  athlete/                      # Athlete-facing components
  dashboard/                    # Coach dashboard components
  common/                       # Shared components
  auth/                         # Auth guards
  layout/                       # Sidebar, MobileNav
  feed/                         # Announcement cards
  plan/                         # Plan-related components

lib/
  store.tsx                     # Global state
  store/                        # Store sub-modules
  repos/                        # Database repositories
  api-client.ts                 # HTTP client
  api-handler.ts                # API error wrapper
  auth.ts                       # Password hashing
  auth-api.ts                   # API auth guards
  jwt.ts                        # JWT utilities
  db-pool.ts                    # Database connection
  dictionary.ts                 # Bilingual dictionary
  i18n.tsx                      # Language provider
  utils.ts                      # cn() utility
  validation.ts                 # Form validation
  sanitize-html.ts              # HTML sanitization
  date-utils.ts                 # Date handling
  background-themes.ts          # Theme definitions
  group-constants.ts            # Group level constants

middleware.ts                   # Edge route protection
wrangler.toml                   # Cloudflare deployment config
prisma/schema.prisma            # Database schema
```

---

## Appendix B: Component Size Reference

| Component | Relative Size | Notes |
|-----------|---------------|-------|
| `PlanModuleEditor.tsx` | Largest (~60KB) | Full training block editor |
| `BlockEditor.tsx` | Large | Multi-block content editor |
| `WorkoutLibrary.tsx` | Large | Template browser + tools |
| `ShopAndCloset.tsx` | Large | Avatar shop + inventory |
| `InjuryMap.tsx` | Medium-Large | Interactive SVG body map |
| `WeeklyFeedbackForm.tsx` | Medium-Large | Multi-day feedback form |
| `SwimmerModal.tsx` | Medium | Add/edit swimmer modal |
| `AthletesFeedbackPanel.tsx` | Medium | Team feedback overview |
| `TeamStatsPanel.tsx` | Medium | Team statistics |
| `PlanEditor` (legacy) | Medium | Plan creation wrapper |

---

## Appendix C: Route Protection Matrix

| Route | Public | Coach Only | Athlete Only |
|-------|--------|------------|--------------|
| `/` | Yes | - | - |
| `/login` | Yes | - | - |
| `/poolside` | Yes | - | - |
| `/setup` | Yes | - | - |
| `/dashboard/*` | No | Yes | No |
| `/settings/*` | No | Yes | No |
| `/workout/*` | No | No | Yes |
| `/profile/*` | No | No | Yes |
| `/archive/*` | No | No | Yes |
| `/api/auth/*` | Yes | - | - |
| `/api/*` (other) | Varies by endpoint | See API Reference | See API Reference |

---

*This document provides a comprehensive breakdown of every feature, its location, and implementation details for AquaFlow Pro. For development workflow instructions, see `CLAUDE.md`.*
