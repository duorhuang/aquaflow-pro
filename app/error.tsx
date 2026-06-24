"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    console.error("[App Error Boundary]", error.message, error.digest);
  }, [error]);

  const isSyncRelated =
    error.message?.includes("sync") ||
    error.message?.includes("Sync") ||
    error.message?.includes("fetch") ||
    error.message?.includes("network") ||
    error.message?.includes("timed out") ||
    error.message?.includes("quota") ||
    error.message?.includes("Database");

  const handleRetry = async () => {
    setIsResetting(true);
    try {
      reset();
    } finally {
      setTimeout(() => setIsResetting(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="space-y-6 max-w-md w-full">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
        </div>

        {/* Error Message */}
        <div className="space-y-3 text-center">
          <h2 className="text-xl font-bold text-white tracking-wide">
            {isSyncRelated ? "同步连接异常" : "应用出现了一些问题"}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isSyncRelated
              ? "与数据库的连接出现临时故障。您的本地数据仍然可用，正在尝试恢复连接。"
              : "抱歉，应用遇到了一个意外错误。"}
          </p>
          {error.digest && (
            <p className="text-xs text-zinc-600 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleRetry}
            disabled={isResetting}
            className="w-full bg-primary hover:bg-primary/95 text-black font-semibold py-3 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(100,255,218,0.2)] hover:shadow-[0_0_25px_rgba(100,255,218,0.35)] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isResetting && "animate-spin")} />
            {isResetting ? "正在恢复..." : "重新尝试"}
          </button>
          <a
            href="/"
            className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl border border-white/5 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            返回首页
          </a>
        </div>

        {/* Local data notice */}
        {isSyncRelated && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
            <p className="text-xs text-primary/80 text-center">
              💡 您的本地数据仍然安全可用。数据库恢复后，数据将自动同步。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
