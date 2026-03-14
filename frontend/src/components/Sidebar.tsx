'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
    Home, Activity, Brain, BarChart3, Users, Settings, LogOut,
    Menu, X, Shield, FileText, Sparkles, Sun, Moon, Heart, Bot
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { useState } from 'react';
import { Logo } from '@/components/Logo';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const studentNav = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/talk', label: 'Talk to SMILE', icon: Bot },
    { href: '/assessment', label: 'Assessment', icon: Activity },
    { href: '/journal', label: 'Journal', icon: FileText },
    { href: '/wellness', label: 'Wellness', icon: Sparkles },
    { href: '/wellness-pass', label: 'Wellness Pass', icon: FileText },
    { href: '/ai-insights', label: 'AI Insights', icon: Brain },
    { href: '/counselors', label: 'Support', icon: Heart },
    { href: '/settings', label: 'Settings', icon: Settings },
];

const counselorNav = [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/counselor', label: 'Students', icon: Users },
    { href: '/assessment', label: 'Quick Assess', icon: Activity },
    { href: '/ai-insights', label: 'AI Insights', icon: Brain },
    { href: '/datasets', label: 'Dataset Info', icon: FileText },
    { href: '/settings', label: 'Settings', icon: Settings },
];

const adminNav = [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/admin', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/counselor', label: 'Students', icon: Users },
    { href: '/explainability', label: 'Model Explainability', icon: Brain },
    { href: '/datasets', label: 'Datasets', icon: FileText },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const { theme, toggleTheme } = useTheme();

    if (!user) return null;

    const navItems = user.role === 'admin' ? adminNav :
        user.role === 'counselor' ? counselorNav : studentNav;

    const handleLogout = () => { logout(); router.push('/'); };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-xl border-r border-slate-100 z-50 transition-all duration-300 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] 
 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
 ${collapsed ? 'md:w-[72px]' : 'md:w-[260px]'}
 w-[280px] sm:w-[300px] md:sticky md:top-0 md:flex`}
            >
                {/* Header */}
                <div className={`h-16 flex items-center ${collapsed && !isOpen ? 'justify-center' : 'justify-between px-4'} border-b border-slate-100 `}>
                    {(!collapsed || isOpen) && (
                        <Link href="/dashboard" className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-slate-900 ">
                            <Logo className="w-7 h-7 shrink-0" />
                            <span>SMILE</span>
                        </Link>
                    )}

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden md:flex p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 "
                            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {collapsed ? <Menu size={20} /> : <X size={20} />}
                        </button>

                        <button
                            onClick={onClose}
                            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 "
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => { if (window.innerWidth < 768) onClose?.(); }}
                                className={`flex items-center ${collapsed && !isOpen ? 'justify-center mx-1 px-0' : 'gap-3 px-3'} py-3 rounded-2xl transition-all duration-200 group relative ${isActive
                                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 font-bold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold'
                                    }`}
                            >
                                <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-slate-900 transition-colors'} />
                                {(!collapsed || isOpen) && <span className="text-sm font-medium">{label}</span>}
                                {isActive && !collapsed && (
                                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/40" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="p-3 border-t border-[#f1f5f9] bg-[#f8fafc]/50 ">
                    <div className={`flex items-center ${collapsed && !isOpen ? 'justify-center' : 'gap-3 px-3'} py-3`}>
                        <div className="w-9 h-9 rounded-full bg-[#1e40af] ring-4 ring-[#1e40af]/10 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        {(!collapsed || isOpen) && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#0f172a] truncate">{user.name}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1.5 mt-0.5">
                                    <Shield size={10} className="text-[#1e40af]" /> {user.role}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Dark Mode Toggle Removed */}

                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all group font-medium ${collapsed && !isOpen ? 'justify-center' : ''}`}
                    >
                        <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                        {(!collapsed || isOpen) && <span className="text-sm">Log out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
