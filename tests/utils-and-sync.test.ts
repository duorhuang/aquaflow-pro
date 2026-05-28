import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Date Utils Tests ──────────────────────────────────────────────
import {
    getLocalDateISOString,
    calculateLevel,
    parseUTCDate,
    formatTime,
    formatTimeAgo,
    formatDateLocal,
} from '@/lib/date-utils';

describe('Date Utils', () => {
    describe('getLocalDateISOString', () => {
        it('should return local date string in YYYY-MM-DD format', () => {
            const date = new Date(2026, 4, 28); // May 28, 2026
            const result = getLocalDateISOString(date);
            expect(result).toBe('2026-05-28');
        });

        it('should pad single-digit months and days', () => {
            const date = new Date(2026, 0, 5); // January 5, 2026
            const result = getLocalDateISOString(date);
            expect(result).toBe('2026-01-05');
        });

        it('should use current date when no argument provided', () => {
            const result = getLocalDateISOString();
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });

    describe('calculateLevel', () => {
        it.each([
            { xp: 0, level: 1 },
            { xp: 100, level: 1 },
            { xp: 499, level: 1 },
            { xp: 500, level: 2 },
            { xp: 1499, level: 2 },
            { xp: 1500, level: 3 },
            { xp: 3499, level: 3 },
            { xp: 3500, level: 4 },
            { xp: 5999, level: 4 },
            { xp: 6000, level: 5 },
            { xp: 9999, level: 5 },
            { xp: 10000, level: 6 },
            { xp: 14999, level: 6 },
            { xp: 15000, level: 7 },
            { xp: 24999, level: 7 },
            { xp: 25000, level: 8 },
            { xp: 100000, level: 8 },
        ])('should return level $level for $xp XP', ({ xp, level }) => {
            expect(calculateLevel(xp)).toBe(level);
        });
    });

    describe('parseUTCDate', () => {
        it('should handle strings with Z suffix', () => {
            const result = parseUTCDate('2026-05-28T06:00:00Z');
            expect(result.toISOString()).toBe('2026-05-28T06:00:00.000Z');
        });

        it('should append Z to strings without Z suffix', () => {
            const result = parseUTCDate('2026-05-28T06:00:00');
            expect(result.toISOString()).toBe('2026-05-28T06:00:00.000Z');
        });

        it('should return valid Date object', () => {
            const result = parseUTCDate('2026-05-28T00:00:00Z');
            expect(result).toBeInstanceOf(Date);
            expect(result.getFullYear()).toBe(2026);
        });
    });

    describe('formatTime', () => {
        it('should format ISO timestamp to HH:MM', () => {
            const result = formatTime('2026-05-28T06:05:00Z');
            expect(result).toBe('14:05'); // depends on timezone, but format is HH:MM
            expect(result).toMatch(/^\d{2}:\d{2}$/);
        });
    });

    describe('formatTimeAgo', () => {
        it('should return "刚刚" for recent timestamps', () => {
            const now = new Date().toISOString();
            const result = formatTimeAgo(now);
            expect(result).toBe('刚刚');
        });

        it('should return minutes for timestamps within an hour', () => {
            const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
            const result = formatTimeAgo(fiveMinAgo);
            expect(result).toBe('5 分钟前');
        });

        it('should return hours for timestamps within a day', () => {
            const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60000).toISOString();
            const result = formatTimeAgo(threeHoursAgo);
            expect(result).toBe('3 小时前');
        });

        it('should return days for timestamps within a week', () => {
            const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString();
            const result = formatTimeAgo(twoDaysAgo);
            expect(result).toBe('2 天前');
        });
    });

    describe('formatDateLocal', () => {
        it('should format date in zh-CN locale', () => {
            const result = formatDateLocal('2026-05-28T00:00:00Z');
            expect(result).toMatch(/2026.*5.*28|2026.*5.*28/);
        });
    });
});

// ─── Sync Engine Utility Tests ─────────────────────────────────────
import { isQuotaError, hasFreshStorage } from '@/lib/store/sync-engine';

describe('Sync Engine Utilities', () => {
    describe('isQuotaError', () => {
        it.each([
            'data transfer quota exceeded',
            'HTTP status 402',
            'exceeded maximum request size',
            'QUOTA-EXHAUSTED-ERROR',
            'API Error: 503 Service Unavailable',
        ])('should return true for: %s', (msg) => {
            expect(isQuotaError(msg)).toBe(true);
        });

        it.each([
            'Network error',
            'Request timed out',
            'Server error',
            'API Error: 404 Not Found',
            'API Error: 500 Internal Server Error',
            '',
        ])('should return false for: %s', (msg) => {
            expect(isQuotaError(msg)).toBe(false);
        });
    });

    describe('hasFreshStorage', () => {
        beforeEach(() => {
            localStorage.clear();
        });

        it('should return false when no localStorage data', () => {
            expect(hasFreshStorage()).toBe(false);
        });

        it('should return true when localStorage has recent data', () => {
            localStorage.setItem('aquaflow_local_timestamp', Date.now().toString());
            expect(hasFreshStorage()).toBe(true);
        });

        it('should return false when localStorage data is older than 7 days', () => {
            const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
            localStorage.setItem('aquaflow_local_timestamp', eightDaysAgo.toString());
            expect(hasFreshStorage()).toBe(false);
        });

        it('should return false when localStorage throws', () => {
            // Simulate private browsing mode
            const originalGetItem = Storage.prototype.getItem;
            Storage.prototype.getItem = vi.fn(() => { throw new Error('Storage disabled'); });

            expect(hasFreshStorage()).toBe(false);

            Storage.prototype.getItem = originalGetItem;
        });
    });
});

// ─── Persist Layer Tests ───────────────────────────────────────────
import { persist, loadFromStorage, loadCollection } from '@/lib/store/persist-layer';

describe('Persist Layer', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('persist', () => {
        it('should save data to localStorage with correct key prefix', () => {
            persist('plans', [{ id: 'p1', name: 'Test' }]);
            const stored = localStorage.getItem('aquaflow_local_plans');
            expect(stored).toBeTruthy();
            expect(JSON.parse(stored!)).toEqual([{ id: 'p1', name: 'Test' }]);
        });

        it('should update timestamp', () => {
            persist('swimmers', []);
            const ts = localStorage.getItem('aquaflow_local_timestamp');
            expect(ts).toBeTruthy();
            expect(Date.now() - parseInt(ts!, 10)).toBeLessThan(1000);
        });
    });

    describe('loadFromStorage', () => {
        it('should return empty when no timestamp', () => {
            const result = loadFromStorage();
            expect(result.hasData).toBe(false);
            expect(result.collections).toEqual({});
        });

        it('should return data from localStorage when within TTL', () => {
            localStorage.setItem('aquaflow_local_plans', JSON.stringify([{ id: 'p1' }]));
            localStorage.setItem('aquaflow_local_swimmers', JSON.stringify([{ id: 's1' }]));
            localStorage.setItem('aquaflow_local_timestamp', Date.now().toString());

            const result = loadFromStorage();
            expect(result.collections.plans).toEqual([{ id: 'p1' }]);
            expect(result.collections.swimmers).toEqual([{ id: 's1' }]);
            expect(result.hasData).toBe(true);
        });

        it('should return no data when past TTL', () => {
            const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
            localStorage.setItem('aquaflow_local_plans', JSON.stringify([{ id: 'p1' }]));
            localStorage.setItem('aquaflow_local_timestamp', eightDaysAgo.toString());

            const result = loadFromStorage();
            expect(result.hasData).toBe(false);
            expect(result.collections).toEqual({});
        });

        it('should only include non-empty collections in hasData', () => {
            localStorage.setItem('aquaflow_local_plans', JSON.stringify([]));
            localStorage.setItem('aquaflow_local_timestamp', Date.now().toString());

            const result = loadFromStorage();
            expect(result.hasData).toBe(false);
            expect(result.collections.plans).toBeUndefined();
        });
    });

    describe('loadCollection', () => {
        it('should return empty array when no data', () => {
            expect(loadCollection('plans')).toEqual([]);
        });

        it('should return parsed data', () => {
            localStorage.setItem('aquaflow_local_plans', JSON.stringify([{ id: 'p1' }]));
            expect(loadCollection('plans')).toEqual([{ id: 'p1' }]);
        });
    });
});
