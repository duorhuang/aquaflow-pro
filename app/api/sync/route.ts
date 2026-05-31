import { NextResponse } from 'next/server';
import { V12_FINGERPRINT } from '@/lib/utils';
import { handleAnyAuth } from '@/lib/api-handler';
import { getNeon } from '@/lib/db-pool';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleAnyAuth(request, async (_req, auth) => {
    const sql = getNeon();
    const isCoach = auth.role === 'coach';
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString();

    const [
      plans,
      swimmersRaw,
      feedbacks,
      attendance,
      performances,
      weeklyPlansRaw,
      activeAnnouncementsRaw,
      archivedAnnouncementsRaw,
      weeklyFeedbacks,
      templatesRaw
    ] = await Promise.all([
      sql`SELECT * FROM "TrainingPlan" ORDER BY "date" DESC`,
      sql`SELECT * FROM "Swimmer" ORDER BY "name" ASC`,
      sql`SELECT * FROM "Feedback" ORDER BY "date" DESC`,
      sql`SELECT * FROM "AttendanceRecord"`,
      sql`SELECT * FROM "PerformanceRecord"`,
      sql`SELECT * FROM "WeeklyPlan" WHERE "isPublished" = true`,
      sql`SELECT * FROM "CoachAnnouncement" WHERE "createdAt" >= ${cutoffStr} OR "isStarred" = true ORDER BY "createdAt" DESC`,
      sql`SELECT * FROM "CoachAnnouncement" WHERE "createdAt" < ${cutoffStr} AND "isStarred" = false ORDER BY "createdAt" DESC`,
      sql`SELECT * FROM "WeeklyFeedback" WHERE "isSubmitted" = true`,
      sql`SELECT * FROM "BlockTemplate" ORDER BY "category" ASC`
    ]);

    const templates = (templatesRaw || []).map((t: any) => {
      if (t.items && typeof t.items === 'string') {
        try { t.items = JSON.parse(t.items); } catch { t.items = []; }
      }
      return t;
    });

    const swimmers = swimmersRaw.map((s: any) => {
      if (isCoach) return s;
      const { password, ...rest } = s;
      return rest;
    });

    const weeklyPlanIds = weeklyPlansRaw.map((wp: any) => wp.id);
    const sessionsByWeeklyPlanId: Record<string, any[]> = {};
    if (weeklyPlanIds.length > 0) {
      const sessions = await sql`SELECT * FROM "DailySession" WHERE "weeklyPlanId" = ANY(${weeklyPlanIds}) ORDER BY "sortOrder" ASC`;
      for (const s of sessions) {
        if (s.contentBlocks && typeof s.contentBlocks === 'string') {
          try { s.contentBlocks = JSON.parse(s.contentBlocks); } catch {}
        }
        if (s.trainingBlocks && typeof s.trainingBlocks === 'string') {
          try { s.trainingBlocks = JSON.parse(s.trainingBlocks); } catch {}
        }
        (sessionsByWeeklyPlanId[s.weeklyPlanId] ||= []).push(s);
      }
    }

    const weeklyPlans = weeklyPlansRaw.map((w: any) => {
      try { w.targetGroup = typeof w.targetGroup === 'string' ? JSON.parse(w.targetGroup) : w.targetGroup; } catch {}
      try { w.targetSwimmerIds = typeof w.targetSwimmerIds === 'string' ? JSON.parse(w.targetSwimmerIds) : w.targetSwimmerIds; } catch {}
      w.sessions = sessionsByWeeklyPlanId[w.id] || [];
      return w;
    });

    const fetchBlocks = async (announcements: any[]) => {
      if (!announcements?.length) return [];
      const ids = announcements.map(a => a.id);
      const blocks = await sql`SELECT * FROM "AnnouncementBlock" WHERE "announcementId" = ANY(${ids}) ORDER BY "sortOrder" ASC`;
      const byId: Record<string, any[]> = {};
      for (const b of blocks) { (byId[b.announcementId] ||= []).push(b); }
      return announcements.map(a => {
        let targetSwimmerIds = a.targetSwimmerIds;
        if (typeof targetSwimmerIds === 'string') {
          try { targetSwimmerIds = JSON.parse(targetSwimmerIds); } catch { targetSwimmerIds = []; }
        }
        return { ...a, targetSwimmerIds, blocks: byId[a.id] || [] };
      });
    };

    const [announcements, archivedAnnouncements] = await Promise.all([
      fetchBlocks(activeAnnouncementsRaw),
      fetchBlocks(archivedAnnouncementsRaw)
    ]);

    const resolveDaily = async (wfs: any[]) => {
      if (!wfs?.length) return wfs;
      const ids = wfs.map(w => w.id);
      const daily = await sql`SELECT * FROM "DailyFeedback" WHERE "weeklyFeedbackId" = ANY(${ids})`;
      const byWf: Record<string, any[]> = {};
      for (const d of daily) { (byWf[d.weeklyFeedbackId] ||= []).push(d); }
      return wfs.map(w => ({ ...w, dailyFeedbacks: byWf[w.id] || [] }));
    };

    const resolvedWeeklyFeedbacks = await resolveDaily(weeklyFeedbacks);

    // SECURITY: Scope sensitive data to the athlete's own records
    if (!isCoach) {
      const athleteId = auth.userId;
      const athleteFeedbacks = (feedbacks || []).filter((f: any) => f.swimmerId === athleteId);
      const athleteAttendance = (attendance || []).filter((a: any) => a.swimmerId === athleteId);
      const athletePerformances = (performances || []).filter((p: any) => p.swimmerId === athleteId);
      const athleteWeeklyFeedbacks = (resolvedWeeklyFeedbacks || []).filter((w: any) => w.swimmerId === athleteId);

      return NextResponse.json({
        plans: plans || [],
        swimmers: swimmers || [],
        feedbacks: athleteFeedbacks,
        attendance: athleteAttendance,
        performances: athletePerformances,
        weeklyPlans: weeklyPlans || [],
        announcements: announcements || [],
        archivedAnnouncements: archivedAnnouncements || [],
        weeklyFeedbacks: athleteWeeklyFeedbacks,
        templates: templates || []
      }, { headers: V12_FINGERPRINT });
    }

    return NextResponse.json({
      plans: plans || [],
      swimmers: swimmers || [],
      feedbacks: feedbacks || [],
      attendance: attendance || [],
      performances: performances || [],
      weeklyPlans: weeklyPlans || [],
      announcements: announcements || [],
      archivedAnnouncements: archivedAnnouncements || [],
      weeklyFeedbacks: resolvedWeeklyFeedbacks || [],
      templates: templates || []
    }, { headers: V12_FINGERPRINT });
  });
}
