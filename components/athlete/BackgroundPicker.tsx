"use client";

import { useState, useEffect } from 'react';
import { backgroundThemes, type BackgroundTheme, getThemePreference, saveThemePreference } from '@/lib/background-themes';
import { X, Clock, Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackgroundPickerProps {
  open: boolean;
  onClose: () => void;
  currentThemeId: string;
  currentMode: 'auto-time' | 'auto-training' | 'manual';
  onThemeSelect: (id: string) => void;
  onAutoMode: () => void;
}

export function BackgroundPicker({
  open,
  onClose,
  currentThemeId,
  currentMode,
  onThemeSelect,
  onAutoMode,
}: BackgroundPickerProps) {
  const [tab, setTab] = useState<'auto' | 'manual'>(() => getThemePreference() === 'auto' ? 'auto' : 'manual');

  if (!open) return null;

  const timeThemes = backgroundThemes.filter(t => t.timeRange);
  const trainingThemes = backgroundThemes.filter(t => t.trainingType);
  const moodThemes = backgroundThemes.filter(t => t.emotion && !t.timeRange && !t.trainingType);

  const isSelected = (t: BackgroundTheme) => t.id === currentThemeId;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg max-h-[85vh] bg-background border border-border rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-white">背景主题</h2>
            <p className="text-xs text-muted-foreground">Background Theme</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-2 p-4 pb-2">
          <button
            onClick={() => { setTab('auto'); onAutoMode(); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
              tab === 'auto'
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10"
            )}
          >
            <Clock className="w-4 h-4" />
            自动切换
          </button>
          <button
            onClick={() => setTab('manual')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
              tab === 'manual'
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10"
            )}
          >
            <Palette className="w-4 h-4" />
            手动选择
          </button>
        </div>

        {/* Theme Grid */}
        <div className="flex-1 overflow-y-auto p-4 pt-2">
          {tab === 'auto' && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  按时间自动切换
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {timeThemes.map(theme => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      selected={isSelected(theme)}
                      subtitle={`${theme.timeRange![0]}:00 - ${theme.timeRange![1]}:00`}
                      onSelect={() => { onAutoMode(); }}
                    />
                  ))}
                </div>
              </div>
              {trainingThemes.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    按训练类型
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {trainingThemes.map(theme => (
                      <ThemeCard
                        key={theme.id}
                        theme={theme}
                        selected={isSelected(theme)}
                        subtitle={`训练: ${theme.trainingType}`}
                        onSelect={() => { onAutoMode(); }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'manual' && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5" />
                  情绪与场景
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {moodThemes.map(theme => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      selected={isSelected(theme)}
                      subtitle={theme.emotion}
                      onSelect={() => {
                        onThemeSelect(theme.id);
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  全部主题
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backgroundThemes.map(theme => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      selected={isSelected(theme)}
                      subtitle={theme.nameEn}
                      onSelect={() => onThemeSelect(theme.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThemeCard({
  theme,
  selected,
  subtitle,
  onSelect,
}: {
  theme: BackgroundTheme;
  selected: boolean;
  subtitle?: string;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative rounded-2xl p-3 text-left border transition-all hover:scale-[1.02]",
        `bg-gradient-to-br ${theme.gradient}`,
        selected
          ? "border-primary ring-2 ring-primary/30"
          : "border-border/50"
      )}
    >
      {selected && (
        <div className="absolute top-2 right-2">
          <Check className="w-3.5 h-3.5 text-primary" />
        </div>
      )}
      <div className="text-2xl mb-1.5">{theme.icon}</div>
      <p className="text-sm font-semibold text-white leading-tight">{theme.name}</p>
      {subtitle && (
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{subtitle}</p>
      )}
    </button>
  );
}
