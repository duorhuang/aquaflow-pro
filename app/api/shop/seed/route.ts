import { NextResponse } from 'next/server';
import { V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { getNeon } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

export async function POST() {
    return withApiHandler(async () => {
        const sql = getNeon();

        // 1. Clear existing shop items
        await sql`DELETE FROM "ShopItem"`;

        const items: any[] = [];

        // ==========================================
        // 1. UNISEX / CHEAP UNIVERSAL GEAR (通用低价装备)
        // ==========================================
        items.push({ name: '基础防风硅胶泳帽', category: '头部', tier: 'basic', price: 100, slotType: 'head', gender: 'unisex', imageKey: 'head_universal_cap' });
        items.push({ name: '基础训练黑框泳镜', category: '眼部', tier: 'basic', price: 150, slotType: 'eyes', gender: 'unisex', imageKey: 'eyes_universal_goggles' });
        items.push({ name: '标准蓝色训练浮板', category: '手持', tier: 'basic', price: 150, slotType: 'hand', gender: 'unisex', imageKey: 'hand_universal_kickboard' });
        items.push({ name: '防滑简约运动拖鞋', category: '脚部', tier: 'basic', price: 120, slotType: 'feet', gender: 'unisex', imageKey: 'feet_universal_slippers' });
        items.push({ name: '简约室内游泳池背景', category: '背景', tier: 'basic', price: 200, slotType: 'background', gender: 'unisex', imageKey: 'bg_universal_pool' });

        // ==========================================
        // 2. PREMIUM SKINS / BASE CHARACTERS (高阶皮肤/人物)
        // ==========================================
        items.push({ name: '【皮肤】动感超人联名款 · 小新', category: '皮肤', tier: 'ultimate', price: 15000, slotType: 'base', gender: 'shinchan', imageKey: 'skin_shinchan_super' });
        items.push({ name: '【皮肤】黄金战甲 · 超能小黄人', category: '皮肤', tier: 'legendary', price: 12000, slotType: 'base', gender: 'minion', imageKey: 'skin_minion_gold' });
        items.push({ name: '【皮肤】五灵王觉醒 · 超级猪猪侠', category: '皮肤', tier: 'ultimate', price: 15000, slotType: 'base', gender: 'ggbond', imageKey: 'skin_ggbond_iron' });
        items.push({ name: '【皮肤】怪盗基德礼服 · 柯南', category: '皮肤', tier: 'legendary', price: 12000, slotType: 'base', gender: 'conan', imageKey: 'skin_conan_kaito' });
        items.push({ name: '【皮肤】深海机甲极限装 · 巴克队长', category: '皮肤', tier: 'legendary', price: 10000, slotType: 'base', gender: 'octonauts', imageKey: 'skin_octonauts_mech' });

        // ==========================================
        // 3. 蜡笔小新 (shinchan) 专属装备
        // ==========================================
        items.push({ name: '动感超人头盔泳帽', category: '头部', tier: 'advanced', price: 1200, slotType: 'head', gender: 'shinchan', imageKey: 'head_shinchan_actioncap' });
        items.push({ name: '动感激光防雾泳镜', category: '眼部', tier: 'advanced', price: 1500, slotType: 'eyes', gender: 'shinchan', imageKey: 'eyes_shinchan_actiongoggles' });
        items.push({ name: '动感超人流线型泳衣', category: '身体', tier: 'advanced', price: 2000, slotType: 'body', gender: 'shinchan', imageKey: 'body_shinchan_actionsuit' });
        items.push({ name: '小熊饼干防水速干浮板', category: '手持', tier: 'advanced', price: 1100, slotType: 'hand', gender: 'shinchan', imageKey: 'hand_shinchan_chocobi' });

        // ==========================================
        // 4. 小黄人 (minion) 专属装备
        // ==========================================
        items.push({ name: '香蕉立体浮雕泳帽', category: '头部', tier: 'advanced', price: 1200, slotType: 'head', gender: 'minion', imageKey: 'head_minion_bananacap' });
        items.push({ name: '小黄人经典单眼潜水镜', category: '眼部', tier: 'advanced', price: 1500, slotType: 'eyes', gender: 'minion', imageKey: 'eyes_minion_classicgoggles' });
        items.push({ name: '背带裙式竞速防阻水泳装', category: '身体', tier: 'advanced', price: 2000, slotType: 'body', gender: 'minion', imageKey: 'body_minion_overallsuit' });
        items.push({ name: '香蕉型安全游泳圈', category: '手持', tier: 'advanced', price: 1100, slotType: 'hand', gender: 'minion', imageKey: 'hand_minion_bananaring' });

        // ==========================================
        // 5. 光头强 (loggervick) 专属装备
        // ==========================================
        items.push({ name: '熊出没联名安全帽泳帽', category: '头部', tier: 'advanced', price: 1200, slotType: 'head', gender: 'loggervick', imageKey: 'head_loggervick_hardcap' });
        items.push({ name: '伐木工防滑高弹橡胶脚蹼', category: '脚部', tier: 'advanced', price: 1600, slotType: 'feet', gender: 'loggervick', imageKey: 'feet_loggervick_rubberfeet' });
        items.push({ name: '迷你电锯阻力训练划水掌', category: '手持', tier: 'advanced', price: 1100, slotType: 'hand', gender: 'loggervick', imageKey: 'hand_loggervick_chainsaw' });

        // ==========================================
        // 6. 猪猪侠 (ggbond) 专属装备
        // ==========================================
        items.push({ name: '五灵锁聚能头盔帽', category: '头部', tier: 'advanced', price: 1200, slotType: 'head', gender: 'ggbond', imageKey: 'head_ggbond_helmet' });
        items.push({ name: '炽热火云流光防雾泳镜', category: '眼部', tier: 'advanced', price: 1500, slotType: 'eyes', gender: 'ggbond', imageKey: 'eyes_ggbond_firegoggles' });
        items.push({ name: '红色披风紧身竞技泳衣', category: '身体', tier: 'advanced', price: 2000, slotType: 'body', gender: 'ggbond', imageKey: 'body_ggbond_capesuit' });
        items.push({ name: '火云铁翼超能强力脚蹼', category: '脚部', tier: 'advanced', price: 1600, slotType: 'feet', gender: 'ggbond', imageKey: 'feet_ggbond_firefeet' });

        // ==========================================
        // 7. 柯南 (conan) 专属装备
        // ==========================================
        items.push({ name: '少年侦探团徽章泳帽', category: '头部', tier: 'advanced', price: 1200, slotType: 'head', gender: 'conan', imageKey: 'head_conan_badgecap' });
        items.push({ name: '追踪型夜视目镜泳镜', category: '眼部', tier: 'advanced', price: 1500, slotType: 'eyes', gender: 'conan', imageKey: 'eyes_conan_scopegoggles' });
        items.push({ name: '涡轮喷射水下助推脚套', category: '脚部', tier: 'advanced', price: 1600, slotType: 'feet', gender: 'conan', imageKey: 'feet_conan_turbofeet' });
        items.push({ name: '麻醉枪防水防寒战术手表', category: '手持', tier: 'advanced', price: 1100, slotType: 'hand', gender: 'conan', imageKey: 'hand_conan_watch' });

        // ==========================================
        // 8. 巴克队长 (octonauts) 专属装备
        // ==========================================
        items.push({ name: '蓝色舰长防风保暖泳帽', category: '头部', tier: 'advanced', price: 1200, slotType: 'head', gender: 'octonauts', imageKey: 'head_octonauts_cap' });
        items.push({ name: '章鱼堡全景高清防水镜', category: '眼部', tier: 'advanced', price: 1500, slotType: 'eyes', gender: 'octonauts', imageKey: 'eyes_octonauts_goggles' });
        items.push({ name: '极地防寒速干加厚脚蹼', category: '脚部', tier: 'advanced', price: 1600, slotType: 'feet', gender: 'octonauts', imageKey: 'feet_octonauts_feet' });
        items.push({ name: 'GUP-A艇内嵌水下螺旋桨', category: '手持', tier: 'advanced', price: 1100, slotType: 'hand', gender: 'octonauts', imageKey: 'hand_octonauts_propeller' });

        // Batch insert using raw Neon SQL queries
        for (const item of items) {
            await sql`
                INSERT INTO "ShopItem" ("id", "name", "category", "tier", "price", "imageKey", "slotType", "gender")
                VALUES (${crypto.randomUUID()}, ${item.name}, ${item.category}, ${item.tier}, ${item.price}, ${item.imageKey}, ${item.slotType}, ${item.gender})
            `;
        }

        return NextResponse.json({ success: true, count: items.length }, { headers: V12_FINGERPRINT });
    });
}
