# PRD: AquaFlow Pro — Complete Swimming Team Training Management System

## Problem Statement

Swimming coaches (1-2) managing a team of 10-30 competitive swimmers need a centralized, bilingual (English/Chinese) platform to create and publish training plans, track attendance and athlete fatigue, monitor injuries, manage meets, and keep swimmers motivated through gamification. Athletes need a mobile-first way to view their daily training, submit feedback on exertion and soreness, track their performance times, customize their avatar, and stay accountable through buddy pairing. Existing tools are fragmented across spreadsheets, messaging apps, and paper plans, leading to lost feedback, poor injury tracking, and low athlete engagement.

## Solution

AquaFlow Pro is a unified, high-performance athletic training and gamified team-management platform deployed at https://sw.sportsflow.best. It provides:

1. **Coach Dashboard (Driver Portal)** — Create daily and weekly training plans with four flexible editor modes, manage the roster, record attendance, review RPE/soreness trends, launch injury heatmaps, and reward athletes with XP.
2. **Athlete App (Swimmer Portal)** — Mobile-first web app for viewing training, submitting fatigue feedback, logging injuries on an interactive SVG body-map, participating in buddy accountability, building training streaks, and spending XP in an avatar shop.

## User Stories

### Authentication & Access

1. As a coach, I want to create my admin account via a one-time setup page so that I can access the dashboard.
2. As a coach, I want to log in with username and password so that I can access my dashboard securely.
3. As a swimmer, I want to log in with credentials assigned by my coach so that I can view my training plans.
4. As a coach, I want to be able to reset swimmer passwords so that swimmers can regain access if they forget.
5. As a coach, I want to change my own password from settings so that I can maintain account security.
> ⚠️ **NOT IMPLEMENTED** — Settings page has data export/import, language toggle, user guide, and app info. No password change form or `/api/auth/change-password` endpoint exists.
6. As any user, I want the system to auto-redirect me to my appropriate dashboard after login so that I don't have to navigate manually.
7. As any user, I want to switch between English and Chinese so that I can use the interface in my preferred language.

### Coach Dashboard — Overview

8. As a coach, I want to see today's attendance rate at a glance on the dashboard home so that I know who showed up.
9. As a coach, I want to click on the attendance panel to navigate to the full attendance page so that I can manage details.
10. As a coach, I want to see which swimmers have RPE >= 8 or soreness >= 7 flagged in red so that I can identify athletes who need attention.
11. As a coach, I want to see each swimmer's level, avatar, readiness gauge, and injury status on their status card so that I have a quick health overview.
12. As a coach, I want to see team stats including monthly distance, PB count, attendance rate, and total XP so that I can track overall team progress.
13. As a coach, I want to see weekly distance load chart visualization so that I can monitor training volume trends.
14. As a coach, I want to see which swimmers have submitted weekly feedback and their replied/unreplied status so that I can follow up.
15. As a coach, I want to use the pace calculator to project split times so that I can plan intervals accurately.
16. As a coach, I want to see recent competition performances so that I can track athlete progress.
17. As a coach, I want AI-generated injury risk insights on my training plans so that I can avoid overtraining.
18. As a new coach, I want an onboarding checklist guiding me to add swimmers, create a plan, and record attendance so that I can get started quickly.
19. As a coach, I want to see the sync status and manually refresh so that I know my data is up to date.

### Coach Dashboard — Training Plans

20. As a coach, I want to create a daily training plan with structured blocks (warmup, main set, drill, cool down, custom) so that swimmers know exactly what to swim.
21. As a coach, I want each block to contain items with stroke type, distance, rounds, equipment, interval mode, target time, and notes so that the plan is detailed.
22. As a coach, I want to set plan metadata including date, time, group, focus area, training type, primary stroke, coach notes, and targeted private notes so that the plan is complete.
23. As a coach, I want to star important plans so that they stay visible past the auto-hide window.
> ⚠️ Star toggle exists in data model but NOT on quick-plan page UI.
24. As a coach, I want to upload a photo of my handwritten plan instead of using the block editor so that I can quickly share existing plans.
> ⚠️ **NOT IMPLEMENTED** on quick-plan page. No photo upload UI exists here.
25. As a coach, I want my draft plan to auto-save to localStorage every 30 seconds so that I don't lose my work.
> ⚠️ **NOT IMPLEMENTED** on quick-plan page. (Weekly-plan page DOES have 30s auto-save.)
26. As a coach, I want to browse and insert pre-built training templates into my plan so that I can save time on common sets.
> ⚠️ **NOT IMPLEMENTED** on quick-plan page. Templates data structure exists but no browser UI on this page.
27. As a coach, I want to save my current training block as a new reusable template so that I can build my library.
> ⚠️ **NOT IMPLEMENTED** on quick-plan page.
28. As a coach, I want to filter templates by category and search by name so that I can find the right template quickly.
> ⚠️ **NOT IMPLEMENTED** on quick-plan page.
29. As a coach, I want to edit existing training plans so that I can make corrections after publishing.
30. As a coach, I want to delete training plans so that I can clean up outdated plans.
31. As a coach, I want to upload a plan photo and have OCR extract structured blocks and AI generate suggestions so that I can digitize paper plans.

### Coach Dashboard — Weekly Plans

32. As a coach, I want to create a weekly training plan covering Monday-Sunday so that I can plan the full week at once.
33. As a coach, I want to add daily sessions within the week with custom labels (e.g., "Wednesday", "Saturday AM") so that I can handle multiple sessions per day.
34. As a coach, I want each daily session to support four editor modes (block, rich WYSIWYG, plan with training blocks, legacy photo upload) so that I can use the format that suits each session.
35. As a coach, I want to set a weekly overview image and rich text intro so that swimmers get context for the week.
36. As a coach, I want to target specific groups or individual swimmers for a weekly plan so that not everyone sees every plan.
37. As a coach, I want to publish/unpublish weekly plans so that swimmers only see finalized plans.
38. As a coach, I want to expand daily sessions within the weekly plan to see or edit content so that I can manage details.

### Coach Dashboard — Attendance

39. As a coach, I want to mark swimmers present, absent, late, or excused on a spreadsheet-style grid so that I can track attendance efficiently.
> ℹ️ Actual status values: `Present` (green, coach confirmed), `AthletePresent` (orange, athlete self-checkin), `Pending` (gray, unmarked). No explicit "Late" or "Excused" — toggling from Present returns to Pending.
40. As a coach, I want to batch mark all swimmers present for a given date so that I can save time.
> ℹ️ "全部到场" button. Also "全部清除" to unmark all.
41. As a coach, I want to undo attendance marks so that I can correct mistakes.
> ℹ️ Click-to-toggle cycles between Present and Pending.
42. As a coach, I want to use the poolside quick-access page with large-touch buttons so that I can mark attendance from my phone on the pool deck.
> ⚠️ **NOT IMPLEMENTED** — No poolside quick-access attendance page exists. `/poolside` page needs verification.
43. As a coach, I want to view a calendar heatmap of attendance statistics so that I can spot trends.
> ℹ️ NOT on attendance page — separate `/dashboard/attendance/stats` page.
44. As a coach, I want to see per-swimmer attendance rates so that I can identify chronic absentees.
> ℹ️ NOT on attendance page — separate `/dashboard/attendance/stats` page.

### Coach Dashboard — Athlete Management

45. As a coach, I want to add swimmers with name, group, gender, username, and initial password so that they can log in.
46. As a coach, I want to edit swimmer details including group assignment and credentials so that I can keep the roster current.
47. As a coach, I want to search and filter the swimmer list so that I can find specific athletes.
48. As a coach, I want to delete a swimmer and have all their associated records cascade-deleted so that there's no orphaned data.
49. As a coach, I want to manually award XP to a swimmer with a reason note so that I can reward good behavior or achievement.
50. As a coach, I want to see the XP transaction ledger for each reward so that I can track the history.
> ⚠️ **NOT IMPLEMENTED** — No XP transaction ledger/history UI exists. Reward via modal but no visible history of past rewards.

### Coach Dashboard — Feedback

51. As a coach, I want to browse all daily feedback submissions with swimmer name, RPE, soreness, and comments so that I can review athlete reflections.
> ℹ️ Page shows weekly feedbacks (not daily), with tabs: Pending, Replied, Drafts.
52. As a coach, I want to filter feedback by swimmer, date range, and RPE threshold so that I can focus on specific data.
> ⚠️ **RPE filter NOT implemented** — No RPE threshold filter exists.
53. As a coach, I want to expand feedback cards to see full comments including good points and improvement areas so that I get complete context.
54. As a coach, I want to view and reply to weekly feedback summaries so that I can communicate with athletes.
55. As a coach, I want to create targeted feedback reminders with custom messages and select specific swimmers or groups so that I can check in on particular athletes.
56. As a coach, I want to see which swimmers have responded to my targeted reminders so that I can track compliance.
57. As a coach, I want to reply to individual targeted feedback responses so that I can have a two-way conversation.
58. As a coach, I want to view block-level feedback from athletes on specific training blocks so that I understand which sets are too hard or causing pain.

### Coach Dashboard — Announcements

59. As a coach, I want to compose announcements with multiple content blocks (text, image, video embed, external link) so that I can create rich communications.
60. As a coach, I want to target announcements to specific groups or individual swimmers so that only the right people see each message.
61. As a coach, I want to star important announcements so that they stay pinned at the top.
62. As a coach, I want to embed videos from Bilibili, YouTube, Douyin, and other platforms so that I can share technique videos.
63. As a coach, I want to upload images to announcements via R2 so that I can include photos.
64. As a coach, I want to delete announcements so that I can remove outdated information.

### Coach Dashboard — Meets

65. As a coach, I want to create swim meets with name, date, time, location, and description so that the team knows upcoming competitions.
66. As a coach, I want to activate/deactivate meets so that only relevant meets show countdown timers.
67. As a coach, I want to edit and delete meets so that I can correct mistakes.

### Coach Dashboard — Injury Monitor

68. As a coach, I want to see a team-wide injury body map heatmap showing injury density across all swimmers so that I can identify common problem areas.
69. As a coach, I want to view individual swimmer injury details including severity, notes, and images so that I can adjust training accordingly.
70. As a coach, I want to filter the injury monitor by injury type (shoulder, knee, back, ankle, other) so that I can focus on specific injuries.
> ⚠️ **NOT IMPLEMENTED** — No injury type filter dropdown exists.

### Coach Dashboard — Schedule

71. As a coach, I want to view a calendar of upcoming training plans so that I can see the schedule at a glance.
72. As a coach, I want plans to be color-coded by group so that I can quickly distinguish sessions.
> ⚠️ **IMPLEMENTED DIFFERENTLY** — Schedule colors are based on training intensity/distance (<2000m green, 2000-3000m green, 3000-4000m yellow, 4000-5000m orange, 5000m+ red), NOT by group.
73. As a coach, I want to click a plan in the calendar to edit it so that I can make quick changes.
> ℹ️ Click opens modal showing existing plans + "添加另一个组别" option. Also has "Copy last week's plan" and "Send daily reminder" buttons.

### Coach Dashboard — Settings

74. As a coach, I want to export all my local data as a JSON backup so that I can preserve it.
75. As a coach, I want to import a JSON backup file to restore my data so that I can recover from data loss.
76. As a coach, I want to clear all local data so that I can start fresh.
77. As a coach, I want to reset to demo/mock data so that I can test the app with sample content.
78. As a coach, I want to toggle between English and Chinese from settings so that I can change language at any time.
79. As a new coach, I want to see a user guide in settings so that I can learn how to use the app.

### Coach Dashboard — Archive

80. As a coach, I want to browse historical training plans beyond the 14-day auto-hide window so that I can reference past training.
> ⚠️ **NOT ON THIS PAGE** — Archive page has 4 tabs: Block feedback, Weekly feedback, Targeted feedback, Announcements. No training plan archive exists here.
81. As a coach, I want to search archived plans by date, group, and focus area so that I can find specific plans.
> ℹ️ Archive supports swimmer, group, date range filtering for feedback/announcements, not plans.
82. As a coach, I want to view archived announcements so that I can reference past communications.

### Coach Dashboard — Additional Features

83. As a coach, I want to navigate between previous and next days on the attendance page so that I can mark attendance for any date.
84. As a coach, I want to filter swimmers by group on the attendance page so that I can focus on one group at a time.
85. As a coach, I want to see stats cards (confirmed count, pending count, unmarked count, attendance rate) on the attendance page so that I have a quick overview.
86. As a coach, I want to see injured swimmer warnings with alert icons on the attendance page so that I can be aware of their status.
87. As a coach, I want to see weekly plan cards (14-day window) on the dashboard home so that I can quickly access recent plans.
88. As a coach, I want the schedule page to show training intensity by color so that I can visually identify heavy training days.
89. As a coach, I want to copy last week's plan from the schedule calendar so that I can quickly repeat training.
90. As a coach, I want to send a daily reminder from the schedule page so that I can prompt swimmers to check in.
91. As a coach, I want to see an injury warning panel on the schedule page showing swimmers with readiness < 70 so that I can adjust training.
92. As a coach, I want to see group filter tabs on the athletes page so that I can focus on one group.
93. As a coach, I want to see readiness percentage, level, XP, and streak on each swimmer card so that I have a quick overview.
94. As a coach, I want the feedbacks page to have tabs (Pending, Replied, Drafts) so that I can organize my review workflow.
95. As a coach, I want to see a 7-day weekly tracking bar on the feedbacks page so that I can see submission progress.
96. As a coach, I want the archive page to have tabs for Block feedback, Weekly feedback, Targeted feedback, and Announcements so that I can browse different types of historical data.
97. As a coach, I want the weekly-plan page to have a history sidebar showing recent and archived plans so that I can quickly access past weeks.

### Athlete — Training

83. As a swimmer, I want to see today's assigned training plan with all blocks, distances, equipment, and intervals so that I know what to swim.
84. As a swimmer, I want to navigate a 7-day calendar to see past and upcoming workouts so that I can plan ahead.
85. As a swimmer, I want to see coach notes and targeted private notes on my plan so that I get personalized instructions.
86. As a swimmer, I want to see weekly plan sessions when a weekly plan is published so that I can see the full week's training.
87. As a swimmer, I want to view the plan photo when the coach uses photo mode so that I can see the handwritten plan.

### Athlete — Feedback

88. As a swimmer, I want to submit daily feedback with RPE (1-10), soreness (1-10), comments, good points, and improvement areas so that the coach knows how I feel.
89. As a swimmer, I want my feedback submission to auto-mark my attendance so that I don't have to check in separately.
> ⚠️ **FRONTEND-ONLY** — Auto-attendance and +20 XP award happen in the store's `submitFeedback` method, NOT on the backend API route.
90. As a swimmer, I want to earn XP for submitting feedback so that I'm incentivized to reflect.
91. As a swimmer, I want to only submit one feedback per day so that I don't accidentally duplicate.
92. As a swimmer, I want to submit block-level feedback with like/dislike, tags (e.g., "Too Tight", "Shoulder Pain"), and optional comments so that I can give specific feedback on each set.
> ⚠️ **Tags NOT implemented** — `BlockFeedbackPanel.tsx` always passes `tags: []`. No tag selector UI exists.
93. As a swimmer, I want to submit weekly feedback with per-day sub-feedbacks and a weekly summary so that I can give comprehensive reflection.
94. As a swimmer, I want to save my weekly feedback draft to localStorage so that I don't lose my progress.
> ⚠️ **EXCEEDS PRD** — `WeeklyFeedbackForm` auto-syncs to backend every 2 seconds (debounced) via `api.weeklyFeedbacks.save()`, not just localStorage. Drafts persist on the server.
95. As a swimmer, I want to view my previous weekly feedback submissions and coach replies so that I can track my progress over time.
96. As a swimmer, I want to respond to coach-initiated targeted feedback reminders so that I can answer specific check-ins.
97. As a swimmer, I want to see coach replies to my weekly and targeted feedback so that I know my coach has read my reflections.

### Athlete — Profile & Health

98. As a swimmer, I want to see my avatar, name, group, level, XP total, balance, and streak on my profile so that I know my status.
99. As a swimmer, I want to update my injury status using an interactive SVG body map so that I can report pain visually.
100. As a swimmer, I want to set injury severity (1-10) for specific body regions so that my coach understands the extent.
101. As a swimmer, I want to write injury notes and upload injury photos so that I can describe my condition.
102. As a swimmer, I want to manage my best times (personal records) by adding, editing, and deleting them so that I can track my progress.
> ⚠️ **NOT in profile page** — Performance tracking is in the Achievements tab on `/workout`, not in `/profile`. Profile page has name, main stroke, gender, and readiness.
103. As a swimmer, I want to see my attendance on a monthly calendar with status dots so that I can visualize my check-in pattern.
104. As a swimmer, I want to see my attendance rate percentage so that I know my consistency.

### Athlete — Performance Tracking

105. As a swimmer, I want to add competition times with event, time, meet name, and notes so that I can log my results.
106. As a swimmer, I want the system to auto-detect when I set a Personal Best so that I know my achievements.
107. As a swimmer, I want to see improvement calculations comparing my new time to my previous best so that I can quantify progress.
108. As a swimmer, I want to see a line chart of my times for a specific event over time so that I can visualize my trends.
109. As a swimmer, I want to earn XP for setting a Personal Best so that I'm rewarded for improvement.

### Athlete — Gamification & Economy

110. As a swimmer, I want to earn XP for attendance (+10 frontend + 50 backend + streak/buddy bonuses), feedback (+20), streaks, buddy syncs, and coach rewards so that I'm motivated to participate.
> ⚠️ **BUG: Double XP on attendance** — Frontend `markAttendance` awards 10 XP AND backend `processCheckIn` awards 50+ XP for the same attendance mark.
111. As a swimmer, I want to see my level increase as I accumulate total XP so that I can track my progression.
112. As a swimmer, I want to maintain a training streak with consecutive day check-ins so that I get bonus XP for consistency.
113. As a swimmer, I want to browse the avatar shop by category, tier, and gender so that I can find items I want.
114. As a swimmer, I want to preview items on my avatar before buying so that I know how they look.
115. As a swimmer, I want to purchase items with my XP balance so that I can customize my avatar.
116. As a swimmer, I want some items to be gated by my level so that I have goals to work toward.
> ⚠️ **NOT ENFORCED** — Shop only checks balance and ownership; level-based restrictions are NOT enforced in the purchase route.
117. As a swimmer, I want to equip and unequip owned items in my closet across head, body, lower, feet, hand, and accessory slots so that I can change my look.
118. As a swimmer, I want to add up to 3 items to my wishlist so that I can track what I'm saving for.
119. As a swimmer, I want to see my avatar rendered with all equipped layers so that I can see my full customization.

### Athlete — Buddy System

120. As a swimmer, I want to search for teammates to add as a buddy so that I can find an accountability partner.
121. As a swimmer, I want to send and accept buddy requests so that we can pair up.
122. As a swimmer, I want to earn bonus XP when my buddy and I both attend on the same day so that we're incentivized to train together.
123. As a swimmer, I want to view my buddy's profile card and shared training stats so that I can see our joint progress.
124. As a swimmer, I want to dissolve a buddy pairing so that I can unpair if needed.

### Athlete — Activity Feed

125. As a swimmer, I want to receive real-time notifications for XP earned, coach rewards, buddy syncs, milestones, level ups, meet reminders, and purchases so that I stay informed.
126. As a swimmer, I want to see an unread badge counter so that I know when I have new notifications.
127. As a swimmer, I want notifications to be marked as read when I view them so that I don't see duplicates.

### Athlete — Archive

128. As a swimmer, I want to browse my personal training history so that I can reference past workouts.
129. As a swimmer, I want to filter my archive by month so that I can find specific periods.
> ⚠️ **Month-based navigation only** — Archive uses prev/next month buttons, NOT a date range picker.
130. As a swimmer, I want to view my past plans, feedback, and attendance together so that I can get complete context.
> ℹ️ Archive has two tabs: Training (plans + attendance status) and Feedback (block feedback, weekly feedback, targeted feedback with coach replies).

### Public Pages

131. As a visitor, I want to see a landing page with project overview and quick links so that I understand what AquaFlow Pro is.
132. As an authenticated user visiting the home page, I want to be auto-redirected to my appropriate dashboard so that I land in the right place.
133. As a coach on the pool deck, I want a simplified poolside page with large-touch buttons for quick attendance marking and plan viewing so that I don't need the full dashboard.
134. As the first-time admin, I want a setup page to create my coach account so that I can start using the system.

### System & Infrastructure

135. As a coach, I want the database to stay awake so that I don't experience cold-start delays.
136. As any user, I want the app to gracefully handle database quota errors by switching to offline mode so that I can still access cached data.
137. As any user, I want my data to persist in localStorage for 7 days so that I can work offline and recover on reload.
138. As any user, I want the app to auto-sync every 60 seconds so that I always see the latest data.
> ⚠️ **Templates NOT synced** — Templates collection is persisted locally but NOT fetched from the server in the sync endpoint.
139. As any user, I want optimistic updates so that the UI feels instant even during API calls.
140. As any user, I want the app to roll back optimistic changes if the server call fails so that I'm not shown incorrect data.

### Athlete — Additional UI

141. As a swimmer, I want to see a live countdown timer to the next active meet so that I know how much time I have to prepare.
142. As a swimmer, I want my background theme to change based on time of day or training type so that the interface feels contextual.
143. As a swimmer, I want to manually pick my background theme from available options so that I can personalize my experience.
144. As a swimmer, I want to see my readiness score reflected on my profile so that I know my training state.
145. As a swimmer, I want to set my main stroke preference so that it's tracked in my profile.
> ⚠️ Profile page has name, main stroke, gender, readiness. Best times management is NOT here — it's in PerformanceTracker component accessed via Achievements tab.
146. As a swimmer, I want to view my training history for the past 7 days with attendance and feedback status so that I can see recent activity.
147. As a swimmer, I want to see my readiness score (0-100%) and update my status (Active/Resting/Injured) from the Health tab so that I can report my physical state.
148. As a swimmer, I want to see stats cards (totalXp, balance, level, currentStreak) on my profile so that I have a quick overview.
149. As a swimmer, I want to see a stroke analysis telemetry bar chart in my achievements so that I can visualize my technique.
150. As a swimmer, I want to see a consistency streak ring visualization in my achievements so that I can track my training habit.
151. As a swimmer, I want to see efficiency index and critical speed metrics in my achievements so that I can track my fitness level.

### Bottom Tab Bar Navigation

152. As a swimmer, I want to navigate via a bottom tab bar with 5 tabs so that I can access all features on mobile.
> ℹ️ Tabs: 训练 → `/workout`, 反馈 → `/workout?tab=feedback`, 成绩 → `/workout?tab=achievements`, 状态 → `/workout?tab=health`, 我的 → `/profile`.

## Implementation Decisions

### Architecture

- **Next.js 16 App Router** with route groups `(driver)` for coach and `(athlete)` for swimmer
- **Edge Runtime** on all API routes with `force-dynamic`
- **Cloudflare Pages** deployment with `opennextjs-cloudflare`
- **Neon Serverless Postgres** for database with raw SQL via `getNeon()` tagged templates
- **Repository Pattern** (`lib/repos/`) for entity-specific CRUD on raw SQL
- **Global State** via React Context + useReducer with 60s polling sync, 15s mutation guard, and localStorage persistence (7-day TTL)
- **Optimistic updates** with automatic rollback on server failure

### Data Layer

- All API routes use `getNeon()` for parameterized raw SQL — NOT Prisma
- JSON fields (`blocks`, `targetedNotes`, `injuryBodyMap`, `equippedItems`, etc.) are `JSON.stringify`'d on write, `JSON.parse`'d on read
- GET list responses return bare arrays `[]`, not `{ data: [...] }`
- `flattenPayload()` on all POST/PUT bodies to prevent nested data bugs
- `withApiHandler()` wraps all handlers with error handling and Neon quota detection (HTTP 402 → 503)

### Authentication

- **PBKDF2-SHA256** password hashing (100,000 iterations) via Web Crypto API
- **HMAC-SHA256 JWT** with 7-day expiry, stored in `aquaflow_session` HttpOnly cookie
- **Edge middleware** enforces role-based route protection
- **API guards** (`requireCoach`, `requireAthlete`) at handler level
- **Login rate limiting**: 10 attempts per IP per 5 minutes

### Design System

- **Theme**: Deep-sea dark with cyan/teal accent (`#0a192f` background, `#64ffda` accent)
- **Apex Velocity** premium sports style: `#0a0e1a` navy, `#00f2ff` cyan, glassmorphism cards (`#141b2d`)
- **Tailwind CSS v4** + shadcn/ui ("new-york" style)
- **Framer Motion** for animations
- **Lucide React** for icons
- **Multiple animated background themes** (sunrise, deep ocean, sprint fire, aerobic flow)
- **CSS variable-based colors** (`bg-primary`, `text-muted-foreground`)

### Database Schema (20 models)

Core: `CoachUser`, `Swimmer`, `TrainingPlan`, `Feedback`, `AttendanceRecord`, `PerformanceRecord`, `BlockTemplate`

Extended: `WeeklyPlan`, `DailySession`, `WeeklyFeedback`, `DailyFeedback`, `FeedbackReminder`, `TargetedFeedback`, `BlockFeedback`

Social: `CoachAnnouncement`, `AnnouncementBlock`, `Meet`

Gamification: `ShopItem`, `XpTransaction`, `BuddyPair`, `ActivityFeedItem`

Analytics: `PlanAnalysis`

#### Key Model Fields (beyond obvious)

**Swimmer** — Full field list: `id`, `name`, `group`, `status` ("Active"|"Injured"|"Resting"), `readiness` (Int 0-100), `username`, `password` (hashed), `gender` ("male"|"female"), `xp` (legacy), `totalXp`, `balance`, `level`, `currentStreak`, `lastCheckIn`, `inventory` (Json: purchased item IDs), `equippedItems` (Json: slot→item mapping), `wishlist` (Json: up to 3 item IDs), `mainStroke`, `bestTimes` (Json: event→time map), `injuries` (Json: injury types), `injuryNote`, `injuryBodyMap` (Json: region→severity 1-10), `injuryImageUrl`, `lastProfileUpdate`, `createdAt`, `updatedAt`

**TrainingPlan** — Full: `id`, `date`, `startTime`, `endTime`, `group`, `blocks` (Json: TrainingBlock[]), `totalDistance`, `focus`, `status`, `coachNotes`, `targetedNotes` (Json: swimmerId→private note), `imageUrl`, `isStarred`, `trainingType` ("aerobic"|"anaerobic"|"lactate"|"sprint"|"recovery"|"relaxation"|"strength"|"endurance"|"race_prep"), `primaryStroke` ("Free"|"Back"|"Breast"|"Fly"|"IM"|"Choice"), `analysis` (relation to PlanAnalysis)

**WeeklyPlan** — Full: `id`, `weekStart`, `weekEnd`, `group` (legacy), `title`, `coachNotes`, `isPublished`, `targetGroup` (Json: GroupLevel[] — null + no individual = all athletes), `targetSwimmerIds` (Json: swimmer ID[]), `overviewImageUrl`, `overviewContentHtml`

**DailySession** — Full: `id`, `weeklyPlanId`, `label`, `date`, `imageData`/`imageType` (legacy base64), `notes`, `sortOrder`, `contentBlocks` (Json: block-mode content), `trainingBlocks` (Json: plan-mode training blocks), `totalDistance`, `contentHtml` (rich mode HTML), `editorMode` ("block"|"rich"|"legacy"|"plan"), `trainingType`, `primaryStroke`

**FeedbackReminder** — Full: `id`, `message`, `targetSwimmerIds` (Json, null = entire team), `targetGroup` (String: group filter), `periodStart`, `periodEnd`

**CoachAnnouncement** — Full: `id`, `targetSwimmerIds` (Json), `targetGroup`, `isStarred`, `createdAt`

**BlockTemplate** — Full: `id`, `templateId`, `name`, `category`, `type`, `rounds`, `items` (Json), `note`

**PlanAnalysis** — Full: `id`, `planId` (unique), `imageUrl`, `rawText` (OCR output), `structuredData` (Json: parsed blocks), `coachInsights` (Json: detected patterns), `aiSuggestions` (Json: AI suggestions)

### API Contracts

All endpoints follow REST conventions with bare array responses. Key patterns:
- `GET /api/<entity>` → `[]`
- `POST /api/<entity>` → created record
- `PUT /api/<entity>` → updated record
- `DELETE /api/<entity>` → 200 success
- `flattenPayload()` applied to all POST/PUT bodies to iteratively unwrap nested `{ data: { data: { ... } } }` payloads
- **`V12_FINGERPRINT` headers** on ALL responses: `{ 'X-Build': 'V12-STRATOSPHERE-RECOVERY', 'Cache-Control': 'no-store' }`

**Complete API endpoint inventory:**

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth/login` | POST | Authenticate, set session cookie |
| `/api/auth/logout` | POST | Clear session cookie |
| `/api/auth/me` | GET | Return current user payload or 401 |
| `/api/auth/register-coach` | POST | Create first coach account |
| `/api/plans` | GET, POST, PUT, DELETE | Training plans CRUD |
| `/api/weekly-plans` | GET, POST, PUT, DELETE | Weekly plans CRUD |
| `/api/weekly-plans/sessions` | POST, PUT, DELETE | Daily session CRUD within weekly plans |
| `/api/swimmers` | GET, POST, PUT, DELETE | Swimmer management |
| `/api/swimmers/reward` | POST | Award XP to swimmer |
| `/api/attendance` | GET, POST, DELETE | Attendance tracking |
| `/api/feedbacks` | GET, POST | Daily feedback |
| `/api/weekly-feedbacks` | GET, POST, PATCH | Weekly feedback CRUD + coach reply |
| `/api/feedback-reminders` | GET, POST, PATCH | Targeted feedback reminders + reply |
| `/api/block-feedbacks` | GET, POST, DELETE | Block-level feedback |
| `/api/performances` | GET, POST, PUT, DELETE | Competition times |
| `/api/templates` | GET, POST, PUT, DELETE | Block templates |
| `/api/announcements` | GET, POST, PUT, DELETE | Announcements |
| `/api/meets` | GET, POST, PUT, DELETE | Swim meets |
| `/api/shop` | GET, POST | Avatar shop browse + purchase |
| `/api/shop/seed` | POST | Seed default shop items |
| `/api/buddy` | GET, POST | Buddy system |
| `/api/activity-feed` | GET, POST | Activity notifications |
| `/api/archive/feedbacks` | GET | Archived feedbacks |
| `/api/upload` | POST | R2 file upload |
| `/api/sync` | GET | Polling sync of all entities |
| `/api/keep-alive` | GET | Database keep-alive ping |
| `/api/diagnostic` | GET | Error diagnostic info |
| `/api/plan-analysis` | GET, POST, DELETE | Plan OCR/AI analysis |
| `/api/test-error` | GET | Trigger test error |

> ⚠️ `/api/auth/change-password` was previously documented but does NOT exist in the codebase.

Composite unique constraints enforced at DB level for: feedback(swimmerId,date), blockFeedback(planId,blockId,swimmerId), weeklyFeedback(swimmerId,weekStart), dailyFeedback(swimmerId,date), targetedFeedback(reminderId,swimmerId), buddyPair(swimmer1Id,swimmer2Id).

Cascade deletes on `Swimmer` deletion for all child records.

### State Management

- **10 state collections**: plans, swimmers, feedbacks, attendance, performances, templates, weeklyPlans, announcements, archivedAnnouncements (weeklyFeedbacks from sync are transformed into the `feedbacks` array)
- **7 persisted to localStorage**: plans, swimmers, feedbacks, attendance, performances, weeklyPlans, announcements (templates is local-only; archivedAnnouncements NOT persisted)
- Derived values: `visiblePlans` (14-day cutoff — filters plans older than 14 days unless starred), `visibleAnnouncements` (7-day cutoff — filters announcements older than 7 days unless starred), `totalXP` (⚠️ uses legacy `Swimmer.xp` field, not `totalXp`)
- All CRUD through store methods — never direct `fetch()` from components
- `recordMutation()` before writes to block polling for 15s

**Complete store method inventory:**

| Method | Purpose | API Call | XP Adjust | recordMutation |
|--------|---------|----------|-----------|----------------|
| `addPlan` | Create plan | `POST /api/plans` | No | Yes |
| `updatePlan` | Edit plan | `PUT /api/plans` | No | Yes |
| `deletePlan` | Remove plan | `DELETE /api/plans` | No | Yes |
| `starPlan` | Toggle star | `PUT /api/plans` | No | No (fire-and-forget) |
| `addSwimmer` | Register swimmer | `POST /api/swimmers` | No | Yes |
| `updateSwimmer` | Edit swimmer | `PUT /api/swimmers` | No | Yes |
| `deleteSwimmer` | Remove swimmer | `DELETE /api/swimmers` | No | Yes |
| `submitFeedback` | Submit daily feedback | `POST /api/feedbacks` | +20 XP | Yes |
| `markAttendance` | Mark present | `POST /api/attendance` | +10 XP | Yes |
| `unmarkAttendance` | Undo attendance | `DELETE /api/attendance` | No | Yes |
| `batchMarkAttendance` | Batch check-in | `POST /api/attendance` × N | +10 XP each | Yes |
| `batchUnmarkAttendance` | Batch undo | `DELETE /api/attendance` × N | No | Yes |
| `adjustXP` | Manual XP change | `PUT /api/swimmers` | ±amount | Yes |
| `addPerformance` | Log competition time | `POST /api/performances` | No | Yes |
| `updatePerformance` | Edit time | `PUT /api/performances` | No | Yes |
| `deletePerformance` | Remove time | `DELETE /api/performances` | No | Yes |
| `getSwimmerPerformances` | Filter by swimmer | None (local) | — | — |
| `getSwimmerPBs` | Get PBs by event | None (local) | — | — |
| `addTemplate` | Save training block | `POST /api/templates` | No | Yes |
| `deleteTemplate` | Remove template | `DELETE /api/templates` | No | Yes |
| `addAnnouncement` | Post announcement | `POST /api/announcements` | No | Yes |
| `deleteAnnouncement` | Remove announcement | `DELETE /api/announcements` | No | Yes |
| `starAnnouncement` | Toggle star | `PUT /api/announcements` | No | Yes |
| `getSwimmerArgs` | Get name/group | None (local) | — | — |
| `hydrateMockData` | Load demo data | None | — | — |
| `clearData` | Clear local data | None | — | — |

**Additional state management details:**
- **`dbOffline` flag**: when Neon returns HTTP 402 (quota exceeded), store sets `dbOffline = true`, stops polling, serves from localStorage. Manual refresh resumes sync when database recovers
- **Auto XP rewards**: `markAttendance` calls `adjustXP(+10)` on frontend; backend `processCheckIn` awards 50+ XP (see Bug #1). `submitFeedback` calls `adjustXP(+20)` on frontend (see Bug #2). `batchMarkAttendance` calls `adjustXP(+10)` per swimmer.
- **`adjustXP` limitation**: Only updates legacy `Swimmer.xp` field. Does NOT update `Swimmer.totalXp`/`Swimmer.balance`. Does NOT create `XpTransaction` records.
- **Feedback auto-attendance**: `submitFeedback` calls `markAttendance` with default "Present" status on frontend, but the backend `/api/feedbacks` route does NOT replicate this.
- **Sync Engine** (`lib/store/sync-engine.ts`): 60s polling interval, 15s mutation guard, quota detection, sync status (idle | syncing | error)
- **Persist Layer** (`lib/store/persist-layer.ts`): localStorage with `aquaflow_local_` prefix, 7-day TTL, graceful JSON parse failure handling
- **`hydrateMockData`**: Loads MOCK_PLANS, MOCK_SWIMMERS, and DEFAULT_TEMPLATES from `lib/data.ts`

### File Upload

- **Cloudflare R2** bucket `aquaflow-uploads` for: plan photos, announcement images, avatar items, injury images
- **Canvas-based compression**: `PhotoUpload` component uses canvas `toDataURL` at 0.85 quality with max dimension 2000px to prevent large image timeouts on serverless functions
- Upload flow: `POST /api/upload` returns R2 URL, stored in database

### Video Platform Auto-Detection

- `BlockEditor` and `BlockRenderer` automatically detect video platforms from embed URLs and handle iframe embedding for: **Xiaohongshu, Douyin, Bilibili, QQ Video, YouTube**
- Video thumbnails generated for preview cards

### Level Calculation

Level is derived from `totalXp` via `calculateLevel()` in `lib/date-utils.ts`:

| Level | totalXp Range |
|-------|---------------|
| 1 | 0–499 |
| 2 | 500–1,499 |
| 3 | 1,500–3,499 |
| 4 | 3,500–5,999 |
| 5 | 6,000–9,999 |
| 6 | 10,000–14,999 |
| 7 | 15,000–24,999 |
| 8+ | 25,000+ |

### Key Library Modules

| Module | Purpose |
|--------|---------|
| `lib/db-pool.ts` | Neon SQL client (`getNeon()`, `getPool()`) |
| `lib/repos/base.ts` | BaseRepo abstract class (JSON parse/stringify, requireOne) |
| `lib/repos/` | 15 entity repos: announcements, attendance, block-feedbacks, feedback-reminders, feedbacks, meets, performances, plans, swimmers, templates, weekly-feedbacks, weekly-plans |
| `lib/repos/errors.ts` | Custom errors: NotFoundError, ValidationError |
| `lib/store.tsx` | Global React Context state |
| `lib/store/sync-engine.ts` | 60s polling sync with mutation guard |
| `lib/store/entity-crud.ts` | CRUD operations with optimistic updates + rollback |
| `lib/store/persist-layer.ts` | localStorage persistence with 7-day TTL |
| `lib/api-client.ts` | Frontend HTTP client: 30s timeout, 3 retries, exponential backoff |
| `lib/api-handler.ts` | Backend error wrapper with Neon quota detection |
| `lib/auth.ts` | PBKDF2-SHA256 password hashing |
| `lib/auth-api.ts` | API route guards (requireCoach, requireAthlete, requireAnyAuth, getOptionalAuth) |
| `lib/jwt.ts` | JWT generation/verification, cookie helpers |
| `lib/prisma.ts` | Build-safe Prisma Proxy singleton (deprecated, for edge cases) |
| `lib/db.ts` | Deprecated stub Proxy — use `getNeon()` instead |
| `lib/dictionary.ts` | Bilingual EN/中文 dictionary |
| `lib/i18n.tsx` | LanguageProvider context + useLanguage hook |
| `lib/utils.ts` | `cn()` className utility (clsx + tailwind-merge) |
| `lib/validation.ts` | Form validation helpers |
| `lib/sanitize-html.ts` | DOMPurify HTML sanitization |
| `lib/date-utils.ts` | Date formatting: `getLocalDateISOString()`, `parseUTCDate()`, `calculateLevel()` |
| `lib/group-constants.ts` | GroupLevel constants (Junior, Intermediate, Advanced, External) |
| `lib/background-themes.ts` | Animated theme definitions (sunrise, deep ocean, sprint fire, aerobic flow, etc.) |
| `lib/data.ts` | Mock data (MOCK_PLANS, MOCK_SWIMMERS, DEFAULT_TEMPLATES) |

### Type Definitions (from `types/index.ts`)

- **AvatarSlot**: `base | skinTone | expression | hair | hat | top | bottom | shoes | handheld | accessory | background | specialSkin`
- **AvatarTier**: `basic | entry | advanced | premium | legendary | ultimate`
- **ExpressionId**: 6 expression types for avatar customization
- **SkinTone**: 6 skin tone options
- **GroupLevel**: `Junior | Intermediate | Advanced | External`
- **Swimmer.status**: `"Active" | "Injured" | "Resting"`
- **Swimmer.bestTimes**: `Record<string, string>` (event name → time)
- **TrainingBlock**: block structure with items, rounds, equipment, interval mode
- **PlanItem**: individual item within a training block
- **WeeklyFeedbackType**, **DailyFeedbackEntry**, **TargetedFeedbackType**, **FeedbackReminder**, **BlockFeedback**: feedback system types
- **Announcement**, **AnnouncementBlock**: announcement types
- **SwimEvent**: competition event type definitions
- **XpTransaction.source**: `"attendance" | "feedback" | "streak" | "buddy" | "coach_reward" | "milestone" | "pb" | "purchase" | "levelup" | "starter_pack"`

### Bilingual Support

- `lib/dictionary.ts` with EN/中文 translations
- `useLanguage()` hook for lookup
- All labels use i18n dictionary keys

### HTML Sanitization

- DOMPurify on all rich text editor output
- Prevents XSS in user-generated content

## Testing Decisions

### What Makes a Good Test

- Test external behavior (API responses, component rendering, user interactions), NOT implementation details
- Mock Edge Runtime dependencies (Neon, JWT, cookies)
- Test both happy path and error cases (quota errors, auth failures, validation)

### Modules to Test

1. **API routes** — CRUD operations, auth guards, error handling, quota detection
2. **Store** — optimistic updates, rollback, mutation guard, sync engine, persist layer
3. **Components** — rendering, interaction, state changes, i18n
4. **Utilities** — date formatting, validation, CN class merging, level calculation
5. **Auth** — password hashing, JWT generation/verification, rate limiting

### Prior Art

- `tests/auth-api.test.ts` — Auth API tests
- `tests/components.test.tsx` — Component rendering tests
- `tests/dashboard-components.test.tsx` — Dashboard component tests
- `tests/core-api.test.ts` — Core API route tests
- 203 tests currently passing

### Testing Infrastructure

- **Vitest** with jsdom environment
- `tests/setup.ts` as setup file
- `vitest.config.ts` with globals enabled

## Out of Scope

The following features are explicitly out of scope for the current implementation:

1. **Password reset / forgot password flow** — Currently only initial coach registration and coach-assigned swimmer credentials exist. No self-service password recovery.
2. **Password change for coaches** — No `/api/auth/change-password` endpoint or UI exists despite being planned.
3. **Multi-coach support** — System is designed for 1-2 coaches. No team-based coach roles or permissions hierarchy.
4. **Parent / observer portal** — Token-based read-only access for parents to view their child's progress is planned but not implemented.
5. **Voice-to-AI RPE dictation** — Web Speech API integration for speech-to-text feedback parsing is planned for a future phase.
6. **3D/2.5D Pool drag-and-drop** — Visual lane allocation with drag-and-drop swimmer placement is planned but not implemented.
7. **Internal messaging / chat** — No real-time messaging between coaches and swimmers beyond announcements and feedback replies.
8. **Data export (server-side)** — Training logs and performance data cannot be exported in standard formats (CSV, PDF). Note: client-side JSON backup of localStorage IS implemented in Settings.
9. **Automated milestone rewards** — XP awards for milestones are tracked in the schema but automated triggers are not implemented.
10. **Drag-and-drop schedule rescheduling** — Calendar drag-to-reschedule plans is not implemented.
11. **Push notifications** — No browser push notifications; activity feed is pull-based.
12. **Bulk operations on feedback** — No bulk reply or bulk flag for feedback items.
13. **Advanced analytics dashboards** — Limited to current charts and stats; no advanced data visualization or ML-based insights beyond the current AI injury risk detection.
14. **Video analysis integration** — No frame-by-frame stroke analysis or video upload beyond embed links in announcements.
15. **Nutrition tracking** — No calorie, macro, or hydration tracking features.
16. **Team communication channels** — No Slack-like channels, forums, or group chat.
17. **Shop level gating enforcement** — Items may have a `gatedLevel` concept in design but it is NOT enforced in the purchase route.
18. **Template server sync** — Templates are stored locally but NOT synced from the database.

## Further Notes

### Current Development Branch

Active work is on the `UI` branch. Recent commits focus on:
- Tritonwear-inspired UI overhaul with modularized auth, store, and API layers
- Avatar shop, closet, and background theme enhancements
- Layout alignment fixes and page transition improvements
- Store caching bug fixes for fresh browser sessions

### Known Technical Debt

1. **Prisma ORM** is defined in schema but NOT used by API routes — all queries use raw Neon SQL via repository pattern
2. **TypeScript build errors are intentionally ignored** in `next.config.ts` (`ignoreBuildErrors: true`)
3. **`lib/db.ts`** is a deprecated stub — use `getNeon()` instead
4. **`prisma` export** is a no-op stub — use `getPrisma()` if needed
5. **`PlanModuleEditor.tsx`** at ~60KB is the largest component and could benefit from further decomposition
6. **`/api/auth/change-password` endpoint missing** — planned but not implemented; no password change UI in settings
7. **`Swimmer.xp`** legacy field kept for backward compatibility but should eventually be removed
8. **`WeeklyPlan.group`** field is legacy/hardcoded — targeting now uses `targetGroup` + `targetSwimmerIds`
9. **`DailySession.legacy` mode** with base64 imageData — should migrate to R2 URLs
10. **`lib/data.ts`** mock data still exists — should be removed if no longer used in production
11. **`adjustXP` uses legacy `xp` field** — Should update `totalXp` and `balance` with `XpTransaction` records instead
12. **`totalXP` derived value uses legacy field** — Store calculates from `Swimmer.xp` instead of `Swimmer.totalXp`
13. **`clearData` incomplete** — Only clears 5 of 9 state collections
14. **Schedule color-coding by intensity, not group** — PRD says "color-coded by group" but actual implementation uses distance-based intensity
15. **Quick-plan missing photo mode, auto-save, template browser** — Stories 24-28 documented but not implemented
16. **No poolside quick-access attendance page** — Story 42 documented but `/poolside` doesn't have attendance marking UI
17. **No training plan archive** — Story 80 documented but archive page only covers feedback and announcements
18. **No XP transaction ledger UI** — Story 50 documented but no UI to view `XpTransaction` records
19. **No RPE filter on feedbacks page** — Story 52 partially documented; RPE threshold filter not implemented
20. **No injury type filter on injury monitor** — Story 70 documented but no filter dropdown exists

### Confirmed Bugs

1. **Double XP on attendance** — Frontend `markAttendance` awards 10 XP AND backend `processCheckIn` awards 50 XP base (+ streak bonus up to 50 + buddy bonus 20) for the same attendance mark. Total per attendance: 60–120 XP instead of intended 50–120 XP.
2. **Feedback auto-attendance frontend-only** — Submitting feedback auto-marks attendance and awards +20 XP on the frontend store, but the backend `/api/feedbacks` route does NOT replicate this. If another tab/server process checks attendance, the frontend optimistic state may diverge.
3. **Shop level gating not enforced** — Purchase route only checks `balance >= price` and `!inventory.includes(itemId)`. Level-based item restrictions are NOT checked.
4. **Templates never synced from server** — Templates are persisted to localStorage but the `/api/sync` endpoint does NOT fetch them. New templates saved by one browser won't appear in another.
5. **`adjustXP` uses legacy `xp` field** — The store's `adjustXP` function updates `Swimmer.xp` (deprecated legacy field) instead of `Swimmer.totalXp` and `Swimmer.balance`. No `XpTransaction` record is created. Frontend XP adjustments don't flow through the dual-track system.
6. **`totalXP` derived value uses legacy field** — The store calculates `totalXP` using `Swimmer.xp` (legacy) instead of `Swimmer.totalXp`. This produces incorrect totals for swimmers on the dual-track system.
7. **`clearData` is incomplete** — The settings "清除所有数据" button only clears 5 of 9 collections: plans, swimmers, feedbacks, attendance, performances. Does NOT clear templates, weeklyPlans, or announcements.
8. **Block feedback tags NOT implemented** — `BlockFeedbackPanel.tsx` always passes `tags: []` with no tag selector UI. User stories mentioning tag selection ("Too Tight", "Shoulder Pain") are not fulfilled.
9. **MeetCountdown doesn't filter by isActive** — `MeetCountdown` component shows whatever `/api/meets.getCountdown()` returns without checking `Meet.isActive` flag. Inactive meets still display countdown.
10. **Quick-plan missing features** — Photo upload mode, draft auto-save, and workout library/template browser are NOT implemented on the quick-plan page (stories 24-28).
11. **Poolside quick-access page NOT implemented** — No large-touch attendance marking page exists at `/poolside`.
12. **No training plan archive** — The coach archive page only covers feedback and announcements. There is no way to browse historical training plans.
13. **No XP transaction ledger UI** — `XpTransaction` records exist in the database but there is no UI to view them.

### Sync Endpoint Behavior

The `/api/sync` endpoint has important filtering behavior NOT previously documented:
- **Announcements cutoff**: Only returns announcements where `createdAt >= 7 days ago` OR `isStarred = true`. Older non-starred announcements go to `archivedAnnouncements`.
- **Weekly plans filter**: Only returns `isPublished = true` weekly plans.
- **Swimmer password stripping**: Athletes receive swimmer data with passwords stripped; coaches receive full data including hashed passwords.
- **Weekly feedbacks transformation**: The sync endpoint returns `weeklyFeedbacks` with nested `dailyFeedbacks`. The store transforms daily sub-feedbacks into the main `feedbacks` array with default RPE=5, soreness=3 for display purposes.
- **Templates gap confirmed**: Templates are NOT included in the sync response. They exist only in localStorage.

### Deployment Notes

- Custom domain: `sw.sportsflow.best`
- R2 bucket: `aquaflow-uploads` (configured in `wrangler.toml`)
- Database: Neon Serverless Postgres (cold starts ~2-5 seconds)
- Build: `opennextjs-cloudflare build && wrangler deploy --minify`
- Pre-deploy: run `npx tsc --noEmit` to catch type issues
- `wrangler.toml`: Cloudflare Pages config with R2 binding, `serverExternalPackages` for Prisma
- `next.config.ts`: Turbopack enabled, `ignoreBuildErrors: true`, `serverExternalPackages` for `@prisma/client` and `.prisma/client`
- `tsconfig.json`: `ignoreBuildErrors` and path aliases configured
- `components.json`: shadcn/ui config with "new-york" style, lucide icons, Tailwind CSS v4

### Key Component Inventory

**Dashboard Components** (`components/dashboard/`): AIInsight, AnnouncementComposer, AthletesFeedbackPanel, AttendanceStats, BlockEditor, OnboardingChecklist, PaceCalculator, PlanModuleEditor (~60KB), RecentPerformances, RefreshButton, RichTextEditor, SessionRenderer, SwimmerModal, SwimmerStatusPanel, TeamFeedbackSummary, TeamStatsPanel, TodayAttendance, WeeklyPlanCard, WorkoutLibrary

**Athlete Components** (`components/athlete/`): ActivityFeed, AttendanceCalendar, AvatarRenderer, BackgroundParticles, BackgroundPicker, BlockFeedbackPanel, BottomTabBar (5 tabs), BuddySystem, CoachReplyPanel, FeedbackForm, InjuryMap, LoginForm, MeetCountdown, PerformanceChart, PerformanceTracker, ProfileUpdateModal, ShopAndCloset, SwimmerSelect, TargetedFeedbackForm, TrainingHistory, WeeklyFeedbackForm

**Common Components** (`components/common/`): BlockRenderer, ImageViewer, LanguageToggle, Toast, ConfirmDialog, Breadcrumbs, WaveAnimation

**Layout Components** (`components/layout/`): Sidebar (desktop), MobileNav (mobile drawer)

**Auth Components** (`components/auth/`): CoachGuard (client-side role verification with 15s cold-start timeout)

**Other**: DbStatus (database status indicator), AnnouncementCard (feed)

**Plan Components** (`components/plan/`): PhotoUpload (canvas compression, drag-and-drop, R2 upload)

### Gamification Economy Balance

- **Daily XP income** (normal training day): ~80-130 XP for average swimmer
- **6-month projected earnings**: ~10,500-17,000 XP
- **Shop tiers**: basic, entry, advanced, premium, legendary, ultimate (6 tiers)
- **12 slot types**: base, skinTone, expression, hair, hat, top, bottom, shoes, handheld, accessory, background, specialSkin
- **200-item shop catalog planned** across 6 tiers and 7 wearable slot types (head, eyes, body, lower, feet, hand, background)
- **Level gating**: Some items require minimum swimmer level to purchase (DESIGNED BUT NOT ENFORCED)
- **Gender split**: Shop items support male/female/unisex variants
- **XP sources with amounts**:
  - Attendance: +10 XP (frontend via `adjustXP`) + 50 XP base (backend via `processCheckIn`) + streak bonus (up to +50) + buddy bonus (+20)
  - Feedback: +20 XP (frontend via `adjustXP` in `submitFeedback`)
  - Coach reward: arbitrary amount (via `POST /api/swimmers/reward`)
  - Personal Best: variable (not yet automated)
  - Milestone: variable (not yet automated)
  - Starter pack: initial XP on swimmer creation
> ⚠️ Frontend `adjustXP` only updates legacy `Swimmer.xp` field — does NOT flow through dual-track system (`totalXp`/`balance`) or create `XpTransaction` records.
- **Wishlist**: Maximum 3 items per swimmer

### Key File Reference

| File | Purpose |
|------|---------|
| `lib/db-pool.ts` | Neon SQL client singleton |
| `lib/repos/` | 15 entity-specific CRUD repos |
| `lib/repos/base.ts` | BaseRepo abstract class |
| `lib/repos/errors.ts` | NotFoundError, ValidationError |
| `lib/store.tsx` | Global state with polling sync |
| `lib/store/sync-engine.ts` | 60s polling + mutation guard |
| `lib/store/entity-crud.ts` | CRUD with optimistic updates |
| `lib/store/persist-layer.ts` | localStorage persistence |
| `lib/api-client.ts` | HTTP client with retry/backoff |
| `lib/api-handler.ts` | Error wrapper with quota detection |
| `lib/auth.ts` | PBKDF2 password hashing |
| `lib/auth-api.ts` | API route guards |
| `lib/jwt.ts` | JWT generation/verification |
| `lib/prisma.ts` | Build-safe Prisma Proxy |
| `middleware.ts` | Edge route protection |
| `lib/dictionary.ts` | Bilingual EN/zh dictionary |
| `lib/i18n.tsx` | LanguageProvider + useLanguage |
| `lib/utils.ts` | `cn()` className utility |
| `lib/validation.ts` | Form validation |
| `lib/sanitize-html.ts` | DOMPurify sanitization |
| `lib/date-utils.ts` | Date formatting + level calculation |
| `lib/group-constants.ts` | GroupLevel constants |
| `lib/background-themes.ts` | Animated theme definitions |
| `lib/data.ts` | Mock data |
| `types/index.ts` | All TypeScript type definitions |
| `components/dashboard/PlanModuleEditor.tsx` | ~60KB training plan editor |
| `components/dashboard/BlockEditor.tsx` | Multi-block content editor |
| `components/dashboard/WorkoutLibrary.tsx` | Template browser + tools |
| `components/athlete/ShopAndCloset.tsx` | Avatar shop + inventory |
| `components/athlete/InjuryMap.tsx` | Interactive SVG body map |
| `components/athlete/BuddySystem.tsx` | Buddy pairing management |
| `components/athlete/BottomTabBar.tsx` | Mobile bottom navigation (5 tabs) |
| `components/athlete/AvatarRenderer.tsx` | Layered avatar compositing |
| `components/athlete/MeetCountdown.tsx` | Live meet countdown |
| `components/athlete/BackgroundPicker.tsx` | Theme selector |
| `components/athlete/BackgroundParticles.tsx` | Animated background effects |
| `components/athlete/PerformanceChart.tsx` | Performance trend chart |
| `components/athlete/PerformanceTracker.tsx` | Competition time management |
| `components/athlete/ActivityFeed.tsx` | Activity notification feed |
| `components/auth/CoachGuard.tsx` | Client-side auth guard |
| `components/common/BlockRenderer.tsx` | Content block renderer |
| `components/common/ConfirmDialog.tsx` | Confirmation dialog |
| `components/common/ImageViewer.tsx` | Image lightbox |
| `components/common/LanguageToggle.tsx` | EN/中文 toggle |
| `components/common/Breadcrumbs.tsx` | Navigation breadcrumbs |
| `components/common/Toast.tsx` | Toast notifications |
| `components/plan/PhotoUpload.tsx` | Photo upload with canvas compression |
| `components/layout/Sidebar.tsx` | Desktop sidebar |
| `components/layout/MobileNav.tsx` | Mobile navigation drawer |
| `components/DbStatus.tsx` | Database status indicator |
| `components/feed/AnnouncementCard.tsx` | Announcement feed card |
| `prisma/schema.prisma` | Database schema (20 models) |
| `wrangler.toml` | Cloudflare deployment config |
| `next.config.ts` | Next.js config with Turbopack |
| `vitest.config.ts` | Test configuration |

---

## Technical Debt & Codebase Quality Audit (2026-05-29)

> 详细技术债审计文档请参阅: [codebase-tech-debt-audit.md](./requests/2026-05-29-codebase-tech-debt-audit.md)

### 已确认的 7 项技术债

| 优先级 | 类别 | 简述 | 状态 |
|--------|------|------|------|
| 🔴 P0 | 类型安全 | 全项目 93 处 `as any`，api-client/store 大量 `any` 类型 | 待实施 |
| 🔴 P0 | Store 架构 | 单一 Context 含 9 个 collection + 25+ 方法，全局 re-render | 待实施 → Zustand 拆分 |
| 🔴 P0 | 同步机制 | /api/sync 全量加载 9 张表，每 60s 轮询 | 待实施 → 增量同步 |
| 🟠 P1 | 组件拆分 | workout/page.tsx 934 行，PlanModuleEditor 610 行 | 待实施 → 局部拆分 |
| 🟠 P1 | i18n 补全 | 多处硬编码中文，切换英文时体验不一致 | 待实施 |
| 🟠 P1 | API Handler | `__req__` hack 不稳定 | 待实施 |
| 🟡 P2 | 项目卫生 | 重复文件、残留 log/diff/build 文件 | 待实施 |
