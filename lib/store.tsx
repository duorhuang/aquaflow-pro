"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TrainingPlan, Swimmer, Feedback, AttendanceRecord, PerformanceRecord, BlockTemplate, TrainingBlock } from "@/types";
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
    const [isLoaded, setIsLoaded] = useState(false);
    const lastMutationRef = React.useRef<number>(0);

    const recordMutation = () => {
        lastMutationRef.current = Date.now();
    };

    // Load from LocalStorage on mount
    // Load from API on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch all data in parallel for much faster initial load times
                const [
                    fetchedPlans,
                    fetchedSwimmers,
                    fetchedFeedbacks,
                    fetchedAttendance,
                    fetchedPerformances
                ] = await Promise.all([
                    api.plans.getAll(),
                    api.swimmers.getAll(),
                    api.feedbacks.getAll(),
                    api.attendance.getAll(),
                    api.performances.getAll()
                ]);

                setPlans(fetchedPlans);
                setSwimmers(fetchedSwimmers);
                setFeedbacks(fetchedFeedbacks);
                setAttendance(fetchedAttendance);
                setPerformances(fetchedPerformances);

                // Load templates from localStorage and merge with defaults
                const savedTemplates = localStorage.getItem("aquaflow_templates");
                const userTemplates = savedTemplates ? JSON.parse(savedTemplates) : [];
                const defaultIds = new Set(DEFAULT_TEMPLATES.map(t => t.templateId));
                const uniqueUserTemplates = userTemplates.filter((t: BlockTemplate) => !defaultIds.has(t.templateId));
                setTemplates([...uniqueUserTemplates, ...DEFAULT_TEMPLATES]);

            } catch (error) {
                console.error("Failed to load data from API:", error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadData();

        // Auto-sync: Poll for updates every 30 seconds
        // This ensures data stays in sync across devices with different network environments
        const AUTO_SYNC_INTERVAL = 30000; // 30 seconds
        const syncInterval = setInterval(async () => {
            // Mutation Guard: Skip sync if a user action happened recently (within 10s)
            // to prevent the UI from flickering back to old state while server is still writing
            if (Date.now() - lastMutationRef.current < 10000) {
                console.log("Mutation guard active, skipping sync...");
                return;
            }

            try {
                // Silently refresh data in the background
                const [plans, swimmers, feedbacks, attendance, performances] = await Promise.all([
                    api.plans.getAll(),
                    api.swimmers.getAll(),
                    api.feedbacks.getAll(),
                    api.attendance.getAll(),
                    api.performances.getAll()
                ]);

                setPlans(plans);
                setSwimmers(swimmers);
                setFeedbacks(feedbacks);
                setAttendance(attendance);
                setPerformances(performances);
            } catch (error) {
                // Silently fail - don't disrupt user experience
                console.error("Auto-sync failed:", error);
            }
        }, AUTO_SYNC_INTERVAL);

        // Cleanup interval on unmount
        return () => clearInterval(syncInterval);
    }, []);


    // Persist templates to localStorage
    useEffect(() => {
        if (isLoaded && templates.length > 0) {
            // Only save user templates (not default ones)
            const defaultIds = new Set(DEFAULT_TEMPLATES.map(t => t.templateId));
            const userTemplates = templates.filter(t => !defaultIds.has(t.templateId));
            localStorage.setItem("aquaflow_templates", JSON.stringify(userTemplates));
        }
    }, [templates, isLoaded]);

    // Listen for localStorage changes from other tabs/windows


    const addPlan = async (plan: TrainingPlan) => {
        recordMutation();
        // Optimistic update
        setPlans((prev) => [plan, ...prev]);
        try {
            await api.plans.create(plan);
        } catch (e) {
            console.error("Failed to sync plan", e);
        }
    };

    const updatePlan = async (id: string, updates: Partial<TrainingPlan>) => {
        recordMutation();
        setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
        try {
            const currentPlan = plans.find(p => p.id === id);
            if (currentPlan) {
                await api.plans.update(id, { ...currentPlan, ...updates });
            }
        } catch (e) {
            console.error("Failed to sync plan update", e);
        }
    };

    const deletePlan = async (id: string) => {
        recordMutation();
        setPlans((prev) => prev.filter((p) => p.id !== id));
        try {
            await api.plans.delete(id);
        } catch (e) {
            console.error("Failed to sync plan delete", e);
        }
    };

    const submitFeedback = async (fb: Feedback) => {
        recordMutation();
        setFeedbacks((prev) => [...prev, fb]);
        
        // Reward XP for writing feedback (+20 XP)
        adjustXP(fb.swimmerId, 20);

        try {
            await api.feedbacks.create(fb);
        } catch (e) {
            console.error("Failed to sync feedback", e);
        }
        // Auto-check-in: when athlete writes feedback, auto mark attendance
        markAttendance(fb.swimmerId);
    };

    // Helper to find the PREVIOUS plan date before today
    const getPreviousPlanDate = (group: string, beforeDate: string): string | null => {
        // Find all plans for this group, sort desc
        const groupPlans = plans
            .filter(p => p.group === group && p.date < beforeDate)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return groupPlans.length > 0 ? groupPlans[0].date : null;
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
        
        // Reward XP for attendance (+10 XP)
        adjustXP(swimmerId, 10);

        try {
            const dbRecord = await api.attendance.create({
                date: newRecord.date,
                swimmerId: newRecord.swimmerId,
                status: newRecord.status,
                timestamp: newRecord.timestamp
            });
            // Update the optimistic ID to the real database ID
            if (dbRecord && dbRecord.id) {
                setAttendance(prev => prev.map(a => a.id === newRecord.id ? { ...a, id: dbRecord.id } : a));
            }
        } catch (e) {
            console.error("Sync error", e);
            // Revert optimistic if error
            setAttendance(prev => prev.filter(a => a.id !== newRecord.id));
        }

        // Update Swimmer Stats logic (XP, Streak)
        let updatedSwimmer: Swimmer | undefined;

        setSwimmers(prevSwimmers => prevSwimmers.map(s => {
            if (s.id !== swimmerId) return s;

            let newStreak = s.currentStreak || 0;
            const lastCheckIn = s.lastCheckIn;

            if (lastCheckIn) {
                const prevPlanDate = getPreviousPlanDate(s.group, targetDate);
                if (prevPlanDate) {
                    const isConsecutivePlan = lastCheckIn === prevPlanDate;
                    if (isConsecutivePlan) {
                        newStreak += 1;
                    } else {
                        const d1 = new Date(targetDate);
                        const d2 = new Date(lastCheckIn);
                        const diffTime = Math.abs(d1.getTime() - d2.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays <= 1) newStreak += 1;
                        else newStreak = 1;
                    }
                } else {
                    newStreak = 1;
                }
            } else {
                newStreak = 1;
            }

            let streakBonus = 0;
            if (newStreak >= 15) streakBonus = 3;
            else if (newStreak >= 6) streakBonus = 2;
            else if (newStreak >= 3) streakBonus = 1;

            const xpGained = 20 + streakBonus;
            const newXP = (s.xp || 0) + xpGained;
            const newLevel = calculateLevel(newXP);

            updatedSwimmer = {
                ...s,
                lastCheckIn: targetDate,
                currentStreak: newStreak,
                xp: newXP,
                level: newLevel
            };
            return updatedSwimmer;
        }));

        if (updatedSwimmer) {
            try {
                await api.swimmers.update(updatedSwimmer.id, updatedSwimmer);
            } catch (e) { console.error("Sync swimmer error", e); }
        }
    };

    const unmarkAttendance = async (swimmerId: string, date: string) => {
        // Since double clicking can create multiple records if network is slow, delete all matching records
        const records = attendance.filter(a => a.swimmerId === swimmerId && a.date === date);
        if (records.length === 0) return;

        // Optimistic remove
        recordMutation();
        setAttendance(prev => prev.filter(a => !(a.swimmerId === swimmerId && a.date === date)));
        try {
            await Promise.all(records.map(record => api.attendance.delete(record.id)));
        } catch (e) {
            console.error("Failed to unmark attendance", e);
            // Revert on failure
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
        
        // Reward XP for all swimmers in batch (+10 XP each)
        swimmerIds.forEach(id => adjustXP(id, 10));

        try {
            await Promise.all(newRecords.map(r => api.attendance.create(r)));
        } catch (e) {
            console.error("Batch mark failed", e);
        }
    };

    const batchUnmarkAttendance = async (swimmerIds: string[], date: string) => {
        const idsSet = new Set(swimmerIds);
        const recordsToRemove = attendance.filter(a => idsSet.has(a.swimmerId) && a.date === date);
        
        setAttendance(prev => prev.filter(a => !(idsSet.has(a.swimmerId) && a.date === date)));
        recordMutation();
        try {
            await Promise.all(recordsToRemove.map(r => api.attendance.delete(r.id)));
        } catch (e) {
            console.error("Batch unmark failed", e);
            setAttendance(prev => [...prev, ...recordsToRemove]);
        }
    };

    // Level Calculation: 10 * (2^(L-1) - 1)
    // Inverse: L = log2(XP/10 + 1) + 1
    const calculateLevel = (xp: number) => {
        if (xp < 10) return 1;
        return Math.floor(Math.log2(xp / 10 + 1)) + 1;
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
            try {
                await api.plans.update(id, updatedPlan);
            } catch (e) { console.error("Sync error", e); }
        }
    };

    const getVisiblePlans = () => {
        // Return ALL plans, never archive
        // Sort: Starred plans first, then by date (newest first)
        return [...plans].sort((a, b) => {
            // Starred plans always come first
            if (a.isStarred && !b.isStarred) return -1;
            if (!a.isStarred && b.isStarred) return 1;

            // Within same starred status, sort by date (newest first)
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    };

    const adjustXP = async (swimmerId: string, amount: number) => {
        recordMutation();
        let updatedSwimmer: Swimmer | undefined;
        setSwimmers(prev => prev.map(s => {
            if (s.id !== swimmerId) return s;
            const newXP = Math.max(0, (s.xp || 0) + amount); // Prevent negative XP
            const newLevel = calculateLevel(newXP);
            updatedSwimmer = { ...s, xp: newXP, level: newLevel };
            return updatedSwimmer;
        }));
        if (updatedSwimmer) {
            try { await api.swimmers.update(swimmerId, updatedSwimmer); } catch (e) { }
        }
    };

    const addSwimmer = async (swimmer: Swimmer) => {
        // 1. Optimistic Add
        recordMutation();
        setSwimmers((prev) => [...prev, swimmer]);
        try {
            // 2. Server Call
            const savedSwimmer = await api.swimmers.create(swimmer);

            // 3. Update with real server data (in case ID or other fields changed/normalized)
            if (savedSwimmer && savedSwimmer.id) {
                setSwimmers((prev) => prev.map(s => s.id === swimmer.id ? savedSwimmer : s));
            }
        } catch (e) {
            console.error("Failed to add swimmer:", e);
            // Revert on failure
            setSwimmers((prev) => prev.filter((s) => s.id !== swimmer.id));
            throw e;
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
            console.error("Failed to update swimmer:", e);
            if (oldSwimmer) {
                setSwimmers((prev) => prev.map((s) => (s.id === id ? oldSwimmer : s)));
            }
            throw e;
        }
    };

    const deleteSwimmer = async (id: string) => {
        recordMutation();
        const oldSwimmer = swimmers.find(s => s.id === id);
        setSwimmers((prev) => prev.filter((s) => s.id !== id));
        try {
            await api.swimmers.delete(id);
        } catch (e) {
            console.error("Failed to delete swimmer:", e);
            if (oldSwimmer) {
                setSwimmers((prev) => [...prev, oldSwimmer]);
            }
            throw e;
        }
    };

    const getSwimmerArgs = (id: string) => {
        const s = swimmers.find(s => s.id === id);
        return s ? { name: s.name, group: s.group } : { name: "Unknown", group: "Unknown" };
    };

    const hydrateMockData = () => {
        setPlans(MOCK_PLANS);
        setSwimmers(MOCK_SWIMMERS);
    };

    // Performance Record Functions
    const addPerformance = async (performance: PerformanceRecord) => {
        // ... (keep PB logic)
        const swimmerPerfs = performances.filter(
            p => p.swimmerId === performance.swimmerId && p.event === performance.event
        );

        const timeInSeconds = parseFloat(performance.time);
        const bestTime = swimmerPerfs.length > 0
            ? Math.min(...swimmerPerfs.map(p => parseFloat(p.time)))
            : Infinity;

        const isPB = timeInSeconds < bestTime;

        // Calculate improvement
        let improvement: number | undefined;
        if (swimmerPerfs.length > 0) {
            improvement = timeInSeconds - bestTime;
        }

        const newPerformance: PerformanceRecord = {
            ...performance,
            isPB,
            improvement
        };

        setPerformances(prev => [...prev, newPerformance]);
        try { await api.performances.create(newPerformance); } catch (e) { }
    };

    const updatePerformance = async (id: string, updates: Partial<PerformanceRecord>) => {
        setPerformances(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        try { await api.performances.update(id, updates); } catch (e) { console.error("Failed to update performance", e); }
    };

    const deletePerformance = async (id: string) => {
        setPerformances(prev => prev.filter(p => p.id !== id));
        try { await api.performances.delete(id); } catch (e) { console.error("Failed to delete performance", e); }
    };

    const getSwimmerPerformances = (swimmerId: string): PerformanceRecord[] => {
        return performances
            .filter(p => p.swimmerId === swimmerId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const getSwimmerPBs = (swimmerId: string): Record<string, PerformanceRecord> => {
        const swimmerPerfs = performances.filter(p => p.swimmerId === swimmerId);
        const pbs: Record<string, PerformanceRecord> = {};

        swimmerPerfs.forEach(perf => {
            const existing = pbs[perf.event];
            if (!existing || parseFloat(perf.time) < parseFloat(existing.time)) {
                pbs[perf.event] = perf;
            }
        });

        return pbs;
    };

    // Template Functions
    const addTemplate = (block: TrainingBlock, name: string, category: BlockTemplate['category']) => {
        const newTemplate: BlockTemplate = {
            ...block,
            templateId: uid(),
            name,
            category
        };
        setTemplates(prev => [...prev, newTemplate]);
    };

    const deleteTemplate = (templateId: string) => {
        setTemplates(prev => prev.filter(t => t.templateId !== templateId));
    };

    const clearData = () => {
        // Clear LocalStorage
        localStorage.removeItem("aquaflow_plans");
        localStorage.removeItem("aquaflow_swimmers");
        localStorage.removeItem("aquaflow_feedbacks");
        localStorage.removeItem("aquaflow_attendance");
        localStorage.removeItem("aquaflow_performances");
        localStorage.removeItem("aquaflow_templates");

        // Reset State
        setPlans([]);
        setSwimmers([]);
        setFeedbacks([]);
        setAttendance([]);
        setPerformances([]);
        setTemplates(DEFAULT_TEMPLATES);

        // Force reload to ensure clean state
        window.location.reload();
    };

    return (
        <StoreContext.Provider value={{
            isLoaded,
            plans, swimmers, feedbacks, attendance, performances,
            addPlan, updatePlan, deletePlan, starPlan, getVisiblePlans,
            addSwimmer, updateSwimmer, deleteSwimmer,
            submitFeedback, markAttendance, unmarkAttendance, batchMarkAttendance, batchUnmarkAttendance, adjustXP, getSwimmerArgs,
            hydrateMockData,
            addPerformance, updatePerformance, deletePerformance, getSwimmerPerformances, getSwimmerPBs,
            templates, addTemplate, deleteTemplate,
            clearData
        }}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error("useStore must be used within a StoreProvider");
    }
    return context;
}
