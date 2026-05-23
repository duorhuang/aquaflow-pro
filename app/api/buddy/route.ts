import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const { searchParams } = new URL(request.url);
        const swimmerId = searchParams.get('swimmerId');
        if (!swimmerId) {
            return NextResponse.json({ error: 'Swimmer ID required' }, { status: 400 });
        }

        const sql = getNeon();

        // Fetch all buddy pairs where this swimmer is involved
        const pairs = await sql`
            SELECT * FROM "BuddyPair" 
            WHERE "swimmer1Id" = ${swimmerId} OR "swimmer2Id" = ${swimmerId}
        `;

        // Fetch all swimmers to map details
        const swimmers = await sql`
            SELECT id, name, level, gender, "equippedItems", "totalXp", balance, status 
            FROM "Swimmer"
        `;
        const swimmerMap = swimmers.reduce((acc: any, s: any) => {
            acc[s.id] = s;
            return acc;
        }, {});

        const activeBuddies: any[] = [];
        const pendingReceived: any[] = [];
        const pendingSent: any[] = [];

        pairs.forEach((pair: any) => {
            const isSwimmer1 = pair.swimmer1Id === swimmerId;
            const buddyId = isSwimmer1 ? pair.swimmer2Id : pair.swimmer1Id;
            const buddy = swimmerMap[buddyId];

            if (!buddy) return;

            const enriched = {
                pairId: pair.id,
                status: pair.status,
                createdAt: pair.createdAt,
                buddy
            };

            if (pair.status === 'active') {
                activeBuddies.push(enriched);
            } else if (pair.status === 'pending') {
                // If swimmer1Id is swimmerId, it means swimmerId sent the request
                if (isSwimmer1) {
                    pendingSent.push(enriched);
                } else {
                    pendingReceived.push(enriched);
                }
            }
        });

        // Also return eligible potential buddies (all active swimmers except self and existing partners)
        const partnerIds = new Set(pairs.map((p: any) => p.swimmer1Id === swimmerId ? p.swimmer2Id : p.swimmer1Id));
        partnerIds.add(swimmerId);
        
        const eligibleSwimmers = swimmers.filter((s: any) => !partnerIds.has(s.id) && s.status === 'Active');

        return NextResponse.json({
            activeBuddies,
            pendingReceived,
            pendingSent,
            eligibleSwimmers
        }, { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const data = flattenPayload(await request.json());
        const { action, swimmerId, targetSwimmerId, pairId } = data;

        if (!swimmerId) {
            return NextResponse.json({ error: 'Swimmer ID required' }, { status: 400 });
        }

        const swimmers = await sql`SELECT name FROM "Swimmer" WHERE id = ${swimmerId}`;
        if (swimmers.length === 0) return NextResponse.json({ error: 'Swimmer not found' }, { status: 404 });
        const swimmerName = swimmers[0].name;

        if (action === 'request') {
            if (!targetSwimmerId) return NextResponse.json({ error: 'Target Swimmer ID required' }, { status: 400 });
            if (swimmerId === targetSwimmerId) return NextResponse.json({ error: 'Cannot buddy with yourself' }, { status: 400 });

            // Sort IDs to maintain unique pair constraints
            const [s1, s2] = [swimmerId, targetSwimmerId].sort();

            // Check if pair already exists
            const existing = await sql`
                SELECT * FROM "BuddyPair" 
                WHERE "swimmer1Id" = ${s1} AND "swimmer2Id" = ${s2}
            `;
            if (existing.length > 0) {
                return NextResponse.json({ error: 'Buddy pairing request already exists or is active' }, { status: 400 });
            }

            const id = crypto.randomUUID();
            const pair = await sql`
                INSERT INTO "BuddyPair" ("id", "swimmer1Id", "swimmer2Id", "status", "createdAt", "updatedAt")
                VALUES (${id}, ${s1}, ${s2}, 'pending', NOW(), NOW())
                RETURNING *
            `;

            // Create notification for target Swimmer
            try {
                const feedId = crypto.randomUUID();
                await sql`
                    INSERT INTO "ActivityFeedItem" ("id", "swimmerId", "type", "title", "detail", "isRead", "createdAt")
                    VALUES (
                        ${feedId},
                        ${targetSwimmerId},
                        'buddy_sync',
                        ${`收到死党结对申请`},
                        ${`「${swimmerName}」邀请你成为死党！点击“社交 - 死党”查看并同意。`},
                        false,
                        NOW()
                    )
                `;
            } catch (err) {
                console.error("Failed to post buddy request notification:", err);
            }

            return NextResponse.json({ success: true, pair: pair[0] }, { headers: V12_FINGERPRINT });

        } else if (action === 'accept') {
            if (!pairId) return NextResponse.json({ error: 'Pair ID required' }, { status: 400 });

            const pairs = await sql`SELECT * FROM "BuddyPair" WHERE id = ${pairId}`;
            if (pairs.length === 0) return NextResponse.json({ error: 'Buddy pair not found' }, { status: 404 });
            const pair = pairs[0];

            if (pair.status !== 'pending') {
                return NextResponse.json({ error: 'Pairing is not in pending status' }, { status: 400 });
            }

            const updated = await sql`
                UPDATE "BuddyPair"
                SET "status" = 'active', "updatedAt" = NOW()
                WHERE id = ${pairId}
                RETURNING *
            `;

            const requesterId = pair.swimmer1Id === swimmerId ? pair.swimmer2Id : pair.swimmer1Id;
            const requesters = await sql`SELECT name FROM "Swimmer" WHERE id = ${requesterId}`;
            const requesterName = requesters[0]?.name || '队友';

            // Send notification and award a synchronization start bonus (20 XP) for both!
            try {
                const feedId1 = crypto.randomUUID();
                await sql`
                    INSERT INTO "ActivityFeedItem" ("id", "swimmerId", "type", "title", "detail", "isRead", "createdAt")
                    VALUES (
                        ${feedId1},
                        ${swimmerId},
                        'buddy_sync',
                        '死党结对成功！',
                        ${`你和 ${requesterName} 正式结为死党！同日打卡可获 +20 XP 同步额外奖励。`},
                        false,
                        NOW()
                    )
                `;

                const feedId2 = crypto.randomUUID();
                await sql`
                    INSERT INTO "ActivityFeedItem" ("id", "swimmerId", "type", "title", "detail", "isRead", "createdAt")
                    VALUES (
                        ${feedId2},
                        ${requesterId},
                        'buddy_sync',
                        '死党结对成功！',
                        ${`你和 ${swimmerName} 正式结为死党！同日打卡可获 +20 XP 同步额外奖励。`},
                        false,
                        NOW()
                    )
                `;
            } catch (err) {
                console.error("Failed to post buddy accept notification:", err);
            }

            return NextResponse.json({ success: true, pair: updated[0] }, { headers: V12_FINGERPRINT });

        } else if (action === 'dissolve') {
            if (!pairId) return NextResponse.json({ error: 'Pair ID required' }, { status: 400 });

            await sql`DELETE FROM "BuddyPair" WHERE id = ${pairId}`;
            return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
            
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    });
}
