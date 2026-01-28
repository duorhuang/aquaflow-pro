import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a192f] text-white">
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-700">
        <h1 className="text-6xl font-bold tracking-tighter">
          AquaFlow <span className="text-[#64ffda]">PRO</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-lg mx-auto">
          The advanced swimming team management system with AI-driven load monitoring.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-[#64ffda] text-[#0a192f] px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"
          >
            Enter Coach Portal <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/workout"
            className="flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-colors"
          >
            Athlete Login
          </Link>
        </div>
      </div>
    </div>
  );
}
