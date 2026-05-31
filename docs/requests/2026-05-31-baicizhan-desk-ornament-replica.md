# 2026-05-31 Baicizhan Desk Ornaments & Accessories 1:1 Replica Request

## Background
The user provided screenshots of the "Desk Accessories" (个人装扮 -> 5th drawer tab `🥤`) containing **20 items** (15 pre-owned/unlocked at **0 XP**, and 5 priced at **200–300 XP**). We need to replicate all 20 ornaments 1:1 with exact names, prices, and pixel-perfect SVG layers inside our avatar engine.

These items are categorized under "个人装扮" (Personal Dress-up) -> "桌面配件" (Desk Accessories) category with slotType `'desk_acc'`.

---

## Desk Accessories Catalog (21 items total)

| # | Chinese Name | Key | Tier | Price (XP) | Description |
|---|--------------|-----|------|------------|-------------|
| 1 | **水晶发光笔洗** | `desk_crystal` | advanced | 900 | (Existing) Glowing crystal bowl with gems and smile. |
| 2 | **机械狐** | `desk_mech_fox` | advanced | 300 | Futuristic robotic grey fox with glowing cyan headphones and chest core. |
| 3 | **皮革热气球** | `desk_leather_balloon` | advanced | 300 | Stitched leather hot air balloons on wire stands. |
| 4 | **玻利维亚羊驼** | `desk_alpaca` | basic | 0 (Owned) | Fluffy white alpaca toy wearing a party hat and a colorful necklace. |
| 5 | **薄荷冰淇淋** | `desk_mint_icecream` | basic | 0 (Owned) | Mint ice cream sundae in a tall glass topped with a cherry and wafer. |
| 6 | **雅枝置笔架** | `desk_brush_holder` | basic | 0 (Owned) | Traditional blue/white porcelain brush holder with calligraphy pens. |
| 7 | **好柿花生奶茶** | `desk_persimmon_tea` | basic | 0 (Owned) | Pumpkin/persimmon themed latte cup with cinnamon sticks and peanuts. |
| 8 | **万圣惊喜屋** | `desk_halloween_house` | advanced | 300 | Spooky miniature haunted house with a pumpkin and ghosts. |
| 9 | **魔法药水** | `desk_magic_potion` | basic | 0 (Owned) | Glass vial with swirling glowing starry blue liquid and star tag. |
| 10| **潮玩宫殿纸巾盒** | `desk_palace_tissue` | basic | 0 (Owned) | Chinese palace red-and-gold tissue box. |
| 11| **鎏金西庭茶杯** | `desk_golden_teacup` | basic | 0 (Owned) | Gilded filigree vintage white porcelain tea set. |
| 12| **平安果眼镜盒** | `desk_apple_glasses_case` | basic | 0 (Owned) | Apple-shaped box showing a mini Christmas snowman scene. |
| 13| **现代转盘日历** | `desk_modern_calendar` | advanced | 200 | Wooden circular gear-dial desk calendar. |
| 14| **闹元宵台灯** | `desk_lantern_lamp` | basic | 0 (Owned) | Hanging red festival lantern lighting up a sweet tangyuan bowl. |
| 15| **好运糖果盘** | `desk_lucky_candy` | advanced | 200 | Auspicious red candy bowl containing mandarins, candies, and envelopes. |
| 16| **摇摇马摆件** | `desk_rocking_horse` | basic | 0 (Owned) | Retro wooden rocking horse toy with gold coins. |
| 17| **原始陶土插花** | `desk_clay_vase` | basic | 0 (Owned) | Grey textured clay vase with dried wheat and autumn wild blossoms. |
| 18| **紫晶祥狐聚宝盏** | `desk_fox_crystal_bowl` | basic | 0 (Owned) | Purple quartz crystal dish containing a tiny sleeping white nine-tail fox. |
| 19| **云朵点心摆件** | `desk_cloud_dessert` | basic | 0 (Owned) | Three-tiered white lace stand holding colorful cakes and macarons. |
| 20| **圆墩牛仔保温杯** | `desk_cowboy_flask` | basic | 0 (Owned) | Chubby cow-print thermos wearing a tiny brown cowboy hat. |
| 21| **织梦水晶** | `desk_dream_crystal` | basic | 0 (Owned) | Glowing holographic cosmic crystal sphere on a tripod stand. |

---

## Technical Implementation Steps

1. **Database Seeding (`scripts/seed-shop.ts` and `app/api/shop/seed/route.ts`)**:
   - Seed all 20 new desk accessories with category `'桌面配件'` and slotType `'desk_acc'`.
   - Set Owned items to **0 XP** (basic tier), and configured premium items at **200–300 XP** exactly as shown.
2. **SVG Avatar Engine (`components/athlete/AvatarRenderer.tsx`)**:
   - Refactor inline rendering of `desk_crystal` into a modular helper function `renderDeskAcc(deskAcc: string)`.
   - Implement premium vector representations for all 21 items.
   - Mount `{equippedItems['desk_acc'] && renderDeskAcc(equippedItems['desk_acc'])}` inside the desk workspace SVG layer.
3. **Validation & Auditing**:
   - Extend `check-keys.js` to assert key sync for `'desk'` prefix.
   - Run complete automated tests (`vitest` and `tsc`).
