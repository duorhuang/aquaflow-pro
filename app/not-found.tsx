'use client';

import { useRouter } from 'next/navigation';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground relative p-6">
      {/* Content */}
      <div className="text-center space-y-6 max-w-md w-full">
        {/* 404 Number */}
        <div className="space-y-3">
          <span className="text-7xl sm:text-8xl font-mono font-bold text-primary/80 tracking-tight block">
            404
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            页面未找到
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            您访问的页面可能已被移动、删除或输入了错误的网址。
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回上一页
          </button>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 text-sm transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" />
            返回首页
          </button>
        </div>

        {/* Helpful links */}
        <div className="pt-6 border-t border-border mt-6">
          <p className="text-xs text-muted-foreground mb-3">常用入口：</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => router.push('/login')}
              className="px-3.5 py-1.5 rounded-lg bg-card border border-border text-xs text-foreground hover:bg-secondary transition-colors"
            >
              登录
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-3.5 py-1.5 rounded-lg bg-card border border-border text-xs text-foreground hover:bg-secondary transition-colors"
            >
              教练控制台
            </button>
            <button
              onClick={() => router.push('/workout')}
              className="px-3.5 py-1.5 rounded-lg bg-card border border-border text-xs text-foreground hover:bg-secondary transition-colors"
            >
              队员空间
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
