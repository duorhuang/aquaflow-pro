# Player Feedback Section Redesign & Refinement

**Date:** 2026-05-22

## Request
Refine the player feedback system to support seamless auto-syncing, clean organization of feedback for the coach, visual weekly status tracking, and consolidated reporting.

Specifically:
1. **Auto-Syncing Drafts**:
   - Save and sync athlete feedback to the backend automatically as they write (without forcing manual "Save Draft" clicks or publishing to see it).
   - Allow coaches to immediately see the athlete's progress in real-time under a "Draft" status, protecting against any data loss.
2. **Weekly Tracking & Labeling**:
   - Provide the coach with an intuitive, clean visual overview of the week (e.g., Monday through Sunday tracking) to show at a glance which days the player has logged and which are pending.
   - Distinctly label feedback entries with states like "Draft" (草稿) and "Synced/Completed" (已提交).
   - Organize the coach's inbox interface into tabs (e.g., "Submitted" vs "Drafts/In Progress") to prevent data volume from cluttering the main interface by default while maintaining full accessibility.
3. **Consolidated Reporting**:
   - Once a week is completed/synced, the coach can submit a single, comprehensive response for the entire week.
   - Crucially, daily details from preceding days must remain fully preserved and visible so coaches can check on player logs at any point.

## Proposed Solution & Architecture
- **Athlete UI (`WeeklyFeedbackForm.tsx`)**:
  - Implement a debounced auto-save mechanism. When the athlete edits daily RPE, soreness, reflection, or the weekly summary, the form automatically saves and syncs to the server.
  - Display a subtle auto-saving status indicator ("Draft Auto-saved" or "Saving...") in the athlete UI.
- **Backend API (`app/api/weekly-feedbacks/route.ts`)**:
  - Update the GET handler so it can fetch all weekly feedbacks (both submitted and drafts) or filter by a new parameter (e.g., `submitted=true` vs all).
- **Coach UI (`app/(driver)/dashboard/feedbacks/page.tsx`)**:
  - Split the coach inbox into two distinct tabs:
    1. **已提交 (Synced/Submitted)**: Feedbacks officially synced/completed by players, where coaches can write replies.
    2. **进行中 / 草稿 (In Progress / Drafts)**: Auto-synced daily logs that are still in progress, allowing coaches to check player statuses without cluttering the main review queue.
  - Add a beautiful daily tracking bar (7 pills representing Mon-Sun) for each swimmer in both collapsed and expanded views. The pills should visually indicate whether a day is filled (with a log reflection) or pending.
  - Preserve all daily logs and details and make them beautifully structured when a coach expands a card.
