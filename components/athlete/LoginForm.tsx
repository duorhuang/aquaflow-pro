"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginFormProps {
    mode?: "athlete" | "coach";
}

export function LoginForm({ mode = "athlete" }: LoginFormProps) {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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
            try {
                const controller = new AbortController();
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
                        setError(data.error || "Login failed");
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

                redirectAfterLogin(mode, data);
                return;
            } catch (err: any) {
                lastError = err.name === 'AbortError'
                    ? `服务器响应较慢${attempt < MAX_RETRIES - 1 ? '，正在重试...' : '，请稍后再试'}`
                    : err.message || "Network error";
                if (attempt < MAX_RETRIES - 1) {
                    await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
                    continue;
                }
                setError(lastError);
                setIsLoading(false);
                return;
            }
        }
    };

    const redirectAfterLogin = (role: string, data?: any) => {
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
                        placeholder="Username (e.g. doody)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                    />
                </div>
            </div>

            {error && (
                <p className="text-red-400 text-xs text-center">{error}</p>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className={cn(
                    "w-full py-3 rounded-xl font-bold transition-all",
                    isLoading
                        ? "bg-secondary text-muted-foreground cursor-wait"
                        : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02]"
                )}
            >
                {isLoading ? "Connecting to server..." : "Login"}
            </button>
        </form>
    );
}
