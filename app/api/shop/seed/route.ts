import { NextResponse } from 'next/server';
import { V12_FINGERPRINT } from '@/lib/utils';
import { withApiHandler } from '@/lib/api-handler';
import { getNeon } from '@/lib/db-pool';
export const dynamic = 'force-dynamic';

export async function POST() {
    return withApiHandler(async () => {
        const sql = getNeon();

        await sql`DELETE FROM "ShopItem"`;

        const items: any[] = [];
        const meta = (originalPrice?: number, availableUntil?: string, isNew?: boolean) => JSON.stringify({ originalPrice, availableUntil, isNew });

        // ==========================================
        // 1. Personal Dress-up (个人装扮)
        // Icons: 👕 Clothes, 👦 Hair, 🧢 Hats, 😶 Face, 🥤 Desk Accessory
        // ==========================================
        // Clothes (👕) - 20 ITEMS FROM screenshots 1-5 (100% Baicizhan 1:1 replica)
        items.push({ name: '假两件毛衣', category: '衣服', tier: 'rare', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_jiashan', previewColor: meta() });
        items.push({ name: '游牧风披肩', category: '衣服', tier: 'rare', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_youmu', previewColor: meta() });
        items.push({ name: '兰序浅影西装', category: '衣服', tier: 'advanced', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_lanxu', previewColor: meta() });
        items.push({ name: '胭梅点襟旗袍', category: '衣服', tier: 'advanced', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_yanmei', previewColor: meta() });
        items.push({ name: '西庭蝶梦西装', category: '衣服', tier: 'advanced', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_diemeng_suit', previewColor: meta() });
        items.push({ name: '西庭蝶梦礼服', category: '衣服', tier: 'advanced', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_diemeng_gown', previewColor: meta() });
        items.push({ name: '圣诞绮遇披肩', category: '衣服', tier: 'advanced', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_xmas_shawl', previewColor: meta() });
        items.push({ name: '圣诞绮梦蓬蓬裙', category: '衣服', tier: 'advanced', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_xmas_dress', previewColor: meta() });
        items.push({ name: '瑞云银狐袍', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_ruiyun', previewColor: meta(4000, undefined, true) });
        items.push({ name: '凤尾繁花裙', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_fengwei', previewColor: meta(4000, undefined, true) });
        items.push({ name: '天空城骑士礼服', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_skycity', previewColor: meta() });
        items.push({ name: '云纱宫廷蓬蓬裙', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_yunsha', previewColor: meta() });
        items.push({ name: '沉月·改良明制', category: '衣服', tier: 'advanced', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_chenyue', previewColor: meta() });
        items.push({ name: '春烟·改良明制', category: '衣服', tier: 'advanced', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_chunyan', previewColor: meta() });
        items.push({ name: '福马迎春两件套', category: '衣服', tier: 'advanced', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_fuma', previewColor: meta() });
        items.push({ name: '新中式毛领外套', category: '衣服', tier: 'advanced', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_xinzhongshi', previewColor: meta() });
        items.push({ name: '流苏斗篷披肩', category: '衣服', tier: 'rare', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_liusu', previewColor: meta() });
        items.push({ name: '暮光骑士装', category: '衣服', tier: 'rare', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_muguang', previewColor: meta() });
        items.push({ name: '碧野闲踪袍', category: '衣服', tier: 'advanced', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_biye', previewColor: meta() });
        items.push({ name: '青萤羽纱裙', category: '衣服', tier: 'ultimate', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_qingying', previewColor: meta() });

        // Clothes Part 2 - 20 NEW ITEMS (100% Baicizhan 1:1 replica)
        items.push({ name: '粉墨登场戏服', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_fenmo', previewColor: meta() });
        items.push({ name: '游园惊梦戏服', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_youyuan', previewColor: meta() });
        items.push({ name: '珠光淡黄旗袍', category: '衣服', tier: 'legendary', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_zhuguang', previewColor: meta() });
        items.push({ name: '做旧复古皮衣', category: '衣服', tier: 'advanced', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_fugu', previewColor: meta() });
        items.push({ name: '璀璨齐胸襦裙', category: '衣服', tier: 'legendary', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_ruqun', previewColor: meta() });
        items.push({ name: '少年郎圆领袍', category: '衣服', tier: 'advanced', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_shaonian', previewColor: meta() });
        items.push({ name: '甜酷毛毛外套', category: '衣服', tier: 'advanced', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_tianku', previewColor: meta() });
        items.push({ name: '冰蓝格子外套', category: '衣服', tier: 'advanced', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_binglan', previewColor: meta() });
        items.push({ name: '落日熔金披风', category: '衣服', tier: 'legendary', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_sunset', previewColor: meta() });
        items.push({ name: '流光幻翼斗篷', category: '衣服', tier: 'legendary', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_fantasy_cape', previewColor: meta() });
        items.push({ name: '银河摘星太空服', category: '衣服', tier: 'ultimate', price: 2599, slotType: 'body', gender: 'unisex', imageKey: 'clothes_galaxy_suit', previewColor: meta() });
        items.push({ name: '九天揽月太空服', category: '衣服', tier: 'ultimate', price: 2599, slotType: 'body', gender: 'unisex', imageKey: 'clothes_jiutian_suit', previewColor: meta() });
        items.push({ name: '暖意圣诞氛围装', category: '衣服', tier: 'advanced', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_xmas_warm', previewColor: meta() });
        items.push({ name: '毛绒甜美小披肩', category: '衣服', tier: 'advanced', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_xmas_capelet', previewColor: meta() });
        items.push({ name: '流光溢彩苗服', category: '衣服', tier: 'legendary', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_miao', previewColor: meta() });
        items.push({ name: '草原部落藏袍', category: '衣服', tier: 'legendary', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_tibet', previewColor: meta() });
        items.push({ name: '林下之风旗袍裙', category: '衣服', tier: 'rare', price: 1599, slotType: 'body', gender: 'unisex', imageKey: 'clothes_linxia', previewColor: meta() });
        items.push({ name: '独步青云盘扣衫', category: '衣服', tier: 'rare', price: 1599, slotType: 'body', gender: 'unisex', imageKey: 'clothes_qingyun_shirt', previewColor: meta() });
        items.push({ name: '斩家学士服-领带款', category: '衣服', tier: 'advanced', price: 1666, slotType: 'body', gender: 'unisex', imageKey: 'clothes_scholar_tie', previewColor: meta() });
        items.push({ name: '斩家学士服-领结款', category: '衣服', tier: 'advanced', price: 1666, slotType: 'body', gender: 'unisex', imageKey: 'clothes_scholar_bowtie', previewColor: meta() });

        // =======================================================
        // Clothes Part 3 - 20 NEW ITEMS (Baicizhan 1:1 replica)
        // =======================================================
        items.push({ name: '宋制青竹澜衫', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_qingzhu', previewColor: meta() });
        items.push({ name: '宋制对襟短衫', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_duijin', previewColor: meta() });
        items.push({ name: '青春球场衫', category: '衣服', tier: 'advanced', price: 1666, slotType: 'body', gender: 'unisex', imageKey: 'clothes_qinchun_polo', previewColor: meta() });
        items.push({ name: '斜肩运动装', category: '衣服', tier: 'advanced', price: 1666, slotType: 'body', gender: 'unisex', imageKey: 'clothes_xiejian_sport', previewColor: meta() });
        items.push({ name: '莓油烦恼T恤', category: '衣服', tier: 'basic', price: 498, slotType: 'body', gender: 'unisex', imageKey: 'clothes_strawberry_t', previewColor: meta() });
        items.push({ name: '桃气满满T恤', category: '衣服', tier: 'basic', price: 498, slotType: 'body', gender: 'unisex', imageKey: 'clothes_peach_t', previewColor: meta() });
        items.push({ name: '瓜目相看T恤', category: '衣服', tier: 'basic', price: 498, slotType: 'body', gender: 'unisex', imageKey: 'clothes_watermelon_t', previewColor: meta() });
        items.push({ name: '牛转乾坤T恤', category: '衣服', tier: 'basic', price: 498, slotType: 'body', gender: 'unisex', imageKey: 'clothes_avocado_t', previewColor: meta() });
        items.push({ name: '银河骑士装', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_yinhe_knight', previewColor: meta() });
        items.push({ name: '璀璨星河裙', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_cuican_galaxy', previewColor: meta() });
        items.push({ name: '山莲云阁飞鱼服', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_feiyufu', previewColor: meta() });
        items.push({ name: '斜襟云肩改良汉服', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_yunjian_hanfu', previewColor: meta() });
        items.push({ name: '翠林猎手装', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_cuilin_hunter', previewColor: meta() });
        items.push({ name: '绿影森意裙', category: '衣服', tier: 'advanced', price: 1598, slotType: 'body', gender: 'unisex', imageKey: 'clothes_lvying_forest', previewColor: meta() });
        items.push({ name: '午后甜心裙', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_wuhou_sweet', previewColor: meta() });
        items.push({ name: '夏日轻韵衫', category: '衣服', tier: 'advanced', price: 1898, slotType: 'body', gender: 'unisex', imageKey: 'clothes_xiari_polo', previewColor: meta() });
        items.push({ name: '花织背裙', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_huazhi_skirt', previewColor: meta() });
        items.push({ name: '日落田野装', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_sunset_field', previewColor: meta() });
        items.push({ name: '青蓝旗袍', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_qinglan_qipao', previewColor: meta() });
        items.push({ name: '冷白长衫', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_lengbai_robe', previewColor: meta() });

        // =======================================================
        // Clothes Part 4 - 20 NEW ITEMS (Baicizhan 1:1 replica)
        // =======================================================
        items.push({ name: '新年女娃套装', category: '衣服', tier: 'legendary', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_xinnian_girl', previewColor: meta() });
        items.push({ name: '新年男娃套装', category: '衣服', tier: 'legendary', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_xinnian_boy', previewColor: meta() });
        items.push({ name: '绿野仙踪披风', category: '衣服', tier: 'legendary', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_lvye_cape', previewColor: meta() });
        items.push({ name: '童话书精灵裙', category: '衣服', tier: 'legendary', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_tonghua_dress', previewColor: meta() });
        items.push({ name: '抗寒军绿大衣', category: '衣服', tier: 'advanced', price: 1333, slotType: 'body', gender: 'unisex', imageKey: 'clothes_junlv_coat', previewColor: meta() });
        items.push({ name: '甜梦漫游记', category: '衣服', tier: 'advanced', price: 1799, slotType: 'body', gender: 'unisex', imageKey: 'clothes_tianmeng_pjs', previewColor: meta() });
        items.push({ name: '白日梦想家', category: '衣服', tier: 'advanced', price: 1799, slotType: 'body', gender: 'unisex', imageKey: 'clothes_bairimeng_pjs', previewColor: meta() });
        items.push({ name: '奶油栗色皮衣', category: '衣服', tier: 'legendary', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_chestnut_leather', previewColor: meta() });
        items.push({ name: '甜酷连衣裙', category: '衣服', tier: 'advanced', price: 1666, slotType: 'body', gender: 'unisex', imageKey: 'clothes_tianku_dress', previewColor: meta() });
        items.push({ name: '炸街无袖衫', category: '衣服', tier: 'advanced', price: 1666, slotType: 'body', gender: 'unisex', imageKey: 'clothes_zhajie_vest', previewColor: meta() });
        items.push({ name: '元气背带裤', category: '衣服', tier: 'advanced', price: 1666, slotType: 'body', gender: 'unisex', imageKey: 'clothes_yuanqi_overalls', previewColor: meta() });
        items.push({ name: '炫酷篮球服', category: '衣服', tier: 'advanced', price: 1666, slotType: 'body', gender: 'unisex', imageKey: 'clothes_lanqiu_suit', previewColor: meta() });
        items.push({ name: '泽西风复古球衣', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_jersey_retro', previewColor: meta() });
        items.push({ name: '运动芭蕾背心', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_ballet_vest', previewColor: meta() });
        items.push({ name: '艾香满襟江湖', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_aixiang_robe', previewColor: meta() });
        items.push({ name: '青艾拂云裳', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_qingai_dress', previewColor: meta() });
        items.push({ name: '暮山紫纱裙', category: '衣服', tier: 'legendary', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_mushan_gown', previewColor: meta() });
        items.push({ name: '天水碧长衫', category: '衣服', tier: 'legendary', price: 1999, slotType: 'body', gender: 'unisex', imageKey: 'clothes_tianshui_robe', previewColor: meta() });
        items.push({ name: '自由一"夏"甜酷衫', category: '衣服', tier: 'advanced', price: 1666, slotType: 'body', gender: 'unisex', imageKey: 'clothes_ziyou_shirt', previewColor: meta() });
        items.push({ name: '热血满格赛车服', category: '衣服', tier: 'advanced', price: 1666, slotType: 'body', gender: 'unisex', imageKey: 'clothes_saiche_suit', previewColor: meta() });

        // =======================================================
        // Clothes Part 5 - 20 NEW ITEMS (Baicizhan 1:1 replica)
        // =======================================================
        items.push({ name: '利落都市套装', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_urban_suit', previewColor: meta() });
        items.push({ name: '精致清冷套装', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_elegant_cold', previewColor: meta() });
        items.push({ name: '雪梅缀银袍', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_xuemei_robe', previewColor: meta() });
        items.push({ name: '云绒披罗裙', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_yunrong_dress', previewColor: meta() });
        items.push({ name: '焦糖橙衬衫', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_caramel_shirt', previewColor: meta() });
        items.push({ name: '暖秋套装', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_warm_autumn', previewColor: meta() });
        items.push({ name: '绯红礼服', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_scarlet_dress', previewColor: meta() });
        items.push({ name: '莓果蛋糕裙', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_berry_cake', previewColor: meta() });
        items.push({ name: '星幻灵袍', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_star_phantom', previewColor: meta() });
        items.push({ name: '幻夜巫裙装', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_dark_witch', previewColor: meta() });
        items.push({ name: '星芒银刃衣', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_starlight_blade', previewColor: meta() });
        items.push({ name: '幻银流光皮衣', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_silver_stream', previewColor: meta() });
        items.push({ name: '复古风吟衫', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_retro_wind', previewColor: meta() });
        items.push({ name: '旷野织梦衫', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_wilderness_dream', previewColor: meta() });
        items.push({ name: '白夜珀光袍', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_white_amber', previewColor: meta() });
        items.push({ name: '星辉梦境裙装', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_star_dream', previewColor: meta() });
        items.push({ name: '沁蓝微风背心', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_breeze_vest', previewColor: meta() });
        items.push({ name: '冰花碎梦裙', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_iceflower_dress', previewColor: meta() });
        items.push({ name: '竹影墨熊猫', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_bamboo_panda', previewColor: meta() });
        items.push({ name: '熊猫竹趣旗袍', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_panda_qipao', previewColor: meta() });

        // =======================================================
        // Clothes Part 6 - 18 NEW ITEMS (Baicizhan 1:1 replica)
        // =======================================================
        items.push({ name: '青苹果棕趣背带裤', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_apple_overalls', previewColor: meta() });
        items.push({ name: '夏野青苹果长裙', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_apple_dress', previewColor: meta() });
        items.push({ name: '山川长袍', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_shanchuan_robe', previewColor: meta() });
        items.push({ name: '墨玉烟罗仙衣', category: '衣服', tier: 'legendary', price: 2000, slotType: 'body', gender: 'unisex', imageKey: 'clothes_moyu_fairy', previewColor: meta() });
        items.push({ name: '牛仔巴恩套装', category: '衣服', tier: 'legendary', price: 1996, slotType: 'body', gender: 'unisex', imageKey: 'clothes_cowboy_barn', previewColor: meta() });
        items.push({ name: '少女巴恩套装', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_cowgirl_barn', previewColor: meta() });
        items.push({ name: '向日葵西装', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_sunflower_suit', previewColor: meta() });
        items.push({ name: '珍珠少女连衣裙', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_pearl_girl', previewColor: meta() });
        items.push({ name: '海洋征服装', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_ocean_conquer', previewColor: meta() });
        items.push({ name: '冒险家航海裙', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_sea_explorer', previewColor: meta() });
        items.push({ name: '幽冥燕尾服', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_phantom_tux', previewColor: meta() });
        items.push({ name: '暗夜女巫裙', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_vampire_queen', previewColor: meta() });
        items.push({ name: '彝锦豪情', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_yi_ethnic', previewColor: meta() });
        items.push({ name: '丝路霓裳', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_silkroad_costume', previewColor: meta() });
        items.push({ name: '国王新衣', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_king_royal', previewColor: meta() });
        items.push({ name: '王后华服', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_queen_royal', previewColor: meta() });
        items.push({ name: '朋克少年', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_punk_boy', previewColor: meta() });
        items.push({ name: 'Y2K女孩', category: '衣服', tier: 'legendary', price: 1998, slotType: 'body', gender: 'unisex', imageKey: 'clothes_y2k_girl', previewColor: meta() });
        // Hair (👦)
        items.push({ name: '冰丝凝光披发', category: '头发', tier: 'ultimate', price: 2500, slotType: 'hair', gender: 'unisex', imageKey: 'hair_icesilk', previewColor: meta() });

        // Batch 1 (15 items)
        items.push({ name: '慵懒半扎发', category: '头发', tier: 'basic', price: 0, slotType: 'hair', gender: 'unisex', imageKey: 'hair_lazy_halfup', previewColor: meta() });
        items.push({ name: '金丝编花瓣', category: '头发', tier: 'basic', price: 0, slotType: 'hair', gender: 'unisex', imageKey: 'hair_golden_braids', previewColor: meta() });
        items.push({ name: '林间倦缕', category: '头发', tier: 'basic', price: 0, slotType: 'hair', gender: 'unisex', imageKey: 'hair_green_elf', previewColor: meta() });
        items.push({ name: '银缕垂瓣', category: '头发', tier: 'basic', price: 0, slotType: 'hair', gender: 'unisex', imageKey: 'hair_silver_elf', previewColor: meta() });
        items.push({ name: '翩翩公子束发', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_scholar_topknot', previewColor: meta() });
        items.push({ name: '国风贵女盘发', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_noble_updo', previewColor: meta() });
        items.push({ name: '元气挑染碎盖', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_energetic_highlight', previewColor: meta() });
        items.push({ name: '温婉中式半扎发', category: '头发', tier: 'basic', price: 0, slotType: 'hair', gender: 'unisex', imageKey: 'hair_gentle_chinese', previewColor: meta() });
        items.push({ name: '矜贵白金短发', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_platinum_short', previewColor: meta() });
        items.push({ name: '魅力波浪卷', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_blonde_waves', previewColor: meta() });
        items.push({ name: '元气翘边短发', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_flared_short', previewColor: meta() });
        items.push({ name: '百变千金卷', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_princess_curls', previewColor: meta() });
        items.push({ name: '银狐碎影短发', category: '头发', tier: 'basic', price: 0, slotType: 'hair', gender: 'unisex', imageKey: 'hair_fox_ears', previewColor: meta() });
        items.push({ name: '晴空少年短卷发', category: '头发', tier: 'basic', price: 0, slotType: 'hair', gender: 'unisex', imageKey: 'hair_clearsky_curls', previewColor: meta() });
        items.push({ name: '烟霞漫步垂发', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_rosy_sunset', previewColor: meta() });

        // Batch 2 (20 items)
        items.push({ name: '彝族头巾', category: '头发', tier: 'rare', price: 598, slotType: 'hair', gender: 'unisex', imageKey: 'hair_yi_scarf', previewColor: meta() });
        items.push({ name: '维吾尔族花帽', category: '头发', tier: 'rare', price: 598, slotType: 'hair', gender: 'unisex', imageKey: 'hair_uyghur_cap', previewColor: meta() });
        items.push({ name: '国王K的王冠', category: '头发', tier: 'rare', price: 698, slotType: 'hair', gender: 'unisex', imageKey: 'hair_king_crown', previewColor: meta() });
        items.push({ name: '王后Q的水晶', category: '头发', tier: 'rare', price: 698, slotType: 'hair', gender: 'unisex', imageKey: 'hair_queen_tiara', previewColor: meta() });
        items.push({ name: '小生头面', category: '头发', tier: 'legendary', price: 898, slotType: 'hair', gender: 'unisex', imageKey: 'hair_xiaosheng_cap', previewColor: meta() });
        items.push({ name: '花旦头面', category: '头发', tier: 'legendary', price: 898, slotType: 'hair', gender: 'unisex', imageKey: 'hair_huadan_headdress', previewColor: meta() });
        items.push({ name: '森之精灵短发', category: '头发', tier: 'advanced', price: 499, slotType: 'hair', gender: 'unisex', imageKey: 'hair_elf_short', previewColor: meta() });
        items.push({ name: '森之精灵长发', category: '头发', tier: 'rare', price: 699, slotType: 'hair', gender: 'unisex', imageKey: 'hair_elf_long', previewColor: meta() });
        items.push({ name: '中国娃娃春丽头', category: '头发', tier: 'rare', price: 599, slotType: 'hair', gender: 'unisex', imageKey: 'hair_chunli_buns', previewColor: meta() });
        items.push({ name: '龙年款醒狮头', category: '头发', tier: 'rare', price: 599, slotType: 'hair', gender: 'unisex', imageKey: 'hair_lion_dance', previewColor: meta() });
        items.push({ name: '金簪双髻', category: '头发', tier: 'rare', price: 666, slotType: 'hair', gender: 'unisex', imageKey: 'hair_double_gold_buns', previewColor: meta() });
        items.push({ name: '银簪发髻', category: '头发', tier: 'rare', price: 666, slotType: 'hair', gender: 'unisex', imageKey: 'hair_single_silver_bun', previewColor: meta() });
        items.push({ name: '宇航兔头盔', category: '头发', tier: 'legendary', price: 799, slotType: 'hair', gender: 'unisex', imageKey: 'hair_rabbit_helmet', previewColor: meta() });
        items.push({ name: '镭射护目镜', category: '头发', tier: 'legendary', price: 799, slotType: 'hair', gender: 'unisex', imageKey: 'hair_laser_goggles', previewColor: meta() });
        items.push({ name: '珍珠云顶髻', category: '头发', tier: 'rare', price: 666, slotType: 'hair', gender: 'unisex', imageKey: 'hair_pearl_updo', previewColor: meta() });
        items.push({ name: '青玉束发', category: '头发', tier: 'rare', price: 599, slotType: 'hair', gender: 'unisex', imageKey: 'hair_jade_crown', previewColor: meta() });
        items.push({ name: '超酷碎盖', category: '头发', tier: 'rare', price: 666, slotType: 'hair', gender: 'unisex', imageKey: 'hair_headphones_fringe', previewColor: meta() });
        items.push({ name: '鬼马麻花辫', category: '头发', tier: 'rare', price: 666, slotType: 'hair', gender: 'unisex', imageKey: 'hair_quirky_braids', previewColor: meta() });
        items.push({ name: '活力短发', category: '头发', tier: 'rare', price: 666, slotType: 'hair', gender: 'unisex', imageKey: 'hair_headband_short', previewColor: meta() });
        items.push({ name: '如意丸子', category: '头发', tier: 'rare', price: 666, slotType: 'hair', gender: 'unisex', imageKey: 'hair_ruyi_buns', previewColor: meta() });

        // Batch 3 (20 items)
        items.push({ name: '柠必上岸头套', category: '头发', tier: 'rare', price: 458, slotType: 'hair', gender: 'unisex', imageKey: 'hair_lemon_headwear', previewColor: meta() });
        items.push({ name: '拒绝躺平头套', category: '头发', tier: 'rare', price: 458, slotType: 'hair', gender: 'unisex', imageKey: 'hair_apple_headwear', previewColor: meta() });
        items.push({ name: '星际蓝调短发', category: '头发', tier: 'basic', price: 0, slotType: 'hair', gender: 'unisex', imageKey: 'hair_interstellar_blue', previewColor: meta() });
        items.push({ name: '星蓝银辉编发', category: '头发', tier: 'advanced', price: 498, slotType: 'hair', gender: 'unisex', imageKey: 'hair_starry_braids', previewColor: meta() });
        items.push({ name: '圆寸栗子头', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_chestnut_buzz', previewColor: meta() });
        items.push({ name: '炫酷拳击辫', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_boxing_braids', previewColor: meta() });
        items.push({ name: '八字刘海短发', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_curtain_bangs', previewColor: meta() });
        items.push({ name: '粉樱霞缀簪花', category: '头发', tier: 'rare', price: 680, slotType: 'hair', gender: 'unisex', imageKey: 'hair_sakura_headdress', previewColor: meta() });
        items.push({ name: '绅士贵风侧背头', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_slickback_gentleman', previewColor: meta() });
        items.push({ name: '翎羽流光毽子头', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_feather_topknot', previewColor: meta() });
        items.push({ name: '冬霜白银碎盖', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_silver_fringe', previewColor: meta() });
        items.push({ name: '月盈元气短发', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_bob_moon', previewColor: meta() });
        items.push({ name: '银浪长发', category: '头发', tier: 'advanced', price: 498, slotType: 'hair', gender: 'unisex', imageKey: 'hair_silver_wave', previewColor: meta() });
        items.push({ name: '银澜短发', category: '头发', tier: 'advanced', price: 498, slotType: 'hair', gender: 'unisex', imageKey: 'hair_silver_ripple', previewColor: meta() });
        items.push({ name: '日系卷发', category: '头发', tier: 'rare', price: 458, slotType: 'hair', gender: 'unisex', imageKey: 'hair_japanese_curls', previewColor: meta() });
        items.push({ name: '氛围感大波浪', category: '头发', tier: 'rare', price: 458, slotType: 'hair', gender: 'unisex', imageKey: 'hair_wavy_clips', previewColor: meta() });
        items.push({ name: '梵高浅棕发', category: '头发', tier: 'rare', price: 458, slotType: 'hair', gender: 'unisex', imageKey: 'hair_sunhat_brown', previewColor: meta() });
        items.push({ name: '珍珠束发', category: '头发', tier: 'rare', price: 458, slotType: 'hair', gender: 'unisex', imageKey: 'hair_pearl_headscarf', previewColor: meta() });
        items.push({ name: '探险棕发', category: '头发', tier: 'rare', price: 458, slotType: 'hair', gender: 'unisex', imageKey: 'hair_pirate_bandanna', previewColor: meta() });
        items.push({ name: '自由赞歌红发', category: '头发', tier: 'rare', price: 458, slotType: 'hair', gender: 'unisex', imageKey: 'hair_red_anthem', previewColor: meta() });

        // Batch 4 (20 items - second request batch)
        items.push({ name: '闷青纹理烫发', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_greenish_perm', previewColor: meta() });
        items.push({ name: '亚麻花苞双辫', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_flaxen_buns', previewColor: meta() });
        items.push({ name: '金羽束编发', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_golden_feather', previewColor: meta() });
        items.push({ name: '幻纱紫旋披发', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_purple_veil', previewColor: meta() });
        items.push({ name: '冰蓝烫发', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_iceblue_perm', previewColor: meta() });
        items.push({ name: '冰绡漫卷', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_ice_curls', previewColor: meta() });
        items.push({ name: '青墨碎锋', category: '头发', tier: 'basic', price: 0, slotType: 'hair', gender: 'unisex', imageKey: 'hair_ink_spiky', previewColor: meta() });
        items.push({ name: '俏皮双丸子', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_playful_buns', previewColor: meta() });
        items.push({ name: '日光棕穗', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_sunny_fringe', previewColor: meta() });
        items.push({ name: '绿蔓甜莓双丸子', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_strawberry_buns', previewColor: meta() });
        items.push({ name: '青峦漫卷', category: '头发', tier: 'basic', price: 0, slotType: 'hair', gender: 'unisex', imageKey: 'hair_misty_waves', previewColor: meta() });
        items.push({ name: '清冷挽月髻', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_cold_moon_updo', previewColor: meta() });
        items.push({ name: '少年感微分碎盖', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_youthful_part', previewColor: meta() });
        items.push({ name: '温柔斜编发', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_gentle_sidebraid', previewColor: meta() });
        items.push({ name: '美式棒球背头', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_baseball_cap', previewColor: meta() });
        items.push({ name: '运动感双麻花', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_sporty_pigtails', previewColor: meta() });
        items.push({ name: '千山暮雪束发', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_thousand_snow', previewColor: meta() });
        items.push({ name: '古风俏皮扎发', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_ancient_playful', previewColor: meta() });
        items.push({ name: '清爽发带碎盖', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_headband_fringe', previewColor: meta() });
        items.push({ name: '花苞盘发', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_cute_updo', previewColor: meta() });

        // Batch 5 (16 items - third request batch)
        items.push({ name: '韩系微分纹理', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_korean_perm', previewColor: meta() });
        items.push({ name: '斜刘海花苞头', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_side_part_bun', previewColor: meta() });
        items.push({ name: '墨雪束发', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_moxue_topknot', previewColor: meta() });
        items.push({ name: '灵俏双髻', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_cute_double_buns', previewColor: meta() });
        items.push({ name: '红棕短发', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_redbrown_short', previewColor: meta() });
        items.push({ name: '暖棕卷发', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_warm_brown_curls', previewColor: meta() });
        items.push({ name: '银蓝烫发', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_silverblue_perm', previewColor: meta() });
        items.push({ name: '银色公主切', category: '头发', tier: 'rare', price: 600, slotType: 'hair', gender: 'unisex', imageKey: 'hair_silver_hime', previewColor: meta() });
        items.push({ name: '金棕短发', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_golden_brown_short', previewColor: meta() });
        items.push({ name: '金色羊毛卷', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_golden_curly', previewColor: meta() });
        items.push({ name: '橘色挑染短发', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_orange_highlight', previewColor: meta() });
        items.push({ name: '橘子汽水卷发', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_orange_soda', previewColor: meta() });
        items.push({ name: '气质挑染碎发', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_stylish_highlight', previewColor: meta() });
        items.push({ name: '可爱双丸子头', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_cute_twin_buns', previewColor: meta() });
        items.push({ name: '中式侧丸子头', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_chinese_side_bun', previewColor: meta() });
        items.push({ name: '中式微分碎盖', category: '头发', tier: 'advanced', price: 480, slotType: 'hair', gender: 'unisex', imageKey: 'hair_chinese_part', previewColor: meta() });

        // Batch 6 (6 premium items - fourth request batch)
        items.push({ name: '琴心剑意髻', category: '头发', tier: 'rare', price: 598, slotType: 'hair', gender: 'unisex', imageKey: 'hair_qinxin_updo', previewColor: meta() });
        items.push({ name: '花簪云髻', category: '头发', tier: 'rare', price: 598, slotType: 'hair', gender: 'unisex', imageKey: 'hair_flower_cloud_updo', previewColor: meta() });
        items.push({ name: '风吟短发', category: '头发', tier: 'advanced', price: 498, slotType: 'hair', gender: 'unisex', imageKey: 'hair_wind_whisper_short', previewColor: meta() });
        items.push({ name: '绯红长发', category: '头发', tier: 'advanced', price: 498, slotType: 'hair', gender: 'unisex', imageKey: 'hair_scarlet_long', previewColor: meta() });
        items.push({ name: '暗夜魔爵发', category: '头发', tier: 'rare', price: 458, slotType: 'hair', gender: 'unisex', imageKey: 'hair_vampire_lord', previewColor: meta() });
        items.push({ name: '银辉绮梦发', category: '头发', tier: 'rare', price: 458, slotType: 'hair', gender: 'unisex', imageKey: 'hair_silver_dream', previewColor: meta() });



        // Hats (🧢)
        items.push({ name: '碎玉星藤冠', category: '头饰', tier: 'advanced', price: 0, slotType: 'hat', gender: 'unisex', imageKey: 'hat_starvine', previewColor: meta() });
        items.push({ name: '小钻天帽', category: '头饰', tier: 'basic', price: 0, slotType: 'hat', gender: 'unisex', imageKey: 'hat_11diamond', previewColor: meta() });
        items.push({ name: '白色狐耳发箍', category: '头饰', tier: 'basic', price: 0, slotType: 'hat', gender: 'unisex', imageKey: 'hat_foxears', previewColor: meta() });

        // Baicizhan 51 Premium Hat Styles Replica
        items.push({ name: '麋鹿小发夹', category: '头饰', tier: 'advanced', price: 199, slotType: 'hat', gender: 'unisex', imageKey: 'hat_elk_clips', previewColor: meta() });
        items.push({ name: '苗风精致银饰', category: '头饰', tier: 'rare', price: 599, slotType: 'hat', gender: 'unisex', imageKey: 'hat_miao_silver', previewColor: meta() });
        items.push({ name: '星月辉映', category: '头饰', tier: 'advanced', price: 299, slotType: 'hat', gender: 'unisex', imageKey: 'hat_star_moon_cap', previewColor: meta() });
        items.push({ name: '探索喵星', category: '头饰', tier: 'advanced', price: 299, slotType: 'hat', gender: 'unisex', imageKey: 'hat_cat_explorer', previewColor: meta() });
        items.push({ name: '萌丫丫帽子', category: '头饰', tier: 'advanced', price: 300, slotType: 'hat', gender: 'unisex', imageKey: 'hat_sprout_panda', previewColor: meta() });
        items.push({ name: '青苹果絮语头巾', category: '头饰', tier: 'advanced', price: 300, slotType: 'hat', gender: 'unisex', imageKey: 'hat_green_bandana', previewColor: meta() });
        items.push({ name: '千禧风浅边眼镜', category: '头饰', tier: 'advanced', price: 200, slotType: 'hat', gender: 'unisex', imageKey: 'hat_y2k_sunglasses', previewColor: meta() });
        items.push({ name: '恬静花边草帽', category: '头饰', tier: 'advanced', price: 200, slotType: 'hat', gender: 'unisex', imageKey: 'hat_lace_straw_hat', previewColor: meta() });
        items.push({ name: '喵喵雪帽', category: '头饰', tier: 'rare', price: 398, slotType: 'hat', gender: 'unisex', imageKey: 'hat_meow_snow_hood', previewColor: meta() });
        items.push({ name: '圣诞礼帽', category: '头饰', tier: 'rare', price: 398, slotType: 'hat', gender: 'unisex', imageKey: 'hat_xmas_top_hat', previewColor: meta() });
        items.push({ name: '圣诞红的贝雷帽', category: '头饰', tier: 'rare', price: 398, slotType: 'hat', gender: 'unisex', imageKey: 'hat_xmas_red_beret', previewColor: meta() });
        items.push({ name: '毛绒针织帽', category: '头饰', tier: 'rare', price: 398, slotType: 'hat', gender: 'unisex', imageKey: 'hat_plush_knitted_beanie', previewColor: meta() });
        items.push({ name: '羽毛网纱小礼帽', category: '头饰', tier: 'rare', price: 399, slotType: 'hat', gender: 'unisex', imageKey: 'hat_feather_veil_mini', previewColor: meta() });
        items.push({ name: '猫咪毛绒帽', category: '头饰', tier: 'advanced', price: 299, slotType: 'hat', gender: 'unisex', imageKey: 'hat_fluffy_cat_beanie', previewColor: meta() });
        items.push({ name: '狗勾毛绒帽', category: '头饰', tier: 'basic', price: 0, slotType: 'hat', gender: 'unisex', imageKey: 'hat_fluffy_dog_beanie', previewColor: meta() });
        items.push({ name: '可爱雪人帽', category: '头饰', tier: 'rare', price: 399, slotType: 'hat', gender: 'unisex', imageKey: 'hat_cute_snowman_hood', previewColor: meta() });
        items.push({ name: '晚安秘境', category: '头饰', tier: 'basic', price: 0, slotType: 'hat', gender: 'unisex', imageKey: 'hat_sleep_mask_panda', previewColor: meta() });
        items.push({ name: '搞怪一下', category: '头饰', tier: 'basic', price: 0, slotType: 'hat', gender: 'unisex', imageKey: 'hat_spooky_monster', previewColor: meta() });
        items.push({ name: '复古八角帽', category: '头饰', tier: 'rare', price: 399, slotType: 'hat', gender: 'unisex', imageKey: 'hat_retro_octagonal', previewColor: meta() });
        items.push({ name: '名列前"帽"', category: '头饰', tier: 'rare', price: 399, slotType: 'hat', gender: 'unisex', imageKey: 'hat_top_ranking_cap', previewColor: meta() });
        items.push({ name: '海风之影帽', category: '头饰', tier: 'rare', price: 398, slotType: 'hat', gender: 'unisex', imageKey: 'hat_pirate_captain', previewColor: meta() });
        items.push({ name: '雅士儒巾', category: '头饰', tier: 'advanced', price: 298, slotType: 'hat', gender: 'unisex', imageKey: 'hat_scholar_confucian', previewColor: meta() });
        items.push({ name: '翠叶王冠', category: '头饰', tier: 'rare', price: 398, slotType: 'hat', gender: 'unisex', imageKey: 'hat_green_leaf_crown', previewColor: meta() });
        items.push({ name: '野餐头巾', category: '头饰', tier: 'rare', price: 398, slotType: 'hat', gender: 'unisex', imageKey: 'hat_picnic_bandana', previewColor: meta() });
        items.push({ name: '银色骑行头盔', category: '头饰', tier: 'advanced', price: 200, slotType: 'hat', gender: 'unisex', imageKey: 'hat_cycling_silver', previewColor: meta() });
        items.push({ name: '粉色骑行头盔', category: '头饰', tier: 'advanced', price: 200, slotType: 'hat', gender: 'unisex', imageKey: 'hat_cycling_pink', previewColor: meta() });
        items.push({ name: '锦绒毛线帽', category: '头饰', tier: 'advanced', price: 300, slotType: 'hat', gender: 'unisex', imageKey: 'hat_warm_red_beanie', previewColor: meta() });
        items.push({ name: '汪汪雪帽', category: '头饰', tier: 'rare', price: 398, slotType: 'hat', gender: 'unisex', imageKey: 'hat_doggy_snow_hood', previewColor: meta() });
        items.push({ name: '花语云端遮阳帽', category: '头饰', tier: 'advanced', price: 200, slotType: 'hat', gender: 'unisex', imageKey: 'hat_flower_sun_hat', previewColor: meta() });
        items.push({ name: '逐风行者帽', category: '头饰', tier: 'basic', price: 0, slotType: 'hat', gender: 'unisex', imageKey: 'hat_cowboy_wind', previewColor: meta() });
        items.push({ name: '拾光宽檐帽', category: '头饰', tier: 'advanced', price: 200, slotType: 'hat', gender: 'unisex', imageKey: 'hat_ranger_star', previewColor: meta() });
        items.push({ name: '贵气夜蝶礼帽', category: '头饰', tier: 'advanced', price: 200, slotType: 'hat', gender: 'unisex', imageKey: 'hat_night_butterfly', previewColor: meta() });
        items.push({ name: '童话王冠', category: '头饰', tier: 'advanced', price: 200, slotType: 'hat', gender: 'unisex', imageKey: 'hat_fairy_crown', previewColor: meta() });
        items.push({ name: '梦幻花帽', category: '头饰', tier: 'advanced', price: 200, slotType: 'hat', gender: 'unisex', imageKey: 'hat_dreamy_tiara', previewColor: meta() });
        items.push({ name: '落日贝雷帽', category: '头饰', tier: 'advanced', price: 200, slotType: 'hat', gender: 'unisex', imageKey: 'hat_sunset_beret', previewColor: meta() });
        items.push({ name: '卡皮巴拉渔夫帽', category: '头饰', tier: 'rare', price: 398, slotType: 'hat', gender: 'unisex', imageKey: 'hat_capybara_bucket', previewColor: meta() });
        items.push({ name: '耕耘阳光帽', category: '头饰', tier: 'basic', price: 98, slotType: 'hat', gender: 'unisex', imageKey: 'hat_farm_sun_hat', previewColor: meta() });
        items.push({ name: '精灵桂冠', category: '头饰', tier: 'rare', price: 399, slotType: 'hat', gender: 'unisex', imageKey: 'hat_elf_laurel', previewColor: meta() });
        items.push({ name: '密林花冠', category: '头饰', tier: 'rare', price: 399, slotType: 'hat', gender: 'unisex', imageKey: 'hat_forest_wreath', previewColor: meta() });
        items.push({ name: '圆舞曲面具', category: '头饰', tier: 'advanced', price: 299, slotType: 'hat', gender: 'unisex', imageKey: 'hat_waltz_mask', previewColor: meta() });
        items.push({ name: '小恶魔发箍', category: '头饰', tier: 'advanced', price: 299, slotType: 'hat', gender: 'unisex', imageKey: 'hat_devil_horns', previewColor: meta() });
        items.push({ name: '星空魔法帽', category: '头饰', tier: 'rare', price: 399, slotType: 'hat', gender: 'unisex', imageKey: 'hat_galaxy_wizard', previewColor: meta() });
        items.push({ name: '宝石魔法帽', category: '头饰', tier: 'rare', price: 399, slotType: 'hat', gender: 'unisex', imageKey: 'hat_gem_wizard', previewColor: meta() });
        items.push({ name: '兔耳礼帽', category: '头饰', tier: 'rare', price: 400, slotType: 'hat', gender: 'unisex', imageKey: 'hat_rabbit_ears_hat', previewColor: meta() });
        items.push({ name: '巫师帽', category: '头饰', tier: 'rare', price: 400, slotType: 'hat', gender: 'unisex', imageKey: 'hat_witch_hat', previewColor: meta() });
        items.push({ name: '金色羽毛发饰', category: '头饰', tier: 'basic', price: 100, slotType: 'hat', gender: 'unisex', imageKey: 'hat_golden_laurel', previewColor: meta() });
        items.push({ name: '浅蓝贝雷帽', category: '头饰', tier: 'advanced', price: 200, slotType: 'hat', gender: 'unisex', imageKey: 'hat_lightblue_beret', previewColor: meta() });
        items.push({ name: '暖冬纳福醒狮帽', category: '头饰', tier: 'advanced', price: 200, slotType: 'hat', gender: 'unisex', imageKey: 'hat_lion_dance_hat', previewColor: meta() });
        items.push({ name: '毛绒游牧帽', category: '头饰', tier: 'advanced', price: 200, slotType: 'hat', gender: 'unisex', imageKey: 'hat_nomad_ushanka', previewColor: meta() });
        items.push({ name: '野性牛仔帽', category: '头饰', tier: 'advanced', price: 200, slotType: 'hat', gender: 'unisex', imageKey: 'hat_cowboy_wild', previewColor: meta() });
        items.push({ name: '典雅蝴蝶帽', category: '头饰', tier: 'advanced', price: 200, slotType: 'hat', gender: 'unisex', imageKey: 'hat_elegant_butterfly', previewColor: meta() });
        // Face (😶) - FROM IMAGE 3
        items.push({ name: '流苏面纱', category: '脸部', tier: 'basic', price: 0, slotType: 'face', gender: 'unisex', imageKey: 'face_veil', previewColor: meta() });
        items.push({ name: '素珠点额妆', category: '脸部', tier: 'basic', price: 0, slotType: 'face', gender: 'unisex', imageKey: 'face_reddot', previewColor: meta() });
        items.push({ name: '摩登猫眼墨镜', category: '脸部', tier: 'basic', price: 0, slotType: 'face', gender: 'unisex', imageKey: 'face_sunglasses', previewColor: meta() });
        items.push({ name: '圣诞七彩妆', category: '脸部', tier: 'basic', price: 0, slotType: 'face', gender: 'unisex', imageKey: 'face_xmas', previewColor: meta() });
        items.push({ name: '数据读取眼镜', category: '脸部', tier: 'basic', price: 0, slotType: 'face', gender: 'unisex', imageKey: 'face_scouter', previewColor: meta() });
        items.push({ name: '书卷气眼镜', category: '脸部', tier: 'basic', price: 0, slotType: 'face', gender: 'unisex', imageKey: 'face_glasses', previewColor: meta() });

        // New Face decorations (Baicizhan 1:1)
        items.push({ name: '高智感眼镜', category: '脸部', tier: 'advanced', price: 200, slotType: 'face', gender: 'unisex', imageKey: 'face_smart_glasses', previewColor: meta() });
        items.push({ name: '清凉感彩绘', category: '脸部', tier: 'advanced', price: 200, slotType: 'face', gender: 'unisex', imageKey: 'face_cool_paint', previewColor: meta() });
        items.push({ name: '爱心墨镜', category: '脸部', tier: 'advanced', price: 200, slotType: 'face', gender: 'unisex', imageKey: 'face_heart_sunglasses', previewColor: meta() });
        items.push({ name: '骑行墨镜', category: '脸部', tier: 'advanced', price: 200, slotType: 'face', gender: 'unisex', imageKey: 'face_cycling_shades', previewColor: meta() });
        items.push({ name: '小熊黑框眼镜', category: '脸部', tier: 'advanced', price: 198, slotType: 'face', gender: 'unisex', imageKey: 'face_bear_glasses', previewColor: meta() });
        items.push({ name: '凝露珍珠妆', category: '脸部', tier: 'advanced', price: 200, slotType: 'face', gender: 'unisex', imageKey: 'face_pearl_makeup', previewColor: meta() });
        items.push({ name: '可爱joker妆', category: '脸部', tier: 'advanced', price: 200, slotType: 'face', gender: 'unisex', imageKey: 'face_joker_makeup', previewColor: meta() });
        items.push({ name: '冰蓝猫眼墨镜', category: '脸部', tier: 'advanced', price: 200, slotType: 'face', gender: 'unisex', imageKey: 'face_blue_cat_shades', previewColor: meta() });
        items.push({ name: '单眼神秘眼镜', category: '脸部', tier: 'basic', price: 100, slotType: 'face', gender: 'unisex', imageKey: 'face_monocle', previewColor: meta() });
        items.push({ name: '圣诞彩绘', category: '脸部', tier: 'advanced', price: 200, slotType: 'face', gender: 'unisex', imageKey: 'face_xmas_cheeks', previewColor: meta() });
        items.push({ name: '贵气无框眼镜', category: '脸部', tier: 'advanced', price: 200, slotType: 'face', gender: 'unisex', imageKey: 'face_rimless_glasses', previewColor: meta() });

        // Batch 2 Face decorations (Baicizhan 1:1)
        items.push({ name: '暗影之舞', category: '脸部', tier: 'advanced', price: 198, slotType: 'face', gender: 'unisex', imageKey: 'face_shadow_dance', previewColor: meta() });
        items.push({ name: '民族彩绘', category: '脸部', tier: 'advanced', price: 198, slotType: 'face', gender: 'unisex', imageKey: 'face_ethnic_paint', previewColor: meta() });
        items.push({ name: '全场最酷墨镜', category: '脸部', tier: 'advanced', price: 198, slotType: 'face', gender: 'unisex', imageKey: 'face_coolest_shades', previewColor: meta() });
        items.push({ name: '菠萝墨镜', category: '脸部', tier: 'advanced', price: 198, slotType: 'face', gender: 'unisex', imageKey: 'face_pineapple_sunglasses', previewColor: meta() });
        items.push({ name: '出游墨镜', category: '脸部', tier: 'advanced', price: 198, slotType: 'face', gender: 'unisex', imageKey: 'face_vacation_shades', previewColor: meta() });
        items.push({ name: '酷酷表情', category: '脸部', tier: 'advanced', price: 198, slotType: 'face', gender: 'unisex', imageKey: 'face_cool_expression', previewColor: meta() });
        items.push({ name: '鼻涕泡表情', category: '脸部', tier: 'advanced', price: 198, slotType: 'face', gender: 'unisex', imageKey: 'face_snot_bubble', previewColor: meta() });
        items.push({ name: '向日葵彩绘', category: '脸部', tier: 'advanced', price: 198, slotType: 'face', gender: 'unisex', imageKey: 'face_sunflower_paint', previewColor: meta() });
        items.push({ name: '文艺络腮胡', category: '脸部', tier: 'advanced', price: 198, slotType: 'face', gender: 'unisex', imageKey: 'face_literary_beard', previewColor: meta() });
        items.push({ name: '海盗眼罩', category: '脸部', tier: 'advanced', price: 198, slotType: 'face', gender: 'unisex', imageKey: 'face_pirate_eyepatch', previewColor: meta() });
        items.push({ name: '暗夜蝠影', category: '脸部', tier: 'advanced', price: 198, slotType: 'face', gender: 'unisex', imageKey: 'face_dark_bat_mask', previewColor: meta() });
        // Desk Accessory (🥤)
        items.push({ name: '水晶发光笔洗', category: '桌面配件', tier: 'advanced', price: 900, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_crystal', previewColor: meta() });

        // 20 New 1:1 Baicizhan Desk Accessories
        items.push({ name: '机械狐', category: '桌面配件', tier: 'advanced', price: 300, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_mech_fox', previewColor: meta() });
        items.push({ name: '皮革热气球', category: '桌面配件', tier: 'advanced', price: 300, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_leather_balloon', previewColor: meta() });
        items.push({ name: '玻利维亚羊驼', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_alpaca', previewColor: meta() });
        items.push({ name: '薄荷冰淇淋', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_mint_icecream', previewColor: meta() });
        items.push({ name: '雅枝置笔架', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_brush_holder', previewColor: meta() });
        items.push({ name: '好柿花生奶茶', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_persimmon_tea', previewColor: meta() });
        items.push({ name: '万圣惊喜屋', category: '桌面配件', tier: 'advanced', price: 300, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_halloween_house', previewColor: meta() });
        items.push({ name: '魔法药水', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_magic_potion', previewColor: meta() });
        items.push({ name: '潮玩宫殿纸巾盒', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_palace_tissue', previewColor: meta() });
        items.push({ name: '鎏金西庭茶杯', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_golden_teacup', previewColor: meta() });
        items.push({ name: '平安果眼镜盒', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_apple_glasses_case', previewColor: meta() });
        items.push({ name: '现代转盘日历', category: '桌面配件', tier: 'advanced', price: 200, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_modern_calendar', previewColor: meta() });
        items.push({ name: '闹元宵台灯', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_lantern_lamp', previewColor: meta() });
        items.push({ name: '好运糖果盘', category: '桌面配件', tier: 'advanced', price: 200, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_lucky_candy', previewColor: meta() });
        items.push({ name: '摇摇马摆件', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_rocking_horse', previewColor: meta() });
        items.push({ name: '原始陶土插花', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_clay_vase', previewColor: meta() });
        items.push({ name: '紫晶祥狐聚宝盏', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_fox_crystal_bowl', previewColor: meta() });
        items.push({ name: '云朵点心摆件', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_cloud_dessert', previewColor: meta() });
        items.push({ name: '圆墩牛仔保温杯', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_cowboy_flask', previewColor: meta() });
        items.push({ name: '织梦水晶', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_dream_crystal', previewColor: meta() });

        // 20 New 1:1 Baicizhan Desk Accessories Part 2
        items.push({ name: '节节高升盆栽', category: '桌面配件', tier: 'advanced', price: 300, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_bamboo_bonsai', previewColor: meta() });
        items.push({ name: '苹安小甜杯', category: '桌面配件', tier: 'advanced', price: 20, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_apple_sweet_cup', previewColor: meta() });
        items.push({ name: '幻月灵珠', category: '桌面配件', tier: 'advanced', price: 300, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_illusion_moon_pearl', previewColor: meta() });
        items.push({ name: '海滩贝壳收集瓶', category: '桌面配件', tier: 'advanced', price: 20, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_beach_shell_jar', previewColor: meta() });
        items.push({ name: '马蒂斯的金鱼', category: '桌面配件', tier: 'advanced', price: 198, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_matisse_goldfish', previewColor: meta() });
        items.push({ name: '人鱼贝壳', category: '桌面配件', tier: 'advanced', price: 198, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_mermaid_shell', previewColor: meta() });
        items.push({ name: '南瓜芋泥蛋糕', category: '桌面配件', tier: 'advanced', price: 18, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_pumpkin_cake', previewColor: meta() });
        items.push({ name: '旷野弦歌', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_wilderness_lute', previewColor: meta() });
        items.push({ name: '年年有余食盒', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_surplus_foodbox', previewColor: meta() });
        items.push({ name: '冰雪水晶球', category: '桌面配件', tier: 'advanced', price: 198, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_snow_globe', previewColor: meta() });
        items.push({ name: '不会融化的小雪人', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_permanent_snowman', previewColor: meta() });
        items.push({ name: '桌面温度计', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_thermometer', previewColor: meta() });
        items.push({ name: '砚台', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_inkstone', previewColor: meta() });
        items.push({ name: '笔架', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_brush_rack', previewColor: meta() });
        items.push({ name: '童趣单车小人', category: '桌面配件', tier: 'advanced', price: 200, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_toy_bicycle', previewColor: meta() });
        items.push({ name: '中式糕点拼盘', category: '桌面配件', tier: 'advanced', price: 200, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_chinese_pastry', previewColor: meta() });
        items.push({ name: '运动萌趣玩偶', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_sporty_plush', previewColor: meta() });
        items.push({ name: '"一举高粽"蒸笼', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_zongzi_steamer', previewColor: meta() });
        items.push({ name: '多巴胺香薰', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_dopamine_fragrance', previewColor: meta() });
        items.push({ name: '可露丽甜品', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_canele_dessert', previewColor: meta() });

        // 20 New 1:1 Baicizhan Desk Accessories Part 3
        items.push({ name: '春日来信', category: '桌面配件', tier: 'advanced', price: 99, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_spring_letter', previewColor: meta() });
        items.push({ name: '精灵娃娃', category: '桌面配件', tier: 'advanced', price: 99, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_fairy_doll', previewColor: meta() });
        items.push({ name: '一碗"糯叽"汤圆', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_sweet_dumplings', previewColor: meta() });
        items.push({ name: '龙年款醒狮摆件', category: '桌面配件', tier: 'advanced', price: 99, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_dragon_lion', previewColor: meta() });
        items.push({ name: '满篮番茄', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_tomato_basket', previewColor: meta() });
        items.push({ name: '梅时青团', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_plum_dumplings', previewColor: meta() });
        items.push({ name: '戏曲panda', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_opera_panda', previewColor: meta() });
        items.push({ name: '"咔嚓"胶片机', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_film_camera', previewColor: meta() });
        items.push({ name: '福满人间提盒', category: '桌面配件', tier: 'advanced', price: 398, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_fortune_box', previewColor: meta() });
        items.push({ name: '读报狐狸', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_reading_fox', previewColor: meta() });
        items.push({ name: '计时兔子', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_timer_rabbit', previewColor: meta() });
        items.push({ name: '卡皮巴拉汉堡包', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_capybara_burger', previewColor: meta() });
        items.push({ name: '羽毛球玩偶', category: '桌面配件', tier: 'advanced', price: 198, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_badminton_toy', previewColor: meta() });
        items.push({ name: '足球玩偶', category: '桌面配件', tier: 'advanced', price: 198, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_football_toy', previewColor: meta() });
        items.push({ name: '劝学香蕉猫', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_banana_cat', previewColor: meta() });
        items.push({ name: '星光小夜灯', category: '桌面配件', tier: 'advanced', price: 398, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_starry_nightlight', previewColor: meta() });
        items.push({ name: '幸运的风', category: '桌面配件', tier: 'advanced', price: 18, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_lucky_fan', previewColor: meta() });
        items.push({ name: '一杯幸运咖', category: '桌面配件', tier: 'advanced', price: 18, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_lucky_coffee', previewColor: meta() });
        items.push({ name: '复古大哥大', category: '桌面配件', tier: 'advanced', price: 198, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_retro_brickphone', previewColor: meta() });
        items.push({ name: '立秋奶茶', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_autumn_milktea', previewColor: meta() });

        // 16 New 1:1 Baicizhan Desk Accessories Part 4
        items.push({ name: '会唱歌的圣诞树', category: '桌面配件', tier: 'advanced', price: 599, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_singing_xmas_tree', previewColor: meta() });
        items.push({ name: '怀旧热茶缸', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_retro_mug', previewColor: meta() });
        items.push({ name: '好吃胖面包', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_delicious_toast', previewColor: meta() });
        items.push({ name: 'mini兔推车', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_bunny_cart', previewColor: meta() });
        items.push({ name: '南瓜糖果盒', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_pumpkin_candy_box', previewColor: meta() });
        items.push({ name: '魔幻水晶球', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_magic_globe', previewColor: meta() });
        items.push({ name: '兔兔宇航员', category: '桌面配件', tier: 'advanced', price: 39, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_rabbit_astronaut', previewColor: meta() });
        items.push({ name: '墨竹折扇', category: '桌面配件', tier: 'advanced', price: 399, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_bamboo_fan', previewColor: meta() });
        items.push({ name: '助学机车', category: '桌面配件', tier: 'advanced', price: 39, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_study_motorcycle', previewColor: meta() });
        items.push({ name: '一触即唱Panda', category: '桌面配件', tier: 'advanced', price: 599, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_singing_panda', previewColor: meta() });
        items.push({ name: '"狮狮"如意', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_singing_lion', previewColor: meta() });
        items.push({ name: '积极劝学三宝', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_trio_blobs', previewColor: meta() });
        items.push({ name: '佛系陪学小蓝', category: '桌面配件', tier: 'basic', price: 0, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_blue_reading_monster', previewColor: meta() });
        items.push({ name: '绿意绵绵冰', category: '桌面配件', tier: 'advanced', price: 100, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_green_shaved_ice', previewColor: meta() });
        items.push({ name: '桃桃抹茶糕', category: '桌面配件', tier: 'advanced', price: 100, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_peach_matcha_cake', previewColor: meta() });
        items.push({ name: '斩家毛笔', category: '桌面配件', tier: 'advanced', price: 100, slotType: 'desk_acc', gender: 'unisex', imageKey: 'desk_bj_calligraphy_brushes', previewColor: meta() });




        // ==========================================
        // 2. Desk Mate Space (同桌空间)
        // Icons: 🪴 Plants, 🖼️ Frames, 💻 Desk Items, 🗄️ Cabinets, 🔲 Wallpaper, 🪟 Windows, etc.
        // ==========================================
        // Wallpaper (🔲)
        items.push({ name: '绿野寻踪壁纸', category: '壁纸', tier: 'basic', price: 1000, slotType: 'wallpaper', gender: 'unisex', imageKey: 'bg_greenfloral', previewColor: meta() });

        // Windows (🪟) - FROM IMAGE 2
        items.push({ name: '云间花田望景窗', category: '窗户', tier: 'ultimate', price: 3000, slotType: 'window', gender: 'unisex', imageKey: 'window_cloudflower', previewColor: meta() });

        // Desk Items / Ornaments (💻) - FROM IMAGE 1
        // Batch 1 (20 Items)
        items.push({ name: '蓝屿梦境扩香石', category: '摆件', tier: 'advanced', price: 300, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_blue_diffuser', previewColor: meta() });
        items.push({ name: '梦幻琉璃提灯', category: '摆件', tier: 'advanced', price: 300, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_glass_lantern', previewColor: meta() });
        items.push({ name: '游梦的鱼', category: '摆件', tier: 'advanced', price: 300, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_dream_fish', previewColor: meta() });
        items.push({ name: '熊猫伴读', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_panda_study', previewColor: meta() });
        items.push({ name: '海獭小灯', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_sea_otter_lamp', previewColor: meta() });
        items.push({ name: '万圣糖果机', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_halloween', previewColor: meta() });
        items.push({ name: '星幻秘典', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_star_grimoire', previewColor: meta() });
        items.push({ name: '微缩未来城', category: '摆件', tier: 'advanced', price: 300, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_future_city', previewColor: meta() });
        items.push({ name: '纷飞蝶影烛台', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_butterfly_candle', previewColor: meta() });
        items.push({ name: '香薰祈愿杯', category: '摆件', tier: 'advanced', price: 200, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_wishing_cup', previewColor: meta() });
        items.push({ name: '极简微型鱼缸', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_fishtank', previewColor: meta() });
        items.push({ name: '雪绘纸雕伞', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_paper_umbrella', previewColor: meta() });
        items.push({ name: '中式古风摆台画', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_chinese_painting', previewColor: meta() });
        items.push({ name: '好运收集瓶', category: '摆件', tier: 'advanced', price: 300, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_good_luck_bottle', previewColor: meta() });
        items.push({ name: '游牧风摆件', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_nomadic', previewColor: meta() });
        items.push({ name: '书画卷轴', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_calligraphy_scroll', previewColor: meta() });
        items.push({ name: '福至眠香白狐', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_fox', previewColor: meta() });
        items.push({ name: '旋转花塔摆件', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_flowertower', previewColor: meta() });
        items.push({ name: '冒险家纪念摆件', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_adventurer', previewColor: meta() });
        items.push({ name: '木语杂货架', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_wooden_rack', previewColor: meta() });
        
        // Batch 2 (20 Items)
        items.push({ name: '麦田纸书灯', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_wheat_book_lamp', previewColor: meta() });
        items.push({ name: '远航之帆', category: '摆件', tier: 'advanced', price: 198, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_sailing_ship', previewColor: meta() });
        items.push({ name: '小丑惊喜盒子', category: '摆件', tier: 'advanced', price: 198, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_clown_box', previewColor: meta() });
        items.push({ name: '傣族陶艺', category: '摆件', tier: 'advanced', price: 198, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_dai_pottery', previewColor: meta() });
        items.push({ name: '花团锦簇', category: '摆件', tier: 'advanced', price: 200, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_festive_flowers', previewColor: meta() });
        items.push({ name: '2025年历', category: '摆件', tier: 'advanced', price: 198, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_2025_calendar', previewColor: meta() });
        items.push({ name: '歪脖子台灯', category: '摆件', tier: 'advanced', price: 198, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_crooked_lamp', previewColor: meta() });
        items.push({ name: '香薰烛台', category: '摆件', tier: 'advanced', price: 198, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_aroma_candle', previewColor: meta() });
        items.push({ name: '车轮台灯', category: '摆件', tier: 'advanced', price: 200, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_wheel_lamp', previewColor: meta() });
        items.push({ name: '烟霞流云香炉', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_cloud_incense', previewColor: meta() });
        items.push({ name: '复古时光插花', category: '摆件', tier: 'advanced', price: 200, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_retro_flowers', previewColor: meta() });
        items.push({ name: '月影莲开提灯', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_lotus_lantern', previewColor: meta() });
        items.push({ name: '"顺风顺水"龙舟', category: '摆件', tier: 'advanced', price: 300, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_dragon_boat', previewColor: meta() });
        items.push({ name: '奶油风置物架', category: '摆件', tier: 'advanced', price: 300, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_cream_rack', previewColor: meta() });
        items.push({ name: '烘香咖啡机', category: '摆件', tier: 'advanced', price: 300, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_coffee_machine', previewColor: meta() });
        items.push({ name: '竹影青花瓷', category: '摆件', tier: 'advanced', price: 200, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_blue_porcelain', previewColor: meta() });
        items.push({ name: '果韵小馨座', category: '摆件', tier: 'advanced', price: 300, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_fruit_scent', previewColor: meta() });
        items.push({ name: '沧澜雪扇', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_snow_fan', previewColor: meta() });
        items.push({ name: '海滩椰岛香薰', category: '摆件', tier: 'advanced', price: 300, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_beach_aroma', previewColor: meta() });
        items.push({ name: '棒球角摆件', category: '摆件', tier: 'advanced', price: 300, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_baseball_corner', previewColor: meta() });
        
        // Batch 3 (16 Items)
        items.push({ name: '柳枝瓷瓶', category: '摆件', tier: 'advanced', price: 198, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_willow_vase', previewColor: meta() });
        items.push({ name: '黑胶唱片机', category: '摆件', tier: 'advanced', price: 399, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_vinyl_player', previewColor: meta() });
        items.push({ name: '花卉烛台', category: '摆件', tier: 'advanced', price: 199, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_floral_candle', previewColor: meta() });
        items.push({ name: 'Q版长寿面', category: '摆件', tier: 'advanced', price: 199, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_chibi_noodles', previewColor: meta() });
        items.push({ name: '犹抱琵琶半遮面', category: '摆件', tier: 'advanced', price: 398, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_pipa', previewColor: meta() });
        items.push({ name: '守护森林的独角兽', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_unicorn', previewColor: meta() });
        items.push({ name: '夏日野餐篮', category: '摆件', tier: 'advanced', price: 398, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_picnic_basket', previewColor: meta() });
        items.push({ name: '谷满仓香', category: '摆件', tier: 'advanced', price: 198, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_grain_barn', previewColor: meta() });
        items.push({ name: '熊猫立柜空调', category: '摆件', tier: 'advanced', price: 198, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_panda_ac', previewColor: meta() });
        items.push({ name: '举重熊猫', category: '摆件', tier: 'advanced', price: 198, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_panda_weightlifter', previewColor: meta() });
        items.push({ name: '一椰学成', category: '摆件', tier: 'advanced', price: 198, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_coconut', previewColor: meta() });
        items.push({ name: '漂浮星域', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_floating_stars', previewColor: meta() });
        items.push({ name: 'lucky玩偶', category: '摆件', tier: 'advanced', price: 198, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_lucky_doll', previewColor: meta() });
        items.push({ name: '黑胶旋律', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_vinyl', previewColor: meta() });
        items.push({ name: '无忧漆扇', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_worry_free_fan', previewColor: meta() });
        items.push({ name: '上岸漆扇', category: '摆件', tier: 'advanced', price: 198, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_ashore_fan', previewColor: meta() });
        
        // Batch 4 (8 Items)
        items.push({ name: '围炉茶食', category: '摆件', tier: 'advanced', price: 399, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_stove_tea', previewColor: meta() });
        items.push({ name: '古香木制架', category: '摆件', tier: 'advanced', price: 399, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_antique_rack', previewColor: meta() });
        items.push({ name: '劝学panda', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_study_panda', previewColor: meta() });
        items.push({ name: '"知天知地"地球仪', category: '摆件', tier: 'advanced', price: 100, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_globe', previewColor: meta() });
        items.push({ name: '幽灵城堡', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_ghost_castle', previewColor: meta() });
        items.push({ name: '古韵香炉', category: '摆件', tier: 'basic', price: 0, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_ancient_incense', previewColor: meta() });
        items.push({ name: '斩家旋律音响', category: '摆件', tier: 'advanced', price: 399, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_retro_speaker', previewColor: meta() });
        items.push({ name: '福气满满年宵花', category: '摆件', tier: 'advanced', price: 399, slotType: 'desk_ornament', gender: 'unisex', imageKey: 'orn_fortune_flowers', previewColor: meta() });

        // Wall Art / Hanging (🖼️)
        items.push({ name: '瑞光青玉揽月灯', category: '墙饰', tier: 'advanced', price: 0, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_lantern', previewColor: {} });
        items.push({ name: '星光精灵壁挂灯', category: '墙饰', tier: 'advanced', price: 0, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_elf_lamp', previewColor: {} });
        items.push({ name: '牛仔星月风铃', category: '墙饰', tier: 'advanced', price: 0, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_cowboy_chime', previewColor: {} });
        items.push({ name: '凝露浮光壁灯', category: '墙饰', tier: 'advanced', price: 0, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_flower_lamp', previewColor: {} });
        items.push({ name: '如意灯笼串', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_lantern_string', previewColor: {} });
        items.push({ name: '辞旧迎新挂画', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_newyear_painting', previewColor: {} });
        items.push({ name: '狩猎挂毯', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_owl_tapestry', previewColor: {} });
        items.push({ name: '花式宫灯', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_palace_lantern', previewColor: {} });
        items.push({ name: '梦幻蝴蝶墙', category: '墙饰', tier: 'advanced', price: 200, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_butterfly_board', previewColor: {} });
        items.push({ name: '圣诞星芒灯笼', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_xmas_lantern', previewColor: {} });
        items.push({ name: '复古黑胶书架', category: '墙饰', tier: 'advanced', price: 0, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_vinyl_shelf', previewColor: {} });
        items.push({ name: '寒梅挂窗', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_plum_window', previewColor: {} });
        items.push({ name: '秋日来信', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_autumn_letter', previewColor: {} });
        items.push({ name: '猫猫南瓜灯', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_cat_pumpkin', previewColor: {} });
        items.push({ name: '金丝魔杖', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_magic_wand', previewColor: {} });
        items.push({ name: '星穹探秘', category: '墙饰', tier: 'basic', price: 20, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_solar_system', previewColor: {} });
        items.push({ name: '安睡小猫', category: '墙饰', tier: 'advanced', price: 0, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_sleeping_cat', previewColor: {} });
        items.push({ name: '幻紫捕梦网', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_dreamcatcher', previewColor: {} });
        items.push({ name: '梦幻泡泡', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_cloud_bubbles', previewColor: {} });
        items.push({ name: '四宝爬高高', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_pandas_bamboo', previewColor: {} });
        items.push({ name: '青苹星语', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_apple_chime', previewColor: {} });
        items.push({ name: '烟峦玉韵', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_pipa_hanging', previewColor: {} });
        items.push({ name: '海岛梦境', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_island_dream', previewColor: {} });
        items.push({ name: '红土网球拍挂饰', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_tennis_racket', previewColor: {} });
        items.push({ name: '"一叶艾香"挂饰', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_mugwort_hanger', previewColor: {} });
        items.push({ name: '卡萨花瓶画框', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_casa_vase', previewColor: {} });
        items.push({ name: '烘焙软木板', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_cork_board', previewColor: {} });
        items.push({ name: '青翠竹笛', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_bamboo_flute', previewColor: {} });
        items.push({ name: '趣味涂鸦车轮', category: '墙饰', tier: 'advanced', price: 0, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_graffiti_wheel', previewColor: {} });
        items.push({ name: '春燕衔芳风筝', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_swallow_kite', previewColor: {} });
        items.push({ name: '飞鸟装饰画', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_birds_painting', previewColor: {} });
        items.push({ name: '锦绣红宵灯笼', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_red_lantern', previewColor: {} });
        items.push({ name: '蛇来运转', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_snake_hanger', previewColor: {} });
        items.push({ name: '斩家滑雪板', category: '墙饰', tier: 'advanced', price: 0, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_snowboard', previewColor: {} });
        items.push({ name: '圣诞植物标本', category: '墙饰', tier: 'advanced', price: 298, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_xmas_specimen', previewColor: {} });
        items.push({ name: '暖洋洋的挂架', category: '墙饰', tier: 'advanced', price: 298, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_winter_rack', previewColor: {} });
        items.push({ name: '名画记录框', category: '墙饰', tier: 'advanced', price: 398, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_art_frame', previewColor: {} });
        items.push({ name: '宝藏地图', category: '墙饰', tier: 'advanced', price: 0, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_treasure_map', previewColor: {} });
        items.push({ name: '捣蛋挂画', category: '墙饰', tier: 'advanced', price: 298, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_halloween_frame', previewColor: {} });
        items.push({ name: '壮族绣球', category: '墙饰', tier: 'advanced', price: 198, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_zhuang_ball', previewColor: {} });
        items.push({ name: '古堡魔镜', category: '墙饰', tier: 'advanced', price: 198, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_rose_mirror', previewColor: {} });
        items.push({ name: '千禧挂历', category: '墙饰', tier: 'advanced', price: 198, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_loong_year', previewColor: {} });
        items.push({ name: '乞巧卷轴挂画', category: '墙饰', tier: 'advanced', price: 398, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_qiqiao_scroll', previewColor: {} });
        items.push({ name: '活力运动奖牌', category: '墙饰', tier: 'basic', price: 18, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_sports_medal', previewColor: {} });
        items.push({ name: '西气洋洋风铃', category: '墙饰', tier: 'advanced', price: 198, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_watermelon_chime', previewColor: {} });
        items.push({ name: '行星传说挂画', category: '墙饰', tier: 'advanced', price: 298, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_space_frame', previewColor: {} });
        items.push({ name: '窗外小景壁画', category: '墙饰', tier: 'advanced', price: 0, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_scenic_window', previewColor: {} });
        items.push({ name: '翠林飞弓', category: '墙饰', tier: 'advanced', price: 0, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_elven_bow', previewColor: {} });
        items.push({ name: '郁金香语', category: '墙饰', tier: 'advanced', price: 198, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_tulips_basket', previewColor: {} });
        items.push({ name: '汗水之歌海报', category: '墙饰', tier: 'advanced', price: 188, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_labor_poster', previewColor: {} });
        items.push({ name: '京剧脸谱', category: '墙饰', tier: 'advanced', price: 0, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_opera_mask', previewColor: {} });
        items.push({ name: '花灯照团圆', category: '墙饰', tier: 'advanced', price: 399, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_reunion_lantern', previewColor: {} });
        items.push({ name: '缤纷铃铛花环', category: '墙饰', tier: 'advanced', price: 199, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_xmas_wreath', previewColor: {} });
        items.push({ name: '"续命"小奶茶', category: '墙饰', tier: 'advanced', price: 399, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_cat_milktea', previewColor: {} });
        items.push({ name: '"柿柿"如意', category: '墙饰', tier: 'advanced', price: 399, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_persimmon_hanger', previewColor: {} });
        items.push({ name: '虹光魔法权杖', category: '墙饰', tier: 'advanced', price: 399, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_rainbow_scepter', previewColor: {} });
        items.push({ name: '真飞天小火箭', category: '墙饰', tier: 'advanced', price: 666, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_rocket_frame', previewColor: {} });
        items.push({ name: '势不可挡skate', category: '墙饰', tier: 'advanced', price: 399, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_graffiti_skateboard', previewColor: {} });
        items.push({ name: '摇滚贝斯', category: '墙饰', tier: 'advanced', price: 199, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_rock_guitar', previewColor: {} });
        items.push({ name: '记得打卡挂牌', category: '墙饰', tier: 'advanced', price: 400, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_checkin_reminder', previewColor: {} });
        items.push({ name: '前程似锦卷轴', category: '墙饰', tier: 'advanced', price: 198, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_future_scroll', previewColor: {} });
        items.push({ name: '纸雕风筝', category: '墙饰', tier: 'advanced', price: 300, slotType: 'wall_hanging', gender: 'unisex', imageKey: 'wall_paper_kite', previewColor: {} });

        // Plants (🪴)
        items.push({ name: '多肉小盆栽', category: '绿植', tier: 'basic', price: 300, slotType: 'plant', gender: 'unisex', imageKey: 'plant_succulent', previewColor: meta() });

        // Cabinets (🗄️)
        items.push({ name: '原木收纳柜', category: '柜子', tier: 'basic', price: 1200, slotType: 'cabinet', gender: 'unisex', imageKey: 'furn_cabinet', previewColor: meta() });

        // ==========================================
        // 3. School Badges (校牌)
        // ==========================================
        items.push({ name: '星空流光动态牌', category: '边框', tier: 'legendary', price: 2000, slotType: 'badge_frame', gender: 'unisex', imageKey: 'badge_galaxy', previewColor: meta(4000, undefined, true) });

        // ==========================================
        // 13. Room Environment (房间环境) - 60 items (🏠)
        // ==========================================
        
        // Theme 1: Autumn Field (秋日田野)
        items.push({ name: '树影墙纸', category: '环境', tier: 'advanced', price: 300, slotType: 'wallpaper', gender: 'unisex', imageKey: 'env_autumn_wallpaper', previewColor: meta() });
        items.push({ name: '秋日田野窗景', category: '环境', tier: 'advanced', price: 300, slotType: 'window', gender: 'unisex', imageKey: 'env_autumn_window', previewColor: meta() });
        items.push({ name: '鎏光木柜', category: '环境', tier: 'advanced', price: 300, slotType: 'large_cabinet', gender: 'unisex', imageKey: 'env_autumn_large_cabinet', previewColor: meta() });
        items.push({ name: '金秋绘彩板', category: '环境', tier: 'advanced', price: 300, slotType: 'whiteboard', gender: 'unisex', imageKey: 'env_autumn_whiteboard', previewColor: meta() });
        items.push({ name: '古典花纹地毯', category: '环境', tier: 'advanced', price: 300, slotType: 'carpet', gender: 'unisex', imageKey: 'env_autumn_carpet', previewColor: meta() });
        items.push({ name: '森林蘑菇灯', category: '环境', tier: 'advanced', price: 300, slotType: 'ground_lamp', gender: 'unisex', imageKey: 'env_autumn_ground_lamp', previewColor: meta() });
        items.push({ name: '南瓜小广播', category: '环境', tier: 'advanced', price: 300, slotType: 'broadcaster', gender: 'unisex', imageKey: 'env_autumn_broadcaster', previewColor: meta() });
        items.push({ name: '叶纹茶案', category: '环境', tier: 'advanced', price: 300, slotType: 'cabinet', gender: 'unisex', imageKey: 'env_autumn_cabinet', previewColor: meta() });
        items.push({ name: '流萤秋收灯', category: '环境', tier: 'advanced', price: 300, slotType: 'decoration_floor', gender: 'unisex', imageKey: 'env_autumn_floor_dec', previewColor: meta() });
        items.push({ name: '逐光贴纸', category: '环境', tier: 'advanced', price: 300, slotType: 'decoration_wall', gender: 'unisex', imageKey: 'env_autumn_wall_dec', previewColor: meta() });

        // Theme 2: Bamboo Shadow (竹影墨香)
        items.push({ name: '竹影绿韵墙纸', category: '环境', tier: 'advanced', price: 300, slotType: 'wallpaper', gender: 'unisex', imageKey: 'env_bamboo_wallpaper', previewColor: meta() });
        items.push({ name: '竹影宋韵窗景', category: '环境', tier: 'advanced', price: 300, slotType: 'window', gender: 'unisex', imageKey: 'env_bamboo_window', previewColor: meta() });
        items.push({ name: '墨竹木柜', category: '环境', tier: 'advanced', price: 300, slotType: 'large_cabinet', gender: 'unisex', imageKey: 'env_bamboo_large_cabinet', previewColor: meta() });
        items.push({ name: '夏荷熊猫画板', category: '环境', tier: 'advanced', price: 300, slotType: 'whiteboard', gender: 'unisex', imageKey: 'env_bamboo_whiteboard', previewColor: meta() });
        items.push({ name: '禅意质感地毯', category: '环境', tier: 'advanced', price: 300, slotType: 'carpet', gender: 'unisex', imageKey: 'env_bamboo_carpet', previewColor: meta() });
        items.push({ name: '竹影朦胧立灯', category: '环境', tier: 'advanced', price: 300, slotType: 'ground_lamp', gender: 'unisex', imageKey: 'env_bamboo_ground_lamp', previewColor: meta() });
        items.push({ name: '竹绿悦音广播', category: '环境', tier: 'advanced', price: 300, slotType: 'broadcaster', gender: 'unisex', imageKey: 'env_bamboo_broadcaster', previewColor: meta() });
        items.push({ name: '慵懒一刻躺椅', category: '环境', tier: 'advanced', price: 300, slotType: 'cabinet', gender: 'unisex', imageKey: 'env_bamboo_cabinet', previewColor: meta() });
        items.push({ name: '幽居竹笈', category: '环境', tier: 'advanced', price: 300, slotType: 'decoration_floor', gender: 'unisex', imageKey: 'env_bamboo_floor_dec', previewColor: meta() });
        items.push({ name: '墨宝熊猫贴纸', category: '环境', tier: 'advanced', price: 300, slotType: 'decoration_wall', gender: 'unisex', imageKey: 'env_bamboo_wall_dec', previewColor: meta() });

        // Theme 3: Classical Fortune (中式福满盈云)
        items.push({ name: '中式壁纸', category: '环境', tier: 'advanced', price: 300, slotType: 'wallpaper', gender: 'unisex', imageKey: 'env_fortune_wallpaper', previewColor: meta() });
        items.push({ name: '福韵窗棂', category: '环境', tier: 'advanced', price: 300, slotType: 'window', gender: 'unisex', imageKey: 'env_fortune_window', previewColor: meta() });
        items.push({ name: '檀木博古柜', category: '环境', tier: 'advanced', price: 300, slotType: 'large_cabinet', gender: 'unisex', imageKey: 'env_fortune_large_cabinet', previewColor: meta() });
        items.push({ name: '古典仿窗画板', category: '环境', tier: 'advanced', price: 300, slotType: 'whiteboard', gender: 'unisex', imageKey: 'env_fortune_whiteboard', previewColor: meta() });
        items.push({ name: '福满盈云地毯', category: '环境', tier: 'advanced', price: 300, slotType: 'carpet', gender: 'unisex', imageKey: 'env_fortune_carpet', previewColor: meta() });
        items.push({ name: '精巧走马灯', category: '环境', tier: 'advanced', price: 300, slotType: 'ground_lamp', gender: 'unisex', imageKey: 'env_fortune_ground_lamp', previewColor: meta() });
        items.push({ name: '吉鹤衔瑞环', category: '环境', tier: 'advanced', price: 300, slotType: 'broadcaster', gender: 'unisex', imageKey: 'env_fortune_broadcaster', previewColor: meta() });
        items.push({ name: '岁安秋千', category: '环境', tier: 'advanced', price: 300, slotType: 'cabinet', gender: 'unisex', imageKey: 'env_fortune_cabinet', previewColor: meta() });
        items.push({ name: '好柿层绘屏风', category: '环境', tier: 'advanced', price: 300, slotType: 'decoration_floor', gender: 'unisex', imageKey: 'env_fortune_floor_dec', previewColor: meta() });
        items.push({ name: '古风挂扇', category: '环境', tier: 'advanced', price: 300, slotType: 'decoration_wall', gender: 'unisex', imageKey: 'env_fortune_wall_dec', previewColor: meta() });

        // Theme 4: Gothic Magic (哥特复古魔法)
        items.push({ name: '鎏金暗紫墙纸', category: '环境', tier: 'advanced', price: 300, slotType: 'wallpaper', gender: 'unisex', imageKey: 'env_gothic_wallpaper', previewColor: meta() });
        items.push({ name: '尖拱荆棘花窗', category: '环境', tier: 'advanced', price: 300, slotType: 'window', gender: 'unisex', imageKey: 'env_gothic_window', previewColor: meta() });
        items.push({ name: '圣白穹顶展示柜', category: '环境', tier: 'advanced', price: 300, slotType: 'large_cabinet', gender: 'unisex', imageKey: 'env_gothic_large_cabinet', previewColor: meta() });
        items.push({ name: '精致雕花画板', category: '环境', tier: 'advanced', price: 300, slotType: 'whiteboard', gender: 'unisex', imageKey: 'env_gothic_whiteboard', previewColor: meta() });
        items.push({ name: '哥特复古地毯', category: '环境', tier: 'advanced', price: 300, slotType: 'carpet', gender: 'unisex', imageKey: 'env_gothic_carpet', previewColor: meta() });
        items.push({ name: '夜祷棱纹烛台', category: '环境', tier: 'advanced', price: 300, slotType: 'ground_lamp', gender: 'unisex', imageKey: 'env_gothic_ground_lamp', previewColor: meta() });
        items.push({ name: '花簇夜吟广播', category: '环境', tier: 'advanced', price: 300, slotType: 'broadcaster', gender: 'unisex', imageKey: 'env_gothic_broadcaster', previewColor: meta() });
        items.push({ name: '幽庭象棋摆件', category: '环境', tier: 'advanced', price: 300, slotType: 'cabinet', gender: 'unisex', imageKey: 'env_gothic_cabinet', previewColor: meta() });
        items.push({ name: '神佑罗马柱', category: '环境', tier: 'advanced', price: 300, slotType: 'decoration_floor', gender: 'unisex', imageKey: 'env_gothic_floor_dec', previewColor: meta() });
        items.push({ name: '神秘魔法贴纸', category: '环境', tier: 'advanced', price: 300, slotType: 'decoration_wall', gender: 'unisex', imageKey: 'env_gothic_wall_dec', previewColor: meta() });

        // Theme 5: Sky Castle / Angel (云端梦境 / 星云夏语)
        items.push({ name: '星云夏语壁布', category: '环境', tier: 'advanced', price: 300, slotType: 'wallpaper', gender: 'unisex', imageKey: 'env_sky_wallpaper', previewColor: meta() });
        items.push({ name: '云端城堡绮窗', category: '环境', tier: 'advanced', price: 300, slotType: 'window', gender: 'unisex', imageKey: 'env_sky_window', previewColor: meta() });
        items.push({ name: '流光童话纱柜', category: '环境', tier: 'advanced', price: 300, slotType: 'large_cabinet', gender: 'unisex', imageKey: 'env_sky_large_cabinet', previewColor: meta() });
        items.push({ name: '绮思许愿记事板', category: '环境', tier: 'advanced', price: 300, slotType: 'whiteboard', gender: 'unisex', imageKey: 'env_sky_whiteboard', previewColor: meta() });
        items.push({ name: '云梦花影地毯', category: '环境', tier: 'advanced', price: 300, slotType: 'carpet', gender: 'unisex', imageKey: 'env_sky_carpet', previewColor: meta() });
        items.push({ name: '天使守护摆件', category: '环境', tier: 'advanced', price: 300, slotType: 'ground_lamp', gender: 'unisex', imageKey: 'env_sky_ground_lamp', previewColor: meta() });
        items.push({ name: '八音夜曲音箱', category: '环境', tier: 'advanced', price: 300, slotType: 'broadcaster', gender: 'unisex', imageKey: 'env_sky_broadcaster', previewColor: meta() });
        items.push({ name: '鎏金午后茶歇车', category: '环境', tier: 'advanced', price: 300, slotType: 'cabinet', gender: 'unisex', imageKey: 'env_sky_cabinet', previewColor: meta() });
        items.push({ name: '魔法好运宝盒', category: '环境', tier: 'advanced', price: 300, slotType: 'decoration_floor', gender: 'unisex', imageKey: 'env_sky_floor_dec', previewColor: meta() });
        items.push({ name: '秘境花园贴画集', category: '环境', tier: 'advanced', price: 300, slotType: 'decoration_wall', gender: 'unisex', imageKey: 'env_sky_wall_dec', previewColor: meta() });

        // Theme 6: Spring Garden (春日绿意)
        items.push({ name: '浅绿花絮墙纸', category: '环境', tier: 'advanced', price: 300, slotType: 'wallpaper', gender: 'unisex', imageKey: 'env_spring_wallpaper', previewColor: meta() });
        items.push({ name: '云间花田望景窗', category: '环境', tier: 'advanced', price: 300, slotType: 'window', gender: 'unisex', imageKey: 'env_spring_window', previewColor: meta() });
        items.push({ name: '春日调色花架', category: '环境', tier: 'advanced', price: 300, slotType: 'large_cabinet', gender: 'unisex', imageKey: 'env_spring_large_cabinet', previewColor: meta() });
        items.push({ name: '花蔓春日绘板', category: '环境', tier: 'advanced', price: 300, slotType: 'whiteboard', gender: 'unisex', imageKey: 'env_spring_whiteboard', previewColor: meta() });
        items.push({ name: '花瓣草坪地毯', category: '环境', tier: 'advanced', price: 300, slotType: 'carpet', gender: 'unisex', imageKey: 'env_spring_carpet', previewColor: meta() });
        items.push({ name: '精灵许愿灯', category: '环境', tier: 'advanced', price: 300, slotType: 'ground_lamp', gender: 'unisex', imageKey: 'env_spring_ground_lamp', previewColor: meta() });
        items.push({ name: '苔木花丛小广播', category: '环境', tier: 'advanced', price: 300, slotType: 'broadcaster', gender: 'unisex', imageKey: 'env_spring_broadcaster', previewColor: meta() });
        items.push({ name: '绿意浮雕收纳柜', category: '环境', tier: 'advanced', price: 300, slotType: 'cabinet', gender: 'unisex', imageKey: 'env_spring_cabinet', previewColor: meta() });
        items.push({ name: '猫咪的春日小屋', category: '环境', tier: 'advanced', price: 300, slotType: 'decoration_floor', gender: 'unisex', imageKey: 'env_spring_floor_dec', previewColor: meta() });
        items.push({ name: '春日邮票贴', category: '环境', tier: 'advanced', price: 300, slotType: 'decoration_wall', gender: 'unisex', imageKey: 'env_spring_wall_dec', previewColor: meta() });

        await Promise.all(items.map(item =>
            sql`
                INSERT INTO "ShopItem" ("id", "name", "category", "tier", "price", "imageKey", "slotType", "gender", "previewColor")
                VALUES (${globalThis.crypto.randomUUID()}, ${item.name}, ${item.category}, ${item.tier}, ${item.price}, ${item.imageKey}, ${item.slotType}, ${item.gender}, ${item.previewColor})
            `
        ));

        return NextResponse.json({ success: true, count: items.length }, { headers: V12_FINGERPRINT });
    });
}
