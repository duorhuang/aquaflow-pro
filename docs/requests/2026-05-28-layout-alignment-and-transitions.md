# Request: Layout Alignment, Store Caching Bug Fix, and Page Transitions

**Date**: 2026-05-28  
**Status**: ✅ 已完成 (Completed)

## Background & Objectives
The user reported three key visual and functional alignment issues:
1. **Layout Consistency**: Website data (swimmers/coaches roster) and custom plans were not populating or rendering consistently on dashboard and training pages.
2. **Store Caching Bug**: The application failed to render database-seeded weekly plans, announcements, and feedback on browsers with fresh local cache.
3. **Broken Transitions**: Clicking weekly plan cards navigated to the weekly-plan form but failed to load the plan data (ignored query parameters), and key dashboard widgets lacked one-click detailed navigation links.

## Action Plan & Executed Solutions

1. **Store Data Sync Integration**:
   - Refactored `handleLoad` in `lib/store.tsx` to merge local collections without aborting the rest of the database-fetched load.
   - Restored seamless visibility of weekly plans, coach logs, and team feedback across browser sessions.

2. **Route Guard Synchronization**:
   - Registered `/settings` under server-side Next.js middleware guards in `middleware.ts` to block unauthenticated coach panel access.

3. **Weekly Plan Parameter Loading**:
   - Upgraded `WeeklyPlanPage` in `app/(driver)/dashboard/weekly-plan/page.tsx` to handle parameter reading with a `<Suspense>` wrapper and `useSearchParams`.
   - Enabled instant auto-loading of individual plans from dashboard card clicks.

4. **One-Click Metrics Redirection**:
   - Injected click-through navigations into `TodayAttendance.tsx` (`/dashboard/attendance`), `SwimmerStatusPanel.tsx` (`/dashboard/athletes`), and `AthletesFeedbackPanel.tsx` (`/dashboard/feedbacks`) to unify the navigation flow.

## Verification
- **Unit Tests**: 203/203 unit tests passed successfully.
- **Production Build**: Compiles successfully with optimized Turbopack statically-prerendered pages.
