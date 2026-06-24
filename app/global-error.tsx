"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error Boundary]", error.message, error.digest);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-6">
          <div className="space-y-6 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white">应用出现了一些问题</h2>
              <p className="text-sm text-zinc-400">
                抱歉，应用遇到了一个意外错误。请尝试重新加载。
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <button
                onClick={() => reset()}
                className="w-full bg-[#64ffda] hover:bg-[#64ffda]/95 text-black font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                重新加载
              </button>
              <a
                href="/"
                className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl border border-white/5 transition-all block"
              >
                返回首页
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
