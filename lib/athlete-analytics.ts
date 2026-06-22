import { AttendanceRecord, PerformanceRecord, TrainingPlan, Feedback } from "@/types";

/**
 * Athlete analytics computed from data the system actually has:
 * attendance records, training plans, performance records, and feedback.
 * No hardware data required.
 */

// ─── Streak ──────────────────────────────────────────────────────

/**
 * Computes consecutive training days from attendance records.
 * Counts backwards from today; a streak breaks on the first
 * training-day-without-attendance gap.
 *
 * If a swimmer has a stored `currentStreak` we prefer it (set by the
 * server during check-in) and only fall back to computation when it's 0.
 */
export function computeStreak(
  swimmerStreak: number | undefined,
  attendance: AttendanceRecord[],
  plans: TrainingPlan[],
  selectedDate: Date,
  group: string
): number {
  // Prefer server-computed streak if present and meaningful
  if (swimmerStreak && swimmerStreak > 0) return swimmerStreak;

  // Compute from attendance records
  const today = selectedDate.toISOString().split("T")[0];
  const swimmerAttendance = attendance
    .filter((a) => a.status === "Present" || a.status === "AthletePresent")
    .map((a) => a.date)
    .sort()
    .reverse();

  // If no attendance records, return 0
  if (swimmerAttendance.length === 0) return 0;

  // Get all training plan dates for this group up to today
  const planDates = plans
    .filter((p) => p.group === group && p.date <= today)
    .map((p) => p.date)
    .sort()
    .reverse();

  // Count consecutive training days with attendance
  let streak = 0;
  const attendedSet = new Set(swimmerAttendance);

  for (const d of planDates) {
    if (attendedSet.has(d)) {
      streak++;
    } else if (streak === 0 && d === today) {
      // Today is a training day but not yet attended — that's fine,
      // continue looking backwards for past streak
    } else {
      break;
    }
  }

  return streak;
}

// ─── Efficiency Index ────────────────────────────────────────────

/**
 * A composite score (0-100) reflecting how engaged the athlete is.
 * Based on three pillars:
 *   1. Attendance rate (40%) — what % of scheduled training days they attended
 *   2. Feedback coverage (30%) — how many of their training days have feedback
 *   3. Plan engagement (30%) — block feedbacks submitted vs blocks available
 *
 * Returns null if there's insufficient data to compute meaningfully.
 */
export function computeEfficiencyIndex(
  attendance: AttendanceRecord[],
  plans: TrainingPlan[],
  feedbacks: Feedback[],
  group: string,
  swimmerId: string,
  windowDays: number = 30
): { score: number; breakdown: string } | null {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - windowDays);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  // Recent plans for this group
  const recentPlans = plans.filter(
    (p) => p.group === group && p.date >= cutoffStr
  );
  if (recentPlans.length === 0) return null;

  const recentPlanDates = new Set(recentPlans.map((p) => p.date));

  // 1. Attendance rate (40%)
  const myAttendance = attendance.filter(
    (a) =>
      (a.status === "Present" || a.status === "AthletePresent") &&
      recentPlanDates.has(a.date)
  );
  const attendanceRate =
    recentPlans.length > 0 ? myAttendance.length / recentPlans.length : 0;

  // 2. Feedback coverage (30%)
  const myFeedbackDates = new Set(
    feedbacks
      .filter((f) => f.swimmerId === swimmerId && f.date >= cutoffStr)
      .map((f) => f.date)
  );
  const attendedDates = new Set(myAttendance.map((a) => a.date));
  const feedbackCoverage =
    attendedDates.size > 0
      ? [...attendedDates].filter((d) => myFeedbackDates.has(d)).length /
        attendedDates.size
      : 0;

  // 3. Plan engagement — block feedbacks per plan (30%)
  // We use the count of unique plan IDs in feedbacks as a proxy
  const feedbackPlanIds = new Set(
    feedbacks
      .filter((f) => f.swimmerId === swimmerId && f.planId !== "weekly")
      .map((f) => f.planId)
  );
  const planEngagement =
    recentPlans.length > 0
      ? Math.min(1, feedbackPlanIds.size / recentPlans.length)
      : 0;

  const score = Math.round(
    attendanceRate * 40 + feedbackCoverage * 30 + planEngagement * 30
  );

  if (attendanceRate === 0 && feedbackCoverage === 0 && planEngagement === 0)
    return null;

  return { score: Math.min(100, score), breakdown: `${Math.round(attendanceRate * 100)}%出勤 · ${Math.round(feedbackCoverage * 100)}%反馈` };
}

// ─── Critical Speed ──────────────────────────────────────────────

/**
 * Estimates critical speed (m/s) from performance records.
 * Uses the classic 2-point CS formula if we have records for
 * at least two different distances; otherwise returns null.
 */
export function computeCriticalSpeed(
  performances: PerformanceRecord[],
  swimmerId: string
): number | null {
  const myPerfs = performances
    .filter((p) => p.swimmerId === swimmerId && p.time)
    .map((p) => {
      const distance = parseEventDistance(p.event);
      const time = parseFloat(p.time);
      return { distance, time, event: p.event };
    })
    .filter((p) => p.distance > 0 && p.time > 0);

  if (myPerfs.length < 2) return null;

  // Find two events at different distances for CS calculation
  // CS = (d2 - d1) / (t2 - t1)  [from the slope of distance vs time]
  const distances = [...new Set(myPerfs.map((p) => p.distance))].sort(
    (a, b) => a - b
  );
  if (distances.length < 2) return null;

  // Use the shortest and longest distances for best CS estimate
  const shortest = distances[0];
  const longest = distances[distances.length - 1];

  const shortRecord = myPerfs.find((p) => p.distance === shortest);
  const longRecord = myPerfs.find((p) => p.distance === longest);

  if (!shortRecord || !longRecord) return null;
  if (longRecord.time <= shortRecord.time) return null;

  const cs =
    (longRecord.distance - shortRecord.distance) /
    (longRecord.time - shortRecord.time);

  // Sanity check: CS should be between 0.8 and 2.5 m/s
  if (cs < 0.8 || cs > 2.5) return null;

  return Math.round(cs * 100) / 100;
}

/**
 * Parses a swim event string like "100Free" or "200IM" into meters.
 */
function parseEventDistance(event: string): number {
  const match = event.match(/^(\d+)/);
  if (!match) return 0;
  return parseInt(match[1], 10);
}

// ─── Stroke Distribution ─────────────────────────────────────────

/**
 * Analyzes training plan blocks to compute stroke distribution.
 * Returns an array of { stroke, distance, pct } sorted by distance desc.
 */
export function computeStrokeDistribution(
  plans: TrainingPlan[],
  group: string,
  selectedDate: Date
): { stroke: string; distance: number; pct: number }[] {
  const dateStr = selectedDate.toISOString().split("T")[0];
  const dayPlans = plans.filter(
    (p) => p.group === group && p.date === dateStr
  );

  const strokeDistances: Record<string, number> = {};

  for (const plan of dayPlans) {
    for (const block of plan.blocks || []) {
      for (const item of block.items || []) {
        const stroke = item.stroke || "Choice";
        const totalDist = (item.repeats || 1) * (item.distance || 0);

        // If there's an alternate stroke, split the distance
        if (item.alternateStroke && item.alternateStroke !== stroke) {
          const half = totalDist / 2;
          strokeDistances[stroke] = (strokeDistances[stroke] || 0) + half;
          strokeDistances[item.alternateStroke] =
            (strokeDistances[item.alternateStroke] || 0) + half;
        } else {
          strokeDistances[stroke] = (strokeDistances[stroke] || 0) + totalDist;
        }
      }
    }
  }

  const total = Object.values(strokeDistances).reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  return Object.entries(strokeDistances)
    .map(([stroke, distance]) => ({
      stroke,
      distance: Math.round(distance),
      pct: Math.round((distance / total) * 100),
    }))
    .sort((a, b) => b.distance - a.distance);
}

// ─── Training Intensity Profile ──────────────────────────────────

/**
 * Computes intensity distribution across the training plan.
 * Returns counts per intensity level for the day's plan.
 */
export function computeIntensityProfile(
  plans: TrainingPlan[],
  group: string,
  selectedDate: Date
): Record<string, number> {
  const dateStr = selectedDate.toISOString().split("T")[0];
  const dayPlans = plans.filter(
    (p) => p.group === group && p.date === dateStr
  );

  const profile: Record<string, number> = {};

  for (const plan of dayPlans) {
    for (const block of plan.blocks || []) {
      for (const item of block.items || []) {
        const intensity = item.intensity || "Moderate";
        profile[intensity] = (profile[intensity] || 0) + 1;
      }
    }
  }

  return profile;
}

// ─── Plan-derived Pace Targets ───────────────────────────────────

/**
 * Estimates pace targets from training plan data.
 * Returns suggested pace per 100m based on training type and intensity.
 * These are coach-suggested targets derived from the plan's focus.
 */
export function estimatePaceTarget(
  trainingType?: string,
  primaryStroke?: string
): { pace100m: string; label: string } | null {
  if (!trainingType) return null;

  // Pace estimates based on common swimming standards
  // These are suggested targets, not measured actuals
  const paces: Record<string, Record<string, { pace100m: string; label: string }>> = {
    aerobic: {
      Free: { pace100m: "1:30-1:45", label: "有氧配速" },
      Back: { pace100m: "1:35-1:50", label: "有氧配速" },
      Breast: { pace100m: "1:40-1:55", label: "有氧配速" },
      Fly: { pace100m: "1:20-1:35", label: "有氧配速" },
      IM: { pace100m: "1:30-1:45", label: "有氧配速" },
      Choice: { pace100m: "1:30-1:45", label: "有氧配速" },
    },
    anaerobic: {
      Free: { pace100m: "1:05-1:15", label: "乳酸阈配速" },
      Back: { pace100m: "1:10-1:20", label: "乳酸阈配速" },
      Breast: { pace100m: "1:15-1:25", label: "乳酸阈配速" },
      Fly: { pace100m: "1:00-1:10", label: "乳酸阈配速" },
      IM: { pace100m: "1:10-1:20", label: "乳酸阈配速" },
      Choice: { pace100m: "1:05-1:15", label: "乳酸阈配速" },
    },
    sprint: {
      Free: { pace100m: "55s-1:05", label: "冲刺配速" },
      Back: { pace100m: "1:00-1:10", label: "冲刺配速" },
      Breast: { pace100m: "1:05-1:15", label: "冲刺配速" },
      Fly: { pace100m: "50s-1:00", label: "冲刺配速" },
      IM: { pace100m: "1:00-1:10", label: "冲刺配速" },
      Choice: { pace100m: "55s-1:05", label: "冲刺配速" },
    },
    lactate: {
      Free: { pace100m: "1:00-1:10", label: "乳酸阈配速" },
      Back: { pace100m: "1:05-1:15", label: "乳酸阈配速" },
      Breast: { pace100m: "1:10-1:20", label: "乳酸阈配速" },
      Fly: { pace100m: "55s-1:05", label: "乳酸阈配速" },
      IM: { pace100m: "1:05-1:15", label: "乳酸阈配速" },
      Choice: { pace100m: "1:00-1:10", label: "乳酸阈配速" },
    },
    recovery: {
      Free: { pace100m: "2:00+", label: "恢复配速" },
      Back: { pace100m: "2:00+", label: "恢复配速" },
      Breast: { pace100m: "2:00+", label: "恢复配速" },
      Fly: { pace100m: "1:50+", label: "恢复配速" },
      IM: { pace100m: "2:00+", label: "恢复配速" },
      Choice: { pace100m: "2:00+", label: "恢复配速" },
    },
    endurance: {
      Free: { pace100m: "1:25-1:40", label: "耐力配速" },
      Back: { pace100m: "1:30-1:45", label: "耐力配速" },
      Breast: { pace100m: "1:35-1:50", label: "耐力配速" },
      Fly: { pace100m: "1:15-1:30", label: "耐力配速" },
      IM: { pace100m: "1:25-1:40", label: "耐力配速" },
      Choice: { pace100m: "1:25-1:40", label: "耐力配速" },
    },
    race_prep: {
      Free: { pace100m: "50s-1:00", label: "比赛配速" },
      Back: { pace100m: "55s-1:05", label: "比赛配速" },
      Breast: { pace100m: "1:00-1:10", label: "比赛配速" },
      Fly: { pace100m: "48s-58s", label: "比赛配速" },
      IM: { pace100m: "55s-1:05", label: "比赛配速" },
      Choice: { pace100m: "50s-1:00", label: "比赛配速" },
    },
  };

  const stroke = primaryStroke || "Choice";
  return paces[trainingType]?.[stroke] || paces[trainingType]?.["Choice"] || null;
}
