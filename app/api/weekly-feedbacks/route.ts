import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { handleCoach, handleAnyAuth } from '@/lib/api-handler';
import { weeklyFeedbackRepo } from '@/lib/repos';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return handleAnyAuth(req, async () => {
    const { searchParams } = new URL(req.url);
    const swimmerId = searchParams.get('swimmerId');
    const weekStart = searchParams.get('weekStart');
    const submittedOnly = searchParams.get('submitted') === 'true';

    if (swimmerId && weekStart) {
      const feedback = await weeklyFeedbackRepo.getBySwimmerAndWeek(swimmerId, weekStart);
      if (!feedback) return NextResponse.json(null, { headers: V12_FINGERPRINT });
      return NextResponse.json(feedback, { headers: V12_FINGERPRINT });
    }

    const feedbacks = await weeklyFeedbackRepo.list(submittedOnly);
    return NextResponse.json(feedbacks, { headers: V12_FINGERPRINT });
  });
}

export async function POST(request: Request) {
  return handleAnyAuth(request, async () => {
    const data = flattenPayload(await request.json());
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
