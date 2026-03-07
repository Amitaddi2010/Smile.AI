'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Menu, Bell, Search } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-[#1e40af]/30 border-t-[#1e40af] rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[var(--bg)] transition-colors duration-500 flex font-sans relative selection:bg-blue-600/10 text-[var(--text)]">
            {/* Global Dashboard Premium Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden pointer-events-none opacity-100 dark:opacity-30 transition-opacity">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-blue-300/20 dark:bg-blue-600/10 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse"></div>
                <div className="absolute top-[10%] right-[-10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-purple-300/20 dark:bg-purple-600/10 rounded-full mix-blend-multiply filter blur-[100px]"></div>
                <div className="absolute bottom-[-20%] left-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-sky-200/30 dark:bg-sky-600/10 rounded-full mix-blend-multiply filter blur-[100px]"></div>
            </div>
            {/* Ambient noise overlay */}
            <div className="fixed inset-0 z-0 opacity-[0.015] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 relative z-10">
                {/* Mobile Header */}
                <header className="md:hidden h-16 flex items-center justify-between px-4 bg-white border-b border-[#e2e8f0] sticky top-0 z-30">
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 rounded-xl hover:bg-[#f1f5f9] text-[#64748b]"
                        >
                            <Menu size={24} />
                        </button>
                        <Logo className="w-7 h-7" />
                        <span className="font-semibold tracking-tight">SMILE</span>
                    </div>
                </header>

                {/* Optional: Global Header for Desktop (to keep it professional) */}
                <header className="hidden md:flex h-20 items-center justify-between px-8 bg-transparent sticky top-0 z-30 mb-2">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search diagnostics..."
                                className="w-full bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-slate-700 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-sm hover:bg-white transition-all text-slate-500 hover:text-slate-800 relative group">
                            <Bell size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
