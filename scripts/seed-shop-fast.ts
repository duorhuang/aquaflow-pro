import { neon } from '@neondatabase/serverless';
import * as crypto from 'crypto';

// Load environment variables manually since this is a standalone script
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
    console.log("=== Start Seeding Shop Items (Fast Batch Mode) ===");

    // Clear existing
    console.log("1. Clearing existing ShopItem table...");
    await sql`DELETE FROM "ShopItem"`;
    console.log("✓ Table cleared.");

    const items: any[] = [];

    // --- 1. ULTIMATE TIER (殿堂级) ---
    // Unisex slots
    items.push({ name: '奥运金牌冠军泳帽', category: '头部', tier: 'ultimate', price: 25000, slotType: 'head', gender: 'unisex', imageKey: 'head_olympic_gold' });
    items.push({ name: '深海之瞳·传奇泳镜', category: '眼部', tier: 'ultimate', price: 22000, slotType: 'eyes', gender: 'unisex', imageKey: 'eyes_abyss_legend' });
    items.push({ name: '海神波塞冬·黄金脚蹼', category: '脚部', tier: 'ultimate', price: 18000, slotType: 'feet', gender: 'unisex', imageKey: 'feet_poseidon_gold' });
    items.push({ name: '三叉戟·传奇划水掌', category: '手持', tier: 'ultimate', price: 15000, slotType: 'hand', gender: 'unisex', imageKey: 'hand_trident_legend' });
    items.push({ name: '奥运会决赛标准场馆', category: '背景', tier: 'ultimate', price: 25000, slotType: 'background', gender: 'unisex', imageKey: 'bg_olympic_pool' });
    // Gender exclusive slots
    items.push({ name: '破浪战神·竞速战甲', category: '身体', tier: 'ultimate', price: 25000, slotType: 'body', gender: 'male', imageKey: 'body_champion_male' });
    items.push({ name: '破浪女神·竞速泳衣', category: '身体', tier: 'ultimate', price: 25000, slotType: 'body', gender: 'female', imageKey: 'body_champion_female' });
    items.push({ name: '黑曜石·终极鲨鱼皮泳裤', category: '下肢', tier: 'ultimate', price: 20000, slotType: 'lower', gender: 'male', imageKey: 'lower_sharkskin_male' });
    items.push({ name: '黑曜石·终极竞技泳裙', category: '下肢', tier: 'ultimate', price: 20000, slotType: 'lower', gender: 'female', imageKey: 'lower_sharkskin_female' });

    // --- 2. LEGENDARY TIER (传说级) ---
    // Unisex
    items.push({ name: '火焰纹章泳帽', category: '头部', tier: 'legendary', price: 10000, slotType: 'head', gender: 'unisex', imageKey: 'head_fire_crest' });
    items.push({ name: '冰霜龙鳞泳帽', category: '头部', tier: 'legendary', price: 12000, slotType: 'head', gender: 'unisex', imageKey: 'head_ice_scales' });
    items.push({ name: '极光幻彩泳镜', category: '眼部', tier: 'legendary', price: 9000, slotType: 'eyes', gender: 'unisex', imageKey: 'eyes_aurora' });
    items.push({ name: '暗夜猎手泳镜', category: '眼部', tier: 'legendary', price: 11000, slotType: 'eyes', gender: 'unisex', imageKey: 'eyes_dark_hunter' });
    items.push({ name: '碳纤维专业长脚蹼', category: '脚部', tier: 'legendary', price: 8000, slotType: 'feet', gender: 'unisex', imageKey: 'feet_carbon_long' });
    items.push({ name: '钛金训练短脚蹼', category: '脚部', tier: 'legendary', price: 7000, slotType: 'feet', gender: 'unisex', imageKey: 'feet_titanium_short' });
    items.push({ name: '鲨鱼齿·竞速手蹼', category: '手持', tier: 'legendary', price: 9000, slotType: 'hand', gender: 'unisex', imageKey: 'hand_shark_teeth' });
    items.push({ name: '风暴级水中阻力伞', category: '手持', tier: 'legendary', price: 8000, slotType: 'hand', gender: 'unisex', imageKey: 'hand_storm_parachute' });
    items.push({ name: '世锦赛室内游泳馆', category: '背景', tier: 'legendary', price: 12000, slotType: 'background', gender: 'unisex', imageKey: 'bg_world_championship' });
    items.push({ name: '马尔代夫无边际泳池', category: '背景', tier: 'legendary', price: 10000, slotType: 'background', gender: 'unisex', imageKey: 'bg_maldives_infinity' });
    // Gender exclusive
    items.push({ name: '碳纤维闪电竞速衣', category: '身体', tier: 'legendary', price: 12000, slotType: 'body', gender: 'male', imageKey: 'body_carbon_lightning_male' });
    items.push({ name: '碳纤维流线竞速泳衣', category: '身体', tier: 'legendary', price: 12000, slotType: 'body', gender: 'female', imageKey: 'body_carbon_lightning_female' });
    items.push({ name: '深海迷彩潜行服', category: '身体', tier: 'legendary', price: 10000, slotType: 'body', gender: 'male', imageKey: 'body_deepsea_stealth_male' });
    items.push({ name: '深海姬·防晒连体水母衣', category: '身体', tier: 'legendary', price: 10000, slotType: 'body', gender: 'female', imageKey: 'body_deepsea_stealth_female' });
    items.push({ name: '钛合金强袭竞速泳裤', category: '下肢', tier: 'legendary', price: 9000, slotType: 'lower', gender: 'male', imageKey: 'lower_titanium_male' });
    items.push({ name: '钛金竞速三分泳裙', category: '下肢', tier: 'legendary', price: 9000, slotType: 'lower', gender: 'female', imageKey: 'lower_titanium_female' });
    items.push({ name: '星空银河幻想泳裤', category: '下肢', tier: 'legendary', price: 11000, slotType: 'lower', gender: 'male', imageKey: 'lower_galaxy_male' });
    items.push({ name: '星空银河幻影泳裙', category: '下肢', tier: 'legendary', price: 11000, slotType: 'lower', gender: 'female', imageKey: 'lower_galaxy_female' });

    // --- 3. PREMIUM TIER (高级级) ---
    // Unisex
    items.push({ name: '鲨鱼鳍立体泳帽', category: '头部', tier: 'premium', price: 5500, slotType: 'head', gender: 'unisex', imageKey: 'head_shark_fin' });
    items.push({ name: '虎纹竞技泳帽', category: '头部', tier: 'premium', price: 4500, slotType: 'head', gender: 'unisex', imageKey: 'head_tiger_stripe' });
    items.push({ name: '镭射反光泳帽', category: '头部', tier: 'premium', price: 6000, slotType: 'head', gender: 'unisex', imageKey: 'head_laser_reflection' });
    items.push({ name: '防雾镜面竞速泳镜', category: '眼部', tier: 'premium', price: 5000, slotType: 'eyes', gender: 'unisex', imageKey: 'eyes_antifog_mirror' });
    items.push({ name: '偏光蓝海泳镜', category: '眼部', tier: 'premium', price: 4000, slotType: 'eyes', gender: 'unisex', imageKey: 'eyes_polarized_blue' });
    items.push({ name: '夜视荧光泳镜', category: '眼部', tier: 'premium', price: 5500, slotType: 'eyes', gender: 'unisex', imageKey: 'eyes_night_fluorescent' });
    items.push({ name: '专业训练中脚蹼', category: '脚部', tier: 'premium', price: 4500, slotType: 'feet', gender: 'unisex', imageKey: 'feet_pro_medium' });
    items.push({ name: '蛙泳专用橡胶脚鞋', category: '脚部', tier: 'premium', price: 5000, slotType: 'feet', gender: 'unisex', imageKey: 'feet_breaststroke_shoes' });
    items.push({ name: '流线型单片海豚蹼', category: '脚部', tier: 'premium', price: 6000, slotType: 'feet', gender: 'unisex', imageKey: 'feet_monofin' });
    items.push({ name: '专业竞速树脂手蹼', category: '手持', tier: 'premium', price: 4000, slotType: 'hand', gender: 'unisex', imageKey: 'hand_pro_resin' });
    items.push({ name: '中央式呼吸训练管', category: '手持', tier: 'premium', price: 5500, slotType: 'hand', gender: 'unisex', imageKey: 'hand_snorkel_center' });
    items.push({ name: '8字拉力绳训练器', category: '手持', tier: 'premium', price: 3500, slotType: 'hand', gender: 'unisex', imageKey: 'hand_stretch_band' });
    items.push({ name: '国家队封闭训练基地', category: '背景', tier: 'premium', price: 5000, slotType: 'background', gender: 'unisex', imageKey: 'bg_national_base' });
    items.push({ name: '夕阳海滨露天泳池', category: '背景', tier: 'premium', price: 4500, slotType: 'background', gender: 'unisex', imageKey: 'bg_sunset_beach' });
    items.push({ name: '大学校队50米标准池', category: '背景', tier: 'premium', price: 3500, slotType: 'background', gender: 'unisex', imageKey: 'bg_university_pool' });
    // Gender exclusive
    items.push({ name: '流线型半身竞速衣', category: '身体', tier: 'premium', price: 6000, slotType: 'body', gender: 'male', imageKey: 'body_streamline_male' });
    items.push({ name: '流线连体半袖泳衣', category: '身体', tier: 'premium', price: 6000, slotType: 'body', gender: 'female', imageKey: 'body_streamline_female' });
    items.push({ name: '队长专属力量背心', category: '身体', tier: 'premium', price: 4500, slotType: 'body', gender: 'male', imageKey: 'body_captain_vest_male' });
    items.push({ name: '队长专属训练短背心', category: '身体', tier: 'premium', price: 4500, slotType: 'body', gender: 'female', imageKey: 'body_captain_vest_female' });
    items.push({ name: '热带雨林抗阻水母衣', category: '身体', tier: 'premium', price: 5000, slotType: 'body', gender: 'male', imageKey: 'body_rainforest_male' });
    items.push({ name: '热带雨林连体式防晒衣', category: '身体', tier: 'premium', price: 5000, slotType: 'body', gender: 'female', imageKey: 'body_rainforest_female' });
    items.push({ name: '职业选手及膝专业泳裤', category: '下肢', tier: 'premium', price: 5000, slotType: 'lower', gender: 'male', imageKey: 'lower_pro_kneelength_male' });
    items.push({ name: '职业选手分体及膝泳裤', category: '下肢', tier: 'premium', price: 5000, slotType: 'lower', gender: 'female', imageKey: 'lower_pro_kneelength_female' });
    items.push({ name: '闪电条纹速干泳裤', category: '下肢', tier: 'premium', price: 4000, slotType: 'lower', gender: 'male', imageKey: 'lower_lightning_stripe_male' });
    items.push({ name: '闪电条纹拼接泳裙', category: '下肢', tier: 'premium', price: 4000, slotType: 'lower', gender: 'female', imageKey: 'lower_lightning_stripe_female' });
    items.push({ name: '数码像素迷彩泳裤', category: '下肢', tier: 'premium', price: 3500, slotType: 'lower', gender: 'male', imageKey: 'lower_digital_camo_male' });
    items.push({ name: '数码像素迷彩三分短裤', category: '下肢', tier: 'premium', price: 3500, slotType: 'lower', gender: 'female', imageKey: 'lower_digital_camo_female' });

    // --- 4. ADVANCED TIER (进阶级) ---
    const categories = ['head', 'eyes', 'feet', 'hand', 'background'];
    const advancedUnisexNames: Record<string, string[]> = {
        head: ['渐变日落泳帽', '国旗主题泳帽', '碎花防水泳帽', '队徽定制泳帽', '金属光泽泳帽'],
        eyes: ['大框全景泳镜', '彩虹镀膜泳镜', '近视度数泳镜', '复古圆框泳镜', '水滴流线泳镜'],
        feet: ['硅胶训练短蹼', '泳池防滑软底鞋', '彩色高弹力脚蹼', '弹力锁扣脚蹼', '便携旅游长蹼'],
        hand: ['初级阻力划水掌', '指套型划水指套', '轻便海绵浮板', '侧呼吸呼吸管', '夹腿浮漂 (Pull Buoy)'],
        background: ['标准25米室内泳池', '阳光社区露天泳池', '热带度假村大泳池', '学校旧训练馆', '早晨薄雾室外池']
    };
    const categoryLabels: Record<string, string> = { head: '头部', eyes: '眼部', feet: '脚部', hand: '手持', background: '背景' };

    for (const slot of categories) {
        const names = advancedUnisexNames[slot];
        names.forEach((name, i) => {
            items.push({ name, category: categoryLabels[slot], tier: 'advanced', price: 1500 + i * 300, slotType: slot, gender: 'unisex', imageKey: `adv_${slot}_${i}` });
        });
    }

    const advMaleBody = ['条纹训练防晒衣', '防晒长袖水母上衣', '运动拼色紧身衣', '速干压缩训练背心', '海浪印花浮力背心'];
    const advFemaleBody = ['条纹复古连体泳衣', '长袖防晒连体水母衣', '拼色专业运动泳衣', '速干压缩竞速泳裙', '海浪印花抹胸泳衣'];
    const advMaleLower = ['及膝阻力训练泳裤', '撞色侧边运动泳裤', '侧线高弹力五分泳裤', '波浪纹速干沙滩裤', '深蓝竞技三角泳裤'];
    const advFemaleLower = ['及膝修身平角泳裤', '撞色运动包臀裙裤', '侧双拼色高腰裙裤', '海浪花褶连体短裙', '深蓝低阻包臀泳裤'];

    advMaleBody.forEach((name, i) => items.push({ name, category: '身体', tier: 'advanced', price: 1800 + i * 300, slotType: 'body', gender: 'male', imageKey: `adv_body_m_${i}` }));
    advFemaleBody.forEach((name, i) => items.push({ name, category: '身体', tier: 'advanced', price: 1800 + i * 300, slotType: 'body', gender: 'female', imageKey: `adv_body_f_${i}` }));
    advMaleLower.forEach((name, i) => items.push({ name, category: '下肢', tier: 'advanced', price: 1500 + i * 350, slotType: 'lower', gender: 'male', imageKey: `adv_lower_m_${i}` }));
    advFemaleLower.forEach((name, i) => items.push({ name, category: '下肢', tier: 'advanced', price: 1500 + i * 350, slotType: 'lower', gender: 'female', imageKey: `adv_lower_f_${i}` }));

    // --- 5. ENTRY TIER (入门级) ---
    const entryUnisexNames: Record<string, string[]> = {
        head: ['天蓝色硅胶泳帽', '珊瑚粉硅胶泳帽', '薄荷绿硅胶泳帽', '柠檬黄硅胶泳帽', '紫罗兰硅胶泳帽', '橙色活力泳帽', '军绿迷彩泳帽'],
        eyes: ['蓝色透明泳镜', '粉色少女泳镜', '灰色烟熏泳镜', '绿色清新泳镜', '紫色神秘泳镜', '橙色活力泳镜', '银色镜面泳镜'],
        feet: ['蓝色基础拖鞋', '黑色泳池拖鞋', '粉色少女拖鞋', '绿色环保拖鞋', '红色运动拖鞋', '灰色简约拖鞋', '彩虹条纹拖鞋'],
        hand: ['蓝色小浮板', '粉色小浮板', '绿色小浮板', '黄色小浮板', '透明运动水壶', '蓝色简易防水袋', '红色印花防水袋'],
        background: ['蓝天白云户外池', '黄昏暖光小区池', '简约室内训练池', '绿荫下的小水池', '星空下的露天池', '清晨薄雾泳池', '儿童戏水彩虹池']
    };
    for (const slot of categories) {
        const names = entryUnisexNames[slot];
        names.forEach((name, i) => {
            items.push({ name, category: categoryLabels[slot], tier: 'entry', price: 500 + i * 100, slotType: slot, gender: 'unisex', imageKey: `entry_${slot}_${i}` });
        });
    }

    const entryMaleBody = ['蓝白横条纹长袖衣', '纯深蓝速干背心', '灰色运动短袖衣', '绿色清新半袖衣', '红色热血紧身衣', '黑白撞色吸汗衫', '浅蓝清爽防晒衫'];
    const entryFemaleBody = ['蓝白横条纹裙装', '纯深蓝连体泳衣', '灰色运动比基尼', '绿色清新平角裙', '红色热血拉链泳衣', '黑白双拼性感泳装', '浅蓝清爽抹胸泳衣'];
    const entryMaleLower = ['蓝色经典运动五分裤', '黑色极简三角泳裤', '灰色条纹平角裤', '藏青纯色平角裤', '红色热力冲浪短裤', '双拼色阻力五分裤', '薄荷绿休闲短泳裤'];
    const entryFemaleLower = ['蓝色极简防走光裙裤', '黑色极简连体打底裙', '灰色条纹三分短裤', '藏青双层防走光裙', '红色热力绑带褶皱裙', '拼色高腰包臀三分裤', '薄荷绿百褶运动泳裙'];

    entryMaleBody.forEach((name, i) => items.push({ name, category: '身体', tier: 'entry', price: 600 + i * 100, slotType: 'body', gender: 'male', imageKey: `entry_body_m_${i}` }));
    entryFemaleBody.forEach((name, i) => items.push({ name, category: '身体', tier: 'entry', price: 600 + i * 100, slotType: 'body', gender: 'female', imageKey: `entry_body_f_${i}` }));
    entryMaleLower.forEach((name, i) => items.push({ name, category: '下肢', tier: 'entry', price: 500 + i * 100, slotType: 'lower', gender: 'male', imageKey: `entry_lower_m_${i}` }));
    entryFemaleLower.forEach((name, i) => items.push({ name, category: '下肢', tier: 'entry', price: 500 + i * 100, slotType: 'lower', gender: 'female', imageKey: `entry_lower_f_${i}` }));

    // --- 6. BASIC TIER (白菜级) ---
    const colors = ['白', '黑', '蓝', '红', '灰', '绿', '粉', '黄', '橙', '紫', '棕'];
    colors.forEach((col, i) => {
        items.push({ name: `${col}色素泳帽`, category: '头部', tier: 'basic', price: 100 + i * 15, slotType: 'head', gender: 'unisex', imageKey: `basic_head_${i}` });
        items.push({ name: `${col}框基础泳镜`, category: '眼部', tier: 'basic', price: 100 + i * 20, slotType: 'eyes', gender: 'unisex', imageKey: `basic_eyes_${i}` });
        items.push({ name: `${col}色基础拖鞋`, category: '脚部', tier: 'basic', price: 100 + i * 15, slotType: 'feet', gender: 'unisex', imageKey: `basic_feet_${i}` });
    });

    const basicHandNames = ['白色迷你浮板', '蓝色迷你浮板', '粉色迷你浮板', '绿色迷你浮板', '红色迷你浮板', '黄色迷你浮板', '橙色迷你浮板', '塑料运动水杯', '白色吸水毛巾', '蓝色速干毛巾'];
    basicHandNames.forEach((name, i) => {
        items.push({ name, category: '手持', tier: 'basic', price: 100 + i * 15, slotType: 'hand', gender: 'unisex', imageKey: `basic_hand_${i}` });
    });

    const basicBgNames = ['白色纯色背景', '浅蓝水波背景', '草地旁小水池', '阳光黄金沙滩', '深蓝纯色背景', '水下气泡背景', '清澈浅水背景', '雨天打伞池畔', '小区标准背景', '简易水彩背景'];
    basicBgNames.forEach((name, i) => {
        items.push({ name, category: '背景', tier: 'basic', price: 100 + i * 20, slotType: 'background', gender: 'unisex', imageKey: `basic_bg_${i}` });
    });

    const basicMaleBody = colors.map(col => `${col}色阻力训练衣`);
    const basicFemaleBody = colors.map(col => `${col}色素雅连体泳衣`);
    const basicMaleLower = colors.map(col => `${col}色普通五分裤`);
    const basicFemaleLower = colors.map(col => `${col}色双层安全裤裙`);

    basicMaleBody.forEach((name, i) => items.push({ name, category: '身体', tier: 'basic', price: 100 + i * 15, slotType: 'body', gender: 'male', imageKey: `basic_body_m_${i}` }));
    basicFemaleBody.forEach((name, i) => items.push({ name, category: '身体', tier: 'basic', price: 100 + i * 15, slotType: 'body', gender: 'female', imageKey: `basic_body_f_${i}` }));
    basicMaleLower.forEach((name, i) => items.push({ name, category: '下肢', tier: 'basic', price: 100 + i * 15, slotType: 'lower', gender: 'male', imageKey: `basic_lower_m_${i}` }));
    basicFemaleLower.forEach((name, i) => items.push({ name, category: '下肢', tier: 'basic', price: 100 + i * 15, slotType: 'lower', gender: 'female', imageKey: `basic_lower_f_${i}` }));

    console.log(`2. Generated ${items.length} items. Inserting...`);

    // Insert in batches of 40 to avoid any Neon transaction sizes/limits
    const batchSize = 40;
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        console.log(`   Inserting batch ${i / batchSize + 1} of ${Math.ceil(items.length / batchSize)} (${batch.length} items)...`);
        
        await Promise.all(batch.map(item => {
            const uuid = crypto.randomUUID();
            return sql`
                INSERT INTO "ShopItem" ("id", "name", "category", "tier", "price", "imageKey", "slotType", "gender")
                VALUES (${uuid}, ${item.name}, ${item.category}, ${item.tier}, ${item.price}, ${item.imageKey}, ${item.slotType}, ${item.gender})
            `;
        }));
    }

    console.log("✓ Seeding complete! Database successfully populated.");
}

seed().catch(e => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
});
