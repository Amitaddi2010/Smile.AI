'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Target, Zap, Gift } from 'lucide-react';
import { dashboardAPI } from '@/lib/api';

interface Mission {
    id: string;
    title: string;
    description: string;
    category: string;
    reward: number;
}

export default function DailyMissions({ token }: { token: string }) {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [completed, setCompleted] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        // We'll add this to dashboardAPI in next step
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/dashboard/missions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(setMissions)
        .catch(console.error)
        .finally(() => setLoading(false));

        // Load local completion state
        const saved = localStorage.getItem('smile_missions_completed');
        if (saved) setCompleted(JSON.parse(saved));
    }, [token]);

    const toggleComplete = (id: string) => {
        const newCompleted = completed.includes(id) 
            ? completed.filter(i => i !== id)
            : [...completed, id];
        
        setCompleted(newCompleted);
        localStorage.setItem('smile_missions_completed', JSON.stringify(newCompleted));
    };

    if (loading) return <div className="h-48 animate-pulse bg-slate-50 rounded-[2rem]"></div>;

    return (
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <Target size={120} />
            </div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <Zap className="text-amber-500 fill-amber-500" size={24} />
                        Daily Missions
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">AI-generated wellness challenges.</p>
                </div>
                <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Gift size={14} />
                    {completed.length}/{missions.length} Done
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                {missions.map((mission, idx) => {
                    const isDone = completed.includes(mission.id);
                    return (
                        <motion.div
                            key={mission.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => toggleComplete(mission.id)}
                            className={`p-5 rounded-[1.5rem] border cursor-pointer transition-all ${isDone ? 'bg-slate-50 border-slate-200 grayscale' : 'bg-white border-slate-100 hover:border-amber-200 hover:shadow-md'}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-1">
                                    {isDone ? (
                                        <CheckCircle2 className="text-green-500" size={20} />
                                    ) : (
                                        <Circle className="text-slate-200" size={20} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDone ? 'text-slate-400' : 'text-amber-500'}`}>
                                            {mission.category}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400">+{mission.reward} SMILE XP</span>
                                    </div>
                                    <h4 className={`font-bold leading-tight ${isDone ? 'text-slate-400' : 'text-slate-900'}`}>{mission.title}</h4>
                                    <p className={`text-xs mt-1 leading-relaxed ${isDone ? 'text-slate-400' : 'text-slate-500'}`}>{mission.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
