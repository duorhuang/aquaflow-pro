import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api-handler';
import { V12_FINGERPRINT } from '@/lib/utils';
export const dynamic = 'force-dynamic';

export async function POST() {
  return withApiHandler(async () => {
    const response = NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set('aquaflow_session', '', {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      secure: isProd,
      ...(isProd ? { domain: '.sportsflow.best' } : {}),
    });
    return response;
  });
}
