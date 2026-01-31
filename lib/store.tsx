"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TrainingPlan, Swimmer, Feedback, AttendanceRecord } from "@/types";
import { MOCK_PLAN, MOCK_SWIMMERS } from "./data";

const uid = () => Math.random().toString(36).substr(2, 9);

interface StoreContextType {
    plans: TrainingPlan[];
    swimmers: Swimmer[];
    feedbacks: Feedback[];
    attendance: AttendanceRecord[];
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
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [plans, setPlans] = useState<TrainingPlan[]>([]);
    const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from LocalStorage on mount
    useEffect(() => {
        const loadedPlans = localStorage.getItem("aquaflow_plans");
        const loadedSwimmers = localStorage.getItem("aquaflow_swimmers");
        const loadedFeedbacks = localStorage.getItem("aquaflow_feedbacks");
        const loadedAttendance = localStorage.getItem("aquaflow_attendance");

        if (loadedPlans) {
            const parsedPlans = JSON.parse(loadedPlans);
            // Migration: If plan has 'items' but no 'blocks', convert.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const migratedPlans = parsedPlans.map((p: any) => {
                if (p.items && !p.blocks && Array.isArray(p.items)) {
                    // Convert old flat items to a single Main Set block
                    return {
                        ...p,
                        blocks: [{
                            id: "default-block",
                            type: "Main Set",
                            rounds: 1,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            items: p.items.map((it: any) => ({
                                ...it,
                                interval: "", // add missing
                                segments: [] // add missing
                            }))
                        }],
                        items: undefined // Remove old key
                    };
                }
                return p;
            });
            setPlans(migratedPlans);
        } else {
            // Initialize with Mock Data for first run
            setPlans([MOCK_PLAN]);
        }

        if (loadedSwimmers) {
            setSwimmers(JSON.parse(loadedSwimmers));
            // Force update if schema changed (missing username)
            const parsed = JSON.parse(loadedSwimmers);
            if (parsed.some((s: Swimmer) => !s.username)) {
                console.log("Migrating data: Adding credentials...");
                setSwimmers(MOCK_SWIMMERS);
            }
        } else {
            setSwimmers(MOCK_SWIMMERS);
        }

        if (loadedFeedbacks) setFeedbacks(JSON.parse(loadedFeedbacks));
        if (loadedAttendance) setAttendance(JSON.parse(loadedAttendance));

        setIsLoaded(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Persist to LocalStorage whenever state changes
    useEffect(() => {
        if (isLoaded) localStorage.setItem("aquaflow_plans", JSON.stringify(plans));
    }, [plans, isLoaded]);

    useEffect(() => {
        if (isLoaded) localStorage.setItem("aquaflow_swimmers", JSON.stringify(swimmers));
    }, [swimmers, isLoaded]);

    useEffect(() => {
        if (isLoaded) localStorage.setItem("aquaflow_feedbacks", JSON.stringify(feedbacks));
    }, [feedbacks, isLoaded]);

    useEffect(() => {
        if (isLoaded) localStorage.setItem("aquaflow_attendance", JSON.stringify(attendance));
    }, [attendance, isLoaded]);

    // Listen for localStorage changes from other tabs/windows
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (!e.key?.startsWith('aquaflow_')) return;

            // Reload data when another tab makes changes
            if (e.key === 'aquaflow_swimmers' && e.newValue) {
                setSwimmers(JSON.parse(e.newValue));
            }
            if (e.key === 'aquaflow_plans' && e.newValue) {
                setPlans(JSON.parse(e.newValue));
            }
            if (e.key === 'aquaflow_attendance' && e.newValue) {
                setAttendance(JSON.parse(e.newValue));
            }
            if (e.key === 'aquaflow_feedbacks' && e.newValue) {
                setFeedbacks(JSON.parse(e.newValue));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const addPlan = (plan: TrainingPlan) => {
        setPlans((prev) => [plan, ...prev]);
    };

    const updatePlan = (id: string, updates: Partial<TrainingPlan>) => {
        setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    };

    const deletePlan = (id: string) => {
        setPlans((prev) => prev.filter((p) => p.id !== id));
    };

    const submitFeedback = (fb: Feedback) => {
        setFeedbacks((prev) => [...prev, fb]);
    };

    // Helper to find the PREVIOUS plan date before today
    const getPreviousPlanDate = (group: string, beforeDate: string): string | null => {
        // Find all plans for this group, sort desc
        const groupPlans = plans
            .filter(p => p.group === group && p.date < beforeDate)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return groupPlans.length > 0 ? groupPlans[0].date : null;
    };

    const markAttendance = (swimmerId: string) => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // 1. Check if already checked in
        if (attendance.some(a => a.swimmerId === swimmerId && a.date === todayStr)) return;

        // 2. Add Attendance Record
        const newRecord: AttendanceRecord = {
            id: uid(),
            date: todayStr,
            swimmerId,
            status: "Present",
            timestamp: today.toISOString()
        };
        setAttendance((prev) => [...prev, newRecord]);

        // 3. Update Swimmer Stats
        setSwimmers(prevSwimmers => prevSwimmers.map(s => {
            if (s.id !== swimmerId) return s;

            // STREAK LOGIC v2: Based on PLANS, not calendar days
            // If they checked in last time there was a plan, streak continues.
            let newStreak = s.currentStreak || 0;
            const lastCheckIn = s.lastCheckIn;

            if (lastCheckIn) {
                // Find the plan date just before today for this user's group
                const prevPlanDate = getPreviousPlanDate(s.group, todayStr);

                if (prevPlanDate) {
                    // If their last check-in MATCHES the previous plan date, streak up!
                    // Or if they checked in YESTERDAY (standard daily), also streak up.
                    const isConsecutivePlan = lastCheckIn === prevPlanDate;

                    if (isConsecutivePlan) {
                        newStreak += 1;
                    } else {
                        // Check strict calendar day just in case (e.g. ad-hoc training)
                        const d1 = new Date(todayStr);
                        const d2 = new Date(lastCheckIn);
                        const diffTime = Math.abs(d1.getTime() - d2.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays <= 1) newStreak += 1;
                        else newStreak = 1; // BROKEN
                    }
                } else {
                    // No previous plans? First day.
                    newStreak = 1;
                }
            } else {
                newStreak = 1;
            }

            // Streak Bonus Cap: 3 days = +1, 6 days = +2, 15 days = +3
            let streakBonus = 0;
            if (newStreak >= 15) streakBonus = 3;
            else if (newStreak >= 6) streakBonus = 2;
            else if (newStreak >= 3) streakBonus = 1;

            // Base XP + Streak Bonus
            const xpGained = 20 + streakBonus;
            const newXP = (s.xp || 0) + xpGained;
            const newLevel = calculateLevel(newXP);

            return {
                ...s,
                lastCheckIn: todayStr,
                currentStreak: newStreak,
                xp: newXP,
                level: newLevel
            };
        }));
    };

    // Level Calculation: 10 * (2^(L-1) - 1)
    // Inverse: L = log2(XP/10 + 1) + 1
    const calculateLevel = (xp: number) => {
        if (xp < 10) return 1;
        return Math.floor(Math.log2(xp / 10 + 1)) + 1;
    };


    const starPlan = (id: string) => {
        setPlans(prev => prev.map(p => p.id === id ? { ...p, isStarred: !p.isStarred } : p));
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

    const adjustXP = (swimmerId: string, amount: number) => {
        setSwimmers(prev => prev.map(s => {
            if (s.id !== swimmerId) return s;
            const newXP = Math.max(0, (s.xp || 0) + amount); // Prevent negative XP
            const newLevel = calculateLevel(newXP);
            return { ...s, xp: newXP, level: newLevel };
        }));
    };

    const addSwimmer = (swimmer: Swimmer) => {
        setSwimmers((prev) => [...prev, swimmer]);
    };

    const updateSwimmer = (id: string, updates: Partial<Swimmer>) => {
        setSwimmers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    };

    const deleteSwimmer = (id: string) => {
        setSwimmers((prev) => prev.filter((s) => s.id !== id));
    };

    const getSwimmerArgs = (id: string) => {
        const s = swimmers.find(s => s.id === id);
        return s ? { name: s.name, group: s.group } : { name: "Unknown", group: "Unknown" };
    };

    const hydrateMockData = () => {
        setPlans([MOCK_PLAN]);
        setSwimmers(MOCK_SWIMMERS);
    };

    return (
        <StoreContext.Provider value={{
            plans, swimmers, feedbacks, attendance,
            addPlan, updatePlan, deletePlan, starPlan, getVisiblePlans,
            addSwimmer, updateSwimmer, deleteSwimmer,
            submitFeedback, markAttendance, adjustXP, getSwimmerArgs,
            hydrateMockData
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
