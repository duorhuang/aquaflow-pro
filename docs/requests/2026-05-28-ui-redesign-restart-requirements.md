# Request: UI Redesign & Active Requirements Alignment Restart

**Date**: 2026-05-28  
**Reporter**: User  
**Status**: 🔄 Researching / Requirement Discovery  
**Request Type**: Core Pivot & UI/UX Redesign

---

## 1. Request Overview
The user has requested to discard previous discussion details and assumptions, restart the requirements elicitation process from a clean slate, and collaboratively design and execute a comprehensive UI/UX redesign for the entire website. The goal is to ensure the website aligns precisely with their real-world usage patterns, data structures (swimmers, coaches, and team configuration), and functional interactions.

---

## 2. Core Pillars of the Redesign & Research

### A. Team Layout & Information Integrity
- **Real Roster Integration**: Align the interface with real-world users and coaches (such as the default entities in `lib/data.ts` like `Doody`, `James`, `Cherry`, and `Amber`) rather than generating random, fabricated dummy profiles.
- **Role-Based Workflows**: Verify how the coach dashboard and athlete views handle data access control and coordinate training plans, attendance, and feedback loop features.

### B. Functional Navigation & Page Transitions
- **Complete Feature Audit**: Ensure every single route and interactive component is connected seamlessly without orphan links, dead pages, or missing components.
- **End-to-End Core Loops**: Ensure crucial workflows (like training plan publication, attendance logging, and daily/weekly feedback submissions) operate perfectly from frontend interaction to database models.

### C. Visual Aesthetics & Design System
- **Premium Look & Feel**: Transition away from standard browser styles or simplistic layouts. Create a visual style that "wows" the user at first glance.
- **Responsive Layouts**: Optimize all layouts for both desktop viewports and mobile screens, ensuring a seamless, premium experience.

---

## 3. Immediate Action Plan
1. **Collate Existing State**: Analyze the current Next.js structure and database models.
2. **Draft a Requirements Discovery Questionnaire**: Place comprehensive, high-fidelity questions directly into the `implementation_plan.md` artifact to elicit exact preferences on visual styles, telemetry representation, and interactive patterns.
3. **Establish Design Guidelines**: Collaborate on HSL color schemas, dark/light variations, particle animations, and typography choices before executing any frontend changes.
