import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// ─── Mock next/navigation ──────────────────────────────────────────
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

// ─── Mock i18n ─────────────────────────────────────────────────────
vi.mock('@/lib/i18n', () => ({
    useLanguage: () => ({
        t: {
            common: {},
            dashboard: {
                todayAttendance: "Today's Attendance",
                attendanceRate: "Attendance Rate",
                notCheckedIn: "Not checked in",
                noTrainingTodayAttendance: "No training scheduled today",
            },
        },
    }),
}));

// ─── Mock store ────────────────────────────────────────────────────
const mockStore = {
    swimmers: [],
    attendance: [],
    plans: [],
};

vi.mock('@/lib/store', () => ({
    useStore: () => mockStore,
}));

// ─── Import component ──────────────────────────────────────────────
import { TodayAttendance } from '@/components/dashboard/TodayAttendance';

// ─── Tests ─────────────────────────────────────────────────────────
describe('TodayAttendance Component', () => {
    beforeEach(() => {
        mockStore.swimmers = [];
        mockStore.attendance = [];
        mockStore.plans = [];
    });

    it('should render the attendance header using i18n', () => {
        render(<TodayAttendance />);
        expect(screen.getByText("Today's Attendance")).toBeTruthy();
    });

    it('should render attendance rate label using i18n', () => {
        render(<TodayAttendance />);
        expect(screen.getByText('Attendance Rate')).toBeTruthy();
    });

    it('should show empty state when no training scheduled', () => {
        render(<TodayAttendance />);
        expect(screen.getByText('No training scheduled today')).toBeTruthy();
    });

    it('should show "Not checked in" for absent swimmers', () => {
        mockStore.swimmers = [{ id: 's1', name: 'Test Swimmer', group: 'A' }];
        mockStore.plans = [{ id: 'p1', date: new Date().toISOString().split('T')[0], group: 'A' }];

        render(<TodayAttendance />);
        expect(screen.getByText('Not checked in')).toBeTruthy();
    });

    it('should show checked-in swimmers with time', () => {
        const today = new Date().toISOString().split('T')[0];
        mockStore.swimmers = [{ id: 's1', name: 'Test Swimmer', group: 'A' }];
        mockStore.plans = [{ id: 'p1', date: today, group: 'A' }];
        mockStore.attendance = [{
            id: 'a1',
            swimmerId: 's1',
            date: today,
            status: 'Present',
            timestamp: '2026-05-28T06:05:00Z',
        }];

        render(<TodayAttendance />);
        expect(screen.getByText('Test Swimmer')).toBeTruthy();
        expect(screen.getByText('(A)')).toBeTruthy();
    });

    it('should calculate attendance rate correctly', () => {
        const today = new Date().toISOString().split('T')[0];
        mockStore.swimmers = [
            { id: 's1', name: 'Swimmer 1', group: 'A' },
            { id: 's2', name: 'Swimmer 2', group: 'A' },
        ];
        mockStore.plans = [{ id: 'p1', date: today, group: 'A' }];
        mockStore.attendance = [{
            id: 'a1',
            swimmerId: 's1',
            date: today,
            status: 'Present',
            timestamp: '2026-05-28T06:05:00Z',
        }];

        render(<TodayAttendance />);
        expect(screen.getByText('50%')).toBeTruthy();
        expect(screen.getByText('1/2')).toBeTruthy();
    });
});
