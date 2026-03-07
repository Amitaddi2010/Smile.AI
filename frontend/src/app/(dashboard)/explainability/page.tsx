'use client';
import { useEffect, useState } from 'react';
import { predictAPI } from '@/lib/api';
import { Brain, BarChart3, Info, Zap, ShieldCheck, Activity, BrainCircuit } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#1e40af', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];

export default function ExplainabilityPage() {
    const [modelInfo, setModelInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We can still try to fetch the behavioral model info, but we'll manually describe the fusion architecture
        predictAPI.getModelInfo().then(setModelInfo).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-3 border-[#1e40af]/30 border-t-[#1e40af] rounded-full animate-spin" /></div>;

    const importanceData = modelInfo?.feature_importances ? Object.entries(modelInfo.feature_importances)
        .map(([name, importance]) => ({ name: name.replace(/_/g, ' '), importance: Number(importance) }))
        .sort((a, b) => b.importance - a.importance).slice(0, 10) : [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <BrainCircuit className="text-blue-600" size={32} />
                    AI Insights & Architecture
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Understand how our v3 Tri-Model Fusion Engine evaluates mental health risk.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ModelCard
                    title="Model 1: NLP Text Engine"
                    desc="Analyzes free-text journal entries for emotional sentiment and suicidal language."
                    algo="LinearSVC (TF-IDF)"
                    acc="96.0%"
                    color="blue"
                    icon={FileTextIcon}
                />
                <ModelCard
                    title="Model 2: Lifestyle Risk"
                    desc="Evaluates structural habits like sleep, screen time, and academic pressure."
                    algo="Ensemble (LightGBM/RF)"
                    acc="100.0%"
                    color="emerald"
                    icon={Activity}
                />
                <ModelCard
                    title="Model 3: Behavioral Risk"
                    desc="Detects complex indicators like fatigue, poor dietary combinations, and health history."
                    algo="Ensemble Classifier"
                    acc="92.1%"
                    color="purple"
                    icon={Brain}
                />
            </div>

            {/* Fusion Explanation */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 relative z-10">
                    <Zap size={24} className="text-amber-500" />
                    Risk Fusion Methodology
                </h3>

                <div className="grid md:grid-cols-4 gap-6 relative z-10">
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4 text-blue-700 font-bold">1</div>
                        <h4 className="font-semibold text-slate-900 mb-2">Data Ingestion</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">The system gathers structured assessment variables (CGPA, sleep) and unstructured journal text.</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-4 text-indigo-700 font-bold">2</div>
                        <h4 className="font-semibold text-slate-900 mb-2">Component Scoring</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">Each of the 3 specialized ML models predicts a risk probability tailored to its specific domain.</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-4 text-emerald-700 font-bold">3</div>
                        <h4 className="font-semibold text-slate-900 mb-2">Confidence Weighting</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">Scores are dynamically weighted into a unified <b>SMILE Risk Index</b>, prioritizing textual crisis language.</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                        <div className="w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center mb-4 text-amber-800 font-bold">
                            <ShieldCheck size={20} />
                        </div>
                        <h4 className="font-semibold text-amber-900 mb-2">Crisis Override</h4>
                        <p className="text-sm text-amber-800 leading-relaxed">If suicidal ideation is detected, the risk index is maximized and immediate alerts are triggered.</p>
                    </div>
                </div>
            </div>

            {/* Feature Importance (Behavioral Mode) */}
            {importanceData.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <BarChart3 size={24} className="text-blue-600" />
                        Top Predictive Features (Behavioral Model)
                    </h3>
                    <p className="text-slate-500 mb-8 max-w-2xl">This chart visualizes the relative importance of structured features in predicting behavioral anomalies. Features with higher percentages carry more weight in the final Model 3 decision.</p>

                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={importanceData} layout="vertical" margin={{ left: 140, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" stroke="#475569" fontSize={13} fontWeight={500} width={130} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                                    formatter={(v: any) => [`${(Number(v) * 100).toFixed(2)}%`, 'Weight']}
                                />
                                <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={24}>
                                    {importanceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}

function ModelCard({ title, desc, algo, acc, color, icon: Icon }: any) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20",
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20",
        purple: "bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20"
    };

    const [bg, t, bord, ring] = colorClasses[color as keyof typeof colorClasses].split(' ');

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${bg.replace('50', '500')}`}></div>

            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${t} border ${bord}`}>
                    <Icon size={24} />
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Validation Acc</div>
                    <div className={`text-2xl font-black ${t}`}>{acc}</div>
                </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 text-sm mb-5 min-h-[40px] leading-relaxed">{desc}</p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Algorithm</span>
                <span className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-full">{algo}</span>
            </div>
        </div>
    );
}

// Quick fallback icon so we don't need a massive lucide import list
function FileTextIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
    )
}
