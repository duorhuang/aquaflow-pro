# 2026-05-30 Baicizhan Hair 1:1 Replica Request - Part 3

## Background
The user provided a third batch of screenshots of the Baicizhan (百词斩) "Study Mate" (同桌) hair drawer containing **16 more premium hair options**. We need to replicate these **16 new premium hair styles** 1:1 with exact names, price points, and pixel-perfect SVG rendering layers inside our system.

This brings the total custom hair catalog to **92 premium hair styles** (76 from previous parts + 16 new styles from the third batch).

## The 16 New Replica Hair Styles

These items are categorized under "个人装扮" (Personal Dress-up) -> "头发" (Hair) category:

### New Batch (16 items)
1. **韩系微分纹理 (`hair_korean_perm`)**: Ash brown short perm crop styled with a soft forehead wave (480 XP / advanced).
2. **斜刘海花苞头 (`hair_side_part_bun`)**: Dark brown wavy hair styled in a rounded updo, accessorized with golden hoop earrings (480 XP / advanced).
3. **墨雪束发 (`hair_moxue_topknot`)**: Ancient traditional dark grey/black hair in a half-up ponytail, adorned with a white diamond crown/tiara (600 XP / rare).
4. **灵俏双髻 (`hair_cute_double_buns`)**: Elegant traditional Chinese updo styled into two side hair buns, decorated with light blue bead flower chains and white tassels (600 XP / rare).
5. **红棕短发 (`hair_redbrown_short`)**: Clean-cut warm red-brown short haircut (480 XP / advanced).
6. **暖棕卷发 (`hair_warm_brown_curls`)**: Flowing long wavy hair in a warm milk-tea brown tone (480 XP / advanced).
7. **银蓝烫发 (`hair_silverblue_perm`)**: Soft curly short hair in an elegant ash silver-blue tone (600 XP / rare).
8. **银色公主切 (`hair_silver_hime`)**: Long straight silver hime-cut hair with over-ear blue-and-white sports headphones (600 XP / rare).
9. **金棕短发 (`hair_golden_brown_short`)**: Short messy curls in a vibrant golden-brown tone (480 XP / advanced).
10. **金色羊毛卷 (`hair_golden_curly`)**: Voluminous shoulder-length golden curls (羊毛卷) styled with a small blue hair clip (480 XP / advanced).
11. **橘色挑染短发 (`hair_orange_highlight`)**: Messy short blonde hair styled with bright orange highlights (480 XP / advanced).
12. **橘子汽水卷发 (`hair_orange_soda`)**: Soft light blonde pigtail curls tied high with red and blue hair ties, styled like orange soda pop curls (480 XP / advanced).
13. **气质挑染碎发 (`hair_stylish_highlight`)**: Dark brown short crop haircut styled with subtle golden/greenish highlights (480 XP / advanced).
14. **可爱双丸子头 (`hair_cute_twin_buns`)**: Neat dark brown double high pigtails tied with light blue ribbon clips, decorated with a yellow star hair pin (480 XP / advanced).
15. **中式侧丸子头 (`hair_chinese_side_bun`)**: Traditional Chinese side bun updo draped over the left shoulder, adorned with black hair pin sticks (480 XP / advanced).
16. **中式微分碎盖 (`hair_chinese_part`)**: Neat casual dark grey short crop parted haircut (480 XP / advanced).

## Technical Implementation Plan

1. **Database Seeding (`scripts/seed-shop.ts` and `app/api/shop/seed/route.ts`)**:
   - Add these 16 new hair items to the seeder files under category `'头发'` with correct tiers, slotType `'hair'`, imageKeys, and price values.
2. **SVG Avatar Engine (`components/athlete/AvatarRenderer.tsx`)**:
   - Map each of the 16 new `imageKey` values inside the hair render block to draw high-fidelity, aesthetic vector paths for braids, updos, headbands, highlights, headphones, and decorative hairpins.
3. **Verification & Testing**:
   - Run type-check compiler `npx tsc --noEmit` and the full vitest suite `npx vitest run` to ensure complete stability.
