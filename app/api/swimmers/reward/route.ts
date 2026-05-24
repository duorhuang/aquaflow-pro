import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireCoach } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

export function calculateLevel(totalXp: number): { level: number, title: string } {
    if (totalXp >= 25000) return { level: 8, title: '👑 传奇冠军' };
    if (totalXp >= 15000) return { level: 7, title: '🔱 海神之子' };
    if (totalXp >= 10000) return { level: 6, title: '⚡ 闪电泳者' };
    if (totalXp >= 6000) return { level: 5, title: '🏊 精英泳者' };
    if (totalXp >= 3500) return { level: 4, title: '🦈 资深泳者' };
    if (totalXp >= 1500) return { level: 3, title: '🐬 进阶泳者' };
    if (totalXp >= 500) return { level: 2, title: '🐟 初级泳者' };
    return { level: 1, title: '🐣 游泳新手' };
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const data = flattenPayload(await request.json());
        const { swimmerId, amount, message } = data;

        if (!swimmerId || !amount || !message) {
            return NextResponse.json({ error: 'Swimmer ID, amount, and message required' }, { status: 400 });
        }

        const xpAmount = Number(amount);
        if (![100, 200, 300, 500].includes(xpAmount)) {
            return NextResponse.json({ error: 'Invalid reward amount. Must be 100, 200, 300, or 500' }, { status: 400 });
        }

        // 1. Fetch swimmer
        const swimmers = await sql`SELECT * FROM "Swimmer" WHERE "id" = ${swimmerId}`;
        if (swimmers.length === 0) {
            return NextResponse.json({ error: 'Swimmer not found' }, { status: 404 });
        }
        const swimmer = swimmers[0];

        // 2. Enforce Coach reward daily limit: Max 3 rewards total per day across all swimmers
        const todayLimitResult = await sql`
            SELECT COUNT(*)::int as count 
            FROM "XpTransaction" 
            WHERE "source" = 'coach_reward' AND "createdAt" >= CURRENT_DATE
        `;
        const todayCount = todayLimitResult[0]?.count || 0;

        if (todayCount >= 3) {
            return NextResponse.json({ error: '今日手动打赏限额已达上限（每日最多打赏 3 人次）' }, { status: 400 });
        }

        // 3. XP calculation & Level recalculation
        const oldTotalXp = swimmer.totalXp || 0;
        const oldBalance = swimmer.balance || 0;
        const oldXp = swimmer.xp || 0;

        const newTotalXp = oldTotalXp + xpAmount;
        const newBalance = oldBalance + xpAmount;
        const newXp = oldXp + xpAmount;
        
        const { level: newLevel, title: newTitle } = calculateLevel(newTotalXp);
        const levelChanged = newLevel > (swimmer.level || 1);

        // 4. Update Swimmer record
        const updatedSwimmer = await sql`
            UPDATE "Swimmer"
            SET "totalXp" = ${newTotalXp}, 
                "balance" = ${newBalance}, 
                "xp" = ${newXp},
                "level" = ${newLevel},
                "updatedAt" = NOW()
            WHERE "id" = ${swimmerId}
            RETURNING *
        `;

        // 5. Create Transaction Entry
        const txId = crypto.randomUUID();
        await sql`
            INSERT INTO "XpTransaction" ("id", "swimmerId", "amount", "source", "description", "balanceAfter", "totalXpAfter", "createdAt")
            VALUES (
                ${txId},
                ${swimmerId},
                ${xpAmount},
                'coach_reward',
                ${`收到教练打赏: "${message}"`},
                ${newBalance},
                ${newTotalXp},
                NOW()
            )
        `;

        // 6. Create Activity Feed Item
        const feedId = crypto.randomUUID();
        await sql`
            INSERT INTO "ActivityFeedItem" ("id", "swimmerId", "type", "title", "detail", "xpAmount", "isRead", "createdAt")
            VALUES (
                ${feedId},
                ${swimmerId},
                'coach_reward',
                ${`教练为你打赏了 ${xpAmount} XP！`},
                ${`“${message}”`},
                ${xpAmount},
                false,
                NOW()
            )
        `;

        // 7. If level increased, create level up Activity Feed Item
        if (levelChanged) {
            const levelFeedId = crypto.randomUUID();
            await sql`
                INSERT INTO "ActivityFeedItem" ("id", "swimmerId", "type", "title", "detail", "isRead", "createdAt")
                VALUES (
                    ${levelFeedId},
                    ${swimmerId},
                    'levelup',
                    ${`恭喜你升级到 Lv.${newLevel}！`},
                    ${`解锁新称号: 「${newTitle}」`},
                    false,
                    NOW()
                )
            `;
        }

        return NextResponse.json({
            success: true,
            swimmer: updatedSwimmer[0],
            newBalance,
            newTotalXp,
            newLevel,
            title: newTitle,
            levelChanged
        }, { headers: V12_FINGERPRINT });
    });
}
