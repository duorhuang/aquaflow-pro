import { Sidebar } from "@/components/layout/Sidebar";

export default function DriverLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
            <Sidebar />
            <main className="pl-64 min-h-screen transition-all duration-300">
                <div className="container mx-auto p-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}
