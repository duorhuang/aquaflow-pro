import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { handleCoach, handleAnyAuth } from '@/lib/api-handler';
import { swimmerRepo } from '@/lib/repos';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleAnyAuth(request, async (_req, auth) => {
    const swimmers = await swimmerRepo.list();
    const isCoach = auth.role === 'coach';
    const safe = (swimmers || []).map((s: any) => {
      if (isCoach) return s;
      const { password, ...rest } = s;
      return rest;
    });
    return NextResponse.json(safe, { headers: V12_FINGERPRINT });
  });
}

export async function POST(request: Request) {
  return handleCoach(request, async () => {
    const data = flattenPayload(await request.json());
    const swimmer = await swimmerRepo.create(data);
    return NextResponse.json(swimmer, { headers: V12_FINGERPRINT });
  });
}

export async function PUT(request: Request) {
  return handleAnyAuth(request, async (_req, auth) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    if (auth.role === 'athlete' && auth.userId !== id) {
      return NextResponse.json({ error: 'Forbidden: Can only update your own profile' }, { status: 403 });
    }

    const data = flattenPayload(await request.json());
    const swimmer = await swimmerRepo.update(id, data);
    return NextResponse.json(swimmer, { headers: V12_FINGERPRINT });
  });
}

export async function DELETE(request: Request) {
  return handleCoach(request, async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await swimmerRepo.delete(id);
    return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
  });
}
