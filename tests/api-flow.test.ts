import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flattenPayload } from '@/lib/prisma';
import { api } from '@/lib/api-client';

describe('AquaFlow Pro Logic Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('flattenPayload resilience', () => {
        it('should flatten nested data objects', () => {
            const nested = { data: { name: 'Test', data: { age: 25 } } };
            const flattened = flattenPayload(nested);
            expect(flattened).toEqual({ name: 'Test', age: 25 });
        });

        it('should handle non-nested objects', () => {
            const simple = { name: 'Test' };
            expect(flattenPayload(simple)).toEqual(simple);
        });

        it('should not flatten arrays', () => {
            const withArray = { data: [{ id: 1 }] };
            expect(flattenPayload(withArray)).toEqual({ data: [{ id: 1 }] });
        });
    });

    describe('API Client', () => {
        it('should fetch plans correctly', async () => {
            const mockPlans = [{ id: '1', date: '2026-04-10' }];
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockPlans
            });

            const res = await api.plans.getAll();
            expect(res).toEqual(mockPlans);
            expect(global.fetch).toHaveBeenCalledWith('/api/plans', expect.any(Object));
        });

        it('should throw error on API failure', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: async () => ({ error: 'V12 Crash' })
            });

            await expect(api.plans.getAll()).rejects.toThrow('V12 Crash');
        });
    });
});
