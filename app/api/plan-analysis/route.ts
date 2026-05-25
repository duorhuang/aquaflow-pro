import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';
import * as crypto from 'crypto';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const { searchParams } = new URL(req.url);
        const planId = searchParams.get('planId');

    const safeParse = (val: any) => { try { return JSON.parse(val); } catch { return val; } };

        if (planId) {
            const analysis = await sql`
                SELECT * FROM "PlanAnalysis" WHERE "planId" = ${planId}
            `;
            if (analysis.length > 0) {
                const a = analysis[0];
                if (a.structuredData && typeof a.structuredData === 'string') a.structuredData = safeParse(a.structuredData);
                if (a.coachInsights && typeof a.coachInsights === 'string') a.coachInsights = safeParse(a.coachInsights);
                if (a.aiSuggestions && typeof a.aiSuggestions === 'string') a.aiSuggestions = safeParse(a.aiSuggestions);
            }
            return NextResponse.json(analysis.length > 0 ? analysis[0] : null, { headers: V12_FINGERPRINT });
        }

        const analyses = await sql`
            SELECT * FROM "PlanAnalysis"
            ORDER BY "createdAt" DESC
        `;
        analyses.forEach((a: any) => {
            if (a.structuredData && typeof a.structuredData === 'string') a.structuredData = safeParse(a.structuredData);
            if (a.coachInsights && typeof a.coachInsights === 'string') a.coachInsights = safeParse(a.coachInsights);
            if (a.aiSuggestions && typeof a.aiSuggestions === 'string') a.aiSuggestions = safeParse(a.aiSuggestions);
        });
        return NextResponse.json(analyses || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
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
            const structuredJson = data.structuredData !== undefined ? (data.structuredData ? JSON.stringify(data.structuredData) : null) : null;
            const insightsJson = data.coachInsights !== undefined ? (data.coachInsights ? JSON.stringify(data.coachInsights) : null) : null;
            const suggestionsJson = data.aiSuggestions !== undefined ? (data.aiSuggestions ? JSON.stringify(data.aiSuggestions) : null) : null;
            analysis = await sql`
                UPDATE "PlanAnalysis" SET
                    "imageUrl" = ${String(data.imageUrl)},
                    "rawText" = ${data.rawText || null},
                    "structuredData" = ${structuredJson},
                    "coachInsights" = ${insightsJson},
                    "aiSuggestions" = ${suggestionsJson},
                    "updatedAt" = NOW()
                WHERE "planId" = ${String(data.planId)}
                RETURNING *
            `;
        } else {
            const structuredJson = data.structuredData !== undefined ? (data.structuredData ? JSON.stringify(data.structuredData) : null) : null;
            const insightsJson = data.coachInsights !== undefined ? (data.coachInsights ? JSON.stringify(data.coachInsights) : null) : null;
            const suggestionsJson = data.aiSuggestions !== undefined ? (data.aiSuggestions ? JSON.stringify(data.aiSuggestions) : null) : null;
            analysis = await sql`
                INSERT INTO "PlanAnalysis" ("id", "planId", "imageUrl", "rawText", "structuredData", "coachInsights", "aiSuggestions", "createdAt", "updatedAt")
                VALUES (
                    ${crypto.randomUUID()},
                    ${String(data.planId)},
                    ${String(data.imageUrl)},
                    ${data.rawText || null},
                    ${structuredJson},
                    ${insightsJson},
                    ${suggestionsJson},
                    NOW(),
                    NOW()
                )
                RETURNING *
            `;
        }
        return NextResponse.json(analysis[0], { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const { searchParams } = new URL(request.url);
        const planId = searchParams.get('planId');
        if (!planId) return NextResponse.json({ error: 'planId required' }, { status: 400 });

        await sql`DELETE FROM "PlanAnalysis" WHERE "planId" = ${planId}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
