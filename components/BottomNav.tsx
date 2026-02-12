"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BrainCircuit, MapPin, ClipboardList } from 'lucide-react';

const navItems = [
    { name: '홈', icon: Home, path: '/' },
    { name: '자가진단', icon: BrainCircuit, path: '/select-pet' },
    { name: '병원찾기', icon: MapPin, path: '/result' },
    { name: '건강수첩', icon: ClipboardList, path: '/diary' },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-100 px-6 pb-6 pt-3 z-50 flex items-center justify-between max-w-[600px] mx-auto rounded-t-[32px] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
            {navItems.slice(0, 2).map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                    <Link
                        key={item.name}
                        href={item.path}
                        className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-50' : 'bg-transparent text-slate-900 group-hover:bg-slate-50'}`}>
                            <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                            {item.name}
                        </span>
                    </Link>
                );
            })}

            {/* ChatBot Trigger */}
            {/* ChatBot Trigger */}
            <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}
                className="flex flex-col items-center gap-1.5 transition-all duration-300 opacity-100 hover:opacity-100 group"
            >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-900 text-white shadow-lg shadow-slate-200 group-hover:scale-105 transition-transform">
                    <div className="relative">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
                    </div>
                </div>
                <span className="text-[10px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    AI 상담
                </span>
            </button>

            {navItems.slice(2).map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                    <Link
                        key={item.name}
                        href={item.path}
                        className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-50' : 'bg-transparent text-slate-900 group-hover:bg-slate-50'}`}>
                            <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                            {item.name}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
