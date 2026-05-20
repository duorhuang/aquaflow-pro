"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { TrainingPlan, Swimmer, Feedback, AttendanceRecord, PerformanceRecord, BlockTemplate, TrainingBlock } from "@/types";
import { MOCK_PLANS, MOCK_SWIMMERS, DEFAULT_TEMPLATES } from "./data";
import { getLocalDateISOString } from "@/lib/date-utils";
import { api, fetchAPI } from "./api-client";

const uid = () => Math.random().toString(36).substr(2, 9);

interface StoreContextType {
    isLoaded: boolean;
    plans: TrainingPlan[];
    swimmers: Swimmer[];
    feedbacks: Feedback[];
    attendance: AttendanceRecord[];
    performances: PerformanceRecord[];
    weeklyPlans: any[];
    announcements: any[];
    archivedAnnouncements: any[];
    addPlan: (plan: TrainingPlan) => void;
    updatePlan: (id: string, updates: Partial<TrainingPlan>) => void;
    deletePlan: (id: string) => void;
    submitFeedback: (feedback: Feedback) => void;
    markAttendance: (swimmerId: string, date?: string, status?: "Present" | "AthletePresent") => void;
    unmarkAttendance: (swimmerId: string, date: string) => void;
    batchMarkAttendance: (swimmerIds: string[], date: string) => Promise<void>;
    batchUnmarkAttendance: (swimmerIds: string[], date: string) => Promise<void>;
    adjustXP: (swimmerId: string, amount: number) => void;
    addSwimmer: (swimmer: Swimmer) => void;
    updateSwimmer: (id: string, updates: Partial<Swimmer>) => void;
    deleteSwimmer: (id: string) => void;
    dbWaking: boolean;
    dbOffline: boolean; // NEW: true when DB quota exceeded or unreachable
    getSwimmerArgs: (swimmerId: string) => { name: string; group: string };
    hydrateMockData: () => void;
    starPlan: (id: string) => void;
    getVisiblePlans: () => TrainingPlan[];
    addPerformance: (performance: PerformanceRecord) => void;
    updatePerformance: (id: string, updates: Partial<PerformanceRecord>) => void;
    deletePerformance: (id: string) => void;
    getSwimmerPerformances: (swimmerId: string) => PerformanceRecord[];
    getSwimmerPBs: (swimmerId: string) => Record<string, PerformanceRecord>;
    // Templates
    templates: BlockTemplate[];
    addTemplate: (block: TrainingBlock, name: string, category: BlockTemplate['category']) => void;
    deleteTemplate: (templateId: string) => void;
    recordMutation: () => void;
    addAnnouncement: (data: any) => void;
    deleteAnnouncement: (id: string) => void;
    starAnnouncement: (id: string) => void;
    getVisibleAnnouncements: () => any[];
    totalXP: number;
    clearData: () => void;
    syncStatus: 'idle' | 'syncing' | 'error';
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const isQuotaError = (msg: string) =>
    msg?.includes('data transfer quota') ||
    msg?.includes('HTTP status 402') ||
    msg?.includes('exceeded') ||
    msg?.includes('QUOTA-EXHAUSTED') ||
    msg?.includes('API Error: 503');

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [plans, setPlans] = useState<TrainingPlan[]>([]);
    const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [performances, setPerformances] = useState<PerformanceRecord[]>([]);
    const [templates, setTemplates] = useState<BlockTemplate[]>([]);
    const [weeklyPlans, setWeeklyPlans] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [archivedAnnouncements, setArchivedAnnouncements] = useState<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [dbWaking, setDbWaking] = useState(false);
    const [dbOffline, setDbOffline] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
    const lastMutationRef = useRef<number>(0);
    const offlineRef = useRef(false);
    const [hasLocalData, setHasLocalData] = useState(false);

    const recordMutation = () => {
        if (!offlineRef.current) {
            console.log("🔒 Mutation Guard: Locking sync for 15s to prioritize local state.");
        }
        lastMutationRef.current = Date.now();
    };

    // Persist collections to localStorage
    const persistToStorage = (key: string, data: any[]) => {
        try {
            localStorage.setItem(`aquaflow_local_${key}`, JSON.stringify(data));
            localStorage.setItem(`aquaflow_local_timestamp`, Date.now().toString());
        } catch (e) {
            console.warn("[localStorage] Failed to persist:", e);
        }
    };

    const STORAGE_KEYS = ['plans', 'swimmers', 'feedbacks', 'attendance', 'performances', 'weeklyPlans', 'announcements', 'archivedAnnouncements', 'templates'];

    const loadFromStorage = () => {
        try {
            const timestamp = localStorage.getItem('aquaflow_local_timestamp');
            if (!timestamp) return false;

            // Only use data less than 7 days old
            const age = Date.now() - parseInt(timestamp, 10);
            if (age > 7 * 24 * 60 * 60 * 1000) return false;

            const hasData: boolean[] = [];
            for (const key of STORAGE_KEYS) {
                const raw = localStorage.getItem(`aquaflow_local_${key}`);
                if (raw) {
                    const data = JSON.parse(raw);
                    if (data.length > 0) {
                        hasData.push(true);
                        switch (key) {
                            case 'plans': setPlans(data); break;
                            case 'swimmers': setSwimmers(data); break;
                            case 'feedbacks': setFeedbacks(data); break;
                            case 'attendance': setAttendance(data); break;
                            case 'performances': setPerformances(data); break;
                            case 'weeklyPlans': setWeeklyPlans(data); break;
                            case 'announcements': setAnnouncements(data); break;
                            case 'archivedAnnouncements': setArchivedAnnouncements(data); break;
                            case 'templates': setTemplates(data); break;
                        }
                    }
                }
            }
            return hasData.length > 0;
        } catch (e) {
            console.warn("[localStorage] Failed to load:", e);
            return false;
        }
    };

    // Load from API on mount
    useEffect(() => {
        // First, try to load from localStorage
        const loaded = loadFromStorage();
        if (loaded) setHasLocalData(true);

        const loadData = async () => {
            const wakeTimeout = setTimeout(() => setDbWaking(true), 2000);
            try {
                const safeFetch = async (fetcher: () => Promise<any>, fallback: any = []) => {
                    try { return await fetcher(); }
                    catch (e: any) {
                        if (isQuotaError(e.message)) {
                            if (!offlineRef.current) {
                                console.warn("[DB] Quota exceeded — falling back to local data");
                                offlineRef.current = true;
                                setDbOffline(true);
                            }
                            return null;
                        }
                        if (!e.message?.includes('API Error: 4') && !e.message?.includes('timed out')) {
                            console.error("Fetch API failed:", e);
                        }
                        return fallback;
                    }
                };

                // Fetch ALL data in a single request for massive performance gains
                const syncData = await safeFetch(api.sync.getAll, null);
                const {
                    plans: fetchedPlans,
                    swimmers: fetchedSwimmers,
                    feedbacks: fetchedFeedbacks,
                    attendance: fetchedAttendance,
                    performances: fetchedPerformances,
                    weeklyPlans: fetchedWeeklyPlans,
                    announcements: fetchedAnnouncements,
                    weeklyFeedbacks: fetchedWeeklyFeedbacks,
                    archivedAnnouncements: fetchedArchivedAnnouncements,
                } = syncData || {};

                const allFailed = fetchedPlans === null && fetchedSwimmers === null;

                // If all fetches failed (401 or quota), and no local data, exit
                if (allFailed && !hasLocalData && !offlineRef.current) {
                    return;
                }

                // If DB is offline (quota), keep localStorage data and don't overwrite
                if (offlineRef.current && hasLocalData) {
                    console.log("[DB] Keeping localStorage data, DB is offline");
                    return;
                }

                const transformedDaily = (fetchedWeeklyFeedbacks || []).flatMap((wf: any) =>
                    (wf.dailyFeedbacks || []).filter((df: any) => df.rpe || df.soreness || df.reflection).map((df: any) => ({
                        id: df.id,
                        swimmerId: wf.swimmerId,
                        planId: wf.weeklyPlanId || "weekly",
                        date: df.date,
                        rpe: df.rpe || 5,
                        soreness: df.soreness || 3,
                        comments: df.reflection || "",
                        timestamp: new Date().toISOString()
                    }))
                );

                // Merge: DB data takes priority, but preserve localStorage-only entries
                if (fetchedPlans) {
                    const merged = [...fetchedPlans];
                    if (hasLocalData) {
                        const localPlans = JSON.parse(localStorage.getItem('aquaflow_local_plans') || '[]');
                        const dbIds = new Set(fetchedPlans.map((p: any) => p.id));
                        for (const lp of localPlans) {
                            if (!dbIds.has(lp.id)) merged.push(lp);
                        }
                    }
                    setPlans(merged);
                }
                if (fetchedSwimmers) {
                    const merged = [...fetchedSwimmers];
                    if (hasLocalData) {
                        const localSwimmers = JSON.parse(localStorage.getItem('aquaflow_local_swimmers') || '[]');
                        const dbIds = new Set(fetchedSwimmers.map((s: any) => s.id));
                        for (const ls of localSwimmers) {
                            if (!dbIds.has(ls.id)) merged.push(ls);
                        }
                    }
                    setSwimmers(merged);
                }
                if (fetchedFeedbacks) setFeedbacks([...fetchedFeedbacks, ...transformedDaily].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                if (fetchedAttendance) setAttendance(fetchedAttendance);
                if (fetchedPerformances) setPerformances(fetchedPerformances);
                if (fetchedWeeklyPlans) setWeeklyPlans(fetchedWeeklyPlans.filter((p: any) => p.isPublished));
                if (fetchedAnnouncements) setAnnouncements(fetchedAnnouncements);
                if (fetchedArchivedAnnouncements) setArchivedAnnouncements(fetchedArchivedAnnouncements);

                // Load templates from API, fall back to defaults if empty
                let fetchedTemplates = await safeFetch(api.templates.getAll, null);
                if (!fetchedTemplates || fetchedTemplates.length === 0) {
                    fetchedTemplates = DEFAULT_TEMPLATES.map(t => ({ ...t, id: `local_${t.templateId}` }));
                }
                setTemplates(fetchedTemplates);

            } catch (error) {
                console.error("Critical failure during loadData:", error);
                // If critical failure, keep localStorage data
                if (hasLocalData) {
                    console.log("[DB] Keeping localStorage data due to critical failure");
                }
            } finally {
                clearTimeout(wakeTimeout);
                setDbWaking(false);
                setIsLoaded(true);
            }
        };

        loadData();

        // Auto-sync every 60s (increased from 30s for China network conditions)
        // Disabled when DB is offline to save quota
        const syncInterval = setInterval(async () => {
            if (offlineRef.current) return;
            if (Date.now() - lastMutationRef.current < 15000) return;

            setSyncStatus('syncing');
            try {
                const poll = async (endpoint: string) => {
                    try { return await fetchAPI(endpoint, undefined, true, 1) as any; }
                    catch (e: any) {
                        if (isQuotaError(e.message)) {
                            if (!offlineRef.current) {
                                console.warn("[DB] Quota exceeded — falling back to local data");
                                offlineRef.current = true;
                                setDbOffline(true);
                            }
                            return null;
                        }
                        if (!e.message?.includes('timed out') && !isQuotaError(e.message)) console.warn(`[poll] ${endpoint} failed:`, e.message);
                        return null;
                    }
                };

                const syncData = await poll('/sync');
                const {
                    plans,
                    swimmers,
                    feedbacks,
                    attendance,
                    performances,
                    weeklyPlans,
                    announcements,
                    weeklyFeedbacks: fetchedWeeklyFeedbacks,
                    archivedAnnouncements,
                } = syncData || {};

                if (offlineRef.current) {
                    setSyncStatus('idle');
                    return;
                }

                const failed: string[] = [];
                if (!plans) failed.push('plans');
                if (!swimmers) failed.push('swimmers');
                if (!feedbacks) failed.push('feedbacks');
                if (!attendance) failed.push('attendance');
                if (!performances) failed.push('performances');
                if (!weeklyPlans) failed.push('weeklyPlans');
                if (!announcements) failed.push('announcements');
                if (!fetchedWeeklyFeedbacks) failed.push('weeklyFeedbacks');
                if (!archivedAnnouncements) failed.push('archivedAnnouncements');
                if (failed.length > 0) {
                    console.warn(`[sync] ${failed.length} endpoint(s) returned null: ${failed.join(', ')}`);
                }
                const transformedDaily = (fetchedWeeklyFeedbacks || []).flatMap((wf: any) =>
                    (wf.dailyFeedbacks || []).filter((df: any) => df.rpe || df.soreness || df.reflection).map((df: any) => ({
                        id: df.id,
                        swimmerId: wf.swimmerId,
                        planId: wf.weeklyPlanId || "weekly",
                        date: df.date,
                        rpe: df.rpe || 5,
                        soreness: df.soreness || 3,
                        comments: df.reflection || "",
                        timestamp: new Date().toISOString()
                    }))
                );

                if (plans) setPlans(plans);
                if (swimmers) setSwimmers(swimmers);
                if (feedbacks) setFeedbacks([...feedbacks, ...transformedDaily].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                if (attendance) setAttendance(attendance);
                if (performances) setPerformances(performances);
                if (weeklyPlans) setWeeklyPlans(weeklyPlans.filter((p: any) => p.isPublished));
                if (announcements) setAnnouncements(announcements);
                if (archivedAnnouncements) setArchivedAnnouncements(archivedAnnouncements);

                setSyncStatus('idle');
            } catch (error) {
                console.error("Auto-sync failed:", error);
                setSyncStatus('error');
            }
        }, 60000);

        return () => clearInterval(syncInterval);
    }, []);

    const addPlan = async (plan: TrainingPlan) => {
        recordMutation();
        setPlans((prev) => { const next = [plan, ...prev]; persistToStorage('plans', next); return next; });
        try {
            await api.plans.create(plan);
        } catch (e) {
            console.error("Sync error (addPlan):", e);
            setPlans((prev) => { const next = prev.filter((p) => p.id !== plan.id); persistToStorage('plans', next); return next; });
            throw e;
        }
    };

    const updatePlan = async (id: string, updates: Partial<TrainingPlan>) => {
        recordMutation();
        setPlans((prev) => { const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p)); persistToStorage('plans', next); return next; });
        try {
            await api.plans.update(id, updates);
        } catch (e) {
            console.error("Sync error (updatePlan):", e);
            throw e;
        }
    };

    const deletePlan = async (id: string) => {
        recordMutation();
        setPlans((prev) => { const next = prev.filter((p) => p.id !== id); persistToStorage('plans', next); return next; });
        try {
            await api.plans.delete(id);
        } catch (e) { console.error("Sync error", e); }
    };

    const submitFeedback = async (fb: Feedback) => {
        recordMutation();
        // Update local state: replace if same swimmerId+date exists, otherwise add
        setFeedbacks((prev) => {
            const existingIdx = prev.findIndex(f => f.swimmerId === fb.swimmerId && f.date === fb.date);
            if (existingIdx >= 0) {
                const updated = [...prev];
                updated[existingIdx] = fb;
                return updated;
            }
            return [...prev, fb];
        });
        adjustXP(fb.swimmerId, 20);
        try {
            await api.feedbacks.create(fb);
            console.log("✅ Feedback synced (upsert)");
        } catch (e) {
            console.error("❌ Sync error (submitFeedback):", e);
            throw e;
        }
        markAttendance(fb.swimmerId);
    };

    const markAttendance = async (swimmerId: string, date?: string, status: "Present" | "AthletePresent" = "Present") => {
        const targetDate = date || getLocalDateISOString(new Date());
        const existingRecord = attendance.find(a => a.swimmerId === swimmerId && a.date === targetDate);
        if (existingRecord) {
            if (existingRecord.status === 'Present') return;
            if (existingRecord.status === 'AthletePresent' && status === 'AthletePresent') return;
        }

        const newRecord: AttendanceRecord = {
            id: existingRecord ? existingRecord.id : uid(),
            date: targetDate,
            swimmerId,
            status,
            timestamp: new Date().toISOString()
        };

        if (existingRecord) {
            setAttendance(prev => { const next = prev.map(a => a.id === existingRecord.id ? newRecord : a); persistToStorage('attendance', next); return next; });
        } else {
            setAttendance((prev) => { const next = [...prev, newRecord]; persistToStorage('attendance', next); return next; });
        }

        recordMutation();
        adjustXP(swimmerId, 10);

        try {
            const dbRecord = await api.attendance.create(newRecord);
            if (dbRecord?.id) {
                setAttendance(prev => { const next = prev.map(a => a.id === newRecord.id ? { ...a, id: dbRecord.id } : a); persistToStorage('attendance', next); return next; });
            }
        } catch (e) {
            console.error("Sync error", e);
            setAttendance(prev => { const next = prev.filter(a => a.id !== newRecord.id); persistToStorage('attendance', next); return next; });
        }
    };

    const unmarkAttendance = async (swimmerId: string, date: string) => {
        const records = attendance.filter(a => a.swimmerId === swimmerId && a.date === date);
        if (records.length === 0) return;

        recordMutation();
        setAttendance(prev => { const next = prev.filter(a => !(a.swimmerId === swimmerId && a.date === date)); persistToStorage('attendance', next); return next; });
        try {
            await Promise.all(records.map(record => api.attendance.delete(record.id)));
        } catch (e) {
            console.error("Sync error", e);
            setAttendance(prev => { const next = [...prev, ...records]; persistToStorage('attendance', next); return next; });
        }
    };

    const batchMarkAttendance = async (swimmerIds: string[], date: string) => {
        const timestamp = new Date().toISOString();
        const newRecords = swimmerIds.map(id => ({
            id: uid(),
            date,
            swimmerId: id,
            status: "Present" as const,
            timestamp
        }));

        setAttendance(prev => { const next = [...prev, ...newRecords]; persistToStorage('attendance', next); return next; });
        recordMutation();
        swimmerIds.forEach(id => adjustXP(id, 10));

        try {
            const results = await Promise.allSettled(newRecords.map(r => api.attendance.create(r)));
            const failed = results.filter(r => r.status === 'rejected');
            if (failed.length > 0) {
                console.error(`${failed.length} attendance records failed to sync`);
            }
        } catch (e) { console.error("Sync error", e); }
    };

    const batchUnmarkAttendance = async (swimmerIds: string[], date: string) => {
        const idsSet = new Set(swimmerIds);
        const recordsToRemove = attendance.filter(a => idsSet.has(a.swimmerId) && a.date === date);

        setAttendance(prev => { const next = prev.filter(a => !(idsSet.has(a.swimmerId) && a.date === date)); persistToStorage('attendance', next); return next; });
        recordMutation();
        try {
            await Promise.all(recordsToRemove.map(r => api.attendance.delete(r.id)));
        } catch (e) {
            console.error("Sync error", e);
            setAttendance(prev => { const next = [...prev, ...recordsToRemove]; persistToStorage('attendance', next); return next; });
        }
    };

    const calculateLevel = (xp: number) => {
        if (xp < 10) return 1;
        return Math.floor(Math.log2(xp / 10 + 1)) + 1;
    };

    const adjustXP = async (swimmerId: string, amount: number) => {
        recordMutation();
        let updatedSwimmer: Swimmer | undefined;
        setSwimmers(prev => {
            const next = prev.map(s => {
                if (s.id !== swimmerId) return s;
                const newXP = Math.max(0, (s.xp || 0) + amount);
                const newLevel = calculateLevel(newXP);
                updatedSwimmer = { ...s, xp: newXP, level: newLevel };
                return updatedSwimmer;
            });
            if (updatedSwimmer) persistToStorage('swimmers', next);
            return next;
        });
        if (updatedSwimmer) {
            try {
                await api.swimmers.update(swimmerId, updatedSwimmer);
            } catch (e) {
                console.error("XP sync failed:", e);
            }
        }
    };

    const addSwimmer = async (swimmer: Swimmer) => {
        recordMutation();
        setSwimmers((prev) => { const next = [...prev, swimmer]; persistToStorage('swimmers', next); return next; });
        try {
            const savedSwimmer = await api.swimmers.create(swimmer);
            if (savedSwimmer?.id) {
                setSwimmers((prev) => { const next = prev.map(s => s.id === swimmer.id ? savedSwimmer : s); persistToStorage('swimmers', next); return next; });
            }
        } catch (e) {
            setSwimmers((prev) => { const next = prev.filter((s) => s.id !== swimmer.id); persistToStorage('swimmers', next); return next; });
        }
    };

    const updateSwimmer = async (id: string, updates: Partial<Swimmer>) => {
        recordMutation();
        const oldSwimmer = swimmers.find(s => s.id === id);
        // Merge with existing data to send complete object to API
        const merged = oldSwimmer ? { ...oldSwimmer, ...updates } : updates;
        setSwimmers((prev) => { const next = prev.map((s) => (s.id === id ? { ...s, ...updates } : s)); persistToStorage('swimmers', next); return next; });
        try {
            const result = await api.swimmers.update(id, merged);
            // Use server response to update local state with authoritative data
            if (result?.id) {
                setSwimmers((prev) => { const next = prev.map((s) => (s.id === result.id ? { ...s, ...result } : s)); persistToStorage('swimmers', next); return next; });
            }
        } catch (e) {
            console.error("Swimmer update failed:", e);
            if (oldSwimmer) setSwimmers((prev) => { const next = prev.map((s) => (s.id === id ? oldSwimmer : s)); persistToStorage('swimmers', next); return next; });
            throw e;
        }
    };

    const deleteSwimmer = async (id: string) => {
        recordMutation();
        setSwimmers((prev) => { const next = prev.filter((s) => s.id !== id); persistToStorage('swimmers', next); return next; });
        try {
            await api.swimmers.delete(id);
        } catch (e) { console.error("Sync error", e); }
    };

    const starPlan = async (id: string) => {
        let targetState: boolean | undefined;
        setPlans(prev => {
            const plan = prev.find(p => p.id === id);
            if (plan) {
                targetState = !plan.isStarred;
                api.plans.update(id, { isStarred: targetState }).catch((e) => console.warn("Star sync failed:", e));
            }
            return prev.map(p => p.id === id ? { ...p, isStarred: !p.isStarred } : p);
        });
    };

    const addPerformance = async (perf: PerformanceRecord) => {
        recordMutation();
        setPerformances(prev => { const next = [perf, ...prev]; persistToStorage('performances', next); return next; });
        try { await api.performances.create(perf); } catch (e) {
            console.error("Failed to add performance:", e);
            setPerformances(prev => { const next = prev.filter(p => p.id !== perf.id); persistToStorage('performances', next); return next; });
        }
    };

    const updatePerformance = async (id: string, updates: Partial<PerformanceRecord>) => {
        recordMutation();
        setPerformances(prev => { const next = prev.map(p => p.id === id ? { ...p, ...updates } : p); persistToStorage('performances', next); return next; });
        try {
            await api.performances.update(id, updates);
        } catch (e) { console.error("Performance sync failed:", e); }
    };

    const deletePerformance = async (id: string) => {
        const perfToDelete = performances.find(p => p.id === id);
        if (!perfToDelete) return;

        recordMutation();
        setPerformances(prev => { const next = prev.filter(p => p.id !== id); persistToStorage('performances', next); return next; });

        try {
            await api.performances.delete(id);
        } catch (e) {
            console.error("Failed to delete performance from server, rolling back:", e);
            setPerformances(prev => { const next = [perfToDelete, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); persistToStorage('performances', next); return next; });
        }
    };

    const addTemplate = async (block: TrainingBlock, name: string, category: BlockTemplate['category']) => {
        const templateId = uid();
        const newTemplate: BlockTemplate = {
            ...block,
            id: `local_${templateId}`,
            templateId,
            name,
            category,
        };
        setTemplates(prev => { const next = [newTemplate, ...prev]; persistToStorage('templates', next); return next; });
        try {
            const saved = await api.templates.create({ ...newTemplate });
            if (saved?.id) {
                setTemplates(prev => { const next = prev.map(t => t.id === newTemplate.id ? { ...t, id: saved.id } : t); persistToStorage('templates', next); return next; });
            }
        } catch (e) {
            console.error("Failed to save template:", e);
            setTemplates(prev => { const next = prev.filter(t => t.id !== newTemplate.id); persistToStorage('templates', next); return next; });
        }
    };

    const deleteTemplate = async (templateId: string) => {
        const tmpl = templates.find(t => t.templateId === templateId);
        setTemplates(prev => { const next = prev.filter(t => t.templateId !== templateId); persistToStorage('templates', next); return next; });
        try {
            if (tmpl && !tmpl.id?.startsWith('local_')) {
                await api.templates.delete(tmpl.id);
            }
        } catch (e) {
            console.error("Failed to delete template:", e);
            if (tmpl) setTemplates(prev => { const next = [...prev, tmpl]; persistToStorage('templates', next); return next; });
        }
    };

    const addAnnouncement = async (data: any) => {
        recordMutation();
        const tempId = `temp_${Date.now()}`;
        const tempAnnouncement = { ...data, id: tempId, createdAt: new Date().toISOString(), isStarred: false };
        setAnnouncements(prev => { const next = [tempAnnouncement, ...prev]; persistToStorage('announcements', next); return next; });
        try {
            const created = await api.announcements.create(data);
            setAnnouncements(prev => { const next = prev.map(a => a.id === tempId ? created : a); persistToStorage('announcements', next); return next; });
        } catch (e) {
            console.error("Failed to create announcement, rolling back:", e);
            setAnnouncements(prev => { const next = prev.filter(a => a.id !== tempId); persistToStorage('announcements', next); return next; });
            throw e;
        }
    };

    const deleteAnnouncement = async (id: string) => {
        recordMutation();
        setAnnouncements(prev => { const next = prev.filter(a => a.id !== id); persistToStorage('announcements', next); return next; });
        try {
            await api.announcements.delete(id);
        } catch (e) {
            console.error("Failed to delete announcement:", e);
            setAnnouncements(prev => { const next = [...prev]; persistToStorage('announcements', next); return next; });
        }
    };

    const starAnnouncement = async (id: string) => {
        let targetState: boolean | undefined;
        setAnnouncements(prev => {
            const ann = prev.find(a => a.id === id);
            if (ann) {
                targetState = !ann.isStarred;
                api.announcements.toggleStar(id, targetState).catch((e) => console.warn("Star sync failed:", e));
            }
            return prev.map(a => a.id === id ? { ...a, isStarred: !a.isStarred } : a);
        });
        // Also update archived list if present
        setArchivedAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isStarred: targetState } : a));
    };

    const clearData = async () => {
        if (confirm("确定要清空所有数据吗？此操作不可逆。")) {
            setPlans([]);
            setSwimmers([]);
            setFeedbacks([]);
            setAttendance([]);
            setPerformances([]);
        }
    };

    return (
        <StoreContext.Provider value={{
            isLoaded, plans, swimmers, feedbacks, attendance, performances, weeklyPlans, announcements,
            addPlan, updatePlan, deletePlan, submitFeedback, markAttendance, unmarkAttendance,
            batchMarkAttendance, batchUnmarkAttendance, adjustXP, addSwimmer, updateSwimmer, deleteSwimmer,
            dbWaking, dbOffline, recordMutation, getSwimmerArgs: (id) => {
                const s = swimmers.find(sw => sw.id === id);
                return { name: s?.name || "未知", group: s?.group || "无" };
            },
            hydrateMockData: () => {
                setPlans(MOCK_PLANS);
                setSwimmers(MOCK_SWIMMERS);
                setTemplates(DEFAULT_TEMPLATES.map(t => ({ ...t, id: `local_${t.templateId}` })));
            },
            starPlan, getVisiblePlans: () => {
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - 14);
                const cutoffStr = cutoff.toISOString().split('T')[0];
                return plans
                    .filter(p => p.isStarred || p.date >= cutoffStr)
                    .sort((a, b) => (a.isStarred === b.isStarred ? 0 : a.isStarred ? -1 : 1));
            },
            addPerformance, updatePerformance, deletePerformance,
            getSwimmerPerformances: (id) => performances.filter(p => p.swimmerId === id),
            getSwimmerPBs: (id) => {
                const parseSwimTime = (time: string) => {
                    const parts = time.split(':');
                    return parts.length === 2 ? parseFloat(parts[0]) * 60 + parseFloat(parts[1]) : parseFloat(time) || Infinity;
                };
                const swimmerPerfs = performances.filter(p => p.swimmerId === id);
                const pbs: Record<string, PerformanceRecord> = {};
                swimmerPerfs.forEach(p => {
                    const key = p.event;
                    const t = parseSwimTime(p.time);
                    const best = pbs[key] ? parseSwimTime(pbs[key].time) : Infinity;
                    if (!pbs[key] || t < best) pbs[key] = p;
                });
                return pbs;
            },
            templates, addTemplate, deleteTemplate,
            addAnnouncement, deleteAnnouncement, starAnnouncement,
            getVisibleAnnouncements: () => {
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - 7);
                return announcements
                    .filter(a => new Date(a.createdAt) >= cutoff || a.isStarred)
                    .sort((a, b) => (a.isStarred === b.isStarred ? 0 : a.isStarred ? -1 : 1));
            },
            archivedAnnouncements,
            totalXP: swimmers.reduce((acc, s) => acc + (s.xp || 0), 0),
            clearData,
            syncStatus
        }}>
            {children}
        </StoreContext.Provider>
    );
}

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error("useStore must be used within StoreProvider");
    return context;
};
