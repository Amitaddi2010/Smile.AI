'use client';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState, useRef } from 'react';
import { Activity, Users, AlertTriangle, TrendingUp, BarChart3, Clock, Brain, Sparkles, ShieldCheck, RefreshCcw, ArrowRight, Bot, Zap, Flame, Target, Heart, Calendar, CheckCircle2 } from 'lucide-react';
import { dashboardAPI, predictAPI, aiAPI } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import WellnessTree from '@/components/WellnessTree';
import DailyMissions from '@/components/DailyMissions';

const RISK_COLORS = { low: '#10b981', moderate: '#f59e0b', high: '#ef4444' };

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
}

/* ── Animated Counter Component ── */
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (v) => Math.round(v));
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const controls = animate(count, value, {
            duration: 1.5,
            ease: [0.25, 0.46, 0.45, 0.94],
        });
        const unsubscribe = rounded.on('change', (v) => setDisplay(v));
        return () => { controls.stop(); unsubscribe(); };
    }, [value, count, rounded]);

    return <span className={className}>{display}</span>;
}

/* ── Stagger container variants ── */
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export default function DashboardPage() {
    const { user, token, refreshUser } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [wellness, setWellness] = useState<any>(null);
    const [insights, setInsights] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingInsights, setLoadingInsights] = useState(false);

    useEffect(() => {
        const handleLevelUp = () => refreshUser();
        window.addEventListener('smile_level_up', handleLevelUp);
        return () => window.removeEventListener('smile_level_up', handleLevelUp);
    }, [refreshUser]);

    useEffect(() => {
        if (!token) return;
        
        const loadCoreData = async () => {
            try {
                const [statsData, historyData, wellnessData] = await Promise.all([
                    dashboardAPI.getStats(token).catch(() => null),
                    predictAPI.getHistory(token).catch(() => []),
                    dashboardAPI.getMyWellness(token).catch(() => null),
                ]);
                setStats(statsData);
                setHistory(historyData);
                setWellness(wellnessData);
                setLoading(false);
            } catch (e) { 
                setLoading(false);
            }
        };

        const loadAIInsights = async () => {
            setLoadingInsights(true);
            try {
                const res = await aiAPI.getInsights(token);
                if (res && res.insights) setInsights(res.insights);
                else setInsights("Strategic telemetry confirmed. Complete additional assessments to unveil deeper synaptic correlations.");
            } catch (e) {
                setInsights("Neural sync engine is temporarily offline. Clinical resilience data is still active.");
            } finally {
                setLoadingInsights(false);
            }
        };

        refreshUser();
        loadCoreData();
        loadAIInsights();
    }, [token, refreshUser]);

    const latestAssessment = history[0];
    const riskScore = latestAssessment?.risk_score ?? 0;
    const riskLevel = latestAssessment?.risk_level ?? 'none';

    const riskDistData = stats?.risk_distribution
        ? Object.entries(stats.risk_distribution).map(([name, value]) => ({ name, value }))
        : [{ name: 'low', value: 0 }, { name: 'moderate', value: 0 }, { name: 'high', value: 0 }];

    const activeHistory = user?.role === 'student' ? history : (stats?.recent_assessments || []);
    const trendData = activeHistory.slice(0, 10).reverse().map((a: any, i: number) => ({ name: `#${i + 1}`, score: a.risk_score }));

    if (!user) return null;

    return (
        <div className="min-h-screen pb-20 space-y-10">
            {/* Super Header */}
            <header className="relative py-8">
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 border border-blue-200 text-blue-600 text-[11px] font-bold uppercase tracking-wider mb-5">
                            <Activity size={14} /> System Status: Optimal
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700">{user?.name}</span>
                        </h1>
                        <p className="text-slate-500 mt-3 text-lg font-medium max-w-lg leading-relaxed">
                            Your SMILE-AI engine is actively monitoring your clinical wellness profile.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4"
                    >
                        <div className="h-20 w-px bg-slate-200 hidden md:block" />
                        <div className="flex flex-col items-end">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Wellness Level</span>
                            <div className="flex items-center gap-4">
                                <span className="text-5xl font-extrabold text-slate-900">{user?.wellness_level || 1}</span>
                                <div className="p-3 rounded-2xl bg-amber-50 text-amber-500 shadow-sm border border-amber-100">
                                    <Flame size={28} className="fill-amber-500" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            {user.role === 'student' ? (
                <>
                    {/* ── Quick Stats Ribbon ── */}
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        <motion.div variants={staggerItem}>
                            <QuickStatPill
                                icon={Activity}
                                label="Risk Score"
                                value={loading ? '—' : riskScore.toString()}
                                color={riskLevel === 'low' ? 'emerald' : riskLevel === 'moderate' ? 'amber' : 'rose'}
                            />
                        </motion.div>
                        <motion.div variants={staggerItem}>
                            <QuickStatPill
                                icon={Flame}
                                label="Current Level"
                                value={(user?.wellness_level || 1).toString()}
                                color="amber"
                            />
                        </motion.div>
                        <motion.div variants={staggerItem}>
                            <QuickStatPill
                                icon={Calendar}
                                label="Assessments"
                                value={history.length.toString()}
                                color="blue"
                            />
                        </motion.div>
                        <motion.div variants={staggerItem}>
                            <QuickStatPill
                                icon={CheckCircle2}
                                label="XP Earned"
                                value={((user?.wellness_points || 0)).toString()}
                                color="violet"
                            />
                        </motion.div>
                    </motion.div>

                    {/* ── Main Grid (5 + 7) ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Primary Control Column */}
                        <aside className="lg:col-span-5 space-y-8 order-2 lg:order-1">
                            {/* Vital Stats Card */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                                    <Activity size={140} />
                                </div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Clinical Vitals</h3>
                                
                                <div className="space-y-10 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Risk Index</p>
                                            <div className="flex items-baseline gap-3">
                                                {loading ? (
                                                    <div className="flex items-baseline gap-3">
                                                        <div className="h-14 w-20 bg-slate-100 rounded-2xl animate-pulse" />
                                                        <div className="h-6 w-16 bg-slate-100 rounded-lg animate-pulse" />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <AnimatedNumber value={riskScore} className="text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tighter leading-none" />
                                                        <span className={`text-[11px] font-bold uppercase px-3 py-1 rounded-lg border ${
                                                            riskLevel === 'low' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            riskLevel === 'moderate' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                            'bg-red-50 text-red-600 border-red-100'
                                                        }`}>
                                                            {riskLevel}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-18 h-18 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 p-4">
                                            <Activity size={28} className={riskLevel === 'high' ? 'text-red-500 animate-bounce' : 'text-blue-500'} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            <span>Progression to Lvl { (user?.wellness_level || 1) + 1 }</span>
                                            <span className="text-slate-900 font-extrabold">{ (user?.wellness_points || 0) % 100 } / 100 XP</span>
                                        </div>
                                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100/50">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(user?.wellness_points || 0) % 100}%` }}
                                                transition={{ duration: 1.5, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Interactive Wellness Tree with ambient glow */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="relative group"
                            >
                                {/* Ambient glow ring */}
                                <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400/20 via-blue-400/10 to-purple-400/15 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl p-4 border border-white shadow-xl">
                                    <WellnessTree level={user?.wellness_level || 1} points={user?.wellness_points || 0} />
                                </div>
                            </motion.div>

                            {/* Quick Actions - unique gradient per card */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="grid grid-cols-1 gap-4"
                            >
                                <QuickActionCard 
                                    icon={Bot} 
                                    title="Talk to SMILE" 
                                    desc="Natural AI Chat" 
                                    gradient="from-slate-900 via-slate-800 to-slate-900" 
                                    glowColor="rgba(30,41,59,0.3)"
                                    href="/talk" 
                                />
                                <QuickActionCard 
                                    icon={Wind} 
                                    title="Zen Zone" 
                                    desc="Breathing Lab" 
                                    gradient="from-indigo-600 via-violet-600 to-purple-600" 
                                    glowColor="rgba(99,102,241,0.3)"
                                    href="/zen" 
                                />
                            </motion.div>
                        </aside>

                        {/* Content Intelligence Column */}
                        <main className="lg:col-span-7 space-y-8 order-1 lg:order-2">
                            {/* Diagnostic Hub - Reduced padding & border-radius */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="bg-slate-900 rounded-2xl p-6 md:p-7 text-white relative overflow-hidden group shadow-2xl shadow-blue-900/30 border border-white/5"
                            >
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />
                                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 opacity-40" />
                                
                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 backdrop-blur-2xl flex items-center justify-center border border-white/10 shadow-lg group-hover:border-blue-500/50 transition-all duration-700">
                                                <Brain size={22} className="text-blue-400 group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h2 className="text-lg font-extrabold tracking-tight">Diagnostic Hub</h2>
                                                    <div className="flex gap-1">
                                                        <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                                                        <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse delay-75" />
                                                        <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse delay-150" />
                                                    </div>
                                                </div>
                                                <p className="text-blue-300/40 text-[10px] font-bold uppercase tracking-[0.2em]">Neural Synthesis Active</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => window.location.href = '/insights'}
                                            className="h-10 px-5 rounded-lg bg-white text-slate-900 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-50 transition-all flex items-center gap-1.5 active:scale-95 shadow-lg shadow-white/10"
                                        >
                                            Neural Map <ArrowRight size={12} />
                                        </button>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur-3xl rounded-xl p-5 md:p-6 border border-white/10 relative">
                                        <div className="absolute -top-2.5 -left-2 px-3 py-1 bg-blue-600 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-lg">XAI Breakdown</div>
                                        
                                        <AnimatePresence mode="wait">
                                            {loadingInsights ? (
                                                <motion.div 
                                                    key="loading"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex flex-col md:flex-row gap-8 items-center py-2"
                                                >
                                                    {/* Dynamic Neural Map Visualization */}
                                                    <div className="w-full md:w-2/5 relative aspect-square max-w-[180px]">
                                                        <svg viewBox="0 0 100 100" className="w-full h-full opacity-40">
                                                            <motion.circle 
                                                                cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" 
                                                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, repeat: Infinity }} 
                                                            />
                                                            {[...Array(6)].map((_, i) => (
                                                                <motion.line 
                                                                    key={i} x1="50" y1="50" 
                                                                    x2={50 + 35 * Math.cos(i * Math.PI / 3)} 
                                                                    y2={50 + 35 * Math.sin(i * Math.PI / 3)} 
                                                                    stroke="currentColor" strokeWidth="0.2"
                                                                    animate={{ strokeWidth: [0.2, 1, 0.2], opacity: [0.2, 0.5, 0.2] }}
                                                                    transition={{ delay: i * 0.2, duration: 2, repeat: Infinity }}
                                                                />
                                                            ))}
                                                            <circle cx="50" cy="50" r="2" fill="currentColor" className="text-blue-500" />
                                                        </svg>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 animate-pulse">Syncing...</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 space-y-5">
                                                        <div className="space-y-3">
                                                            <div className="h-4 bg-white/10 rounded-full w-4/5 animate-pulse" />
                                                            <div className="h-4 bg-white/10 rounded-full w-2/3 animate-pulse" />
                                                            <div className="h-4 bg-white/10 rounded-full w-1/2 animate-pulse" />
                                                        </div>
                                                        <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 w-fit">
                                                            <RefreshCcw size={14} className="animate-spin text-blue-400" />
                                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Groq Neural Pipeline Initializing</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ) : insights ? (
                                                <motion.div 
                                                    key="content"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="space-y-5"
                                                >
                                                    <div className="flex gap-4">
                                                        <div className="w-0.5 bg-gradient-to-b from-blue-500 to-transparent rounded-full shrink-0" />
                                                        <p className="text-sm text-blue-50/90 leading-relaxed font-semibold italic">
                                                            "{insights.includes('\n\n') ? insights.split('\n\n')[0].replace(/\*/g, '').trim() : insights.replace(/\*/g, '').trim()}"
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/30 transition-all duration-500 group/item">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                                                                        <AlertTriangle size={13} />
                                                                    </div>
                                                                     <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Risk Vectors</span>
                                                                </div>
                                                                <div className="w-10 h-1.5 bg-rose-500/20 rounded-full overflow-hidden">
                                                                    <div className="w-2/3 h-full bg-rose-500" />
                                                                </div>
                                                            </div>
                                                            <NarrativeList text={insights} type="red" />
                                                        </div>

                                                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-500 group/item">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                                        <ShieldCheck size={13} />
                                                                    </div>
                                                                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Resilience Armor</span>
                                                                </div>
                                                                <div className="w-10 h-1.5 bg-emerald-500/20 rounded-full overflow-hidden">
                                                                    <div className="w-4/5 h-full bg-emerald-500" />
                                                                </div>
                                                            </div>
                                                            <NarrativeList text={insights} type="green" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div 
                                                    key="empty"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-center py-8 opacity-30"
                                                >
                                                    <RefreshCcw size={40} className="mx-auto mb-4 animate-spin-slow text-blue-400" />
                                                    <p className="text-sm font-black uppercase tracking-widest">Calibrating Telemetry...</p>
                                                    <p className="text-xs mt-2 font-medium">Please ensure clinical audits are up to date.</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Daily Missions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <DailyMissions token={token || ''} />
                            </motion.div>
                        </main>
                    </div>
                </>
            ) : (
                <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-10"
                >
                    <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={Users} label="Managed Users" value={(stats?.total_users || 0).toString()} color="#8b5cf6" />
                        <StatCard icon={AlertTriangle} label="Avg Clinical Risk" value={(stats?.avg_risk_score || 0).toString()} color="#f59e0b" />
                        <StatCard icon={Activity} label="Total Assessments" value={(stats?.total_assessments || 0).toString()} color="#3b82f6" />
                        <StatCard icon={TrendingUp} label="Engine Capacity" value="99%" color="#10b981" />
                    </motion.div>

                    <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
                            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
                                <TrendingUp size={22} className="text-blue-600" /> Population Trend
                            </h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={4} fill="url(#riskGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
                            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
                                <BarChart3 size={22} className="text-indigo-600" /> Risk Distribution
                            </h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie 
                                            data={riskDistData} 
                                            cx="50%" 
                                            cy="50%" 
                                            innerRadius={80} 
                                            outerRadius={110} 
                                            paddingAngle={8} 
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {riskDistData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}

/* ── Quick Stats Pill (New) ── */
function QuickStatPill({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
    const colorMap: Record<string, string> = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        violet: 'bg-violet-50 text-violet-600 border-violet-100',
    };
    const iconColorMap: Record<string, string> = {
        emerald: 'bg-emerald-100 text-emerald-600',
        amber: 'bg-amber-100 text-amber-600',
        rose: 'bg-rose-100 text-rose-600',
        blue: 'bg-blue-100 text-blue-600',
        violet: 'bg-violet-100 text-violet-600',
    };

    return (
        <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColorMap[color] || iconColorMap.blue} transition-transform group-hover:scale-110`}>
                <Icon size={18} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{label}</p>
                <p className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">{value}</p>
            </div>
        </div>
    );
}

function CustomTooltip({ active, payload }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-white/10 shadow-2xl backdrop-blur-xl">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-1">Risk Score</p>
                <p className="text-2xl font-extrabold">{payload[0].value}</p>
            </div>
        );
    }
    return null;
}

function NarrativeList({ text, type }: { text: string; type: 'red' | 'green' }) {
    const clean = text.replace(/\*/g, '').trim();
    const pattern = type === 'red' ? /RED FLAGS[:\s]*([\s\S]*?)(?=GREEN FLAGS|STRATEGIC|RECOMMENDATIONS|$)/i : /GREEN FLAGS[:\s]*([\s\S]*?)(?=STRATEGIC|RED FLAGS|RECOMMENDATIONS|$)/i;
    const match = clean.match(pattern);
    const items = match ? match[1].trim().split('\n').filter(l => l.includes('-')) : [type === 'red' ? '- No critical risks detected' : '- Resilience factors stable'];

    return (
        <ul className="space-y-2">
            {items.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-xs font-semibold text-blue-50/80 leading-relaxed group">
                    <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${type === 'red' ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'} group-hover:scale-150 transition-transform`} />
                    {item.replace(/^- /, '')}
                </li>
            ))}
        </ul>
    );
}

function QuickActionCard({ icon: Icon, title, desc, gradient, glowColor, href }: any) {
    return (
        <button 
            onClick={() => window.location.href = href}
            className={`bg-gradient-to-r ${gradient} text-white p-7 rounded-2xl text-left relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-xl`}
            style={{ boxShadow: `0 20px 40px -12px ${glowColor}` }}
        >
            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-700">
                <Icon size={100} />
            </div>
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <h4 className="text-lg font-extrabold mb-0.5 flex items-center gap-2">
                        {title} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </h4>
                    <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider">{desc}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
                    <Icon size={22} />
                </div>
            </div>
        </button>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
    return (
        <div className="bg-white rounded-2xl p-7 border border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 blur-[50px] -z-10 group-hover:bg-slate-100 transition-colors" />
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${color}10`, color: color }}>
                    <Icon size={26} strokeWidth={2.5} />
                </div>
                <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
                </div>
            </div>
        </div>
    );
}

function Wind(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
            <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
            <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
        </svg>
    );
}
