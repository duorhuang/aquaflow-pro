import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { handleAnyAuth } from '@/lib/api-handler';
import { attendanceRepo } from '@/lib/repos';
import * as crypto from 'crypto';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleAnyAuth(request, async () => {
    const attendance = await attendanceRepo.list();
    return NextResponse.json(attendance, { headers: V12_FINGERPRINT });
  });
}

export async function POST(request: Request) {
  return handleAnyAuth(request, async () => {
    const data = flattenPayload(await request.json());
    const swimmerId = String(data.swimmerId);
    const checkInDate = String(data.date);
    const status = String(data.status || 'Present');
    const result = await attendanceRepo.processCheckIn(swimmerId, checkInDate, status, data);
    if ((result as any).error) return NextResponse.json(result, { status: (result as any).status, headers: V12_FINGERPRINT });
    return NextResponse.json(result, { headers: V12_FINGERPRINT });
  });
}

export async function DELETE(request: Request) {
  return handleAnyAuth(request, async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await attendanceRepo.delete(id);
    return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
  });
}
