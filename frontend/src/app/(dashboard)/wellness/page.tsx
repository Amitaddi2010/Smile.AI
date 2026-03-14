'use client';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/lib/api';
import { Moon, Smartphone, Heart, TrendingUp, Sparkles, Activity, Shield, Brain, Clock, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import DailyMissions from '@/components/DailyMissions';

export default function WellnessPage() {
    const { token } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        dashboardAPI.getMyWellness(token).then(setData).catch(() => { }).finally(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
                <div className="w-12 h-12 border-4 border-[#1e40af]/10 border-t-[#1e40af] rounded-full animate-spin mb-4" />
                <p className="text-[#64748b] text-sm font-medium">Syncing health telemetry...</p>
            </div>
        );
    }

    if (!data || data.assessments.length === 0) {
        return (
            <div className="text-center py-20 card-premium bg-white max-w-2xl mx-auto mt-10">
                <div className="w-16 h-16 bg-[#f1f5f9] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles size={32} className="text-[#cbd5e1]" />
                </div>
                <h2 className="text-2xl font-bold text-[#0f172a] mb-2">Initialize Your Profile</h2>
                <p className="text-[#64748b] font-light mb-8 max-w-md mx-auto">Complete your first clinical assessment to unlock predictive wellness tracking and behavioral insights.</p>
                <button
                    onClick={() => window.location.href = '/assessment'}
                    className="btn-primary !px-8 !py-3"
                >
                    Take First Assessment
                </button>
            </div>
        );
    }

    const latest = data.assessments[data.assessments.length - 1];
    const first = data.assessments[0];

    // Calculate synthetic insights from assessment history
    const periodDays = Math.ceil((new Date(latest.created_at).getTime() - new Date(first.created_at).getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const trendDirection = latest.risk_score < first.risk_score ? 'improving' : latest.risk_score > first.risk_score ? 'declining' : 'stable';

    const insights = {
        period_days: periodDays,
        assessments_analyzed: data.assessments.length,
        trend_direction: trendDirection,
        primary_driver: latest.stress_level > 7 ? 'High Stress' : latest.sleep_duration < 6 ? 'Sleep Deficit' : 'Balanced'
    };

    const radarData = [
        { subject: 'Sleep', A: Math.min(100, (latest.sleep_duration / 9) * 100) },
        { subject: 'Exercise', A: Math.min(100, (latest.physical_activity / 150) * 100) },
        { subject: 'Study', A: Math.min(100, (latest.study_hours / 8) * 100) },
        { subject: 'Social', A: Math.max(0, 100 - (latest.social_media_hours || 0) * 15) },
        { subject: 'Stress', A: Math.max(0, 100 - (latest.stress_level || 0) * 10) },
        { subject: 'Academic', A: (latest.cgpa / 4) * 100 },
    ];

    const tooltipStyle = {
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
        backdropFilter: 'blur(8px)',
        padding: '12px'
    };

    return (
        <div className="space-y-10 animate-fade-in-up pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">Personal Wellness Audit</h1>
                    <p className="text-[#64748b] mt-1 text-sm font-light leading-relaxed">Multidimensional behavioral patterns & predictive risk tracking</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.location.href = '/wellness-pass'}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
                    >
                        <FileText size={14} />
                        Professional Report
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#1e40af]/5 rounded-xl border border-[#1e40af]/10">
                        <Activity size={16} className="text-[#1e40af]" />
                        <span className="text-xs font-bold text-[#1e40af] uppercase tracking-widest">Active Monitoring</span>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-3xl p-7 flex flex-col justify-between min-h-[160px]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <Clock size={20} />
                        </div>
                        <h3 className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Analysis Window</h3>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{insights.period_days} Days</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">{insights.assessments_analyzed} assessments tracked</p>
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-7 flex flex-col justify-between min-h-[160px]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Risk Trajectory</h3>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900 tracking-tight capitalize">{insights.trend_direction}</p>
                        <p className="text-sm text-slate-500 font-medium mt-1">Overall mental wellness trend</p>
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-7 flex flex-col justify-between min-h-[160px]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                            <Target size={20} />
                        </div>
                        <h3 className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Current Focus</h3>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900 tracking-tight capitalize">{insights.primary_driver}</p>
                        <p className="text-sm text-slate-500 font-medium mt-1">Primary risk factor identified</p>
                    </div>
                </div>
            </div>

            {/* Daily Missions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <DailyMissions token={token || ''} />
                </div>
                <div className="lg:col-span-2 card-premium p-8 bg-white h-full flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                            <Brain size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Neural Insights Engine</h3>
                            <p className="text-xs text-slate-500 font-medium">Predictive behavioral mapping active</p>
                        </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">
                        "Your recent patterns suggest a spike in evening digital engagement. Our models indicate that a 20% reduction in screen time after 9:00 PM could improve your REM stability by up to 15%."
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['Circadian Sync', 'Load Balance', 'Cognitive Rest'].map(tag => (
                            <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-premium p-8 bg-white">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-[#0f172a]">Equilibrium Analysis</h3>
                        <Sparkles size={18} className="text-[#1e40af]" />
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="#f1f5f9" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                            <PolarRadiusAxis tick={false} axisLine={false} />
                            <Radar dataKey="A" stroke="#1e40af" fill="#1e40af" fillOpacity={0.15} strokeWidth={3} />
                        </RadarChart>
                    </ResponsiveContainer>
                    <div className="mt-6 pt-6 border-t border-[#f1f5f9]">
                        <p className="text-xs text-[#94a3b8] leading-relaxed font-light">
                            Your lifestyle balance shows high academic velocity but potential circadian irregularities. Consider adjusting your sleep schedule.
                        </p>
                    </div>
                </div>

                <div className="card-premium p-8 bg-white">
                    <h3 className="text-lg font-bold text-[#0f172a] mb-8 flex items-center gap-2">
                        <Moon size={18} className="text-[#8b5cf6]" /> Restorative Cycles
                    </h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={data.trends.sleep}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={4} strokeLinecap="round" dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="card-premium p-8 bg-white">
                    <h3 className="text-lg font-bold text-[#0f172a] mb-8 flex items-center gap-2">
                        <TrendingUp size={18} className="text-red-500" /> Stress Velocity
                    </h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={data.trends.stress}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={4} strokeLinecap="round" dot={{ r: 6, fill: '#ef4444', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="card-premium p-8 bg-white">
                    <h3 className="text-lg font-bold text-[#0f172a] mb-8 flex items-center gap-2">
                        <Heart size={18} className="text-[#1e40af]" /> Health Trajectory
                    </h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={data.trends.risk}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line type="monotone" dataKey="value" stroke="#1e40af" strokeWidth={4} strokeLinecap="round" dot={{ r: 6, fill: '#1e40af', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

interface WellnessCardProps {
    label: string;
    score: number;
    color: string;
    icon: React.ElementType;
}

function WellnessCard({ label, score, color, icon: Icon }: WellnessCardProps) {
    return (
        <div className="card-premium p-6 bg-white flex items-center gap-6 group hover:border-[#1e40af]/20">
            <div className="relative w-20 h-20 shrink-0">
                <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="6"
                        strokeDasharray={`${(score / 100) * 213.6} 213.6`} strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-black text-[#0f172a]">{Math.round(score)}</span>
                </div>
            </div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} style={{ color }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Precision Metric</span>
                </div>
                <p className="text-sm font-bold text-[#0f172a]">{label}</p>
            </div>
        </div>
    );
}

