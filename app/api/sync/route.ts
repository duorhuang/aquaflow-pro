import { NextResponse } from 'next/server';
import { V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const isCoach = (auth as any).role === 'coach';

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
            weeklyFeedbacks
        ] = await Promise.all([
            sql`SELECT * FROM "TrainingPlan" ORDER BY "date" DESC`,
            sql`SELECT * FROM "Swimmer" ORDER BY "name" ASC`,
            sql`SELECT * FROM "Feedback" ORDER BY "date" DESC`,
            sql`SELECT * FROM "AttendanceRecord"`,
            sql`SELECT * FROM "PerformanceRecord"`,
            sql`SELECT * FROM "WeeklyPlan" WHERE "isPublished" = true`,
            sql`SELECT * FROM "CoachAnnouncement" WHERE "createdAt" >= ${cutoffStr} OR "isStarred" = true ORDER BY "createdAt" DESC`,
            sql`SELECT * FROM "CoachAnnouncement" WHERE "createdAt" < ${cutoffStr} AND "isStarred" = false ORDER BY "createdAt" DESC`,
            sql`SELECT * FROM "WeeklyFeedback" WHERE "isSubmitted" = true`
        ]);

        const swimmers = swimmersRaw.map((s: any) => {
            if (isCoach) return s;
            const { password, ...rest } = s;
            return rest;
        });

        // Fetch sessions for weekly plans in a single batch
        const weeklyPlanIds = weeklyPlansRaw.map((wp: any) => wp.id);
        const sessionsByWeeklyPlanId: Record<string, any[]> = {};
        if (weeklyPlanIds.length > 0) {
            const sessions = await sql`SELECT * FROM "DailySession" WHERE "weeklyPlanId" = ANY(${weeklyPlanIds}) ORDER BY "sortOrder" ASC`;
            for (const s of sessions) {
                if (s.contentBlocks && typeof s.contentBlocks === 'string') {
                    try { s.contentBlocks = JSON.parse(s.contentBlocks); } catch {}
                }
                (sessionsByWeeklyPlanId[s.weeklyPlanId] ||= []).push(s);
            }
        }

        // Weekly plans fetch target groups
        const weeklyPlans = weeklyPlansRaw.map((w: any) => {
            try { w.targetGroup = typeof w.targetGroup === 'string' ? JSON.parse(w.targetGroup) : w.targetGroup; } catch {}
            try { w.targetSwimmerIds = typeof w.targetSwimmerIds === 'string' ? JSON.parse(w.targetSwimmerIds) : w.targetSwimmerIds; } catch {}
            w.sessions = sessionsByWeeklyPlanId[w.id] || [];
            return w;
        });

        const fetchBlocksForAnnouncements = async (announcements: any[]) => {
            if (!announcements || announcements.length === 0) return [];
            const ids = announcements.map(a => a.id);
            const blocks = await sql`SELECT * FROM "AnnouncementBlock" WHERE "announcementId" = ANY(${ids}) ORDER BY "sortOrder" ASC`;
            
            const blocksByAnnId = blocks.reduce((acc: any, b: any) => {
                if (!acc[b.announcementId]) acc[b.announcementId] = [];
                acc[b.announcementId].push(b);
                return acc;
            }, {});

            return announcements.map(a => {
                let targetSwimmerIds = a.targetSwimmerIds;
                if (typeof targetSwimmerIds === 'string') {
                    try { targetSwimmerIds = JSON.parse(targetSwimmerIds); } catch { targetSwimmerIds = []; }
                }
                return { ...a, targetSwimmerIds, blocks: blocksByAnnId[a.id] || [] };
            });
        };

        const [announcements, archivedAnnouncements] = await Promise.all([
            fetchBlocksForAnnouncements(activeAnnouncementsRaw),
            fetchBlocksForAnnouncements(archivedAnnouncementsRaw)
        ]);

        const fetchDailyForWeekly = async (wfs: any[]) => {
            if (!wfs || wfs.length === 0) return wfs;
            const ids = wfs.map(w => w.id);
            const daily = await sql`SELECT * FROM "DailyFeedback" WHERE "weeklyFeedbackId" = ANY(${ids})`;
            
            const dailyByWfId = daily.reduce((acc: any, d: any) => {
                if (!acc[d.weeklyFeedbackId]) acc[d.weeklyFeedbackId] = [];
                acc[d.weeklyFeedbackId].push(d);
                return acc;
            }, {});

            return wfs.map(w => ({
                ...w,
                dailyFeedbacks: dailyByWfId[w.id] || []
            }));
        };

        const resolvedWeeklyFeedbacks = await fetchDailyForWeekly(weeklyFeedbacks);

        return NextResponse.json({
            plans: plans || [],
            swimmers: swimmers || [],
            feedbacks: feedbacks || [],
            attendance: attendance || [],
            performances: performances || [],
            weeklyPlans: weeklyPlans || [],
            announcements: announcements || [],
            archivedAnnouncements: archivedAnnouncements || [],
            weeklyFeedbacks: resolvedWeeklyFeedbacks || []
        }, { headers: V12_FINGERPRINT });
    });
}
