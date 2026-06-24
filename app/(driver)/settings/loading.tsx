/**
 * Settings loading skeleton — shown instantly during route transitions.
 */
export default function Loading() {
    return (
        <div className="min-h-screen bg-background px-4 md:px-8 lg:px-12 py-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header skeleton */}
                <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />

                {/* Settings sections */}
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-card/30 border border-border rounded-2xl p-6 space-y-4 animate-pulse">
                        <div className="h-5 w-32 bg-white/5 rounded-md" />
                        <div className="h-10 w-full bg-white/5 rounded-xl" />
                        <div className="h-10 w-full bg-white/5 rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    );
}
