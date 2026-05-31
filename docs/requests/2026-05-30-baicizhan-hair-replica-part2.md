# 2026-05-30 Baicizhan Hair 1:1 Replica Request - Part 2

## Background
The user provided a second batch of five screenshots of the Baicizhan (百词斩) "Study Mate" (同桌) hair drawer containing **20 more premium hair options**. We need to replicate these **20 new premium hair styles** 1:1 with exact names, price points, and pixel-perfect SVG rendering layers inside our system.

This brings the total custom hair catalog to **76 premium hair styles** (55 from the first request + 1 default + 20 new styles from the second request).

## The 20 New Replica Hair Styles

These items are categorized under "个人装扮" (Personal Dress-up) -> "头发" (Hair) category:

### New Batch (20 items)
1. **闷青纹理烫发 (`hair_greenish_perm`)**: Light ash-green messy textured perm crop (480 XP / advanced).
2. **亚麻花苞双辫 (`hair_flaxen_buns`)**: Two flaxen side braided buns with white floral tassels hanging (480 XP / advanced).
3. **金羽束编发 (`hair_golden_feather`)**: Dark brown wavy hair styled with two thin side braids, decorated with a gold forehead chain/feather (600 XP / rare).
4. **幻纱紫旋披发 (`hair_purple_veil`)**: Long brown wavy hair styled with a beautiful purple sheer lace veil on top, complete with gold chains (600 XP / rare).
5. **冰蓝烫发 (`hair_iceblue_perm`)**: Wavy light-blue short hair styled with white highlights (600 XP / rare).
6. **冰绡漫卷 (`hair_ice_curls`)**: Soft light-blue/silver side ponytail tied low, decorated with a small blue sea-star hair clip (600 XP / rare).
7. **青墨碎锋 (`hair_ink_spiky`)**: Messy layered dark olive-green spiky crop (0 XP / Default/Owned - marked as "已兑换").
8. **俏皮双丸子 (`hair_playful_buns`)**: Messy olive-green hair styled into two cute high buns with pink flower ties (480 XP / advanced).
9. **日光棕穗 (`hair_sunny_fringe`)**: Warm light brown short crop fringe haircut (480 XP / advanced).
10. **绿蔓甜莓双丸子 (`hair_strawberry_buns`)**: Cute light blonde hair styled into two low side buns with green vine ties (480 XP / advanced).
11. **青峦漫卷 (`hair_misty_waves`)**: Casual long dark grey wavy hair flowing over the shoulders (0 XP / Default/Owned - marked as "已兑换").
12. **清冷挽月髻 (`hair_cold_moon_updo`)**: Traditional high elegant black updo decorated with blue flower beads and sashes (600 XP / rare).
13. **少年感微分碎盖 (`hair_youthful_part`)**: Neat casual dark brown side-parted short crop fringe (480 XP / advanced).
14. **温柔斜编发 (`hair_gentle_sidebraid`)**: Long brown side-braid flowing over the left shoulder, adorned with yellow flowers (480 XP / advanced).
15. **美式棒球背头 (`hair_baseball_cap`)**: Cool blue backward baseball cap worn over short dark brown hair (600 XP / rare).
16. **运动感双麻花 (`hair_sporty_pigtails`)**: Dark brown straight hair styled in two long braids tied with blue ribbons (600 XP / rare).
17. **千山暮雪束发 (`hair_thousand_snow`)**: Ancient white flowing hair in a high topknot, adorned with a light green jade ring/crown (600 XP / rare).
18. **古风俏皮扎发 (`hair_ancient_playful`)**: Traditional Chinese double high buns adorned with golden sashes and green jade ornaments (600 XP / rare).
19. **清爽发带碎盖 (`hair_headband_fringe`)**: Dark brown short fringe hair accessorized with a grey-and-white patterned bandana headband (480 XP / advanced).
20. **花苞盘发 (`hair_cute_updo`)**: Dark brown rounded high bun updo with a white lace frill headband (480 XP / advanced).

## Technical Implementation Plan

1. **Database Seeding (`scripts/seed-shop.ts` and `app/api/shop/seed/route.ts`)**:
   - Add these 20 new hair items to the seeder files under category `'头发'` with correct tiers, slotType `'hair'`, imageKeys, and price values.
2. **SVG Avatar Engine (`components/athlete/AvatarRenderer.tsx`)**:
   - Map each of the 20 new `imageKey` values inside the hair render block to draw high-fidelity, aesthetic vector paths for braids, veils, headbands, baseball caps, ribbons, sashes, and specific hairstyles.
3. **Verification & Testing**:
   - Run type-check compiler `npx tsc --noEmit` and the full vitest suite `npx vitest run` to ensure complete stability.
