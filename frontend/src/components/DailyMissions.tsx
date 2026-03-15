'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Target, Zap, Gift, Sparkles, ChevronRight } from 'lucide-react';

interface Mission {
    id: string;
    title: string;
    description: string;
    category: string;
    reward: number;
    is_completed?: boolean;
}

export default function DailyMissions({ token }: { token: string }) {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [completed, setCompleted] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/dashboard/missions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setMissions(data);
            const apiCompleted = data.filter((m: any) => m.is_completed).map((m: any) => m.id);
            setCompleted(apiCompleted);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [token]);

    const toggleComplete = async (mission: Mission) => {
        const isAlreadyDone = missions.find(m => m.id === mission.id)?.is_completed || completed.includes(mission.id);
        if (isAlreadyDone) return;
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/dashboard/missions/complete?title=${encodeURIComponent(mission.title)}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setCompleted(prev => [...prev, mission.id]);
                setMissions(prev => prev.map(m => m.id === mission.id ? { ...m, is_completed: true } : m));
                window.dispatchEvent(new Event('smile_level_up'));
            }
        } catch (e) {
            console.error("Failed to sync mission", e);
        }
    };

    if (loading) return <div className="h-64 animate-pulse bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200"></div>;

    return (
        <div className="bg-white/40 backdrop-blur-3xl rounded-3xl p-6 sm:p-8 border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.1] transition-all duration-1000 rotate-12 group-hover:rotate-0">
                <Target size={160} className="text-blue-600" />
            </div>

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/5 border border-amber-100/50">
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Daily Missions</h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Growth opportunities identified by LLaMA Engine</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 shadow-lg shadow-black/10">
                        <Gift size={15} className="text-amber-400" />
                        {completed.length} / {missions.length} Harvested
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 relative z-10">
                <AnimatePresence>
                    {missions.map((mission, idx) => {
                        const isDone = completed.includes(mission.id);
                        return (
                            <motion.div
                                key={mission.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => toggleComplete(mission)}
                                className={`group/card p-5 rounded-2xl border transition-all duration-500 cursor-pointer relative overflow-hidden ${
                                    isDone 
                                    ? 'bg-slate-50 border-slate-100 opacity-60' 
                                    : 'bg-white border-white shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:border-blue-100'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                        isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-300 group-hover/card:bg-blue-50 group-hover/card:text-blue-500'
                                    }`}>
                                        {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2.5">
                                            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDone ? 'text-slate-400' : 'text-blue-500'}`}>
                                                {mission.category}
                                            </span>
                                            {!isDone && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100/50">
                                                    <Sparkles size={11} />
                                                    <span className="text-[11px] font-bold">{mission.reward} XP</span>
                                                </div>
                                            )}
                                        </div>
                                        <h4 className={`text-base font-extrabold tracking-tight leading-tight mb-2 ${isDone ? 'text-slate-400' : 'text-slate-900'}`}>
                                            {mission.title}
                                        </h4>
                                        <p className={`text-xs font-medium leading-relaxed ${isDone ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {mission.description}
                                        </p>
                                    </div>
                                </div>
                                {!isDone && (
                                    <div className="absolute bottom-4 right-6 opacity-0 group-hover/card:opacity-100 translate-x-4 group-hover/card:translate-x-0 transition-all">
                                        <ChevronRight size={18} className="text-blue-500" />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100/50 flex items-center justify-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Consistency builds neuroplastic resilience</p>
            </div>
        </div>
    );
}
