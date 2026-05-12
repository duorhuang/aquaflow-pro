import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach } from '@/lib/auth-api';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const { searchParams } = new URL(req.url);
        const planId = searchParams.get('planId');

        if (planId) {
            const analysis = await sql`
                SELECT * FROM "PlanAnalysis" WHERE "planId" = ${planId}
            `;
            return NextResponse.json(analysis.length > 0 ? analysis[0] : null, { headers: V12_FINGERPRINT });
        }

        const analyses = await sql`
            SELECT * FROM "PlanAnalysis"
            ORDER BY "createdAt" DESC
        `;
        return NextResponse.json(analyses || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const data = flattenPayload(await request.json());

        if (!data.planId || !data.imageUrl) {
            return NextResponse.json({ error: 'planId and imageUrl required' }, { status: 400 });
        }

        // Check if exists for upsert
        const existing = await sql`
            SELECT * FROM "PlanAnalysis" WHERE "planId" = ${String(data.planId)}
        `;

        let analysis: any;
        if (existing.length > 0) {
            analysis = await sql`
                UPDATE "PlanAnalysis" SET
                    "imageUrl" = ${String(data.imageUrl)},
                    "rawText" = ${data.rawText || null},
                    "structuredData" = ${data.structuredData || null},
                    "coachInsights" = ${data.coachInsights || null},
                    "aiSuggestions" = ${data.aiSuggestions || null},
                    "updatedAt" = NOW()
                WHERE "planId" = ${String(data.planId)}
                RETURNING *
            `;
        } else {
            analysis = await sql`
                INSERT INTO "PlanAnalysis" ("planId", "imageUrl", "rawText", "structuredData", "coachInsights", "aiSuggestions", "createdAt", "updatedAt")
                VALUES (
                    ${String(data.planId)},
                    ${String(data.imageUrl)},
                    ${data.rawText || null},
                    ${data.structuredData || null},
                    ${data.coachInsights || null},
                    ${data.aiSuggestions || null},
                    NOW(),
                    NOW()
                )
                RETURNING *
            `;
        }
        return NextResponse.json(analysis, { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const { searchParams } = new URL(request.url);
        const planId = searchParams.get('planId');
        if (!planId) return NextResponse.json({ error: 'planId required' }, { status: 400 });

        await sql`DELETE FROM "PlanAnalysis" WHERE "planId" = ${planId}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
