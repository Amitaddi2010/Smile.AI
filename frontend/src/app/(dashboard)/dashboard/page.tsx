'use client';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { Activity, Users, AlertTriangle, TrendingUp, BarChart3, Clock, Brain, Sparkles, ShieldCheck, RefreshCcw, ArrowRight } from 'lucide-react';
import { dashboardAPI, predictAPI, aiAPI } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const RISK_COLORS = { low: '#22c55e', moderate: '#f59e0b', high: '#ef4444' };

export default function DashboardPage() {
    const { user, token } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [wellness, setWellness] = useState<any>(null);
    const [insights, setInsights] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingInsights, setLoadingInsights] = useState(false);

    useEffect(() => {
        if (!token) return;
        const loadData = async () => {
            try {
                const [statsData, historyData, wellnessData] = await Promise.all([
                    dashboardAPI.getStats(token).catch(() => null),
                    predictAPI.getHistory(token).catch(() => []),
                    dashboardAPI.getMyWellness(token).catch(() => null),
                ]);
                setStats(statsData);
                setHistory(historyData);
                setWellness(wellnessData);

                // Fetch AI Insights if not already loading
                setLoadingInsights(true);
                aiAPI.getInsights(token)
                    .then(res => setInsights(res.insights))
                    .catch(() => null)
                    .finally(() => setLoadingInsights(false));
            } catch (e) { }
            setLoading(false);
        };
        loadData();
    }, [token]);

    const latestAssessment = history[0];
    const riskScore = latestAssessment?.risk_score ?? 0;
    const riskLevel = latestAssessment?.risk_level ?? 'none';

    const riskDistData = stats?.risk_distribution
        ? Object.entries(stats.risk_distribution).map(([name, value]) => ({ name, value }))
        : [{ name: 'low', value: 0 }, { name: 'moderate', value: 0 }, { name: 'high', value: 0 }];

    const activeHistory = user?.role === 'student' ? history : (stats?.recent_assessments || []);
    const trendData = activeHistory.slice(0, 10).reverse().map((a: any, i: number) => ({ name: `#${i + 1}`, score: a.risk_score }));

    return (
        <div className="space-y-8 relative z-10">
            <div className="pt-2">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    Welcome back, <span className="text-blue-600 drop-shadow-sm">{user?.name}</span>.
                </h1>
                <p className="text-slate-500 mt-2 text-sm sm:text-base font-medium">Here&apos;s your mental wellness overview</p>
            </div>

            {/* Intelligence Command Center & Role Specific Dashboard Headers */}
            {user?.role === 'student' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Primary Stats Column */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <StatCard
                                icon={Activity}
                                label="Risk Score"
                                value={riskScore.toString()}
                                color={RISK_COLORS[riskLevel as keyof typeof RISK_COLORS] || '#64748b'}
                                trend={riskLevel.toUpperCase()}
                                trendColor={RISK_COLORS[riskLevel as keyof typeof RISK_COLORS] || '#64748b'}
                            />
                            <StatCard
                                icon={TrendingUp}
                                label="Assessments"
                                value={(history.length || stats?.total_assessments || 0).toString()}
                                color="#3b82f6"
                                trend="COMPLETED"
                                trendColor="#3b82f6"
                            />
                        </div>



                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/10 group">
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 blur-[50px] group-hover:bg-blue-500/20 transition-all duration-700" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <ShieldCheck size={20} className="text-blue-400" /> Secure Analysis
                                    </h3>
                                    <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-[200px]">Behavioral telemetry is end-to-end encrypted with LLaMA 3.1 intelligence.</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/10">
                                    <Activity size={20} className="animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Analysis Diagnostic Hub */}
                    <div className="lg:col-span-7 h-full">
                        <div className="h-full bg-white/40 backdrop-blur-3xl rounded-[3rem] p-10 border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] relative overflow-hidden group flex flex-col justify-between">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-1000 rotate-12 group-hover:rotate-0">
                                <Brain size={160} className="text-[#1e40af]" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-[1.5rem] bg-white shadow-xl shadow-blue-500/5 flex items-center justify-center text-[#1e40af] border border-slate-50">
                                            <Sparkles size={24} className="animate-pulse text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Diagnostic Hub</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Clinical Profile</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {loadingInsights ? (
                                        <div className="space-y-6 animate-pulse">
                                            <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="h-40 bg-slate-50 rounded-[2rem]"></div>
                                                <div className="h-40 bg-slate-50 rounded-[2rem]"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {insights ? (() => {
                                                const clean = insights.replace(/\*/g, '').trim();
                                                const redMatch = clean.match(/RED FLAGS[:\s]*([\s\S]*?)(?=GREEN FLAGS|STRATEGIC|RECOMMENDATIONS|$)/i);
                                                const greenMatch = clean.match(/GREEN FLAGS[:\s]*([\s\S]*?)(?=STRATEGIC|RED FLAGS|RECOMMENDATIONS|$)/i);

                                                const redFlags = redMatch ? redMatch[1].trim().split('\n').filter(l => l.includes('-')) : [];
                                                const greenFlags = greenMatch ? greenMatch[1].trim().split('\n').filter(l => l.includes('-')) : [];

                                                if (redFlags.length === 0 && greenFlags.length === 0) {
                                                    return (
                                                        <div className="bg-white/50 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/60 shadow-sm leading-relaxed text-slate-600 font-medium text-sm">
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                                                    <Activity size={16} />
                                                                </div>
                                                                <span className="text-blue-600 font-bold uppercase tracking-widest text-[10px]">System Note</span>
                                                            </div>
                                                            <p className="text-slate-600 font-medium leading-relaxed">
                                                                {clean.split('\n\n')[0]}
                                                            </p>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div className="space-y-8">
                                                        <p className="text-slate-600 font-medium leading-relaxed border-l-4 border-blue-500/20 pl-6 text-sm italic py-1">
                                                            {clean.split('\n\n')[0].replace(/ANALYSIS OVERVIEW[:\s]*/i, '')}
                                                        </p>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {/* Red Flags Card */}
                                                            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white to-red-50/30 border border-red-100/50 shadow-sm hover:shadow-md hover:border-red-200/50 transition-all duration-500">
                                                                <div className="flex items-center gap-3 mb-5">
                                                                    <div className="w-8 h-8 rounded-xl bg-red-100/50 flex items-center justify-center text-red-500">
                                                                        <AlertTriangle size={16} />
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Risks & Triggers</span>
                                                                </div>
                                                                <ul className="space-y-3">
                                                                    {redFlags.map((f, i) => (
                                                                        <li key={i} className="flex gap-3 text-xs font-semibold text-slate-700 leading-snug group/item">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 shrink-0 group-hover/item:scale-125 transition-transform" />
                                                                            {f.replace(/^- /, '')}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>

                                                            {/* Green Flags Card */}
                                                            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white to-emerald-50/30 border border-emerald-100/50 shadow-sm hover:shadow-md hover:border-emerald-200/50 transition-all duration-500">
                                                                <div className="flex items-center gap-3 mb-5">
                                                                    <div className="w-8 h-8 rounded-xl bg-emerald-100/50 flex items-center justify-center text-emerald-500">
                                                                        <ShieldCheck size={16} />
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Protective Factors</span>
                                                                </div>
                                                                <ul className="space-y-3">
                                                                    {greenFlags.map((f, i) => (
                                                                        <li key={i} className="flex gap-3 text-xs font-semibold text-slate-700 leading-snug group/item">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0 group-hover/item:scale-125 transition-transform" />
                                                                            {f.replace(/^- /, '')}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })() : (
                                                <div className="text-center py-12 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                                                    <Brain size={48} className="mx-auto text-slate-300 mb-3 opacity-50" />
                                                    <p className="text-slate-400 font-bold text-sm">Waiting for Telemetry...</p>
                                                    <p className="text-slate-300 text-[10px] uppercase font-bold tracking-widest mt-1">Complete assessment to bridge the gap</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-70">
                                        Privacy Protected
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RefreshCcw size={14} className="text-blue-500 animate-spin-slow opacity-50" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-70">AI Auto-Sync</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => window.location.href = '/ai-insights'}
                                    className="group flex items-center gap-3 px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1e40af] transition-all hover:shadow-2xl hover:shadow-blue-500/20 active:scale-95"
                                >
                                    Intelligence Center <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Users} label="Total Managed Users" value={(stats?.total_users || 0).toString()} color="#8b5cf6" trend="ACTIVE DIRECTORY" trendColor="#8b5cf6" />
                    <StatCard icon={AlertTriangle} label="Avg Clinical Risk" value={(stats?.avg_risk_score || 0).toString()} color="#f59e0b" trend="SYSTEM METRIC" trendColor="#f59e0b" />
                    <StatCard icon={Activity} label="Total Assessments" value={(stats?.total_assessments || 0).toString()} color="#3b82f6" trend="COMPLETED" trendColor="#3b82f6" />
                    <StatCard icon={TrendingUp} label="LLaMA 3.1 Framework" value="Online" color="#10b981" trend="HEALTHY" trendColor="#10b981" />
                </div>
            )}

            <div className={`grid grid-cols-1 ${user?.role === 'student' ? '' : 'lg:grid-cols-2'} gap-6`}>
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-7 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-[#1e40af]" /> {user?.role === 'student' ? 'Risk Score Trend' : 'System Wide Trend'}
                    </h3>
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1e40af" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                <Area type="monotone" dataKey="score" stroke="#1e40af" fill="url(#riskGrad)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[220px] flex items-center justify-center text-[#94a3b8]">No assessments yet</div>
                    )}
                </div>

                {(user?.role === 'admin' || user?.role === 'counselor') && (
                    <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-7 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <BarChart3 size={18} className="text-[#1e40af]" /> System Risk Distribution
                        </h3>
                        {stats?.risk_distribution ? (
                            <>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={riskDistData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                            {riskDistData.map((entry: any) => (
                                                <Cell key={entry.name} fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS] || '#64748b'} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-6 mt-2">
                                    {Object.entries(RISK_COLORS).map(([level, color]) => (
                                        <div key={level} className="flex items-center gap-2 text-xs font-bold text-slate-500 capitalize">
                                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                                            {level}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-[220px] flex items-center justify-center text-[#94a3b8]">No system data available</div>
                        )}
                    </div>
                )}
            </div>

            {/* Wellness Scores */}
            {wellness && wellness.lifestyle_score > 0 && (
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-7 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60">
                    <h3 className="text-base font-semibold text-[#0f172a] mb-6">Wellness Scores</h3>
                    <div className="grid grid-cols-3 gap-6">
                        <ScoreCard label="Lifestyle" score={wellness.lifestyle_score} color="#1e40af" />
                        <ScoreCard label="Stress Mgmt" score={wellness.stress_score} color="#8b5cf6" />
                        <ScoreCard label="Digital Wellness" score={wellness.digital_score} color="#22c55e" />
                    </div>
                </div>
            )}

            {/* Recent Assessments Log */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-7 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Clock size={18} className="text-[#94a3b8]" /> {user?.role === 'student' ? 'Recent Assessments' : 'Recent Platform Telemetry'}
                </h3>
                {activeHistory.length > 0 ? (
                    <div className="space-y-3">
                        {activeHistory.slice(0, 5).map((a: any) => (
                            <div key={a.id} className="flex items-center justify-between py-4 px-5 rounded-2xl bg-slate-50 hover:bg-white border text-sm border-transparent hover:border-slate-100 hover:shadow-sm transition-all group">
                                <div>
                                    <p className="text-slate-900 font-bold flex items-center gap-2">{user?.role === 'student' ? `Assessment #${a.id}` : `Global Assessment #${a.id}`}</p>
                                    <p className="text-slate-500 text-xs font-medium mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-semibold text-slate-500">Score: <span className="font-black text-slate-900">{a.risk_score}</span></span>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${a.risk_level === 'low' ? 'bg-green-50 text-green-600' :
                                        a.risk_level === 'moderate' ? 'bg-yellow-50 text-yellow-600' :
                                            'bg-red-50 text-red-600'
                                        }`}>{a.risk_level}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-[#94a3b8]">
                        <Activity size={40} className="mx-auto mb-2 opacity-30" />
                        <p>{user?.role === 'student' ? 'No assessments yet. Take your first assessment to get started!' : 'No assessments tracked on the platform yet.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, trend, trendColor }: { icon: any; label: string; value: string; color: string; trend?: string, trendColor?: string }) {
    return (
        <div className="group relative overflow-hidden bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)]">
            {/* Gloss Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between mb-10 relative z-10">
                <div
                    className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-xl shadow-black/5"
                    style={{ backgroundColor: `${color}10`, color: color }}
                >
                    <Icon size={30} className="opacity-90" strokeWidth={2.5} />
                </div>
                {trend && (
                    <div className="px-4 py-2 rounded-2xl bg-white/80 border border-slate-100/50 shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap" style={{ color: trendColor || color }}>{trend}</span>
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <div className="flex items-baseline gap-1 mb-2">
                    <p className="text-6xl font-black text-slate-900 tracking-tighter drop-shadow-sm">{value}</p>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
                    <div className="h-[2px] bg-slate-100 flex-1 rounded-full opacity-30" />
                </div>
            </div>

            {/* Subtle Bottom Accent */}
            <div
                className="absolute bottom-0 left-0 right-0 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ backgroundColor: color }}
            />
        </div>
    );
}

function ScoreCard({ label, score, color }: { label: string; score: number; color: string }) {
    return (
        <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.05)]">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                    <circle cx="48" cy="48" r="40" fill="none" stroke={color} strokeWidth="8"
                        strokeDasharray={`${(score / 100) * 251.2} 251.2`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-slate-900 tracking-tighter">{Math.round(score)}</span>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        </div>
    );
}
