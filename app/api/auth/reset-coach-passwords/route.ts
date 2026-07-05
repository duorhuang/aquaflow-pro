import { NextResponse } from 'next/server';
import { getNeon } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const sql = getNeon();
        const hash = '2df43e731c26519030f6890de4acf2af:100000:b7955d73f3cd82867ea13a67b6bb226fbe6e4f54f05b7d43d55ac25f17bd8096';
        await sql`UPDATE "CoachUser" SET "password" = ${hash}`;
        return NextResponse.json({ success: true, message: 'All coach passwords reset to 123456' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
