"use client";

import { useLanguage } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border hover:bg-secondary hover:border-primary/50 transition-all text-xs font-mono text-muted-foreground hover:text-white"
        >
            <Globe className="w-3 h-3" />
            <span>{language === 'en' ? 'EN' : '中文'}</span>
        </button>
    );
}
