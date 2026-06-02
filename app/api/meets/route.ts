import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { handleCoach, handleAnyAuth } from '@/lib/api-handler';
import { meetRepo } from '@/lib/repos';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleAnyAuth(request, async () => {
    const data = await meetRepo.list();
    return NextResponse.json(data, { headers: V12_FINGERPRINT });
  });
}

export async function POST(request: Request) {
  return handleCoach(request, async () => {
    const data = flattenPayload(await request.json());
    if (!data.name || !data.date) return NextResponse.json({ error: 'Meet name and date are required' }, { status: 400 });
    const meet = await meetRepo.create(data);
    // Notify swimmers
    try {
      const { getNeon } = await import('@/lib/db-pool');
      const sql = getNeon();
      const swimmers = await sql`SELECT id FROM "Swimmer"`;
      for (const s of swimmers) {
        await sql`INSERT INTO "ActivityFeedItem" ("id", "swimmerId", "type", "title", "detail", "isRead", "createdAt") VALUES (${globalThis.crypto.randomUUID()}, ${s.id}, 'meet_announced', ${`New meet: ${data.name}`}, ${data.description || ''}, false, NOW())`;
      }
    } catch (e) { console.error("Meet notification failed:", e); }
    return NextResponse.json(meet, { headers: V12_FINGERPRINT });
  });
}

export async function PUT(request: Request) {
  return handleCoach(request, async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const data = flattenPayload(await request.json());
    const meet = await meetRepo.update(id, data);
    return NextResponse.json(meet, { headers: V12_FINGERPRINT });
  });
}

export async function DELETE(request: Request) {
  return handleCoach(request, async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await meetRepo.delete(id);
    return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
  });
}
