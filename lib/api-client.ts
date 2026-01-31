
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
        throw new Error(error.message || `API Error: ${response.statusText}`);
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
    },
    performances: {
        getAll: () => fetchAPI<any[]>('/performances'),
        create: (data: any) => fetchAPI<any>('/performances', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    },
    templates: {
        getAll: () => fetchAPI<any[]>('/templates'),
    }
};
