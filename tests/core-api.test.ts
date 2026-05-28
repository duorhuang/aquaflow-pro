import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Shared Mock Setup ─────────────────────────────────────────────
const MOCK_PLAN = {
    id: 'plan-1',
    date: '2026-05-28',
    startTime: '06:00',
    endTime: '08:00',
    group: 'A',
    blocks: JSON.stringify([{ name: 'Warm-up', distance: 500 }]),
    totalDistance: 500,
    focus: 'freestyle',
    status: 'Draft',
    coachNotes: '',
    targetedNotes: '{}',
    imageUrl: null,
    isStarred: false,
    createdAt: '2026-05-28T00:00:00Z',
    updatedAt: '2026-05-28T00:00:00Z',
};

const MOCK_SWIMMER = {
    id: 'swimmer-1',
    username: 'swimmer_test',
    password: 'hashed_password',
    name: 'Test Swimmer',
    group: 'A',
    status: 'active',
    xp: 100,
    level: 2,
    currentStreak: 5,
    bestTimes: '{"50m_free":"00:30.00"}',
    injuries: '[]',
    readiness: 8,
    injuryNote: null,
    injuryBodyMap: null,
    injuryImageUrl: null,
    lastProfileUpdate: '2026-05-01',
    mainStroke: 'freestyle',
};

const MOCK_FEEDBACK = {
    id: 'feedback-1',
    swimmerId: 'swimmer-1',
    date: '2026-05-28',
    mood: 7,
    effort: 8,
    notes: 'Great session',
};

const MOCK_ATTENDANCE = {
    id: 'attendance-1',
    swimmerId: 'swimmer-1',
    date: '2026-05-28',
    status: 'Present',
    checkInTime: '2026-05-28T06:05:00Z',
};

// ─── Mock DB layer ─────────────────────────────────────────────────
const queryResults: any[] = [];
let queryCallIndex = 0;

const mockNeon = vi.fn((strings: TemplateStringsArray, ...values: any[]) => {
    const query = strings.reduce((acc, str, i) => acc + str + (values[i] !== undefined ? `'${values[i]}'` : ''), '');

    // Return pre-configured results in order
    if (queryCallIndex < queryResults.length) {
        return Promise.resolve(queryResults[queryCallIndex++]);
    }
    return Promise.resolve([]);
});

function resetQueries() {
    queryResults.length = 0;
    queryCallIndex = 0;
}

vi.mock('@/lib/db-pool', () => ({
    getNeon: () => mockNeon,
    getPool: () => ({ query: vi.fn() }),
}));

vi.mock('@/lib/auth', async () => {
    const actual = await vi.importActual('@/lib/auth');
    return {
        ...actual,
        verifyJWT: vi.fn(async (token: string) => {
            if (token === 'coach-token') return { userId: 'coach-1', role: 'coach' };
            if (token === 'athlete-token') return { userId: 'swimmer-1', role: 'athlete' };
            return null;
        }),
        getCookieFromRequest: vi.fn((request: Request, name: string) => {
            const cookie = request.headers.get('cookie') || '';
            const match = cookie.match(new RegExp(`${name}=([^;]+)`));
            return match ? match[1] : null;
        }),
    };
});

vi.mock('@/lib/api-handler', async () => {
    const { requireCoach, requireAthlete, requireAnyAuth } = await vi.importActual('@/lib/auth-api') as any;
    return {
        withApiHandler: vi.fn(async (handler: () => Promise<any>) => handler()),
        handleCoach: vi.fn(async (req: Request, handler: (req: Request, auth: any) => Promise<any>) => {
            const auth = { userId: 'coach-1', role: 'coach' };
            return handler(req, auth);
        }),
        handleAthlete: vi.fn(async (req: Request, handler: (req: Request, auth: any) => Promise<any>) => {
            const auth = { userId: 'swimmer-1', role: 'athlete' };
            return handler(req, auth);
        }),
        handleAnyAuth: vi.fn(async (req: Request, handler: (req: Request, auth: any) => Promise<any>) => {
            // Extract role from the cookie token to simulate real behavior
            const cookie = req.headers.get('cookie') || '';
            const tokenMatch = cookie.match(/aquaflow_session=([^;]+)/);
            const token = tokenMatch ? tokenMatch[1] : null;
            const role = token === 'athlete-token' ? 'athlete' : 'coach';
            const userId = role === 'athlete' ? 'swimmer-1' : 'coach-1';
            const auth = { userId, role };
            return handler(req, auth);
        }),
    };
});

// Mock repos directly
vi.mock('@/lib/repos', () => ({
    planRepo: {
        list: vi.fn(async (group?: string) => {
            let plans = [MOCK_PLAN];
            if (group) {
                plans = plans.filter(p => p.group === group);
            }
            return plans.map(p => ({
                ...p,
                blocks: JSON.parse(p.blocks),
                targetedNotes: JSON.parse(p.targetedNotes),
            }));
        }),
        create: vi.fn(async (data: any) => ({
            id: 'new-plan-1',
            ...data,
            blocks: data.blocks || [],
            targetedNotes: data.targetedNotes || {},
            createdAt: '2026-05-28T00:00:00Z',
            updatedAt: '2026-05-28T00:00:00Z',
        })),
        update: vi.fn(async (id: string, data: any) => ({
            id,
            ...data,
            blocks: data.blocks || [],
            targetedNotes: data.targetedNotes || {},
            updatedAt: '2026-05-28T00:00:00Z',
        })),
        delete: vi.fn(async () => { }),
    },
    swimmerRepo: {
        list: vi.fn(async () => [MOCK_SWIMMER]),
        create: vi.fn(async (data: any) => ({
            id: 'new-swimmer-1',
            ...data,
            createdAt: '2026-05-28T00:00:00Z',
        })),
        update: vi.fn(async (id: string, data: any) => ({
            id,
            ...data,
        })),
        delete: vi.fn(async () => { }),
    },
    feedbackRepo: {
        list: vi.fn(async () => [MOCK_FEEDBACK]),
        upsert: vi.fn(async (data: any) => ({
            id: 'feedback-upserted',
            ...data,
        })),
    },
    attendanceRepo: {
        list: vi.fn(async () => [MOCK_ATTENDANCE]),
        processCheckIn: vi.fn(async (swimmerId: string, date: string, status: string, data: any) => ({
            id: 'attendance-upserted',
            swimmerId,
            date,
            status,
            ...data,
        })),
        delete: vi.fn(async () => { }),
    },
    performanceRepo: {
        list: vi.fn(async () => []),
        create: vi.fn(async (data: any) => ({ id: 'perf-1', ...data })),
        update: vi.fn(async (id: string, data: any) => ({ id, ...data })),
        delete: vi.fn(async () => { }),
    },
}));

// ─── Import route handlers (after mocks) ───────────────────────────
import { GET as plansGET, POST as plansPOST, PUT as plansPUT, DELETE as plansDELETE } from '@/app/api/plans/route';
import { GET as swimmersGET, POST as swimmersPOST, PUT as swimmersPUT, DELETE as swimmersDELETE } from '@/app/api/swimmers/route';
import { GET as feedbacksGET, POST as feedbacksPOST } from '@/app/api/feedbacks/route';
import { GET as attendanceGET, POST as attendancePOST, DELETE as attendanceDELETE } from '@/app/api/attendance/route';

function createRequest(method: string, url: string, body?: any, headers?: Record<string, string>) {
    const init: RequestInit = { method, headers: { ...headers } };
    if (body) init.body = JSON.stringify(body);
    return new Request(url, init);
}

// ─── Tests ─────────────────────────────────────────────────────────
describe('Core API Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetQueries();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // ─── Plans API ─────────────────────────────────────────────────
    describe('GET /api/plans', () => {
        it('should return all plans', async () => {
            const req = createRequest('GET', 'http://localhost/api/plans', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await plansGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(Array.isArray(json)).toBe(true);
            expect(json.length).toBe(1);
            expect(json[0].blocks).toEqual([{ name: 'Warm-up', distance: 500 }]);
        });

        it('should filter plans by group', async () => {
            const req = createRequest('GET', 'http://localhost/api/plans?group=A', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await plansGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json[0].group).toBe('A');
        });

        it('should return empty array for non-matching group', async () => {
            const req = createRequest('GET', 'http://localhost/api/plans?group=Z', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await plansGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.length).toBe(0);
        });
    });

    describe('POST /api/plans', () => {
        it('should create a new plan', async () => {
            const req = createRequest('POST', 'http://localhost/api/plans', {
                date: '2026-05-29',
                group: 'B',
                blocks: [{ name: 'Warm-up', distance: 400 }],
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await plansPOST(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.id).toBe('new-plan-1');
            expect(json.group).toBe('B');
            expect(json.blocks).toEqual([{ name: 'Warm-up', distance: 400 }]);
        });
    });

    describe('PUT /api/plans', () => {
        it('should update an existing plan', async () => {
            const req = createRequest('PUT', 'http://localhost/api/plans?id=plan-1', {
                status: 'Published',
                focus: 'butterfly',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await plansPUT(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.id).toBe('plan-1');
            expect(json.status).toBe('Published');
        });

        it('should return 400 if no ID provided', async () => {
            const req = createRequest('PUT', 'http://localhost/api/plans', {
                status: 'Published',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await plansPUT(req);
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toBe('ID required');
        });
    });

    describe('DELETE /api/plans', () => {
        it('should delete a plan', async () => {
            const req = createRequest('DELETE', 'http://localhost/api/plans?id=plan-1', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await plansDELETE(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
        });

        it('should return 400 if no ID provided', async () => {
            const req = createRequest('DELETE', 'http://localhost/api/plans', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await plansDELETE(req);
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toBe('ID required');
        });
    });

    // ─── Swimmers API ──────────────────────────────────────────────
    describe('GET /api/swimmers', () => {
        it('should return all swimmers for coach', async () => {
            const req = createRequest('GET', 'http://localhost/api/swimmers', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await swimmersGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(Array.isArray(json)).toBe(true);
            expect(json.length).toBe(1);
        });

        it('should not include password for non-coach users', async () => {
            const req = createRequest('GET', 'http://localhost/api/swimmers', undefined, {
                cookie: 'aquaflow_session=athlete-token',
            });
            const res = await swimmersGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json[0].password).toBeUndefined();
        });
    });

    describe('POST /api/swimmers', () => {
        it('should create a new swimmer', async () => {
            const req = createRequest('POST', 'http://localhost/api/swimmers', {
                username: 'new_swimmer',
                name: 'New Swimmer',
                group: 'C',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await swimmersPOST(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.id).toBe('new-swimmer-1');
            expect(json.name).toBe('New Swimmer');
        });
    });

    describe('PUT /api/swimmers', () => {
        it('should update a swimmer profile', async () => {
            const req = createRequest('PUT', 'http://localhost/api/swimmers?id=swimmer-1', {
                name: 'Updated Name',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await swimmersPUT(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.id).toBe('swimmer-1');
            expect(json.name).toBe('Updated Name');
        });

        it('should prevent athlete from updating another athlete', async () => {
            const req = createRequest('PUT', 'http://localhost/api/swimmers?id=swimmer-2', {
                name: 'Hacked',
            }, { cookie: 'aquaflow_session=athlete-token' });
            const res = await swimmersPUT(req);
            const json = await res.json();

            expect(res.status).toBe(403);
            expect(json.error).toContain('Forbidden');
        });

        it('should return 400 if no ID provided', async () => {
            const req = createRequest('PUT', 'http://localhost/api/swimmers', {
                name: 'Updated',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await swimmersPUT(req);
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toBe('ID required');
        });
    });

    describe('DELETE /api/swimmers', () => {
        it('should delete a swimmer', async () => {
            const req = createRequest('DELETE', 'http://localhost/api/swimmers?id=swimmer-1', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await swimmersDELETE(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
        });
    });

    // ─── Feedbacks API ─────────────────────────────────────────────
    describe('GET /api/feedbacks', () => {
        it('should return all feedbacks', async () => {
            const req = createRequest('GET', 'http://localhost/api/feedbacks', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await feedbacksGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(Array.isArray(json)).toBe(true);
            expect(json.length).toBe(1);
        });
    });

    describe('POST /api/feedbacks', () => {
        it('should create or update feedback', async () => {
            const req = createRequest('POST', 'http://localhost/api/feedbacks', {
                swimmerId: 'swimmer-1',
                date: '2026-05-28',
                mood: 9,
                effort: 10,
                notes: 'Excellent!',
            }, { cookie: 'aquaflow_session=athlete-token' });
            const res = await feedbacksPOST(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.mood).toBe(9);
            expect(json.effort).toBe(10);
        });
    });

    // ─── Attendance API ────────────────────────────────────────────
    describe('GET /api/attendance', () => {
        it('should return all attendance records', async () => {
            const req = createRequest('GET', 'http://localhost/api/attendance', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await attendanceGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(Array.isArray(json)).toBe(true);
            expect(json.length).toBe(1);
        });
    });

    describe('POST /api/attendance', () => {
        it('should check in a swimmer', async () => {
            const req = createRequest('POST', 'http://localhost/api/attendance', {
                swimmerId: 'swimmer-1',
                date: '2026-05-28',
                status: 'Present',
            }, { cookie: 'aquaflow_session=athlete-token' });
            const res = await attendancePOST(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.swimmerId).toBe('swimmer-1');
            expect(json.status).toBe('Present');
        });

        it('should check in a swimmer as absent', async () => {
            const req = createRequest('POST', 'http://localhost/api/attendance', {
                swimmerId: 'swimmer-1',
                date: '2026-05-28',
                status: 'Absent',
            }, { cookie: 'aquaflow_session=athlete-token' });
            const res = await attendancePOST(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.status).toBe('Absent');
        });
    });

    describe('DELETE /api/attendance', () => {
        it('should delete an attendance record', async () => {
            const req = createRequest('DELETE', 'http://localhost/api/attendance?id=attendance-1', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await attendanceDELETE(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
        });

        it('should return 400 if no ID provided', async () => {
            const req = createRequest('DELETE', 'http://localhost/api/attendance', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await attendanceDELETE(req);
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toBe('ID required');
        });
    });
});
