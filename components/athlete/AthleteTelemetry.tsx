"use client";

import {
  computeStreak,
  computeEfficiencyIndex,
  computeCriticalSpeed,
  computeStrokeDistribution,
  estimatePaceTarget,
} from "@/lib/athlete-analytics";
import { TrainingPlan, AttendanceRecord, Feedback, PerformanceRecord, Swimmer } from "@/types";
import { Activity, TrendingUp, Waves } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const STROKE_COLORS: Record<string, string> = {
  Free: "bg-primary",
  Back: "bg-info",
  Breast: "bg-warning",
  Fly: "bg-destructive",
  IM: "bg-purple-500",
  Choice: "bg-muted-foreground",
};

const STROKE_LABELS: Record<string, string> = {
  Free: "自由泳",
  Back: "仰泳",
  Breast: "蛙泳",
  Fly: "蝶泳",
  IM: "混合泳",
  Choice: "选择",
};

interface AthleteTelemetryProps {
  plans: TrainingPlan[];
  attendance: AttendanceRecord[];
  feedbacks: Feedback[];
  performances: PerformanceRecord[];
  currentUser: Swimmer | null;
  selectedDate: Date;
  group: string;
}

export function AthleteTelemetry({
  plans,
  attendance,
  feedbacks,
  performances,
  currentUser,
  selectedDate,
  group,
}: AthleteTelemetryProps) {
  const { t } = useLanguage();

  // ── Compute all metrics ───────────────────────────────────────
  const streak = computeStreak(
    currentUser?.currentStreak,
    attendance,
    plans,
    selectedDate,
    group
  );

  const efficiency = computeEfficiencyIndex(
    attendance,
    plans,
    feedbacks,
    group,
    currentUser?.id || "",
    30
  );

  const criticalSpeed = computeCriticalSpeed(performances, currentUser?.id || "");

  const strokeDistribution = computeStrokeDistribution(
    plans,
    group,
    selectedDate
  );

  const paceTarget = estimatePaceTarget(
    plans.find((p) => p.group === group && p.date === selectedDate.toISOString().split("T")[0])?.trainingType,
    plans.find((p) => p.group === group && p.date === selectedDate.toISOString().split("T")[0])?.primaryStroke
  );

  // ─── Circular progress ring calc ───────────────────────────────
  const circumference = 2 * Math.PI * 28; // r=28
  const streakProgress = Math.min(streak / 30, 1); // Max 30-day visual
  const dashOffset = circumference * (1 - streakProgress);

  // ─── Attendance ranking ────────────────────────────────────────
  const attendanceRate = (() => {
    const myAttendance = attendance.filter(
      (a) => a.swimmerId === currentUser?.id && (a.status === "Present" || a.status === "AthletePresent")
    ).length;
    const totalTrainingDays = plans.filter(p => p.group === group).length;
    return totalTrainingDays > 0 ? myAttendance / totalTrainingDays : 0;
  })();

  // Rank among all swimmers in the group
  const myRank = (() => {
    const swimmerAttendance: Record<string, number> = {};
    attendance
      .filter(a => a.status === "Present" || a.status === "AthletePresent")
      .forEach(a => {
        swimmerAttendance[a.swimmerId] = (swimmerAttendance[a.swimmerId] || 0) + 1;
      });
    const myCount = swimmerAttendance[currentUser?.id || ""] || 0;
    const sorted = Object.values(swimmerAttendance).sort((a, b) => b - a);
    const rank = sorted.indexOf(myCount) + 1;
    const total = sorted.length;
    return total > 0 ? Math.round((rank / total) * 100) : 0;
  })();

  const topPct = Math.max(1, Math.min(99, myRank));

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Top row: Streak + Efficiency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 连续训练 Streak Card */}
        <div className="bg-card/50 border border-border/50 rounded-2xl p-5 relative overflow-hidden flex items-center justify-between glow-border">
          <div className="relative z-10 space-y-1">
            <p className="font-label-caps text-xs text-muted-foreground uppercase">连续训练</p>
            <h4 className="text-lg font-bold text-white font-display-metrics">
              {streak > 0 ? `${streak}天连续训练` : "暂无训练记录"}
            </h4>
            <p className="text-[11px] text-muted-foreground/80">
              {streak > 0
                ? `本月训练率位列全队前 ${topPct}%`
                : "完成今日训练开始你的连胜！"}
            </p>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                className="text-secondary/20"
                cx="32"
                cy="32"
                fill="transparent"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
              />
              <circle
                className="text-primary"
                cx="32"
                cy="32"
                fill="transparent"
                r="28"
                stroke="currentColor"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display-metrics text-base text-primary">
                {streak}
              </span>
            </div>
          </div>
        </div>

        {/* 训练指标分析 Metrics Card */}
        <div className="bg-card/50 border border-border/50 rounded-2xl p-5 glow-border space-y-3">
          <h4 className="font-label-caps text-xs text-muted-foreground uppercase">训练指标分析</h4>
          <div className="space-y-2">
            {/* Efficiency Index */}
            {efficiency ? (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">效率指数</span>
                  <span className="font-label-caps font-bold text-primary">
                    {efficiency.score}%{" "}
                    {efficiency.score >= 70 ? "↑" : efficiency.score >= 40 ? "→" : "↓"}
                  </span>
                </div>
                <div className="w-full h-1 bg-secondary/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${efficiency.score}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground/60">
                  {efficiency.breakdown}
                </p>
              </>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">效率指数</span>
                <span className="text-muted-foreground/50 text-[10px]">
                  训练后自动生成
                </span>
              </div>
            )}

            {/* Critical Speed or Pace Target */}
            {criticalSpeed ? (
              <>
                <div className="flex items-center justify-between text-xs mt-3">
                  <span className="text-muted-foreground">临界速度</span>
                  <span className="font-label-caps font-bold text-white">
                    {criticalSpeed.toFixed(2)} m/s
                  </span>
                </div>
                <div
                  className="w-full h-1 bg-secondary/30 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-warning rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (criticalSpeed / 2.5) * 100)}%`,
                    }}
                  />
                </div>
              </>
            ) : paceTarget ? (
              <>
                <div className="flex items-center justify-between text-xs mt-3">
                  <span className="text-muted-foreground">目标配速 (100m)</span>
                  <span className="font-label-caps font-bold text-warning">
                    {paceTarget.pace100m}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground/50">
                  {paceTarget.label} · 基于今日训练计划
                </p>
              </>
            ) : (
              <div className="flex items-center justify-between text-xs mt-3">
                <span className="text-muted-foreground">临界速度</span>
                <span className="text-muted-foreground/50 text-[10px]">
                  记录成绩后显示
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stroke Distribution Chart — replaces the fake telemetry chart */}
      {strokeDistribution.length > 0 ? (
        <div className="bg-card/50 border border-border/50 rounded-2xl p-6 glow-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-label-caps text-xs text-primary uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              泳姿分布
            </h3>
            <div className="flex gap-3">
              {strokeDistribution.map((s) => (
                <div key={s.stroke} className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${STROKE_COLORS[s.stroke] || "bg-muted-foreground"}`}
                  />
                  <span className="text-[10px] font-label-caps text-muted-foreground">
                    {STROKE_LABELS[s.stroke] || s.stroke}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart: each stroke gets a bar proportional to its distance */}
          <div className="h-28 w-full flex items-end gap-3 px-2">
            {strokeDistribution.map((s) => {
              const maxDist = Math.max(...strokeDistribution.map((d) => d.distance));
              const heightPct = maxDist > 0 ? (s.distance / maxDist) * 100 : 0;
              return (
                <div
                  key={s.stroke}
                  className="flex-1 flex flex-col items-center justify-end group"
                >
                  <div
                    className={`w-full rounded-t transition-all duration-500 cursor-pointer hover:opacity-80 ${STROKE_COLORS[s.stroke] || "bg-muted-foreground"}/30`}
                    style={{ height: `${Math.max(heightPct, 8)}%` }}
                    title={`${STROKE_LABELS[s.stroke] || s.stroke}: ${s.distance}m (${s.pct}%)`}
                  />
                  <div className="mt-2 text-center">
                    <span className="text-[9px] font-label-caps text-muted-foreground block">
                      {STROKE_LABELS[s.stroke] || s.stroke}
                    </span>
                    <span className="text-[9px] text-muted-foreground/60">
                      {s.distance}m
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total distance for the day */}
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              今日训练总量
            </span>
            <span className="text-xs font-bold text-white">
              {strokeDistribution.reduce((a, s) => a + s.distance, 0)}m
            </span>
          </div>
        </div>
      ) : (
        /* No training today — show a gentle placeholder */
        <div className="bg-card/50 border border-border/50 rounded-2xl p-6 glow-border text-center">
          <Waves className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">今日无训练计划</p>
          <p className="text-[10px] text-muted-foreground/50 mt-1">
            训练日将显示泳姿分布分析
          </p>
        </div>
      )}
    </div>
  );
}
