
import {
    Swimmer,
    Feedback,
    AttendanceRecord,
    PerformanceRecord,
    BlockTemplate,
    WeeklyPlan,
    Announcement,
    FeedbackReminder,
    ShopItem,
    WeeklyFeedbackType,
    Meet,
    TargetedFeedbackType,
    ActivityFeedItem,
    TrainingPlan,
    DailySession,
    MeetCountdownResponse,
} from "@/types";

export interface SyncResponse {
    plans: TrainingPlan[];
    swimmers: Swimmer[];
    feedbacks: Feedback[];
    attendance: AttendanceRecord[];
    performances: PerformanceRecord[];
    weeklyPlans: WeeklyPlan[];
    announcements: Announcement[];
    archivedAnnouncements: Announcement[];
    weeklyFeedbacks: WeeklyFeedbackType[];
    templates: BlockTemplate[];
}

// API Client wrapper for fetch operations

const API_BASE = '/api';
const MAX_RETRIES = 3;
const BASE_DELAY = 500; // ms — faster backoff
const REQUEST_TIMEOUT = 20000; // 20s — fail fast for interactive UX
const SYNC_TIMEOUT = 45000; // 45s — sync endpoint does DB warmup (Neon cold start can take 30s+)

export async function fetchAPI<T>(endpoint: string, options?: RequestInit, silent4xx: boolean = true, retries: number = MAX_RETRIES): Promise<T> {
    let lastError: Error | null = null;
    const isSyncCall = endpoint === '/sync';
    // Sync endpoint does its own DB warmup retries — use longer timeout, don't client-retry on 503
    const timeoutMs = isSyncCall ? SYNC_TIMEOUT : REQUEST_TIMEOUT;
    const effectiveRetries = isSyncCall ? 1 : retries; // Sync endpoint retries internally

    for (let attempt = 0; attempt < effectiveRetries; attempt++) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                credentials: 'include',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
            });
            clearTimeout(timeout);

            // Check content-type before parsing JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                if (response.status === 200 && endpoint === '/auth/login') {
                    // Login succeeds even without JSON (cookie was set)
                    return {} as T;
                }
                throw new Error(`Server returned non-JSON response (${response.status})`);
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                const is4xx = response.status >= 400 && response.status < 500;
                const errMsg = error.detail || error.error || error.message || `API Error: ${response.status} ${response.statusText}`;
                if (silent4xx && is4xx) {
                    return null as unknown as T;
                }
                throw new Error(errMsg);
            }

            return response.json();
        } catch (err: any) {
            const isAbortError = err.name === 'AbortError';
            const abortMsg = isAbortError ? `Request timed out for ${endpoint}` : err.message;
            lastError = isAbortError ? new Error(abortMsg) : err;
            const isLastAttempt = attempt === effectiveRetries - 1;
            const isNonRetryable = isAbortError ||
                err.message?.includes('API Error: 4') ||
                err.message?.includes('non-JSON response');

            if (isLastAttempt || isNonRetryable) break;

            // Exponential backoff: 800ms, 1600ms...
            await new Promise(r => setTimeout(r, BASE_DELAY * Math.pow(2, attempt)));
        }
    }

    throw lastError!;
}

export const api = {
    sync: {
        getAll: (since?: string) => fetchAPI<SyncResponse>(`/sync${since ? `?since=${since}` : ''}`),
    },
    swimmers: {
        getAll: () => fetchAPI<Swimmer[]>('/swimmers'),
        create: (data: Partial<Swimmer>) => fetchAPI<Swimmer>('/swimmers', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, data: Partial<Swimmer>) => fetchAPI<Swimmer>(`/swimmers?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id: string) => fetchAPI<void>(`/swimmers?id=${id}`, {
            method: 'DELETE',
        }),
    },
    plans: {
        getAll: () => fetchAPI<TrainingPlan[]>('/plans'),
        create: (data: Partial<TrainingPlan>) => fetchAPI<TrainingPlan>('/plans', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, data: Partial<TrainingPlan>) => fetchAPI<TrainingPlan>(`/plans?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id: string) => fetchAPI<void>(`/plans?id=${id}`, {
            method: 'DELETE',
        }),
    },
    feedbacks: {
        getAll: () => fetchAPI<Feedback[]>('/feedbacks'),
        create: (data: Partial<Feedback>) => fetchAPI<Feedback>('/feedbacks', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, data: Partial<Feedback>) => fetchAPI<Feedback>(`/feedbacks?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    },
    attendance: {
        getAll: () => fetchAPI<AttendanceRecord[]>('/attendance'),
        create: (data: Partial<AttendanceRecord>) => fetchAPI<AttendanceRecord>('/attendance', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        delete: (id: string) => fetchAPI<void>(`/attendance?id=${id}`, {
            method: 'DELETE',
        }),
    },
    performances: {
        getAll: () => fetchAPI<PerformanceRecord[]>('/performances'),
        create: (data: Partial<PerformanceRecord>) => fetchAPI<PerformanceRecord>('/performances', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, data: Partial<PerformanceRecord>) => fetchAPI<PerformanceRecord>(`/performances?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id: string) => fetchAPI<void>(`/performances?id=${id}`, {
            method: 'DELETE',
        }),
    },
    templates: {
        getAll: () => fetchAPI<BlockTemplate[]>('/templates'),
        create: (data: Partial<BlockTemplate>) => fetchAPI<BlockTemplate>('/templates', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: Partial<BlockTemplate>) => fetchAPI<BlockTemplate>(`/templates?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => fetchAPI<void>(`/templates?id=${id}`, { method: 'DELETE' }),
    },
    weeklyPlans: {
        getAll: (group?: string) => fetchAPI<WeeklyPlan[]>(`/weekly-plans${group ? `?group=${group}` : ''}`),
        getById: (id: string) => fetchAPI<WeeklyPlan>(`/weekly-plans?id=${id}`),
        create: (data: Partial<WeeklyPlan>) => fetchAPI<WeeklyPlan>('/weekly-plans', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: Partial<WeeklyPlan>) => fetchAPI<WeeklyPlan>(`/weekly-plans?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => fetchAPI<void>(`/weekly-plans?id=${id}`, { method: 'DELETE' }),
        addSession: (data: Partial<DailySession>) => fetchAPI<DailySession>('/weekly-plans/sessions', { method: 'POST', body: JSON.stringify(data) }),
        updateSession: (id: string, data: Partial<DailySession>) => fetchAPI<DailySession>(`/weekly-plans/sessions?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteSession: (id: string) => fetchAPI<void>(`/weekly-plans/sessions?id=${id}`, { method: 'DELETE' }),
    },
    weeklyFeedbacks: {
        getSubmitted: () => fetchAPI<WeeklyFeedbackType[]>('/weekly-feedbacks?submitted=true'),
        getAll: () => fetchAPI<WeeklyFeedbackType[]>('/weekly-feedbacks'),
        getBySwimmerAndWeek: (swimmerId: string, weekStart: string) =>
            fetchAPI<WeeklyFeedbackType>(`/weekly-feedbacks?swimmerId=${swimmerId}&weekStart=${weekStart}`),
        save: (data: Partial<WeeklyFeedbackType>) => fetchAPI<WeeklyFeedbackType>('/weekly-feedbacks', { method: 'POST', body: JSON.stringify(data) }),
        reply: (id: string, coachReply: string) => fetchAPI<WeeklyFeedbackType>('/weekly-feedbacks', { method: 'PATCH', body: JSON.stringify({ id, coachReply }) }),
    },
    feedbackReminders: {
        getAll: (withResponses?: boolean) =>
            fetchAPI<FeedbackReminder[]>(`/feedback-reminders${withResponses ? '?withResponses=true' : ''}`),
        getForSwimmer: (swimmerId: string) =>
            fetchAPI<FeedbackReminder[]>(`/feedback-reminders?swimmerId=${swimmerId}`),
        create: (data: Partial<FeedbackReminder>) => fetchAPI<FeedbackReminder>('/feedback-reminders', { method: 'POST', body: JSON.stringify(data) }),
        respond: (data: any) => fetchAPI<any>('/feedback-reminders', { method: 'POST', body: JSON.stringify({ ...data, _action: 'respond' }) }),
        replyToTargeted: (id: string, coachReply: string) => fetchAPI<any>('/feedback-reminders', { method: 'PATCH', body: JSON.stringify({ id, coachReply }) }),
    },
    announcements: {
        getAll: (group?: string) => fetchAPI<Announcement[]>(`/announcements${group ? `?group=${group}` : ''}`),
        getArchived: (group?: string) => fetchAPI<Announcement[]>(`/announcements?archived=true${group ? `&group=${group}` : ''}`),
        create: (data: Partial<Announcement>) => fetchAPI<Announcement>('/announcements', { method: 'POST', body: JSON.stringify(data) }),
        delete: (id: string) => fetchAPI<void>(`/announcements?id=${id}`, { method: 'DELETE' }),
        toggleStar: (id: string, isStarred: boolean) => fetchAPI<Announcement>('/announcements', { method: 'PUT', body: JSON.stringify({ id, isStarred }) }),
    },
    upload: {
        file: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 60000);
            const response = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || `Upload failed: ${response.status}`);
            }
            return response.json();
        },
    },
    blockFeedbacks: {
        getAll: (params?: { planId?: string; blockId?: string; swimmerId?: string }) => {
            const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString() : '';
            return fetchAPI<any[]>(`/block-feedbacks${qs}`);
        },
        create: (data: any) => fetchAPI<any>('/block-feedbacks', { method: 'POST', body: JSON.stringify(data) }),
        delete: (id: string) => fetchAPI<void>(`/block-feedbacks?id=${id}`, { method: 'DELETE' }),
    },
    archive: {
        getFeedbacks: (params?: { swimmerId?: string; group?: string; type?: string; dateFrom?: string; dateTo?: string }) => {
            const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString() : '';
            return fetchAPI<any>(`/archive/feedbacks${qs}`);
        },
    },
    auth: {
        me: () => fetchAPI<any>('/auth/me'),
        login: (data: any) => fetchAPI<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
        logout: () => fetchAPI<any>('/auth/logout', { method: 'POST' }),
    },
    shop: {
        get: (swimmerId?: string) => fetchAPI<any>(`/shop${swimmerId ? `?swimmerId=${swimmerId}` : ''}`),
        purchase: (swimmerId: string, itemId: string) => fetchAPI<any>('/shop', {
            method: 'POST',
            body: JSON.stringify({ action: 'purchase', swimmerId, itemId }),
        }),
        equip: (swimmerId: string, equipped: any) => fetchAPI<any>('/shop', {
            method: 'POST',
            body: JSON.stringify({ action: 'equip', swimmerId, equipped }),
        }),
        wishlistAdd: (swimmerId: string, itemId: string) => fetchAPI<any>('/shop', {
            method: 'POST',
            body: JSON.stringify({ action: 'wishlist_add', swimmerId, itemId }),
        }),
        wishlistRemove: (swimmerId: string, itemId: string) => fetchAPI<any>('/shop', {
            method: 'POST',
            body: JSON.stringify({ action: 'wishlist_remove', swimmerId, itemId }),
        }),
    },
    buddy: {
        get: (swimmerId: string) => fetchAPI<any>(`/buddy?swimmerId=${swimmerId}`),
        request: (swimmerId: string, targetSwimmerId: string) => fetchAPI<any>('/buddy', {
            method: 'POST',
            body: JSON.stringify({ action: 'request', swimmerId, targetSwimmerId }),
        }, false),
        accept: (swimmerId: string, pairId: string) => fetchAPI<any>('/buddy', {
            method: 'POST',
            body: JSON.stringify({ action: 'accept', swimmerId, pairId }),
        }, false),
        dissolve: (swimmerId: string, pairId: string) => fetchAPI<any>('/buddy', {
            method: 'POST',
            body: JSON.stringify({ action: 'dissolve', swimmerId, pairId }),
        }, false),
    },
    meets: {
        getAll: () => fetchAPI<MeetCountdownResponse>('/meets'),
        create: (data: Partial<Meet>) => fetchAPI<Meet>('/meets', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, data: Partial<Meet>) => fetchAPI<Meet>(`/meets?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id: string) => fetchAPI<void>(`/meets?id=${id}`, {
            method: 'DELETE',
        }),
        getCountdown: () => fetchAPI<MeetCountdownResponse>('/meets'),
    },
    activityFeed: {
        get: (swimmerId: string) => fetchAPI<any[]>(`/activity-feed?swimmerId=${swimmerId}`, undefined, true, 1),
        readAll: (swimmerId: string) => fetchAPI<any>('/activity-feed', {
            method: 'POST',
            body: JSON.stringify({ action: 'read_all', swimmerId }),
        }),
        readOne: (swimmerId: string, itemId: string) => fetchAPI<any>('/activity-feed', {
            method: 'POST',
            body: JSON.stringify({ action: 'read_one', swimmerId, itemId }),
        }),
    },
    rewards: {
        reward: (swimmerId: string, amount: number, message: string) => fetchAPI<any>('/swimmers/reward', {
            method: 'POST',
            body: JSON.stringify({ swimmerId, amount, message }),
        }),
    }
};
