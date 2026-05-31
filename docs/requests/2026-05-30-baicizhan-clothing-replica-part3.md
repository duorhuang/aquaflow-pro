# 2026-05-30 Baicizhan Clothing Replica Part 3 Request

## Background
The user provided 5 new screenshot images of the Baicizhan (百词斩) "Study Mate" (同桌) clothes drawer containing another **20 premium outfits** (themed around Song Dynasty robes, fruit T-shirts, galaxy knight uniforms, forest hunters, and summer polo shirts). The user requested to copy them 1:1, making them highly aesthetic and visually appealing.

## The 20 New Replica Outfits

These outfits are categorized under the "个人装扮" (Personal Dress-up) -> "衣服" (Clothes) category:

1. **宋制青竹澜衫 (`clothes_qingzhu`)**: White traditional Song Dynasty scholar robe featuring green painted bamboo prints on the chest and sleeves (1998 XP).
2. **宋制对襟短衫 (`clothes_duijin`)**: Pale green Song Dynasty outer crop-robe with embroidered flower borders, worn over a beige top with a brown lace ribbon (1998 XP).
3. **青春球场衫 (`clothes_qinchun_polo`)**: Lime/yellow polo sport shirt with a "SPORT" title print, checkerboard bottom, and sports wristwatch (1666 XP).
4. **斜肩运动装 (`clothes_xiejian_sport`)**: Pastel purple cropped one-shoulder top with "Olympic" print, white arm bandages, and pink wrist guards (1666 XP).
5. **莓有烦恼T恤 (`clothes_strawberry_t`)**: Sky blue cotton cropped T-shirt featuring a cartoon blueberry design saying "blueberry" (498 XP).
6. **桃气满满T恤 (`clothes_peach_t`)**: Baby pink cotton T-shirt featuring cartoon peaches saying "peach" (498 XP).
7. **瓜目相看T恤 (`clothes_watermelon_t`)**: Soft coral pink cotton T-shirt with cute watermelons saying "watermelon" (498 XP).
8. **牛转乾坤T恤 (`clothes_avocado_t`)**: Pastel lime-green cotton T-shirt with smiley avocado characters saying "avocado" (498 XP).
9. **银河骑士装 (`clothes_yinhe_knight`)**: Star-patterned midnight blue knight tunic with a silver shoulder metallic armor plate (1998 XP).
10. **璀璨星河裙 (`clothes_cuican_galaxy`)**: Navy blue off-shoulder evening gown with glowing gold star constellations and layered bells sleeves (1998 XP).
11. **山莲云阁飞鱼服 (`clothes_feiyufu`)**: Dark navy Ming Dynasty Fenyu/Flying Fish robe with intricate golden weave details and high collar (1998 XP).
12. **斜襟云肩改良汉服 (`clothes_yunjian_hanfu`)**: Pure white modernized Hanfu dress draped with a gorgeous royal blue embroidered cloud collar (云肩) piece (1998 XP).
13. **翠林猎手装 (`clothes_cuilin_hunter`)**: Earthy green woodland leather-lined vest, white sleeves, and crossed leather bullet-belts (1998 XP).
14. **绿影森意裙 (`clothes_lvying_forest`)**: Olive green puff-sleeve forest maiden dress, golden laces, and decorative flower bracelets (1598 XP).
15. **午后甜心裙 (`clothes_wuhou_sweet`)**: Double-ruffled white off-shoulder top paired with a yellow/white gingham checkered corset bodice (1998 XP).
16. **夏日轻韵衫 (`clothes_xiari_polo`)**: Cream-colored tropical vacation polo shirt decorated with pink/orange flowers, paired with white headphones around the neck (1898 XP).
17. **花织背裙 (`clothes_huazhi_skirt`)**: Short-sleeve white blouse covered in red blossom prints, worn under dark indigo denim suspender overalls (1998 XP).
18. **日落田野装 (`clothes_sunset_field`)**: Light blue striped casual shirt, gray undershirt, with a white utility towel/scarf slung around the neck (1998 XP).
19. **青蓝旗袍 (`clothes_qinglan_qipao`)**: Slim white modernized qipao displaying blue floral patterns (青花瓷 style) and a delicate high collar (1998 XP).
20. **冷白长衫 (`clothes_lengbai_robe`)**: Minimalist traditional white robe featuring traditional black double knot frogs (1998 XP).

## Implementation Checklist

- [ ] Update `scripts/seed-shop.ts` and `app/api/shop/seed/route.ts` with the 20 new items.
- [ ] Add 20 corresponding high-quality SVG vector rendering case blocks in `components/athlete/AvatarRenderer.tsx`.
- [ ] Verify using the command-line seeder and ensure type safety via `npx tsc --noEmit`.
- [ ] Execute Vitest test suite (`npx vitest run`) to guarantee regression-free performance.
