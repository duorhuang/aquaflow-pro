# 2026-05-31 Baicizhan Desk Ornaments & Accessories 1:1 Replica Request - Part 2

## Background
The user provided screenshots of the "Desk Accessories" (个人装扮 -> 5th drawer tab `🥤`) containing **20 more items** (10 pre-owned/unlocked at **0 XP**, and 10 priced at exactly **18–300 XP**). We need to replicate all 20 ornaments 1:1 with exact names, prices, and pixel-perfect SVG layers inside our avatar engine.

These items are categorized under "个人装扮" (Personal Dress-up) -> "桌面配件" (Desk Accessories) category with slotType `'desk_acc'`.

---

## Desk Accessories Catalog - Part 2 (20 items)

| # | Chinese Name | Key | Tier | Price (XP) | Description |
|---|--------------|-----|------|------------|-------------|
| 1 | **节节高升盆栽** | `desk_bamboo_bonsai` | advanced | 300 | High-fidelity bamboo plant ornament in a small light-green ceramic pot. |
| 2 | **苹安小甜杯** | `desk_apple_sweet_cup` | advanced | 20 | Light green cup with an apple design containing a sweet drink. |
| 3 | **幻月灵珠** | `desk_illusion_moon_pearl` | advanced | 300 | Glowing blue/purple magical pearl resting on a wooden stand. |
| 4 | **海滩贝壳收集瓶** | `desk_beach_shell_jar` | advanced | 20 | A small glass jar filled with sand, starfish, and colorful sea shells. |
| 5 | **马蒂斯的金鱼** | `desk_matisse_goldfish` | advanced | 198 | Matisse-inspired goldfish tank with swimming red fish and potted plants. |
| 6 | **人鱼贝壳** | `desk_mermaid_shell` | advanced | 198 | An open sea shell with a tiny cartoon mermaid figure seated on a pearl. |
| 7 | **南瓜芋泥蛋糕** | `desk_pumpkin_cake` | advanced | 18 | Spooky Halloween themed cupcake with purple taro paste, pumpkin topper, and a cute little ghost. |
| 8 | **旷野弦歌** | `desk_wilderness_lute` | basic | 0 (Owned) | Traditional wooden string instrument (Guqin/Lute) on a miniature stand. |
| 9 | **年年有余食盒** | `desk_surplus_foodbox` | basic | 0 (Owned) | Traditional Chinese double-layered wooden food basket filled with red berries and pastries. |
| 10| **冰雪水晶球** | `desk_snow_globe` | advanced | 198 | Crystal snow globe showcasing a winter landscape with falling snowflakes. |
| 11| **不会融化的小雪人** | `desk_permanent_snowman` | basic | 0 (Owned) | A adorable miniature clay snowman wearing a red Christmas hat and scarf. |
| 12| **桌面温度计** | `desk_thermometer` | basic | 0 (Owned) | Modern light-blue electronic desk thermometer displaying a winter theme (0°C). |
| 13| **砚台** | `desk_inkstone` | basic | 0 (Owned) | Classic Chinese inkstone with a pool of dark ink. |
| 14| **笔架** | `desk_brush_rack` | basic | 0 (Owned) | Traditional wooden pen/brush rack hanging multiple Chinese calligraphy brushes. |
| 15| **童趣单车小人** | `desk_toy_bicycle` | advanced | 200 | A miniature model of a purple-suited girl riding a pink bicycle. |
| 16| **中式糕点拼盘** | `desk_chinese_pastry` | advanced | 200 | Traditional bamboo basket plate displaying beautiful pink and yellow lotus cakes. |
| 17| **运动萌趣玩偶** | `desk_sporty_plush` | basic | 0 (Owned) | A blue dumbbell-shaped sporty plush doll showing "7KG" text. |
| 18| **“一举高粽”蒸笼** | `desk_zongzi_steamer` | basic | 0 (Owned) | A bamboo steamer containing delicious wrapped Zongzi (rice dumplings). |
| 19| **多巴胺香薰** | `desk_dopamine_fragrance` | basic | 0 (Owned) | A modern colorful glass bottle fragrance diffuser with wood reeds. |
| 20| **可露丽甜品** | `desk_canele_dessert` | basic | 0 (Owned) | A glazed Canelé dessert on a white porcelain dish with blueberry cream on top. |

---

## Technical Implementation Steps

1. **Database Seeding (`scripts/seed-shop.ts` and `app/api/shop/seed/route.ts`)**:
   - Seed all 20 new desk accessories with category `'桌面配件'` and slotType `'desk_acc'`.
   - Set Owned items to **0 XP** (basic tier), and configured premium items at **18–300 XP** exactly as shown.
2. **SVG Avatar Engine (`components/athlete/AvatarRenderer.tsx`)**:
   - Refactor `renderDeskAcc` helper to include cases for all 20 new items.
   - Implement premium vector representations for all 20 new items.
3. **Validation & Auditing**:
   - Run the key synchronization script to ensure perfect seeder/renderer alignment.
   - Run complete automated tests (`vitest` and `tsc`).
