import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { handleAnyAuth } from '@/lib/api-handler';
import { blockFeedbackRepo } from '@/lib/repos';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return handleAnyAuth(req, async (_req, auth) => {
    const { searchParams } = new URL(req.url);
    const isCoach = auth.role === 'coach';
    const athleteId = !isCoach ? auth.userId : null;
    const swimmerId = searchParams.get('swimmerId');
    const effectiveSwimmerId = !isCoach && swimmerId && swimmerId !== athleteId ? athleteId : swimmerId;

    const feedbacks = await blockFeedbackRepo.list({
      planId: searchParams.get('planId') || undefined,
      blockId: searchParams.get('blockId') || undefined,
      swimmerId: effectiveSwimmerId || undefined,
      isCoach,
    });
    return NextResponse.json(feedbacks, { headers: V12_FINGERPRINT });
  });
}

export async function POST(request: Request) {
  return handleAnyAuth(request, async () => {
    const data = flattenPayload(await request.json());
    const feedback = await blockFeedbackRepo.create(data);
    return NextResponse.json(feedback, { headers: V12_FINGERPRINT });
  });
}

export async function DELETE(request: Request) {
  return handleAnyAuth(request, async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await blockFeedbackRepo.delete(id);
    return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
  });
}
