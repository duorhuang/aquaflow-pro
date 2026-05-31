import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';

// ─── Mock fetch at globalThis level before importing api-client ────
const fetchMock = vi.fn();
(globalThis as any).fetch = fetchMock;

function mockFetchResponse(status: number, body: any, contentType = 'application/json') {
    fetchMock.mockResolvedValueOnce({
        ok: status >= 200 && status < 300,
        status,
        headers: { get: (key: string) => key === 'content-type' ? contentType : null },
        json: async () => body,
        text: async () => JSON.stringify(body),
    });
}

// ─── Import after mock ────────────────────────────────────────────
import { fetchAPI, api } from '@/lib/api-client';

// ─── Tests ─────────────────────────────────────────────────────────
describe('API Client', () => {
    beforeEach(() => {
        fetchMock.mockReset();
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    // ─── fetchAPI core behavior ────────────────────────────────────
    describe('fetchAPI', () => {
        it('should return parsed JSON on success', async () => {
            mockFetchResponse(200, { data: 'ok' });

            const result = await fetchAPI('/test');
            expect(result).toEqual({ data: 'ok' });
        });

        it('should include credentials with requests', async () => {
            mockFetchResponse(200, {});

            await fetchAPI('/test');
            expect(fetchMock).toHaveBeenCalledWith(
                '/api/test',
                expect.objectContaining({ credentials: 'include' }),
            );
        });

        it('should merge custom headers with Content-Type', async () => {
            mockFetchResponse(200, {});

            await fetchAPI('/test', { headers: { 'X-Custom': 'value' } });
            const callHeaders = fetchMock.mock.calls[0][1].headers as Record<string, string>;
            expect(callHeaders['Content-Type']).toBe('application/json');
            expect(callHeaders['X-Custom']).toBe('value');
        });

        it('should return null for 4xx errors when silent4xx is true (default)', async () => {
            mockFetchResponse(404, { error: 'Not found' });

            const result = await fetchAPI('/test');
            expect(result).toBeNull();
        });

        it('should throw for 4xx errors when silent4xx is false', async () => {
            // The fetchAPI retries non-silent errors; provide mocks for all attempts
            mockFetchResponse(404, { error: 'Not found' });
            mockFetchResponse(404, { error: 'Not found' });
            mockFetchResponse(404, { error: 'Not found' });

            await expect(fetchAPI('/test', {}, false)).rejects.toThrow('Not found');
        });

        it('should throw for 5xx errors regardless of silent4xx', async () => {
            // 5xx errors are retried; provide mocks for all 3 attempts
            mockFetchResponse(500, { error: 'Server crash' });
            mockFetchResponse(500, { error: 'Server crash' });
            mockFetchResponse(500, { error: 'Server crash' });

            await expect(fetchAPI('/test')).rejects.toThrow('Server crash');
        });

        it('should retry on network failures (up to 3 times)', async () => {
            fetchMock
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    headers: { get: () => 'application/json' },
                    json: async () => ({ recovered: true }),
                });

            const result = await fetchAPI('/test');
            expect(result).toEqual({ recovered: true });
            expect(fetchMock).toHaveBeenCalledTimes(3);
        });

        it('should throw after all retries exhausted', async () => {
            fetchMock.mockRejectedValue(new Error('Network error'));

            await expect(fetchAPI('/test')).rejects.toThrow('Network error');
            expect(fetchMock).toHaveBeenCalledTimes(3);
        });

        it('should not retry on 4xx errors (non-retryable)', async () => {
            mockFetchResponse(400, { error: 'Bad request' });

            await fetchAPI('/test');
            expect(fetchMock).toHaveBeenCalledTimes(1);
        });

        it('should handle non-JSON response by throwing', async () => {
            mockFetchResponse(200, {}, 'text/html');

            await expect(fetchAPI('/test')).rejects.toThrow('non-JSON response');
            expect(fetchMock).toHaveBeenCalledTimes(1); // not retried
        });

        it('should return empty object for successful login without JSON', async () => {
            mockFetchResponse(200, {}, 'text/html');

            const result = await fetchAPI('/auth/login');
            expect(result).toEqual({});
        });
    });

    // ─── API convenience methods ───────────────────────────────────
    describe('api.swimmers', () => {
        it('should getAll swimmers', async () => {
            mockFetchResponse(200, [{ id: '1', name: 'Test' }]);

            const result = await api.swimmers.getAll();
            expect(result).toEqual([{ id: '1', name: 'Test' }]);
        });

        it('should create a swimmer with POST', async () => {
            mockFetchResponse(200, { id: 'new', name: 'New' });

            const result = await api.swimmers.create({ name: 'New' });
            expect(result).toEqual({ id: 'new', name: 'New' });
            expect(fetchMock).toHaveBeenCalledWith(
                '/api/swimmers',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ name: 'New' }),
                }),
            );
        });
    });

    describe('api.plans', () => {
        it('should getAll plans', async () => {
            mockFetchResponse(200, [{ id: 'plan-1' }]);

            const result = await api.plans.getAll();
            expect(result).toEqual([{ id: 'plan-1' }]);
        });
    });

    describe('api.attendance', () => {
        it('should create attendance with POST', async () => {
            mockFetchResponse(200, { id: 'att-1', status: 'Present' });

            const result = await api.attendance.create({ swimmerId: '1', status: 'Present' });
            expect(result.status).toBe('Present');
        });
    });

    describe('api.meets', () => {
        it('should create, update, and delete meets', async () => {
            mockFetchResponse(200, { id: 'meet-1' });
            let result = await api.meets.create({ name: 'Test Meet' });
            expect(result.id).toBe('meet-1');

            mockFetchResponse(200, { id: 'meet-1', name: 'Updated' });
            result = await api.meets.update('meet-1', { name: 'Updated' });
            expect(result.name).toBe('Updated');

            mockFetchResponse(200, { success: true });
            const deleteResult = await api.meets.delete('meet-1');
            expect((deleteResult as any)?.success ?? true).toBe(true);
        });
    });

    describe('api.shop', () => {
        it('should get shop items', async () => {
            mockFetchResponse(200, { items: [] });

            const result = await api.shop.get('swimmer-1');
            expect(result.items).toEqual([]);
        });

        it('should purchase an item', async () => {
            mockFetchResponse(200, { success: true });

            const result = await api.shop.purchase('swimmer-1', 'item-1');
            expect(result.success).toBe(true);
        });
    });

    describe('api.auth', () => {
        it('should me with GET', async () => {
            mockFetchResponse(200, { userId: '1', role: 'athlete' });

            const result = await api.auth.me();
            expect(result.userId).toBe('1');
        });
    });

    describe('api.buddy', () => {
        it('should use silent4xx=false for buddy operations', async () => {
            // buddy.request uses silent4xx=false, so errors are retried
            mockFetchResponse(409, { error: 'Already paired' });
            mockFetchResponse(409, { error: 'Already paired' });
            mockFetchResponse(409, { error: 'Already paired' });

            await expect(api.buddy.request('s1', 's2')).rejects.toThrow('Already paired');
        });
    });

    describe('api.activityFeed', () => {
        it('should use retries=1 for activity feed polling', async () => {
            mockFetchResponse(404, { error: 'Not found' });

            const result = await api.activityFeed.get('swimmer-1');
            expect(result).toBeNull();
            expect(fetchMock).toHaveBeenCalledTimes(1); // not retried
        });
    });

    describe('api.weeklyPlans', () => {
        it('should include group query parameter', async () => {
            mockFetchResponse(200, []);

            await api.weeklyPlans.getAll('A');
            expect(fetchMock).toHaveBeenCalledWith(
                '/api/weekly-plans?group=A',
                expect.any(Object),
            );
        });

        it('should omit group parameter when not provided', async () => {
            mockFetchResponse(200, []);

            await api.weeklyPlans.getAll();
            expect(fetchMock).toHaveBeenCalledWith(
                '/api/weekly-plans',
                expect.any(Object),
            );
        });
    });

    describe('api.feedbackReminders', () => {
        it('should get feedback reminders for a swimmer', async () => {
            mockFetchResponse(200, [{ id: 'reminder-1' }]);

            const result = await api.feedbackReminders.getForSwimmer('swimmer-1');
            expect(result.length).toBe(1);
        });

        it('should respond to a feedback reminder', async () => {
            mockFetchResponse(200, { success: true });

            const result = await api.feedbackReminders.respond({
                reminderId: 'reminder-1',
                mood: 8,
            });
            expect((result as any).success).toBe(true);
            const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
            expect(callBody._action).toBe('respond');
        });
    });

    describe('api.weeklyFeedbacks', () => {
        it('should save weekly feedback', async () => {
            mockFetchResponse(200, { id: 'wf-1' });

            const result = await api.weeklyFeedbacks.save({
                swimmerId: 'swimmer-1',
                weekStart: '2026-05-25',
            });
            expect(result.id).toBe('wf-1');
        });

        it('should reply to weekly feedback', async () => {
            mockFetchResponse(200, { id: 'wf-1', coachReply: 'Good job!' });

            const result = await api.weeklyFeedbacks.reply('wf-1', 'Good job!');
            expect(result.coachReply).toBe('Good job!');
        });
    });

    describe('api.announcements', () => {
        it('should toggle star on announcement', async () => {
            mockFetchResponse(200, { id: 'ann-1', isStarred: true });

            const result = await api.announcements.toggleStar('ann-1', true);
            expect(result.isStarred).toBe(true);
        });

        it('should get archived announcements', async () => {
            mockFetchResponse(200, []);

            const result = await api.announcements.getArchived('A');
            expect(fetchMock).toHaveBeenCalledWith(
                '/api/announcements?archived=true&group=A',
                expect.any(Object),
            );
        });
    });

    describe('api.blockFeedbacks', () => {
        it('should build query string from params', async () => {
            mockFetchResponse(200, []);

            await api.blockFeedbacks.getAll({ planId: 'p1', blockId: 'b1' });
            expect(fetchMock).toHaveBeenCalledWith(
                '/api/block-feedbacks?planId=p1&blockId=b1',
                expect.any(Object),
            );
        });

        it('should handle empty params', async () => {
            mockFetchResponse(200, []);

            await api.blockFeedbacks.getAll();
            expect(fetchMock).toHaveBeenCalledWith(
                '/api/block-feedbacks',
                expect.any(Object),
            );
        });
    });

    describe('api.archive', () => {
        it('should get archive feedbacks with filters', async () => {
            mockFetchResponse(200, { feedbacks: [] });

            await api.archive.getFeedbacks({ group: 'A', type: 'weekly' });
            expect(fetchMock).toHaveBeenCalledWith(
                '/api/archive/feedbacks?group=A&type=weekly',
                expect.any(Object),
            );
        });
    });

    describe('api.rewards', () => {
        it('should reward a swimmer', async () => {
            mockFetchResponse(200, { success: true, newXP: 150 });

            const result = await api.rewards.reward('swimmer-1', 50, 'Great job!');
            expect(result.success).toBe(true);
            expect((result as any).newXP).toBe(150);
        });
    });
});
