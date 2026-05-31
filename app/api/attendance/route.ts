import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { handleAnyAuth } from '@/lib/api-handler';
import { attendanceRepo } from '@/lib/repos';
import * as crypto from 'crypto';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleAnyAuth(request, async (_req, auth) => {
    // SECURITY: Athletes can only view their own attendance records
    const isCoach = auth.role === 'coach';
    const attendance = await attendanceRepo.list();
    const safe = isCoach ? attendance : (attendance || []).filter((a: any) => a.swimmerId === auth.userId);
    return NextResponse.json(safe, { headers: V12_FINGERPRINT });
  });
}

export async function POST(request: Request) {
  return handleAnyAuth(request, async (_req, auth) => {
    const data = flattenPayload(await request.json());
    const swimmerId = String(data.swimmerId);

    // SECURITY: Athletes can only check themselves in
    if (auth.role === 'athlete' && swimmerId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden: Can only check in yourself' }, { status: 403 });
    }

    const checkInDate = String(data.date);
    const status = String(data.status || 'Present');
    const result = await attendanceRepo.processCheckIn(swimmerId, checkInDate, status, data);
    if ((result as any).error) return NextResponse.json(result, { status: (result as any).status, headers: V12_FINGERPRINT });
    return NextResponse.json(result, { headers: V12_FINGERPRINT });
  });
}

export async function DELETE(request: Request) {
  return handleAnyAuth(request, async (_req, auth) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    // SECURITY: Only coaches can delete attendance records
    if (auth.role === 'athlete') {
      return NextResponse.json({ error: 'Forbidden: Coaches only' }, { status: 403 });
    }

    await attendanceRepo.delete(id);
    return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
  });
}
