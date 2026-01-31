"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TrainingPlan, Swimmer, Feedback, AttendanceRecord, PerformanceRecord, BlockTemplate, TrainingBlock } from "@/types";
import { MOCK_PLANS, MOCK_SWIMMERS, DEFAULT_TEMPLATES } from "./data";
import { getLocalDateISOString } from "@/lib/date-utils";
import { api } from "./api-client";

const uid = () => Math.random().toString(36).substr(2, 9);

interface StoreContextType {
    plans: TrainingPlan[];
    swimmers: Swimmer[];
    feedbacks: Feedback[];
    attendance: AttendanceRecord[];
    performances: PerformanceRecord[];
    addPlan: (plan: TrainingPlan) => void;
    updatePlan: (id: string, updates: Partial<TrainingPlan>) => void;
    deletePlan: (id: string) => void;
    submitFeedback: (feedback: Feedback) => void;
    markAttendance: (swimmerId: string) => void;
    adjustXP: (swimmerId: string, amount: number) => void;
    addSwimmer: (swimmer: Swimmer) => void;
    updateSwimmer: (id: string, updates: Partial<Swimmer>) => void;
    deleteSwimmer: (id: string) => void;
    getSwimmerArgs: (swimmerId: string) => { name: string; group: string };
    hydrateMockData: () => void;
    starPlan: (id: string) => void;
    getVisiblePlans: () => TrainingPlan[];
    addPerformance: (performance: PerformanceRecord) => void;
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

    // Load from LocalStorage on mount
    // Load from API on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load plans
                const plans = await api.plans.getAll();
                setPlans(plans);

                // Load swimmers
                const swimmers = await api.swimmers.getAll();
                if (swimmers.length === 0) {
                    // Seed initial swimmers
                    for (const s of MOCK_SWIMMERS) {
                        try { await api.swimmers.create(s); } catch (e) { }
                    }
                    setSwimmers(MOCK_SWIMMERS);
                } else {
                    setSwimmers(swimmers);
                }

                // Load templates
                setTemplates(DEFAULT_TEMPLATES);

                // Load feedbacks
                const feedbacks = await api.feedbacks.getAll();
                setFeedbacks(feedbacks);

                // Load attendance
                const attendance = await api.attendance.getAll();
                setAttendance(attendance);

                // Load performances
                const performances = await api.performances.getAll();
                setPerformances(performances);

            } catch (error) {
                console.error("Failed to load data from API:", error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadData();
    }, []);

    // Persist to LocalStorage whenever state changes
    // No-op for persistence effects as we use API directly
    useEffect(() => {
        // Placeholder to keep hook order if needed, or simply nothing
    }, []);

    // Listen for localStorage changes from other tabs/windows


    const addPlan = async (plan: TrainingPlan) => {
        // Optimistic update
        setPlans((prev) => [plan, ...prev]);
        try {
            await api.plans.create(plan);
        } catch (e) {
            console.error("Failed to sync plan", e);
        }
    };

    const updatePlan = async (id: string, updates: Partial<TrainingPlan>) => {
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
        setPlans((prev) => prev.filter((p) => p.id !== id));
        try {
            await api.plans.delete(id);
        } catch (e) {
            console.error("Failed to sync plan delete", e);
        }
    };

    const submitFeedback = async (fb: Feedback) => {
        setFeedbacks((prev) => [...prev, fb]);
        try {
            await api.feedbacks.create(fb);
        } catch (e) {
            console.error("Failed to sync feedback", e);
        }
    };

    // Helper to find the PREVIOUS plan date before today
    const getPreviousPlanDate = (group: string, beforeDate: string): string | null => {
        // Find all plans for this group, sort desc
        const groupPlans = plans
            .filter(p => p.group === group && p.date < beforeDate)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return groupPlans.length > 0 ? groupPlans[0].date : null;
    };

    const markAttendance = async (swimmerId: string) => {
        const today = new Date();
        const todayStr = getLocalDateISOString(today);

        if (attendance.some(a => a.swimmerId === swimmerId && a.date === todayStr)) return;

        const newRecord: AttendanceRecord = {
            id: uid(),
            date: todayStr,
            swimmerId,
            status: "Present",
            timestamp: today.toISOString()
        };

        setAttendance((prev) => [...prev, newRecord]);
        try {
            await api.attendance.create(newRecord);
        } catch (e) { console.error("Sync error", e); }

        // Update Swimmer Stats logic (XP, Streak) remains local for UI speed, 
        // but we should ideally update swimmer object in DB too.
        // For now, let's keep complex XP logic locally calculated 
        // and just sync the swimmer object update.

        let updatedSwimmer: Swimmer | undefined;

        setSwimmers(prevSwimmers => prevSwimmers.map(s => {
            if (s.id !== swimmerId) return s;

            // ... (keep existing streak logic)
            // STREAK LOGIC v2: Based on PLANS
            let newStreak = s.currentStreak || 0;
            const lastCheckIn = s.lastCheckIn;

            if (lastCheckIn) {
                const prevPlanDate = getPreviousPlanDate(s.group, todayStr);
                if (prevPlanDate) {
                    const isConsecutivePlan = lastCheckIn === prevPlanDate;
                    if (isConsecutivePlan) {
                        newStreak += 1;
                    } else {
                        const d1 = new Date(todayStr);
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
                lastCheckIn: todayStr,
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
        setSwimmers((prev) => [...prev, swimmer]);
        try { await api.swimmers.create(swimmer); } catch (e) { }
    };

    const updateSwimmer = async (id: string, updates: Partial<Swimmer>) => {
        setSwimmers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
        try {
            const s = swimmers.find(sw => sw.id === id);
            if (s) await api.swimmers.update(id, { ...s, ...updates });
        } catch (e) { }
    };

    const deleteSwimmer = async (id: string) => {
        setSwimmers((prev) => prev.filter((s) => s.id !== id));
        try { await api.swimmers.delete(id); } catch (e) { }
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
            plans, swimmers, feedbacks, attendance, performances,
            addPlan, updatePlan, deletePlan, starPlan, getVisiblePlans,
            addSwimmer, updateSwimmer, deleteSwimmer,
            submitFeedback, markAttendance, adjustXP, getSwimmerArgs,
            hydrateMockData,
            addPerformance, getSwimmerPerformances, getSwimmerPBs,
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
