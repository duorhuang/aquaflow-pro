"use client";

import { LoginForm } from "@/components/athlete/LoginForm";
import { Waves, UserCog, User } from "lucide-react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { WaveAnimation } from "@/components/common/WaveAnimation";
import { useLanguage } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

function LoginContent() {
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const [isCoach, setIsCoach] = useState(() => searchParams.get("role") === "coach");

    return (
        <div className="min-h-screen bg-[#020b14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Premium Background Gradients & Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#021526] via-[#052220] to-[#01090d] z-0" />
            <div className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
            <div className="fixed inset-0 bg-theme-texture pointer-events-none z-0 opacity-10" aria-hidden="true" />

            <motion.div 
                className="w-full max-w-md space-y-8 relative z-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Logo */}
                <div className="text-center space-y-4">
                    <motion.div 
                        className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-2 shadow-[0_0_40px_rgba(52,211,153,0.15)] border border-emerald-500/20 backdrop-blur-xl"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                        <Waves className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
                    </motion.div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent drop-shadow-sm">
                        AquaFlow Pro
                    </h1>
                    <p className="text-muted-foreground/80 font-medium">
                        {isCoach ? (t.common.coach + "管理后台") : (t.common.athlete + "训练通道")}
                    </p>
                </div>

                {/* Role Toggle */}
                <div className="flex p-1.5 bg-white/5 rounded-2xl max-w-[260px] mx-auto border border-white/10 backdrop-blur-md relative" role="radiogroup" aria-label="选择角色">
                    {/* Sliding Background for Active Tab */}
                    <motion.div
                        className="absolute inset-y-1.5 w-[calc(50%-0.375rem)] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg"
                        initial={false}
                        animate={{ x: isCoach ? "100%" : "0%" }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                    
                    <button
                        onClick={() => setIsCoach(false)}
                        role="radio"
                        aria-checked={!isCoach}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-colors min-h-[48px] relative z-10",
                            !isCoach ? "text-white" : "text-muted-foreground/70 hover:text-white"
                        )}
                    >
                        <User className="w-4.5 h-4.5" /> {t.common.athlete}
                    </button>
                    <button
                        onClick={() => setIsCoach(true)}
                        role="radio"
                        aria-checked={isCoach}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-colors min-h-[48px] relative z-10",
                            isCoach ? "text-white" : "text-muted-foreground/70 hover:text-white"
                        )}
                    >
                        <UserCog className="w-4.5 h-4.5" /> {t.common.coach}
                    </button>
                </div>

                {/* Login Form Container */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={isCoach ? "coach" : "athlete"}
                        initial={{ opacity: 0, x: isCoach ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isCoach ? -20 : 20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden"
                    >
                        {/* Subtle inner glow */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                        <LoginForm mode={isCoach ? "coach" : "athlete"} />
                    </motion.div>
                </AnimatePresence>

                <p className="text-center text-sm text-muted-foreground/50 mt-8">
                    {isCoach ? "Powered by AquaFlow Pro Engine" : `${t.common.forgotPassword || "忘记密码？"}请联系${t.common.coach}`}
                </p>
            </motion.div>

            {/* Wave Animation */}
            <div className="opacity-60">
                <WaveAnimation />
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020b14] flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
                <p className="text-emerald-400/80 font-mono tracking-widest text-sm animate-pulse">INITIALIZING...</p>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
