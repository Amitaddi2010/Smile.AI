'use client';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { 
    Users, AlertTriangle, TrendingUp, Search, Filter, 
    ArrowUpRight, Clock, ShieldAlert, CheckCircle, 
    MessageSquare, UserPlus, MoreHorizontal, LayoutDashboard,
    Activity, Heart, Bell
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';

export default function CounselorDashboard() {
    const { token, user } = useAuth();
    const router = useRouter();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState<any>(null);
    const [view, setView] = useState<'list' | 'heatmap'>('heatmap');

    useEffect(() => {
        if (!token) return;
        if (user?.role !== 'counselor' && user?.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        Promise.all([
            dashboardAPI.getStudents(token),
            dashboardAPI.getStats(token)
        ]).then(([studentsData, statsData]) => {
            setStudents(studentsData);
            setStats(statsData);
        })
        .finally(() => setLoading(false));
    }, [token, user, router]);

    if (loading) return <div className="p-12 text-center text-slate-400">Loading Clinical Triage...</div>;

    const highRisk = students.filter(s => s.latest_risk_level === 'high');
    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10 pb-20">
            {/* Header / Stats Triage Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Support <span className="text-blue-600">360</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Managing your assigned students with real-time risk triage.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2">
                        <Bell size={16} /> Broadcast Alert
                    </button>
                    <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2">
                        <UserPlus size={16} /> Add Student
                    </button>
                </div>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Assigned Students', val: students.length, icon: Users, color: 'blue' },
                    { label: 'Critical Triage', val: highRisk.length, icon: ShieldAlert, color: 'rose' },
                    { label: 'Avg Risk Index', val: `${stats?.avg_risk_score || 0}%`, icon: TrendingUp, color: 'indigo' },
                    { label: 'Pending Reviews', val: 5, icon: Clock, color: 'amber' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${s.color}-500/5 blur-2xl -mr-12 -mt-12 group-hover:bg-${s.color}-500/10 transition-all`} />
                        <div className={`w-12 h-12 rounded-2xl bg-${s.color}-50 flex items-center justify-center text-${s.color}-600 mb-6 group-hover:scale-110 transition-transform`}>
                            <s.icon size={22} />
                        </div>
                        <p className="text-3xl font-black text-slate-900 mb-1">{s.val}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* List Header & Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                 <div className="flex-1 relative w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search students by name, email, or department..."
                        className="w-full bg-slate-50 border-none rounded-2xl pl-16 pr-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                 </div>
                 <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                        <button 
                            onClick={() => setView('list')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            List
                        </button>
                        <button 
                            onClick={() => setView('heatmap')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'heatmap' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Heatmap
                        </button>
                    </div>
                    <button className="p-4 bg-slate-50 text-slate-500 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                        <Filter size={18} />
                    </button>
                 </div>
            </div>

            {/* Main Content Area */}
            <AnimatePresence mode="wait">
                {view === 'list' ? (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden"
                    >
                        <div className="overflow-x-auto text-[13px]">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Profile</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clinical Risk</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Last Assessment</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Activity Level</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredStudents.map((s) => (
                                        <tr key={s.id} className="hover:bg-blue-50/10 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{s.name}</p>
                                                        <p className="text-xs text-slate-400 font-medium">{s.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                                                    s.latest_risk_level === 'high' ? 'bg-red-50 border-red-100 text-red-600' :
                                                    s.latest_risk_level === 'moderate' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                                    'bg-green-50 border-green-100 text-green-600'
                                                }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                                        s.latest_risk_level === 'high' ? 'bg-red-500 animate-pulse' :
                                                        s.latest_risk_level === 'moderate' ? 'bg-amber-500' : 'bg-green-500'
                                                    }`} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{s.latest_risk_level || 'Pending'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700">{s.last_assessment ? new Date(s.last_assessment).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Data'}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.assessment_count} Assessments</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex gap-1.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className={`h-5 w-1.5 rounded-full transition-all duration-500 ${i < (s.assessment_count % 6) ? 'bg-blue-600 shadow-sm' : 'bg-slate-100'}`} />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => router.push(`/admin/student/${s.id}`)}
                                                        className="p-3 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95"
                                                    >
                                                        <ArrowUpRight size={18} />
                                                    </button>
                                                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 hover:bg-slate-200 transition-all active:scale-95">
                                                        <MessageSquare size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="heatmap"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-white rounded-[3rem] border border-slate-50 shadow-2xl p-12 relative overflow-hidden"
                    >
                         {/* Dynamic Background Gradient */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-amber-400 to-red-500 opacity-20" />
                        
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Triage Command Heatmap</h3>
                                <p className="text-xs font-medium text-slate-400 mt-1">High-density visual overview of student wellness telemetry</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 pulse" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Active</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-12 xl:grid-cols-15 gap-4 lg:gap-5">
                            {filteredStudents.map((s, i) => (
                                <motion.div
                                    key={s.id}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ 
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                        delay: i * 0.01 
                                    }}
                                    onClick={() => router.push(`/admin/student/${s.id}`)}
                                    className={`relative aspect-square rounded-[1.25rem] cursor-pointer group transition-all duration-500 hover:z-20 hover:scale-110 shadow-lg ${
                                        s.latest_risk_level === 'high' ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-red-500/20' :
                                        s.latest_risk_level === 'moderate' ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/10' :
                                        'bg-gradient-to-br from-emerald-400 to-green-500 shadow-green-500/10'
                                    }`}
                                >
                                    {/* High-Risk Aura */}
                                    {s.latest_risk_level === 'high' && (
                                        <div className="absolute -inset-1 rounded-[1.5rem] bg-red-500/20 animate-pulse blur-sm" />
                                    )}

                                    {/* Glass Overlay on Hover */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-[2px] rounded-[1.25rem] flex items-center justify-center">
                                         <ArrowUpRight size={20} className="text-white drop-shadow-md" />
                                    </div>

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-2 group-hover:translate-y-0 z-50">
                                        <div className="bg-slate-900/95 backdrop-blur-xl text-white p-5 rounded-3xl border border-white/10 shadow-3xl">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs uppercase">
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black truncate max-w-[120px]">{s.name}</p>
                                                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{s.latest_risk_level || 'Normal'}</p>
                                                </div>
                                            </div>
                                            <div className="h-[1px] bg-white/5 mb-3" />
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-blue-400">
                                                <span>Assessments: {s.assessment_count}</span>
                                                <span>View Full Profile</span>
                                            </div>
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 translate-y-1/2" />
                                        </div>
                                    </div>

                                    <div className="absolute inset-0 flex items-center justify-center">
                                         <span className="text-[10px] font-black text-white/30 uppercase tracking-tighter">{s.name.charAt(0)}{s.name.split(' ')[1]?.charAt(0)}</span>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Pad grid for aesthetic balance */}
                            {[...Array(Math.max(0, 60 - filteredStudents.length))].map((_, i) => (
                                <div key={`pad-${i}`} className="aspect-square rounded-[1.25rem] bg-slate-50/50 border border-slate-100/50 border-dashed transition-colors hover:border-slate-200" />
                            ))}
                        </div>

                        <div className="mt-16 pt-8 border-t border-slate-50 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
                            {[
                                { label: 'High Priority', color: 'bg-red-500' },
                                { label: 'Active Monitoring', color: 'bg-amber-400' },
                                { label: 'Healthy Baseline', color: 'bg-green-400' },
                                { label: 'Pending Initial Audit', color: 'bg-slate-100 border border-dashed border-slate-300' }
                            ].map((leg, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-3.5 h-3.5 rounded-lg ${leg.color}`} />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{leg.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            
            {/* Quick Actions / Triage Tools */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between">
                     <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6">AI Predictive Triage</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                                <span className="text-xs font-bold">Suggested Intervention</span>
                                <span className="text-[10px] font-black uppercase tracking-widest bg-rose-500 px-2 py-1 rounded">Urgent</span>
                            </div>
                            <p className="text-xs text-white/60 leading-relaxed italic">"Patient 4022 shows significant patterns of isolation in text sentiment logs. Recommend direct clinical outreach."</p>
                        </div>
                     </div>
                     <button className="w-full mt-8 py-4 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all">Review Suggestions</button>
                </div>
                
                <div className="md:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
                    <div className="flex items-center gap-3 mb-6">
                        <Heart size={20} className="text-blue-500" />
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Activity Logs</h4>
                    </div>
                    <div className="space-y-4">
                         {[
                             { user: "Alice Thompson", action: "Completed Wellness Pass", time: "12m ago", icon: CheckCircle, color: "green" },
                             { user: "John Doe", action: "Flagged Safe Space Post", time: "1h ago", icon: AlertTriangle, color: "amber" },
                             { user: "Sarah Jenkins", action: "Booked Priority Chat", time: "3h ago", icon: MessageSquare, color: "blue" },
                         ].map((activity, i) => (
                             <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                 <div className="flex items-center gap-4">
                                     <div className={`w-10 h-10 rounded-xl bg-${activity.color}-50 text-${activity.color}-600 flex items-center justify-center`}>
                                         <activity.icon size={18} />
                                     </div>
                                     <div>
                                         <span className="text-sm font-black text-slate-800">{activity.user}</span>
                                         <span className="text-xs text-slate-500 font-medium ml-2">— {activity.action}</span>
                                     </div>
                                 </div>
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activity.time}</span>
                             </div>
                         ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
