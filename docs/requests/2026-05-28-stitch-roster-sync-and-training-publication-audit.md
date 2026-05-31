# Request: Stitch Roster Sync and Training Publication Audit

**Date**: 2026-05-28  
**Reporter**: User  
**Status**: 🔄 In Progress  

## Background & Objectives
The user reported that Google Stitch does not accurately reflect the actual data and features of the live website when generating designs. Instead, it generates random, fictional team member and coach names, and does not align with the system's actual functional connections (specifically the training publication pipelines).

To solve this, we will execute two main initiatives:
1. **Stitch Roster & System Context Synchronization**: Expose real system metadata, swimmer rosters (Doody, James, Cherry, Amber), active coach entities, and editor modes directly to Google Stitch so it utilizes authentic data.
2. **Training Publication Audit & Stabilization**: Verify that every single weekly and daily training session publication pathway (including the `block`, `rich`, `legacy`, and `plan` editor modes, targeting controls, and database saving) is 100% functional and securely bound from the frontend down to the database schema.

---

## Part 1: Stitch Context Synchronization Solution
Google Stitch generates screens based on prompts, but has no live connection to the active Next.js Postgres/Neon database. To ensure it accurately utilizes authentic data, we will:
- Generate a static **Design Data Context Spec (`docs/stitch-context.json`)** outlining:
  - Real Swimmers: `Doody` (s1), `James` (s2), `Cherry` (s3), `Amber` (s4) with their levels, streaks, XP, main strokes, equipped avatars, and status.
  - Active Coaches and usernames.
  - Core publication types, schemas, and editor mode specifications (`block`, `rich`, `legacy`, `plan`).
  - Active UI tokens (colors, font face families, margins, HSL tokens).
- Configure the agent session so that every time a design is requested or updated via Google Stitch, this context file is loaded and injected as the grounding schema in the Stitch API prompts, ensuring designs use real names and connect correctly.

---

## Part 2: Training Publication Audit Checklist
We will perform a deep integration audit on the training publication paths:
1. **Targeting Mechanism**: Verify that target groups (`targetGroup`) and individual swimmers (`targetSwimmerIds`) are accurately captured in the weekly-plan form, stored as JSON in Postgres, and filtered properly on the athlete dashboard.
2. **Session Editor Modes**: Verify that the daily session editor properly handles all four modes:
   - `legacy`: Image upload + annotation notes.
   - `rich`: Rich text editor (`contentHtml`) + HTML block layout.
   - `block`: Structure blocks (`contentBlocks` JSON arrays: text/image/video/link).
   - `plan`: Detailed training sets (`trainingBlocks` JSON arrays: warmup, main set, cool down).
3. **Database Bindings**: Walk through `app/api/weekly-plans` and `app/api/plans` endpoints and trace the repositories to guarantee that JSON-to-string serialization/deserialization does not throw exception errors.
