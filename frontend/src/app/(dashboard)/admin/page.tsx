'use client';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/lib/api';
import { BarChart3, Users, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function AdminPage() {
    const { token } = useAuth();
    const [stats, setStats] = useState<any>(null); // Keeping as any for complex API response
    interface RiskDataPoint { name: string; value: number; }
    const [loading, setLoading] = useState(true);

    useEffect(() => { if (!token) return; dashboardAPI.getStats(token).then(setStats).catch(() => { }).finally(() => setLoading(false)); }, [token]);

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-3 border-[#1e40af]/30 border-t-[#1e40af] rounded-full animate-spin" /></div>;

    const riskData: RiskDataPoint[] = stats?.risk_distribution ? Object.entries(stats.risk_distribution).map(([name, value]) => ({ name, value: value as number })) : [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="heading-section text-3xl text-[#0f172a]">Admin Analytics</h1>
                <p className="text-[#64748b] mt-1 text-sm">System-wide mental health analytics and insights</p>
            </div>

            <div className="grid grid-cols-4 gap-5">
                <StatCard icon={Users} label="Total Users" value={stats?.total_users || 0} color="#1e40af" />
                <StatCard icon={Activity} label="Total Assessments" value={stats?.total_assessments || 0} color="#8b5cf6" />
                <StatCard icon={TrendingUp} label="Avg Risk Score" value={stats?.avg_risk_score?.toFixed(1) || 0} color="#f59e0b" />
                <StatCard icon={AlertTriangle} label="High Risk" value={riskData.find((d) => d.name === 'high')?.value || 0} color="#ef4444" />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
                    <h3 className="text-base font-semibold text-[#0f172a] mb-4">Risk Distribution</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart><Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                            {riskData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie><Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} /></PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-2">
                        {riskData.map((d, i) => (
                            <div key={d.name} className="flex items-center gap-2 text-xs text-[#64748b] capitalize">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} /> {d.name}: {d.value as number}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
                    <h3 className="text-base font-semibold text-[#0f172a] mb-4">Assessments by Risk</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={riskData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>{riskData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {stats?.recent_assessments?.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
                    <h3 className="text-base font-semibold text-[#0f172a] mb-4">Recent Assessments</h3>
                    <div className="space-y-2">
                        {stats.recent_assessments.slice(0, 8).map((a: any) => ( // simplified assessment type
                            <div key={a.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#f8fafc] border border-[#f1f5f9]">
                                <div><p className="text-[#0f172a] text-sm">Assessment #{a.id}</p><p className="text-[#94a3b8] text-xs">{new Date(a.created_at).toLocaleString()}</p></div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-[#64748b]">Score: <strong className="text-[#0f172a]">{a.risk_score}</strong></span>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${a.risk_level === 'low' ? 'bg-green-50 text-green-600' : a.risk_level === 'moderate' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                                        }`}>{a.risk_level}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}10` }}><Icon size={20} style={{ color }} /></div><p className="text-sm text-[#64748b]">{label}</p></div>
            <p className="text-2xl font-semibold text-[#0f172a]">{value}</p>
        </div>
    );
}
