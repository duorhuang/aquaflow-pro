/**
 * Athlete layout loading skeleton — shown instantly during route transitions.
 * Next.js streams this before the page JS hydrates, so users see immediate feedback.
 */
export default function Loading() {
    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header skeleton */}
            <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-full animate-pulse" />
                        <div>
                            <div className="h-5 w-24 bg-white/5 rounded-md animate-pulse" />
                            <div className="h-3 w-16 bg-white/5 rounded-md animate-pulse mt-1" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/5 rounded-full animate-pulse" />
                        <div className="w-8 h-8 bg-white/5 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Content skeleton */}
            <div className="p-4 space-y-6">
                {/* Weekly calendar skeleton */}
                <div className="flex gap-2 overflow-hidden">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="flex-1 bg-white/5 rounded-xl h-16 animate-pulse" />
                    ))}
                </div>

                {/* Training card skeleton */}
                <div className="bg-card/30 border border-border rounded-2xl p-6 h-72 animate-pulse" />

                {/* Stats skeleton */}
                <div className="grid grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-card/30 border border-border rounded-2xl p-4 h-24 animate-pulse" />
                    ))}
                </div>

                {/* Announcements skeleton */}
                <div className="bg-card/30 border border-border rounded-2xl p-6 h-32 animate-pulse" />
            </div>

            {/* Bottom tab bar skeleton */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-card/50 border-t border-white/5 flex items-center justify-around px-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-6 h-6 bg-white/5 rounded animate-pulse" />
                        <div className="w-10 h-2 bg-white/5 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    );
}
