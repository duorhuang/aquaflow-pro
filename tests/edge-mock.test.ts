import { getPrisma } from '../lib/prisma';

async function testBuildPhaseProxy() {
    console.log("Testing Prisma Proxy during build phase simulation...");
    
    // Simulate build phase
    process.env.NEXT_PHASE = 'phase-production-build';
    
    try {
        const prisma = getPrisma();
        
        // This should not crash even if DATABASE_URL is missing
        console.log("Accessing prisma.swimmer.findMany()...");
        const result = await prisma.swimmer.findMany();
        
        if (Array.isArray(result) && result.length === 0) {
            console.log("✅ getPrisma build proxy returned empty array as expected.");
        } else {
            console.error("❌ Unexpected result from proxy:", result);
            process.exit(1);
        }
    } catch (e) {
        console.error("❌ Build phase proxy CRASHED:", e);
        process.exit(1);
    }
}

testBuildPhaseProxy();
