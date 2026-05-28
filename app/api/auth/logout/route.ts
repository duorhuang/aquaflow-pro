import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';
import { withApiHandler } from '@/lib/api-handler';
import { V12_FINGERPRINT } from '@/lib/utils';
export const dynamic = 'force-dynamic';

export async function POST() {
  return withApiHandler(async () => {
    return NextResponse.json({ success: true }, {
      headers: {
        ...V12_FINGERPRINT,
        'Set-Cookie': clearSessionCookie(),
      },
    });
  });
}
