# 2026-05-30 Baicizhan Clothing Replica Part 2 Request

## Background

The user provided 5 additional screenshots of the Baicizhan (百词斩) avatar shop clothes drawer, containing 20 more premium, highly thematic outfits. The user requested to duplicate and copy them 1:1, making them look highly aesthetic and premium.

## The 20 New Replica Outfits

These outfits range from 1599 to 2599 coins (XP) and are categorized under the "个人装扮" (Personal Dress-up) -> "衣服" (Clothes) category:

1. **粉墨登场戏服 (`clothes_fenmo`)**: Royal blue opera robe with white drapery sleeves (1998 XP).
2. **游园惊梦戏服 (`clothes_youyuan`)**: Blossom pink opera dress with white drapery sleeves (1998 XP).
3. **珠光淡黄旗袍 (`clothes_zhuguang`)**: Light yellow cheongsam with a white fur wrap and pearls (1999 XP).
4. **做旧复古皮衣 (`clothes_fugu`)**: Distressed brown leather aviator jacket, white shirt, and tie (1999 XP).
5. **璀璨齐胸襦裙 (`clothes_ruqun`)**: Orange and red Tang-style Hanfu with green shoulder scarf (1999 XP).
6. **少年郎圆领袍 (`clothes_shaonian`)**: Red side-folding round-collar robe with gold trims (1999 XP).
7. **甜酷毛毛外套 (`clothes_tianku`)**: Sky-blue fur-lined toggle coat with white borders (1999 XP).
8. **冰蓝格子外套 (`clothes_binglan`)**: Blue plaid winter down-jacket with fur collar (1999 XP).
9. **落日熔金披风 (`clothes_sunset`)**: Royal blue noble cape with golden border and layered white jabot (1999 XP).
10. **流光幻翼斗篷 (`clothes_fantasy_cape`)**: Purple magical cape with glowing wings behind shoulders (1999 XP).
11. **银河摘星太空服 (`clothes_galaxy_suit`)**: White astronaut spacesuit with gauges and orange accents (2599 XP).
12. **九天揽月太空服 (`clothes_jiutian_suit`)**: White spacesuit with a circular glowing chest plate/lens (2599 XP).
13. **暖意圣诞氛围装 (`clothes_xmas_warm`)**: Red/white vest, green plaid tie, and thick green wool scarf (1999 XP).
14. **毛绒甜美小披肩 (`clothes_xmas_capelet`)**: Red winter capelet with holiday patterns and fur trim (1999 XP).
15. **流光溢彩苗服 (`clothes_miao`)**: Royal blue ethnic Miao tunic with silver chest jewelry (1999 XP).
16. **草原部落藏袍 (`clothes_tibet`)**: Ivory and blue Tibetan robe worn off-shoulder with beads (1999 XP).
17. **林下之风旗袍裙 (`clothes_linxia`)**: Jade green modern short cheongsam with gold frog loops (1599 XP).
18. **独步青云盘扣衫 (`clothes_qingyun_shirt`)**: Mint modernized Tang shirt with a small climbing panda (1599 XP).
19. **斩家学士服-领带款 (`clothes_scholar_tie`)**: Black graduation gown, blue satin trim, and a red tie (1666 XP).
20. **斩家学士服-领结款 (`clothes_scholar_bowtie`)**: Black graduation gown, pink lace trim, and a red bow tie (1666 XP).

## Technical Implementation Plan

1. **Database Seeding (`scripts/seed-shop.ts` & `app/api/shop/seed/route.ts`)**: Add all 20 new outfits to both the seeding script and Next.js api route with exact names, slot types, prices, and imageKeys.
2. **SVG Avatar Engine (`components/athlete/AvatarRenderer.tsx`)**: Build 20 custom SVG paths matching the style and color of the original items.
3. **Verification**: Run `npx tsc --noEmit` and execute seeder to verify database entries.
