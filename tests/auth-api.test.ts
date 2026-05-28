import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mock setup before importing modules ───────────────────────────
const MOCK_COACH = {
    id: 'coach-1',
    username: 'coach_admin',
    name: 'Coach Test',
    password: 'salt:100000:hash', // Pre-computed for test
    createdAt: '2026-01-01T00:00:00Z',
};

const MOCK_SWIMMER = {
    id: 'swimmer-1',
    username: 'swimmer_test',
    name: 'Test Swimmer',
    password: 'salt:100000:hash',
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

// Mock Neon SQL client
const mockNeon = vi.fn((strings: TemplateStringsArray, ...values: any[]) => {
    const query = strings.reduce((acc, str, i) => acc + str + (values[i] !== undefined ? `'${values[i]}'` : ''), '');

    if (query.includes('CoachUser') && query.includes('WHERE username')) {
        const username = values[0];
        if (username === 'coach_admin') return Promise.resolve([MOCK_COACH]);
        return Promise.resolve([]);
    }
    if (query.includes('Swimmer') && query.includes('WHERE username')) {
        const username = values[0];
        if (username === 'swimmer_test') return Promise.resolve([MOCK_SWIMMER]);
        return Promise.resolve([]);
    }
    if (query.includes('CoachUser') && query.includes('WHERE id')) {
        const id = values[0];
        if (id === 'coach-1') return Promise.resolve([MOCK_COACH]);
        return Promise.resolve([]);
    }
    if (query.includes('Swimmer') && query.includes('WHERE id')) {
        const id = values[0];
        if (id === 'swimmer-1') return Promise.resolve([MOCK_SWIMMER]);
        return Promise.resolve([]);
    }
    if (query.includes('CoachUser') && query.includes('LIMIT 1')) {
        return Promise.resolve([]); // No existing coach by default
    }
    if (query.includes('CoachUser') && query.includes('INSERT')) {
        return Promise.resolve([{
            id: 'new-coach-1',
            username: 'new_coach',
            passwordHash: 'hashed',
            name: 'New Coach',
            createdAt: '2026-05-28T00:00:00Z',
        }]);
    }

    return Promise.resolve([]);
});

vi.mock('@/lib/db-pool', () => ({
    getNeon: () => mockNeon,
    getPool: () => ({ query: vi.fn() }),
}));

vi.mock('@/lib/auth', async () => {
    const actual = await vi.importActual('@/lib/auth');
    return {
        ...actual,
        verifyPassword: vi.fn(async (password: string, stored: string) => {
            return password === 'testpass123' && stored === 'salt:100000:hash';
        }),
        hashPassword: vi.fn(async (password: string) => `salt:100000:${password}_hashed`),
        generateJWT: vi.fn(async (payload: any) => `mock-jwt-token-${payload.userId}`),
        verifyJWT: vi.fn(async (token: string) => {
            if (token === 'valid-coach-token') return { userId: 'coach-1', role: 'coach' };
            if (token === 'valid-athlete-token') return { userId: 'swimmer-1', role: 'athlete' };
            if (token === 'invalid-token') return null;
            return null;
        }),
        setSessionCookie: vi.fn((token: string) => `aquaflow_session=${token}; Path=/; HttpOnly; SameSite=Strict`),
        clearSessionCookie: vi.fn(() => 'aquaflow_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict'),
        getCookieFromRequest: vi.fn((request: Request, name: string) => {
            const cookie = request.headers.get('cookie') || '';
            const match = cookie.match(new RegExp(`${name}=([^;]+)`));
            return match ? match[1] : null;
        }),
    };
});

vi.mock('@/lib/api-handler', () => ({
    withApiHandler: vi.fn(async (handler: () => Promise<any>) => handler()),
}));

// ─── Now import the route handler ──────────────────────────────────
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { POST as logoutHandler } from '@/app/api/auth/logout/route';
import { GET as meHandler } from '@/app/api/auth/me/route';
import { POST as registerCoachHandler } from '@/app/api/auth/register-coach/route';

// ─── Helper to create Request objects ──────────────────────────────
function createRequest(method: string, url: string, body?: any, headers?: Record<string, string>) {
    const init: RequestInit = { method, headers: { ...headers } };
    if (body) {
        init.body = JSON.stringify(body);
    }
    return new Request(url, init);
}

// ─── Tests ─────────────────────────────────────────────────────────
describe('Auth API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // ─── Login Route ───────────────────────────────────────────────
    describe('POST /api/auth/login', () => {
        it('should reject login with missing username', async () => {
            const req = createRequest('POST', 'http://localhost/api/auth/login', {
                password: 'testpass123',
            });
            const res = await loginHandler(req);
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toContain('username');
        });

        it('should reject login with missing password', async () => {
            const req = createRequest('POST', 'http://localhost/api/auth/login', {
                username: 'coach_admin',
            });
            const res = await loginHandler(req);
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toContain('password');
        });

        it('should login a coach successfully', async () => {
            const req = createRequest('POST', 'http://localhost/api/auth/login', {
                username: 'coach_admin',
                password: 'testpass123',
            });
            const res = await loginHandler(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
            expect(json.user).toEqual({
                id: 'coach-1',
                name: 'Coach Test',
                role: 'coach',
            });
        });

        it('should login a swimmer successfully', async () => {
            const req = createRequest('POST', 'http://localhost/api/auth/login', {
                username: 'swimmer_test',
                password: 'testpass123',
            });
            const res = await loginHandler(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
            expect(json.user).toEqual({
                id: 'swimmer-1',
                name: 'Test Swimmer',
                role: 'athlete',
            });
        });

        it('should reject invalid credentials', async () => {
            const req = createRequest('POST', 'http://localhost/api/auth/login', {
                username: 'nonexistent_user',
                password: 'wrongpass',
            });
            const res = await loginHandler(req);
            const json = await res.json();

            expect(res.status).toBe(401);
            expect(json.error).toBe('Invalid credentials');
        });

        it('should reject wrong password for existing user', async () => {
            (vi.mocked(await import('@/lib/auth')).verifyPassword).mockResolvedValue(false);

            const req = createRequest('POST', 'http://localhost/api/auth/login', {
                username: 'coach_admin',
                password: 'wrong_password',
            });
            const res = await loginHandler(req);
            const json = await res.json();

            expect(res.status).toBe(401);
            expect(json.error).toBe('Invalid credentials');
        });

        it('should include V12 fingerprint headers on all responses', async () => {
            const req = createRequest('POST', 'http://localhost/api/auth/login', {
                username: 'nonexistent',
                password: 'test',
            });
            const res = await loginHandler(req);

            expect(res.headers.get('X-Build')).toBe('V12-STRATOSPHERE-RECOVERY');
            expect(res.headers.get('Cache-Control')).toBe('no-store');
        });

        it('should rate limit after 10 failed attempts', async () => {
            // Exhaust rate limit
            for (let i = 0; i < 10; i++) {
                const req = createRequest('POST', 'http://localhost/api/auth/login', {
                    username: `fail_${i}`,
                    password: 'wrong',
                });
                await loginHandler(req);
            }

            // 11th attempt should be rate limited
            const req = createRequest('POST', 'http://localhost/api/auth/login', {
                username: 'coach_admin',
                password: 'testpass123',
            });
            const res = await loginHandler(req);

            expect(res.status).toBe(429);
        });
    });

    // ─── Logout Route ──────────────────────────────────────────────
    describe('POST /api/auth/logout', () => {
        it('should return success on logout', async () => {
            const res = await logoutHandler();
            const json = await res.json();

            expect(json.success).toBe(true);
        });

        it('should set clear session cookie header', async () => {
            const res = await logoutHandler();

            expect(res.headers.get('Set-Cookie')).toContain('aquaflow_session=');
        });

        it('should include V12 fingerprint headers', async () => {
            const res = await logoutHandler();

            expect(res.headers.get('X-Build')).toBe('V12-STRATOSPHERE-RECOVERY');
        });
    });

    // ─── Me Route ──────────────────────────────────────────────────
    describe('GET /api/auth/me', () => {
        it('should return 401 when no session cookie', async () => {
            const req = createRequest('GET', 'http://localhost/api/auth/me');
            const res = await meHandler(req);
            const json = await res.json();

            expect(res.status).toBe(401);
            expect(json.error).toBe('Not authenticated');
        });

        it('should return coach info with valid coach token', async () => {
            const req = createRequest('GET', 'http://localhost/api/auth/me', undefined, {
                'cookie': 'aquaflow_session=valid-coach-token',
            });
            const res = await meHandler(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.id).toBe('coach-1');
            expect(json.role).toBe('coach');
        });

        it('should return athlete info with valid athlete token', async () => {
            const req = createRequest('GET', 'http://localhost/api/auth/me', undefined, {
                'cookie': 'aquaflow_session=valid-athlete-token',
            });
            const res = await meHandler(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.id).toBe('swimmer-1');
            expect(json.role).toBe('athlete');
            // JSON fields should be parsed
            expect(typeof json.bestTimes).toBe('object');
        });

        it('should return 401 with invalid token', async () => {
            const req = createRequest('GET', 'http://localhost/api/auth/me', undefined, {
                'cookie': 'aquaflow_session=invalid-token',
            });
            const res = await meHandler(req);
            const json = await res.json();

            expect(res.status).toBe(401);
            expect(json.error).toBe('Invalid session');
        });
    });

    // ─── Register Coach Route ──────────────────────────────────────
    describe('POST /api/auth/register-coach', () => {
        it('should reject registration with missing fields', async () => {
            const req = createRequest('POST', 'http://localhost/api/auth/register-coach', {
                username: 'new_coach',
            });
            const res = await registerCoachHandler(req);
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toContain('required');
        });

        it('should reject registration when coach already exists', async () => {
            // Override mock to return an existing coach
            mockNeon.mockImplementationOnce((strings: TemplateStringsArray, ...values: any[]) => {
                return Promise.resolve([{ id: 'existing-coach' }]);
            });

            const req = createRequest('POST', 'http://localhost/api/auth/register-coach', {
                username: 'new_coach',
                password: 'password123',
                name: 'New Coach',
            });
            const res = await registerCoachHandler(req);
            const json = await res.json();

            expect(res.status).toBe(409);
            expect(json.error).toContain('already exists');
        });

        it('should register a new coach successfully', async () => {
            const req = createRequest('POST', 'http://localhost/api/auth/register-coach', {
                username: 'new_coach',
                password: 'password123',
                name: 'New Coach',
            });
            const res = await registerCoachHandler(req);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
            expect(json.coach).toBeDefined();
            expect(json.coach.username).toBe('new_coach');
            expect(json.coach.role).toBe('coach');
        });

        it('should set session cookie on successful registration', async () => {
            const req = createRequest('POST', 'http://localhost/api/auth/register-coach', {
                username: 'new_coach',
                password: 'password123',
                name: 'New Coach',
            });
            const res = await registerCoachHandler(req);

            expect(res.headers.get('Set-Cookie')).toContain('aquaflow_session');
        });
    });
});
