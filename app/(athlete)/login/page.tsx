"use client";

import { LoginForm } from "@/components/athlete/LoginForm";
import { Waves, UserCog, User, ShieldCheck } from "lucide-react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

function LoginContent() {
    const searchParams = useSearchParams();
    const [isCoach, setIsCoach] = useState(() => searchParams.get("role") === "coach");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative bg-background text-foreground transition-colors duration-300">
            {/* Soft, natural ambient background glow (adapts to theme) */}
            <div className="fixed inset-0 pointer-events-none opacity-70" style={{ background: "var(--theme-ambient)" }} />

            <motion.div 
                className="w-full max-w-md space-y-6 relative z-10"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Brand Header */}
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-sm">
                        <Waves className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        AquaFlow Pro
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        {isCoach ? "教练管理系统 · 训练规划与考勤追踪" : "队员成长空间 · 每日计划与训练反馈"}
                    </p>
                </div>

                {/* Role Toggle */}
                <div className="flex p-1 bg-secondary/80 rounded-2xl max-w-[280px] mx-auto border border-border/80 shadow-sm" role="radiogroup" aria-label="选择身份角色">
                    <button
                        type="button"
                        onClick={() => setIsCoach(false)}
                        role="radio"
                        aria-checked={!isCoach}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-semibold rounded-xl transition-all min-h-[44px]",
                            !isCoach
                                ? "bg-card text-foreground shadow-sm border border-border/60"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <User className="w-4 h-4" />
                        <span>队员登录</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsCoach(true)}
                        role="radio"
                        aria-checked={isCoach}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-semibold rounded-xl transition-all min-h-[44px]",
                            isCoach
                                ? "bg-card text-foreground shadow-sm border border-border/60"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <UserCog className="w-4 h-4" />
                        <span>教练登录</span>
                    </button>
                </div>

                {/* Login Form Card */}
                <div className="bg-card border border-border p-6 sm:p-8 rounded-xl shadow-xs relative">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={isCoach ? "coach" : "athlete"}
                            initial={{ opacity: 0, x: isCoach ? 12 : -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isCoach ? -12 : 12 }}
                            transition={{ duration: 0.2 }}
                        >
                            <LoginForm mode={isCoach ? "coach" : "athlete"} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer security & help hint */}
                <div className="text-center text-xs text-muted-foreground space-y-1.5 pt-2">
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground/80">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>校队训练专用平台 · 数据本地加密存储</span>
                    </div>
                    <p>
                        {isCoach ? "如需重置教练初始密码，请进入初始化页面" : "如忘记队员账号或密码，请向带队教练申请重置"}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground font-mono text-xs">加载中...</p>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
