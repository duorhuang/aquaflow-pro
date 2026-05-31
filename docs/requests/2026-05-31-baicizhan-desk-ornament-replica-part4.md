# 2026-05-31 Baicizhan Desk Ornaments & Accessories 1:1 Replica Request - Part 4

## Background
The user provided a fourth set of screenshots of the "Desk Accessories" (个人装扮 -> 5th drawer tab `🥤`) containing **16 more items** (10 pre-owned/unlocked at **0 XP**, and 6 priced at exactly **39–599 XP**). We need to replicate all 16 ornaments 1:1 with exact names, prices, and pixel-perfect SVG layers inside our avatar engine.

These items are categorized under "个人装扮" (Personal Dress-up) -> "桌面配件" (Desk Accessories) category with slotType `'desk_acc'`.

---

## Desk Accessories Catalog - Part 4 (16 items)

| # | Chinese Name | Key | Tier | Price (XP) | Description |
|---|--------------|-----|------|------------|-------------|
| 1 | **会唱歌的圣诞树** | `desk_singing_xmas_tree` | advanced | 599 | A beautifully decorated green Christmas tree decorated with red gifts and stockings at the base. |
| 2 | **怀旧热茶缸** | `desk_retro_mug` | basic | 0 (Owned) | A classic white enamel mug featuring a drawing of children reading books. |
| 3 | **好吃胖面包** | `desk_delicious_toast` | basic | 0 (Owned) | An adorable happy bread slice character wearing a blue sleeping cap and resting on a blue pillow. |
| 4 | **mini兔推车** | `desk_bunny_cart` | basic | 0 (Owned) | A bright yellow bunny doll inside a blue shopping cart filled with packages. |
| 5 | **南瓜糖果盒** | `desk_pumpkin_candy_box` | basic | 0 (Owned) | An open glowing orange jack-o'-lantern bucket filled with colorful lollipops and candies. |
| 6 | **魔幻水晶球** | `desk_magic_globe` | basic | 0 (Owned) | A glowing cyan crystal sphere nested on a golden wing-designed stand. |
| 7 | **兔兔宇航员** | `desk_rabbit_astronaut` | advanced | 39 | A cute pink bunny in a space suit standing on a glowing circular teleportation pad. |
| 8 | **墨竹折扇** | `desk_bamboo_fan` | advanced | 399 | A beautiful folding Chinese fan painted with black bamboo stems on a wooden stand. |
| 9 | **助学机车** | `desk_study_motorcycle` | advanced | 39 | A cool red and white miniature sports motorcycle model with a checkered racing flag. |
| 10| **一触即唱Panda** | `desk_singing_panda` | advanced | 599 | A cool panda doll wearing black headphones and playing a small synthesizer/piano keyboard. |
| 11| **“狮狮”如意** | `desk_singing_lion` | basic | 0 (Owned) | A cute orange lion character singing into a microphone on a small circus pedestal. |
| 12| **积极劝学三宝** | `desk_trio_blobs` | basic | 0 (Owned) | Three cute slime blobs (orange, cyan, purple) holding up a banner that reads "卷倒隔壁桌". |
| 13| **佛系陪学小蓝** | `desk_blue_reading_monster` | basic | 0 (Owned) | A cute little blue dinosaur/monster sitting down and reading a yellow book. |
| 14| **绿意绵绵冰** | `desk_green_shaved_ice` | advanced | 100 | A fresh green shaved ice sundae in a cup topped with large green leaves. |
| 15| **桃桃抹茶糕** | `desk_peach_matcha_cake` | advanced | 100 | Three pink-frosted green matcha cakes stacked beautifully on a pink cake stand. |
| 16| **斩家毛笔** | `desk_bj_calligraphy_brushes` | advanced | 100 | Traditional wooden pen rack holding two hanging calligraphy brushes. |

---

## Technical Implementation Steps

1. **Database Seeding (`scripts/seed-shop.ts` and `app/api/shop/seed/route.ts`)**:
   - Seed all 16 new desk accessories with category `'桌面配件'` and slotType `'desk_acc'`.
   - Set Owned items to **0 XP** (basic tier), and configured premium items at **39–599 XP** exactly as shown.
2. **SVG Avatar Engine (`components/athlete/AvatarRenderer.tsx`)**:
   - Refactor `renderDeskAcc` helper to include cases for all 16 new items.
   - Implement premium vector representations for all 16 new items.
3. **Validation & Auditing**:
   - Run the key synchronization script to ensure perfect seeder/renderer alignment.
   - Run complete automated tests (`vitest` and `tsc`).
