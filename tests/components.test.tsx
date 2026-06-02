import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// ─── Mock Next.js navigation ──────────────────────────────────────
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
}));

// ─── Mock i18n ────────────────────────────────────────────────────
vi.mock('@/lib/i18n', () => ({
    useLanguage: () => ({
        t: {
            common: {
                username: 'Username',
                password: 'Password',
                login: 'Login',
                loggingIn: 'Logging in...',
                tooManyAttempts: 'Too many attempts',
                forgotPassword: 'Forgot password?',
                resetPassword: 'Reset password',
                back: 'Back',
            },
        },
    }),
}));

// ─── Now import components ────────────────────────────────────────
import { LoginForm } from '@/components/athlete/LoginForm';
import { ToastProvider, useToast } from '@/components/common/Toast';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// ─── Test helpers ─────────────────────────────────────────────────
function mockFetchResponse(status: number, body: any, contentType = 'application/json') {
    (global.fetch as any).mockResolvedValueOnce({
        ok: status >= 200 && status < 300,
        status,
        headers: { get: (key: string) => key === 'content-type' ? contentType : null },
        json: async () => body,
        text: async () => JSON.stringify(body),
    });
}

// ─── LoginForm Tests ──────────────────────────────────────────────
describe('LoginForm Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
        // Reset cookie
        Object.defineProperty(document, 'cookie', {
            value: '',
            writable: true,
            configurable: true,
        });
    });

    it('should render username and password fields', () => {
        render(<LoginForm />);
        expect(screen.getByLabelText('用户名')).toBeTruthy();
        expect(screen.getByLabelText('密码')).toBeTruthy();
    });

    it('should render a submit button with Login text', () => {
        render(<LoginForm />);
        const buttons = screen.getAllByText('Login');
        expect(buttons.length).toBeGreaterThanOrEqual(1);
        expect(buttons[0]).toHaveAttribute('type', 'submit');
    });

    it('should toggle password visibility', () => {
        render(<LoginForm />);
        const passwordInput = screen.getByLabelText('密码');
        const toggleButton = screen.getByRole('button', { name: /show password/i });

        expect(passwordInput).toHaveAttribute('type', 'password');
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should show error message on failed login', async () => {
        // LoginForm retries 3 times with backoff — mock all 3 responses
        mockFetchResponse(401, { error: 'Invalid credentials' });
        mockFetchResponse(401, { error: 'Invalid credentials' });
        mockFetchResponse(401, { error: 'Invalid credentials' });

        render(<LoginForm />);
        fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'wrong_user' } });
        fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'wrong_password' } });
        fireEvent.click(screen.getAllByText('Login')[0]);

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeTruthy();
        }, { timeout: 10000 });
    });

    it('should show 400 error message', async () => {
        mockFetchResponse(400, { error: 'username and password are required' });
        mockFetchResponse(400, { error: 'username and password are required' });
        mockFetchResponse(400, { error: 'username and password are required' });

        render(<LoginForm />);
        fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'test' } });
        fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'pass' } });
        fireEvent.click(screen.getAllByText('Login')[0]);

        await waitFor(() => {
            expect(screen.getByText('username and password are required')).toBeTruthy();
        }, { timeout: 10000 });
    });

    it('should show rate limit error on 429', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            status: 429,
            headers: { get: (key: string) => key === 'content-type' ? 'text/html' : null },
            text: async () => 'Too many attempts, please wait a moment.',
        });

        render(<LoginForm />);
        fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'test' } });
        fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'pass' } });
        fireEvent.click(screen.getAllByText('Login')[0]);

        await waitFor(() => {
            expect(screen.getByText(/Too many attempts/i)).toBeTruthy();
        }, { timeout: 15000 });
    }, 20000);
});

// ─── Toast Tests ──────────────────────────────────────────────────
describe('Toast Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render success toast', async () => {
        function TestComponent() {
            const { toast } = useToast();
            return <button onClick={() => toast('success', 'It works!')}>Fire</button>;
        }

        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        screen.getByText('Fire').click();
        await waitFor(() => { expect(screen.getByText('It works!')).toBeTruthy(); });
    });

    it('should render error toast', async () => {
        function TestComponent() {
            const { toast } = useToast();
            return <button onClick={() => toast('error', 'Error!')}>Fire</button>;
        }

        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        screen.getByText('Fire').click();
        await waitFor(() => { expect(screen.getByText('Error!')).toBeTruthy(); });
    });

    it('should render info toast', async () => {
        function TestComponent() {
            const { toast } = useToast();
            return <button onClick={() => toast('info', 'Info message')}>Fire</button>;
        }

        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        screen.getByText('Fire').click();
        await waitFor(() => { expect(screen.getByText('Info message')).toBeTruthy(); });
    });

    it('should render loading toast', async () => {
        function TestComponent() {
            const { toast } = useToast();
            return <button onClick={() => toast('loading', 'Loading...')}>Fire</button>;
        }

        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        screen.getByText('Fire').click();
        await waitFor(() => { expect(screen.getByText('Loading...')).toBeTruthy(); });
    });

    it('should auto-dismiss toasts after duration', async () => {
        vi.useFakeTimers();

        function TestComponent() {
            const { toast } = useToast();
            return <button onClick={() => toast('success', 'Gone soon', 500)}>Fire</button>;
        }

        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        screen.getByText('Fire').click();

        // Advance timers to let the toast appear
        await act(async () => {
            await vi.advanceTimersByTimeAsync(100);
        });

        expect(screen.getByText('Gone soon')).toBeTruthy();

        // Advance timers past the 500ms auto-dismiss
        await act(async () => {
            await vi.advanceTimersByTimeAsync(500);
        });

        expect(screen.queryByText('Gone soon')).toBeNull();
        vi.useRealTimers();
    }, 10000);

    it('should throw error when used outside ToastProvider', async () => {
        function BadComponent() {
            useToast();
            return <div>Oops</div>;
        }

        await expect(async () => {
            render(<BadComponent />);
        }).rejects.toThrow('useToast must be used within ToastProvider');
    });
});

// ─── ErrorBoundary Tests ──────────────────────────────────────────
describe('ErrorBoundary Component', () => {
    it('should render children when no error', () => {
        render(
            <ErrorBoundary>
                <p>Hello World</p>
            </ErrorBoundary>
        );
        expect(screen.getByText('Hello World')).toBeTruthy();
    });

    it('should show fallback on error', () => {
        function BrokenChild() {
            throw new Error('Test Error');
            return null;
        }

        render(
            <ErrorBoundary>
                <BrokenChild />
            </ErrorBoundary>
        );

        expect(screen.getByText('出错了')).toBeTruthy();
    });

    it('should show custom fallback', () => {
        function BrokenChild() {
            throw new Error('Test Error');
            return null;
        }

        render(
            <ErrorBoundary fallback={<p>Custom fallback</p>}>
                <BrokenChild />
            </ErrorBoundary>
        );

        expect(screen.getByText('Custom fallback')).toBeTruthy();
    });

    it('should show error message', () => {
        function BrokenChild() {
            throw new Error('Test connection error');
            return null;
        }

        render(
            <ErrorBoundary>
                <BrokenChild />
            </ErrorBoundary>
        );

        expect(screen.getByText('出错了')).toBeTruthy();
        expect(screen.getByText('重试')).toBeTruthy();
    });

    it('should show Try Again button', () => {
        function BrokenChild() {
            throw new Error('Test Error');
            return null;
        }

        render(
            <ErrorBoundary>
                <BrokenChild />
            </ErrorBoundary>
        );

        expect(screen.getByText('重试')).toBeTruthy();
    });

    it('should render normally when children do not throw', () => {
        render(
            <ErrorBoundary>
                <div data-testid="content">Safe content</div>
            </ErrorBoundary>
        );

        expect(screen.getByTestId('content')).toBeTruthy();
        expect(screen.queryByText('Something went wrong')).toBeNull();
    });
});
