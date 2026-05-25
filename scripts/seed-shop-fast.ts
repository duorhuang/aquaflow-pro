import { neon } from '@neondatabase/serverless';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                // Remove quotes
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                } else if (value.startsWith("'") && value.endsWith("'")) {
                    value = value.substring(1, value.length - 1);
                }
                process.env[key] = value;
            }
        });
    }
}

loadEnv();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error("❌ DATABASE_URL not set in .env!");
    process.exit(1);
}

const sql = neon(dbUrl);

async function seed() {
    console.log("=== Start Seeding Cartoon Hero & Quizizz Qbit Avatar Items ===");

    // Clear existing
    console.log("1. Clearing existing ShopItem table...");
    await sql`DELETE FROM "ShopItem"`;
    console.log("✓ Table cleared.");

    const items: any[] = [];

    // ==========================================
    // 1. UNISEX / CHEAP UNIVERSAL GEAR (通用基础泳装)
    // ==========================================
    items.push({ name: '基础防风硅胶泳帽', category: '头部', tier: 'basic', price: 100, slotType: 'head', gender: 'unisex', imageKey: 'head_universal_cap' });
    items.push({ name: '基础训练黑框泳镜', category: '眼部', tier: 'basic', price: 150, slotType: 'eyes', gender: 'unisex', imageKey: 'eyes_universal_goggles' });
    items.push({ name: '标准蓝色训练浮板', category: '手持', tier: 'basic', price: 150, slotType: 'hand', gender: 'unisex', imageKey: 'hand_universal_kickboard' });
    items.push({ name: '防滑简约运动拖鞋', category: '脚部', tier: 'basic', price: 120, slotType: 'feet', gender: 'unisex', imageKey: 'feet_universal_slippers' });
    items.push({ name: '简约室内游泳池背景', category: '背景', tier: 'basic', price: 200, slotType: 'background', gender: 'unisex', imageKey: 'bg_universal_pool' });

    // ==========================================
    // 2. PREMIUM SKINS / BASE CHARACTERS (高阶皮肤/预设)
    // ==========================================
    items.push({ name: '【预设】动感超人联名款 · 小新', category: '皮肤', tier: 'ultimate', price: 10000, slotType: 'base', gender: 'shinchan', imageKey: 'skin_shinchan_super' });
    items.push({ name: '【预设】黄金战甲 · 超能小黄人', category: '皮肤', tier: 'legendary', price: 8000, slotType: 'base', gender: 'minion', imageKey: 'skin_minion_gold' });
    items.push({ name: '【预设】五灵王觉醒 · 超级猪猪侠', category: '皮肤', tier: 'ultimate', price: 9000, slotType: 'base', gender: 'ggbond', imageKey: 'skin_ggbond_iron' });
    items.push({ name: '【预设】怪盗基德礼服 · 柯南', category: '皮肤', tier: 'legendary', price: 8000, slotType: 'base', gender: 'conan', imageKey: 'skin_conan_kaito' });
    items.push({ name: '【预设】深海机甲极限装 · 巴克队长', category: '皮肤', tier: 'legendary', price: 7500, slotType: 'base', gender: 'octonauts', imageKey: 'skin_octonauts_mech' });

    // ==========================================
    // 3. ANIME SERIES PRESETS (动漫专属稀有预设 - Summer Drop 专属小人)
    // ==========================================
    items.push({ name: '【预设】草帽小子 · 蒙奇·D·路飞', category: '皮肤', tier: 'ultimate', price: 1000, slotType: 'base', gender: 'shinchan', imageKey: 'skin_anime_luffy' });
    items.push({ name: '【预设】超级赛亚人 · 孙悟空', category: '皮肤', tier: 'ultimate', price: 1000, slotType: 'base', gender: 'shinchan', imageKey: 'skin_anime_goku' });
    items.push({ name: '【预设】木叶之光 · 漩涡鸣人', category: '皮肤', tier: 'ultimate', price: 1000, slotType: 'base', gender: 'shinchan', imageKey: 'skin_anime_naruto' });
    items.push({ name: '【预设】大侦探黑羽 · L', category: '皮肤', tier: 'legendary', price: 1000, slotType: 'base', gender: 'shinchan', imageKey: 'skin_anime_l' });

    // ==========================================
    // 4. QUIZIZZ HIGH-FIDELITY HAT SELECTION (小人头部精选)
    // ==========================================
    items.push({ name: '路飞同款草帽', category: '头部', tier: 'rare', price: 1000, slotType: 'head', gender: 'unisex', imageKey: 'head_anime_luffyhat' });
    items.push({ name: '木叶忍者护额', category: '头部', tier: 'common', price: 675, slotType: 'head', gender: 'unisex', imageKey: 'head_anime_narutoband' });
    items.push({ name: '萌宠柴犬头套', category: '头部', tier: 'rare', price: 3525, slotType: 'head', gender: 'unisex', imageKey: 'head_shiba_inu' });
    items.push({ name: '粉色浪漫花环', category: '头部', tier: 'legendary', price: 5250, slotType: 'head', gender: 'unisex', imageKey: 'head_flower_crown' });
    items.push({ name: '豚骨拉面大碗头饰', category: '头部', tier: 'legendary', price: 4500, slotType: 'head', gender: 'unisex', imageKey: 'head_ramen_bowl' });
    items.push({ name: '经典海盗帽', category: '头部', tier: 'rare', price: 2700, slotType: 'head', gender: 'unisex', imageKey: 'head_pirate_hat' });
    items.push({ name: '蓝色滑雪毛线帽', category: '头部', tier: 'common', price: 825, slotType: 'head', gender: 'unisex', imageKey: 'head_blue_beanie' });

    // ==========================================
    // 5. QUIZIZZ HIGH-FIDELITY CLOTHING / TOPS (小人上装精选)
    // ==========================================
    items.push({ name: '梦幻粉色印花长袖卫衣', category: '身体', tier: 'rare', price: 2500, slotType: 'body', gender: 'unisex', imageKey: 'body_pink_crop' });
    items.push({ name: '经典海军水手短袖', category: '身体', tier: 'rare', price: 3000, slotType: 'body', gender: 'unisex', imageKey: 'body_sailor_shirt' });
    items.push({ name: '浪漫爱心潮流长袖', category: '身体', tier: 'rare', price: 2825, slotType: 'body', gender: 'unisex', imageKey: 'body_hearts_shirt' });
    items.push({ name: '悟空同款龟仙流武道服', category: '身体', tier: 'legendary', price: 2500, slotType: 'body', gender: 'unisex', imageKey: 'body_anime_gokusuit' });
    items.push({ name: '晓组织红云披风', category: '身体', tier: 'common', price: 1500, slotType: 'body', gender: 'unisex', imageKey: 'body_akatsuki_cloak' });
    items.push({ name: '路飞同款敞篷红背心', category: '身体', tier: 'rare', price: 3000, slotType: 'body', gender: 'unisex', imageKey: 'body_anime_luffyshirt' });
    items.push({ name: '金影流光闪电夹克', category: '身体', tier: 'legendary', price: 5250, slotType: 'body', gender: 'unisex', imageKey: 'body_lightning_jacket' });

    // ==========================================
    // 6. QUIZIZZ HIGH-FIDELITY PANTS / BOTTOMS (小人下装精选)
    // ==========================================
    items.push({ name: '烈火燎原运动短裤', category: '下肢', tier: 'legendary', price: 4500, slotType: 'lower', gender: 'unisex', imageKey: 'lower_flame_shorts' });
    items.push({ name: '梦幻紫罗兰双层褶皱裙', category: '下肢', tier: 'legendary', price: 5000, slotType: 'lower', gender: 'unisex', imageKey: 'lower_purple_skirt' });
    items.push({ name: '经典卷边牛仔短裤', category: '下肢', tier: 'common', price: 1200, slotType: 'lower', gender: 'unisex', imageKey: 'lower_anime_luffypants' });
    items.push({ name: '萌宠小恐龙鳞片短裤', category: '下肢', tier: 'rare', price: 3750, slotType: 'lower', gender: 'unisex', imageKey: 'lower_dino_shorts' });
    items.push({ name: '皇家贵族双扣长裤', category: '下肢', tier: 'legendary', price: 4500, slotType: 'lower', gender: 'unisex', imageKey: 'lower_noble_pants' });

    // ==========================================
    // 7. CARTOON CHARACTER SPECS (蜡笔小新/小黄人等原有特定角色道具保留)
    // ==========================================
    items.push({ name: '动感超人头盔泳帽', category: '头部', tier: 'advanced', price: 1200, slotType: 'head', gender: 'shinchan', imageKey: 'head_shinchan_actioncap' });
    items.push({ name: '动感激光防雾泳镜', category: '眼部', tier: 'advanced', price: 1500, slotType: 'eyes', gender: 'shinchan', imageKey: 'eyes_shinchan_actiongoggles' });
    items.push({ name: '动感超人流线型泳衣', category: '身体', tier: 'advanced', price: 2000, slotType: 'body', gender: 'shinchan', imageKey: 'body_shinchan_actionsuit' });
    items.push({ name: '小熊饼干防水速干浮板', category: '手持', tier: 'advanced', price: 1100, slotType: 'hand', gender: 'shinchan', imageKey: 'hand_shinchan_chocobi' });

    items.push({ name: '香蕉立体浮雕泳帽', category: '头部', tier: 'advanced', price: 1200, slotType: 'head', gender: 'minion', imageKey: 'head_minion_bananacap' });
    items.push({ name: '小黄人经典单眼潜水镜', category: '眼部', tier: 'advanced', price: 1500, slotType: 'eyes', gender: 'minion', imageKey: 'eyes_minion_classicgoggles' });
    items.push({ name: '背带裙式竞速防阻水泳装', category: '身体', tier: 'advanced', price: 2000, slotType: 'body', gender: 'minion', imageKey: 'body_minion_overallsuit' });
    items.push({ name: '香蕉型安全游泳圈', category: '手持', tier: 'advanced', price: 1100, slotType: 'hand', gender: 'minion', imageKey: 'hand_minion_bananaring' });

    items.push({ name: '熊出没联名安全帽泳帽', category: '头部', tier: 'advanced', price: 1200, slotType: 'head', gender: 'loggervick', imageKey: 'head_loggervick_hardcap' });
    items.push({ name: '伐木工防滑高弹橡胶脚蹼', category: '脚部', tier: 'advanced', price: 1600, slotType: 'feet', gender: 'loggervick', imageKey: 'feet_loggervick_rubberfeet' });
    items.push({ name: '迷你电锯阻力训练划水掌', category: '手持', tier: 'advanced', price: 1100, slotType: 'hand', gender: 'loggervick', imageKey: 'hand_loggervick_chainsaw' });

    items.push({ name: '五灵锁聚能头盔帽', category: '头部', tier: 'advanced', price: 1200, slotType: 'head', gender: 'ggbond', imageKey: 'head_ggbond_helmet' });
    items.push({ name: '炽热火云流光防雾泳镜', category: '眼部', tier: 'advanced', price: 1500, slotType: 'eyes', gender: 'ggbond', imageKey: 'eyes_ggbond_firegoggles' });
    items.push({ name: '红色披风紧身竞技泳衣', category: '身体', tier: 'advanced', price: 2000, slotType: 'body', gender: 'ggbond', imageKey: 'body_ggbond_capesuit' });
    items.push({ name: '火云铁翼超能强力脚蹼', category: '脚部', tier: 'advanced', price: 1600, slotType: 'feet', gender: 'ggbond', imageKey: 'feet_ggbond_firefeet' });

    items.push({ name: '少年侦探团徽章泳帽', category: '头部', tier: 'advanced', price: 1200, slotType: 'head', gender: 'conan', imageKey: 'head_conan_badgecap' });
    items.push({ name: '追踪型夜视目镜泳镜', category: '眼部', tier: 'advanced', price: 1500, slotType: 'eyes', gender: 'conan', imageKey: 'eyes_conan_scopegoggles' });
    items.push({ name: '涡轮喷射水下助推脚套', category: '脚部', tier: 'advanced', price: 1600, slotType: 'feet', gender: 'conan', imageKey: 'feet_conan_turbofeet' });
    items.push({ name: '麻醉枪防水防寒战术手表', category: '手持', tier: 'advanced', price: 1100, slotType: 'hand', gender: 'conan', imageKey: 'hand_conan_watch' });

    items.push({ name: '蓝色舰长防风保暖泳帽', category: '头部', tier: 'advanced', price: 1200, slotType: 'head', gender: 'octonauts', imageKey: 'head_octonauts_cap' });
    items.push({ name: '章鱼堡全景高清防水镜', category: '眼部', tier: 'advanced', price: 1500, slotType: 'eyes', gender: 'octonauts', imageKey: 'eyes_octonauts_goggles' });
    items.push({ name: '极地防寒速干加厚脚蹼', category: '脚部', tier: 'advanced', price: 1600, slotType: 'feet', gender: 'octonauts', imageKey: 'feet_octonauts_feet' });
    items.push({ name: 'GUP-A艇内嵌水下螺旋桨', category: '手持', tier: 'advanced', price: 1100, slotType: 'hand', gender: 'octonauts', imageKey: 'hand_octonauts_propeller' });

    console.log(`2. Generated ${items.length} curated items. Inserting in batches...`);

    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        console.log(`   Inserting batch ${i / batchSize + 1} of ${Math.ceil(items.length / batchSize)} (${batch.length} items)...`);
        
        await Promise.all(batch.map((item, idx) => {
            const uuid = crypto.randomUUID();
            const sortOrder = i + idx;
            return sql`
                INSERT INTO "ShopItem" ("id", "name", "category", "tier", "price", "imageKey", "slotType", "gender", "sortOrder")
                VALUES (${uuid}, ${item.name}, ${item.category}, ${item.tier}, ${item.price}, ${item.imageKey}, ${item.slotType}, ${item.gender}, ${sortOrder})
            `;
        }));
    }

    console.log("✓ Seeding complete! Database successfully populated with the Quizizz Qbit items.");
}

seed().catch(e => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
});
