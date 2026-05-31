# 2026-05-31 Baicizhan Face & Makeup Replica - Batch 2

## Background
The user provided screenshots of the second batch of face decorations / makeup from the Baicizhan (百词斩) "Face" drawer. We need to replicate these items 1:1 with exact names, price points, and pixel-perfect SVG rendering layers inside the avatar engine.

---

## Face Catalog Additions & Adjustments (12 items total)

| # | Chinese Name | Key | Tier | Price (XP) | Description |
|---|--------------|-----|------|------------|-------------|
| 1 | **暗影之舞** | `face_shadow_dance` | advanced | 198 | Mysterious black lace masquerade mask with a small red jewel in the center. |
| 2 | **民族彩绘** | `face_ethnic_paint` | advanced | 198 | Traditional ethnic red/orange paint markings on both cheeks. |
| 3 | **全场最酷墨镜** | `face_coolest_shades` | advanced | 198 | Black retro pixel sunglasses / thug-life shades. |
| 4 | **菠萝墨镜** | `face_pineapple_sunglasses` | advanced | 198 | Fun round yellow-frame sunglasses with green pineapple leaves on top. |
| 5 | **出游墨镜** | `face_vacation_shades` | advanced | 198 | Retro white frame rectangular sunglasses with transparent/tinted lenses. |
| 6 | **酷酷表情** | `face_cool_expression` | advanced | 198 | Cool sunglasses with a smirk mouth expression combined. |
| 7 | **鼻涕泡表情** | `face_snot_bubble` | advanced | 198 | Sleepy expression with a closed winking/sleeping eye and a light blue snot bubble from the nose. |
| 8 | **书卷气眼镜** | `face_glasses` | basic | 0 (Owned) | Simple thin round dark-wire glasses (adjusted from 400 XP to 0 XP / Owned). |
| 9 | **向日葵彩绘** | `face_sunflower_paint` | advanced | 198 | Bright yellow sunflower painted on the right cheek with green leaves. |
| 10| **文艺络腮胡** | `face_literary_beard` | advanced | 198 | Stylish brown stubble beard framing the mouth and chin. |
| 11| **海盗眼罩** | `face_pirate_eyepatch` | advanced | 198 | Black eyepatch worn over the right eye with a golden coin skull emblem. |
| 12| **暗夜蝠影** | `face_dark_bat_mask` | advanced | 198 | Superhero dark purple/black bat mask with orange trim lines. |

---

## Technical Implementation Steps

1. **Database Seeding (`scripts/seed-shop.ts` and `app/api/shop/seed/route.ts`)**:
   - Add the 11 new face decoration items with their correct keys, prices (198 XP), and slot type `'face'`.
   - Update the price of the existing `'face_glasses'` item to `0 XP` and set its tier to `'basic'`.
2. **SVG Avatar Engine (`components/athlete/AvatarRenderer.tsx`)**:
   - Add modular vector-graphic renderings for the 11 new face items under `renderFace(face: string)`.
   - Ensure the styles layer smoothly below hair and hats and above default facial expressions.
3. **Audit and Verification**:
   - Run `node scratch/check-keys.js` to ensure 100% sync of keys.
   - Run `npx tsc --noEmit` and `npx vitest run` to ensure complete stability.
