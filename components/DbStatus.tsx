"use client";

import { useStore } from "@/lib/store";
import { Loader2, Database } from "lucide-react";

export function DbStatus() {
  const { dbWaking, dbOffline } = useStore();

  if (dbOffline) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 bg-zinc-900/90 border border-amber-500/30 text-amber-400 rounded-full shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500">
        <Database className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-medium tracking-wide">
          数据库已达到当月传输上限，当前显示本地缓存数据
        </span>
      </div>
    );
  }

  if (!dbWaking) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 bg-zinc-900/90 border border-amber-500/30 text-amber-500 rounded-full shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500">
      <Database className="w-4 h-4 animate-pulse" />
      <span className="text-xs font-medium tracking-wide">
        正在唤醒数据库 (约需 10s)...
      </span>
      <Loader2 className="w-3 h-3 animate-spin opacity-50" />
    </div>
  );
}
