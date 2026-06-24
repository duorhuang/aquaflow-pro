/**
 * Coach dashboard loading skeleton — shown instantly during route transitions.
 * Next.js streams this before the page JS hydrates, so users see immediate feedback.
 */
export default function Loading() {
    return (
        <div className="min-h-screen bg-background px-4 md:px-8 lg:px-12 py-6">
            {/* Header skeleton */}
            <header className="mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                        <div className="h-7 w-40 bg-white/5 rounded-lg animate-pulse" />
                        <div className="h-4 w-32 bg-white/5 rounded-md animate-pulse mt-2" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-full animate-pulse" />
                        <div className="w-10 h-10 bg-white/5 rounded-full animate-pulse" />
                        <div className="w-10 h-10 bg-white/5 rounded-full animate-pulse" />
                    </div>
                </div>
            </header>

            {/* Mobile quick action skeleton */}
            <div className="md:hidden w-full mb-6">
                <div className="w-full bg-white/5 h-14 rounded-xl animate-pulse" />
            </div>

            {/* Main grid skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Left column */}
                <div className="space-y-6">
                    <div className="bg-card/30 border border-border rounded-2xl p-6 h-48 animate-pulse" />
                    <div className="bg-card/30 border border-border rounded-2xl p-6 h-32 animate-pulse" />
                    <div className="bg-card/30 border border-border rounded-2xl p-6 h-40 animate-pulse" />
                </div>

                {/* Middle column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="h-6 w-32 bg-white/5 rounded-md animate-pulse" />
                        <div className="h-10 w-28 bg-white/5 rounded-full animate-pulse" />
                    </div>
                    <div className="bg-card/30 border border-border rounded-2xl p-6 h-56 animate-pulse" />
                    <div className="bg-card/30 border border-border rounded-2xl p-6 h-48 animate-pulse" />
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    <div className="bg-card/30 border border-border rounded-2xl p-6 h-64 animate-pulse" />
                    <div className="bg-card/30 border border-border rounded-2xl p-6 h-40 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
