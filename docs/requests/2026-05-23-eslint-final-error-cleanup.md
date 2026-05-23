# ESLint Final Error Cleanup & Codebase Hardening

**Date:** 2026-05-23

## Request
Ensure no issue or error is left in the codebase. Specifically, target and eliminate all remaining ESLint errors (such as TDZ hoisting issues, React 19 cascading state updates in useEffect, unescaped HTML entities, and render-phase ref access) and ensure the TypeScript build and next build compile successfully with zero errors.

## Target Area for Cleanup
Based on the `eslint_errors.txt` log, we need to address specific errors across the following components and pages:
1. **TDZ Hoisting Errors (Accessed before declaration)**:
   - `app/(athlete)/archive/page.tsx`
   - `app/(driver)/dashboard/archive/page.tsx`
   - `app/(driver)/dashboard/feedbacks/targeted/page.tsx`
   - `components/athlete/TargetedFeedbackForm.tsx`
2. **Cascading State Updates in useEffect**:
   - `app/(athlete)/archive/page.tsx`
   - `app/(athlete)/login/page.tsx`
   - `app/(driver)/dashboard/plan/[id]/page.tsx`
   - `app/poolside/page.tsx`
   - `components/dashboard/PlanEditor.tsx`
   - `components/layout/MobileNav.tsx`
   - `lib/i18n.tsx`
   - `lib/store.tsx`
3. **Render-Phase Ref Access**:
   - `components/dashboard/BlockEditor.tsx`
4. **Unescaped HTML Entities**:
   - `app/(driver)/dashboard/attendance/page.tsx`
   - `app/(driver)/settings/page.tsx`
   - `components/athlete/CoachReplyPanel.tsx`
   - `components/athlete/PerformanceTracker.tsx`
   - `components/athlete/TargetedFeedbackForm.tsx`
   - `components/dashboard/AthletesFeedbackPanel.tsx`
   - `components/dashboard/PaceCalculator.tsx`
