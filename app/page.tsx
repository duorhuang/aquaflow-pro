"use client";

import Link from "next/link";
import { ArrowRight, UserCog, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-white">
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-700">
        <h1 className="text-6xl font-bold tracking-tighter">
          AquaFlow <span className="text-primary">PRO</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-lg mx-auto">
          游泳队训练管理系统
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login?role=coach"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"
          >
            <UserCog className="w-5 h-5" />
            {t.common.coach}{t.common.login} <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/workout"
            className="flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-colors"
          >
            <User className="w-5 h-5" />
            {t.common.athlete}{t.common.login}
          </Link>
        </div>
      </div>
    </div>
  );
}
