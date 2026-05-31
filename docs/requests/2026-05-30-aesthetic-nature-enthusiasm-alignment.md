# Request: Aesthetic Style Shift — Nature & Enthusiastic Life Integration

**Date**: 2026-05-30  
**Reporter**: User  
**Status**: 🔄 In Progress  
**Request Type**: Aesthetic Refinement & Visual Polish

---

## 1. Request Overview
The user requested to verify and check all UI changes, ensuring that the entire platform is finished. 
Specifically, they want the website to evoke:
1. **Style of Nature**: Deep-sea elements, forest emeralds, calm wave physics, foliage/water particle aesthetics, and a natural, soothing vibe.
2. **Style of Life of Enthusiasm**: High-energy glowing states, vibrant sunlit gradients, gold/amber/fire accents, active gamification cues, and micro-animations representing the passion of high-performance swimming.
3. **Perfect Backgrounds and Buttons**: Ensure every background uses a rich, dynamic HSL-tailored gradient and texture, and that *every single button* is meticulously styled (not left plain or default) with premium hovers, active feedback, clear borders, and gorgeous shadows.

---

## 2. Identified Aesthetic Adjustments
To perfectly satisfy these parameters, we are executing the following visual overhauls:

### A. Landing Page Hero Polish (`app/page.tsx`)
*   **Background**: Shift from a static near-black color to an immersive, breathing deep-ocean nature gradient (`from-[#041a1c] via-[#052220] to-[#01090d]`).
*   **Wave Physics**: Integrate `<WaveAnimation />` at the bottom to represent natural fluid flow.
*   **Coach Button (Enthusiasm)**: Redesigned as a high-heat amber-to-orange sunburst button (`from-amber-400 via-orange-400 to-yellow-500` with gold glow shadows) representing active, enthusiastic leadership.
*   **Athlete Button (Nature)**: Redesigned as an emerald-to-teal clear sea glass button (`from-emerald-500/20 via-teal-500/10 to-cyan-500/20` with forest emerald borders and shadows) representing natural speed and aerobic flow.
*   **Typography**: Apply display metrics and floating micro-animations to the landing header.

### B. Global Background and Button Audit
*   Ensure that every dashboard card has a `.glow-border` or glassmorphic outline.
*   Confirm that rating sliders are backed by gorgeous glowing HSL tracks (1-3: Neon Cyan, 4-5: Forest Emerald, 6-7: Golden Sun, 8-10: Sprint Fire Red).
*   Verify that time-based time-of-day backgrounds and training type overlays are functioning correctly.

---

## 3. Verification Plan
1.  **TypeScript Safety**: Run `npx tsc --noEmit` to confirm zero compilation errors.
2.  **Unit Tests**: Run `npx vitest run` to ensure all 203 backend and frontend tests pass.
3.  **Visual Check**: Manually review component rendering.
