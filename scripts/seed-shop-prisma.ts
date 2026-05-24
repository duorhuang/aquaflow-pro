import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
    console.log("=== Start Seeding Shop Items via Prisma Client (Curated Set) ===");

    // Clear existing
    console.log("1. Clearing existing ShopItem table...");
    const deleted = await prisma.shopItem.deleteMany({});
    console.log(`✓ Deleted ${deleted.count} existing items.`);

    const items: any[] = [];

    // --- 1. BASIC TIER (白菜档) - 基础队服 ---
    items.push({ name: '纯色基础泳帽', category: '头部', tier: 'basic', price: 100, slotType: 'head', gender: 'unisex', imageKey: 'head_basic_cap' });
    items.push({ name: '基础黑框泳镜', category: '眼部', tier: 'basic', price: 150, slotType: 'eyes', gender: 'unisex', imageKey: 'eyes_basic_goggles' });
    items.push({ name: '深蓝基础训练背心', category: '身体', tier: 'basic', price: 200, slotType: 'body', gender: 'male', imageKey: 'body_basic_male' });
    items.push({ name: '深蓝基础连体泳衣', category: '身体', tier: 'basic', price: 200, slotType: 'body', gender: 'female', imageKey: 'body_basic_female' });
    items.push({ name: '深蓝基础平角泳裤', category: '下肢', tier: 'basic', price: 180, slotType: 'lower', gender: 'male', imageKey: 'lower_basic_male' });
    items.push({ name: '深蓝基础防走光裙', category: '下肢', tier: 'basic', price: 180, slotType: 'lower', gender: 'female', imageKey: 'lower_basic_female' });
    items.push({ name: '标准蓝色小浮板', category: '手持', tier: 'basic', price: 150, slotType: 'hand', gender: 'unisex', imageKey: 'hand_basic_kickboard' });
    items.push({ name: '室内基础训练池', category: '背景', tier: 'basic', price: 250, slotType: 'background', gender: 'unisex', imageKey: 'bg_basic_pool' });

    // --- 2. ENTRY TIER (入门档) - 进阶训练 ---
    items.push({ name: '破浪条纹训练泳帽', category: '头部', tier: 'entry', price: 400, slotType: 'head', gender: 'unisex', imageKey: 'head_entry_stripe' });
    items.push({ name: '炫彩蓝防雾泳镜', category: '眼部', tier: 'entry', price: 500, slotType: 'eyes', gender: 'unisex', imageKey: 'eyes_entry_color' });
    items.push({ name: '侧边拼色专业半袖', category: '身体', tier: 'entry', price: 600, slotType: 'body', gender: 'male', imageKey: 'body_entry_male' });
    items.push({ name: '竞速交叉背带泳衣', category: '身体', tier: 'entry', price: 600, slotType: 'body', gender: 'female', imageKey: 'body_entry_female' });
    items.push({ name: '侧边拼色及膝泳裤', category: '下肢', tier: 'entry', price: 550, slotType: 'lower', gender: 'male', imageKey: 'lower_entry_male' });
    items.push({ name: '高腰运动三分泳裤', category: '下肢', tier: 'entry', price: 550, slotType: 'lower', gender: 'female', imageKey: 'lower_entry_female' });
    items.push({ name: '硅胶训练短脚蹼', category: '脚部', tier: 'entry', price: 450, slotType: 'feet', gender: 'unisex', imageKey: 'feet_entry_short' });
    items.push({ name: '8字拉力训练绳', category: '手持', tier: 'entry', price: 350, slotType: 'hand', gender: 'unisex', imageKey: 'hand_entry_band' });
    items.push({ name: '阳光明媚户外池', category: '背景', tier: 'entry', price: 650, slotType: 'background', gender: 'unisex', imageKey: 'bg_entry_outdoor' });

    // --- 3. ADVANCED TIER (进阶档) - 碳纤维专业竞速 ---
    items.push({ name: '全覆式碳纤维网格泳帽', category: '头部', tier: 'advanced', price: 1200, slotType: 'head', gender: 'unisex', imageKey: 'head_adv_carbon' });
    items.push({ name: '一体式水银镀膜反光镜', category: '眼部', tier: 'advanced', price: 1500, slotType: 'eyes', gender: 'unisex', imageKey: 'eyes_adv_mirror' });
    items.push({ name: '鲨鱼皮仿生半身衣', category: '身体', tier: 'advanced', price: 2000, slotType: 'body', gender: 'male', imageKey: 'body_adv_shark_male' });
    items.push({ name: '鲨鱼皮流线连体衣', category: '身体', tier: 'advanced', price: 2000, slotType: 'body', gender: 'female', imageKey: 'body_adv_shark_female' });
    items.push({ name: '超低阻力高弹及膝裤', category: '下肢', tier: 'advanced', price: 1800, slotType: 'lower', gender: 'male', imageKey: 'lower_adv_shark_male' });
    items.push({ name: '超低阻力平角裙衣', category: '下肢', tier: 'advanced', price: 1800, slotType: 'lower', gender: 'female', imageKey: 'lower_adv_shark_female' });
    items.push({ name: '导流槽碳纤维长蹼', category: '脚部', tier: 'advanced', price: 1600, slotType: 'feet', gender: 'unisex', imageKey: 'feet_adv_long' });
    items.push({ name: '专业竞速树脂手蹼', category: '手持', tier: 'advanced', price: 1100, slotType: 'hand', gender: 'unisex', imageKey: 'hand_adv_paddles' });
    items.push({ name: '世锦赛50米标准赛道', category: '背景', tier: 'advanced', price: 2500, slotType: 'background', gender: 'unisex', imageKey: 'bg_adv_championship' });

    // --- 4. PREMIUM TIER (高级档) - 赛博朋克科技 ---
    items.push({ name: '全息霓虹能量头盔', category: '头部', tier: 'premium', price: 5000, slotType: 'head', gender: 'unisex', imageKey: 'head_prem_cyber' });
    items.push({ name: '全息数据面甲战术目镜', category: '眼部', tier: 'premium', price: 6000, slotType: 'eyes', gender: 'unisex', imageKey: 'eyes_prem_visor' });
    items.push({ name: '深渊黑客发光脉冲服', category: '身体', tier: 'premium', price: 8000, slotType: 'body', gender: 'male', imageKey: 'body_prem_cyber_male' });
    items.push({ name: '深渊黑客修身战甲', category: '身体', tier: 'premium', price: 8000, slotType: 'body', gender: 'female', imageKey: 'body_prem_cyber_female' });
    items.push({ name: '脉冲供能悬浮泳裤', category: '下肢', tier: 'premium', price: 7500, slotType: 'lower', gender: 'male', imageKey: 'lower_prem_cyber_male' });
    items.push({ name: '脉冲供能光效短裙', category: '下肢', tier: 'premium', price: 7500, slotType: 'lower', gender: 'female', imageKey: 'lower_prem_cyber_female' });
    items.push({ name: '等离子推进器脚蹼', category: '脚部', tier: 'premium', price: 7000, slotType: 'feet', gender: 'unisex', imageKey: 'feet_prem_thruster' });
    items.push({ name: '电磁牵引超频呼吸管', category: '手持', tier: 'premium', price: 4500, slotType: 'hand', gender: 'unisex', imageKey: 'hand_prem_tube' });
    items.push({ name: '深海科研基地空间站', category: '背景', tier: 'premium', price: 9000, slotType: 'background', gender: 'unisex', imageKey: 'bg_prem_scifi' });

    // --- 5. ULTIMATE TIER (殿堂档) - 亚特兰蒂斯神话 ---
    items.push({ name: '流光圣洁黄金桂冠', category: '头部', tier: 'ultimate', price: 15000, slotType: 'head', gender: 'unisex', imageKey: 'head_ult_crown' });
    items.push({ name: '极光闪耀之神明瞳', category: '眼部', tier: 'ultimate', price: 18000, slotType: 'eyes', gender: 'unisex', imageKey: 'eyes_ult_aurora' });
    items.push({ name: '海神波塞冬纯金圣衣', category: '身体', tier: 'ultimate', price: 25000, slotType: 'body', gender: 'male', imageKey: 'body_ult_god_male' });
    items.push({ name: '雅典娜光辉水晶战甲', category: '身体', tier: 'ultimate', price: 25000, slotType: 'body', gender: 'female', imageKey: 'body_ult_goddess_female' });
    items.push({ name: '神话龙鳞流光战裙', category: '下肢', tier: 'ultimate', price: 22000, slotType: 'lower', gender: 'male', imageKey: 'lower_ult_god_male' });
    items.push({ name: '美人鱼幻彩水晶裙', category: '下肢', tier: 'ultimate', price: 22000, slotType: 'lower', gender: 'female', imageKey: 'lower_ult_goddess_female' });
    items.push({ name: '海妖之歌巨大单片尾蹼', category: '脚部', tier: 'ultimate', price: 20000, slotType: 'feet', gender: 'unisex', imageKey: 'feet_ult_mermaid' });
    items.push({ name: '海洋霸权纯金三叉戟', category: '手持', tier: 'ultimate', price: 18000, slotType: 'hand', gender: 'unisex', imageKey: 'hand_ult_trident' });
    items.push({ name: '失落的亚特兰蒂斯神殿', category: '背景', tier: 'ultimate', price: 30000, slotType: 'background', gender: 'unisex', imageKey: 'bg_ult_atlantis' });

    console.log(`2. Generated ${items.length} curated items. Bulk inserting via Prisma...`);

    // Bulk insert using createMany
    const created = await prisma.shopItem.createMany({
        data: items.map((x, index) => ({
            name: x.name,
            category: x.category,
            tier: x.tier,
            price: x.price,
            imageKey: x.imageKey,
            slotType: x.slotType,
            gender: x.gender,
            sortOrder: index
        }))
    });

    console.log(`✓ Seeding complete! Inserted ${created.count} shop items successfully.`);
}

seed()
    .catch(e => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
