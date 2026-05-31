"use client";

import Link from "next/link";
import { ArrowRight, UserCog, User, Waves, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { WaveAnimation } from "@/components/common/WaveAnimation";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#021516] via-[#052220] to-[#01090d] text-white relative overflow-hidden">
      {/* Decorative Natural Floating Bubbles */}
      <div className="absolute top-1/4 left-1/10 w-24 h-24 rounded-full bg-cyan-500/5 blur-xl animate-float" style={{ animationDelay: "0s" }} />
      <div className="absolute top-1/3 right-1/8 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl animate-float" style={{ animationDelay: "1.5s" }} />
      <div className="absolute bottom-1/3 left-1/5 w-16 h-16 rounded-full bg-teal-500/5 blur-lg animate-float" style={{ animationDelay: "0.8s" }} />
      <div className="absolute top-10 right-1/4 w-20 h-20 rounded-full bg-yellow-500/5 blur-xl animate-float" style={{ animationDelay: "2.2s" }} />

      {/* Main Content Card */}
      <div className="text-center space-y-8 animate-in fade-in zoom-in duration-1000 relative z-10 max-w-2xl px-6">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono tracking-widest text-emerald-400 uppercase shadow-md animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen Swim Platform
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter flex items-center justify-center gap-2">
            <span>AquaFlow</span>
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]">
              PRO
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto font-sans">
            游泳队训练管理系统
            <span className="block text-xs mt-2 text-muted-foreground/60 uppercase tracking-widest font-mono">
              科学赋能 · 游戏化竞技 · 状态追踪
            </span>
          </p>
        </div>

        {/* Action buttons row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          {/* Coach Login - Life of Enthusiasm (Amber/Orange theme) */}
          <Link
            href="/login?role=coach"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 px-8 py-4 rounded-2xl font-bold text-lg hover:scale-[1.04] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(245,159,0,0.25)] hover:shadow-[0_0_40px_rgba(245,159,0,0.45)] border border-amber-400/50"
          >
            <UserCog className="w-5.5 h-5.5" />
            <span>{t.common.coach}{t.common.login}</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>

          {/* Athlete Login - Style of Nature (Emerald/Teal Glass theme) */}
          <Link
            href="/workout"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-cyan-500/20 text-emerald-400 px-8 py-4 rounded-2xl font-bold text-lg hover:scale-[1.04] active:scale-[0.98] hover:bg-emerald-500/35 hover:text-emerald-300 transition-all border border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_0_25px_rgba(16,185,129,0.12)] hover:shadow-[0_0_35px_rgba(16,185,129,0.25)]"
          >
            <User className="w-5.5 h-5.5" />
            <span>{t.common.athlete}{t.common.login}</span>
          </Link>
        </div>

        {/* Small nature detail badge */}
        <div className="pt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground/60 font-mono">
          <Waves className="w-4 h-4 text-emerald-500/60 animate-pulse" />
          <span>Flow with Nature, Strive with Passion</span>
        </div>
      </div>

      {/* Decorative Wave at bottom */}
      <WaveAnimation />
    </div>
  );
}

