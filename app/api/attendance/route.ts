import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';
import * as crypto from 'crypto';
import { calculateLevel } from '@/lib/date-utils';


export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const attendance = await sql`
            SELECT "AttendanceRecord".*,
                   row_to_json("Swimmer") as swimmer
            FROM "AttendanceRecord"
            LEFT JOIN "Swimmer" ON "AttendanceRecord"."swimmerId" = "Swimmer"."id"
            ORDER BY "AttendanceRecord"."date" DESC
        `;

        const normalized = (attendance || []).map((a: any) => {
            const swimmer = a.swimmer && Object.keys(a.swimmer).length > 1 ? a.swimmer : null;
            return { ...a, swimmer };
        });

        return NextResponse.json(normalized, { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const data = flattenPayload(await request.json());

        const swimmerId = String(data.swimmerId);
        const checkInDate = String(data.date); // YYYY-MM-DD
        const status = String(data.status || 'Present');
        const timestamp = data.timestamp || new Date().toISOString();

        // 1. Fetch Swimmer
        const swimmers = await sql`SELECT * FROM "Swimmer" WHERE "id" = ${swimmerId}`;
        if (swimmers.length === 0) {
            return NextResponse.json({ error: 'Swimmer not found' }, { status: 404 });
        }
        const swimmer = swimmers[0];

        // 2. Check if already checked in today
        const existing = await sql`
            SELECT * FROM "AttendanceRecord" 
            WHERE "swimmerId" = ${swimmerId} AND "date" = ${checkInDate}
        `;
        if (existing.length > 0) {
            return NextResponse.json({ error: 'Already checked in for today' }, { status: 400 });
        }

        // 3. Check if there is a TrainingPlan for this day and swimmer's group (Training Day vs Rest Day)
        const plans = await sql`
            SELECT * FROM "TrainingPlan" 
            WHERE "group" = ${swimmer.group} AND "date" = ${checkInDate}
        `;
        const isTrainingDay = plans.length > 0;

        // 4. Insert Attendance Record
        const recordId = data.id || crypto.randomUUID();
        const recordResult = await sql`
            INSERT INTO "AttendanceRecord" ("id", "date", "swimmerId", "status", "timestamp", "createdAt")
            VALUES (${recordId}, ${checkInDate}, ${swimmerId}, ${status}, ${timestamp}, NOW())
            RETURNING *
        `;
        const record = recordResult[0];

        if (!isTrainingDay) {
            // It is a Rest Day: no XP rewards, no streak updates, just return
            return NextResponse.json(record, { headers: V12_FINGERPRINT });
        }

        // --- Active Training Day Gamification Flow ---
        let totalXpEarned = 50; // Base XP for training day check-in
        let streakBonus = 0;
        let isBuddySyncAwarded = false;
        let buddyName = '';

        // A. Calculate Streak
        // Fetch all past training plan dates for the swimmer's group up to today's check-in
        const pastPlans = await sql`
            SELECT DISTINCT date FROM "TrainingPlan"
            WHERE "group" = ${swimmer.group} AND "date" <= ${checkInDate}
            ORDER BY "date" DESC
        `;

        // Fetch swimmer's past check-ins
        const swimmerCheckIns = await sql`
            SELECT date FROM "AttendanceRecord"
            WHERE "swimmerId" = ${swimmerId} AND "status" IN ('Present', 'AthletePresent')
        `;
        const checkedDates = new Set(swimmerCheckIns.map(a => a.date));
        checkedDates.add(checkInDate); // Add current check-in

        let newStreak = 0;
        for (const p of pastPlans) {
            if (checkedDates.has(p.date)) {
                newStreak++;
            } else {
                break;
            }
        }

        // B. Calculate Streak Bonus: +10 XP per day starting at 3 days, capped at +50 XP
        if (newStreak >= 3) {
            streakBonus = Math.min(50, (newStreak - 2) * 10);
            totalXpEarned += streakBonus;
        }

        // C. Check Buddy System Synchronized Check-in (+20 XP)
        const buddyPairs = await sql`
            SELECT * FROM "BuddyPair" 
            WHERE "status" = 'active' AND ("swimmer1Id" = ${swimmerId} OR "swimmer2Id" = ${swimmerId})
        `;
        
        if (buddyPairs.length > 0) {
            const pair = buddyPairs[0];
            const buddyId = pair.swimmer1Id === swimmerId ? pair.swimmer2Id : pair.swimmer1Id;

            // Fetch buddy check-in for today
            const buddyCheckIn = await sql`
                SELECT * FROM "AttendanceRecord" 
                WHERE "swimmerId" = ${buddyId} AND "date" = ${checkInDate} AND "status" IN ('Present', 'AthletePresent')
            `;

            if (buddyCheckIn.length > 0) {
                isBuddySyncAwarded = true;
                totalXpEarned += 20;

                // Get buddy details
                const buddies = await sql`SELECT name, "totalXp", balance FROM "Swimmer" WHERE id = ${buddyId}`;
                if (buddies.length > 0) {
                    const buddy = buddies[0];
                    buddyName = buddy.name;

                    // Update Buddy's XP & balance
                    const buddyNewTotalXp = (buddy.totalXp || 0) + 20;
                    const buddyNewBalance = (buddy.balance || 0) + 20;

                    await sql`
                        UPDATE "Swimmer" 
                        SET "totalXp" = ${buddyNewTotalXp}, "balance" = ${buddyNewBalance}, "updatedAt" = NOW()
                        WHERE id = ${buddyId}
                    `;

                    // Create Buddy Transaction
                    const buddyTxId = crypto.randomUUID();
                    await sql`
                        INSERT INTO "XpTransaction" ("id", "swimmerId", "amount", "source", "description", "balanceAfter", "totalXpAfter", "createdAt")
                        VALUES (
                            ${buddyTxId},
                            ${buddyId},
                            20,
                            'buddy',
                            ${`死党同步打卡额外奖励 (${swimmer.name} 已打卡)`},
                            ${buddyNewBalance},
                            ${buddyNewTotalXp},
                            NOW()
                        )
                    `;

                    // Create Buddy Activity Feed Item
                    const buddyFeedId = crypto.randomUUID();
                    await sql`
                        INSERT INTO "ActivityFeedItem" ("id", "swimmerId", "type", "title", "detail", "xpAmount", "isRead", "createdAt")
                        VALUES (
                            ${buddyFeedId},
                            ${buddyId},
                            'buddy_sync',
                            '死党同步打卡奖励！',
                            ${`你和死党 ${swimmer.name} 今天都完成了打卡，额外获得 20 XP！`},
                            20,
                            false,
                            NOW()
                        )
                    `;
                }
            }
        }

        // D. Update Swimmer Experience tracks and currentStreak
        const newTotalXp = (swimmer.totalXp || 0) + totalXpEarned;
        const newBalance = (swimmer.balance || 0) + totalXpEarned;

        const newLevel = calculateLevel(newTotalXp);
        const levelChanged = newLevel > (swimmer.level || 1);

        await sql`
            UPDATE "Swimmer" 
            SET "totalXp" = ${newTotalXp}, 
                "balance" = ${newBalance}, 
                "currentStreak" = ${newStreak},
                "level" = ${newLevel},
                "xp" = ${newTotalXp},
                "updatedAt" = NOW()
            WHERE "id" = ${swimmerId}
        `;

        // E. Create Swimmer XP Transaction
        const txId = crypto.randomUUID();
        await sql`
            INSERT INTO "XpTransaction" ("id", "swimmerId", "amount", "source", "description", "balanceAfter", "totalXpAfter", "createdAt")
            VALUES (
                ${txId},
                ${swimmerId},
                ${totalXpEarned},
                'attendance',
                ${`每日训练打卡 (连胜:${newStreak}天, 包含加成:${streakBonus} XP${isBuddySyncAwarded ? ', 死党加成:20 XP' : ''})`},
                ${newBalance},
                ${newTotalXp},
                NOW()
            )
        `;

        // F. Create Swimmer Activity Feed Item
        const feedId = crypto.randomUUID();
        await sql`
            INSERT INTO "ActivityFeedItem" ("id", "swimmerId", "type", "title", "detail", "xpAmount", "isRead", "createdAt")
            VALUES (
                ${feedId},
                ${swimmerId},
                'xp_earned',
                ${`每日训练打卡 +${totalXpEarned} XP！`},
                ${`基础奖励 50 XP${streakBonus > 0 ? ` + 连胜奖励 ${streakBonus} XP` : ''}${isBuddySyncAwarded ? ` + 死党同步奖励 20 XP (死党:${buddyName})` : ''}。当前连胜已达 ${newStreak} 天！`},
                ${totalXpEarned},
                false,
                NOW()
            )
        `;

        // G. Create level up Activity Feed Item if leveled up
        if (levelChanged) {
            const lvlFeedId = crypto.randomUUID();
            const getTitle = (lvl: number) => {
                if (lvl === 8) return '👑 传奇冠军';
                if (lvl === 7) return '🔱 海神之子';
                if (lvl === 6) return '⚡ 闪电泳者';
                if (lvl === 5) return '🏊 精英泳者';
                if (lvl === 4) return '🦈 资深泳者';
                if (lvl === 3) return '🐬 进阶泳者';
                if (lvl === 2) return '🐟 初级泳者';
                return '🐣 游泳新手';
            };
            await sql`
                INSERT INTO "ActivityFeedItem" ("id", "swimmerId", "type", "title", "detail", "isRead", "createdAt")
                VALUES (
                    ${lvlFeedId},
                    ${swimmerId},
                    'levelup',
                    ${`恭喜你升级到 Lv.${newLevel}！`},
                    ${`解锁新称号: 「${getTitle(newLevel)}」！`},
                    false,
                    NOW()
                )
            `;
        }

        return NextResponse.json(record, { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await sql`DELETE FROM "AttendanceRecord" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
