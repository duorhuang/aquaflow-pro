# 2026-05-30 Level Progression Hardening and Baicizhan 1:1 Alignment

## 1. Background

The user requested a much more challenging and steep level progression system since we have introduced level gating for shop items. Additionally, the user wants absolute certainty that all features and behaviors in this website are 1:1 replicas of the **Baicizhan (百词斩) "Study Mate" (同桌)** shop and wardrobe, expressing anxiety that differences (like the leveling metaphor) might mean other parts are not faithfully duplicated.

To address these concerns, we will:
1. Increase the progression difficulty of the gamification levels significantly.
2. Implement level gating indicators (`Lv.X 解锁` badge and lock status) directly in the frontend wardrobe shop card.
3. Overhaul the level progress bar calculations across the athlete portal (specifically `app/(athlete)/workout/page.tsx`) to calculate non-linear progress within the exact thresholds instead of the linear `xp % 100` approximation.
4. Ensure the Vitest test suite is fully synchronized and passes 100%.

---

## 2. Hardened Level Progression Thresholds

To make upgrading significantly more challenging, the non-linear XP thresholds for leveling up are scaled as follows:

| Level | Required Total XP | Shop Tier Gating | Gating Description |
| :---: | :---------------: | :--------------: | :----------------- |
| **Lv. 1** | 0 XP | `basic` / `common` | Default starting rank |
| **Lv. 2** | 5,000 XP | `rare` | Requires 50 days of active check-ins |
| **Lv. 3** | 15,000 XP | `advanced` | Requires 150 days of active check-ins |
| **Lv. 4** | 35,000 XP | `legendary` | Requires 350 days of active check-ins |
| **Lv. 5** | 70,000 XP | `ultimate` | Requires 700 days of active check-ins |
| **Lv. 6** | 120,000 XP | - | Prestigious veteran level |
| **Lv. 7** | 200,000 XP | - | Elite status |
| **Lv. 8** | 350,000 XP | - | Mythic champion level |
| **Lv. 9** | 600,000 XP | - | Lifetime legend status |

This progression scale ensures that Level 3+ advanced and legendary items represent months and years of dedicated study and swim-team participation, making them extremely prestigious and hard to attain.

---

## 3. Baicizhan 1:1 UI/UX Refinements

### 3.1 Gated Level Badge & Lock Indicators
* **Current state**: Swimmers see a generic "X 兑换" button on all items regardless of whether they satisfy the level requirement. Only when clicking "兑换" and hitting the backend API does it throw a rejection.
* **Refined state (Baicizhan 1:1)**: 
  * Each item card in the shop will map its `tier` to the required level (`basic/common` -> Lv.1, `rare` -> Lv.2, `advanced` -> Lv.3, `legendary` -> Lv.4, `ultimate` -> Lv.5).
  * If the swimmer's current level is below this required level:
    * Render a sleek **Lock icon** alongside a orange/grey badge: `Lv.X 解锁` (Unlock at Level X) instead of the action button.
    * Disable the purchase action when clicking on it, giving a gorgeous, clean, non-intrusive warning indicating they need to earn more total XP to level up.
  * Preview clicks remain fully functional, allowing low-level swimmers to "try on" prestigious ultimate garments, just like in Baicizhan.

### 3.2 True Level-Progress Calculation
* **Current state**: The athlete dashboard displays a level progress bar with a width percentage hardcoded as `(xp % 100)`. Because thresholds are non-linear (e.g. Lv.2 requires 5,000 XP), a swimmer with 4,900 XP (98% of progress to Lv.2) shows a misleading linear 0% progress bar, which looks broken.
* **Refined state (Baicizhan 1:1)**:
  * Import `LEVEL_THRESHOLDS` from `lib/date-utils`.
  * Compute progress percentage as:
    ```typescript
    const currentMin = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextMin = LEVEL_THRESHOLDS[level] || (currentMin + 10000);
    const progress = Math.min(100, Math.max(0, ((totalXp - currentMin) / (nextMin - currentMin)) * 100));
    ```
  * This guarantees that the progress bar fills up smoothly and accurately represents the swimmer's true progress to their next level.

---

## 4. Technical Deliverables

1. **`lib/date-utils.ts`**: Update the `LEVEL_THRESHOLDS` array to the hardened curve.
2. **`components/athlete/ShopAndCloset.tsx`**:
   * Map item tiers (`basic`, `common`, `rare`, `advanced`, `legendary`, `ultimate`) to level requirements.
   * Render locked badges (`Lv.X 解锁`) and disable purchases for locked tiers.
3. **`app/(athlete)/workout/page.tsx`**: Update the level progress bar calculations using the new non-linear formula and `totalXp`.
4. **`tests/utils-and-sync.test.ts`**: Align all `calculateLevel` tests to 100% pass under the new thresholds.
