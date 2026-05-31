# Design Spec: Stitch Functional & Interface Design Document

**Date**: 2026-05-28  
**Scope**: 100% Comprehensive UI/UX & Backend Bindings Mapping  

---

## 1. Overall Purpose of AquaFlow Pro

**AquaFlow Pro** is a bilingual (English/Chinese), high-performance athletic training and gamified team-management platform tailored for competitive swim teams. The platform serves two primary user roles with strict separation of access controls:
1. **Coaches (Driver Portal)**: Empowered to create daily standalone training plans and weekly overview plan templates using four flexible editor modes (`plan` block, `rich` WYSIWYG, `block` content, or `legacy` photo upload), manage active rosters, record poolside attendance, review daily reflections/RPE/soreness trends, launch custom injury heatmaps, and reward athletes.
2. **Athletes (Swimmers Portal)**: A responsive, mobile-first app allowing athletes to inspect daily swim schedules, submit fatigue RPE and muscle soreness ratings, log specific injuries on an interactive SVG body-map, participate in a buddy accountability network, check in to build training streaks, and spend their hard-earned XP currency on customizable closet items in a Quizizz-style avatar shop.

---

## 2. Page-by-Page Functional & Layout Specifications

All pages utilize the **Apex Velocity** premium sports style system: deep-sea HSL navy background (`#0a0e1a`), vibrant primary performance cyan details (`#00f2ff`), glassmorphism card surfaces (`#141b2d`), Inter body typography, and Outfit uppercase headings.

### 2.1 Public Pages

#### 2.1.1 Landing Page (`/`)
- **Purpose**: Brand introduction, redirect hub.
- **Layout**: Dynamic hero section with high-contrast text and interactive action cards.
- **Access Controls**: Public. Reads sessions via `/api/auth/me` to automatically route logged-in coaches to `/dashboard` and athletes to `/workout`.

#### 2.1.2 Initial System Setup (`/setup`)
- **Purpose**: Creates the initial administrator head coach account.
- **Layout**: Centered minimal configuration card. Only accessible if no `CoachUser` exists in the database.
- **Form Inputs**: Username (`String`), Password (`String`), Coach Name (`String`).

#### 2.1.3 Poolside Quick-Access Deck (`/poolside`)
- **Purpose**: High-contrast, large-touch interface optimized for coaches standing on the pool deck.
- **Layout**: Simplified card layout with extra large buttons.
- **Core Elements**: Toggle attendance check-ins, view today's core sets.

#### 2.1.4 Bilingual Authentication Portal (`/login`)
- **Purpose**: Role-based secure login.
- **Layout**: Glassmorphic credential box with role selector tab (Swimmer vs. Coach) and password visibility toggles.
- **Form Inputs**: Username (`String`), Password (`String`), Role selector (`coach` | `athlete`).

---

### 2.2 Coach (Driver) Dashboard Pages

Wrapped inside the `(driver)` directory with a shared layout rendering a collateral left-hand `Sidebar` on desktop and slide-out `MobileNav` drawer on mobile viewports.

#### 2.2.1 Main Dashboard Home (`/dashboard`)
- **Purpose**: Central command overview of team telemetry and announcements.
- **Layout**: Responsive grid matching desktop and mobile viewports.
- **Functional Widgets**:
  1. **`TodayAttendance`**: Displays attendance dial rates. Heading links to `/dashboard/attendance`.
  2. **`SwimmerStatusPanel`**: Swimmer cards displaying level, equipped avatar layers, readiness gauges, and active injury status badges. Heading links to `/dashboard/athletes`.
  3. **`AthletesFeedbackPanel`**: Latest reflections. Flagged items (RPE >= 8, Soreness >= 7) highlight in high-contrast red warning banners. Heading links to `/dashboard/feedbacks`.
  4. **`TeamStatsPanel`**: Renders weekly distance charts, PB counters, and overall team XP meters.
  5. **`AnnouncementComposer` & Announcements Feed**: Multi-block announcement inputs (text, image, Bilibili/YouTube video embeds, custom web links) with swimmer group targeting.

#### 2.2.2 Standalone Plan Editor (`/dashboard/quick-plan`)
- **Purpose**: Multi-mode training set builder.
- **Layout**: Split page with editor controls on the left and a live-updating interactive preview card on the right.
- **functional Elements**: Date picker, group tier, training type tag, primary stroke, focus text, distance, coach notes, private targeted athlete notes, and a toggle between canvas-compressed Photo Upload vs. the modular `PlanModuleEditor` (warmups, main sets, cool downs, equipment, repetitions, and intervals).
- **Workout Library**: Quick-insert drawer allowing coaches to browse system templates or save current training blocks as reusable templates.

#### 2.2.3 Weekly Plan Folder Editor (`/dashboard/weekly-plan`)
- **Purpose**: Compile 7-day training cycles.
- **Layout**: Vertically stacked daily panels (Monday–Sunday) with expanding session editors.
- **functional Elements**: Week-start selector (auto-calculates Monday–Sunday dates), weekly overview image upload, rich-text intro, target group selectors, and expandable daily session items. Each daily session allows coaches to choose between **Block**, **Rich**, **Plan**, or **Legacy** composition layouts.

#### 2.2.4 Attendance Grid (`/dashboard/attendance`)
- **Purpose**: Complete historical attendance records log.
- **Layout**: Spreadsheet-style scrollable grid layout mapping swimmers (rows) to dates (columns).
- **functional Elements**: One-click cell marking (Present, Absent, Late, Excused) and batch check-ins.

#### 2.2.5 Attendance Heatmaps & Analytics (`/dashboard/attendance/stats`)
- **Purpose**: Track long-term attendance trends.
- **Layout**: Interactive CSS-based calendar color heatmap and vertical swimmer performance rankings.

#### 2.2.6 Training Schedule Calendar (`/dashboard/schedule`)
- **Purpose**: Visual monthly/weekly calendar of active assignments.
- **Layout**: Full-page calendar grid. Color-coded markers denote Junior, Intermediate, and Advanced team sessions.

#### 2.2.7 Swimmer & Squad Registry (`/dashboard/athletes`)
- **Purpose**: Complete roster control.
- **Layout**: Card registry layout with search bar and filter controls.
- **functional Elements**: Swimmer registration modal, credentials resetting, manual coach XP/coin reward drawer with logged transaction records, and cascade deletion.

#### 2.2.8 Daily & Weekly Feedback Inbox (`/dashboard/feedbacks`)
- **Purpose**: Swimmer feedback dashboard.
- **Layout**: Dual-pane inbox layout (list view on the left, full comment display with good/improvement points on the right).
- **functional Elements**: Filter by fatigue RPE scores, search comments, and inline coach replies.

#### 2.2.9 Targeted Coach Reminders (`/dashboard/feedbacks/targeted`)
- **Purpose**: Custom coach-initiated feedback check-ins.
- **Layout**: Split screen showing pending reminders and lists of completed swimmer reflections.
- **functional Elements**: Target specific athletes or groups with customized reflections, set target dates, and reply to athlete responses.

#### 2.2.10 Meet Scheduling (`/dashboard/meets`)
- **Purpose**: Swim meet schedule management.
- **Layout**: Timelined meet cards with a registration editor.
- **functional Elements**: Meet name, location, exact datetime, active/inactive toggle.

#### 2.2.11 Team Injury Monitor (`/dashboard/injury-monitor`)
- **Purpose**: Consolidated physical tracking of athletes.
- **Layout**: 3D-styled SVG body map heatmap showing body-region injury density across the squad, alongside specific swimmer injury badges.

#### 2.2.12 Training Plan Archive (`/dashboard/archive`)
- **Purpose**: Extended historical search.
- **Layout**: Advanced multi-select filtering form.

#### 2.2.13 Coach Settings (`/settings`)
- **Purpose**: Password and configuration center.
- **Layout**: Flat card profile interface.

---

### 2.3 Athlete (Swimmer) Portal Pages

Exclusively designed as a mobile-first, highly-responsive web app with an active bottom tab navigation bar (`BottomTabBar`) consisting of 5 slots: **Training**, **Feedback**, **Achievements**, **Health**, and **Profile**.

#### 2.3.1 Training Tab (`/workout`)
- **Purpose**: Swimmer training dashboard.
- **Layout**: Responsive mobile-first screen.
- **functional Elements**:
  - **7-day Navigable Calendar**: Clickable day nodes showing check-in status and workout type tags.
  - **Today's Plan Viewer**: Displays the exact daily plan for the swimmer's group. Renders via `SessionRenderer` based on its publication mode (`plan`, `block`, `rich`, `legacy`). Includes general coach notes and targeted private swimmer annotations.
  - **Block Feedback Panel**: Inline interactive feedback for each block (Warmup, Main Set, Cool Down) with thumbs up/down, tag selectors ("Too Tight", "Shoulder Pain"), and text fields.

#### 2.3.2 Feedback Tab (`/workout` - sub-tabs)
- **Purpose**: Reflection submissions.
- **Layout**: Interactive slider inputs for perceived exertion (RPE, 1-10) and muscle soreness (1-10), with text inputs for good points and improvement reflections. Enforces the strict daily unique constraint.
- **Weekly summary**: Dedicated tab allowing swimmers to compile their weekly reflections alongside coach replies.

#### 2.3.3 Achievements & Economy Tab (`/profile` - sub-tabs)
- **Purpose**: Gamified progression center.
- **Layout**: Two columns (Closet on the left, Avatar shop on the right).
- **functional Elements**:
  - **Shop**: Browse avatar accessories and layers (hair, tops, bottom, expression, special backgrounds) categorized by tiers (basic, premium, legendary). Clicking an item previews it live on the avatar before purchase.
  - **Closet**: Equip/unequip owned items (head, body, lower, feet, hand, accessory slots) and add items to a 3-item wishlist.

#### 2.3.4 Health & Analytics Tab (`/profile` - sub-tabs)
- **Purpose**: Personal health tracker.
- **Layout**: Interactive SVG body-map outline and calendar check-ins list.
- **functional Elements**: SVG clicks let swimmers mark pain levels (1-10), choose region types (shoulder, knee, back), write injury notes, and upload pain site photos.

#### 2.3.5 Swimmer Profile & Buddies Tab (`/profile`)
- **Purpose**: Personal settings and accountability network.
- **Layout**: Responsive stacked card grid.
- **functional Elements**: Streaks indicators, total XP and coin balances, and the **Buddy System** card allowing swimmers to invite, accept, or track training streaks together for a joint XP multiplier.

---

## 3. Strict Backend API & Database Schema Mappings

Every single UI feature is backed by a secure Neon Serverless Postgres query. There are **zero mock shells**.

### 3.1 Swimmer Roster & XP Ledger Mappings
- **Swimmer Details UI**: Inputs maps to `Swimmer` columns: `name`, `group`, `status`, `readiness`, `gender`, `xp`, `totalXp`, `balance`, `level`.
- **Manual XP Award UI**: Forms POST to `/api/swimmers/reward` which writes a transaction row in `XpTransaction` (`swimmerId`, `amount`, `source`, `description`, `balanceAfter`, `totalXpAfter`) and increments `Swimmer.totalXp` and `Swimmer.balance` atomically in a single SQL operation.
- **Roster Deletion UI**: Deleting a swimmer executes a `DELETE FROM "Swimmer" WHERE "id" = ${id}` query, which cascade-deletes all associated feedbacks, attendance logs, and transactions in PostgreSQL.

### 3.2 Plan & Weekly Session Mappings
- **Plan editor details**: Inputs map to `TrainingPlan` columns: `date`, `startTime`, `endTime`, `group`, `totalDistance`, `focus`, `status`, `coachNotes`, `targetedNotes` (JSON record mapping Swimmer ID to personal text), `imageUrl`, `isStarred`, `trainingType`, and `primaryStroke`.
- **Blocks composition**: The `PlanModuleEditor` serializes blocks as a JSON array of `TrainingBlock` objects stored directly into the `blocks` column.
- **Weekly overviews**: `overviewImageUrl` and `overviewContentHtml` map directly to `WeeklyPlan` table columns.
- **Expanded daily sessions**: Inputs map to `DailySession` columns: `weeklyPlanId`, `label`, `date`, `contentBlocks` (JSON block layout), `trainingBlocks` (JSON plan layout), `contentHtml` (rich text), `editorMode` (`plan`, `block`, `rich`, `legacy`), `trainingType`, and `primaryStroke`.

### 3.3 Attendance & Daily Check-Ins
- **Poolside/Grid checks**: Checks trigger POST to `/api/attendance` writing records to `AttendanceRecord` (`swimmerId`, `date`, `status`, `timestamp`). Unchecking executes `DELETE FROM "AttendanceRecord" WHERE "swimmerId" = ${swimmerId} AND "date" = ${date}`.
- **Auto check-in**: Swimmers submitting daily feedback (`POST /api/feedbacks`) trigger an atomic write to `AttendanceRecord` (status: `"Present"`) and award +10 XP for attendance and +20 XP for feedback, logged in `XpTransaction`.

### 3.4 Interactive SVG Injury Mappings
- **Interactive SVG body**: SVG path IDs map to `Swimmer.injuryBodyMap` JSON keys (e.g. `{"leftShoulder": 8, "lowerBack": 5}`).
- **Injury save**: Submitting injury forms updates `Swimmer.injuries`, `Swimmer.injuryNote`, and `Swimmer.injuryImageUrl`.
- **Team Heatmap UI**: Coaches viewing the `/dashboard/injury-monitor` run an aggregate SQL query summing the injuryBodyMap JSON weights across all active swimmers to display hot/cold region styling.

### 3.5 Avatar Shop & Closet Mappings
- **Shop Grid UI**: Browses `ShopItem` rows filtered by `category`, `tier`, `gender`, and sorted by `sortOrder`.
- **Purchase Button**: Triggers `POST /api/shop` verifying `Swimmer.balance >= ShopItem.price` and `Swimmer.level >= itemGatedLevel`. On success, it deducts balance, appends item ID to `Swimmer.inventory` JSON, and logs a purchase transaction in `XpTransaction`.
- **Closet Inventory**: Swimmers equipping items update the `Swimmer.equippedItems` JSON configuration.

### 3.6 Buddy Synchronization
- **Buddy Invite/Accept UI**: Inserts and updates rows in `BuddyPair` (`swimmer1Id`, `swimmer2Id`, `status: pending | active`).
- **Streaks Multiplier**: When compiling attendance logs, the polling store counts joint check-ins to apply joint XP bonuses, tracked via `XpTransaction`.
