'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { journalAPI } from '@/lib/api';
import { FileText, Send, AlertTriangle, Info, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function JournalPage() {
    const { user, token } = useAuth();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        if (token) {
            loadHistory();
        }
    }, [token]);

    const loadHistory = async () => {
        try {
            const data = await journalAPI.getHistory(token!);
            setHistory(data);
        } catch (error) {
            console.error('Failed to load history', error);
        }
    };

    const handleAnalyze = async () => {
        if (text.length < 10) return;
        setLoading(true);
        try {
            const data = await journalAPI.analyze({ text_content: text }, token!);
            setResult(data);
            loadHistory(); // Refresh history
        } catch (error: any) {
            alert(error.message || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level: string) => {
        if (!level) return 'text-slate-500 bg-slate-50';
        switch (level.toLowerCase()) {
            case 'low': return 'text-green-600 bg-green-50 ring-green-100';
            case 'moderate': return 'text-amber-600 bg-amber-50 ring-amber-100';
            case 'high': return 'text-orange-600 bg-orange-50 ring-orange-100';
            case 'critical': return 'text-red-600 bg-red-50 ring-red-100';
            default: return 'text-slate-500 bg-slate-50 ring-slate-100';
        }
    };

    const getScoreColor = (score: number) => {
        if (score < 30) return 'text-green-500';
        if (score < 50) return 'text-amber-500';
        if (score < 70) return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
            <header className="mb-4 pt-2">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Digital Journal</h1>
                <p className="text-slate-500 mt-2 text-sm sm:text-base font-medium">Express your thoughts freely. Our AI will help you reflect and track your mental wellbeing over time.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Left Column: Input Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-7 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <FileText className="text-blue-600" size={24} />
                                New Entry
                            </h2>
                            <span className="text-xs font-bold text-slate-400 bg-slate-100/50 px-3 py-1 rounded-full">
                                {text.length} characters
                            </span>
                        </div>

                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="How are you feeling today? What's on your mind?"
                            className="w-full h-64 p-5 rounded-2xl border-2 border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none text-slate-700 text-lg leading-relaxed placeholder:text-slate-400 font-medium shadow-inner"
                        />

                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase tracking-wide">
                                <ShieldAlert size={14} className="text-slate-400" />
                                All entries are private & secure.
                            </p>
                            <button
                                onClick={handleAnalyze}
                                disabled={text.length < 10 || loading}
                                className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Analyze AI Risk
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Results Panel */}
                    {result && (
                        <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-7 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-2">AI Fusion Analysis</h2>
                                    <p className="text-sm font-medium text-slate-500">Unified risk insights based on your text context and previous behavioral assessments.</p>
                                </div>
                                <div className={`px-4 py-2 rounded-xl font-black text-xs tracking-widest uppercase ring-1 shadow-sm whitespace-nowrap ${getRiskColor(result.risk_level)}`}>
                                    {result.risk_level} Risk
                                </div>
                            </div>

                            {result.is_crisis && (
                                <div className="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-[1.5rem] flex gap-4 items-start animate-pulse shadow-inner">
                                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5 w-6 h-6" />
                                    <div>
                                        <h3 className="font-black text-red-900 text-lg mb-1">Immediate Support Recommended</h3>
                                        <p className="text-red-800 text-sm font-medium leading-relaxed">Our AI detected language indicating a potential crisis or severe distress. You don't have to go through this alone. Please consider reaching out to the National Crisis Lifeline by dialing 988 or visiting your campus health center immediately.</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Overall Score */}
                                <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-[1.5rem] border-2 border-slate-100/50">
                                    <div className="relative flex items-center justify-center w-40 h-40">
                                        <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.05)]" viewBox="0 0 36 36">
                                            <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                            <path className={`${getScoreColor(result.smile_risk_index)} transition-all duration-1000 ease-out`} strokeDasharray={`${result.smile_risk_index}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                        </svg>
                                        <div className="absolute flex flex-col items-center justify-center">
                                            <span className={`text-4xl font-black tracking-tighter ${getScoreColor(result.smile_risk_index)}`}>
                                                {result.smile_risk_index}<span className="text-xl">%</span>
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-slate-800 mt-4">SMILE Risk Index</h3>
                                    <p className="text-sm text-slate-500 text-center mt-1">Unified score from all 3 predictive models.</p>
                                </div>

                                {/* Component Scores */}
                                <div className="space-y-5">
                                    <h3 className="font-bold text-slate-800 mb-2 border-b pb-2">Component Diagnostics</h3>

                                    {result.fusion_details && (() => {
                                        const details = typeof result.fusion_details === 'string' ? JSON.parse(result.fusion_details) : result.fusion_details;
                                        const components = details.component_scores || {};
                                        return (
                                            <>
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1.5 font-medium">
                                                        <span className="text-slate-700">Text Sentiment Risk</span>
                                                        <span className={getScoreColor(components.text || 0)}>{(components.text || 0).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${components.text < 30 ? 'bg-green-500' : components.text < 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${components.text || 0}%` }}></div>
                                                    </div>
                                                    {details.text_analysis && (
                                                        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                                                            <Info size={12} /> Primary indicator: <span className="font-semibold capitalize text-slate-700">{details.text_analysis.predicted_condition.replace('_', ' ')}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-sm mb-1.5 font-medium">
                                                        <span className="text-slate-700">Lifestyle Risk</span>
                                                        <span className={getScoreColor(components.lifestyle || 0)}>{(components.lifestyle || 0).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${components.lifestyle < 30 ? 'bg-green-500' : components.lifestyle < 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${components.lifestyle || 0}%` }}></div>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1.5">Based on latest structured assessment.</p>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-sm mb-1.5 font-medium">
                                                        <span className="text-slate-700">Behavioral Risk</span>
                                                        <span className={getScoreColor(components.behavior || 0)}>{(components.behavior || 0).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${components.behavior < 30 ? 'bg-green-500' : components.behavior < 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${components.behavior || 0}%` }}></div>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: History */}
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60 p-6 sm:p-8 h-fit max-h-[850px] overflow-y-auto custom-scrollbar">
                    <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 sticky top-0 bg-white/40 backdrop-blur-3xl py-2 z-10 -mx-2 px-2 rounded-xl">
                        <Clock className="text-blue-600" size={24} />
                        Past Entries
                    </h2>

                    {history.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText size={24} />
                            </div>
                            <p className="text-slate-500 font-medium">No journal entries yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((entry) => (
                                <div key={entry.id} className="p-5 rounded-2xl bg-white/50 relative overflow-hidden group hover:bg-white transition-all border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        {entry.risk_level && (
                                            <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-md ring-1 ${getRiskColor(entry.risk_level)}`}>
                                                {entry.risk_level}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-700 font-medium line-clamp-3 leading-relaxed mb-4">
                                        "{entry.text_content}"
                                    </p>
                                    {entry.smile_risk_index !== null && (
                                        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
                                            <div className="w-2 h-2 rounded-full shadow-inner" style={{ backgroundColor: entry.smile_risk_index < 30 ? '#22c55e' : entry.smile_risk_index < 60 ? '#f59e0b' : '#ef4444' }} />
                                            SMILE Index: <span className="text-slate-700">{entry.smile_risk_index}%</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
