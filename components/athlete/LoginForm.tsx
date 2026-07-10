"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

interface LoginFormProps {
    mode?: "athlete" | "coach";
}

export function LoginForm({ mode = "athlete" }: LoginFormProps) {
    const router = useRouter();
    const { t } = useLanguage();
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

        // Retry login up to 5 times with exponential backoff for cold DB starts / Worker limits
        let lastError: string = "Network error";

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            setRetryAttempt(attempt + 1);
            try {
                // Abort previous controller before creating new one
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
                    lastError = `Server error (${res.status}). Please try again in a moment.`;
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
                    if (res.status === 429) {
                        setError(data.error || t.common.tooManyAttempts || "Too many attempts, please wait a moment.");
                        setIsLoading(false);
                        return;
                    }
                    if (res.status === 503) {
                        lastError = data.error || "服务器繁忙，正在重试...";
                        if (attempt < MAX_RETRIES - 1) {
                            await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
                            continue;
                        }
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
                const is503 = err.message?.includes('503');
                const delay = is503 ? 3000 * (attempt + 1) : 1500 * (attempt + 1);
                lastError = err.name === 'AbortError'
                    ? (t.common.retrying 
                        ? t.common.retrying.replace("{n}", (attempt + 1).toString()).replace("{total}", MAX_RETRIES.toString())
                        : `Connecting... attempt ${attempt + 1}/${MAX_RETRIES}`)
                    : is503 
                        ? (t.common.loggingIn || "Connecting to server...") 
                        : (err.message || "Network error");
                if (attempt < MAX_RETRIES - 1) {
                    await new Promise(r => setTimeout(r, delay));
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
        <form onSubmit={handleLogin} className="space-y-5 w-full relative">
            {/* Full-form loading overlay during retries (DB cold start) */}
            {isLoading && retryAttempt > 0 && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-50 gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                    <p className="text-sm text-white font-medium">{t.common.connecting || "Connecting..."}</p>
                    <p className="text-xs text-white/60">
                        {t.common.retrying 
                            ? t.common.retrying.replace("{n}", retryAttempt.toString()).replace("{total}", MAX_RETRIES.toString())
                            : `Retrying (attempt ${retryAttempt} of ${MAX_RETRIES})...`}
                    </p>
                </div>
            )}
            <div className="space-y-4">
                <motion.div 
                    className="relative group"
                    whileTap={{ scale: 0.995 }}
                >
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                        type="text"
                        placeholder={t.common.username || "Username"}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-black/20 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 focus:bg-black/40 transition-all shadow-inner"
                        required
                        aria-label="用户名"
                        autoComplete="username"
                    />
                </motion.div>
                <motion.div 
                    className="relative group"
                    whileTap={{ scale: 0.995 }}
                >
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder={t.common.password || "Password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/20 border border-white/5 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 focus:bg-black/40 transition-all shadow-inner"
                        required
                        aria-label="密码"
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 p-0.5 text-muted-foreground hover:text-emerald-400 focus:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 rounded transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </motion.div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-400 text-sm text-center font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {mode === "coach" && (
                <p className="text-center text-xs text-muted-foreground">
                    {t.common.forgotPassword || "忘记密码？"}请到 <Link href="/setup" className="text-emerald-400 hover:underline">{t.common.resetPassword || "初始化页面"}</Link> 重置。
                </p>
            )}

            <div className="space-y-3 pt-2">
                <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className={cn(
                        "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-lg shadow-lg relative overflow-hidden",
                        isLoading
                            ? "bg-emerald-500/50 text-white/80 cursor-wait"
                            : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    )}
                >
                    {isLoading && (
                        <motion.div 
                            className="absolute left-0 top-0 bottom-0 bg-white/20"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    )}
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                            <span className="relative z-10 text-sm">
                                {retryAttempt > 0 
                                    ? (t.common.retrying 
                                        ? t.common.retrying.replace("{n}", retryAttempt.toString()).replace("{total}", MAX_RETRIES.toString())
                                        : `Connecting... attempt ${retryAttempt}/${MAX_RETRIES}`)
                                    : (t.common.loggingIn || "Connecting to server...")}
                            </span>
                        </>
                    ) : t.common.login}
                </motion.button>

                <AnimatePresence>
                    {isLoading && (
                        <motion.button
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            type="button"
                            onClick={() => {
                                abortRef.current?.abort();
                                setIsLoading(false);
                                setRetryAttempt(0);
                            }}
                            className="w-full py-3 rounded-2xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                        >
                            {t.common.back || "取消连接"}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </form>
    );
}
