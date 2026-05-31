import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { handleCoach, handleAnyAuth } from '@/lib/api-handler';
import { weeklyFeedbackRepo } from '@/lib/repos';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return handleAnyAuth(req, async (_req, auth) => {
    // SECURITY: Athletes can only view their own weekly feedbacks
    const isCoach = auth.role === 'coach';
    const { searchParams } = new URL(req.url);
    const swimmerId = searchParams.get('swimmerId');
    const weekStart = searchParams.get('weekStart');
    const submittedOnly = searchParams.get('submitted') === 'true';

    if (swimmerId && weekStart) {
      // Verify athlete owns the requested feedback
      if (!isCoach && swimmerId !== auth.userId) {
        return NextResponse.json({ error: 'Forbidden: Can only view your own feedback' }, { status: 403 });
      }
      const feedback = await weeklyFeedbackRepo.getBySwimmerAndWeek(swimmerId, weekStart);
      if (!feedback) return NextResponse.json(null, { headers: V12_FINGERPRINT });
      return NextResponse.json(feedback, { headers: V12_FINGERPRINT });
    }

    const feedbacks = await weeklyFeedbackRepo.list(submittedOnly);
    const safe = isCoach ? feedbacks : (feedbacks || []).filter((f: any) => f.swimmerId === auth.userId);
    return NextResponse.json(safe, { headers: V12_FINGERPRINT });
  });
}

export async function POST(request: Request) {
  return handleAnyAuth(request, async (_req, auth) => {
    const data = flattenPayload(await request.json());
    // SECURITY: Athletes can only submit their own weekly feedback
    if (auth.role === 'athlete' && data.swimmerId && data.swimmerId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden: Can only submit your own feedback' }, { status: 403 });
    }
    const feedback = await weeklyFeedbackRepo.save(data);
    return NextResponse.json(feedback, { headers: V12_FINGERPRINT });
  });
}

export async function PATCH(request: Request) {
  return handleCoach(request, async () => {
    const data = flattenPayload(await request.json());
    const result = await weeklyFeedbackRepo.reply(data.id, data.coachReply);
    return NextResponse.json(result, { headers: V12_FINGERPRINT });
  });
}
