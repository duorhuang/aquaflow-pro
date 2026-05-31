# Discussion Record: UX & Backend Refinement (2026-05-29)

**Date**: 2026-05-29  
**Status**: IN_DISCUSSION (Initiated via `/grill-me` session)

---

## 1. Overview of the Refinement Initiative

Following the completion of the core UI visual designs, the team is entering a dedicated refinement phase focused on:
1. **UX Design Refinement**: Enhancing micro-interactions, state transitions, mobile ergonomics, offline sync notifications, error recovery states, and cognitive workflows.
2. **Backend Improvements**: Optimizing data syncing mechanics, relational integrity, error boundaries, performance caching, and preparing for future advanced integrations (e.g., Voice-to-AI dictation parsing, parent tokens).

This document serves as the live request and alignment ledger for these refinements, adhering strictly to the request record policy.

---

## 2. Identified UX & Visual Gaps in Codebase Audit

Our deep code audit of active pages (especially the mobile-first Athlete Portal) has uncovered several specific areas that do not fully match a high-fidelity premium experience or are partially stubbed:

### ⚠️ A. Buddy System Placeholders & Lack of Immersion
- **What is not working:**
  - Inside [BuddySystem.tsx](file:///Users/Duor/Desktop/swim-team/aquaflow-pro/components/athlete/BuddySystem.tsx#L211-L216), the "ME" avatar slot in the active buddy card is represented by a static dotted box with a `👋😃` emoji.
  - In the team member search/discovery grid, athletes are rendered using a generic `👤` emoji [BuddySystem.tsx#L349-L351] instead of displaying their equipped avatars.
- **Proposed Solution:** Integrate the `<AvatarRenderer>` component in both places using the actual athlete's gender and `equippedItems` properties. This creates an immersive experience where players see their friends' customized outfits in the social tab.

### ⚠️ B. Hardcoded Languages in Injury Map
- **What is not working:**
  - The [InjuryMap.tsx](file:///Users/Duor/Desktop/swim-team/aquaflow-pro/components/athlete/InjuryMap.tsx#L17-L121) contains hardcoded Chinese strings for body regions (e.g., `头部`, `左肩`, `右大腿`) and pain level labels. This breaks the platform's bilingual compliance when switching to English.
- **Proposed Solution:** Migrate all body region labels to the dictionary engine `lib/i18n.tsx` so they toggle dynamically.

### ⚠️ C. Missing Voice-to-AI RPE Dictation
- **What is not working:**
  - The voice-to-text RPE input is completely missing from [FeedbackForm.tsx](file:///Users/Duor/Desktop/swim-team/aquaflow-pro/components/athlete/FeedbackForm.tsx). Swimmers must type their comments manually.
- **Proposed Solution:** Implement a microphone overlay button next to the comments box. When clicked, it initiates the browser's `webkitSpeechRecognition` API, showing a pulse wave animation and transcribing verbal comments into the text area.

### ⚠️ D. Static Exertion Slider Feeds
- **What is not working:**
  - The RPE and Soreness sliders are simple range sliders. Dragging them changes a static number but does not offer micro-animations, color gradients, or glowing indicators that fit the "Apex Velocity" premium style.
- **Proposed Solution:** Add dynamic HSL glow panels behind the sliders that pulsate and shift colors (from cool green/cyan to flame crimson) as the athlete drags their finger.

---

## 3. Agreed Requirements Ledger (To be populated during the discussion)

*(This section will record the decisions, specifications, and modifications finalized during the interactive grill-me session with the user.)*

