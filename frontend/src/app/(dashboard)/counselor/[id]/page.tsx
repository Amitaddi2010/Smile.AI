'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { dashboardAPI } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Activity, FileText, Brain, HeartPulse, ShieldAlert, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDetailView() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token || !params.id) return;
        dashboardAPI.getStudentDetails(Number(params.id), token)
            .then(setData)
            .catch((e) => {
                console.error(e);
                alert('Failed to load student details');
                router.push('/counselor');
            })
            .finally(() => setLoading(false));
    }, [token, params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!data || !data.student) return null;

    const { student, assessments, journals } = data;
    const latestAssessment = assessments[0];

    const chartData = [...assessments].reverse().map((a: any) => ({
        date: new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        risk: a.risk_score
    }));

    return (
        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
            <button
                onClick={() => router.push('/counselor')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm uppercase tracking-widest transition-colors"
            >
                <ArrowLeft size={16} /> Back to Roster
            </button>

            <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center text-2xl font-black shadow-xl shadow-slate-900/10">
                        {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{student.name}</h1>
                        <p className="text-slate-500 mt-1 font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                            {student.email}
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="text-blue-500" size={24} />
                            <h2 className="text-xl font-black text-slate-900">Risk Trend</h2>
                        </div>
                        {chartData.length > 0 ? (
                            <div className="h-[300px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1E293B', borderRadius: '1rem', border: 'none', color: '#fff', fontWeight: 'bold' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="risk"
                                            stroke="#3B82F6"
                                            strokeWidth={4}
                                            dot={{ r: 6, fill: '#3B82F6', strokeWidth: 3, stroke: '#fff' }}
                                            activeDot={{ r: 8, fill: '#2563EB', strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-slate-400 font-bold">No assessment data yet.</div>
                        )}
                    </div>

                    <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60">
                        <div className="flex items-center gap-3 mb-6">
                            <FileText className="text-purple-500" size={24} />
                            <h2 className="text-xl font-black text-slate-900">Recent Journal Insights</h2>
                        </div>
                        {journals.length > 0 ? (
                            <div className="space-y-4">
                                {journals.slice(0, 5).map((j: any) => (
                                    <div key={j.id} className="p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Calendar size={14} />
                                                {new Date(j.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {j.is_crisis && (
                                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                                                    <ShieldAlert size={14} /> Crisis Alert
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-700 italic text-sm mb-4 leading-relaxed line-clamp-2">"{j.text_content}"</p>
                                        <div className="flex gap-3">
                                            <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest">
                                                Risk Level: <span className={j.risk_level === 'high' ? 'text-red-500' : j.risk_level === 'moderate' ? 'text-yellow-500' : 'text-green-500'}>{j.risk_level}</span>
                                            </span>
                                            {j.smile_risk_index !== null && (
                                                <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold uppercase tracking-widest">
                                                    Index: {j.smile_risk_index.toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-slate-400 font-bold">No journal entries recorded.</div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Current Status</h3>
                        {latestAssessment ? (
                            <div className="space-y-5">
                                <div className={`p-6 rounded-[1.5rem] ${latestAssessment.risk_level === 'high' ? 'bg-red-50 border border-red-100' :
                                        latestAssessment.risk_level === 'moderate' ? 'bg-yellow-50 border border-yellow-100' :
                                            'bg-green-50 border border-green-100'
                                    }`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <HeartPulse size={24} className={
                                            latestAssessment.risk_level === 'high' ? 'text-red-500' :
                                                latestAssessment.risk_level === 'moderate' ? 'text-yellow-500' :
                                                    'text-green-500'
                                        } />
                                        <span className={`text-sm font-black uppercase tracking-widest ${latestAssessment.risk_level === 'high' ? 'text-red-700' :
                                                latestAssessment.risk_level === 'moderate' ? 'text-yellow-700' :
                                                    'text-green-700'
                                            }`}>
                                            {latestAssessment.risk_level} Risk
                                        </span>
                                    </div>
                                    <p className={`text-5xl font-black ${latestAssessment.risk_level === 'high' ? 'text-red-600' :
                                            latestAssessment.risk_level === 'moderate' ? 'text-yellow-600' :
                                                'text-green-600'
                                        }`}>
                                        {latestAssessment.risk_score?.toFixed(1) || '0.0'}
                                    </p>
                                    <p className="mt-3 text-xs font-bold text-slate-500">
                                        Last assessed: {new Date(latestAssessment.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                        <span className="text-sm font-semibold text-slate-500">Sleep</span>
                                        <span className="text-sm font-black text-slate-900">{latestAssessment.sleep_duration}h</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                        <span className="text-sm font-semibold text-slate-500">Stress</span>
                                        <span className="text-sm font-black text-slate-900">{latestAssessment.stress_level}/10</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm font-semibold text-slate-500">Exercise</span>
                                        <span className="text-sm font-black text-slate-900">{latestAssessment.physical_activity}m</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-400 font-bold text-center py-4">No assessments taken.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
