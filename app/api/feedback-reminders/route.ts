import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { handleCoach, handleAnyAuth } from '@/lib/api-handler';
import { feedbackReminderRepo } from '@/lib/repos';
import { getNeon } from '@/lib/db-pool';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return handleAnyAuth(req, async (_req, auth) => {
    const { searchParams } = new URL(req.url);
    const swimmerId = searchParams.get('swimmerId');
    const withResponses = searchParams.get('withResponses') === 'true';

    // SECURITY: Athletes can only view their own reminders
    if (auth.role === 'athlete' && swimmerId && swimmerId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden: Can only view your own reminders' }, { status: 403 });
    }

    try {
      if (swimmerId) {
        const reminders = await feedbackReminderRepo.getForSwimmer(swimmerId);
        return NextResponse.json(reminders, { headers: V12_FINGERPRINT });
      }
      const reminders = await feedbackReminderRepo.list(withResponses);
      return NextResponse.json(reminders, { headers: V12_FINGERPRINT });
    } catch (e: any) {
      // Table may not exist yet — return empty array gracefully
      if (e.message?.includes('does not exist')) {
        return NextResponse.json([], { headers: V12_FINGERPRINT });
      }
      throw e;
    }
  });
}

export async function POST(request: Request) {
  return handleAnyAuth(request, async () => {
    const data = flattenPayload(await request.json());
    try {
      if (data._action === 'respond') {
        const response = await feedbackReminderRepo.respond(data);
        return NextResponse.json(response, { headers: V12_FINGERPRINT });
      }
      const reminder = await feedbackReminderRepo.create(data);
      return NextResponse.json(reminder, { headers: V12_FINGERPRINT });
    } catch (e: any) {
      if (e.message?.includes('does not exist')) {
        return NextResponse.json({ error: 'Feature not yet available' }, { status: 503, headers: V12_FINGERPRINT });
      }
      throw e;
    }
  });
}

export async function PATCH(request: Request) {
  return handleCoach(request, async () => {
    const data = flattenPayload(await request.json());
    const result = await feedbackReminderRepo.replyToTargeted(data.id, data.coachReply);
    return NextResponse.json(result, { headers: V12_FINGERPRINT });
  });
}
