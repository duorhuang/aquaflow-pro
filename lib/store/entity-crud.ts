/**
 * EntityCRUD — entity-level mutation functions for the store.
 * Each function handles optimistic update, localStorage persistence, API sync, and rollback.
 * Extracted from the monolithic store.tsx.
 */

import { useCallback } from 'react';
import { api } from '../api-client';
import { getLocalDateISOString, calculateLevel } from '../date-utils';
import { MOCK_PLANS, MOCK_SWIMMERS, DEFAULT_TEMPLATES } from '../data';
import type {
  TrainingPlan, Swimmer, Feedback, AttendanceRecord,
  PerformanceRecord, BlockTemplate, TrainingBlock,
} from '@/types';

const uid = () => Math.random().toString(36).substr(2, 9);

/**
 * Factory that returns all entity CRUD functions.
 * Called inside StoreProvider with state setters, persist helper, and recordMutation.
 */
export function useEntityCRUD({
  plans, setPlans, swimmers, setSwimmers, feedbacks, setFeedbacks,
  attendance, setAttendance, performances, setPerformances, templates, setTemplates,
  announcements, setAnnouncements, archivedAnnouncements, setArchivedAnnouncements,
  recordMutation,
  persist,
}: {
  plans: TrainingPlan[]; setPlans: React.Dispatch<React.SetStateAction<TrainingPlan[]>>;
  swimmers: Swimmer[]; setSwimmers: React.Dispatch<React.SetStateAction<Swimmer[]>>;
  feedbacks: Feedback[]; setFeedbacks: React.Dispatch<React.SetStateAction<Feedback[]>>;
  attendance: AttendanceRecord[]; setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  performances: PerformanceRecord[]; setPerformances: React.Dispatch<React.SetStateAction<PerformanceRecord[]>>;
  templates: BlockTemplate[]; setTemplates: React.Dispatch<React.SetStateAction<BlockTemplate[]>>;
  announcements: any[]; setAnnouncements: React.Dispatch<React.SetStateAction<any[]>>;
  archivedAnnouncements: any[]; setArchivedAnnouncements: React.Dispatch<React.SetStateAction<any[]>>;
  recordMutation: () => void;
  persist: <T>(key: string, data: T[]) => void;
}) {
  // --- XP adjustment (best-effort sync) ---
  const adjustXP = useCallback(async (swimmerId: string, amount: number) => {
    recordMutation();
    let updatedSwimmer: Swimmer | undefined;
    setSwimmers(prev => {
      const next = prev.map(s => {
        if (s.id !== swimmerId) return s;
        const newXP = Math.max(0, (s.xp || 0) + amount);
        updatedSwimmer = { ...s, xp: newXP, level: calculateLevel(newXP) };
        return updatedSwimmer!;
      });
      if (updatedSwimmer) persist('swimmers', next);
      return next;
    });
    if (updatedSwimmer) {
      try { await api.swimmers.update(swimmerId, updatedSwimmer); } catch { /* best-effort */ }
    }
  }, [recordMutation]);

  // --- Attendance (defined before submitFeedback since feedback calls it) ---
  const markAttendance = useCallback(async (swimmerId: string, date?: string, status: "Present" | "AthletePresent" = "Present") => {
    const targetDate = date || getLocalDateISOString(new Date());
    const existingRecord = attendance.find(a => a.swimmerId === swimmerId && a.date === targetDate);
    if (existingRecord) {
      if (existingRecord.status === 'Present') return;
      if (existingRecord.status === 'AthletePresent' && status === 'AthletePresent') return;
    }

    const newRecord: AttendanceRecord = {
      id: existingRecord ? existingRecord.id : uid(),
      date: targetDate, swimmerId, status,
      timestamp: new Date().toISOString()
    };

    if (existingRecord) {
      setAttendance(prev => { const next = prev.map(a => a.id === existingRecord.id ? newRecord : a); persist('attendance', next); return next; });
    } else {
      setAttendance(prev => { const next = [...prev, newRecord]; persist('attendance', next); return next; });
    }

    recordMutation();
    adjustXP(swimmerId, 10);

    try {
      const dbRecord = await api.attendance.create(newRecord);
      if (dbRecord?.id) {
        setAttendance(prev => { const next = prev.map(a => a.id === newRecord.id ? { ...a, id: dbRecord.id } : a); persist('attendance', next); return next; });
      }
    } catch {
      setAttendance(prev => { const next = prev.filter(a => a.id !== newRecord.id); persist('attendance', next); return next; });
    }
  }, [attendance, recordMutation, adjustXP]);

  const unmarkAttendance = useCallback(async (swimmerId: string, date: string) => {
    const records = attendance.filter(a => a.swimmerId === swimmerId && a.date === date);
    if (records.length === 0) return;

    recordMutation();
    setAttendance(prev => { const next = prev.filter(a => !(a.swimmerId === swimmerId && a.date === date)); persist('attendance', next); return next; });
    try { await Promise.all(records.map(r => api.attendance.delete(r.id))); } catch {
      setAttendance(prev => { const next = [...prev, ...records]; persist('attendance', next); return next; });
    }
  }, [attendance, recordMutation]);

  const batchMarkAttendance = useCallback(async (swimmerIds: string[], date: string) => {
    const timestamp = new Date().toISOString();
    const newRecords = swimmerIds.map(id => ({
      id: uid(), date, swimmerId: id, status: "Present" as const, timestamp
    }));

    setAttendance(prev => { const next = [...prev, ...newRecords]; persist('attendance', next); return next; });
    recordMutation();
    swimmerIds.forEach(id => adjustXP(id, 10));

    try {
      const results = await Promise.allSettled(newRecords.map(r => api.attendance.create(r)));
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) console.error(`${failed.length} attendance records failed to sync`);
    } catch { /* best-effort */ }
  }, [recordMutation, adjustXP]);

  const batchUnmarkAttendance = useCallback(async (swimmerIds: string[], date: string) => {
    const idsSet = new Set(swimmerIds);
    const recordsToRemove = attendance.filter(a => idsSet.has(a.swimmerId) && a.date === date);

    setAttendance(prev => { const next = prev.filter(a => !(idsSet.has(a.swimmerId) && a.date === date)); persist('attendance', next); return next; });
    recordMutation();
    try { await Promise.all(recordsToRemove.map(r => api.attendance.delete(r.id))); } catch {
      setAttendance(prev => { const next = [...prev, ...recordsToRemove]; persist('attendance', next); return next; });
    }
  }, [attendance, recordMutation]);

  // --- Feedbacks ---
  const submitFeedback = useCallback(async (fb: Feedback) => {
    recordMutation();
    setFeedbacks((prev) => {
      const idx = prev.findIndex(f => f.swimmerId === fb.swimmerId && f.date === fb.date);
      if (idx >= 0) { const updated = [...prev]; updated[idx] = fb; return updated; }
      return [...prev, fb];
    });
    adjustXP(fb.swimmerId, 20);
    try { await api.feedbacks.create(fb); } catch { throw new Error('Failed to submit feedback'); }
    markAttendance(fb.swimmerId);
  }, [recordMutation, adjustXP, markAttendance]);

  // --- Plans ---
  const addPlan = useCallback(async (plan: TrainingPlan) => {
    recordMutation();
    setPlans(prev => { const next = [plan, ...prev]; persist('plans', next); return next; });
    try { await api.plans.create(plan); } catch {
      setPlans(prev => { const next = prev.filter(p => p.id !== plan.id); persist('plans', next); return next; });
      throw new Error(`Failed to create plan`);
    }
  }, [recordMutation]);

  const updatePlan = useCallback(async (id: string, updates: Partial<TrainingPlan>) => {
    recordMutation();
    setPlans(prev => { const next = prev.map(p => p.id === id ? { ...p, ...updates } : p); persist('plans', next); return next; });
    try { await api.plans.update(id, updates); } catch { /* rollback on next poll */ }
  }, [recordMutation]);

  const deletePlan = useCallback(async (id: string) => {
    recordMutation();
    setPlans(prev => { const next = prev.filter(p => p.id !== id); persist('plans', next); return next; });
    try { await api.plans.delete(id); } catch { /* rollback on next poll */ }
  }, [recordMutation]);

  const starPlan = useCallback(async (id: string) => {
    setPlans(prev => {
      const plan = prev.find(p => p.id === id);
      if (plan) api.plans.update(id, { isStarred: !plan.isStarred }).catch(() => {});
      return prev.map(p => p.id === id ? { ...p, isStarred: !p.isStarred } : p);
    });
  }, []);

  // --- Swimmers ---
  const addSwimmer = useCallback(async (swimmer: Swimmer) => {
    recordMutation();
    setSwimmers(prev => { const next = [...prev, swimmer]; persist('swimmers', next); return next; });
    try {
      const saved = await api.swimmers.create(swimmer);
      if (saved?.id) setSwimmers(prev => { const next = prev.map(s => s.id === swimmer.id ? saved : s); persist('swimmers', next); return next; });
    } catch {
      setSwimmers(prev => { const next = prev.filter(s => s.id !== swimmer.id); persist('swimmers', next); return next; });
    }
  }, [recordMutation]);

  const updateSwimmer = useCallback(async (id: string, updates: Partial<Swimmer>) => {
    recordMutation();
    const oldSwimmer = swimmers.find(s => s.id === id);
    const merged = oldSwimmer ? { ...oldSwimmer, ...updates } : updates;
    setSwimmers(prev => { const next = prev.map(s => s.id === id ? { ...s, ...updates } : s); persist('swimmers', next); return next; });
    try {
      const result = await api.swimmers.update(id, merged);
      if (result?.id) setSwimmers(prev => { const next = prev.map(s => s.id === result.id ? { ...s, ...result } : s); persist('swimmers', next); return next; });
    } catch {
      if (oldSwimmer) setSwimmers(prev => { const next = prev.map(s => s.id === id ? oldSwimmer : s); persist('swimmers', next); return next; });
      throw new Error(`Failed to update swimmer`);
    }
  }, [swimmers, recordMutation]);

  const deleteSwimmer = useCallback(async (id: string) => {
    recordMutation();
    setSwimmers(prev => { const next = prev.filter(s => s.id !== id); persist('swimmers', next); return next; });
    try { await api.swimmers.delete(id); } catch { /* rollback on next poll */ }
  }, [recordMutation]);

  // --- Performances ---
  const addPerformance = useCallback(async (perf: PerformanceRecord) => {
    recordMutation();
    setPerformances(prev => { const next = [perf, ...prev]; persist('performances', next); return next; });
    try { await api.performances.create(perf); } catch {
      setPerformances(prev => { const next = prev.filter(p => p.id !== perf.id); persist('performances', next); return next; });
    }
  }, [recordMutation]);

  const updatePerformance = useCallback(async (id: string, updates: Partial<PerformanceRecord>) => {
    recordMutation();
    setPerformances(prev => { const next = prev.map(p => p.id === id ? { ...p, ...updates } : p); persist('performances', next); return next; });
    try { await api.performances.update(id, updates); } catch { /* best-effort */ }
  }, [recordMutation]);

  const deletePerformance = useCallback(async (id: string) => {
    const perf = performances.find(p => p.id === id);
    if (!perf) return;
    recordMutation();
    setPerformances(prev => { const next = prev.filter(p => p.id !== id); persist('performances', next); return next; });
    try { await api.performances.delete(id); } catch {
      setPerformances(prev => { const next = [perf, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); persist('performances', next); return next; });
    }
  }, [performances, recordMutation]);

  const getSwimmerPerformances = useCallback((swimmerId: string) =>
    performances.filter(p => p.swimmerId === swimmerId), [performances]);

  const getSwimmerPBs = useCallback((swimmerId: string) => {
    const parseTime = (time: string) => {
      const parts = time.split(':');
      return parts.length === 2 ? parseFloat(parts[0]) * 60 + parseFloat(parts[1]) : parseFloat(time) || Infinity;
    };
    const pbs: Record<string, PerformanceRecord> = {};
    performances.filter(p => p.swimmerId === swimmerId).forEach(p => {
      const t = parseTime(p.time);
      if (!pbs[p.event] || t < parseTime(pbs[p.event].time)) pbs[p.event] = p;
    });
    return pbs;
  }, [performances]);

  // --- Templates ---
  const addTemplate = useCallback(async (block: TrainingBlock, name: string, category: BlockTemplate['category']) => {
    const templateId = uid();
    const newTemplate: BlockTemplate = { ...block, id: `local_${templateId}`, templateId, name, category };
    setTemplates(prev => { const next = [newTemplate, ...prev]; persist('templates', next); return next; });
    try {
      const saved = await api.templates.create({ ...newTemplate });
      if (saved?.id) setTemplates(prev => { const next = prev.map(t => t.id === newTemplate.id ? { ...t, id: saved.id } : t); persist('templates', next); return next; });
    } catch {
      setTemplates(prev => { const next = prev.filter(t => t.id !== newTemplate.id); persist('templates', next); return next; });
    }
  }, [recordMutation]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    const tmpl = templates.find(t => t.templateId === templateId);
    setTemplates(prev => { const next = prev.filter(t => t.templateId !== templateId); persist('templates', next); return next; });
    try { if (tmpl && !tmpl.id?.startsWith('local_')) await api.templates.delete(tmpl.id); } catch {
      if (tmpl) setTemplates(prev => { const next = [...prev, tmpl]; persist('templates', next); return next; });
    }
  }, [templates, recordMutation]);

  // --- Announcements ---
  const addAnnouncement = useCallback(async (data: any) => {
    recordMutation();
    const tempId = `temp_${Date.now()}`;
    const temp = { ...data, id: tempId, createdAt: new Date().toISOString(), isStarred: false };
    setAnnouncements(prev => { const next = [temp, ...prev]; persist('announcements', next); return next; });
    try {
      const created = await api.announcements.create(data);
      setAnnouncements(prev => { const next = prev.map(a => a.id === tempId ? created : a); persist('announcements', next); return next; });
    } catch {
      setAnnouncements(prev => { const next = prev.filter(a => a.id !== tempId); persist('announcements', next); return next; });
      throw new Error('Failed to create announcement');
    }
  }, [recordMutation]);

  const deleteAnnouncement = useCallback(async (id: string) => {
    recordMutation();
    setAnnouncements(prev => { const next = prev.filter(a => a.id !== id); persist('announcements', next); return next; });
    try { await api.announcements.delete(id); } catch {
      setAnnouncements(prev => { const next = [...prev]; persist('announcements', next); return next; });
    }
  }, [recordMutation]);

  const starAnnouncement = useCallback(async (id: string) => {
    let targetState: boolean | undefined;
    setAnnouncements(prev => {
      const ann = prev.find(a => a.id === id);
      if (ann) {
        targetState = !ann.isStarred;
        api.announcements.toggleStar(id, targetState).catch(() => {});
      }
      return prev.map(a => a.id === id ? { ...a, isStarred: !a.isStarred } : a);
    });
    setArchivedAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isStarred: targetState } : a));
  }, []);

  // --- Utility ---
  const getSwimmerArgs = useCallback((swimmerId: string) => {
    const s = swimmers.find(sw => sw.id === swimmerId);
    return { name: s?.name || '未知', group: s?.group || '无' };
  }, [swimmers]);

  const hydrateMockData = useCallback(() => {
    setPlans(MOCK_PLANS);
    setSwimmers(MOCK_SWIMMERS);
    setTemplates(DEFAULT_TEMPLATES.map(t => ({ ...t, id: `local_${t.templateId}` })));
  }, []);

  const clearData = useCallback(async () => {
    if (confirm('确定要清空所有数据吗？此操作不可逆。')) {
      setPlans([]); setSwimmers([]); setFeedbacks([]); setAttendance([]); setPerformances([]);
    }
  }, []);

  return {
    addPlan, updatePlan, deletePlan, starPlan,
    addSwimmer, updateSwimmer, deleteSwimmer,
    submitFeedback, markAttendance, unmarkAttendance, batchMarkAttendance, batchUnmarkAttendance,
    adjustXP,
    addPerformance, updatePerformance, deletePerformance,
    getSwimmerPerformances, getSwimmerPBs,
    addTemplate, deleteTemplate,
    addAnnouncement, deleteAnnouncement, starAnnouncement,
    getSwimmerArgs, hydrateMockData, clearData,
  };
}
