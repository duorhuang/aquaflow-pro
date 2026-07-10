"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { TrainingPlan, Swimmer, Feedback, AttendanceRecord, PerformanceRecord, BlockTemplate, WeeklyPlan, Announcement } from "@/types";
import { persist, loadFromStorage, type StorageKey } from "./store/persist-layer";
import { useSyncEngine, hasFreshStorage } from "./store/sync-engine";
import { useEntityCRUD } from "./store/entity-crud";
import { api, SyncResponse } from "./api-client";

interface StoreContextType {
    isLoaded: boolean;
    plans: TrainingPlan[];
    swimmers: Swimmer[];
    feedbacks: Feedback[];
    attendance: AttendanceRecord[];
    performances: PerformanceRecord[];
    weeklyPlans: WeeklyPlan[];
    announcements: Announcement[];
    archivedAnnouncements: Announcement[];
    addPlan: (plan: TrainingPlan) => void;
    updatePlan: (id: string, updates: Partial<TrainingPlan>) => void;
    deletePlan: (id: string) => void;
    submitFeedback: (feedback: Feedback) => void;
    markAttendance: (swimmerId: string, date?: string, status?: "Present" | "AthletePresent") => void;
    unmarkAttendance: (swimmerId: string, date: string) => void;
    batchMarkAttendance: (swimmerIds: string[], date: string) => Promise<void>;
    batchUnmarkAttendance: (swimmerIds: string[], date: string) => Promise<void>;
    adjustXP: (swimmerId: string, amount: number, persistToServer?: boolean) => void;
    addSwimmer: (swimmer: Swimmer) => void;
    updateSwimmer: (id: string, updates: Partial<Swimmer>) => void;
    deleteSwimmer: (id: string) => void;
    dbWaking: boolean;
    dbOffline: boolean;
    unauthenticated: boolean;
    getSwimmerArgs: (swimmerId: string) => { name: string; group: string };
    hydrateMockData: () => void;
    starPlan: (id: string) => void;
    getVisiblePlans: () => TrainingPlan[];
    addPerformance: (performance: PerformanceRecord) => void;
    updatePerformance: (id: string, updates: Partial<PerformanceRecord>) => void;
    deletePerformance: (id: string) => void;
    getSwimmerPerformances: (swimmerId: string) => PerformanceRecord[];
    getSwimmerPBs: (swimmerId: string) => Record<string, PerformanceRecord>;
    templates: BlockTemplate[];
    addTemplate: (block: any, name: string, category: BlockTemplate['category']) => void;
    deleteTemplate: (templateId: string) => void;
    recordMutation: () => void;
    addAnnouncement: (data: any) => void;
    deleteAnnouncement: (id: string) => void;
    starAnnouncement: (id: string) => void;
    getVisibleAnnouncements: () => Announcement[];
    totalXP: number;
    clearData: () => void;
    syncStatus: 'idle' | 'syncing' | 'error';
    resetAuth: () => void;
    currentUserInfo: any | null;
    isAuthLoading: boolean;
    setCurrentUserInfo: (user: any | null) => void;
    triggerSync: (force?: boolean) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [plans, setPlans] = useState<TrainingPlan[]>([]);
    const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [performances, setPerformances] = useState<PerformanceRecord[]>([]);
    const [templates, setTemplates] = useState<BlockTemplate[]>([]);
    const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [archivedAnnouncements, setArchivedAnnouncements] = useState<Announcement[]>([]);

    const [currentUserInfo, setCurrentUserInfo] = useState<any | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        
        const checkAuth = async () => {
            const hasSession = typeof document !== 'undefined' && document.cookie.split(';').some(c => c.trim().startsWith('aquaflow_session='));
            if (!hasSession) {
                if (isMounted) {
                    setIsAuthLoading(false);
                    setCurrentUserInfo(null);
                }
                return;
            }

            try {
                const user = await api.auth.me();
                if (isMounted) {
                    setCurrentUserInfo(user);
                    setIsAuthLoading(false);
                }
            } catch (err) {
                console.error("Auth check failed in StoreProvider:", err);
                if (isMounted) {
                    setCurrentUserInfo(null);
                    setIsAuthLoading(false);
                }
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    const persistToStorage = useCallback((key: string, data: any[]) => {
        persist(key as StorageKey, data);
    }, []);

    // Sync engine handles the data load/sync callbacks
    const handleLoad = useCallback(async (syncData: SyncResponse | null) => {
        const {
            plans: initialPlans, swimmers: initialSwimmers, feedbacks: fetchedFeedbacks,
            attendance: fetchedAttendance, performances: fetchedPerformances,
            weeklyPlans: fetchedWeeklyPlans, announcements: fetchedAnnouncements,
            weeklyFeedbacks: fetchedWeeklyFeedbacks, archivedAnnouncements: fetchedArchivedAnnouncements,
            templates: fetchedTemplates,
        } = syncData || {};

        let fetchedPlans = initialPlans;
        let fetchedSwimmers = initialSwimmers;

        const allFailed = !syncData || (!fetchedPlans && !fetchedSwimmers);
        const hasLocal = hasFreshStorage();

        if (allFailed) {
            if (!hasLocal) return;
            const { collections } = loadFromStorage();
            if (collections.plans) setPlans(collections.plans as any);
            if (collections.swimmers) setSwimmers(collections.swimmers as any);
            if (collections.feedbacks) setFeedbacks(collections.feedbacks as any);
            if (collections.attendance) setAttendance(collections.attendance as any);
            if (collections.performances) setPerformances(collections.performances as any);
            if (collections.weeklyPlans) setWeeklyPlans(collections.weeklyPlans as any);
            if (collections.announcements) setAnnouncements(collections.announcements as any);
            if (collections.archivedAnnouncements) setArchivedAnnouncements(collections.archivedAnnouncements as any);
            if (collections.templates) setTemplates(collections.templates as any);
            return;
        }

        if (hasLocal) {
            const { collections } = loadFromStorage();
            if (fetchedPlans && collections.plans) {
                const dbIds = new Set(fetchedPlans.map((p: any) => p.id));
                fetchedPlans = [...fetchedPlans, ...(collections.plans.filter((lp: any) => !dbIds.has(lp.id)) as any)];
            }
            if (fetchedSwimmers && collections.swimmers) {
                const dbIds = new Set(fetchedSwimmers.map((s: any) => s.id));
                fetchedSwimmers = [...fetchedSwimmers, ...(collections.swimmers.filter((ls: any) => !dbIds.has(ls.id)) as any)];
            }
        }

        const transformedDaily: Feedback[] = (fetchedWeeklyFeedbacks || []).flatMap((wf: any) =>
            (wf.dailyFeedbacks || []).filter((df: any) => df.rpe || df.soreness || df.reflection).map((df: any) => ({
                id: df.id, swimmerId: wf.swimmerId, planId: wf.weeklyPlanId || "weekly",
                date: df.date, rpe: df.rpe || 5, soreness: df.soreness || 3,
                comments: df.reflection || "", timestamp: new Date().toISOString()
            }))
        );

        if (fetchedPlans) setPlans(fetchedPlans);
        if (fetchedSwimmers) setSwimmers(fetchedSwimmers);
        if (fetchedFeedbacks) setFeedbacks([...fetchedFeedbacks, ...transformedDaily].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        if (fetchedAttendance) setAttendance(fetchedAttendance);
        if (fetchedPerformances) setPerformances(fetchedPerformances);
        if (fetchedWeeklyPlans) setWeeklyPlans(fetchedWeeklyPlans.filter((p: any) => p.isPublished));
        if (fetchedAnnouncements) setAnnouncements(fetchedAnnouncements);
        if (fetchedArchivedAnnouncements) setArchivedAnnouncements(fetchedArchivedAnnouncements);
        if (fetchedTemplates) setTemplates(fetchedTemplates);
    }, []);

    const handleSync = useCallback((syncData: SyncResponse | null) => {
        const {
            plans: syncPlans, swimmers: syncSwimmers, feedbacks: syncFeedbacks,
            attendance: syncAttendance, performances: syncPerformances,
            weeklyPlans: syncWeeklyPlans, announcements: syncAnnouncements,
            weeklyFeedbacks: fetchedWeeklyFeedbacks, archivedAnnouncements: syncArchivedAnnouncements,
            templates: syncTemplates,
        } = syncData || {};

        const transformedDaily: Feedback[] = (fetchedWeeklyFeedbacks || []).flatMap((wf: any) =>
            (wf.dailyFeedbacks || []).filter((df: any) => df.rpe || df.soreness || df.reflection).map((df: any) => ({
                id: df.id, swimmerId: wf.swimmerId, planId: wf.weeklyPlanId || "weekly",
                date: df.date, rpe: df.rpe || 5, soreness: df.soreness || 3,
                comments: df.reflection || "", timestamp: new Date().toISOString()
            }))
        );

        if (syncPlans) setPlans(syncPlans);
        if (syncSwimmers) setSwimmers(syncSwimmers);
        if (syncFeedbacks) setFeedbacks([...syncFeedbacks, ...transformedDaily].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        if (syncAttendance) setAttendance(syncAttendance);
        if (syncPerformances) setPerformances(syncPerformances);
        if (syncWeeklyPlans) setWeeklyPlans(syncWeeklyPlans.filter((p: any) => p.isPublished));
        if (syncAnnouncements) setAnnouncements(syncAnnouncements);
        if (syncArchivedAnnouncements) setArchivedAnnouncements(syncArchivedAnnouncements);
        if (syncTemplates) setTemplates(syncTemplates);
    }, []);

    // Sync engine provides recordMutation + lifecycle flags
    const sync = useSyncEngine({ onLoad: handleLoad, onSync: handleSync });

    // Entity CRUD operations (wired to sync engine's recordMutation)
    const crud = useEntityCRUD({
        plans, setPlans, swimmers, setSwimmers, feedbacks, setFeedbacks,
        attendance, setAttendance, performances, setPerformances, templates, setTemplates,
        announcements, setAnnouncements, archivedAnnouncements, setArchivedAnnouncements,
        recordMutation: sync.recordMutation,
        persist: persistToStorage,
    });

    // --- Derived values ---
    const totalXP = useMemo(() => swimmers.reduce((acc, s) => acc + (s.totalXp || s.xp || 0), 0), [swimmers]);

    const visiblePlans = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 14);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        return plans
            .filter(p => p.isStarred || p.date >= cutoffStr)
            .sort((a, b) => (a.isStarred === b.isStarred ? 0 : a.isStarred ? -1 : 1));
    }, [plans]);

    const visibleAnnouncements = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        return announcements
            .filter(a => new Date(a.createdAt) >= cutoff || a.isStarred)
            .sort((a, b) => (a.isStarred === b.isStarred ? 0 : a.isStarred ? -1 : 1));
    }, [announcements]);

    const resetAuth = useCallback(() => {
        sync.resetAuth();
        setCurrentUserInfo(null);
        setIsAuthLoading(false);
    }, [sync]);

    return (
        <StoreContext.Provider value={{
            isLoaded: sync.isLoaded,
            plans, swimmers, feedbacks, attendance, performances, weeklyPlans, announcements,
            archivedAnnouncements,
            addPlan: crud.addPlan, updatePlan: crud.updatePlan, deletePlan: crud.deletePlan,
            submitFeedback: crud.submitFeedback,
            markAttendance: crud.markAttendance, unmarkAttendance: crud.unmarkAttendance,
            batchMarkAttendance: crud.batchMarkAttendance, batchUnmarkAttendance: crud.batchUnmarkAttendance,
            adjustXP: crud.adjustXP,
            addSwimmer: crud.addSwimmer, updateSwimmer: crud.updateSwimmer, deleteSwimmer: crud.deleteSwimmer,
            dbWaking: sync.dbWaking, dbOffline: sync.dbOffline,
            unauthenticated: sync.unauthenticated,
            recordMutation: sync.recordMutation,
            getSwimmerArgs: crud.getSwimmerArgs,
            hydrateMockData: crud.hydrateMockData,
            starPlan: crud.starPlan, getVisiblePlans: () => visiblePlans,
            addPerformance: crud.addPerformance, updatePerformance: crud.updatePerformance,
            deletePerformance: crud.deletePerformance,
            getSwimmerPerformances: crud.getSwimmerPerformances,
            getSwimmerPBs: crud.getSwimmerPBs,
            templates, addTemplate: crud.addTemplate, deleteTemplate: crud.deleteTemplate,
            addAnnouncement: crud.addAnnouncement, deleteAnnouncement: crud.deleteAnnouncement,
            starAnnouncement: crud.starAnnouncement,
            getVisibleAnnouncements: () => visibleAnnouncements,
            totalXP, clearData: crud.clearData,
            syncStatus: sync.syncStatus,
            resetAuth,
            currentUserInfo,
            isAuthLoading,
            setCurrentUserInfo,
            triggerSync: sync.triggerSync,
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

/**
 * Selector hook — only re-renders when the selected value changes.
 * Use this in components that only need specific fields from the store
 * to avoid re-rendering when unrelated state changes (e.g., a component
 * that only needs `swimmers` won't re-render when `plans` updates).
 *
 * Example:
 *   const swimmers = useStoreSelector(s => s.swimmers);
 *   const { isLoaded, dbOffline } = useStoreSelector(s => ({ isLoaded: s.isLoaded, dbOffline: s.dbOffline }));
 */
export function useStoreSelector<T>(selector: (state: StoreContextType) => T): T {
    const context = useContext(StoreContext);
    if (!context) throw new Error("useStoreSelector must be used within StoreProvider");
    const selected = selector(context);
    const prevRef = React.useRef<T>(selected);
    // Only update the ref when the value actually changes (shallow comparison for objects)
    const isEqual = (a: T, b: T): boolean => {
        if (a === b) return true;
        if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        return keysA.every(k => (a as any)[k] === (b as any)[k]);
    };
    // eslint-disable-next-line react-hooks/refs
    if (!isEqual(prevRef.current, selected)) {
        // eslint-disable-next-line react-hooks/refs
        prevRef.current = selected;
    }
    // eslint-disable-next-line react-hooks/refs
    return prevRef.current;
}
