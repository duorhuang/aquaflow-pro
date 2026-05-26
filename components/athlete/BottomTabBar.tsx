"use client";

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Waves, MessageSquare, TrendingUp, Activity, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, useEffect } from 'react';

interface TabItem {
  id: string;
  label: string;
  labelEn: string;
  icon: typeof Waves;
  href: string;
  activeWhen: string;
}

export function BottomTabBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  const tabs: TabItem[] = useMemo(() => [
    {
      id: 'training',
      label: '训练',
      labelEn: 'Training',
      icon: Waves,
      href: '/workout',
      activeWhen: '',
    },
    {
      id: 'feedback',
      label: '反馈',
      labelEn: 'Feedback',
      icon: MessageSquare,
      href: '/workout?tab=feedback',
      activeWhen: 'feedback',
    },
    {
      id: 'achievements',
      label: '成绩',
      labelEn: 'Stats',
      icon: TrendingUp,
      href: '/workout?tab=achievements',
      activeWhen: 'achievements',
    },
    {
      id: 'health',
      label: '状态',
      labelEn: 'Health',
      icon: Activity,
      href: '/workout?tab=health',
      activeWhen: 'health',
    },
    {
      id: 'profile',
      label: '我的',
      labelEn: 'Profile',
      icon: UserCircle,
      href: '/profile',
      activeWhen: '/profile',
    },
  ], []);

  const activeTab = useMemo(() => {
    if (pathname === '/profile') return 'profile';
    if (currentTab) return currentTab;
    return 'training';
  }, [pathname, currentTab]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-white/10"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive =
            tab.activeWhen === '/profile'
              ? activeTab === 'profile'
              : tab.activeWhen === ''
                ? activeTab === 'training'
                : activeTab === tab.activeWhen || activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center min-h-[56px] px-3 py-2 flex-1 transition-all relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-white/80"
              )}
              aria-label={`${tab.label} / ${tab.labelEn}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(100,255,218,0.5)]" />
              )}
              <Icon className={cn("w-5 h-5 mb-1", isActive && "drop-shadow-[0_0_6px_rgba(100,255,218,0.4)]")} />
              <span className={cn(
                "text-[11px] font-medium leading-none",
                isActive ? "font-semibold" : ""
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
