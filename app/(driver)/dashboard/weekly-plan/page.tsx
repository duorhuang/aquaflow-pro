"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api-client";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/common/Toast";
import { Save, Plus, Trash2, Image as ImageIcon, CheckCircle, Users, Target, FileText, Blocks, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { ImageViewer } from "@/components/common/ImageViewer";
import { BlockEditor } from "@/components/dashboard/BlockEditor";
import { RichTextEditor } from "@/components/dashboard/RichTextEditor";
import { cn } from "@/lib/utils";
import { GroupLevel } from "@/types";

const GROUP_LEVELS: GroupLevel[] = ["Junior", "Intermediate", "Advanced", "External"];
const DAY_NAMES = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

// Get ISO day-of-week (0=Monday, 6=Sunday) from a date string
function getDayOfWeek(dateStr: string): number {
    if (!dateStr) return -1;
    const d = new Date(dateStr + "T12:00:00");
    if (isNaN(d.getTime())) return -1;
    return (d.getDay() + 6) % 7;
}

export default function WeeklyPlanPage() {
    const { swimmers } = useStore();
    const { toast } = useToast();
    const [weekStart, setWeekStart] = useState("");
    const [weekEnd, setWeekEnd] = useState("");
    const [group, setGroup] = useState("Advanced");
    const [title, setTitle] = useState("");
    const [coachNotes, setCoachNotes] = useState("");
    const [sessions, setSessions] = useState<any[]>([]);
    const { recordMutation } = useStore();

    // Targeting state
    const [targetGroups, setTargetGroups] = useState<GroupLevel[]>([]);
    const [targetSwimmerIds, setTargetSwimmerIds] = useState<string[]>([]);

    const [saving, setSaving] = useState(false);
    const [loadedPlans, setLoadedPlans] = useState<any[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    // Weekly overview state
    const [overviewImageUrl, setOverviewImageUrl] = useState("");
    const [overviewContentHtml, setOverviewContentHtml] = useState("");
    const [uploadingOverview, setUploadingOverview] = useState(false);
    const overviewFileInputRef = useRef<HTMLInputElement>(null);

    // Accordion: which days are expanded
    const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

    // Legacy photo upload
    const [uploadingLegacyId, setUploadingLegacyId] = useState<string | null>(null);
    const legacyFileInputRef = useRef<HTMLInputElement>(null);
    const activeLegacySessionId = useRef<string | null>(null);

    const handleLegacyUpload = async (sessionId: string, file: File) => {
        setUploadingLegacyId(sessionId);
        try {
            const result = await api.upload.file(file);
            updateSession(sessionId, { imageData: result.url, imageType: "image/jpeg" });
        } catch (e) {
            console.error(e);
            toast("error", "照片上传失败");
        } finally {
            setUploadingLegacyId(null);
        }
    };

    const handleOverviewUpload = async (file: File) => {
        setUploadingOverview(true);
        try {
            const result = await api.upload.file(file);
            setOverviewImageUrl(result.url);
        } catch (e) {
            console.error(e);
            toast("error", "本周总览照片上传失败");
        } finally {
            setUploadingOverview(false);
        }
    };

    useEffect(() => {
        // Init dates
        const monday = new Date();
        const day = monday.getDay();
        const diffToMonday = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diffToMonday);
        setWeekStart(monday.toISOString().split('T')[0]);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        setWeekEnd(sunday.toISOString().split('T')[0]);

        setTitle(`${monday.toISOString().split('T')[0]} 周训练`);

        // Auto-expand days that have sessions
        loadPlans();
    }, []);

    // Recompute expandedDays when sessions change
    useEffect(() => {
        const daysWithContent = new Set<number>();
        sessions.forEach(s => {
            const dow = getDayOfWeek(s.date);
            if (dow >= 0) daysWithContent.add(dow);
        });
        setExpandedDays(daysWithContent);
    }, [sessions]);

    const loadPlans = async () => {
        try {
            const plans = await api.weeklyPlans.getAll();
            setLoadedPlans(plans);
        } catch (e) {
            console.error(e);
        }
    };

    // -- Targeting helpers --

    const toggleTargetSwimmer = (id: string) => {
        setTargetSwimmerIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleTargetGroup = (groupLevel: GroupLevel) => {
        const groupIds = (swimmers || []).filter(s => s.group === groupLevel).map(s => s.id);
        if (groupIds.length === 0) return;
        if (targetGroups.includes(groupLevel)) {
            setTargetGroups(prev => prev.filter(g => g !== groupLevel));
            setTargetSwimmerIds(prev => prev.filter(id => !groupIds.includes(id)));
        } else {
            setTargetGroups(prev => [...prev, groupLevel]);
            setTargetSwimmerIds(prev => [...new Set([...prev, ...groupIds])]);
        }
    };

    const isGroupPartiallySelected = (groupLevel: GroupLevel): boolean => {
        const groupIds = (swimmers || []).filter(s => s.group === groupLevel).map(s => s.id);
        if (groupIds.length === 0) return false;
        const selected = groupIds.filter(id => targetSwimmerIds.includes(id)).length;
        return selected > 0 && selected < groupIds.length;
    };

    // -- Session management --

    const addSessionToDay = (dayOfWeek: number) => {
        if (!weekStart) return;
        // Calculate the date for this day of the week
        const monday = new Date(weekStart + "T12:00:00");
        if (isNaN(monday.getTime())) return;
        const targetDate = new Date(monday);
        targetDate.setDate(monday.getDate() + dayOfWeek);
        const dateStr = targetDate.toISOString().split('T')[0];

        setSessions(prev => [
            ...prev,
            {
                id: Math.random().toString(36).substring(7),
                isNew: true,
                label: DAY_NAMES[dayOfWeek],
                date: dateStr,
                imageData: "",
                imageType: "",
                notes: "",
                contentBlocks: [],
                contentHtml: "",
                editorMode: "block", // Default to block mode for new sessions
                sortOrder: prev.length
            }
        ]);
        // Auto-expand the day
        setExpandedDays(prev => new Set(prev).add(dayOfWeek));
    };

    const updateSession = (id: string, updates: Record<string, any>) => {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates, isUpdated: true } : s));
    };

    const removeSession = async (id: string, isNew: boolean) => {
        if (!isNew) {
            try {
                await api.weeklyPlans.deleteSession(id);
            } catch (e) {
                console.error(e);
            }
        }
        setSessions(prev => prev.filter(s => s.id !== id));
    };

    // Migrate legacy image/notes to contentBlocks when switching to block mode
    const migrateLegacyToBlock = (session: any) => {
        if (session.editorMode !== "block" || !session.imageData) return session;
        const blocks: { type: string; content: string }[] = session.contentBlocks || [];
        if (blocks.length > 0) return session;
        const migrated: { type: string; content: string }[] = [
            { type: "image", content: session.imageData }
        ];
        if (session.notes) {
            migrated.push({ type: "text", content: session.notes });
        }
        return { ...session, contentBlocks: migrated };
    };

    const [publishProgress, setPublishProgress] = useState<{current: number, total: number} | null>(null);

    const handleSave = async () => {
        if (saving) return;
        if (targetGroups.length === 0 && targetSwimmerIds.length === 0) {
            toast("info", "请至少选择一个组别或队员");
            return;
        }
        setSaving(true);
        recordMutation(); // Lock background sync for 15s
        setPublishProgress(null);
        try {
            let planId = selectedPlanId;
            if (!planId) {
                const newPlan = await api.weeklyPlans.create({
                    weekStart,
                    weekEnd,
                    group,
                    title,
                    coachNotes,
                    isPublished: true,
                    targetGroup: targetGroups.length > 0 ? targetGroups : null,
                    targetSwimmerIds: targetSwimmerIds.length > 0 ? targetSwimmerIds : null,
                    overviewImageUrl: overviewImageUrl || null,
                    overviewContentHtml: overviewContentHtml || null,
                });
                planId = newPlan.id;
            } else {
                await api.weeklyPlans.update(planId, {
                    weekStart, weekEnd, group, title, coachNotes, isPublished: true,
                    targetGroup: targetGroups.length > 0 ? targetGroups : null,
                    targetSwimmerIds: targetSwimmerIds.length > 0 ? targetSwimmerIds : null,
                    overviewImageUrl: overviewImageUrl || null,
                    overviewContentHtml: overviewContentHtml || null,
                });
            }

            const totalSessions = sessions.length;
            setPublishProgress({ current: 0, total: totalSessions });

            for (let i = 0; i < sessions.length; i++) {
                const s = sessions[i];
                try {
                    const sessionData: any = {
                        weeklyPlanId: planId,
                        label: s.label,
                        date: s.date,
                        notes: s.notes,
                        sortOrder: s.sortOrder,
                        editorMode: s.editorMode || "legacy",
                    };

                    if (s.editorMode === "block") {
                        sessionData.contentBlocks = s.contentBlocks || [];
                    } else if (s.editorMode === "rich") {
                        sessionData.contentHtml = s.contentHtml || "";
                    } else {
                        // Legacy mode
                        sessionData.imageData = s.imageData;
                        sessionData.imageType = s.imageType;
                    }

                    if (s.isNew) {
                        await api.weeklyPlans.addSession(sessionData);
                    } else if (s.isUpdated) {
                        await api.weeklyPlans.updateSession(s.id, sessionData);
                    }
                } catch (sessionErr) {
                    console.error("Failed to save session", s.label, sessionErr);
                }
                setPublishProgress({ current: i + 1, total: totalSessions });
            }

            toast("success", "计划发布成功！");
            loadPlans();
            if (!selectedPlanId) setSelectedPlanId(planId);
        } catch (e: any) {
            console.error("Publish Error:", e);
            if (e.message?.includes("413") || e.status === 413) {
                toast("error", "照片体积过大（Cloudflare 限制 1MB）。请尝试分批上传，或减少单张照片的分辨率。");
            } else if (e.message?.includes("401")) {
                toast("error", "登录已过期，请重新登录后重试。");
            } else if (e.name === "TypeError" || e.message?.includes("network")) {
                toast("error", "网络连接失败，请检查网络后重试。");
            } else {
                toast("error", `同步失败：${e.message || "服务器连接超时"}`);
            }
        } finally {
            setSaving(false);
            setPublishProgress(null);
        }
    };

    const selectPlan = async (id: string) => {
        const plan = await api.weeklyPlans.getById(id);
        setSelectedPlanId(plan.id);
        setWeekStart(plan.weekStart);
        setWeekEnd(plan.weekEnd);
        setGroup(plan.group);
        setTitle(plan.title || "");
        setCoachNotes(plan.coachNotes || "");
        setSessions(plan.sessions || []);
        setTargetGroups(plan.targetGroup || []);
        setTargetSwimmerIds(plan.targetSwimmerIds || []);
        setOverviewImageUrl(plan.overviewImageUrl || "");
        setOverviewContentHtml(plan.overviewContentHtml || "");
    };

    const createNew = () => {
        setSelectedPlanId(null);
        setSessions([]);
        setCoachNotes("");
        setGroup("Advanced");
        setTargetGroups([]);
        setTargetSwimmerIds([]);
        setOverviewImageUrl("");
        setOverviewContentHtml("");

        const monday = new Date();
        const day = monday.getDay();
        const diffToMonday = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diffToMonday);
        const startStr = monday.toISOString().split('T')[0];
        setWeekStart(startStr);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        setWeekEnd(sunday.toISOString().split('T')[0]);

        setTitle(`${startStr} 周训练`);
    };

    const toggleDay = (day: number) => {
        setExpandedDays(prev => {
            const next = new Set(prev);
            if (next.has(day)) next.delete(day);
            else next.add(day);
            return next;
        });
    };

    // Group sessions by day of week
    const getSessionsForDay = (dayOfWeek: number) => {
        return sessions.filter(s => getDayOfWeek(s.date) === dayOfWeek);
    };

    // Get the date string for a day of the week
    const getDateForDay = (dayOfWeek: number) => {
        if (!weekStart) return "";
        const monday = new Date(weekStart + "T12:00:00");
        if (isNaN(monday.getTime())) return "";
        const targetDate = new Date(monday);
        targetDate.setDate(monday.getDate() + dayOfWeek);
        return targetDate.toISOString().split('T')[0];
    };

    const isToday = (dayOfWeek: number) => {
        const today = new Date();
        const todayDow = (today.getDay() + 6) % 7;
        return todayDow === dayOfWeek;
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">按周上传训练计划</h1>
                <button onClick={createNew} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/80">
                    + 创建新计划
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Plan metadata */}
                    <div className="bg-card/40 border border-border rounded-xl p-6">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">开始日期 (周一)</label>
                                <input type="date" value={weekStart} onChange={e => { setWeekStart(e.target.value); }} className="w-full bg-black/40 border border-border rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">标题</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/40 border border-border rounded-lg px-3 py-2 text-white" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground block mb-1">教练本周寄语 (选填)</label>
                            <RichTextEditor
                                value={coachNotes}
                                onChange={setCoachNotes}
                                placeholder="这周大家好好练..."
                            />
                        </div>
                    </div>

                    {/* Weekly Overview Section */}
                    <div className="bg-gradient-to-br from-card/40 to-amber-900/10 border border-amber-500/20 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-amber-400" />
                            本周总览
                        </h2>

                        {overviewImageUrl ? (
                            <div className="relative mb-4 rounded-lg overflow-hidden">
                                <ImageViewer src={overviewImageUrl} className="w-full max-h-[300px] object-contain" />
                                <button
                                    onClick={() => setOverviewImageUrl("")}
                                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-500/80 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <div
                                className="aspect-[4/3] rounded-lg overflow-hidden bg-secondary flex items-center justify-center cursor-pointer mb-4 border-2 border-dashed border-white/10 hover:border-amber-500/50 transition-colors"
                                onClick={() => overviewFileInputRef.current?.click()}
                            >
                                {uploadingOverview ? (
                                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                                ) : (
                                    <div className="text-center">
                                        <ImageIcon className="w-8 h-8 opacity-50 mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground">点击上传本周总览照片</p>
                                    </div>
                                )}
                            </div>
                        )}
                        <input
                            type="file"
                            ref={overviewFileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleOverviewUpload(file);
                                if (e.target) e.target.value = "";
                            }}
                        />

                        <RichTextEditor
                            value={overviewContentHtml}
                            onChange={setOverviewContentHtml}
                            placeholder="输入本周总览说明，支持粗体、列表、图片..."
                        />
                    </div>

                    {/* Vertical accordion - Daily sessions */}
                    <div className="space-y-3">
                        {DAY_NAMES.map((dayName, dayOfWeek) => {
                            const daySessions = getSessionsForDay(dayOfWeek);
                            const isExpanded = expandedDays.has(dayOfWeek);
                            const dateStr = getDateForDay(dayOfWeek);
                            const dayDate = dateStr ? new Date(dateStr + "T12:00:00") : null;
                            const dayOfMonth = dayDate ? dayDate.getDate() : null;
                            const dayValid = dayDate && !isNaN(dayDate.getTime());

                            return (
                                <div key={dayOfWeek} className={`bg-card/40 border rounded-xl overflow-hidden transition-all ${isExpanded ? 'border-purple-500/30' : 'border-white/10 hover:border-white/20'}`}>
                                    {/* Day header - always visible */}
                                    <button
                                        onClick={() => toggleDay(dayOfWeek)}
                                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                            <span className="font-bold text-white">{dayName}</span>
                                            <span className="text-xs text-muted-foreground">{dayValid ? `${dayOfMonth}日` : "—"}</span>
                                            {dayValid && isToday(dayOfWeek) && (
                                                <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] rounded-full font-bold">今天</span>
                                            )}
                                            {daySessions.length > 0 && (
                                                <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded-full">
                                                    {daySessions.length} 个内容
                                                </span>
                                            )}
                                        </div>
                                    </button>

                                    {/* Day content - expandable */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                                            {daySessions.map((s, sessionIdx) => {
                                                const mode = s.editorMode || "legacy";

                                                return (
                                                    <div key={s.id} className="bg-black/30 border border-white/10 rounded-xl p-4 group">
                                                        {/* Session header with label, date, mode, delete */}
                                                        <div className="flex items-center justify-between mb-3 gap-2">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <input
                                                                    type="text"
                                                                    value={s.label}
                                                                    placeholder="如：上午训练"
                                                                    onChange={e => updateSession(s.id, { label: e.target.value })}
                                                                    className="bg-transparent border-b border-white/20 px-1 py-0.5 text-sm text-white focus:border-purple-400 outline-none max-w-[140px]"
                                                                />
                                                                <input
                                                                    type="date"
                                                                    value={s.date}
                                                                    onChange={e => updateSession(s.id, { date: e.target.value })}
                                                                    className="bg-secondary/50 rounded px-2 py-0.5 text-[10px] text-white outline-none"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {/* Mode toggle */}
                                                                <div className="flex bg-black/30 rounded-lg p-0.5">
                                                                    {(["legacy", "block", "rich"] as const).map(m => (
                                                                        <button
                                                                            key={m}
                                                                            onClick={() => {
                                                                                const session = sessions.find(ss => ss.id === s.id);
                                                                                const migrated = m === "block" ? migrateLegacyToBlock({ ...session, editorMode: "block" }) : session;
                                                                                updateSession(s.id, { editorMode: m, ...(m === "block" && migrated !== session ? { contentBlocks: migrated.contentBlocks } : {}) });
                                                                            }}
                                                                            className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all flex items-center gap-1 ${
                                                                                mode === m
                                                                                    ? "bg-purple-500/30 text-white"
                                                                                    : "text-muted-foreground hover:text-white"
                                                                            }`}
                                                                        >
                                                                            {m === "legacy" && <><ImageIcon className="w-3 h-3" /> 照片</>}
                                                                            {m === "block" && <><Blocks className="w-3 h-3" /> 模块</>}
                                                                            {m === "rich" && <><FileText className="w-3 h-3" /> 富文本</>}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                <button
                                                                    onClick={() => removeSession(s.id, s.isNew)}
                                                                    className="p-1.5 bg-red-500/80 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Mode-specific editor */}
                                                        {mode === "legacy" && (
                                                            <div className="space-y-2">
                                                                <div
                                                                    className={cn(
                                                                        "aspect-[4/3] rounded-lg overflow-hidden bg-secondary flex items-center justify-center cursor-pointer transition-colors",
                                                                        !s.imageData && "hover:bg-secondary/80 border-2 border-dashed border-white/10 hover:border-purple-500/50"
                                                                    )}
                                                                    onClick={() => {
                                                                        if (!s.imageData) {
                                                                            activeLegacySessionId.current = s.id;
                                                                            legacyFileInputRef.current?.click();
                                                                        }
                                                                    }}
                                                                >
                                                                    {uploadingLegacyId === s.id ? (
                                                                        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                                                                    ) : s.imageData ? (
                                                                        <div className="relative w-full h-full">
                                                                            <ImageViewer src={s.imageData} className="w-full h-full object-contain" />
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); updateSession(s.id, { imageData: "", imageType: "" }); }}
                                                                                className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-500/80 transition-colors"
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-center">
                                                                            <ImageIcon className="w-8 h-8 opacity-50 mx-auto mb-2" />
                                                                            <p className="text-xs text-muted-foreground">点击上传照片</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <textarea
                                                                    value={s.notes || ""}
                                                                    onChange={e => updateSession(s.id, { notes: e.target.value })}
                                                                    placeholder="今日训练说明..."
                                                                    rows={2}
                                                                    className="w-full bg-black/30 rounded px-2 py-1.5 text-xs text-white resize-none outline-none border border-white/10 focus:border-purple-500/50 placeholder:text-muted-foreground/50"
                                                                />
                                                            </div>
                                                        )}

                                                        {mode === "block" && (
                                                            <BlockEditor
                                                                blocks={s.contentBlocks || []}
                                                                onChange={(blocks) => updateSession(s.id, { contentBlocks: blocks })}
                                                            />
                                                        )}

                                                        {mode === "rich" && (
                                                            <RichTextEditor
                                                                value={s.contentHtml || ""}
                                                                onChange={(html) => updateSession(s.id, { contentHtml: html })}
                                                                placeholder="输入训练说明，支持粗体、列表、图片..."
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Add content button */}
                                            <button
                                                onClick={() => addSessionToDay(dayOfWeek)}
                                                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-white/20 rounded-xl hover:bg-white/5 hover:border-purple-500/50 transition-all text-muted-foreground hover:text-white"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span className="text-sm">添加{dayName}训练内容</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Targeting Section */}
                    <div className="bg-gradient-to-br from-card/80 to-blue-900/10 border border-blue-500/20 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-400" />
                            发送对象
                        </h2>

                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">按组快速选择</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {GROUP_LEVELS.map(groupLevel => {
                                const count = (swimmers || []).filter(s => s.group === groupLevel).length;
                                if (count === 0) return null;
                                const isSelected = targetGroups.includes(groupLevel);
                                const isPartial = !isSelected && isGroupPartiallySelected(groupLevel);
                                return (
                                    <button
                                        key={groupLevel}
                                        onClick={() => toggleTargetGroup(groupLevel)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                            isSelected
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : isPartial
                                                ? 'bg-blue-500/40 text-white border-blue-400/60'
                                                : 'bg-transparent border-white/20 text-muted-foreground hover:bg-white/5'
                                        }`}
                                    >
                                        <Users className="w-3 h-3" /> {groupLevel} ({count})
                                    </button>
                                );
                            })}
                        </div>

                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">指定队员（可选微调）</p>
                        <div className="space-y-3">
                            {GROUP_LEVELS.map(groupLevel => {
                                const groupSwimmers = (swimmers || []).filter(s => s.group === groupLevel);
                                if (groupSwimmers.length === 0) return null;
                                return (
                                    <div key={groupLevel}>
                                        <p className="text-[10px] text-muted-foreground font-bold mb-1.5">{groupLevel}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {groupSwimmers.map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => toggleTargetSwimmer(s.id)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${targetSwimmerIds.includes(s.id) ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent border-white/20 text-muted-foreground hover:bg-white/5'} ${s.status !== 'Active' ? 'opacity-50' : ''}`}
                                                    title={s.status !== 'Active' ? `${s.name} (${s.status})` : undefined}
                                                >
                                                    {s.name}{s.status !== 'Active' ? ` (${s.status === 'Injured' ? '伤' : '休'})` : ''}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {targetGroups.length === 0 && targetSwimmerIds.length === 0 && (
                            <p className="text-[10px] text-red-400 mt-3">请至少选择一个组别或队员</p>
                        )}
                    </div>

                    {/* Save button */}
                    <div className="flex flex-col gap-4 w-full">
                        {saving && publishProgress && (
                            <>
                                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mb-1">
                                    <div
                                        className="bg-primary h-full transition-all duration-300"
                                        style={{ width: `${(publishProgress.current / publishProgress.total) * 100}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-primary text-center font-bold mb-2">
                                    正在发布: {publishProgress.current} / {publishProgress.total} (请勿关闭页面)
                                </p>
                            </>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving || (targetGroups.length === 0 && targetSwimmerIds.length === 0)}
                            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle className="w-4 h-4" /> {saving ? "正在同步数据..." : "发布计划"}
                        </button>
                    </div>
                </div>

                {/* Sidebar - History */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-white">已有周计划</h3>
                    <div className="space-y-3">
                        {loadedPlans.map(p => (
                            <div key={p.id} onClick={() => selectPlan(p.id)} className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedPlanId === p.id ? 'bg-purple-500/20 border-purple-500/50' : 'bg-card/40 border-border hover:border-white/20'}`}>
                                <h4 className="font-bold text-white text-sm">{p.title || `${p.weekStart}周`}</h4>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="text-xs text-muted-foreground">{p.sessions?.length || 0} 个内容</span>
                                    {p.isPublished && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-full">已发布</span>}
                                    {p.targetGroup && p.targetGroup.length > 0 && p.targetGroup.map((g: string) => (
                                        <span key={g} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded-full">{g}</span>
                                    ))}
                                    {p.targetSwimmerIds && p.targetSwimmerIds.length > 0 && p.targetSwimmerIds.map((sid: string) => {
                                        const sw = (swimmers || []).find(s => s.id === sid);
                                        return sw ? (
                                            <span key={sid} className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] rounded-full">{sw.name}</span>
                                        ) : null;
                                    })}
                                    {!p.targetGroup && !p.targetSwimmerIds && (
                                        <span className="px-2 py-0.5 bg-white/10 text-muted-foreground text-[10px] rounded-full">全队</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hidden file input for legacy mode uploads */}
            <input
                type="file"
                ref={legacyFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={e => {
                    const file = e.target.files?.[0];
                    if (file && activeLegacySessionId.current) {
                        handleLegacyUpload(activeLegacySessionId.current, file);
                    }
                    if (e.target) e.target.value = "";
                }}
            />
        </div>
    );
}
