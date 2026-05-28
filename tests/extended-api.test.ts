import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Shared Mock Setup ─────────────────────────────────────────────
const MOCK_SHOP_ITEM = {
    id: 'item-1',
    name: 'Golden Cap',
    price: 100,
    category: 'headwear',
    rarity: 'rare',
    imageData: null,
    description: 'A shiny golden swimming cap',
    isAvailable: true,
};

const MOCK_MEET = {
    id: 'meet-1',
    name: 'Spring Invitational',
    date: '2026-06-15',
    location: 'Olympic Pool',
    description: 'Annual spring meet',
    createdAt: '2026-05-01T00:00:00Z',
};

const MOCK_PERFORMANCE = {
    id: 'perf-1',
    swimmerId: 'swimmer-1',
    event: '50m Freestyle',
    time: '00:30.00',
    date: '2026-05-28',
    meetName: 'Spring Invitational',
    placement: 3,
};

const MOCK_TEMPLATE = {
    id: 'template-1',
    name: 'Warm-up Standard',
    category: 'warmup',
    blocks: JSON.stringify([{ type: 'freestyle', distance: 200 }]),
    createdAt: '2026-05-01T00:00:00Z',
};

const MOCK_WEEKLY_PLAN = {
    id: 'wp-1',
    title: 'Week 1 Plan',
    coachId: 'coach-1',
    weekStart: '2026-05-25',
    weekEnd: '2026-05-31',
    targetGroup: JSON.stringify(['A', 'B']),
    targetSwimmerIds: JSON.stringify([]),
    isPublished: true,
    coachNotes: 'Focus on technique',
    sessions: JSON.stringify([{ id: 's1', date: '2026-05-26', totalDistance: 2000 }]),
    createdAt: '2026-05-25T00:00:00Z',
};

const MOCK_ANNOUNCEMENT = {
    id: 'ann-1',
    title: 'Pool Closed',
    content: 'Maintenance day',
    coachId: 'coach-1',
    targetGroup: 'A',
    isStarred: false,
    isArchived: false,
    createdAt: '2026-05-28T00:00:00Z',
};

const MOCK_WEEKLY_FEEDBACK = {
    id: 'wf-1',
    swimmerId: 'swimmer-1',
    weekStart: '2026-05-25',
    mood: 8,
    energy: 7,
    soreness: 3,
    sleep: 8,
    reflection: 'Good week',
    coachReply: null,
    createdAt: '2026-05-28T00:00:00Z',
};

const MOCK_FEEDBACK_REMINDER = {
    id: 'fr-1',
    coachId: 'coach-1',
    swimmerId: 'swimmer-1',
    message: 'How was training?',
    isResponded: false,
    response: null,
    createdAt: '2026-05-28T00:00:00Z',
};

const MOCK_ACTIVITY_ITEM = {
    id: 'act-1',
    swimmerId: 'swimmer-1',
    type: 'xp_gain',
    message: 'Earned 50 XP',
    isRead: false,
    createdAt: '2026-05-28T00:00:00Z',
};

const MOCK_BUDDY = {
    id: 'buddy-1',
    swimmerId: 'swimmer-1',
    buddyId: 'swimmer-2',
    status: 'active',
    createdAt: '2026-05-01T00:00:00Z',
};

// ─── Mock repos ────────────────────────────────────────────────────
vi.mock('@/lib/repos', () => ({
    planRepo: { list: vi.fn(async () => []) },
    swimmerRepo: {
        list: vi.fn(async () => [{ id: 'swimmer-1', username: 'test', xp: 500, inventory: '[]', equippedItems: '{}', wishlist: '[]' }]),
        update: vi.fn(async (id: string, data: any) => ({ id, ...data })),
    },
    feedbackRepo: { list: vi.fn(async () => []), upsert: vi.fn(async (d: any) => ({ id: 'f1', ...d })) },
    attendanceRepo: { list: vi.fn(async () => []), processCheckIn: vi.fn(async (s: string, d: string, st: string, data: any) => ({ id: 'a1', ...data })), delete: vi.fn(async () => {}) },
    performanceRepo: {
        list: vi.fn(async () => [MOCK_PERFORMANCE]),
        create: vi.fn(async (data: any) => ({ id: 'new-perf', ...data })),
        update: vi.fn(async (id: string, data: any) => ({ id, ...data })),
        delete: vi.fn(async () => {}),
    },
    meetRepo: {
        list: vi.fn(async () => [MOCK_MEET]),
        create: vi.fn(async (data: any) => ({ id: 'new-meet', ...data })),
        update: vi.fn(async (id: string, data: any) => ({ id, ...data })),
        delete: vi.fn(async () => {}),
    },
    templateRepo: {
        list: vi.fn(async () => [MOCK_TEMPLATE]),
        create: vi.fn(async (data: any) => ({ id: 'new-template', ...data })),
        delete: vi.fn(async () => {}),
    },
    weeklyPlanRepo: {
        list: vi.fn(async () => [MOCK_WEEKLY_PLAN]),
        create: vi.fn(async (data: any) => ({ id: 'new-wp', ...data })),
        update: vi.fn(async (id: string, data: any) => ({ id, ...data })),
        delete: vi.fn(async () => {}),
    },
    announcementRepo: {
        list: vi.fn(async () => [MOCK_ANNOUNCEMENT]),
        create: vi.fn(async (data: any) => ({ id: 'new-ann', ...data })),
        update: vi.fn(async (id: string, data: any) => ({ id, ...data })),
        delete: vi.fn(async () => {}),
        toggleStar: vi.fn(async (id: string, isStarred: boolean) => ({ id, isStarred })),
    },
    weeklyFeedbackRepo: {
        list: vi.fn(async () => [MOCK_WEEKLY_FEEDBACK]),
        upsert: vi.fn(async (data: any) => ({ id: 'wf-upserted', ...data })),
        save: vi.fn(async (data: any) => ({ id: 'wf-saved', ...data })),
        getBySwimmerAndWeek: vi.fn(async () => MOCK_WEEKLY_FEEDBACK),
        reply: vi.fn(async (id: string, reply: string) => ({ id, coachReply: reply })),
    },
    feedbackReminderRepo: {
        list: vi.fn(async () => [MOCK_FEEDBACK_REMINDER]),
        getForSwimmer: vi.fn(async () => [MOCK_FEEDBACK_REMINDER]),
        create: vi.fn(async (data: any) => ({ id: 'new-fr', ...data })),
        respond: vi.fn(async (data: any) => ({ id: 'fr-responded', ...data })),
        replyToTargeted: vi.fn(async (id: string, reply: string) => ({ id, coachReply: reply })),
    },
    blockFeedbackRepo: {
        list: vi.fn(async () => []),
        create: vi.fn(async (data: any) => ({ id: 'new-bf', ...data })),
        delete: vi.fn(async () => {}),
    },
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
    const { requireAnyAuth } = await vi.importActual('@/lib/auth-api') as any;
    return {
        withApiHandler: vi.fn(async (handler: () => Promise<any>) => handler()),
        handleCoach: vi.fn(async (req: Request, handler: (req: Request, auth: any) => Promise<any>) => {
            const auth = { userId: 'coach-1', role: 'coach' };
            return handler(req, auth);
        }),
        handleAnyAuth: vi.fn(async (req: Request, handler: (req: Request, auth: any) => Promise<any>) => {
            const cookie = req.headers.get('cookie') || '';
            const tokenMatch = cookie.match(/aquaflow_session=([^;]+)/);
            const token = tokenMatch ? tokenMatch[1] : null;
            const role = token === 'athlete-token' ? 'athlete' : 'coach';
            const userId = role === 'athlete' ? 'swimmer-1' : 'coach-1';
            return handler(req, { userId, role });
        }),
    };
});

// Mock neon for shop route
const mockNeon = vi.fn((strings: TemplateStringsArray, ...values: any[]) => {
    const queryText = strings.join('');
    if (queryText.includes('ShopItem')) return Promise.resolve([MOCK_SHOP_ITEM]);
    if (queryText.includes('Swimmer') && values.includes('swimmer-1')) {
        return Promise.resolve([{ id: 'swimmer-1', username: 'test', xp: 500, inventory: '[]', equippedItems: '{}', wishlist: '[]' }]);
    }
    if (queryText.includes('Swimmer')) return Promise.resolve([]);
    return Promise.resolve([]);
});

vi.mock('@/lib/db-pool', () => ({
    getNeon: () => mockNeon,
    getPool: () => ({ query: vi.fn() }),
}));

// ─── Import route handlers ─────────────────────────────────────────
import { GET as shopGET, POST as shopPOST } from '@/app/api/shop/route';
import { GET as meetsGET, POST as meetsPOST, PUT as meetsPUT, DELETE as meetsDELETE } from '@/app/api/meets/route';
import { GET as performancesGET, POST as performancesPOST, PUT as performancesPUT, DELETE as performancesDELETE } from '@/app/api/performances/route';
import { GET as templatesGET, POST as templatesPOST, DELETE as templatesDELETE } from '@/app/api/templates/route';
import { GET as weeklyPlansGET, POST as weeklyPlansPOST, PUT as weeklyPlansPUT, DELETE as weeklyPlansDELETE } from '@/app/api/weekly-plans/route';
import { GET as announcementsGET, POST as announcementsPOST, PUT as announcementsPUT, DELETE as announcementsDELETE } from '@/app/api/announcements/route';
import { GET as weeklyFeedbacksGET, POST as weeklyFeedbacksPOST, PATCH as weeklyFeedbacksPATCH } from '@/app/api/weekly-feedbacks/route';
import { GET as feedbackRemindersGET, POST as feedbackRemindersPOST, PATCH as feedbackRemindersPATCH } from '@/app/api/feedback-reminders/route';
import { GET as activityFeedGET, POST as activityFeedPOST } from '@/app/api/activity-feed/route';
import { GET as buddyGET, POST as buddyPOST } from '@/app/api/buddy/route';
import { GET as syncGET } from '@/app/api/sync/route';

function createRequest(method: string, url: string, body?: any, headers?: Record<string, string>) {
    const init: RequestInit = { method, headers: { ...headers } };
    if (body) init.body = JSON.stringify(body);
    return new Request(url, init);
}

// ─── Tests ─────────────────────────────────────────────────────────
describe('Extended API Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // ─── Sync API ──────────────────────────────────────────────────
    describe('GET /api/sync', () => {
        it('should return sync data with all collections', async () => {
            const req = createRequest('GET', 'http://localhost/api/sync', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await syncGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json).toHaveProperty('swimmers');
            expect(json).toHaveProperty('feedbacks');
            expect(json).toHaveProperty('attendance');
            expect(json).toHaveProperty('performances');
        });
    });

    // ─── Shop API ──────────────────────────────────────────────────
    describe('GET /api/shop', () => {
        it('should return shop items with balance', async () => {
            const req = createRequest('GET', 'http://localhost/api/shop?swimmerId=swimmer-1', undefined, {
                cookie: 'aquaflow_session=athlete-token',
            });
            const res = await shopGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.items).toBeDefined();
            expect(json.balance).toBeDefined();
            expect(json.inventory).toBeDefined();
        });

        it('should return all items without swimmerId (coach view)', async () => {
            const req = createRequest('GET', 'http://localhost/api/shop', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await shopGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.items).toBeDefined();
            expect(json.balance).toBe(0);
        });

        it('should return 404 for non-existent swimmer', async () => {
            const req = createRequest('GET', 'http://localhost/api/shop?swimmerId=nonexistent', undefined, {
                cookie: 'aquaflow_session=athlete-token',
            });
            const res = await shopGET(req);
            const json = await res.json();

            expect(res.status).toBe(404);
            expect(json.error).toBe('Swimmer not found');
        });
    });

    describe('POST /api/shop', () => {
        it('should return 400 for purchase without swimmerId', async () => {
            const req = createRequest('POST', 'http://localhost/api/shop', {
                action: 'purchase',
            }, { cookie: 'aquaflow_session=athlete-token' });
            const res = await shopPOST(req);
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toBe('Swimmer ID required');
        });

        it('should return 400 for purchase without itemId', async () => {
            const req = createRequest('POST', 'http://localhost/api/shop', {
                action: 'purchase',
                swimmerId: 'swimmer-1',
            }, { cookie: 'aquaflow_session=athlete-token' });
            const res = await shopPOST(req);
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toBe('Item ID required');
        });

        it('should return 400 for equip without mapping', async () => {
            const req = createRequest('POST', 'http://localhost/api/shop', {
                action: 'equip',
                swimmerId: 'swimmer-1',
            }, { cookie: 'aquaflow_session=athlete-token' });
            const res = await shopPOST(req);
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toBe('Equipped mapping required');
        });
    });

    // ─── Meets API ─────────────────────────────────────────────────
    describe('GET /api/meets', () => {
        it('should return all meets', async () => {
            const req = createRequest('GET', 'http://localhost/api/meets', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await meetsGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(Array.isArray(json)).toBe(true);
        });
    });

    describe('POST /api/meets', () => {
        it('should create a meet', async () => {
            const req = createRequest('POST', 'http://localhost/api/meets', {
                name: 'New Meet',
                date: '2026-07-01',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await meetsPOST(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.name).toBe('New Meet');
        });
    });

    describe('PUT /api/meets', () => {
        it('should update a meet', async () => {
            const req = createRequest('PUT', 'http://localhost/api/meets?id=meet-1', {
                name: 'Updated Meet',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await meetsPUT(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.name).toBe('Updated Meet');
        });

        it('should return 400 if no ID provided', async () => {
            const req = createRequest('PUT', 'http://localhost/api/meets', {
                name: 'Updated',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await meetsPUT(req);
            const json = await res.json();

            expect(res.status).toBe(400);
        });
    });

    describe('DELETE /api/meets', () => {
        it('should delete a meet', async () => {
            const req = createRequest('DELETE', 'http://localhost/api/meets?id=meet-1', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await meetsDELETE(req);

            expect(res.status).toBe(200);
        });
    });

    // ─── Performances API ──────────────────────────────────────────
    describe('GET /api/performances', () => {
        it('should return all performances', async () => {
            const req = createRequest('GET', 'http://localhost/api/performances', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await performancesGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(Array.isArray(json)).toBe(true);
        });
    });

    describe('POST /api/performances', () => {
        it('should create a performance record', async () => {
            const req = createRequest('POST', 'http://localhost/api/performances', {
                swimmerId: 'swimmer-1',
                event: '100m Freestyle',
                time: '01:05.00',
                date: '2026-05-28',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await performancesPOST(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.event).toBe('100m Freestyle');
        });
    });

    describe('PUT /api/performances', () => {
        it('should update a performance', async () => {
            const req = createRequest('PUT', 'http://localhost/api/performances?id=perf-1', {
                time: '00:29.50',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await performancesPUT(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.time).toBe('00:29.50');
        });

        it('should return 400 if no ID provided', async () => {
            const req = createRequest('PUT', 'http://localhost/api/performances', {
                time: '00:29.50',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await performancesPUT(req);
            const json = await res.json();

            expect(res.status).toBe(400);
        });
    });

    describe('DELETE /api/performances', () => {
        it('should delete a performance', async () => {
            const req = createRequest('DELETE', 'http://localhost/api/performances?id=perf-1', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await performancesDELETE(req);

            expect(res.status).toBe(200);
        });
    });

    // ─── Templates API ─────────────────────────────────────────────
    describe('GET /api/templates', () => {
        it('should return all templates', async () => {
            const req = createRequest('GET', 'http://localhost/api/templates', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await templatesGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(Array.isArray(json)).toBe(true);
        });
    });

    describe('POST /api/templates', () => {
        it('should create a template', async () => {
            const req = createRequest('POST', 'http://localhost/api/templates', {
                name: 'New Template',
                category: 'warmup',
                blocks: [{ type: 'freestyle', distance: 200 }],
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await templatesPOST(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.name).toBe('New Template');
        });
    });

    describe('DELETE /api/templates', () => {
        it('should delete a template', async () => {
            const req = createRequest('DELETE', 'http://localhost/api/templates?id=template-1', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await templatesDELETE(req);

            expect(res.status).toBe(200);
        });
    });

    // ─── Weekly Plans API ──────────────────────────────────────────
    describe('GET /api/weekly-plans', () => {
        it('should return weekly plans', async () => {
            const req = createRequest('GET', 'http://localhost/api/weekly-plans', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await weeklyPlansGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(Array.isArray(json)).toBe(true);
        });

        it('should filter by group', async () => {
            const req = createRequest('GET', 'http://localhost/api/weekly-plans?group=A', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await weeklyPlansGET(req);

            expect(res.status).toBe(200);
        });
    });

    describe('POST /api/weekly-plans', () => {
        it('should create a weekly plan', async () => {
            const req = createRequest('POST', 'http://localhost/api/weekly-plans', {
                title: 'New Week',
                weekStart: '2026-06-01',
                weekEnd: '2026-06-07',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await weeklyPlansPOST(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.title).toBe('New Week');
        });
    });

    describe('PUT /api/weekly-plans', () => {
        it('should update a weekly plan', async () => {
            const req = createRequest('PUT', 'http://localhost/api/weekly-plans?id=wp-1', {
                coachNotes: 'Updated notes',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await weeklyPlansPUT(req);
            const json = await res.json();

            expect(res.status).toBe(200);
        });

        it('should return 400 if no ID provided', async () => {
            const req = createRequest('PUT', 'http://localhost/api/weekly-plans', {
                coachNotes: 'Updated',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await weeklyPlansPUT(req);
            const json = await res.json();

            expect(res.status).toBe(400);
        });
    });

    describe('DELETE /api/weekly-plans', () => {
        it('should delete a weekly plan', async () => {
            const req = createRequest('DELETE', 'http://localhost/api/weekly-plans?id=wp-1', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await weeklyPlansDELETE(req);

            expect(res.status).toBe(200);
        });
    });

    // ─── Announcements API ─────────────────────────────────────────
    describe('GET /api/announcements', () => {
        it('should return announcements', async () => {
            const req = createRequest('GET', 'http://localhost/api/announcements', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await announcementsGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(Array.isArray(json)).toBe(true);
        });

        it('should return archived announcements', async () => {
            const req = createRequest('GET', 'http://localhost/api/announcements?archived=true', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await announcementsGET(req);

            expect(res.status).toBe(200);
        });
    });

    describe('POST /api/announcements', () => {
        it('should create an announcement', async () => {
            const req = createRequest('POST', 'http://localhost/api/announcements', {
                title: 'New Announcement',
                content: 'Content here',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await announcementsPOST(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.title).toBe('New Announcement');
        });
    });

    describe('PUT /api/announcements', () => {
        it('should toggle star on announcement', async () => {
            const req = createRequest('PUT', 'http://localhost/api/announcements?id=ann-1', {
                isStarred: true,
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await announcementsPUT(req);

            expect(res.status).toBe(200);
        });
    });

    describe('DELETE /api/announcements', () => {
        it('should delete an announcement', async () => {
            const req = createRequest('DELETE', 'http://localhost/api/announcements?id=ann-1', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await announcementsDELETE(req);

            expect(res.status).toBe(200);
        });
    });

    // ─── Weekly Feedbacks API ──────────────────────────────────────
    describe('GET /api/weekly-feedbacks', () => {
        it('should return weekly feedbacks', async () => {
            const req = createRequest('GET', 'http://localhost/api/weekly-feedbacks', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await weeklyFeedbacksGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(Array.isArray(json)).toBe(true);
        });

        it('should filter by swimmerId and weekStart', async () => {
            const req = createRequest('GET', 'http://localhost/api/weekly-feedbacks?swimmerId=swimmer-1&weekStart=2026-05-25', undefined, {
                cookie: 'aquaflow_session=athlete-token',
            });
            const res = await weeklyFeedbacksGET(req);

            expect(res.status).toBe(200);
        });
    });

    describe('POST /api/weekly-feedbacks', () => {
        it('should save weekly feedback', async () => {
            const req = createRequest('POST', 'http://localhost/api/weekly-feedbacks', {
                swimmerId: 'swimmer-1',
                weekStart: '2026-05-25',
                mood: 8,
                energy: 7,
            }, { cookie: 'aquaflow_session=athlete-token' });
            const res = await weeklyFeedbacksPOST(req);
            const json = await res.json();

            expect(res.status).toBe(200);
        });
    });

    describe('PATCH /api/weekly-feedbacks', () => {
        it('should reply to weekly feedback', async () => {
            const req = createRequest('PATCH', 'http://localhost/api/weekly-feedbacks', {
                id: 'wf-1',
                coachReply: 'Great work!',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await weeklyFeedbacksPATCH(req);
            const json = await res.json();

            expect(res.status).toBe(200);
        });
    });

    // ─── Feedback Reminders API ────────────────────────────────────
    describe('GET /api/feedback-reminders', () => {
        it('should return feedback reminders', async () => {
            const req = createRequest('GET', 'http://localhost/api/feedback-reminders', undefined, {
                cookie: 'aquaflow_session=coach-token',
            });
            const res = await feedbackRemindersGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(Array.isArray(json)).toBe(true);
        });

        it('should filter by swimmerId', async () => {
            const req = createRequest('GET', 'http://localhost/api/feedback-reminders?swimmerId=swimmer-1', undefined, {
                cookie: 'aquaflow_session=athlete-token',
            });
            const res = await feedbackRemindersGET(req);

            expect(res.status).toBe(200);
        });
    });

    describe('POST /api/feedback-reminders', () => {
        it('should create a feedback reminder', async () => {
            const req = createRequest('POST', 'http://localhost/api/feedback-reminders', {
                swimmerId: 'swimmer-1',
                message: 'How was training?',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await feedbackRemindersPOST(req);
            const json = await res.json();

            expect(res.status).toBe(200);
        });

        it('should respond to a reminder', async () => {
            const req = createRequest('POST', 'http://localhost/api/feedback-reminders', {
                _action: 'respond',
                id: 'fr-1',
                mood: 8,
            }, { cookie: 'aquaflow_session=athlete-token' });
            const res = await feedbackRemindersPOST(req);
            const json = await res.json();

            expect(res.status).toBe(200);
        });
    });

    describe('PATCH /api/feedback-reminders', () => {
        it('should reply to targeted feedback', async () => {
            const req = createRequest('PATCH', 'http://localhost/api/feedback-reminders', {
                id: 'fr-1',
                coachReply: 'Thanks for the feedback!',
            }, { cookie: 'aquaflow_session=coach-token' });
            const res = await feedbackRemindersPATCH(req);
            const json = await res.json();

            expect(res.status).toBe(200);
        });
    });

    // ─── Activity Feed API ─────────────────────────────────────────
    describe('GET /api/activity-feed', () => {
        it('should return activity feed for swimmer', async () => {
            const req = createRequest('GET', 'http://localhost/api/activity-feed?swimmerId=swimmer-1', undefined, {
                cookie: 'aquaflow_session=athlete-token',
            });
            const res = await activityFeedGET(req);
            const json = await res.json();

            expect(res.status).toBe(200);
        });
    });

    describe('POST /api/activity-feed', () => {
        it('should mark all as read', async () => {
            const req = createRequest('POST', 'http://localhost/api/activity-feed', {
                action: 'read_all',
                swimmerId: 'swimmer-1',
            }, { cookie: 'aquaflow_session=athlete-token' });
            const res = await activityFeedPOST(req);

            expect(res.status).toBe(200);
        });

        it('should return 400 for read_one without itemId', async () => {
            const req = createRequest('POST', 'http://localhost/api/activity-feed', {
                action: 'read_one',
                swimmerId: 'swimmer-1',
            }, { cookie: 'aquaflow_session=athlete-token' });
            const res = await activityFeedPOST(req);

            expect(res.status).toBe(400);
        });
    });

    // ─── Buddy API ─────────────────────────────────────────────────
    describe('GET /api/buddy', () => {
        it('should return buddy info', async () => {
            const req = createRequest('GET', 'http://localhost/api/buddy?swimmerId=swimmer-1', undefined, {
                cookie: 'aquaflow_session=athlete-token',
            });
            const res = await buddyGET(req);

            expect(res.status).toBe(200);
        });
    });

    describe('POST /api/buddy', () => {
        it('should return 400 for request without targetSwimmerId', async () => {
            const req = createRequest('POST', 'http://localhost/api/buddy', {
                action: 'request',
                swimmerId: 'swimmer-1',
            }, { cookie: 'aquaflow_session=athlete-token' });
            const res = await buddyPOST(req);
            const json = await res.json();

            expect(res.status).toBe(400);
        });

        it('should return 404 for accept when swimmer not found', async () => {
            const req = createRequest('POST', 'http://localhost/api/buddy', {
                action: 'accept',
                swimmerId: 'swimmer-2',
                targetSwimmerId: 'swimmer-1',
            }, { cookie: 'aquaflow_session=athlete-token' });
            const res = await buddyPOST(req);

            expect(res.status).toBe(404);
        });

        it('should return 400 for dissolve without targetSwimmerId', async () => {
            const req = createRequest('POST', 'http://localhost/api/buddy', {
                action: 'dissolve',
                swimmerId: 'swimmer-1',
            }, { cookie: 'aquaflow_session=athlete-token' });
            const res = await buddyPOST(req);

            expect(res.status).toBe(400);
        });
    });
});
