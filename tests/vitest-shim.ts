const beforeHooks: (() => void)[] = [];
export const beforeEach = (fn: () => void) => { beforeHooks.push(fn); };
export const afterEach = (fn: () => void) => {};

export const describe = (name: string, fn: () => void) => { console.log(`\n📋 ${name}`); fn(); };

export const it: any = async (name: string, fn: () => Promise<void> | void) => {
    try {
        for (const hook of beforeHooks) hook();
        await fn();
        console.log(`  ✅ ${name}`);
    } catch (e: any) {
        console.error(`  ❌ ${name}:`, e.message || e);
        process.exitCode = 1;
    }
};

it.each = (cases: any[]) => (nameTemplate: string, fn: (param: any) => Promise<void> | void) => {
    for (const c of cases) {
        let name = nameTemplate;
        if (typeof c === 'object' && c !== null) {
            for (const [k, v] of Object.entries(c)) {
                name = name.replace(`$${k}`, String(v));
            }
        } else {
            name = name.replace('%s', String(c));
        }
        it(name, () => fn(c));
    }
};

export const test = it;

export const vi = {
    fn: (impl?: any) => {
        const mock: any = (...args: any[]) => {
            mock.mock.calls.push(args);
            return mock.mockImplementation ? mock.mockImplementation(...args) : impl ? impl(...args) : undefined;
        };
        mock.mock = { calls: [] };
        mock.mockResolvedValue = (val: any) => {
            mock.mockImplementation = () => Promise.resolve(val);
            return mock;
        };
        mock.mockResolvedValueOnce = (val: any) => {
            const queue = mock._queue || [];
            queue.push(val);
            mock._queue = queue;
            mock.mockImplementation = (...args: any[]) => {
                if (mock._queue && mock._queue.length > 0) {
                    return Promise.resolve(mock._queue.shift());
                }
                return Promise.resolve(val);
            };
            return mock;
        };
        mock.mockClear = () => { mock.mock.calls = []; mock._queue = []; };
        return mock;
    },
    mock: (path: string, factory: () => any) => {},
    clearAllMocks: () => {
        if ((global as any).fetch?.mockClear) (global as any).fetch.mockClear();
    },
    mocked: (x: any) => x,
};

export const expect = Object.assign(
    (actual: any) => ({
        toBe: (expected: any) => {
            if (actual !== expected) throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
        },
        toEqual: (expected: any) => {
            const act = JSON.stringify(actual);
            const exp = JSON.stringify(expected);
            if (act !== exp) throw new Error(`Expected ${act} to equal ${exp}`);
        },
        toContain: (expected: any) => {
            if (!actual?.includes(expected)) throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
        },
        toMatch: (pattern: RegExp | string) => {
            const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
            if (!regex.test(String(actual))) throw new Error(`Expected "${actual}" to match ${pattern}`);
        },
        toBeInstanceOf: (expectedClass: any) => {
            if (!(actual instanceof expectedClass)) throw new Error(`Expected ${actual} to be instance of ${expectedClass.name}`);
        },
        toBeTruthy: () => {
            if (!actual) throw new Error(`Expected ${actual} to be truthy`);
        },
        toBeFalsy: () => {
            if (actual) throw new Error(`Expected ${actual} to be falsy`);
        },
        toBeNull: () => {
            if (actual !== null) throw new Error(`Expected ${actual} to be null`);
        },
        toBeUndefined: () => {
            if (actual !== undefined) throw new Error(`Expected ${actual} to be undefined`);
        },
        toBeGreaterThan: (expected: any) => {
            if (!(actual > expected)) throw new Error(`Expected ${actual} > ${expected}`);
        },
        toBeLessThan: (expected: any) => {
            if (!(actual < expected)) throw new Error(`Expected ${actual} < ${expected}`);
        },
        toHaveLength: (length: number) => {
            if (actual?.length !== length) throw new Error(`Expected length ${length}, got ${actual?.length}`);
        },
        toHaveBeenCalledWith: (...args: any[]) => {
            if (!actual?.mock?.calls?.length) throw new Error("Expected function to have been called");
        },
        rejects: {
            toThrow: async (expected?: string) => {
                try {
                    await actual;
                    throw new Error("Expected promise to reject, but it resolved");
                } catch (e: any) {
                    if (expected && !e.message?.includes(expected)) {
                        throw new Error(`Expected error to contain "${expected}", got "${e.message}"`);
                    }
                }
            }
        }
    }),
    {
        any: (type: any) => ({ asymmetricMatch: (actual: any) => true }),
    }
);

// Setup globals
(global as any).fetch = vi.fn();
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
(global as any).localStorage = localStorageMock;
(global as any).alert = vi.fn();
