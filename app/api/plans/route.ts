import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { handleCoach, handleAnyAuth } from '@/lib/api-handler';
import { planRepo } from '@/lib/repos';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return handleAnyAuth(req, async () => {
    const { searchParams } = new URL(req.url);
    const group = searchParams.get('group');
    const plans = await planRepo.list(group || undefined);
    return NextResponse.json(plans, { headers: V12_FINGERPRINT });
  });
}

export async function POST(request: Request) {
  return handleCoach(request, async () => {
    const data = flattenPayload(await request.json());
    const plan = await planRepo.create(data);
    return NextResponse.json(plan, { headers: V12_FINGERPRINT });
  });
}

export async function PUT(request: Request) {
  return handleCoach(request, async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const data = flattenPayload(await request.json());
    const plan = await planRepo.update(id, data);
    return NextResponse.json(plan, { headers: V12_FINGERPRINT });
  });
}

export async function DELETE(request: Request) {
  return handleCoach(request, async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await planRepo.delete(id);
    return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
  });
}
