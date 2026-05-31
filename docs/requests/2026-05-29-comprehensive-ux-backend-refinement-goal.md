# Goal: Comprehensive UX & Backend Technical Debt Resolution (2026-05-29)

**Date**: 2026-05-29  
**Status**: IN_PLANNING (Triggered via `/goal` session)

---

## 1. Overview of the Goal

The user has requested to comprehensively address and resolve all technical debt and existing bugs related to the UX and backend components across the entire codebase. This includes resolving the issues outlined in:
1. `docs/prd-complete.md` (unimplemented stories, ⚠️ items)
2. `docs/requests/2026-05-29-codebase-tech-debt-audit.md` (P0/P1/P2 audit points)
3. `docs/requests/2026-05-29-ux-optimization-prd.md` (agreed interactive roadmap choices)

We must ensure that the implementations are detailed, fully functional, highly premium, and introduce **zero new technical debt** while maintaining high testing and type-safety standards.

---

## 2. Identified Target Areas for Implementation

### Group A: P0 & Architectural Refinements
- **API and Store Type Safety (Eliminate `any`):** Remove all raw `any` types and `as any` casting across the API layer, store layer, and entity-crud modules.
- **Store Hydration & Re-render Optimization:** Restructure key store context states and callbacks to optimize re-renders without adding external dependencies (like Zustand, since it is not in package.json).
- **Incremental Sync Engine:** Upgrade the sync engine in both `sync-engine.ts` and `/api/sync` route to accept `lastSyncTimestamp` and return delta modifications only, preventing massive over-fetching.

### Group B: UX Visuals & State Gaps (Swimmer Portal)
- **Buddy System Avatars:** Render dynamic dynamic equipping custom avatars (`<AvatarRenderer>`) inside active buddy details and roster search lists.
- **Exertion/Fatigue Sliders:** Upgrade standard slider inputs in `FeedbackForm` to feature vibrant glowing HSL track panels that shift from neon cyan to pulsing Sprint Fire Red depending on user drag selection.
- **Voice-to-AI dictation:** Add a pulsing microphone dictation widget integrating HTML5 Web Speech API and an Edge route parser.
- **i18n Anatomy Labels:** Localize the SVG region coordinates and tooltips in `InjuryMap.tsx`.

### Group C: Dashboard Refinements (Coach Portal)
- **Injury Heatmap Interaction:** Enable clickable region overlays on the coach-side SVG injury heatmap to trigger a glassmorphic sidebar/drawer showing athletes suffering from that specific muscle pain.
- **Scratchpad Guard:** Protect daily sessions layouts in the weekly composition view by caching current edits in client-side state across layouts transitions.
- **Star Toggle & templates Browser:** Integrate starred plan quick toggles and prebuilt training blocks libraries browser into the coach daily plan composer.

### Group D: State Consistency & Database Hardening
- **Double XP Reward Remediation:** Relocate check-in reward formulas to backend DB queries and process transactions atomically in the Neon DB.
- **Level-Gating Purchase Safety:** Assert level constraints inside `/api/shop` before completing transactions.
- **Templates Syncing:** Direct syncing of block templates over Neon.

---

## 3. High-Quality Verification Strategy
- Run unit/integration tests (`npm test` or `vitest`) to ensure no regressions are introduced.
- Maintain existing 203 passing tests and extend new tests to cover incremental sync, level-gating, and custom models.
