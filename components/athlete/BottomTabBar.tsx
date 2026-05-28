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
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-white/10"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = tab.match === resolvedTab || (tab.match === 'training' && !resolvedTab);

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.href)}
              className={cn(
                "flex flex-col items-center justify-center min-h-[44px] px-3 py-2 flex-1 transition-all relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-white/80"
              )}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(100,255,218,0.5)]" />
              )}
              <Icon className={cn("w-5 h-5 mb-1", isActive && "drop-shadow-[0_0_6px_rgba(100,255,218,0.4)]")} />
              <span className={cn("text-xs leading-none", isActive ? "font-semibold" : "")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
