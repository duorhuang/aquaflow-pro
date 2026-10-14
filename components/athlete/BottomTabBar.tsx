"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Waves, MessageSquare, TrendingUp, UserCircle } from 'lucide-react';
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
  const searchParams = useSearchParams();

  const currentTab = searchParams.get('tab') || (pathname === '/profile' ? 'profile' : 'training');

  const tabs: TabItem[] = useMemo(() => [
    { id: 'training', label: '训练', icon: Waves, href: '/workout?tab=training', match: 'training' },
    { id: 'feedback', label: '反馈', icon: MessageSquare, href: '/workout?tab=feedback', match: 'feedback' },
    { id: 'achievements', label: '成绩', icon: TrendingUp, href: '/workout?tab=achievements', match: 'achievements' },
    { id: 'profile', label: '我的', icon: UserCircle, href: '/workout?tab=profile', match: 'profile' },
  ], []);

  const handleTabClick = useCallback((href: string) => {
    router.push(href, { scroll: false });
  }, [router]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-[env(safe-area-inset-bottom,0px)]"
      role="navigation"
      aria-label="队员主导航"
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto px-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = tab.match === currentTab;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.href)}
              className={cn(
                "flex flex-col items-center justify-center min-h-[54px] py-1.5 px-3 flex-1 transition-all relative",
                isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full shadow-xs" />
              )}
              <Icon className={cn("w-5 h-5 mb-1 transition-all", isActive ? "stroke-[2.5]" : "stroke-[1.75]")} />
              <span className="text-[11px] leading-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
