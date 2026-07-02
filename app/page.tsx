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
    <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50 text-sky-950 relative overflow-hidden">
      {/* Premium Nature Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop')" }}
      />
      
      {/* Ambient Gradient Overlays for readability and ocean feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/40 via-sky-500/30 to-blue-700/50 z-0 backdrop-blur-[2px]" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-900/40 to-transparent z-0" />
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-sky-900/60 to-transparent z-0" />

      {/* Main Content Card */}
      <motion.div 
        className="text-center space-y-10 relative z-10 max-w-3xl px-6 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Brand Badge */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 border border-white/40 text-xs font-mono tracking-widest text-white uppercase shadow-lg backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> 
            <span>Next-Gen Swim Platform</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 drop-shadow-2xl">
            <span className="text-white">AquaFlow</span>
            <span className="bg-gradient-to-r from-cyan-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
              PRO
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/95 leading-relaxed max-w-xl mx-auto font-sans font-medium drop-shadow-md">
            游泳队专业训练管理系统
            <span className="block text-xs mt-3 text-cyan-50/90 uppercase tracking-[0.2em] font-mono font-bold">
              科学赋能 · 游戏化竞技 · 状态追踪
            </span>
          </p>
        </motion.div>

        {/* Action buttons row */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-6">
          {/* Coach Login - Sunset Theme */}
          <Link href="/login?role=coach" className="w-full sm:w-auto block group">
            <div className="relative flex items-center justify-center gap-3 bg-gradient-to-r from-orange-400 to-rose-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform group-hover:-translate-y-1 group-active:translate-y-0 shadow-lg group-hover:shadow-[0_15px_30px_-10px_rgba(244,63,94,0.5)] border border-white/20 backdrop-blur-md">
              <UserCog className="w-5.5 h-5.5" />
              <span>{t.common.coach}{t.common.login}</span>
              <ArrowRight className="w-5 h-5 ml-1 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* Athlete Login - Ocean Theme */}
          <Link href="/login?role=athlete" className="w-full sm:w-auto block group">
            <div className="relative flex items-center justify-center gap-3 bg-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform group-hover:-translate-y-1 group-active:translate-y-0 border border-white/40 group-hover:border-white/60 shadow-lg group-hover:shadow-[0_15px_30px_-10px_rgba(255,255,255,0.4)] hover:bg-white/30">
              <User className="w-5.5 h-5.5" />
              <span>{t.common.athlete}{t.common.login}</span>
            </div>
          </Link>
        </motion.div>

        {/* Small nature detail badge */}
        <motion.div variants={itemVariants} className="pt-12 flex items-center justify-center gap-2 text-xs text-white/80 font-mono drop-shadow-sm">
          <Waves className="w-4 h-4 text-cyan-200" />
          <span>Flow with Nature, Strive with Passion</span>
        </motion.div>
      </motion.div>

      {/* Decorative Wave at bottom */}
      <WaveAnimation />
    </div>
  );
}

