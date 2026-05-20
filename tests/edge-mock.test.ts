import { test, expect } from 'vitest';
import { getPrisma } from '../lib/prisma';

async function testPrismaProxy() {
    console.log("Testing Prisma no-op proxy...");

    try {
        const prisma = getPrisma();

        // This should not crash even if DATABASE_URL is missing
        console.log("Accessing prisma.swimmer.findMany()...");
        const result = await prisma.swimmer.findMany();

        if (Array.isArray(result) && result.length === 0) {
            console.log("✅ getPrisma proxy returned empty array as expected.");
        } else {
            console.error("❌ Unexpected result from proxy:", result);
            throw new Error("Proxy did not return empty array");
        }
    } catch (e: any) {
        console.error("❌ Proxy CRASHED:", e);
        throw e;
    }
}

test('Prisma proxy returns empty arrays without crashing', async () => {
    await testPrismaProxy();
});
