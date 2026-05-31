# 2026-05-31 Baicizhan Face & Makeup 1:1 Replica Request

## Background
The user provided four screenshots of the Baicizhan (百词斩) "Personal Styling" (个人装扮) -> "Face" (脸部/眼镜/妆容) drawer containing **16 face options** (11 new items + 5 pre-owned/pre-existing items that need price adjustments). We need to replicate these items 1:1 with exact names, price points, and pixel-perfect SVG rendering layers inside our system.

These items are categorized under "个人装扮" (Personal Dress-up) -> "脸部" (Face) category.

---

## Complete Face Catalog (16 items)

| # | Chinese Name | Key | Tier | Price (XP) | Description |
|---|--------------|-----|------|------------|-------------|
| 1 | **高智感眼镜** | `face_smart_glasses` | advanced | 200 | Sleek, modern round dark-colored thin wire-framed eyeglasses. |
| 2 | **流苏面纱** | `face_veil` | basic | 0 (Owned) | Traditional light purple/lavender translucent face veil with gold beads/tassels draped under the eyes. |
| 3 | **清凉感彩绘** | `face_cool_paint` | advanced | 200 | Cute summer paint: a light ice-cream cone on the right cheek, and little sparkles/stars on the left. |
| 4 | **爱心墨镜** | `face_heart_sunglasses` | advanced | 200 | Retro-chic white heart-shaped frame sunglasses with dark lenses. |
| 5 | **骑行墨镜** | `face_cycling_shades` | advanced | 200 | Sporty silver/grey wrap-around cycling glasses / speed shield. |
| 6 | **摩登猫眼墨镜** | `face_sunglasses` | basic | 0 (Owned) | Classy dark black retro cat-eye shaped sunglasses. |
| 7 | **圣诞七彩妆** | `face_xmas` | advanced | 0 (Owned) | Festive colorful makeup with rosy cheeks, green and orange sparkle dots, and nose-tip blush highlight. |
| 8 | **小熊黑框眼镜** | `face_bear_glasses` | advanced | 198 | Thick black-framed rectangular glasses with a tiny cute teddy bear ornament on the right lens frame corner. |
| 9 | **凝露珍珠妆** | `face_pearl_makeup` | advanced | 200 | Elegant traditional makeup with a white forehead pearl bindi/drop and subtle rosy cheek highlights. |
| 10| **可爱joker妆** | `face_joker_makeup` | advanced | 200 | Playful clown makeup: red accent triangles above and below the eyes, a red nose tip, and blue star cheeks sparkles. |
| 11| **数据读取眼镜** | `face_scouter` | advanced | 0 (Owned) | Sci-fi cybernetic eye visor with glowing blue charts, holographic grids, and readout indicators. |
| 12| **冰蓝猫眼墨镜** | `face_blue_cat_shades` | advanced | 200 | Sophisticated cat-eye sunglasses with cool light blue tinted lenses and silver frames. |
| 13| **素珠点额妆** | `face_reddot` | basic | 0 (Owned) | Traditional elegant makeup featuring a red dot bindi/flower in the center of the forehead. |
| 14| **单眼神秘眼镜** | `face_monocle` | basic | 100 | Vintage gold monocle worn over the left eye, connected with a delicate blue-rimmed lens layer. |
| 15| **圣诞彩绘** | `face_xmas_cheeks` | advanced | 200 | Festive face-paint with tiny green Christmas trees and red holly berries painted on the cheeks. |
| 16| **贵气无框眼镜** | `face_rimless_glasses` | advanced | 200 | Elegant rimless/gold-wire rectangular glasses with light golden clear lenses. |

---

## Technical Implementation Plan

1. **Database Seeding (`scripts/seed-shop.ts` and `app/api/shop/seed/route.ts`)**:
   - Update the prices of the existing five owned items (`face_veil`, `face_reddot`, `face_sunglasses`, `face_xmas`, `face_scouter`) to **0 XP**.
   - Add the 11 new face decoration items to the seeder files under category `'脸部'` with correct tiers, slotType `'face'`, imageKeys, and price values.
2. **SVG Avatar Engine (`components/athlete/AvatarRenderer.tsx`)**:
   - Refactor face decoration rendering out of the inline JSX and into a modular helper function `renderFace(face: string)`.
   - Implement high-fidelity, highly aesthetic vector drawings for all 17 face options (16 custom + 1 existing default `face_glasses`).
   - Layer `{face && renderFace(face)}` beautifully over the head base and eyes, under the hair and hats.
3. **Verification & Auditing**:
   - Extend validation script `scratch/check-keys.js` to also validate keys starting with `'face'`.
   - Run type-check compiler `npx tsc --noEmit` and the Vitest test suite to ensure perfect compliance and 100% green tests.
