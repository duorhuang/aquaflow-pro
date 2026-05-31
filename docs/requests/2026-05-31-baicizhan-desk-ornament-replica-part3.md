# 2026-05-31 Baicizhan Desk Ornaments & Accessories 1:1 Replica Request - Part 3

## Background
The user provided a third set of screenshots of the "Desk Accessories" (个人装扮 -> 5th drawer tab `🥤`) containing **20 more items** (10 pre-owned/unlocked at **0 XP**, and 10 priced at exactly **18–398 XP**). We need to replicate all 20 ornaments 1:1 with exact names, prices, and pixel-perfect SVG layers inside our avatar engine.

These items are categorized under "个人装扮" (Personal Dress-up) -> "桌面配件" (Desk Accessories) category with slotType `'desk_acc'`.

---

## Desk Accessories Catalog - Part 3 (20 items)

| # | Chinese Name | Key | Tier | Price (XP) | Description |
|---|--------------|-----|------|------------|-------------|
| 1 | **春日来信** | `desk_spring_letter` | advanced | 99 | A beautiful blue envelope filled with pink tulips and yellow blossoms, emitting soft light glows. |
| 2 | **精灵娃娃** | `desk_fairy_doll` | advanced | 99 | A cute little winged fairy doll standing on the desk surrounded by sparkles. |
| 3 | **一碗“糯叽”汤圆** | `desk_sweet_dumplings` | basic | 0 (Owned) | A orange ceramic bowl filled with soft, warm Tangyuan dumplings. |
| 4 | **龙年款醒狮摆件** | `desk_dragon_lion` | advanced | 99 | Colorful festive Chinese lion dance models celebrating the Year of the Dragon. |
| 5 | **满篮番茄** | `desk_tomato_basket` | basic | 0 (Owned) | A woven basket filled to the brim with ripe, red tomatoes. |
| 6 | **梅时青团** | `desk_plum_dumplings` | basic | 0 (Owned) | A blue ceramic plate with fresh green Qingtuan pastries next to a matching clay teapot. |
| 7 | **戏曲panda** | `desk_opera_panda` | basic | 0 (Owned) | A cute panda wearing traditional Chinese opera costume and flags. |
| 8 | **“咔嚓”胶片机** | `desk_film_camera` | basic | 0 (Owned) | A classic green and silver retro film camera with sparkles around it. |
| 9 | **福满人间提盒** | `desk_fortune_box` | advanced | 398 | An elegant three-tiered Chinese lacquer wooden gift food basket with floral gold patterns. |
| 10| **读报狐狸** | `desk_reading_fox` | basic | 0 (Owned) | A clever red fox standing and reading a newspaper. |
| 11| **计时兔子** | `desk_timer_rabbit` | basic | 0 (Owned) | A cute rabbit in a red suit standing next to mushrooms and a golden pocket watch timer. |
| 12| **卡皮巴拉汉堡包** | `desk_capybara_burger` | basic | 0 (Owned) | A cute Capybara squished between hamburger buns. |
| 13| **羽毛球玩偶** | `desk_badminton_toy` | advanced | 198 | A cute badminton shuttlecock character holding a tiny blue racket. |
| 14| **足球玩偶** | `desk_football_toy` | advanced | 198 | A cute football character holding a flaming sports torch. |
| 15| **劝学香蕉猫** | `desk_banana_cat` | basic | 0 (Owned) | A cute crying/happy banana cat lying down. |
| 16| **星光小夜灯** | `desk_starry_nightlight` | advanced | 398 | A modern desktop nightlight sphere showing a golden star and a revolving ring system. |
| 17| **幸运的风** | `desk_lucky_fan` | advanced | 18 | A bright yellow portable desktop fan. |
| 18| **一杯幸运咖** | `desk_lucky_coffee` | advanced | 18 | A red coffee cup with a warrior/knight emblem design on it. |
| 19| **复古大哥大** | `desk_retro_brickphone` | advanced | 198 | A retro pink brick cellular telephone with an antenna. |
| 20| **立秋奶茶** | `desk_autumn_milktea` | basic | 0 (Owned) | A refreshing bubble tea drink in a clear green cup on a wooden coaster. |

---

## Technical Implementation Steps

1. **Database Seeding (`scripts/seed-shop.ts` and `app/api/shop/seed/route.ts`)**:
   - Seed all 20 new desk accessories with category `'桌面配件'` and slotType `'desk_acc'`.
   - Set Owned items to **0 XP** (basic tier), and configured premium items at **18–398 XP** exactly as shown.
2. **SVG Avatar Engine (`components/athlete/AvatarRenderer.tsx`)**:
   - Refactor `renderDeskAcc` helper to include cases for all 20 new items.
   - Implement premium vector representations for all 20 new items.
3. **Validation & Auditing**:
   - Run the key synchronization script to ensure perfect seeder/renderer alignment.
   - Run complete automated tests (`vitest` and `tsc`).
