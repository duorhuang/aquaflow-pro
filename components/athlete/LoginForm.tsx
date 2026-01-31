"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Lock, User } from "lucide-react";

interface LoginFormProps {
    mode?: "athlete" | "coach";
}

export function LoginForm({ mode = "athlete" }: LoginFormProps) {
    const router = useRouter();
    const { swimmers } = useStore();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Simulate network delay for realism
        setTimeout(() => {
            if (mode === "coach") {
                if (username === "coach" && password === "admin123") {
                    localStorage.setItem("aquaflow_coach_session", "active");
                    router.push("/dashboard");
                } else {
                    setError("Invalid coach credentials");
                    setIsLoading(false);
                }
                return;
            }

            const user = swimmers.find(s =>
                s.username?.toLowerCase() === username.toLowerCase() &&
                s.password === password
            );

            if (user) {
                localStorage.setItem("aquaflow_athlete_id", user.id);
                router.push("/workout");
            } else {
                setError("Invalid username or password");
                setIsLoading(false);
            }
        }, 500);
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
