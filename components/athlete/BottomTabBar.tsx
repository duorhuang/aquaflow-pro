"use client";

import { useRouter, usePathname } from 'next/navigation';
import { Waves, MessageSquare, TrendingUp, Activity, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, useCallback } from 'react';

interface BottomTabBarProps {
  activeTab?: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: typeof Waves;
  href: string;
  match: string;
}

export function BottomTabBar({ activeTab = 'training' }: BottomTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs: TabItem[] = useMemo(() => [
    { id: 'training', label: '训练', icon: Waves, href: '/workout', match: 'training' },
    { id: 'feedback', label: '反馈', icon: MessageSquare, href: '/workout?tab=feedback', match: 'feedback' },
    { id: 'achievements', label: '成绩', icon: TrendingUp, href: '/workout?tab=achievements', match: 'achievements' },
    { id: 'health', label: '状态', icon: Activity, href: '/workout?tab=health', match: 'health' },
    { id: 'profile', label: '我的', icon: UserCircle, href: '/profile', match: 'profile' },
  ], []);

  const resolvedTab = activeTab === '/profile' || pathname === '/profile' ? 'profile' : activeTab;

  const handleTabClick = useCallback((href: string) => {
    router.push(href, { scroll: false });
  }, [router]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f131f]/75 backdrop-blur-xl border-t border-white/5 shadow-2xl"
      role="navigation"
      aria-label="主导航"
    >
      <div className="flex items-stretch justify-around pb-[env(safe-area-inset-bottom)] max-w-2xl mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = tab.match === resolvedTab || (tab.match === 'training' && !resolvedTab);

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.href)}
              className={cn(
                "flex flex-col items-center justify-center min-h-[48px] px-3 py-2 flex-1 transition-all relative font-label-caps",
                isActive ? "text-primary" : "text-muted-foreground hover:text-white/80"
              )}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary rounded-full shadow-[0_0_12px_rgba(0,242,255,0.8)]" />
              )}
              <Icon className={cn("w-5 h-5 mb-1 transition-all", isActive && "drop-shadow-[0_0_8px_rgba(0,242,255,0.6)]")} />
              <span className={cn("text-[10px] leading-none uppercase tracking-wider scale-90", isActive ? "font-bold" : "")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
