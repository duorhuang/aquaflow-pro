"use client";

import Link from "next/link";
import { ArrowRight, UserCog, User, Waves, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { WaveAnimation } from "@/components/common/WaveAnimation";
import { motion } from "framer-motion";

export default function Home() {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020b14] text-white relative overflow-hidden">
      {/* Premium Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#021526] via-[#052220] to-[#01090d] z-0" />
      
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Main Content Card */}
      <motion.div 
        className="text-center space-y-10 relative z-10 max-w-3xl px-6 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Brand Badge */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono tracking-widest text-emerald-400 uppercase shadow-lg backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> 
            <span>Next-Gen Swim Platform</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 drop-shadow-xl">
            <span className="text-white">AquaFlow</span>
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              PRO
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground/90 leading-relaxed max-w-xl mx-auto font-sans font-light">
            游泳队专业训练管理系统
            <span className="block text-xs mt-3 text-emerald-400/70 uppercase tracking-[0.2em] font-mono font-medium">
              科学赋能 · 游戏化竞技 · 状态追踪
            </span>
          </p>
        </motion.div>

        {/* Action buttons row */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-6">
          {/* Coach Login - Life of Enthusiasm (Amber/Orange theme) */}
          <Link href="/login?role=coach" className="w-full sm:w-auto block group">
            <div className="relative flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform group-hover:-translate-y-1 group-active:translate-y-0 shadow-[0_10px_30px_-10px_rgba(245,159,0,0.5)] group-hover:shadow-[0_15px_40px_-10px_rgba(245,159,0,0.7)] border border-amber-400/50">
              <UserCog className="w-5.5 h-5.5" />
              <span>{t.common.coach}{t.common.login}</span>
              <ArrowRight className="w-5 h-5 ml-1 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* Athlete Login - Style of Nature (Emerald/Teal Glass theme) */}
          <Link href="/login?role=athlete" className="w-full sm:w-auto block group">
            <div className="relative flex items-center justify-center gap-3 bg-white/5 backdrop-blur-xl text-emerald-400 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform group-hover:-translate-y-1 group-active:translate-y-0 border border-emerald-500/20 group-hover:border-emerald-400/50 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.1)] group-hover:shadow-[0_15px_40px_-10px_rgba(16,185,129,0.25)] hover:bg-white/10">
              <User className="w-5.5 h-5.5" />
              <span>{t.common.athlete}{t.common.login}</span>
            </div>
          </Link>
        </motion.div>

        {/* Small nature detail badge */}
        <motion.div variants={itemVariants} className="pt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground/50 font-mono">
          <Waves className="w-4 h-4 text-cyan-500/60" />
          <span>Flow with Nature, Strive with Passion</span>
        </motion.div>
      </motion.div>

      {/* Decorative Wave at bottom */}
      <WaveAnimation />
    </div>
  );
}

