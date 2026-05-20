import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';
import { V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function POST() {
    return withApiHandler(async () => {
        return NextResponse.json(
            { success: true },
            { headers: { 'Set-Cookie': clearSessionCookie(), ...V12_FINGERPRINT } }
        );
    });
}
