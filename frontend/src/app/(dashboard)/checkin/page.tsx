'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ClipboardList, Sparkles, ArrowRight, Mic, Shield,
    Activity, FileText, Brain, Clock, Zap, Bot
} from 'lucide-react';
import { useState } from 'react';

export default function CheckinPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeMode, setActiveMode] = useState<'forms' | 'talk'>('talk');

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in-up">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-500 mb-6">
                    <Clock size={12} className="text-slate-400" /> {greeting}, {user?.name?.split(' ')[0]}
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
                    How would you like to<br />check in today?
                </h1>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">Both paths lead to the same place — your wellbeing.</p>
            </motion.div>

            {/* Mode Toggle */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
                <div className="inline-flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
                    <button
                        onClick={() => setActiveMode('forms')}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                            activeMode === 'forms' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <ClipboardList size={14} /> Guided Forms
                    </button>
                    <button
                        onClick={() => setActiveMode('talk')}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                            activeMode === 'talk' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Bot size={14} /> Talk to SMILE
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    </button>
                </div>
            </motion.div>

            {/* Card — changes based on toggle */}
            <motion.div
                key={activeMode}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                className="w-full max-w-lg"
            >
                {activeMode === 'forms' ? (
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="group text-left w-full bg-white rounded-[1.75rem] border border-slate-200 p-8 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/80 border border-blue-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                            <ClipboardList size={26} className="text-blue-600" />
                        </div>
                        <h2 className="relative text-2xl font-bold text-slate-900 mb-2">Guided Forms</h2>
                        <p className="relative text-sm text-slate-500 leading-relaxed mb-6">
                            Fill in your assessment, journal, and wellness data step by step at your own pace. Perfect for detailed, structured tracking.
                        </p>
                        <div className="relative flex flex-wrap gap-2 mb-8">
                            {[
                                { icon: Activity, label: 'Assessment' },
                                { icon: FileText, label: 'Journal' },
                                { icon: Brain, label: 'AI Insights' },
                            ].map(f => (
                                <span key={f.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <f.icon size={10} /> {f.label}
                                </span>
                            ))}
                        </div>
                        <div className="relative flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:gap-3 transition-all">
                            Open Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                ) : (
                    <button
                        onClick={() => router.push('/talk')}
                        className="group text-left w-full bg-white rounded-[1.75rem] border border-slate-200 p-8 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm shadow-indigo-500/20">
                            <Sparkles size={10} /> Recommended
                        </div>

                        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/80 border border-indigo-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                            <Bot size={26} className="text-indigo-600" />
                        </div>
                        <h2 className="relative text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                            Talk to SMILE <Sparkles size={16} className="text-indigo-400" />
                        </h2>
                        <p className="relative text-sm text-slate-500 leading-relaxed mb-4">
                            Just have a conversation — by text or voice. SMILE handles your journal, assessment, and insights automatically. Full-screen immersive experience.
                        </p>
                        <div className="relative flex flex-wrap gap-2 mb-8">
                            {[
                                { icon: Mic, label: 'Voice Enabled' },
                                { icon: Shield, label: 'Encrypted' },
                                { icon: Zap, label: 'Auto-Sync' },
                                { icon: Brain, label: '3 ML Models' },
                            ].map(f => (
                                <span key={f.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/70 border border-indigo-100/80 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                                    <f.icon size={10} /> {f.label}
                                </span>
                            ))}
                        </div>
                        <div className="relative flex items-center gap-2 text-sm font-bold text-indigo-600 group-hover:gap-3 transition-all">
                            Start Chatting <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                )}
            </motion.div>

            {/* Footer */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-10 text-center">
                <p className="text-xs text-slate-400">Switch modes anytime using the toggle above.</p>
                <div className="flex items-center justify-center gap-4 mt-3">
                    <span className="flex items-center gap-1 text-[10px] text-slate-300 font-bold">
                        <Brain size={10} /> 3 XGBoost Models
                    </span>
                    <span className="text-slate-200">•</span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-300 font-bold">
                        <Sparkles size={10} /> LLaMA 3.3 70B
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
