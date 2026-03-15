'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import CommandPalette from '@/components/CommandPalette';
import { Menu, Bell, Search, Command } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isZenMode = pathname === '/zen';

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
      {!isZenMode && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden pointer-events-none opacity-100 transition-opacity">
          <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-blue-300/20 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse"></div>
          <div className="absolute top-[10%] right-[-10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-purple-300/20 rounded-full mix-blend-multiply filter blur-[100px]"></div>
          <div className="absolute bottom-[-20%] left-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-sky-200/30 rounded-full mix-blend-multiply filter blur-[100px]"></div>
        </div>
      )}
      
      {/* Ambient noise overlay */}
      {!isZenMode && (
        <div className="fixed inset-0 z-0 opacity-[0.015] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      )}

      {!isZenMode && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      <div className={`flex-1 flex flex-col min-w-0 relative z-10 ${isZenMode ? 'p-0 h-screen overflow-hidden' : ''}`}>
        {/* Mobile Header */}
        {!isZenMode && (
          <header className="md:hidden h-16 flex items-center justify-between px-4 bg-white border-b border-[#e2e8f0] sticky top-0 z-30">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 rounded-xl hover:bg-[#f1f5f9] text-[#64748b] "
              >
                <Menu size={24} />
              </button>
              <Logo className="w-7 h-7" />
              <span className="font-semibold tracking-tight">SMILE</span>
            </div>
          </header>
        )}

        {/* Optional: Global Header for Desktop */}
        {!isZenMode && (
          <header className="hidden md:flex h-20 items-center justify-between px-8 bg-transparent sticky top-0 z-30 mb-2">
            <div className="flex-1 max-w-xl">
              <button
                onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
                className="w-full flex items-center gap-3 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl py-3 pl-5 pr-4 text-sm font-medium text-slate-500 hover:bg-white hover:text-slate-700 hover:border-slate-200 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all cursor-pointer group"
              >
                <Search size={18} className="group-hover:text-blue-600 transition-colors" />
                <span className="flex-1 text-left">Search pages & actions...</span>
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600 border border-slate-200 ">
                  <Command size={10} /> K
                </kbd>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-sm hover:bg-white transition-all text-slate-600 hover:text-slate-900 relative group">
                <Bell size={20} className="group-hover:scale-110 transition-transform" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
            </div>
          </header>
        )}

        <main className={`flex-1 ${isZenMode ? 'p-0 w-full h-full overflow-hidden' : 'p-4 sm:p-6 lg:p-8 overflow-x-hidden'}`}>
          <div className={isZenMode ? 'w-full h-full' : 'max-w-7xl mx-auto'}>
            {children}
          </div>
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  );
}
