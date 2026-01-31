"use client";

import { useStore } from "@/lib/store";
import { Download, Upload, Trash2, RefreshCw, BookOpen, Zap, Users, Calendar, Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

export default function SettingsPage() {
    const { hydrateMockData } = useStore();
    const { language, toggleLanguage } = useLanguage();
    const [showGuide, setShowGuide] = useState(false);

    const handleExportData = () => {
        const data = {
            plans: localStorage.getItem('aquaflow_plans'),
            swimmers: localStorage.getItem('aquaflow_swimmers'),
            attendance: localStorage.getItem('aquaflow_attendance'),
            feedbacks: localStorage.getItem('aquaflow_feedbacks'),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aquaflow-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportData = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target?.result as string);
                    if (data.plans) localStorage.setItem('aquaflow_plans', data.plans);
                    if (data.swimmers) localStorage.setItem('aquaflow_swimmers', data.swimmers);
                    if (data.attendance) localStorage.setItem('aquaflow_attendance', data.attendance);
                    if (data.feedbacks) localStorage.setItem('aquaflow_feedbacks', data.feedbacks);
                    window.location.reload();
                } catch (err) {
                    alert('Invalid backup file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const handleClearData = () => {
        if (confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleResetDemo = () => {
        if (confirm('Reset to demo data? Current data will be lost.')) {
            hydrateMockData();
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <h1 className="text-3xl font-bold text-white">Settings</h1>

            {/* Data Management */}
            <div className="bg-card/30 border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-primary" />
                    Data Management
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={handleExportData}
                        className="flex items-center gap-3 p-4 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors border border-white/5"
                    >
                        <Download className="w-5 h-5 text-green-400" />
                        <div className="text-left">
                            <div className="font-medium text-white">Export Data</div>
                            <div className="text-xs text-muted-foreground">Download backup as JSON</div>
                        </div>
                    </button>

                    <button
                        onClick={handleImportData}
                        className="flex items-center gap-3 p-4 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors border border-white/5"
                    >
                        <Upload className="w-5 h-5 text-blue-400" />
                        <div className="text-left">
                            <div className="font-medium text-white">Import Data</div>
                            <div className="text-xs text-muted-foreground">Restore from backup</div>
                        </div>
                    </button>

                    <button
                        onClick={handleResetDemo}
                        className="flex items-center gap-3 p-4 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors border border-white/5"
                    >
                        <RefreshCw className="w-5 h-5 text-yellow-400" />
                        <div className="text-left">
                            <div className="font-medium text-white">Reset to Demo</div>
                            <div className="text-xs text-muted-foreground">Load sample data</div>
                        </div>
                    </button>

                    <button
                        onClick={handleClearData}
                        className="flex items-center gap-3 p-4 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20"
                    >
                        <Trash2 className="w-5 h-5 text-red-400" />
                        <div className="text-left">
                            <div className="font-medium text-red-400">Clear All Data</div>
                            <div className="text-xs text-red-400/70">Permanent deletion</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Language */}
            <div className="bg-card/30 border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Language / 语言</h2>
                <button
                    onClick={toggleLanguage}
                    className="px-4 py-2 bg-primary/20 text-primary rounded-lg font-medium hover:bg-primary/30 transition-colors"
                >
                    {language === 'en' ? 'Switch to 中文' : 'Switch to English'}
                </button>
            </div>

            {/* User Guide */}
            <div className="bg-card/30 border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        User Guide
                    </h2>
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        className="text-sm text-primary hover:underline"
                    >
                        {showGuide ? 'Hide' : 'Show'}
                    </button>
                </div>

                {showGuide && (
                    <div className="space-y-6 text-sm">
                        {/* Quick Start */}
                        <div>
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                Quick Start
                            </h3>
                            <ul className="space-y-1 text-muted-foreground ml-6 list-disc">
                                <li>Click <strong className="text-white">"创建计划"</strong> to create a new training plan</li>
                                <li>Add blocks (Warmup, Main Set, Cool Down) and exercises</li>
                                <li>Assign private notes to specific swimmers</li>
                                <li>Star important plans to keep them at the top</li>
                            </ul>
                        </div>

                        {/* Team Management */}
                        <div>
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-400" />
                                Team Management
                            </h3>
                            <ul className="space-y-1 text-muted-foreground ml-6 list-disc">
                                <li>Go to <strong className="text-white">"运动员"</strong> to view all swimmers</li>
                                <li>Click any swimmer card to edit their details</li>
                                <li>Monitor readiness scores and training streaks</li>
                                <li>Add new swimmers with the <strong className="text-white">"Add Swimmer"</strong> button</li>
                            </ul>
                        </div>

                        {/* Calendar */}
                        <div>
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-green-400" />
                                Training Calendar
                            </h3>
                            <ul className="space-y-1 text-muted-foreground ml-6 list-disc">
                                <li>View monthly training schedule with color-coded intensity</li>
                                <li><span className="inline-block w-3 h-3 bg-green-400 rounded" /> Light (0-2000m)</li>
                                <li><span className="inline-block w-3 h-3 bg-green-500 rounded" /> Medium (2000-4000m)</li>
                                <li><span className="inline-block w-3 h-3 bg-green-600 rounded" /> Intense (4000m+)</li>
                                <li>Hover over dates to see training details</li>
                            </ul>
                        </div>

                        {/* Tips */}
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                            <h3 className="font-bold text-primary mb-2">💡 Pro Tips</h3>
                            <ul className="space-y-1 text-muted-foreground text-xs ml-4 list-disc">
                                <li>Data syncs automatically across browser tabs</li>
                                <li>Export your data regularly as backup</li>
                                <li>Use targeted notes to give personalized feedback</li>
                                <li>Training plans are never deleted - they're sorted by date</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* App Info */}
            <div className="bg-card/30 border border-border rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">A</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">AquaFlow Pro</h3>
                </div>
                <p className="text-xs text-muted-foreground">Version 12.0 • Built for swim coaches</p>
            </div>
        </div>
    );
}
