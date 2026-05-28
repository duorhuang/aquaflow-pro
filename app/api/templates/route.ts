import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { handleCoach, handleAnyAuth } from '@/lib/api-handler';
import { templateRepo } from '@/lib/repos';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return handleAnyAuth(req, async () => {
    const templates = await templateRepo.list();
    return NextResponse.json(templates, { headers: V12_FINGERPRINT });
  });
}

export async function POST(request: Request) {
  return handleCoach(request, async () => {
    const data = flattenPayload(await request.json());
    const result = await templateRepo.create(data);
    if ((result as any).error) return NextResponse.json(result, { status: (result as any).status, headers: V12_FINGERPRINT });
    return NextResponse.json(result, { headers: V12_FINGERPRINT });
  });
}

export async function PUT(request: Request) {
  return handleCoach(request, async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const data = flattenPayload(await request.json());
    const template = await templateRepo.update(id, data);
    return NextResponse.json(template, { headers: V12_FINGERPRINT });
  });
}

export async function DELETE(request: Request) {
  return handleCoach(request, async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await templateRepo.delete(id);
    return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
  });
}
