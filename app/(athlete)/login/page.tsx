"use client";

import { LoginForm } from "@/components/athlete/LoginForm";
import { Waves, UserCog, User } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

function LoginContent() {
    const searchParams = useSearchParams();
    const [isCoach, setIsCoach] = useState(false);

    useEffect(() => {
        if (searchParams.get("role") === "coach") {
            setIsCoach(true);
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Waves className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">AquaFlow Pro</h1>
                    <p className="text-muted-foreground">
                        {isCoach ? "Coach Portal Login" : "Athlete Training Access"}
                    </p>
                </div>

                {/* Role Toggle */}
                <div className="flex p-1 bg-secondary/30 rounded-xl max-w-[200px] mx-auto">
                    <button
                        onClick={() => setIsCoach(false)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all",
                            !isCoach ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <User className="w-3 h-3" /> Athlete
                    </button>
                    <button
                        onClick={() => setIsCoach(true)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all",
                            isCoach ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <UserCog className="w-3 h-3" /> Coach
                    </button>
                </div>

                <div className="bg-secondary/20 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
                    <LoginForm mode={isCoach ? "coach" : "athlete"} />
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    {isCoach ? "Powered by Antigravity" : "Forgot details? Ask your coach."}
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
