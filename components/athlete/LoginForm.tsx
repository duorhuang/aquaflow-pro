"use client";

import { useState } from "react";
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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, role: mode }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed");
                setIsLoading(false);
                return;
            }

            // Server sets HttpOnly cookie, just redirect
            if (mode === "coach") {
                router.push("/dashboard");
            } else {
                if (data.user?.id) {
                    localStorage.setItem("aquaflow_athlete_id", data.user.id);
                }
                router.push("/workout");
            }
        } catch (err: any) {
            setError(err.message || "Network error");
            setIsLoading(false);
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
                {isLoading ? "Logging in..." : "Login"}
            </button>
        </form>
    );
}
