'use client';

import { useRouter } from 'next/navigation';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020b14] text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#021526] via-[#052220] to-[#01090d] z-0" />
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="text-center space-y-8 relative z-10 max-w-2xl px-6">
        {/* 404 Number */}
        <div className="space-y-2">
          <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-emerald-400/80 to-emerald-600/40 drop-shadow-[0_0_40px_rgba(16,185,129,0.3)]">
            404
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-white/90">
            页面未找到
          </p>
          <p className="text-muted-foreground max-w-md mx-auto">
            您查找的页面似乎不存在。可能是链接已过期或页面已被移除。
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-emerald-500/20 text-emerald-400 hover:bg-white/10 hover:border-emerald-400/50 transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            返回上一页
          </button>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_40px_-10px_rgba(16,185,129,0.5)]"
          >
            <Home className="w-4 h-4" />
            返回首页
          </button>
        </div>

        {/* Helpful links */}
        <div className="pt-8 border-t border-white/10">
          <p className="text-sm text-muted-foreground mb-4">热门链接：</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 hover:text-emerald-400 transition-all"
            >
              登录
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 hover:text-emerald-400 transition-all"
            >
              教练控制台
            </button>
            <button
              onClick={() => router.push('/workout')}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 hover:text-emerald-400 transition-all"
            >
              训练计划
            </button>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20" aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" fill="none" className="w-full h-full">
          <path d="M0 40 C120 20 240 60 360 40 C480 20 600 60 720 40 C840 20 960 60 1080 40 C1200 20 1320 60 1440 40 L1440 80 L0 80Z" fill="rgba(100, 255, 218, 0.3)" />
        </svg>
      </div>
    </div>
  );
}
