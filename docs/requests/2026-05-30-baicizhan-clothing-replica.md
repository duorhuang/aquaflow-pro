# 2026-05-30 Baicizhan Clothing 1:1 Replica Request

## Background

The user provided screenshot photos of the Baicizhan (百词斩) "Study Mate" avatar shop clothes page, requesting a 1:1 copy and replica of these 20 premium outfits to ensure a pixel-perfect, highly aesthetic, and beautiful dress-up experience.

## The 20 Replica Outfits

All outfits cost 2000 coins (XP) and are categorized under the "个人装扮" (Personal Dress-up) -> "衣服" (Clothes) category:

1. **假两件毛衣 (`clothes_jiashan`)**: Fake two-piece beige sweater with a blue shirt collar and brown horse emblem.
2. **游牧风披肩 (`clothes_youmu`)**: Nomadic plaid shawl with an asymmetrical green shoulder drape.
3. **兰序浅影西装 (`clothes_lanxu`)**: Orchid elegance light blue blazer with cream lapels.
4. **胭梅点襟旗袍 (`clothes_yanmei`)**: Modern pink cheongsam with blossom prints and sleeve tassels.
5. **西庭蝶梦西装 (`clothes_diemeng_suit`)**: White formal coat, navy vest, gold accents, blue shoulder feather.
6. **西庭蝶梦礼服 (`clothes_diemeng_gown`)**: Midnight starry bustier dress, white shoulder straps, navy gloves.
7. **圣诞绮遇披肩 (`clothes_xmas_shawl`)**: Green Christmas capelet, fluffy white fur trim, red bow.
8. **圣诞绮梦蓬蓬裙 (`clothes_xmas_dress`)**: Red holiday corset dress, cream puffed sleeves, lace borders.
9. **瑞云银狐袍 (`clothes_ruiyun`)**: Ancient white/silver fox robe with gold embroidery (already created).
10. **凤尾繁花裙 (`clothes_fengwei`)**: Blossoming pink dress, golden chest collar, floating translucent ribbons.
11. **天空城骑士礼服 (`clothes_skycity`)**: Blue knight suit, gold epaulets, blue rose corsage (already created).
12. **云纱宫廷蓬蓬裙 (`clothes_yunsha`)**: Royal cream gown, blue corset lace, gauze sleeves.
13. **沉月·改良明制 (`clothes_chenyue`)**: Red/black Ming Dynasty modernization costume, gold accents.
14. **春烟·改良明制 (`clothes_chunyan`)**: Orange/cream fur-collared Ming Dynasty modernization jacket.
15. **福马迎春两件套 (`clothes_fuma`)**: Ivory modern Tang suit, red piping, golden horse patterns.
16. **新中式毛领外套 (`clothes_xinzhongshi`)**: Bright red winter coat, white fur trim, hanging pom-poms.
17. **流苏斗篷披肩 (`clothes_liusu`)**: Tan fringe cowboy poncho with dark leather ammunition belt.
18. **暮光骑士装 (`clothes_muguang`)**: Cowboy vest, yellow sheriff badge, red bandana scarf.
19. **碧野闲踪袍 (`clothes_biye`)**: Green forest tunic, laced brown corset, leafy shoulder pads.
20. **青萤羽纱裙 (`clothes_qingying`)**: Mint and lavender fairy gown with translucent glowing wings.

## Technical Implementation Plan

1. **Database Seeding (`app/api/shop/seed/route.ts`)**: Update the seeding script to include all 20 outfits under the `'衣服'` category with exact price (2000), slotType (`'body'`), and their respective `imageKey`.
2. **SVG Avatar Engine (`components/athlete/AvatarRenderer.tsx`)**: Build 20 customized, gorgeous SVG render paths matching the aesthetics of the original Baicizhan items.
3. **Verification**: Run `npx tsc --noEmit` and verify successful database seeding and UI compatibility.
