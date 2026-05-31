# 2026-05-30 Baicizhan Hair 1:1 Replica Request - Part 4

## Background
The user provided a fourth batch of screenshots of the Baicizhan (百词斩) "Study Mate" (同桌) hair drawer containing **6 more premium hair options**. We need to replicate these **6 new premium hair styles** 1:1 with exact names, price points, and pixel-perfect SVG rendering layers inside our system.

This brings the total custom hair catalog to **98 premium hair styles** (92 from previous parts + 6 new styles from the fourth batch).

## The 6 New Replica Hair Styles

These items are categorized under "个人装扮" (Personal Dress-up) -> "头发" (Hair) category:

### New Batch (6 items)
1. **琴心剑意髻 (`hair_qinxin_updo`)**: Traditional high black bun with a beautiful silver crown and blue-accented side locks (598 XP / rare).
2. **花簪云髻 (`hair_flower_cloud_updo`)**: Elegant traditional Chinese updo bun covered in light green and purple flowers with pins (598 XP / rare).
3. **风吟短发 (`hair_wind_whisper_short`)**: Casual short brown hair styled with an ethnic bead forehead chain (498 XP / advanced).
4. **绯红长发 (`hair_scarlet_long`)**: Long flowing red curls draped with green drop-shaped earrings (498 XP / advanced).
5. **暗夜魔爵发 (`hair_vampire_lord`)**: Sleek medium brown hair in an elegant formal cut (458 XP / rare).
6. **银辉绮梦发 (`hair_silver_dream`)**: Elegant wavy ash grey/blonde locks styled with a beautiful golden flower crown and drop earrings (458 XP / rare).

## Technical Implementation Plan

1. **Database Seeding (`scripts/seed-shop.ts` and `app/api/shop/seed/route.ts`)**:
   - Add these 6 new hair items to the seeder files under category `'头发'` with correct tiers, slotType `'hair'`, imageKeys, and price values.
2. **SVG Avatar Engine (`components/athlete/AvatarRenderer.tsx`)**:
   - Map each of the 6 new `imageKey` values inside the hair render block to draw high-fidelity, aesthetic vector paths for ethnic forehead chains, flower crowns, bun updos, earrings, and sleek cuts.
3. **Verification & Testing**:
   - Run type-check compiler `npx tsc --noEmit` and the full vitest suite `npx vitest run` to ensure complete stability.
