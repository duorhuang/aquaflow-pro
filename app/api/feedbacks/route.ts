import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { handleAnyAuth } from '@/lib/api-handler';
import { feedbackRepo } from '@/lib/repos';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return handleAnyAuth(req, async () => {
    const feedbacks = await feedbackRepo.list();
    return NextResponse.json(feedbacks, { headers: V12_FINGERPRINT });
  });
}

export async function POST(request: Request) {
  return handleAnyAuth(request, async () => {
    const data = flattenPayload(await request.json());
    const feedback = await feedbackRepo.upsert(data);
    return NextResponse.json(feedback, { headers: V12_FINGERPRINT });
  });
}
