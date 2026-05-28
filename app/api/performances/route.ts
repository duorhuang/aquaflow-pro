import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { handleCoach, handleAnyAuth } from '@/lib/api-handler';
import { performanceRepo } from '@/lib/repos';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return handleAnyAuth(req, async () => {
    const performances = await performanceRepo.list();
    return NextResponse.json(performances, { headers: V12_FINGERPRINT });
  });
}

export async function POST(request: Request) {
  return handleCoach(request, async () => {
    const data = flattenPayload(await request.json());
    const record = await performanceRepo.create(data);
    return NextResponse.json(record, { headers: V12_FINGERPRINT });
  });
}

export async function PUT(request: Request) {
  return handleCoach(request, async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const data = flattenPayload(await request.json());
    const record = await performanceRepo.update(id, data);
    return NextResponse.json(record, { headers: V12_FINGERPRINT });
  });
}

export async function DELETE(request: Request) {
  return handleCoach(request, async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await performanceRepo.delete(id);
    return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
  });
}
