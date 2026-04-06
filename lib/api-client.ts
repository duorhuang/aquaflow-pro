
// API Client wrapper for fetch operations

const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || `API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

export const api = {
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
        respond: (data: any) => fetchAPI<any>('/feedback-reminders', { method: 'POST', body: JSON.stringify(data) }),
    }
};
