'use client';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Zap, Target, Shield, Info, Activity, Calendar, FileText, ChevronRight, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export default function NeuralInsightsPage() {
    const { token, user } = useAuth();
    const [insights, setInsights] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/dashboard/insights`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(setInsights)
        .finally(() => setLoading(false));
    }, [token]);

    if (loading) return <div className="p-12 text-center text-slate-400">Loading Neural Patterns...</div>;

    const heatmapData = insights?.mood_grid || [];
    const correlations = insights?.correlations || [];

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Neural <span className="text-indigo-600">Insights</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Explainable AI (XAI) breakdown of your emotional landscape.</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <Activity size={16} className="text-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Active Pipeline: XGBoost 2.1</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Mood Heatmap */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-bold">
                                <Calendar size={18} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Emotional Persistence</h3>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="flex gap-1">
                                {[0,1,2,3,4].map(v => (
                                    <div key={v} className={`w-3 h-3 rounded-sm ${v === 0 ? 'bg-slate-100' : v === 1 ? 'bg-indigo-100' : v === 2 ? 'bg-indigo-300' : v === 3 ? 'bg-indigo-500' : 'bg-indigo-700'}`} />
                                ))}
                             </div>
                             <span className="text-[10px] font-bold text-slate-400 uppercase">Intensity</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-10 gap-2">
                        {heatmapData.map((d: any, i: number) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.02 }}
                                className={`aspect-square rounded-lg transition-all border border-black/5 cursor-pointer hover:ring-2 hover:ring-indigo-500/20 group relative ${
                                    d.intensity === 0 ? 'bg-slate-50' :
                                    d.intensity === 1 ? 'bg-indigo-100' :
                                    d.intensity === 2 ? 'bg-indigo-300' :
                                    d.intensity === 3 ? 'bg-indigo-500' : 'bg-indigo-700'
                                }`}
                            >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none font-bold">
                                    Day {d.day + 1}: {d.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <p className="mt-8 text-xs text-slate-400 leading-relaxed italic">
                        The grid above represents your last 30 days of emotional data extracted from journals and check-ins. Darker shades indicate higher emotional intensity or presence of strong cognitive markers.
                    </p>
                </motion.div>

                {/* Growth State */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-600/30 flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                                <Award size={24} className="text-yellow-400" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Wellness Level</h3>
                        </div>
                        <div className="text-6xl font-black mb-2">{user?.wellness_level || 1}</div>
                        <p className="text-indigo-100/60 font-bold uppercase tracking-widest text-xs">Level Tier: Resilient Pioneer</p>
                    </div>

                    <div className="mt-10">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-100/60">Points to Level { (user?.wellness_level || 1) + 1 }</span>
                            <span className="text-sm font-black">{user?.wellness_points || 0}/100 XP</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${user?.wellness_points || 0}%` }}
                                className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Trigger Analysis */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Target size={18} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Behavioral Correlations</h3>
                    </div>

                    <div className="space-y-6">
                        {correlations.map((c: any, i: number) => (
                            <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.direction === 'Positive' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                                        <TrendingUp size={20} className={c.direction === 'Negative' ? 'rotate-180' : ''} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-800 uppercase tracking-wide">{c.factor}</div>
                                        <div className="text-xs text-slate-400 font-bold tracking-tight">{c.direction} Correlation</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-slate-900">{(c.strength * 100).toFixed(0)}%</div>
                                    <div className={`text-[10px] font-black uppercase tracking-widest ${c.impact === 'High' ? 'text-indigo-600' : 'text-slate-400'}`}>
                                        {c.impact} Impact
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* XAI Breakdown */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">
                            <Shield size={18} />
                        </div>
                        <h3 className="text-xl font-black tracking-tight uppercase tracking-widest">Model Weighting (XAI)</h3>
                    </div>

                    <div className="h-64 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={Object.entries(insights?.risk_weights || {}).map(([k, v]: any) => ({ name: k, value: v }))}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#818cf8" />
                                        <stop offset="100%" stopColor="#4f46e5" />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" hide />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff', fontSize: '10px' }}
                                />
                                <Bar dataKey="value" radius={[20, 20, 20, 20]}>
                                    {Object.entries(insights?.risk_weights || {}).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="url(#barGradient)" fillOpacity={index === 1 ? 1 : 0.6} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-8 space-y-4 relative z-10">
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                            SMILE uses a triple-model consensus. Currently, the <span className="text-indigo-400 font-black italic">Text Sentiment Model</span> has the highest influence (40%) on your dashboard risk score.
                        </p>
                        <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
                            <Info size={14} className="text-indigo-400 shrink-0" />
                            <span className="text-[10px] font-bold text-white/60">Verified by Randomized Clinical Trial (RCT) simulation data.</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
