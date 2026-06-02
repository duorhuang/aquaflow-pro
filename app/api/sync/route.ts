import { NextResponse } from 'next/server';
import { V12_FINGERPRINT } from '@/lib/utils';
import { handleAnyAuth } from '@/lib/api-handler';
import { getNeon } from '@/lib/db-pool';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleAnyAuth(request, async (_req, auth) => {
    // Warm up DB before heavy sync query
    const sql = getNeon();
    try { await sql`SELECT 1`; } catch {
      return NextResponse.json({ error: 'Database waking up' }, { status: 503, headers: V12_FINGERPRINT });
    }

    const isCoach = auth.role === 'coach';
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString();

    // For athletes: only load their specific data to reduce payload size for 70+ swimmers
    const athleteId = !isCoach ? auth.userId : null;

    // Build queries based on role to minimize data transfer
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
      // For athletes, only load swimmer list (needed for buddy system) - no passwords
      isCoach
        ? sql`SELECT * FROM "Swimmer" ORDER BY "name" ASC`
        : sql`SELECT id, name, username, "group", gender, "mainStroke", readiness, status, level, "totalXp", balance, "currentStreak", "equippedItems", "lastProfileUpdate" FROM "Swimmer" ORDER BY "name" ASC`,
      isCoach
        ? sql`SELECT * FROM "Feedback" ORDER BY "date" DESC`
        : sql`SELECT * FROM "Feedback" WHERE "swimmerId" = ${athleteId} ORDER BY "date" DESC`,
      isCoach
        ? sql`SELECT * FROM "AttendanceRecord"`
        : sql`SELECT * FROM "AttendanceRecord" WHERE "swimmerId" = ${athleteId}`,
      isCoach
        ? sql`SELECT * FROM "PerformanceRecord"`
        : sql`SELECT * FROM "PerformanceRecord" WHERE "swimmerId" = ${athleteId}`,
      sql`SELECT * FROM "WeeklyPlan" WHERE "isPublished" = true`,
      sql`SELECT * FROM "CoachAnnouncement" WHERE "createdAt" >= ${cutoffStr} OR "isStarred" = true ORDER BY "createdAt" DESC`,
      sql`SELECT * FROM "CoachAnnouncement" WHERE "createdAt" < ${cutoffStr} AND "isStarred" = false ORDER BY "createdAt" DESC`,
      isCoach
        ? sql`SELECT * FROM "WeeklyFeedback" WHERE "isSubmitted" = true`
        : sql`SELECT * FROM "WeeklyFeedback" WHERE "isSubmitted" = true AND "swimmerId" = ${athleteId}`,
      sql`SELECT * FROM "BlockTemplate" ORDER BY "category" ASC`
    ]);

    const templates = (templatesRaw || []).map((t: any) => {
      if (t.items && typeof t.items === 'string') {
        try { t.items = JSON.parse(t.items); } catch { t.items = []; }
      }
      return t;
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

    // For coaches, return all data; for athletes, data is already scoped by queries above
    return NextResponse.json({
      plans: plans || [],
      swimmers: swimmersRaw || [],
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
