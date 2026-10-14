"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { BottomTabBar } from "@/components/athlete/BottomTabBar";
import { AthleteTrainingTab } from "@/components/athlete/views/AthleteTrainingTab";
import { AthleteFeedbackTab } from "@/components/athlete/views/AthleteFeedbackTab";
import { AthleteAchievementsTab } from "@/components/athlete/views/AthleteAchievementsTab";
import { AthleteProfileTab } from "@/components/athlete/views/AthleteProfileTab";
import { LEVEL_THRESHOLDS } from "@/lib/date-utils";
import { LogOut, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

function WorkoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        plans,
        swimmers,
        attendance,
        weeklyPlans,
        announcements,
        archivedAnnouncements,
        isLoaded: storeLoaded,
        currentUserInfo,
        isAuthLoading,
        triggerSync,
        syncStatus,
    } = useStore();

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Active tab from URL query params (training | feedback | achievements | profile)
    const tabParam = searchParams.get("tab") || "training";
    const activeTab = (tabParam === "feedback" || tabParam === "achievements" || tabParam === "profile")
        ? tabParam
        : "training";

    // Resolve current athlete
    const authUserId = currentUserInfo?.id || (typeof window !== "undefined" ? localStorage.getItem("aquaflow_athlete_id") : null);
    const currentUser = useMemo(() => {
        if (!storeLoaded || swimmers.length === 0) return null;
        if (authUserId) {
            const match = swimmers.find((s) => s.id === authUserId);
            if (match) return match;
        }
        return swimmers[0];
    }, [storeLoaded, swimmers, authUserId]);

    // Auth redirection
    useEffect(() => {
        if (isAuthLoading) return;
        const localId = typeof window !== "undefined" ? localStorage.getItem("aquaflow_athlete_id") : null;
        if (!currentUserInfo && !localId) {
            router.push("/login?role=athlete");
        }
    }, [isAuthLoading, currentUserInfo, router]);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        if (!window.confirm("确认要退出当前队员账号吗？")) return;
        setIsLoggingOut(true);
        try {
            await api.auth.logout();
        } catch {}
        localStorage.removeItem("aquaflow_athlete_id");
        router.push("/login?role=athlete");
    };

    // Calculate level & XP
    const swimmerXp = currentUser?.totalXp !== undefined ? currentUser.totalXp : (currentUser?.xp || 0);
    const level = currentUser?.level || 1;
    const currentMin = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextMin = LEVEL_THRESHOLDS[level] || currentMin + 10000;
    const denom = nextMin - currentMin;
    const progress = denom > 0 ? Math.min(100, Math.max(0, ((swimmerXp - currentMin) / denom) * 100)) : 0;

    // Loading Skeleton
    if (isAuthLoading || !storeLoaded) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">正在同步队员训练数据...</p>
            </div>
        );
    }

    // Unauthenticated state
    if (!currentUser) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                    <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-foreground">未检测到登录状态</h3>
                    <p className="text-xs text-muted-foreground mt-1">请返回登录页面并输入队员账号密码</p>
                </div>
                <button
                    onClick={() => router.push("/login?role=athlete")}
                    className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl"
                >
                    前往登录
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-200 safe-bottom-padding">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-card border-b border-border">
                <div className="flex items-center justify-between p-3 sm:p-4 max-w-2xl mx-auto">
                    {/* Athlete Info */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                            {currentUser.name.slice(0, 1)}
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h1 className="text-sm font-bold text-foreground tracking-tight">
                                    {currentUser.name}
                                </h1>
                                <span className="text-[10px] font-semibold bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                                    Lv.{level}
                                </span>
                            </div>
                            {/* Mini XP bar */}
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-20 h-1 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                    {swimmerXp} XP
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions: Sync & Logout */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => triggerSync(true)}
                            disabled={syncStatus === "syncing"}
                            className={cn(
                                "p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
                                syncStatus === "syncing" && "text-primary"
                            )}
                            title={syncStatus === "syncing" ? "正在同步最新数据..." : "点击同步最新训练"}
                            aria-label="同步数据"
                        >
                            <RefreshCw className={cn("w-4 h-4", syncStatus === "syncing" && "animate-spin")} />
                        </button>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                            title="退出登录"
                            aria-label="退出登录"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="p-4 max-w-2xl mx-auto">
                {activeTab === "training" && (
                    <AthleteTrainingTab
                        currentUser={currentUser}
                        plans={plans}
                        weeklyPlans={weeklyPlans}
                        announcements={announcements}
                        archivedAnnouncements={archivedAnnouncements}
                    />
                )}

                {activeTab === "feedback" && (
                    <AthleteFeedbackTab currentUser={currentUser} />
                )}

                {activeTab === "achievements" && (
                    <AthleteAchievementsTab
                        currentUser={currentUser}
                        attendance={attendance}
                        plans={plans}
                    />
                )}

                {activeTab === "profile" && (
                    <AthleteProfileTab currentUser={currentUser} />
                )}
            </main>

            {/* Mobile Bottom Tab Bar */}
            <BottomTabBar activeTab={activeTab} />
        </div>
    );
}

export default function AthleteWorkoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground">加载中...</p>
            </div>
        }>
            <WorkoutContent />
        </Suspense>
    );
}
