import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { handleAnyAuth } from '@/lib/api-handler';
import { feedbackRepo } from '@/lib/repos';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return handleAnyAuth(req, async (_req, auth) => {
    // SECURITY: Athletes can only view their own feedbacks
    const isCoach = auth.role === 'coach';
    const feedbacks = await feedbackRepo.list();
    const safe = isCoach ? feedbacks : (feedbacks || []).filter((f: any) => f.swimmerId === auth.userId);
    return NextResponse.json(safe, { headers: V12_FINGERPRINT });
  });
}

export async function POST(request: Request) {
  return handleAnyAuth(request, async (_req, auth) => {
    const data = flattenPayload(await request.json());
    // SECURITY: Athletes can only submit their own feedback
    if (auth.role === 'athlete' && data.swimmerId && data.swimmerId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden: Can only submit your own feedback' }, { status: 403 });
    }
    const feedback = await feedbackRepo.upsert(data);
    return NextResponse.json(feedback, { headers: V12_FINGERPRINT });
  });
}
