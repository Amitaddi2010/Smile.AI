'use client';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/lib/api';
import { Users, AlertTriangle, Shield, Search } from 'lucide-react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CounselorPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!token) return;
        dashboardAPI.getStudents(token, filter || undefined).then(setStudents).catch(() => { }).finally(() => setLoading(false));
    }, [token, filter]);

    const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));
    const highRisk = students.filter(s => s.latest_risk_level === 'high').length;
    const modRisk = students.filter(s => s.latest_risk_level === 'moderate').length;

    return (
        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
            <header className="mb-4 pt-2">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Users className="text-blue-600" size={32} />
                    Student Roster
                </h1>
                <p className="text-slate-500 mt-2 text-sm sm:text-base font-medium">Monitor your assigned students' mental health risk levels and review AI Insights.</p>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-7 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                        <Users size={24} />
                    </div>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">{students.length}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Total Students</p>
                </div>
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-7 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                        <AlertTriangle size={24} />
                    </div>
                    <p className="text-4xl font-black text-red-600 tracking-tighter">{highRisk}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">High Risk</p>
                </div>
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-7 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center mb-4">
                        <AlertTriangle size={24} />
                    </div>
                    <p className="text-4xl font-black text-yellow-600 tracking-tighter">{modRisk}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Moderate Risk</p>
                </div>
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-7 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                        <Shield size={24} />
                    </div>
                    <p className="text-4xl font-black text-green-600 tracking-tighter">{students.length - highRisk - modRisk}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Low Risk</p>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-white/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search students..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/50 border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold shadow-inner"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 custom-scrollbar shrink-0">
                        {['', 'high', 'moderate', 'low'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all whitespace-nowrap ${filter === f
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20'
                                        : 'bg-white/50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-white'
                                    }`}
                            >
                                {f || 'All Students'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-white/40 backdrop-blur-3xl border-b border-white">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Student</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Risk Level</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Risk Score</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Assessments</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Last Activity</th>
                                <th className="px-8 py-5 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/60 bg-white/30">
                            {filtered.map(s => (
                                <tr key={s.id} onClick={() => router.push(`/counselor/${s.id}`)} className="hover:bg-white/80 transition-all duration-300 cursor-pointer group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-[1.25rem] bg-slate-900 flex items-center justify-center text-lg font-black text-white shadow-xl shadow-slate-900/10">
                                                {s.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-slate-900 font-extrabold text-base group-hover:text-blue-600 transition-colors">{s.name}</p>
                                                <p className="text-slate-500 text-sm font-semibold">{s.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${s.latest_risk_level === 'low' ? 'bg-green-100 text-green-700 ring-1 ring-green-200' :
                                                s.latest_risk_level === 'moderate' ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200' :
                                                    s.latest_risk_level === 'high' ? 'bg-red-100 text-red-700 ring-1 ring-red-200' :
                                                        'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                                            }`}>
                                            {s.latest_risk_level || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-base text-slate-900 font-black">
                                        {s.latest_risk_score?.toFixed(1) ?? '—'}
                                    </td>
                                    <td className="px-8 py-6 text-sm text-slate-500 font-bold">
                                        {s.assessment_count} <span className="text-slate-400 font-medium">recorded</span>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-slate-500 font-bold">
                                        {s.last_assessment ? new Date(s.last_assessment).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Link href={`/counselor/${s.id}`} className="px-6 py-2.5 bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-sm">
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-100/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <Search size={24} />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 mb-1">No students found</h3>
                                        <p className="text-slate-500 font-medium">Try adjusting your search query or filters.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
