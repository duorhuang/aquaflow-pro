"use client";

import { LoginForm } from "@/components/athlete/LoginForm";
import { Waves, UserCog, User } from "lucide-react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { WaveAnimation } from "@/components/common/WaveAnimation";
import { useLanguage } from "@/lib/i18n";

function LoginContent() {
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const [isCoach, setIsCoach] = useState(() => searchParams.get("role") === "coach");

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
            {/* Background texture */}
            <div className="fixed inset-0 bg-theme-texture pointer-events-none z-0 opacity-20" aria-hidden="true" />

            <div className="w-full max-w-md space-y-8 relative z-10">
                {/* Logo */}
                <div className="text-center space-y-3">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-2 shadow-[0_0_30px_rgba(100,255,218,0.15)]">
                        <Waves className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">AquaFlow Pro</h1>
                    <p className="text-muted-foreground">
                        {isCoach ? (t.common.coach + "登录") : (t.common.athlete + "训练通道")}
                    </p>
                </div>

                {/* Role Toggle */}
                <div className="flex p-1 bg-secondary/30 rounded-xl max-w-[240px] mx-auto" role="radiogroup" aria-label="选择角色">
                    <button
                        onClick={() => setIsCoach(false)}
                        role="radio"
                        aria-checked={!isCoach}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg transition-all min-h-[44px]",
                            !isCoach ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <User className="w-4 h-4" /> {t.common.athlete}
                    </button>
                    <button
                        onClick={() => setIsCoach(true)}
                        role="radio"
                        aria-checked={isCoach}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg transition-all min-h-[44px]",
                            isCoach ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <UserCog className="w-4 h-4" /> {t.common.coach}
                    </button>
                </div>

                {/* Login Form */}
                <div className="bg-card/50 p-6 rounded-3xl border border-border/50 backdrop-blur-sm">
                    <LoginForm mode={isCoach ? "coach" : "athlete"} />
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    {isCoach ? "Powered by AquaFlow Pro" : `${t.common.forgotPassword || "忘记信息？"}${t.common.backToLogin ? "" : ""}联系${t.common.coach}`}
                </p>
            </div>

            {/* Wave Animation */}
            <WaveAnimation />
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-white">加载中...</div>}>
            <LoginContent />
        </Suspense>
    );
}
