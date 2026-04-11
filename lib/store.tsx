"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { TrainingPlan, Swimmer, Feedback, AttendanceRecord, PerformanceRecord, BlockTemplate, TrainingBlock, SwimEvent } from "@/types";
import { MOCK_PLANS, MOCK_SWIMMERS, DEFAULT_TEMPLATES } from "./data";
import { getLocalDateISOString } from "@/lib/date-utils";
import { api } from "./api-client";

const uid = () => Math.random().toString(36).substr(2, 9);

interface StoreContextType {
    isLoaded: boolean;
    plans: TrainingPlan[];
    swimmers: Swimmer[];
    feedbacks: Feedback[];
    attendance: AttendanceRecord[];
    performances: PerformanceRecord[];
    weeklyPlans: any[];
    addPlan: (plan: TrainingPlan) => void;
    updatePlan: (id: string, updates: Partial<TrainingPlan>) => void;
    deletePlan: (id: string) => void;
    submitFeedback: (feedback: Feedback) => void;
    markAttendance: (swimmerId: string, date?: string) => void;
    unmarkAttendance: (swimmerId: string, date: string) => void;
    batchMarkAttendance: (swimmerIds: string[], date: string) => Promise<void>;
    batchUnmarkAttendance: (swimmerIds: string[], date: string) => Promise<void>;
    adjustXP: (swimmerId: string, amount: number) => void;
    addSwimmer: (swimmer: Swimmer) => void;
    updateSwimmer: (id: string, updates: Partial<Swimmer>) => void;
    deleteSwimmer: (id: string) => void;
    dbWaking: boolean;
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
    totalXP: number;
    clearData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [plans, setPlans] = useState<TrainingPlan[]>([]);
    const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [performances, setPerformances] = useState<PerformanceRecord[]>([]);
    const [templates, setTemplates] = useState<BlockTemplate[]>([]);
    const [weeklyPlans, setWeeklyPlans] = useState<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [dbWaking, setDbWaking] = useState(false);
    const lastMutationRef = useRef<number>(0);

    const recordMutation = () => {
        console.log("🔒 Mutation Guard: Locking sync for 15s to prioritize local state.");
        lastMutationRef.current = Date.now();
    };

    // Load from API on mount
    useEffect(() => {
        const loadData = async () => {
            const wakeTimeout = setTimeout(() => setDbWaking(true), 2000);
            try {
                // Fetch all data in parallel
                const [
                    fetchedPlans,
                    fetchedSwimmers,
                    fetchedFeedbacks,
                    fetchedAttendance,
                    fetchedPerformances,
                    fetchedWeeklyPlans
                ] = await Promise.all([
                    api.plans.getAll(),
                    api.swimmers.getAll(),
                    api.feedbacks.getAll(),
                    api.attendance.getAll(),
                    api.performances.getAll(),
                    api.weeklyPlans.getAll()
                ]);

                setPlans(fetchedPlans || []);
                setSwimmers(fetchedSwimmers || []);
                setFeedbacks(fetchedFeedbacks || []);
                setAttendance(fetchedAttendance || []);
                setPerformances(fetchedPerformances || []);
                setWeeklyPlans((fetchedWeeklyPlans || []).filter((p: any) => p.isPublished));

                // Load templates from localStorage
                const savedTemplates = localStorage.getItem("aquaflow_templates");
                const userTemplates = savedTemplates ? JSON.parse(savedTemplates) : [];
                const defaultIds = new Set(DEFAULT_TEMPLATES.map(t => t.templateId));
                const uniqueUserTemplates = userTemplates.filter((t: BlockTemplate) => !defaultIds.has(t.templateId));
                setTemplates([...uniqueUserTemplates, ...DEFAULT_TEMPLATES]);

            } catch (error) {
                console.error("Failed to load data from API:", error);
            } finally {
                clearTimeout(wakeTimeout);
                setDbWaking(false);
                setIsLoaded(true);
            }
        };

        loadData();

        // Auto-sync every 30s for better real-time experience
        const syncInterval = setInterval(async () => {
            if (Date.now() - lastMutationRef.current < 15000) {
                console.log("⏳ Sync deferred: Local mutation in progress...");
                return;
            }

            try {
                const [plans, swimmers, feedbacks, attendance, performances, weeklyPlans] = await Promise.all([
                    api.plans.getAll(),
                    api.swimmers.getAll(),
                    api.feedbacks.getAll(),
                    api.attendance.getAll(),
                    api.performances.getAll(),
                    api.weeklyPlans.getAll()
                ]);

                setPlans(plans || []);
                setSwimmers(swimmers || []);
                setFeedbacks(feedbacks || []);
                setAttendance(attendance || []);
                setPerformances(performances || []);
                setWeeklyPlans((weeklyPlans || []).filter((p: any) => p.isPublished));
            } catch (error) {
                console.error("Auto-sync failed:", error);
            }
        }, 30000);

        return () => clearInterval(syncInterval);
    }, []);

    // Persist templates to localStorage
    useEffect(() => {
        if (isLoaded && templates.length > 0) {
            const defaultIds = new Set(DEFAULT_TEMPLATES.map(t => t.templateId));
            const userTemplates = templates.filter(t => !defaultIds.has(t.templateId));
            localStorage.setItem("aquaflow_templates", JSON.stringify(userTemplates));
        }
    }, [templates, isLoaded]);

    const addPlan = async (plan: TrainingPlan) => {
        recordMutation();
        setPlans((prev) => [plan, ...prev]);
        try {
            await api.plans.create(plan);
            console.log("✅ Plan synced to server");
        } catch (e) { 
            console.error("❌ Sync error (addPlan):", e);
            throw e; // Propagate error so UI can show "Send Failed"
        }
    };

    const updatePlan = async (id: string, updates: Partial<TrainingPlan>) => {
        recordMutation();
        setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
        try {
            const currentPlan = plans.find(p => p.id === id);
            if (currentPlan) {
                await api.plans.update(id, { ...currentPlan, ...updates });
                console.log("✅ Plan update synced");
            }
        } catch (e) { 
            console.error("❌ Sync error (updatePlan):", e);
            throw e;
        }
    };

    const deletePlan = async (id: string) => {
        recordMutation();
        setPlans((prev) => prev.filter((p) => p.id !== id));
        try {
            await api.plans.delete(id);
        } catch (e) { console.error("Sync error", e); }
    };

    const submitFeedback = async (fb: Feedback) => {
        recordMutation();
        setFeedbacks((prev) => [...prev, fb]);
        adjustXP(fb.swimmerId, 20);
        try {
            await api.feedbacks.create(fb);
            console.log("✅ Feedback synced");
        } catch (e) { 
            console.error("❌ Sync error (submitFeedback):", e);
            throw e;
        }
        markAttendance(fb.swimmerId);
    };

    const markAttendance = async (swimmerId: string, date?: string) => {
        const targetDate = date || getLocalDateISOString(new Date());
        if (attendance.some(a => a.swimmerId === swimmerId && a.date === targetDate)) return;

        const newRecord: AttendanceRecord = {
            id: uid(),
            date: targetDate,
            swimmerId,
            status: "Present",
            timestamp: new Date().toISOString()
        };

        setAttendance((prev) => [...prev, newRecord]);
        recordMutation();
        adjustXP(swimmerId, 10);

        try {
            const dbRecord = await api.attendance.create(newRecord);
            if (dbRecord?.id) {
                setAttendance(prev => prev.map(a => a.id === newRecord.id ? { ...a, id: dbRecord.id } : a));
            }
        } catch (e) {
            console.error("Sync error", e);
            setAttendance(prev => prev.filter(a => a.id !== newRecord.id));
        }
    };

    const unmarkAttendance = async (swimmerId: string, date: string) => {
        const records = attendance.filter(a => a.swimmerId === swimmerId && a.date === date);
        if (records.length === 0) return;

        recordMutation();
        setAttendance(prev => prev.filter(a => !(a.swimmerId === swimmerId && a.date === date)));
        try {
            await Promise.all(records.map(record => api.attendance.delete(record.id)));
        } catch (e) {
            console.error("Sync error", e);
            setAttendance(prev => [...prev, ...records]);
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

        setAttendance(prev => [...prev, ...newRecords]);
        recordMutation();
        swimmerIds.forEach(id => adjustXP(id, 10));

        try {
            await Promise.all(newRecords.map(r => api.attendance.create(r)));
        } catch (e) { console.error("Sync error", e); }
    };

    const batchUnmarkAttendance = async (swimmerIds: string[], date: string) => {
        const idsSet = new Set(swimmerIds);
        const recordsToRemove = attendance.filter(a => idsSet.has(a.swimmerId) && a.date === date);
        
        setAttendance(prev => prev.filter(a => !(idsSet.has(a.swimmerId) && a.date === date)));
        recordMutation();
        try {
            await Promise.all(recordsToRemove.map(r => api.attendance.delete(r.id)));
        } catch (e) {
            console.error("Sync error", e);
            setAttendance(prev => [...prev, ...recordsToRemove]);
        }
    };

    const calculateLevel = (xp: number) => {
        if (xp < 10) return 1;
        return Math.floor(Math.log2(xp / 10 + 1)) + 1;
    };

    const adjustXP = async (swimmerId: string, amount: number) => {
        recordMutation();
        let updatedSwimmer: Swimmer | undefined;
        setSwimmers(prev => prev.map(s => {
            if (s.id !== swimmerId) return s;
            const newXP = Math.max(0, (s.xp || 0) + amount);
            const newLevel = calculateLevel(newXP);
            updatedSwimmer = { ...s, xp: newXP, level: newLevel };
            return updatedSwimmer;
        }));
        if (updatedSwimmer) {
            try { await api.swimmers.update(swimmerId, updatedSwimmer); } catch (e) { }
        }
    };

    const addSwimmer = async (swimmer: Swimmer) => {
        recordMutation();
        setSwimmers((prev) => [...prev, swimmer]);
        try {
            const savedSwimmer = await api.swimmers.create(swimmer);
            if (savedSwimmer?.id) {
                setSwimmers((prev) => prev.map(s => s.id === swimmer.id ? savedSwimmer : s));
            }
        } catch (e) {
            setSwimmers((prev) => prev.filter((s) => s.id !== swimmer.id));
        }
    };

    const updateSwimmer = async (id: string, updates: Partial<Swimmer>) => {
        recordMutation();
        const oldSwimmer = swimmers.find(s => s.id === id);
        setSwimmers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
        try {
            const s = swimmers.find(sw => sw.id === id);
            if (s) await api.swimmers.update(id, { ...s, ...updates });
        } catch (e) {
            if (oldSwimmer) setSwimmers((prev) => prev.map((s) => (s.id === id ? oldSwimmer : s)));
        }
    };

    const deleteSwimmer = async (id: string) => {
        recordMutation();
        setSwimmers((prev) => prev.filter((s) => s.id !== id));
        try {
            await api.swimmers.delete(id);
        } catch (e) { console.error("Sync error", e); }
    };

    const starPlan = async (id: string) => {
        let updatedPlan: TrainingPlan | undefined;
        setPlans(prev => prev.map(p => {
            if (p.id === id) {
                updatedPlan = { ...p, isStarred: !p.isStarred };
                return updatedPlan;
            }
            return p;
        }));
        if (updatedPlan) {
            try { await api.plans.update(id, updatedPlan); } catch (e) { }
        }
    };

    const addPerformance = async (perf: PerformanceRecord) => {
        recordMutation();
        setPerformances(prev => [perf, ...prev]);
        try { await api.performances.create(perf); } catch (e) { }
    };

    const updatePerformance = async (id: string, updates: Partial<PerformanceRecord>) => {
        recordMutation();
        setPerformances(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        try {
            const p = performances.find(perf => perf.id === id);
            if (p) await api.performances.update(id, { ...p, ...updates });
        } catch (e) { }
    };

    const deletePerformance = async (id: string) => {
        const perfToDelete = performances.find(p => p.id === id);
        if (!perfToDelete) return;

        recordMutation();
        setPerformances(prev => prev.filter(p => p.id !== id));
        
        try { 
            await api.performances.delete(id); 
        } catch (e) { 
            console.error("Failed to delete performance from server, rolling back:", e);
            // Rollback UI state
            setPerformances(prev => [perfToDelete, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            alert("❌ 删除成绩失败，请检查网络。");
        }
    };

    const addTemplate = (block: TrainingBlock, name: string, category: BlockTemplate['category']) => {
        const newTemplate: BlockTemplate = {
            ...block,
            templateId: uid(),
            name,
            category,
        };
        setTemplates(prev => [newTemplate, ...prev]);
    };

    const deleteTemplate = (templateId: string) => {
        setTemplates(prev => prev.filter(t => t.templateId !== templateId));
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
            isLoaded, plans, swimmers, feedbacks, attendance, performances, weeklyPlans,
            addPlan, updatePlan, deletePlan, submitFeedback, markAttendance, unmarkAttendance,
            batchMarkAttendance, batchUnmarkAttendance, adjustXP, addSwimmer, updateSwimmer, deleteSwimmer,
            dbWaking, recordMutation, getSwimmerArgs: (id) => {
                const s = swimmers.find(sw => sw.id === id);
                return { name: s?.name || "未知", group: s?.group || "无" };
            },
            hydrateMockData: () => {},
            starPlan, getVisiblePlans: () => [...plans].sort((a,b) => (a.isStarred === b.isStarred ? 0 : a.isStarred ? -1 : 1)),
            addPerformance, updatePerformance, deletePerformance, 
            getSwimmerPerformances: (id) => performances.filter(p => p.swimmerId === id),
            getSwimmerPBs: (id) => {
                const swimmerPerfs = performances.filter(p => p.swimmerId === id);
                const pbs: Record<string, PerformanceRecord> = {};
                swimmerPerfs.forEach(p => {
                    const key = p.event;
                    if (!pbs[key] || parseFloat(p.time) < parseFloat(pbs[key].time)) pbs[key] = p;
                });
                return pbs;
            },
            templates, addTemplate, deleteTemplate,
            totalXP: swimmers.reduce((acc, s) => acc + (s.xp || 0), 0),
            clearData
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
