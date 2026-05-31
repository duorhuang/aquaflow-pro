"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface LoginFormProps {
    mode?: "athlete" | "coach";
}

export function LoginForm({ mode = "athlete" }: LoginFormProps) {
    const router = useRouter();
    const { t } = useLanguage();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [retryAttempt, setRetryAttempt] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    // Warm up DB on mount to avoid cold-start latency on first login
    useEffect(() => {
        let isMounted = true;
        const wakeDb = async () => {
            try {
                await fetch('/api/auth/me', { cache: 'no-store' });
            } catch {
                // Silent — DB warming is best-effort
            }
        };
        wakeDb();

        // Keep DB warm with periodic ping while on login page
        const interval = setInterval(() => {
            if (isMounted) wakeDb();
        }, 45000); // every 45s (Neon idle timeout is ~5min)

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Retry login up to 3 times with exponential backoff for cold DB starts
        const MAX_RETRIES = 3;
        let lastError: string = "Network error";

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            setRetryAttempt(attempt + 1);
            try {
                const controller = new AbortController();
                abortRef.current = controller;
                const timeout = setTimeout(() => controller.abort(), 20000);

                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password, role: mode }),
                    signal: controller.signal,
                });
                clearTimeout(timeout);

                const contentType = res.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    if (res.status === 429) {
                        setError(t.common.tooManyAttempts || 'Too many attempts, please wait a moment.');
                        setIsLoading(false);
                        return;
                    }
                    if (res.ok) {
                        redirectAfterLogin(mode);
                        return;
                    }
                    const text = await res.text();
                    lastError = 'Server error. Please try again in a moment.';
                    console.error('Login API returned non-JSON response:', text.substring(0, 200));
                    if (attempt < MAX_RETRIES - 1) {
                        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                        continue;
                    }
                    setError(lastError);
                    setIsLoading(false);
                    return;
                }

                const data = await res.json();

                if (!res.ok) {
                    if (res.status === 401 || res.status === 400) {
                        setError(data.error || "Username or password incorrect");
                        setIsLoading(false);
                        return;
                    }
                    // Don't retry on rate limiting — show the error immediately
                    if (res.status === 429) {
                        setError(data.error || t.common.tooManyAttempts || "Too many attempts, please wait a moment.");
                        setIsLoading(false);
                        return;
                    }
                    lastError = data.error || "Server error, retrying...";
                    if (attempt < MAX_RETRIES - 1) {
                        await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
                        continue;
                    }
                    setError(lastError);
                    setIsLoading(false);
                    return;
                }

                // Wait briefly for cookie to commit before redirect (prevents race condition)
                redirectAfterLogin(mode, data);
                return;
            } catch (err: any) {
                lastError = err.name === 'AbortError'
                    ? `Request timed out${attempt < MAX_RETRIES - 1 ? ', retrying...' : ', please try again later'}`
                    : err.message || "Network error";
                if (attempt < MAX_RETRIES - 1) {
                    await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
                    continue;
                }
                setError(lastError);
                setIsLoading(false);
                setRetryAttempt(0);
                return;
            }
        }
    };

    const redirectAfterLogin = async (role: string, data?: any) => {
        // Wait for cookie to commit, polling document.cookie every 100ms
        // Max 2s total wait — if cookie still missing after that, proceed anyway
        const deadline = Date.now() + 2000;
        while (Date.now() < deadline) {
            if (document.cookie.includes('aquaflow_session')) break;
            await new Promise(r => setTimeout(r, 100));
        }
        if (role === "coach") {
            router.push("/dashboard");
        } else {
            if (data?.user?.id) {
                localStorage.setItem("aquaflow_athlete_id", data.user.id);
            }
            router.push("/workout");
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-4 w-full">
            <div className="space-y-2">
                <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t.common.username || "Username"}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                        aria-label="用户名"
                        autoComplete="username"
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder={t.common.password || "Password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                        aria-label="密码"
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 p-0.5 text-muted-foreground hover:text-white transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {error && (
                <p className="text-red-400 text-xs text-center">{error}</p>
            )}

            {mode === "coach" && (
                <p className="text-center text-xs text-muted-foreground">
                    {t.common.forgotPassword || "忘记密码？"}请到 <a href="/setup" className="text-primary hover:underline">{t.common.resetPassword || "初始化页面"}</a> 重置。
                </p>
            )}

            <div className="space-y-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 min-h-[44px]",
                        isLoading
                            ? "bg-secondary text-muted-foreground cursor-wait"
                            : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02]"
                    )}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {retryAttempt > 0 ? `Connecting... attempt ${retryAttempt}/3` : t.common.loggingIn || "Connecting to server..."}
                        </>
                    ) : t.common.login}
                </button>
                {isLoading && (
                    <button
                        type="button"
                        onClick={() => {
                            abortRef.current?.abort();
                            setIsLoading(false);
                            setRetryAttempt(0);
                        }}
                        className="w-full py-2 rounded-xl text-sm text-muted-foreground hover:text-white transition-colors min-h-[44px]"
                    >
                        {t.common.back || "取消"}
                    </button>
                )}
            </div>
        </form>
    );
}
