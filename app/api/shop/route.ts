import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const { searchParams } = new URL(request.url);
        const swimmerId = searchParams.get('swimmerId');

        const sql = getNeon();

        // 1. Fetch all items
        const allItems = await sql`SELECT * FROM "ShopItem" ORDER BY "price" ASC`;

        if (!swimmerId) {
            // No swimmer ID, just return all items (e.g. for coach)
            return NextResponse.json({
                items: allItems,
                balance: 0,
                inventory: [],
                equippedItems: {},
                wishlist: []
            }, { headers: V12_FINGERPRINT });
        }

        // 2. Fetch the Swimmer
        const swimmers = await sql`SELECT * FROM "Swimmer" WHERE "id" = ${swimmerId}`;
        if (swimmers.length === 0) {
            return NextResponse.json({ error: 'Swimmer not found' }, { status: 404 });
        }
        const swimmer = swimmers[0];

        // 3. Filter items by gender
        const gender = swimmer.gender || 'male'; // Default male if not chosen yet
        const filteredItems = allItems.filter((item: any) => {
            // Unisex slots or unisex items are always visible
            if (item.gender === 'unisex') return true;
            // Exclusive slot items are filtered by swimmer gender
            return item.gender === gender;
        });

        // Parse JSON fields
        let inventory: string[] = [];
        try {
            inventory = typeof swimmer.inventory === 'string'
                ? JSON.parse(swimmer.inventory)
                : (swimmer.inventory || []);
        } catch {
            inventory = [];
        }

        let equippedItems: any = {};
        try {
            equippedItems = typeof swimmer.equippedItems === 'string'
                ? JSON.parse(swimmer.equippedItems)
                : (swimmer.equippedItems || {});
        } catch {
            equippedItems = {};
        }

        let wishlist: string[] = [];
        try {
            wishlist = typeof swimmer.wishlist === 'string'
                ? JSON.parse(swimmer.wishlist)
                : (swimmer.wishlist || []);
        } catch {
            wishlist = [];
        }

        return NextResponse.json({
            items: filteredItems,
            balance: swimmer.balance || 0,
            totalXp: swimmer.totalXp || 0,
            inventory,
            equippedItems,
            wishlist
        }, { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const data = flattenPayload(await request.json());
        const { action, swimmerId, itemId, equipped } = data;

        if (!swimmerId) {
            return NextResponse.json({ error: 'Swimmer ID required' }, { status: 400 });
        }

        // 1. Fetch Swimmer
        const swimmers = await sql`SELECT * FROM "Swimmer" WHERE "id" = ${swimmerId}`;
        if (swimmers.length === 0) {
            return NextResponse.json({ error: 'Swimmer not found' }, { status: 404 });
        }
        const swimmer = swimmers[0];

        // Helper to parse lists
        const parseArray = (val: any): string[] => {
            try {
                if (!val) return [];
                return typeof val === 'string' ? JSON.parse(val) : val;
            } catch {
                return [];
            }
        };

        const parseObject = (val: any): any => {
            try {
                if (!val) return {};
                return typeof val === 'string' ? JSON.parse(val) : val;
            } catch {
                return {};
            }
        };

        const inventory = parseArray(swimmer.inventory);
        const wishlist = parseArray(swimmer.wishlist);
        const equippedItems = parseObject(swimmer.equippedItems);
        const balance = swimmer.balance || 0;
        const totalXp = swimmer.totalXp || 0;

        if (action === 'purchase') {
            if (!itemId) return NextResponse.json({ error: 'Item ID required' }, { status: 400 });

            // 2. Fetch ShopItem
            const items = await sql`SELECT * FROM "ShopItem" WHERE "id" = ${itemId}`;
            if (items.length === 0) {
                return NextResponse.json({ error: 'Item not found' }, { status: 404 });
            }
            const item = items[0];

            // Checks
            if (inventory.includes(itemId)) {
                return NextResponse.json({ error: 'Item already purchased' }, { status: 400 });
            }

            if (balance < item.price) {
                return NextResponse.json({ error: 'Insufficient XP balance' }, { status: 400 });
            }

            const newBalance = balance - item.price;
            const newInventory = [...inventory, itemId];

            // Start a multi-step transaction process
            // A. Update Swimmer balance & inventory
            const updatedSwimmer = await sql`
                UPDATE "Swimmer"
                SET "balance" = ${newBalance}, "inventory" = ${JSON.stringify(newInventory)}, "updatedAt" = NOW()
                WHERE "id" = ${swimmerId}
                RETURNING *
            `;

            // B. Record Transaction
            const txId = crypto.randomUUID();
            await sql`
                INSERT INTO "XpTransaction" ("id", "swimmerId", "amount", "source", "description", "balanceAfter", "totalXpAfter", "createdAt")
                VALUES (
                    ${txId},
                    ${swimmerId},
                    ${-item.price},
                    'purchase',
                    ${`购买了商品: ${item.name}`},
                    ${newBalance},
                    ${totalXp},
                    NOW()
                )
            `;

            // C. Create Activity Feed Item
            const feedId = crypto.randomUUID();
            await sql`
                INSERT INTO "ActivityFeedItem" ("id", "swimmerId", "type", "title", "detail", "xpAmount", "isRead", "createdAt")
                VALUES (
                    ${feedId},
                    ${swimmerId},
                    'purchase',
                    ${`成功购买了「${item.name}」`},
                    ${`消费了 ${item.price} XP。快去衣橱换装吧！`},
                    ${-item.price},
                    false,
                    NOW()
                )
            `;

            return NextResponse.json({
                success: true,
                swimmer: updatedSwimmer[0],
                balance: newBalance,
                inventory: newInventory
            }, { headers: V12_FINGERPRINT });

        } else if (action === 'equip') {
            if (!equipped) return NextResponse.json({ error: 'Equipped mapping required' }, { status: 400 });

            // Check if equipped items are owned
            const owned = new Set(inventory);
            // Equipped items default dress-code
            const newEquipped = parseObject(equipped);

            for (const [slot, id] of Object.entries(newEquipped)) {
                if (id && !owned.has(id as string)) {
                    return NextResponse.json({ error: `You do not own the item equipped in ${slot}` }, { status: 400 });
                }
            }

            const updatedSwimmer = await sql`
                UPDATE "Swimmer"
                SET "equippedItems" = ${JSON.stringify(newEquipped)}, "updatedAt" = NOW()
                WHERE "id" = ${swimmerId}
                RETURNING *
            `;

            return NextResponse.json({
                success: true,
                equippedItems: newEquipped,
                swimmer: updatedSwimmer[0]
            }, { headers: V12_FINGERPRINT });

        } else if (action === 'wishlist_add') {
            if (!itemId) return NextResponse.json({ error: 'Item ID required' }, { status: 400 });

            if (wishlist.includes(itemId)) {
                return NextResponse.json({ error: 'Item already in wishlist' }, { status: 400 });
            }

            if (wishlist.length >= 3) {
                return NextResponse.json({ error: 'Wishlist is full (max 3 items)' }, { status: 400 });
            }

            const newWishlist = [...wishlist, itemId];

            const updatedSwimmer = await sql`
                UPDATE "Swimmer"
                SET "wishlist" = ${JSON.stringify(newWishlist)}, "updatedAt" = NOW()
                WHERE "id" = ${swimmerId}
                RETURNING *
            `;

            return NextResponse.json({
                success: true,
                wishlist: newWishlist,
                swimmer: updatedSwimmer[0]
            }, { headers: V12_FINGERPRINT });

        } else if (action === 'wishlist_remove') {
            if (!itemId) return NextResponse.json({ error: 'Item ID required' }, { status: 400 });

            const newWishlist = wishlist.filter(id => id !== itemId);

            const updatedSwimmer = await sql`
                UPDATE "Swimmer"
                SET "wishlist" = ${JSON.stringify(newWishlist)}, "updatedAt" = NOW()
                WHERE "id" = ${swimmerId}
                RETURNING *
            `;

            return NextResponse.json({
                success: true,
                wishlist: newWishlist,
                swimmer: updatedSwimmer[0]
            }, { headers: V12_FINGERPRINT });

        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    });
}
