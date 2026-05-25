
// API Client wrapper for fetch operations

const API_BASE = '/api';
const MAX_RETRIES = 3;
const BASE_DELAY = 800; // ms
const REQUEST_TIMEOUT = 45000; // 45s (Neon cold starts from China can take 20-30s+)

async function fetchAPI<T>(endpoint: string, options?: RequestInit, silent4xx: boolean = true, retries: number = MAX_RETRIES): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

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
            const isLastAttempt = attempt === MAX_RETRIES - 1;
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
        getAll: () => fetchAPI<any>('/sync'),
    },
    swimmers: {
        getAll: () => fetchAPI<any[]>('/swimmers'),
        create: (data: any) => fetchAPI<any>('/swimmers', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, data: any) => fetchAPI<any>(`/swimmers?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id: string) => fetchAPI<void>(`/swimmers?id=${id}`, {
            method: 'DELETE',
        }),
    },
    plans: {
        getAll: () => fetchAPI<any[]>('/plans'),
        create: (data: any) => fetchAPI<any>('/plans', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, data: any) => fetchAPI<any>(`/plans?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id: string) => fetchAPI<void>(`/plans?id=${id}`, {
            method: 'DELETE',
        }),
    },
    feedbacks: {
        getAll: () => fetchAPI<any[]>('/feedbacks'),
        create: (data: any) => fetchAPI<any>('/feedbacks', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, data: any) => fetchAPI<any>(`/feedbacks?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    },
    attendance: {
        getAll: () => fetchAPI<any[]>('/attendance'),
        create: (data: any) => fetchAPI<any>('/attendance', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        delete: (id: string) => fetchAPI<void>(`/attendance?id=${id}`, {
            method: 'DELETE',
        }),
    },
    performances: {
        getAll: () => fetchAPI<any[]>('/performances'),
        create: (data: any) => fetchAPI<any>('/performances', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, data: any) => fetchAPI<any>(`/performances?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id: string) => fetchAPI<void>(`/performances?id=${id}`, {
            method: 'DELETE',
        }),
    },
    templates: {
        getAll: () => fetchAPI<any[]>('/templates'),
        create: (data: any) => fetchAPI<any>('/templates', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => fetchAPI<any>(`/templates?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => fetchAPI<void>(`/templates?id=${id}`, { method: 'DELETE' }),
    },
    weeklyPlans: {
        getAll: (group?: string) => fetchAPI<any[]>(`/weekly-plans${group ? `?group=${group}` : ''}`),
        getById: (id: string) => fetchAPI<any>(`/weekly-plans?id=${id}`),
        create: (data: any) => fetchAPI<any>('/weekly-plans', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => fetchAPI<any>(`/weekly-plans?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => fetchAPI<void>(`/weekly-plans?id=${id}`, { method: 'DELETE' }),
        addSession: (data: any) => fetchAPI<any>('/weekly-plans/sessions', { method: 'POST', body: JSON.stringify(data) }),
        updateSession: (id: string, data: any) => fetchAPI<any>(`/weekly-plans/sessions?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteSession: (id: string) => fetchAPI<void>(`/weekly-plans/sessions?id=${id}`, { method: 'DELETE' }),
    },
    weeklyFeedbacks: {
        getSubmitted: () => fetchAPI<any[]>('/weekly-feedbacks?submitted=true'),
        getAll: () => fetchAPI<any[]>('/weekly-feedbacks'),
        getBySwimmerAndWeek: (swimmerId: string, weekStart: string) =>
            fetchAPI<any>(`/weekly-feedbacks?swimmerId=${swimmerId}&weekStart=${weekStart}`),
        save: (data: any) => fetchAPI<any>('/weekly-feedbacks', { method: 'POST', body: JSON.stringify(data) }),
        reply: (id: string, coachReply: string) => fetchAPI<any>('/weekly-feedbacks', { method: 'PATCH', body: JSON.stringify({ id, coachReply }) }),
    },
    feedbackReminders: {
        getAll: (withResponses?: boolean) =>
            fetchAPI<any[]>(`/feedback-reminders${withResponses ? '?withResponses=true' : ''}`),
        getForSwimmer: (swimmerId: string) =>
            fetchAPI<any[]>(`/feedback-reminders?swimmerId=${swimmerId}`),
        create: (data: any) => fetchAPI<any>('/feedback-reminders', { method: 'POST', body: JSON.stringify(data) }),
        respond: (data: any) => fetchAPI<any>('/feedback-reminders', { method: 'POST', body: JSON.stringify({ ...data, _action: 'respond' }) }),
        replyToTargeted: (id: string, coachReply: string) => fetchAPI<any>('/feedback-reminders', { method: 'PATCH', body: JSON.stringify({ id, coachReply }) }),
    },
    announcements: {
        getAll: (group?: string) => fetchAPI<any[]>(`/announcements${group ? `?group=${group}` : ''}`),
        getArchived: (group?: string) => fetchAPI<any[]>(`/announcements?archived=true${group ? `&group=${group}` : ''}`),
        create: (data: any) => fetchAPI<any>('/announcements', { method: 'POST', body: JSON.stringify(data) }),
        delete: (id: string) => fetchAPI<void>(`/announcements?id=${id}`, { method: 'DELETE' }),
        toggleStar: (id: string, isStarred: boolean) => fetchAPI<any>('/announcements', { method: 'PUT', body: JSON.stringify({ id, isStarred }) }),
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
        accept: (swimmerId: string, targetSwimmerId: string) => fetchAPI<any>('/buddy', {
            method: 'POST',
            body: JSON.stringify({ action: 'accept', swimmerId, targetSwimmerId }),
        }, false),
        dissolve: (swimmerId: string, targetSwimmerId: string) => fetchAPI<any>('/buddy', {
            method: 'POST',
            body: JSON.stringify({ action: 'dissolve', swimmerId, targetSwimmerId }),
        }, false),
    },
    meets: {
        getAll: () => fetchAPI<any>('/meets'),
        create: (data: any) => fetchAPI<any>('/meets', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, data: any) => fetchAPI<any>(`/meets?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id: string) => fetchAPI<any>(`/meets?id=${id}`, {
            method: 'DELETE',
        }),
        getCountdown: () => fetchAPI<any>('/meets'),
    },
    activityFeed: {
        get: (swimmerId: string) => fetchAPI<any>(`/activity-feed?swimmerId=${swimmerId}`, undefined, true, 1),
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

// Re-export for low-retry polling — store uses fetchAPI directly with retries=1
export { fetchAPI };
