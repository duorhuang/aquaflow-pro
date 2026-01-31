import { Sidebar } from "@/components/layout/Sidebar";
import { CoachGuard } from "@/components/auth/CoachGuard";
import { MobileNav } from "@/components/layout/MobileNav";

export default function DriverLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CoachGuard>
            <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
                <div className="hidden md:block">
                    <Sidebar />
                </div>
                <div className="md:hidden">
                    <MobileNav />
                </div>
                <main className="md:pl-64 min-h-screen transition-all duration-300 pt-16 md:pt-0">
                    <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </CoachGuard>
    );
}
