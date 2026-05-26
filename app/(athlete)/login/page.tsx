"use client";

import { LoginForm } from "@/components/athlete/LoginForm";
import { Waves, UserCog, User } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { WaveAnimation } from "@/components/common/WaveAnimation";

function LoginContent() {
    const searchParams = useSearchParams();
    const [isCoach, setIsCoach] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const timer = setTimeout(() => {
            if (isMounted && searchParams.get("role") === "coach") {
                setIsCoach(true);
            }
        }, 0);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [searchParams]);

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
                        {isCoach ? "教练登录" : "队员训练通道"}
                    </p>
                </div>

                {/* Role Toggle */}
                <div className="flex p-1 bg-secondary/30 rounded-xl max-w-[240px] mx-auto">
                    <button
                        onClick={() => setIsCoach(false)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg transition-all",
                            !isCoach ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <User className="w-4 h-4" /> 队员
                    </button>
                    <button
                        onClick={() => setIsCoach(true)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg transition-all",
                            isCoach ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <UserCog className="w-4 h-4" /> 教练
                    </button>
                </div>

                {/* Login Form */}
                <div className="bg-card/50 p-6 rounded-3xl border border-border/50 backdrop-blur-sm">
                    <LoginForm mode={isCoach ? "coach" : "athlete"} />
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    {isCoach ? "Powered by AquaFlow Pro" : "忘记信息？请联系教练"}
                </p>
            </div>

            {/* Wave Animation */}
            <WaveAnimation />
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
