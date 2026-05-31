# AquaFlow Pro — Comprehensive Frontend Design Specification

**Date**: 2026-05-29  
**Version**: 1.6.0 (Apex Velocity Edition)  
**Status**: APPROVED  
**Stack**: Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Framer Motion · shadcn/ui · Lucide Icons  
**Production URL**: `https://sw.sportsflow.best`

---

## Table of Contents

1. [Design System Foundation](#1-design-system-foundation)
2. [Global Layout Architecture](#2-global-layout-architecture)
3. [Button & Interactive Element Specifications](#3-button--interactive-element-specifications)
4. [Navigation Architecture & Route Guards](#4-navigation-architecture--route-guards)
5. [Page-by-Page Specification: Public Pages](#5-page-by-page-specification-public-pages)
6. [Page-by-Page Specification: Coach Dashboard](#6-page-by-page-specification-coach-dashboard)
7. [Page-by-Page Specification: Athlete Portal](#7-page-by-page-specification-athlete-portal)
8. [Shared Component Library](#8-shared-component-library)
9. [State Management & Data Flow](#9-state-management--data-flow)
10. [Animation & Transition System](#10-animation--transition-system)
11. [Internationalization (i18n)](#11-internationalization-i18n)
12. [Future Features (Planned)](#12-future-features-planned)

---

## 1. Design System Foundation

### 1.1 Color Palette — CSS Custom Properties

All colors are defined in `app/globals.css` as HSL CSS custom properties. The application is **dark-mode only** — no `dark:` prefix is needed.

```css
/* === Primary Tokens (app/globals.css :root) === */
--background:           hsl(225 44% 7%);       /* #0a0e1a — Deep-sea navy */
--foreground:           hsl(210 40% 98%);       /* Near-white text */
--card:                 hsl(223 38% 13%);       /* #141b2d — Card surfaces */
--card-foreground:      hsl(210 40% 98%);
--primary:              hsl(183 100% 50%);      /* #00f2ff — Neon Cyan */
--primary-foreground:   hsl(225 44% 7%);        /* Dark text on cyan */
--secondary:            hsl(223 38% 13%);
--muted-foreground:     hsl(215 20% 65%);       /* #8899aa — Subdued text */
--border:               hsl(223 20% 20%);
--ring:                 hsl(183 100% 50%);      /* Focus ring = primary */
--radius:               0.75rem;                /* 12px base radius */

/* === Semantic Status Tokens === */
--success:              hsl(142 71% 45%);       /* #22c55e — Forest Emerald */
--warning:              hsl(50 100% 52%);       /* #ffd500 — Golden Amber */
--info:                 hsl(200 98% 55%);       /* #38bdf8 — Sky Blue */
--error:                hsl(3 100% 59%);        /* #ef4444 — Sprint Fire Red */
--destructive:          hsl(3 100% 59%);        /* Same as error */

/* === Glassmorphism Tokens === */
--glass-bg:             rgba(10, 14, 26, 0.7);
--glass-border:         rgba(0, 242, 255, 0.1);

/* === Wave / Water Tokens === */
--wave-primary:         rgba(100, 255, 218, 0.06);
--wave-secondary:       rgba(56, 189, 248, 0.04);
--wave-accent:          rgba(100, 255, 218, 0.12);
```

**How to use**: Always reference via Tailwind utilities — `bg-primary`, `text-muted-foreground`, `border-border`, `bg-success`, `text-error`, etc. **Never hardcode hex values** in components.

### 1.2 Typography System

| Token Class | Font Family | Weight | Tracking | Use Case |
|:---|:---|:---|:---|:---|
| Default body | System stack: `-apple-system, "Noto Sans SC", "PingFang SC"` | 400 | normal | All body text, form labels, paragraphs |
| `.font-display-metrics` | `'Inter', sans-serif` | 700 | `-0.02em` | Headings, large numerical displays, swimmer names |
| `.font-label-caps` | `'JetBrains Mono', monospace` | 500 | `0.1em` | Uppercase labels, XP counters, status badges, section headers |

**Usage in JSX**:
```tsx
<h1 className="font-display-metrics text-xl text-white">Dashboard</h1>
<span className="font-label-caps text-[10px] text-muted-foreground uppercase">Distance</span>
<p className="text-sm text-muted-foreground">Regular body text</p>
```

### 1.3 Spacing & Border Radius Conventions

| Element | Border Radius | Tailwind Class |
|:---|:---|:---|
| Cards, panels | 16px | `rounded-2xl` |
| Large hero cards | 24px | `rounded-3xl` |
| Buttons (pill) | 9999px | `rounded-full` |
| Buttons (block) | 12px | `rounded-xl` |
| Inputs | 12px | `rounded-xl` |
| Avatars | 9999px | `rounded-full` |
| Tab indicators | 8px | `rounded-lg` |

### 1.4 Glassmorphism Utilities

Defined in `app/globals.css` — use these CSS classes on overlay panels and premium cards:

```css
.glass-panel {
  background: rgba(10, 25, 47, 0.55);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.4);
}

.glass-panel-hover:hover {
  background: rgba(10, 25, 47, 0.7);
  border-color: rgba(100, 255, 218, 0.2);
  box-shadow: 0 15px 40px 0 rgba(100, 255, 218, 0.12);
  transform: translateY(-2px);
}

.glow-border {
  border: 1px solid rgba(0, 242, 255, 0.15);
}
.glow-border:hover {
  border: 1px solid rgba(0, 242, 255, 1);
  box-shadow: 0 0 8px rgba(0, 242, 255, 0.2);
}
```

### 1.5 Dynamic Contextual Background Themes

Backgrounds shift automatically based on time-of-day or active training type. Managed by `useBackgroundTheme()` hook (from `hooks/useBackgroundTheme.ts`) and theme definitions in `lib/background-themes.ts`.

| Theme ID | Trigger | Gradient (Tailwind) | Particle System |
|:---|:---|:---|:---|
| `morning-pool` | 06:00–09:00 | `from-[#1a1505] via-[#1a2020] to-[#0a1520]` | Gold-gray SVG wave strokes |
| `sunlit-deck` | 09:00–14:00 | `from-[#1a2520] via-[#152520] to-[#0a1a25]` | None |
| `afternoon-training` | 14:00–17:00 | `from-[#151525] via-[#1a1525] to-[#0f0a20]` | None |
| `golden-sunset` | 17:00–20:00 | `from-[#1a0a05] via-[#1a1005] to-[#0a0a15]` | None |
| `deep-ocean` | 20:00–23:00 | `from-[#050a1a] via-[#0a0f20] to-[#050515]` | None |
| `night-waters` | 23:00–06:00 | `from-[#0a0a1a] via-[#0d0d2b] to-[#050510]` | 40 CSS twinkling stars + crescent moon |
| `sprint-fire` | `trainingType === "sprint"` | `from-[#1a0505] via-[#2d0a0a] to-[#0f0303]` | 20 rising fire particles |
| `recovery-calm` | `trainingType === "recovery"` | `from-[#051510] via-[#0a1a15] to-[#05100a]` | None |
| `aerobic-flow` | `trainingType === "aerobic"` | `from-[#051a1a] via-[#0a1a1a] to-[#050a15]` | None |
| `anaerobic-power` | `trainingType === "anaerobic"` | `from-[#1a0520] via-[#150520] to-[#0a0515]` | None |

**Resolution priority**: Manual user pick (localStorage `aquaflow_bg_theme`) → Training-type match → Time-of-day auto-switch.

**Usage in athlete pages**:
```tsx
const { theme, gradientClass } = useBackgroundTheme(currentTrainingType);
// Apply:
<div className={cn("min-h-screen bg-gradient-to-br", gradientClass)}>
```

The swimmer can manually override via the **BackgroundPicker** modal (triggered by clicking the `<Palette>` icon button in the athlete header).

### 1.6 Training Type Theme Overrides

When a training type is active, CSS class `theme-{type}` is applied to the root, overriding `--primary`, `--background`, `--card`, and adding `--theme-glow` / `--theme-texture`:

| CSS Class | Primary Override | Glow Color |
|:---|:---|:---|
| `.theme-aerobic` | `hsl(190 100% 50%)` — Deep cyan | `rgba(0, 229, 255, 0.12)` |
| `.theme-anaerobic` | `hsl(350 100% 55%)` — Crimson | `rgba(255, 23, 68, 0.12)` |
| `.theme-lactate` | `hsl(280 90% 60%)` — Purple | `rgba(224, 64, 251, 0.12)` |
| `.theme-sprint` | `hsl(45 100% 50%)` — Gold | `rgba(255, 196, 0, 0.12)` |
| `.theme-recovery` | `hsl(150 90% 55%)` — Emerald | `rgba(0, 230, 118, 0.12)` |
| `.theme-strength` | `hsl(25 90% 55%)` — Orange | `rgba(255, 109, 0, 0.12)` |
| `.theme-race_prep` | `hsl(46 80% 54%)` — Dark gold | `rgba(212, 175, 55, 0.16)` |

---

## 2. Global Layout Architecture

### 2.1 Coach Dashboard Layout (`app/(driver)/layout.tsx`)

The coach portal uses a **fixed left sidebar + top mobile nav** layout:

```
┌──────────────────────────────────────────────────────────────┐
│ [Desktop ≥ md]                                               │
│ ┌──────────┬─────────────────────────────────────────────────┐│
│ │ Sidebar  │                                                ││
│ │ (w-64)   │     Main Content Area                          ││
│ │ fixed    │     (md:pl-64, container max-w-7xl)            ││
│ │ left-0   │     p-4 md:p-8                                 ││
│ │          │                                                ││
│ └──────────┴─────────────────────────────────────────────────┘│
│                                                              │
│ [Mobile < md]                                                │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Top Bar (h-16, fixed, z-50) — Brand + Hamburger           ││
│ ├────────────────────────────────────────────────────────────┤│
│ │ Main Content (pt-16)                                      ││
│ │ Fullscreen overlay menu slides in when hamburger clicked   ││
│ └────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Guard**: Wrapped in `<CoachGuard>` which verifies `role === 'coach'` from JWT. If invalid → redirect to `/login?role=coach`.

**Session warning**: `useSessionExpiryWarning()` hook monitors JWT expiration and shows a warning toast before timeout.

### 2.2 Athlete Portal Layout (No shared layout file — inline in pages)

The athlete portal uses a **sticky top header + fixed bottom tab bar** layout:

```
┌──────────────────────────────────┐
│ Sticky Header (z-50)             │
│ [Avatar+Name+XP] [Palette][🔔][🌐][↪]│
├──────────────────────────────────┤
│                                  │
│   Main Content (pb-24)           │
│   (max-w-2xl mx-auto, p-4)      │
│                                  │
├──────────────────────────────────┤
│ Fixed Bottom Tab Bar (z-50)      │
│ [训练] [反馈] [成绩] [状态] [我的] │
└──────────────────────────────────┘
```

The entire page background uses the dynamic contextual gradient system. A `<WaveAnimation>` component renders a persistent decorative SVG wave at the bottom of the viewport.

### 2.3 Sidebar Navigation Items (Coach)

Defined in `components/layout/Sidebar.tsx` — exact items array:

```typescript
const SIDEBAR_ITEMS = [
  { label: "dashboard",        href: "/dashboard",                  icon: LayoutDashboard },
  { label: "weeklyPlan",       href: "/dashboard/weekly-plan",      icon: FolderPlus },
  { label: "quickPlan",        href: "/dashboard/quick-plan",       icon: PlusCircle },
  { label: "athletes",         href: "/dashboard/athletes",         icon: Users },
  { label: "attendance",       href: "/dashboard/attendance",       icon: UserCheck },
  { label: "schedule",         href: "/dashboard/schedule",         icon: Calendar },
  { label: "feedbackInbox",    href: "/dashboard/feedbacks",        icon: MessageSquare },
  { label: "targetedFeedback", href: "/dashboard/feedbacks/targeted", icon: Send },
  { label: "meets",            href: "/dashboard/meets",            icon: Trophy },
  { label: "injuryMonitor",    href: "/dashboard/injury-monitor",   icon: Activity },
  { label: "feedbackArchive",  href: "/dashboard/archive",         icon: FolderOpen },
  { label: "settings",         href: "/settings",                   icon: Settings },
];
```

**Visual behavior**:
- Active item: `bg-primary/10 text-primary font-semibold shadow-[0_0_20px_rgba(100,255,218,0.1)]` + left-edge 1px cyan indicator bar.
- Inactive item: `text-muted-foreground hover:bg-white/5 hover:text-white`.
- Labels resolve via `t.common[item.label]` from the i18n dictionary.
- Sidebar footer contains: `<LanguageToggle>` + Logout button (red, navigates to `/login?role=coach`).

### 2.4 Bottom Tab Bar (Athlete)

Defined in `components/athlete/BottomTabBar.tsx`:

```typescript
const tabs = [
  { id: 'training',     label: '训练', icon: Waves,          href: '/workout',                match: 'training' },
  { id: 'feedback',     label: '反馈', icon: MessageSquare,   href: '/workout?tab=feedback',    match: 'feedback' },
  { id: 'achievements', label: '成绩', icon: TrendingUp,      href: '/workout?tab=achievements', match: 'achievements' },
  { id: 'health',       label: '状态', icon: Activity,         href: '/workout?tab=health',      match: 'health' },
  { id: 'profile',      label: '我的', icon: UserCircle,       href: '/profile',                 match: 'profile' },
];
```

**Visual behavior**:
- Container: `fixed bottom-0, bg-[#0f131f]/75 backdrop-blur-xl border-t border-white/5`.
- Active tab: `text-primary` + top cyan indicator bar `w-10 h-0.5 bg-primary shadow-[0_0_12px_rgba(0,242,255,0.8)]`.
- Active icon gets: `drop-shadow-[0_0_8px_rgba(0,242,255,0.6)]`.
- Label styling: `text-[10px] uppercase tracking-wider font-label-caps`.
- Navigation uses `router.push(href, { scroll: false })`.

**Tab persistence**: The active tab is stored in `localStorage` key `aquaflow_active_tab` so that returning from `/profile` restores the previous tab.

---

## 3. Button & Interactive Element Specifications

### 3.1 Size Tiers

| Tier | Height | Font Size | Padding | Min Touch Target | Use Cases |
|:---|:---|:---|:---|:---|:---|
| **Small** | 32px | 12px (`text-xs`) | `px-3 py-1` | 32×32 | Inline filters, table row actions, tab pills |
| **Medium** | 44px | 14px (`text-sm`) | `px-4 py-3` or `px-5 py-2` | 44×44 | Form buttons, nav links, modal actions |
| **Large** | 56px | 16px (`text-base`) | `px-8 py-4` | 56×56 | Hero CTAs, "Submit Feedback", "Check In" |
| **XL Poolside** | 72px+ | 20px (`text-xl`) | `px-10 py-6` | 72×72 | Poolside attendance toggles (wet-hand optimized) |

> **Accessibility rule**: All interactive elements enforce `min-h-[44px] min-w-[44px]` (WCAG 2.5.5 target size).

### 3.2 Color Variants with Exact Tailwind Classes

#### Primary Cyan Glow (Main CTA)
```tsx
// Normal state
className="bg-primary text-primary-foreground rounded-full font-bold 
           hover:bg-primary/90 hover:scale-[1.02] hover:brightness-110
           transition-all shadow-md min-h-[44px]"

// Disabled state
className="bg-secondary text-muted-foreground cursor-wait"
```
**Used for**: Login, Submit Feedback, Create Plan, Publish, Save, Check In.

#### Secondary Glass (Neutral Action)
```tsx
className="bg-white/10 text-white rounded-xl font-medium
           hover:bg-white/20 transition-colors min-h-[44px]"
```
**Used for**: Cancel, Back, secondary navigation, filter toggles.

#### Forest Emerald Success
```tsx
className="bg-success/20 text-success border border-success/50 
           rounded-xl font-medium min-h-[44px]"
```
**Used for**: "Active" status toggle, checked-in state, saved confirmation.

#### Sprint Fire Red (Danger/Warning)
```tsx
className="bg-error/10 text-error border border-error/20 rounded-full
           hover:bg-error/20 transition-all min-h-[44px]"
```
**Used for**: Logout, Delete, "Injured" status toggle, high-RPE alerts.

#### Golden Warning
```tsx
className="bg-warning/20 text-warning border border-warning/50 
           rounded-xl font-medium min-h-[44px]"
```
**Used for**: "Resting" status toggle, pending badges.

### 3.3 Loading State Pattern

All async buttons follow this pattern:
```tsx
<button disabled={isLoading} className={cn(
  "flex items-center justify-center gap-2 min-h-[44px]",
  isLoading ? "bg-secondary text-muted-foreground cursor-wait"
             : "bg-primary text-primary-foreground hover:scale-[1.02]"
)}>
  {isLoading ? (
    <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
  ) : (
    "Submit"
  )}
</button>
```

### 3.4 Every Button and Its Navigation Destination

#### Landing Page (`/`)

| Button | Style | Icon | Navigates To | Function |
|:---|:---|:---|:---|:---|
| "教练登录" (Coach Login) | Large Primary Cyan, `rounded-full` | `<UserCog>` + `<ArrowRight>` | `/login?role=coach` | Opens login page pre-set to coach mode |
| "运动员登录" (Athlete Login) | Large Secondary Glass, `rounded-full` | `<User>` | `/workout` | Opens athlete workout page (redirects to login if no session) |

#### Login Page (`/login`)

| Button | Style | Icon | Navigates To | Function |
|:---|:---|:---|:---|:---|
| Role toggle: "运动员" | Primary Cyan when active, muted when inactive | `<User>` | N/A (in-page toggle) | Sets `mode = "athlete"` |
| Role toggle: "教练" | Primary Cyan when active, muted when inactive | `<UserCog>` | N/A (in-page toggle) | Sets `mode = "coach"` |
| "登录" (Login) | Full-width Large Primary Cyan | `<Loader2>` when loading | Coach → `/dashboard`, Athlete → `/workout` | POSTs to `/api/auth/login` with exponential retry (3 attempts) |
| "取消" (Cancel) | Full-width muted text | None | N/A | Aborts in-flight login request |
| "初始化页面" link | Inline text link, `text-primary hover:underline` | None | `/setup` | Password reset instructions (coach only) |
| Eye toggle | Small icon button, `text-muted-foreground` | `<Eye>` / `<EyeOff>` | N/A | Toggles password field visibility |

**Login flow detail**:
1. On mount, `GET /api/auth/me` fires to warm DB (prevents cold-start latency).
2. Every 45s, a keep-alive ping fires while user is on the login page.
3. Submit triggers `POST /api/auth/login` with `{ username, password, role }`.
4. On success, waits up to 2s polling `document.cookie` for `aquaflow_session` cookie to commit.
5. Coach → `router.push("/dashboard")`. Athlete → stores `user.id` in `localStorage("aquaflow_athlete_id")` → `router.push("/workout")`.
6. HTTP 429 → shows rate limit message immediately (no retry).
7. HTTP 401/400 → shows "incorrect credentials" (no retry).
8. Other errors → retries up to 3 times with exponential backoff (1s, 3s, 4.5s).

#### Setup Page (`/setup`)

| Button | Style | Icon | Navigates To | Function |
|:---|:---|:---|:---|:---|
| "Create Account" | Full-width Large Primary Cyan | `<ArrowRight>` | `/dashboard` | POSTs to `/api/auth/register-coach`. Only works if no CoachUser exists in DB. |

**Form fields**: Display Name, Username, Password (min 6 chars), Confirm Password.  
**Validation**: Client-side password match + length check. Server-side uniqueness check.

#### Coach Dashboard (`/dashboard`)

| Button / Element | Style | Icon | Navigates To | Function |
|:---|:---|:---|:---|:---|
| `<RefreshButton>` | Medium glass circle | `<RefreshCw>` spin animation | N/A | Triggers `forceSync()` on the global store |
| `<LanguageToggle>` | Small pill toggle | None | N/A | Toggles `en` ↔ `zh` in `LanguageProvider` |
| Logout button | Round `bg-error/10`, 44×44px | `<LogOut>` / `<Loader2>` | `/login?role=coach` | Calls `api.auth.logout()` then `router.push('/login?role=coach')` |
| Mobile "周训练计划" quick-action | Full-width Large Primary Cyan (mobile only) | `<FolderPlus>` | `/dashboard/weekly-plan` | Direct mobile shortcut |
| "创建计划" (Create Plan) | Medium Primary Cyan pill | `<FolderPlus>` | `/dashboard/weekly-plan` | Next to "Recent Plans" heading |
| "创建第一个周计划" (empty state) | Medium Primary Cyan pill | None | `/dashboard/weekly-plan` | Shown when no plans exist |
| "查看全部" archive toggle | Small text button | `<ChevronDown>` / `<ChevronUp>` | N/A | Toggles archived announcements visibility |
| "加载更多" (Load More) | Small text button | None | N/A | Increases `archiveLimit` by 10 |
| "查看更多面板" / "收起更多" | Full-width text toggle | `<ChevronDown>` / `<ChevronUp>` | N/A | Shows/hides: RecentPerformances, TeamFeedbackSummary, TeamStatsPanel, OnboardingChecklist |

**Dashboard layout** — 3-column grid on `lg:`, stacked on mobile:
- **Left column**: `<TodayAttendance>` → `<AnnouncementComposer>` → Announcements feed → Archived feed
- **Middle column**: Recent Plans heading + `<WeeklyPlanCard>` list
- **Right column**: `<SwimmerStatusPanel>` → `<AthletesFeedbackPanel>` → Collapsible "More" section

#### Coach Sidebar (All pages)

| Item | Icon | Navigates To |
|:---|:---|:---|
| Dashboard | `<LayoutDashboard>` | `/dashboard` |
| Weekly Plan | `<FolderPlus>` | `/dashboard/weekly-plan` |
| Quick Plan | `<PlusCircle>` | `/dashboard/quick-plan` |
| Athletes | `<Users>` | `/dashboard/athletes` |
| Attendance | `<UserCheck>` | `/dashboard/attendance` |
| Schedule | `<Calendar>` | `/dashboard/schedule` |
| Feedback Inbox | `<MessageSquare>` | `/dashboard/feedbacks` |
| Targeted Feedback | `<Send>` | `/dashboard/feedbacks/targeted` |
| Meets | `<Trophy>` | `/dashboard/meets` |
| Injury Monitor | `<Activity>` | `/dashboard/injury-monitor` |
| Feedback Archive | `<FolderOpen>` | `/dashboard/archive` |
| Settings | `<Settings>` | `/settings` |
| Logout | `<LogOut>` | `/login?role=coach` (with `window.confirm` dialog) |

#### Athlete Header (Workout + Profile pages)

| Button | Icon | Navigates To | Function |
|:---|:---|:---|:---|
| Avatar+Name area (Link) | Swimmer's `<AvatarRenderer>` 40px | `/profile` | Navigates to profile page |
| Background picker | `<Palette>` | N/A (opens modal) | Opens `<BackgroundPicker>` overlay |
| Activity feed bell | `<Bell>` (inside `<ActivityFeed>`) | N/A (opens dropdown) | Shows recent activity notifications |
| Language toggle | `<LanguageToggle>` | N/A | Toggles `en` ↔ `zh` |
| Logout | `<LogOut>` / `<Loader2>` | `/login` | Calls `api.auth.logout()`, removes `aquaflow_athlete_id` from localStorage |

#### Athlete Bottom Tab Bar

| Tab | Label | Icon | Navigates To | Content Shown |
|:---|:---|:---|:---|:---|
| Training | 训练 | `<Waves>` | `/workout` | Weekly framework + daily plan viewer + block feedback |
| Feedback | 反馈 | `<MessageSquare>` | `/workout?tab=feedback` | Targeted tasks + weekly feedback form + coach replies |
| Achievements | 成绩 | `<TrendingUp>` | `/workout?tab=achievements` | Training history + performance records |
| Health | 状态 | `<Activity>` | `/workout?tab=health` | Readiness slider + status toggle + injury map + monthly stats |
| Profile | 我的 | `<UserCircle>` | `/profile` | Shop, Buddy, Profile settings, Injury sub-tabs |

---

## 4. Navigation Architecture & Route Guards

### 4.1 Middleware Route Protection (`middleware.ts`)

```
PUBLIC ROUTES (no auth):
  /                   — Landing page
  /login              — Authentication portal
  /poolside           — Poolside quick-access
  /setup              — Initial coach setup
  /api/auth/*         — Auth endpoints
  /_next/*, static    — Next.js internals

COACH-ONLY ROUTES (require role=coach JWT):
  /dashboard/*        — All dashboard sub-pages
  /settings           — Coach settings
  → Failure: redirect to /login?role=coach&redirect={pathname}

ATHLETE-ONLY ROUTES (require role=athlete JWT):
  /workout/*          — Workout pages
  /profile            — Athlete profile
  /archive            — Training archive
  → Failure: redirect to /login?role=athlete&redirect={pathname}
```

### 4.2 Client-Side Auth Guards

**Coach**: `<CoachGuard>` component wraps the `(driver)` layout. Verifies session via `GET /api/auth/me`. If no coach session → redirects to `/login?role=coach`.

**Athlete**: No wrapper component. Auth is checked inside `app/(athlete)/workout/page.tsx`:
1. Reads `localStorage("aquaflow_athlete_id")`.
2. If missing → `router.push("/login")`.
3. Waits for store to hydrate (`storeLoaded === true`).
4. Looks up swimmer in `swimmers` array.
5. If not found + store loaded → shows "Session Expired" card with "返回登录页" button → `/login`.

### 4.3 Logout Flow

**Coach logout** (Sidebar / MobileNav / Dashboard header):
```typescript
if (!window.confirm('确认要退出登录吗？')) return;
try { await api.auth.logout(); } catch {}
window.location.href = '/login?role=coach';
```

**Athlete logout** (Header / Profile):
```typescript
try { await api.auth.logout(); } catch {}
localStorage.removeItem("aquaflow_athlete_id");
router.push('/login');
```

### 4.4 Complete Route Map

| Route | Guard | Page File | Primary Component(s) |
|:---|:---|:---|:---|
| `/` | Public | `app/page.tsx` | Inline landing |
| `/login` | Public | `app/(athlete)/login/page.tsx` | `<LoginForm>` |
| `/setup` | Public | `app/setup/page.tsx` | Inline setup form |
| `/poolside` | Public | `app/poolside/page.tsx` | Inline poolside viewer |
| `/dashboard` | Coach | `app/(driver)/dashboard/page.tsx` | TodayAttendance, SwimmerStatusPanel, AthletesFeedbackPanel, AnnouncementComposer, WeeklyPlanCard, TeamStatsPanel, etc. |
| `/dashboard/weekly-plan` | Coach | `app/(driver)/dashboard/weekly-plan/page.tsx` | WeeklyPlan editor |
| `/dashboard/quick-plan` | Coach | `app/(driver)/dashboard/quick-plan/page.tsx` | PlanEditor |
| `/dashboard/athletes` | Coach | `app/(driver)/dashboard/athletes/page.tsx` | SwimmerModal, roster grid |
| `/dashboard/attendance` | Coach | `app/(driver)/dashboard/attendance/page.tsx` | Attendance grid |
| `/dashboard/attendance/stats` | Coach | `app/(driver)/dashboard/attendance/stats/page.tsx` | AttendanceStats heatmap |
| `/dashboard/schedule` | Coach | `app/(driver)/dashboard/schedule/page.tsx` | Calendar view |
| `/dashboard/feedbacks` | Coach | `app/(driver)/dashboard/feedbacks/page.tsx` | Feedback inbox dual-pane |
| `/dashboard/feedbacks/targeted` | Coach | `app/(driver)/dashboard/feedbacks/targeted/page.tsx` | Targeted reminder management |
| `/dashboard/meets` | Coach | `app/(driver)/dashboard/meets/page.tsx` | Meet scheduler |
| `/dashboard/injury-monitor` | Coach | `app/(driver)/dashboard/injury-monitor/page.tsx` | SVG heatmap |
| `/dashboard/archive` | Coach | `app/(driver)/dashboard/archive/page.tsx` | Plan search/filter archive |
| `/settings` | Coach | `app/(driver)/settings/page.tsx` | Password change, config |
| `/workout` | Athlete | `app/(athlete)/workout/page.tsx` | Full athlete portal (4 tabs) |
| `/profile` | Athlete | `app/(athlete)/profile/page.tsx` | Profile with 4 sub-tabs |
| `/archive` | Athlete | `app/(athlete)/archive/page.tsx` | Training archive/history |

---

## 5. Page-by-Page Specification: Public Pages

### 5.1 Landing Page (`/`) — `app/page.tsx`

**UX Context**: This is the first page any user sees. It serves as a brand hero and a router hub. Logged-in users should ideally be auto-redirected (currently not implemented — the landing just shows two buttons).

**Layout**: Full viewport centered flex container. `min-h-screen bg-background text-white`.

**Elements**:
1. **Title block**: `animate-in fade-in zoom-in duration-700`
   - `<h1>`: "AquaFlow `<span class="text-primary">PRO</span>`" — `text-6xl font-bold tracking-tighter`
   - `<p>`: "游泳队训练管理系统" — `text-xl text-muted-foreground`
2. **Action buttons row**: `flex gap-4 justify-center`
   - Coach login: `<Link href="/login?role=coach">` — Large Primary Cyan pill with `<UserCog>` icon + `<ArrowRight>` icon
   - Athlete login: `<Link href="/workout">` — Large Secondary Glass pill with `<User>` icon

**Data dependencies**: None. Pure static render.

---

### 5.2 Authentication Portal (`/login`) — `app/(athlete)/login/page.tsx`

**UX Context**: Serves both coach and athlete login. The URL param `?role=coach` pre-selects coach mode. Designed to be visually calming with a glassmorphic card over the dark background, and a decorative `<WaveAnimation>` at the bottom.

**Layout**: Full viewport centered, `max-w-md`.

**Elements**:
1. **Logo block**: Waves icon in `bg-primary/10 rounded-3xl` container with `shadow-[0_0_30px_rgba(100,255,218,0.15)]`. Below: "AquaFlow Pro" title + contextual subtitle ("教练登录" or "运动员训练通道").
2. **Role toggle**: Segmented control with two buttons (Athlete / Coach) in a `bg-secondary/30 rounded-xl` container. Active segment: `bg-primary text-primary-foreground shadow-lg`.
3. **Login card**: `bg-card/50 p-6 rounded-3xl border border-border/50 backdrop-blur-sm` containing `<LoginForm mode={isCoach ? "coach" : "athlete"}>`.
4. **Footer text**: Coach mode shows "Powered by AquaFlow Pro". Athlete mode shows "忘记信息？联系教练".
5. **Wave animation**: `<WaveAnimation>` decorative fixed element at bottom.

**`<LoginForm>` component** (`components/athlete/LoginForm.tsx`):
- Username input with `<User>` icon prefix, `autoComplete="username"`
- Password input with `<Lock>` icon prefix, eye toggle button, `autoComplete="current-password"`
- Error message area: `text-red-400 text-xs text-center`
- Coach mode extra: "忘记密码？" link pointing to `/setup`
- Submit button: Full-width Large Primary Cyan
- Loading state: Shows `<Loader2 animate-spin>` + "Connecting... attempt {n}/3"
- Cancel button: Appears during loading, calls `abortRef.current?.abort()`

---

### 5.3 Initial Setup (`/setup`) — `app/setup/page.tsx`

**UX Context**: One-time page for creating the head coach account. Only accessible when no `CoachUser` exists in the database. After the first coach is created, the API returns an error if called again.

**Layout**: Full viewport centered, `max-w-md`.

**Elements**:
1. **Logo + heading**: Waves icon + "Setup Coach Account" title + "Create your first coach account to get started" subtitle.
2. **Form card**: `bg-secondary/20 p-6 rounded-3xl border border-white/5 backdrop-blur-sm`.
   - Display name input (with `<User>` icon)
   - Username input (with `<User>` icon, required)
   - Password input (with `<Lock>` icon, required, minLength=6)
   - Confirm password input (with `<Lock>` icon, required, minLength=6)
   - Error display area
   - Submit button: "Create Account" → calls `POST /api/auth/register-coach` → on success `router.push("/dashboard")`

---

### 5.4 Poolside Quick-Access (`/poolside`) — `app/poolside/page.tsx`

**UX Context**: Designed for coaches standing next to the pool with wet hands. Uses extra-large fonts and buttons. Displays the current workout set in enormous text that can be read from 10+ meters away. Has play/pause/skip controls for stepping through workout sets.

**Layout**: Full viewport (`h-screen w-screen bg-black`), three horizontal zones.

**Elements**:
1. **Top bar** (`bg-white/5 border-b border-white/10`):
   - Live clock: `text-4xl font-mono font-bold text-primary` updating every 1s.
   - Group selector: 4 buttons for `["Junior", "Intermediate", "Advanced", "External"]`. Active: `bg-primary text-primary-foreground`. Inactive: `bg-white/10 text-muted-foreground`.
   - Current plan info (group name + focus).
2. **Main display area** (flex-1, centered):
   - Distance: `text-[150px] font-bold text-primary font-mono` — e.g. "200m"
   - Stroke: `text-6xl font-medium uppercase text-white/90` — e.g. "FREE"
   - Description: `text-4xl text-muted-foreground bg-black/50 p-6 rounded-2xl border border-white/10`
   - Loading state: "加载中..." with pulse animation
   - Error state: "加载失败" with retry button
   - Empty state: "今日暂无训练计划"
3. **Controls bar** (`h-32 bg-white/5 border-t border-white/10`):
   - Set counter: `font-mono text-primary` — "Set 3 / 12"
   - Play/Pause button: XL poolside size (`p-6 rounded-full`), green when paused, red when playing
   - Skip button: XL poolside size (`p-6 rounded-full bg-white/10`), `<SkipForward>` icon

**Data source**: Fetches `GET /api/plans?group={selectedGroup}` via `fetchAPI()`, finds today's plan, extracts all items from blocks.

---

## 6. Page-by-Page Specification: Coach Dashboard

### 6.1 Dashboard Home (`/dashboard`)

**UX Context**: The coach's command center. Shows a real-time overview of today's attendance, active swimmers, latest feedback, training plans, and announcements. Designed for a coach who checks this first thing in the morning or during training breaks.

**Component**: `app/(driver)/dashboard/page.tsx`

**Layout**: `grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto`

#### Header Section
- Title: "AquaFlow Pro" + "仪表盘"/"Dashboard" subtitle
- DB cold start banner: Shows when `!isLoaded` — "正在连接云端数据库..." with 3 pulsing dots. Auto-dismisses after 30s.
- Actions: `<RefreshButton>` + `<LanguageToggle>` + Logout button

#### Left Column: Today's Operations
1. **`<TodayAttendance>`** — Shows today's attendance rate as a percentage dial. Heading links to `/dashboard/attendance`.
2. **`<AnnouncementComposer>`** — Multi-block composer for coach announcements. Supports text, image, video (Bilibili/YouTube embed), and link blocks. Has group targeting selector.
3. **Announcements Feed** — Maps `announcements` array into `<AnnouncementCard>` components. Coach view includes delete (`onDelete`) and star (`onStar`) actions.
4. **Archived Feed** — Toggleable section showing `archivedAnnouncements`. "Load More" button increments display limit by 10.

#### Middle Column: Training Plans
1. **Header**: "近期计划" heading + "创建计划" button → `/dashboard/weekly-plan`
2. **Plan list**: Filtered `weeklyPlans` (±14 days from today), sorted newest first, rendered as `<WeeklyPlanCard>` components.
3. **Empty state**: "还没有训练计划" + "创建第一个周计划" link → `/dashboard/weekly-plan`
4. **Loading state**: `<PanelSkeleton>` placeholder components

#### Right Column: Team Intelligence
1. **`<SwimmerStatusPanel>`** — Card grid of all swimmers showing: miniature avatar, level badge, readiness gauge, injury status. Heading links to `/dashboard/athletes`.
2. **`<AthletesFeedbackPanel>`** — Scrolling feed of recent feedback. RPE ≥ 8 or Soreness ≥ 7 items get `border-error/30` red glow highlighting. Heading links to `/dashboard/feedbacks`.
3. **Collapsible "More" section**: Toggle button reveals:
   - `<RecentPerformances>` — Latest PB records
   - `<TeamFeedbackSummary>` — Weekly submission rates
   - `<TeamStatsPanel>` — Team XP, distance totals, level distribution
   - `<OnboardingChecklist>` — Setup completion guide

---

### 6.2 Weekly Plan Editor (`/dashboard/weekly-plan`)

**UX Context**: The primary tool for composing 7-day training cycles. Coaches create weekly frameworks with daily session breakdowns. Each daily session can use one of four editor modes.

**Key Features**:
- Week start date selector (auto-fills Mon-Sun dates)
- Weekly overview: image upload + rich text WYSIWYG introduction
- Target group multi-select (Junior, Intermediate, Advanced) + individual swimmer targeting
- 7 expandable daily session panels (Mon–Sun)
- Each daily session has a mode selector:

| Mode | Value | Component | Output Format |
|:---|:---|:---|:---|
| Block Content | `"block"` | `<BlockEditor>` | `contentBlocks[]` — structured blocks (text/image/video/link) |
| Modular Plan | `"plan"` | `<PlanModuleEditor>` | `trainingBlocks[]` — warmup/main set/cool down with items |
| Rich Text | `"rich"` | `<RichTextEditor>` | `contentHtml` — sanitized HTML string |
| Legacy Photo | `"legacy"` | Image upload | `imageData` — base64 compressed JPEG |

**Scratchpad Guard** (planned): When switching between modes mid-edit, a `WeeklyPlanScratchpadContext` will cache all four mode states locally so no data is lost.

---

### 6.3 Standalone Plan Editor (`/dashboard/quick-plan`)

**UX Context**: For creating single-day training plans (outside the weekly framework). Uses the same `<PlanEditor>` component. Contains the full `<PlanModuleEditor>` for structured plan building plus a `<WorkoutLibrary>` drawer for template insertion.

**Key elements**:
- Date picker, group tier selector, training type tag, primary stroke selector
- Focus text input, total distance calculation
- Coach notes (general) + targeted private notes per swimmer
- Photo upload mode toggle
- `<PlanModuleEditor>`: Drag-and-drop block-based editor with block types: Warmup, Pre-Set, Main Set, Drill Set, Cool Down. Each block contains items with: repeats, distance, stroke, intensity, equipment, interval, description.
- `<WorkoutLibrary>`: Slide-out drawer for browsing system templates and coach-saved custom templates. "Save as Template" button saves current block configuration.

---

### 6.4 Attendance Grid (`/dashboard/attendance`)

**UX Context**: Spreadsheet-style view for managing historical attendance. Rows = swimmers, columns = dates. Each cell is a toggleable status indicator.

**Key elements**:
- Scrollable grid matrix
- Cell states: Present (green check), Absent (empty), Late (yellow), Excused (blue)
- One-click cell marking
- Batch check-in controls
- Links to `/dashboard/attendance/stats` for heatmap analytics

---

### 6.5 Attendance Heatmaps (`/dashboard/attendance/stats`)

**UX Context**: Visual analytics page for long-term attendance trend analysis. Uses CSS-based calendar color grids.

**Key elements**:
- CSS calendar heatmap (grid of colored blocks representing daily attendance density)
- Swimmer ranking by attendance rate
- Low-attendance warning cards with flagged swimmer names
- Hover popovers on calendar blocks showing exact check-in count

---

### 6.6 Swimmer & Squad Registry (`/dashboard/athletes`)

**UX Context**: Complete roster management. Where coaches add swimmers, reset credentials, award XP/coins, and manage group assignments.

**Key elements**:
- Search bar: `searchSwimmer` placeholder, filters swimmer cards in real-time
- Group filter tabs: All / Junior / Intermediate / Advanced
- Swimmer cards: Display name, group badge, level, equipped avatar preview, readiness gauge, injury indicators
- "Add Swimmer" button → opens `<SwimmerModal>` with fields: name, group, username, password
- Swimmer card click → expands details: edit credentials, reset password, view PBs, wishlist
- "Award XP" button → opens manual XP/coin reward drawer that logs `XpTransaction` records
- Delete button → cascade deletes swimmer + all associated data (with `window.confirm`)

---

### 6.7 Feedback Inbox (`/dashboard/feedbacks`)

**UX Context**: Where coaches review daily swimmer reflections. Dual-pane layout: left list + right detail. Flagged items (high RPE or soreness) get highlighted for urgent attention.

**Key elements**:
- Left pane: List of swimmers sorted by submission date. Each row shows swimmer name, RPE/soreness values, truncated comment preview.
- High-alert flag: RPE ≥ 8 or Soreness ≥ 7 → red warning banner `border-error/30` + exclamation icon
- Right pane: Full feedback detail showing good points, improvement areas, complete comments, and inline coach reply text field
- Filter controls: by RPE range, by date, search by comment text
- Coach reply: Inline text input → `PATCH /api/weekly-feedbacks` or `PATCH /api/feedback-reminders`

---

### 6.8 Targeted Coach Reminders (`/dashboard/feedbacks/targeted`)

**UX Context**: Custom question system where coaches push specific prompts to individual swimmers or groups, and track their responses.

**Key elements**:
- Reminder draft panel: Text input for question/prompt, target swimmer selector (individual or group), period date range
- Active reminders queue: Cards showing prompt text, target count, response ratio (e.g., "3/5 responded")
- Response viewer: Expand a reminder to see each swimmer's reply with their RPE, soreness, and text
- Coach reply field: Inline response to each swimmer's submission

---

### 6.9 Team Injury Monitor (`/dashboard/injury-monitor`)

**UX Context**: Consolidated view of all reported injuries across the team. An SVG body-map heatmap aggregates pain data from all swimmers. The coach can quickly identify which muscle groups are commonly stressed.

**Key elements**:
- SVG squad heatmap: Full-body anterior + posterior view. Regions colored by aggregate pain intensity (cool-to-hot gradient).
- Injured swimmer badges: List of swimmers with active injuries showing body region, pain level (1-10), and last update date.
- **Planned interaction**: Clicking a highlighted SVG region → slides open a right-side glassmorphic drawer showing all swimmers experiencing pain in that area, with their notes, photos, and a quick-message field.

---

### 6.10 Coach Settings (`/settings`)

**UX Context**: Simple configuration page for password changes and system preferences.

**Key elements**:
- Current password field
- New password field + confirm
- Save button → `POST /api/auth/change-password`
- "Clear All Data" danger button (with double confirmation) → wipes database for fresh start

---

## 7. Page-by-Page Specification: Athlete Portal

### 7.1 Workout Page (`/workout`) — `app/(athlete)/workout/page.tsx`

This is the **main athlete page** hosting 4 tab views in a single page component. The active tab is determined by `?tab=` URL parameter or `localStorage` persistence.

#### 7.1.1 Loading & Error States

**Auth loading**: Shows centered spinner (`border-4 border-primary border-t-transparent rounded-full animate-spin`) with "正在加载训练内容..." text.

**Network error** (sync failed + no swimmers): Shows a glassmorphic error card:
- Red `<AlertTriangle>` icon with pulse animation
- "网络连接失败" heading
- Two buttons: "重新尝试连接" (Primary Cyan → `window.location.reload()`) + "返回登录页" (Glass → `handleLogout()`)

**Session expired** (swimmer not found): Shows:
- Red `<LogOut>` icon
- "Session Expired" heading + "无法识别您的队员身份" message
- "返回登录页" button → `router.push('/login')`

#### 7.1.2 Header (Shared across all tabs)

```
┌─────────────────────────────────────────┐
│ [Avatar 40px]  Name         [🎨][🔔][🌐][↪]│
│ [Level badge]  ████░░ 45 XP / Lv.3      │
└─────────────────────────────────────────┘
```

- **Avatar area** (`<Link href="/profile">`): 40px `<AvatarRenderer>` in `border-2 border-primary rounded-full` with `shadow-[0_0_12px_rgba(0,242,255,0.3)]`. Level badge: `w-4 h-4 rounded-full bg-warning` positioned at bottom-right with level number.
- **Name**: `text-base font-bold font-display-metrics`
- **XP bar**: `w-24 h-1.5 bg-secondary/50 rounded-full` with `.xp-bar-gradient` fill
- **XP label**: `text-[10px] font-label-caps text-muted-foreground` — "{xp} XP / Lv.{level+1}"

#### 7.1.3 Tab: Training (`activeTab === 'training'`)

**Meet Countdown**: `<MeetCountdown>` — Shows upcoming swim meet with countdown timer and dark-gold preparation theme.

**Coach Announcements Feed** (if any exist):
- Section header: "教练动态" with `<MessageSquare>` icon
- Each announcement rendered as `<AnnouncementCard>`
- "查看全部" toggle → shows archived announcements (archived items at 60% opacity)
- "加载更多" button for pagination

**Weekly Framework Card** (`bg-card/50 border border-border/50 rounded-2xl glow-border`):
- Week navigation: `<ChevronLeft>` / `<ChevronRight>` arrows. "回到本周" button (shown when viewing non-current week).
- Weekly plan title or fallback "本周训练大纲"
- Coach weekly notes (if exists): `italic pl-3 border-l-2 border-primary/50`
- Overview image (if uploaded): `max-h-[250px] object-contain`
- Overview HTML content (if exists): Rendered via `dangerouslySetInnerHTML` with `sanitizeHtml()`
- **7-day grid**: `grid grid-cols-7 gap-1.5` — Each day is a clickable button:

```tsx
// Day button visual states:
// Selected day:    bg-primary text-black border-primary shadow-[0_0_12px_rgba(0,242,255,0.4)] ring-2 ring-primary/30
// Has training:    bg-secondary/40 border-primary/20 text-white
// No training:     bg-surface-container-lowest/50 border-white/5 text-muted-foreground

// Each day shows:
// - Day name (Mon=一, Tue=二, ...) — text-[10px] font-label-caps
// - Date number — text-sm font-bold font-display-metrics
// - Training type tag — text-[8px] pill badge:
//   - Aerobic:   text-primary bg-primary/10 border-primary/20
//   - Anaerobic: text-destructive bg-destructive/10 border-destructive/20
//   - Sprint:    text-warning bg-warning/10 border-warning/20
//   - Default:   "Active" with primary colors
// - "Rest" label if no training
// - Today indicator: 2.5px cyan dot at top-right corner
```

**Daily Context Section** (below 7-day grid):
- Heading: "{date} 详情" with `<FolderOpen>` icon
- **If training exists** (`animate-in fade-in slide-in-from-bottom-4 duration-500`):
  - Targeted note card (if exists): Golden gradient glass panel with quoted italic text
  - For each plan: Training card (`bg-card/50 rounded-2xl glow-border`) containing:
    - Training type label pill (top-right)
    - Focus heading + "Today's Daily Training Plan" super-label
    - 2-column stat grid: Distance (large primary number + "M" suffix) | Stroke Focus
    - `<SessionRenderer>` — renders content based on `editorMode` (plan blocks / rich HTML / block content / legacy image)
    - Coach notes section (if exists)
    - `<BlockFeedbackPanel>` for each training block — inline thumbs up/down, tag selectors, text feedback per block
  - "Extracted from Weekly Plan" badge for derived sessions
  - Multi-session counter: "第 1 节 / 共 3 节"
- **If no training**: Empty state with `<Waves>` icon + "教练没有发布当天的训练内容" + "提示：去『反馈』页提交日常日记吧"

**Telemetry Stats Grid** (`grid grid-cols-1 sm:grid-cols-2 gap-4`):
- Consistency Streak Ring: SVG circular progress ring with streak day count
- Quick View Analytics: Efficiency index, fatigue trend metrics

#### 7.1.4 Tab: Feedback (`activeTab === 'feedback'`)

**Feedback Inbox Banner**: `bg-primary/10 border border-primary/20 rounded-2xl` with `<MessageSquare>` icon, "反馈收件箱" title, description text.

**Targeted Tasks Section**:
- Header: "专项任务 ({pendingCount} 待办)"
- `<TargetedFeedbackForm swimmerId={currentUser.id}>` — Renders all pending coach-initiated question prompts. Each shows the prompt text, date range, and a text area + RPE/soreness sliders for response.

**Weekly Summary Section** (separated by `border-t border-border/50`):
- Header: "每周总结与打卡"
- `<WeeklyFeedbackForm swimmerId={currentUser.id} weekStart={currentWeekStart}>`:
  - 7 collapsible daily cards (Mon–Sun)
  - Each card: RPE slider (1-10), Soreness slider (1-10), Reflection text area
  - "Save Draft" button + "Submit" button
  - Submitted banner (green) when already submitted (form remains editable for resubmission)
  - "Clear today's record" button with confirmation dialog

**Coach Reply Panel**: `<CoachReplyPanel swimmerId={currentUser.id}>` — Auto-polls every 15s for new coach replies. Displays coach comments with reply timestamps.

#### 7.1.5 Tab: Health (`activeTab === 'health'`)

**Status Card** (`bg-card/50 rounded-2xl p-6`):
- Readiness slider: HTML range input `min=0 max=100` with `accent-primary`. Label shows readiness percentage + descriptive text:
  - 0-20%: "非常疲劳，建议休息" (Very fatigued)
  - 21-40%: "疲劳，建议减量" (Fatigued)
  - 41-60%: "一般状态" (Fair)
  - 61-80%: "良好" (Good)
  - 81-100%: "状态极佳" (Excellent)
- Status buttons: 3-column grid of toggle buttons:
  - "训练中" (Active): `bg-success/20 text-success border-success/50` when active
  - "休息中" (Resting): `bg-warning/20 text-warning border-warning/50` when active
  - "受伤中" (Injured): `bg-error/20 text-error border-error/50` when active
- **Injury Map**: `<InjuryMap swimmerId={currentUser.id}>` — Interactive SVG body outline. Click body regions to mark pain levels (1-10), select region types, write injury notes, upload photos.
- Save button: Full-width Primary Cyan → calls `updateSwimmer()` with `{ readiness, status, lastProfileUpdate }`. Shows "已保存" tooltip on success (auto-dismisses in 3s).

**Monthly Stats Grid** (`grid grid-cols-2 sm:grid-cols-3 gap-3`):
- Monthly Distance: `text-xl font-bold text-primary` with "m" suffix
- Attendance Days: "{count}天"
- XP Points: Current XP value

#### 7.1.6 Tab: Achievements (`activeTab === 'achievements'`)

**Header Banner**: `bg-warning/10 border border-warning/20 rounded-2xl` with `<TrendingUp>` icon + "成绩与历史记录" title + "查看完整档案" link → `/archive`.

**Training History**: `<TrainingHistory swimmerId={currentUser.id}>` — Dynamically loaded (`next/dynamic`). Shows past training session cards with dates, distances, and feedback summaries.

**Performance Records**: `<PerformanceList swimmerId={currentUser.id}>` — Dynamically loaded. Shows swim event records with times, PB indicators (🏆), improvement deltas, and meet names. Each record has edit (✏️) and delete (🗑) buttons.

---

### 7.2 Profile Page (`/profile`) — `app/(athlete)/profile/page.tsx`

**UX Context**: Personal hub with gamification (shop/closet), social (buddy system), settings, and health tracking. Uses 4 internal sub-tabs.

**Header**: Sticky top bar with:
- "Profile" title + swimmer name
- Background picker button → `<BackgroundPicker>` modal
- Back-to-workout button (`<Waves>` icon) → `router.push("/workout")`
- Logout button → red glass pill

**Stats Grid** (`grid grid-cols-2 sm:grid-cols-4 gap-3`):
| Stat | Color | Source |
|:---|:---|:---|
| Total XP | `text-primary` | `currentUser.totalXp` |
| AquaBucks Balance | `text-success` | `currentUser.balance` |
| Level | `text-warning` | `Lv.{currentUser.level}` |
| Streak | `text-foreground` | `currentUser.currentStreak` |

**Sub-Tab Navigation** (`grid grid-cols-4 gap-2 bg-card/50 rounded-xl p-2`):

| Tab | Label | Icon | Content Component |
|:---|:---|:---|:---|
| `shop` | 衣橱 (Wardrobe) | `<ShoppingBag>` | `<ShopAndCloset swimmerId={currentUser.id}>` |
| `buddy` | 伙伴 (Buddy) | `<Users>` | `<BuddySystem swimmerId={currentUser.id}>` |
| `profile` | 个人资料 (Profile) | `<Settings>` | Inline profile settings form |
| `injury` | 伤病 (Injury) | `<Activity>` | `<InjuryMap swimmerId={currentUser.id} readOnly={false}>` |

Active tab button: `bg-primary text-primary-foreground shadow-md`. Inactive: `text-muted-foreground hover:text-white`.

#### Sub-tab: Shop & Closet (`<ShopAndCloset>`)
- **Left panel**: 2D composite `<AvatarRenderer>` showing equipped items preview. Equipment slot grid. Wishlist cards (max 3 items).
- **Right panel**: Shop item grid filtered by category/tier/gender. Each item shows: preview image, name, price (coins), level gate requirement. Clicking an item → live preview on avatar. Purchase button → validates `Swimmer.balance >= price` and `Swimmer.level >= itemGatedLevel` → `POST /api/shop`.
- **Item tiers**: basic, common, rare, legendary, ultimate — each with distinct visual styling.

#### Sub-tab: Buddy System (`<BuddySystem>`)
- **Active buddy card**: Shows paired buddy's name, avatar, joint check-in streak, XP bonus multiplier.
- **Search roster**: Team member grid with search. Each swimmer shows name + avatar. Send/accept/cancel buddy invitations.
- **Buddy streak reward**: When both buddies check in on the same day, an atomic XP bonus transaction is logged.

#### Sub-tab: Profile Settings (inline form)
- Name input field
- Main stroke selector: Free / Back / Breast / Fly / IM
- Gender selector: Male / Female (affects avatar rendering)
- Readiness slider (0-100%)
- Save button: Full-width Primary Cyan → calls `updateSwimmer()` with all fields

#### Sub-tab: Injury Map (`<InjuryMap>`)
- Full interactive SVG body map (anterior + posterior views)
- Click regions to mark pain intensity (1-10)
- Region labels (currently hardcoded Chinese — **planned migration to i18n dictionary**)
- Injury note text field
- Photo upload for injury documentation

---

## 8. Shared Component Library

### 8.1 Key Athlete Components

| Component | File | Props | Purpose |
|:---|:---|:---|:---|
| `<AvatarRenderer>` | `components/athlete/AvatarRenderer.tsx` | `gender, equippedItems, size, animated` | Renders 2D layered SVG avatar with equipped items |
| `<BottomTabBar>` | `components/athlete/BottomTabBar.tsx` | `activeTab` | Fixed bottom navigation for athlete pages |
| `<BackgroundPicker>` | `components/athlete/BackgroundPicker.tsx` | `open, onClose, currentThemeId, currentMode, onThemeSelect, onAutoMode` | Modal for selecting background theme |
| `<BackgroundParticles>` | `components/athlete/BackgroundParticles.tsx` | `theme` | Renders CSS star/fire particles based on active theme |
| `<InjuryMap>` | `components/athlete/InjuryMap.tsx` | `swimmerId, readOnly?` | Interactive SVG body-map for injury reporting |
| `<BuddySystem>` | `components/athlete/BuddySystem.tsx` | `swimmerId` | Buddy pairing, search, and streak tracking |
| `<ShopAndCloset>` | `components/athlete/ShopAndCloset.tsx` | `swimmerId` | Avatar shop + closet inventory management |
| `<FeedbackForm>` | `components/athlete/FeedbackForm.tsx` | `swimmerId, planId, ...` | RPE/soreness sliders + comment fields |
| `<WeeklyFeedbackForm>` | `components/athlete/WeeklyFeedbackForm.tsx` | `swimmerId, weekStart` | 7-day collapsible daily feedback cards |
| `<TargetedFeedbackForm>` | `components/athlete/TargetedFeedbackForm.tsx` | `swimmerId` | Responds to coach-initiated question prompts |
| `<CoachReplyPanel>` | `components/athlete/CoachReplyPanel.tsx` | `swimmerId` | Auto-polling (15s) display of coach comments |
| `<MeetCountdown>` | `components/athlete/MeetCountdown.tsx` | none | Countdown widget for upcoming swim meets |
| `<ActivityFeed>` | `components/athlete/ActivityFeed.tsx` | `swimmerId` | Notification bell with activity feed dropdown |
| `<LoginForm>` | `components/athlete/LoginForm.tsx` | `mode: "athlete" \| "coach"` | Shared login form with retry logic |
| `<TrainingHistory>` | `components/athlete/TrainingHistory.tsx` | `swimmerId` | Past session cards (dynamic import) |
| `<PerformanceTracker>` | `components/athlete/PerformanceTracker.tsx` | `swimmerId` | PB records list with edit/delete (dynamic import) |
| `<AttendanceCalendar>` | `components/athlete/AttendanceCalendar.tsx` | `swimmerId` | Monthly calendar view of attendance |
| `<BlockFeedbackPanel>` | `components/athlete/BlockFeedbackPanel.tsx` | `planId, blockId, swimmerId, blockName` | Per-block thumbs up/down + tags + text |

### 8.2 Key Dashboard Components

| Component | File | Purpose |
|:---|:---|:---|
| `<TodayAttendance>` | `components/dashboard/TodayAttendance.tsx` | Attendance dial + today's check-in list |
| `<SwimmerStatusPanel>` | `components/dashboard/SwimmerStatusPanel.tsx` | Swimmer cards with readiness, level, avatar |
| `<AthletesFeedbackPanel>` | `components/dashboard/AthletesFeedbackPanel.tsx` | Latest feedback with high-alert flagging |
| `<TeamStatsPanel>` | `components/dashboard/TeamStatsPanel.tsx` | Team XP, distance charts, level distribution |
| `<TeamFeedbackSummary>` | `components/dashboard/TeamFeedbackSummary.tsx` | Weekly submission rate overview |
| `<AnnouncementComposer>` | `components/dashboard/AnnouncementComposer.tsx` | Multi-block announcement editor |
| `<PlanEditor>` | `components/dashboard/PlanEditor.tsx` | Full training plan editor (62KB, largest component) |
| `<PlanModuleEditor>` | `components/dashboard/PlanModuleEditor.tsx` | Block-based workout builder (Warmup/Main/Cool) |
| `<BlockEditor>` | `components/dashboard/BlockEditor.tsx` | Content block editor (text/image/video/link) |
| `<RichTextEditor>` | `components/dashboard/RichTextEditor.tsx` | WYSIWYG HTML editor |
| `<SessionRenderer>` | `components/dashboard/SessionRenderer.tsx` | Renders plan content based on editorMode |
| `<WorkoutLibrary>` | `components/dashboard/WorkoutLibrary.tsx` | Template browser + save-as-template |
| `<SwimmerModal>` | `components/dashboard/SwimmerModal.tsx` | Add/edit swimmer modal form |
| `<RefreshButton>` | `components/dashboard/RefreshButton.tsx` | Manual sync trigger button |
| `<WeeklyPlanCard>` | `components/dashboard/WeeklyPlanCard.tsx` | Plan card for dashboard list |
| `<PlanCard>` | `components/dashboard/PlanCard.tsx` | Individual plan card |
| `<OnboardingChecklist>` | `components/dashboard/OnboardingChecklist.tsx` | Setup completion guide |
| `<RecentPerformances>` | `components/dashboard/RecentPerformances.tsx` | Latest PB records display |
| `<AttendanceStats>` | `components/dashboard/AttendanceStats.tsx` | Attendance heatmap analytics |
| `<PaceCalculator>` | `components/dashboard/PaceCalculator.tsx` | Swimming pace calculator tool |
| `<AIInsight>` | `components/dashboard/AIInsight.tsx` | AI-powered plan analysis |

### 8.3 Common/Shared Components

| Component | File | Purpose |
|:---|:---|:---|
| `<LanguageToggle>` | `components/common/LanguageToggle.tsx` | en/zh toggle button |
| `<WaveAnimation>` | `components/common/WaveAnimation.tsx` | Decorative bottom wave SVG |
| `<BlockRenderer>` | `components/common/BlockRenderer.tsx` | Renders content blocks (text/image/video/link) |
| `<ImageViewer>` | `components/common/ImageViewer.tsx` | Full-screen image lightbox |
| `<Toast>` | `components/common/Toast.tsx` | Notification toasts |
| `<AnnouncementCard>` | `components/feed/AnnouncementCard.tsx` | Announcement display card (shared between coach/athlete) |
| `<DbStatus>` | `components/DbStatus.tsx` | Database connection status indicator |

---

## 9. State Management & Data Flow

### 9.1 Global Store Architecture

All state is managed through `useStore()` hook (from `lib/store.tsx`) using React Context + `useReducer`. **Components never call `fetch()` directly** — all API interactions go through store methods.

The store is split into three sub-modules:

| Module | File | Responsibility |
|:---|:---|:---|
| Sync Engine | `lib/store/sync-engine.ts` | 30s polling cycle across all API endpoints |
| Entity CRUD | `lib/store/entity-crud.ts` | All create/update/delete operations with optimistic updates |
| Persist Layer | `lib/store/persist-layer.ts` | localStorage caching with 7-day TTL for offline resilience |

### 9.2 Key Store State

```typescript
// Accessed via: const { plans, swimmers, attendance, ... } = useStore();
{
  plans: TrainingPlan[],
  swimmers: Swimmer[],
  attendance: AttendanceRecord[],
  feedbacks: Feedback[],
  performances: PerformanceRecord[],
  templates: BlockTemplate[],
  weeklyPlans: WeeklyPlan[],
  announcements: Announcement[],
  archivedAnnouncements: Announcement[],
  meets: Meet[],
  isLoaded: boolean,           // true after first successful sync
  syncStatus: 'idle' | 'syncing' | 'error',
  dbOffline: boolean,          // true if Neon quota exceeded
}
```

### 9.3 Data Flow Patterns

**Optimistic Update** (write flow):
1. Store method called (e.g., `updateSwimmer(id, data)`)
2. Local state updated immediately (UI reflects change)
3. `recordMutation()` called → blocks polling for 15s (Mutation Guard)
4. API request sent in background
5. On success: state confirmed
6. On failure: local state rolled back to previous value

**Polling Sync** (read flow):
1. Every 30s, `sync-engine` polls `GET /api/sync` and all entity endpoints
2. New data merges into local state
3. Mutation Guard prevents overwrites during 15s window after any write

---

## 10. Animation & Transition System

### 10.1 Framer Motion Page Transitions

Page transitions between tabs use spring-based slide + fade:

```typescript
const pageTransition = {
  initial: { opacity: 0, x: direction === "next" ? 50 : -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: direction === "next" ? -50 : 50 },
  transition: { type: "spring", stiffness: 300, damping: 30 }
};
```

### 10.2 CSS Animations (defined in `app/globals.css`)

| Animation | Class | Duration | Use |
|:---|:---|:---|:---|
| Wave movement | `.wave-animation .wave-layer` | 12s / 18s / 25s (3 layers) | Decorative bottom wave |
| Water ripple | `.water-ripple-container .ripple` | 0.6s ease-out | Click feedback on interactive elements |
| Glow pulse | `.glow-pulse` | 2s ease-in-out infinite | Active elements, selected cards |
| Float | `.animate-float` | 3s ease-in-out infinite | Decorative elements |
| Star twinkle | `.star-particle` | var(--twinkle-duration, 3s) | Night theme stars |
| Fire rise | `.fire-particle` | var(--fire-duration, 4s) | Sprint fire theme particles |

### 10.3 Tailwind Animation Utilities

```css
animate-in          /* Entry animation */
fade-in             /* Opacity 0 → 1 */
zoom-in             /* Scale up entry */
slide-in-from-top-4 /* Slide down 16px */
slide-in-from-bottom-4 /* Slide up 16px */
duration-150 / 200 / 300 / 500 / 700  /* Timing */
```

### 10.4 Micro-interactions

- **Card hover**: `hover:scale-[1.02]` or `.glass-panel-hover` (translateY -2px + glow)
- **Button press**: `active:scale-95` implicit through `hover:scale-[1.02]` release
- **Glow border hover**: `.glow-border:hover` → border goes solid cyan + `box-shadow: 0 0 8px`
- **XP bar gradient**: `.xp-bar-gradient` — `linear-gradient(90deg, #00f2ff 0%, #006a71 100%)` with `box-shadow: 0 0 10px`
- **Gold text**: `.gold-text-gradient` — `linear-gradient(135deg, #FFE082, #FFB300, #FF8F00)`

---

## 11. Internationalization (i18n)

### 11.1 System Architecture

- Dictionary: `lib/dictionary.ts` — exports `DICTIONARY` object with `en` and `zh` branches
- Provider: `lib/i18n.tsx` — `<LanguageProvider>` + `useLanguage()` hook
- Usage: `const { t } = useLanguage();` → `t.common.login`, `t.athlete.submit`, etc.
- Persistence: Language preference stored in `localStorage`

### 11.2 Dictionary Structure

```typescript
DICTIONARY.{lang}.common.*      // Shared terms (login, logout, save, etc.)
DICTIONARY.{lang}.dashboard.*   // Coach dashboard labels
DICTIONARY.{lang}.editor.*      // Plan editor labels (strokes, equipment, etc.)
DICTIONARY.{lang}.athlete.*     // Athlete portal labels
DICTIONARY.{lang}.archive.*     // Archive/profile labels
DICTIONARY.{lang}.gamification.* // XP, streak, level labels
```

### 11.3 Known i18n Gaps (To Be Fixed)

- `InjuryMap.tsx`: Body region labels are hardcoded in Chinese (`头部`, `左肩`, `右大腿`, etc.) — need migration to `DICTIONARY`
- `BottomTabBar.tsx`: Tab labels are hardcoded Chinese (`训练`, `反馈`, `成绩`, `状态`, `我的`) — need dictionary lookup
- Various inline strings in `workout/page.tsx` (e.g., "14天连续训练", "效率指数") — need dictionary entries

---

## 12. Future Features (Planned)

### 12.1 Voice-to-AI Dictation (Phase 2)

**Interface**: Glassmorphic microphone button next to the reflection text area in `<FeedbackForm>`.
**Flow**: Click mic → fullscreen glassmorphic overlay with pulsing SVG soundwave → `window.webkitSpeechRecognition` captures audio → transcript posted to `POST /api/ai/feedback-parse` (Edge Route) → AI extracts RPE, Soreness, and reflection text → sliders auto-populated.

### 12.2 Clickable Injury Heatmap Drawer (Phase 3)

**Interface**: Coach side SVG injury regions become clickable.
**Flow**: Click region → right-side glassmorphic drawer slides in → shows list of swimmers with pain in that region → coach can view notes, photos, send targeted advice.

### 12.3 Scratchpad Guard (Phase 3)

**Interface**: Client-side `WeeklyPlanScratchpadContext` caches all 4 editor mode states when switching layouts in `/dashboard/weekly-plan`.

### 12.4 Dynamic Exertion Sliders (Phase 1)

**Interface**: Behind RPE/Soreness range slider tracks, add HSL glow overlays:
- 1-3: Neon Cyan glow (`#00f2ff`)
- 4-5: Emerald glow (`#10b981`)
- 6-7: Golden glow (`#f59f00`)
- 8-10: Pulsing crimson glow (`#ef4444`) with floating CSS micro-flame particles

### 12.5 Buddy Avatar Integration (Phase 1)

Replace emoji placeholders in `<BuddySystem>`:
- Active buddy card: Replace `👋😃` dotted box with `<AvatarRenderer>` using buddy's `equippedItems` and `gender`
- Search roster: Replace `👤` icon with 40px `<AvatarRenderer>` per swimmer

### 12.6 Parent Observer Portal (Future)

Token-gated read-only URL (`/observer?token=PARENT_JWT`) showing swimmer progress charts, attendance history, and best times without login credentials.

### 12.7 3D Pool Deck Drag-and-Drop (Future)

SVG pool lane layout in `/dashboard/athletes`. Coaches drag swimmer avatar cards into specific lanes, saving lane configurations to `Swimmer.group` metadata.

---

*This document is the single source of truth for all frontend design decisions in AquaFlow Pro. It is generated from direct analysis of the production codebase and approved interactive design sessions.*

*Last updated: 2026-05-29 22:10 CST — Version 1.6.0*
