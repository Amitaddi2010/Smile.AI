'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
    Home, Activity, Brain, BarChart3, Users, Settings, LogOut,
    Menu, X, Shield, FileText, Sparkles, Sun, Moon, Heart, Bot, Wind, Zap
} from 'lucide-react';
import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { motion } from 'framer-motion';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const studentNav = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/talk', label: 'Talk to SMILE', icon: Bot },
    { href: '/assessment', label: 'Assessment', icon: Activity },
    { href: '/journal', label: 'Journal', icon: FileText },
    { href: '/wellness', label: 'Wellness Lab', icon: Sparkles },
    { href: '/zen', label: 'Zen Zone', icon: Wind },
    { href: '/insights', label: 'Neural Lab', icon: Zap },
    { href: '/counselors', label: 'Support', icon: Heart },
    { href: '/settings', label: 'Settings', icon: Settings },
];

const counselorNav = [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/counselor', label: 'Students', icon: Users },
    { href: '/assessment', label: 'Quick Assess', icon: Activity },
    { href: '/ai-insights', label: 'AI Insights', icon: Brain },
    { href: '/settings', label: 'Settings', icon: Settings },
];

const adminNav = [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/admin', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/users', label: 'Users System', icon: Users },
    { href: '/counselor', label: 'Students', icon: Users },
    { href: '/explainability', label: 'XAI Studio', icon: Brain },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);

    if (!user) return null;

    const navItems = user.role === 'admin' ? adminNav :
        user.role === 'counselor' ? counselorNav : studentNav;

    const handleLogout = () => { logout(); router.push('/'); };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 md:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed left-0 top-0 h-screen bg-white/70 backdrop-blur-3xl border-r border-white/20 z-50 transition-all duration-500 flex flex-col shadow-[20px_0_80px_rgba(0,0,0,0.02)] 
 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
 ${collapsed ? 'md:w-[88px]' : 'md:w-[280px]'}
 w-[280px] md:sticky md:top-0 md:flex`}
            >
                {/* Header */}
                <div className={`h-24 flex items-center ${collapsed && !isOpen ? 'justify-center' : 'justify-between px-8'} border-b border-slate-100/50`}>
                    {(!collapsed || isOpen) && (
                        <Link href="/dashboard" className="flex items-center gap-4 text-2xl font-black tracking-tighter text-slate-900 group">
                            <Logo className="w-8 h-8 shrink-0 group-hover:rotate-12 transition-transform duration-500" />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500">SMILE</span>
                        </Link>
                    )}

                    <div className="flex items-center gap-1">
                        {!isOpen && (
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className="hidden md:flex p-2.5 rounded-2xl hover:bg-slate-100/50 transition-all text-slate-400 hover:text-slate-900"
                            >
                                {collapsed ? <Menu size={20} /> : <X size={20} />}
                            </button>
                        )}
                        <button onClick={onClose} className="md:hidden p-2.5 rounded-2xl hover:bg-slate-100 transition-colors text-slate-500">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4 custom-scrollbar">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => { if (window.innerWidth < 768) onClose?.(); }}
                                className={`flex items-center ${collapsed && !isOpen ? 'justify-center mx-1 px-0' : 'gap-4 px-4'} py-3.5 rounded-[1.2rem] transition-all duration-300 group relative ${isActive
                                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon size={22} className={isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
                                {(!collapsed || isOpen) && <span className="text-[13px] font-black uppercase tracking-widest">{label}</span>}
                                {isActive && !collapsed && (
                                    <motion.div 
                                        layoutId="sidebar-active"
                                        className="absolute right-4 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" 
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-slate-100/50 bg-slate-50/30">
                    <div className={`flex items-center ${collapsed && !isOpen ? 'justify-center' : 'gap-4 px-4'} py-4`}>
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20 flex items-center justify-center text-sm font-black text-white flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        {(!collapsed || isOpen) && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-900 truncate tracking-tight">{user.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">
                                        {user.role}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-[1.2rem] text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition-all group ${collapsed && !isOpen ? 'justify-center' : ''}`}
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        {(!collapsed || isOpen) && <span className="text-[11px] font-black uppercase tracking-widest">Terminate Session</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
