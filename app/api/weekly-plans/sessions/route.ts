import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { handleCoach } from '@/lib/api-handler';
import { weeklyPlanRepo } from '@/lib/repos';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handleCoach(request, async () => {
    const data = flattenPayload(await request.json());
    const session = await weeklyPlanRepo.addSession(data);
    return NextResponse.json(session, { headers: V12_FINGERPRINT });
  });
}

export async function PUT(request: Request) {
  return handleCoach(request, async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const data = flattenPayload(await request.json());
    const session = await weeklyPlanRepo.updateSession(id, data);
    return NextResponse.json(session, { headers: V12_FINGERPRINT });
  });
}

export async function DELETE(request: Request) {
  return handleCoach(request, async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await weeklyPlanRepo.deleteSession(id);
    return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
  });
}
