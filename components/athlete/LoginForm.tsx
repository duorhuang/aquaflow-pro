"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

interface LoginFormProps {
    mode?: "athlete" | "coach";
}

export function LoginForm({ mode = "athlete" }: LoginFormProps) {
    const router = useRouter();
    const { resetAuth, setCurrentUserInfo } = useStore();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [retryAttempt, setRetryAttempt] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const MAX_RETRIES = 5;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        let lastError: string = "网络连接异常，请重试";

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            setRetryAttempt(attempt + 1);
            try {
                abortRef.current?.abort();
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

                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    if (res.status === 429) {
                        setError("请求过于频繁，请稍候再试");
                        setIsLoading(false);
                        return;
                    }
                    if (res.ok) {
                        redirectAfterLogin(mode);
                        return;
                    }
                    lastError = `服务暂时不可用 (${res.status})，正在尝试重连...`;
                    if (attempt < MAX_RETRIES - 1) {
                        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
                        continue;
                    }
                    setError(lastError);
                    setIsLoading(false);
                    return;
                }

                const data = await res.json();

                if (!res.ok) {
                    if (res.status === 401 || res.status === 400) {
                        setError(data.error || "用户名或密码不正确");
                        setIsLoading(false);
                        return;
                    }
                    if (res.status === 429) {
                        setError(data.error || "尝试次数过多，请稍后再试");
                        setIsLoading(false);
                        return;
                    }
                    if (res.status === 503) {
                        lastError = data.error || "云端数据库正在唤醒，请稍候...";
                        if (attempt < MAX_RETRIES - 1) {
                            await new Promise((r) => setTimeout(r, 2500 * (attempt + 1)));
                            continue;
                        }
                    }
                    lastError = data.error || "服务器忙，正在重试...";
                    if (attempt < MAX_RETRIES - 1) {
                        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
                        continue;
                    }
                    setError(lastError);
                    setIsLoading(false);
                    return;
                }

                redirectAfterLogin(mode, data);
                return;
            } catch (err: any) {
                const is503 = err.message?.includes("503");
                const delay = is503 ? 2500 * (attempt + 1) : 1500 * (attempt + 1);
                lastError =
                    err.name === "AbortError"
                        ? `正在连接数据库... (第 ${attempt + 1}/${MAX_RETRIES} 次)`
                        : err.message || "网络请求异常";

                if (attempt < MAX_RETRIES - 1) {
                    await new Promise((r) => setTimeout(r, delay));
                    continue;
                }
                setError(lastError);
                setIsLoading(false);
                setRetryAttempt(0);
                return;
            }
        }
    };

    const redirectAfterLogin = (role: string, data?: any) => {
        resetAuth();
        if (data?.user) {
            setCurrentUserInfo({ ...data.user, role });
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
        <form onSubmit={handleLogin} className="space-y-4 w-full relative">
            {/* Cold start overlay */}
            {isLoading && retryAttempt > 1 && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-50 gap-2 p-4 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-foreground">正在连通数据服务...</p>
                    <p className="text-xs text-muted-foreground">
                        首次连接或唤醒需要数秒，第 {retryAttempt}/{MAX_RETRIES} 次尝试
                    </p>
                </div>
            )}

            <div className="space-y-3">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground block">
                        {mode === "coach" ? "教练账号" : "队员用户名"}
                    </label>
                    <div className="relative group">
                        <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder={mode === "coach" ? "请输入教练用户名" : "请输入拼音或姓名"}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            required
                            aria-label="用户名"
                            autoComplete="username"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground block">
                        账户密码
                    </label>
                    <div className="relative group">
                        <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="请输入密码"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-11 text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            required
                            aria-label="密码"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-3.5 p-0.5 text-muted-foreground hover:text-foreground focus:outline-none rounded transition-colors"
                            aria-label={showPassword ? "隐藏密码" : "显示密码"}
                        >
                            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-destructive text-xs font-medium bg-destructive/10 py-2.5 px-3 rounded-xl border border-destructive/20 text-center"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {mode === "coach" && (
                <div className="flex justify-end pt-0.5">
                    <Link href="/setup" className="text-xs text-primary hover:underline font-medium">
                        重置教练初始密码 →
                    </Link>
                </div>
            )}

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "w-full py-3.5 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm text-primary-foreground shadow-sm",
                        isLoading
                            ? "bg-primary/70 cursor-wait"
                            : "bg-primary hover:bg-primary/90 active:scale-[0.99]"
                    )}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{retryAttempt > 1 ? `连接中 (${retryAttempt}/${MAX_RETRIES})...` : "正在登录..."}</span>
                        </>
                    ) : (
                        <>
                            <span>{mode === "coach" ? "进入教练管理后台" : "进入队员训练空间"}</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
