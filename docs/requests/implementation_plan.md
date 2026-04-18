# Implementation Plan: V12 Production Stabilization Phase II

This plan addresses the four specific user-reported bugs surrounding performance, data accuracy, feedback persistence, and session robustness.

## 1. Feedback Sync Issue
**Symptom:** Coach sends feedback, but it doesn't appear on the athlete dashboard.
**Root Cause:** The `CoachReplyPanel` in the athlete app fetches data strictly on mount rather than drinking from the live-updating `useStore()`. This means it doesn't reflect real-time syncs.
**Proposed Change:** 
- Modify `CoachReplyPanel.tsx` to read `feedbacks` directly from the global store, enabling real-time UI updates alongside the 30s auto-sync.

## 2. Data Accuracy (Multi-photo Per Day)
**Symptom:** If a coach uploads 2 photos for the same day, the athlete only sees 1.
**Root Cause:** `getSelectedDatePlan()` uses `.find()`, which stops at the first matching image for a given date.
**Proposed Change:**
- Refactor `poolside/page.tsx`'s derivation logic. Change the plan rendering from a single `selectedPlan` object to `selectedPlans` (an array).
- Loop through all sessions matching the selected date to display all linked images and coach notes for that specific day.

## 3. Athlete Record Permissions & Unknown Swimmer
**Symptom:** Ghost "Unknown Swimmers" on Dashboard, and athletes cannot delete historical log entries.
**Root Cause:**
- Orphaned database performances (linked to deleted mock IDs) display as "未知队员".
- `WeeklyFeedbackForm` lacks a targeted explicit "Delete / Clear Entry" visual button for individual daily logs.
**Proposed Change:**
- In `dashboard/page.tsx`, filter out orphaned performances or hide them if `name === '未知'`.
- In `WeeklyFeedbackForm.tsx`, add a "清除今日记录" (Clear Day Record) button that resets RPE, Soreness, and Reflection for a specific day.

## 4. Performance, Lag, & Session Logout on Refresh
**Symptom:** Refreshing the athlete app logs them out (Session Expired interface).
**Root Cause:** The athlete `useEffect` hook runs synchronously at mount, checking `swimmers` array before the background API `safeFetch` populates it. It instantly marks `currentUser = null` and renders the logout state before data arrives.
**Proposed Change:**
- In `app/(athlete)/workout/page.tsx`, hold the Authentication resolution lock explicitly until `storeLoaded` is strictly `true`. Do not show "Session Expired" unless `storeLoaded === true` AND `user` is not found.

## Verification
- Refresh the swimmer dashboard and verify no immediate logout occurs.
- Upload 2 mock pictures for Monday and verify both render.
- Test clearing a log from the athlete's side.

