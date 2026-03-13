'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { journalAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Send, AlertTriangle, Info, Clock,
    ShieldAlert, Sparkles, TrendingUp, Feather, Calendar, Loader2, RefreshCcw,
    Mic, MicOff, Smile, Meh, Frown, Angry, Heart, ChevronRight
} from 'lucide-react';

const WRITING_PROMPTS = [
    "What's one thing that brought you peace today?",
    "Describe a challenge you faced and how it made you feel.",
    "What are you looking forward to this week?",
    "Write about a moment you felt proud of yourself recently.",
    "If your current mood was a color, what would it be and why?"
];

const MOODS = [
    { label: "Joyful", icon: Heart, activeClass: "bg-rose-500 text-white shadow-sm ring-1 ring-rose-600", defaultClass: "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50" },
    { label: "Neutral", icon: Meh, activeClass: "bg-slate-600 text-white shadow-sm ring-1 ring-slate-700", defaultClass: "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50" },
    { label: "Anxious", icon: Frown, activeClass: "bg-amber-500 text-white shadow-sm ring-1 ring-amber-600", defaultClass: "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50" },
    { label: "Stressed", icon: Angry, activeClass: "bg-red-500 text-white shadow-sm ring-1 ring-red-600", defaultClass: "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50" },
    { label: "Calm", icon: Smile, activeClass: "bg-teal-500 text-white shadow-sm ring-1 ring-teal-600", defaultClass: "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50" },
];

export default function JournalPage() {
    const { token } = useAuth();
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [mood, setMood] = useState('Neutral');
    const [loading, setLoading] = useState(false);
    interface JournalResult {
        risk_level: string;
        is_crisis: boolean;
        smile_risk_index: number;
        fusion_details: any;
    }
    const [result, setResult] = useState<JournalResult | null>(null);
    const [history, setHistory] = useState<any[]>([]); // Need to define JournalEntry type if possible
    const [currentPrompt, setCurrentPrompt] = useState(WRITING_PROMPTS[0]);

    // Voice to Text
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<unknown>(null);

    const loadHistory = useCallback(async () => {
        if (!token) return;
        try {
            const data = await journalAPI.getHistory(token);
            setHistory(data);
        } catch (error) {
            console.error('Failed to load history', error);
        }
    }, [token]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Your browser does not support Speech Recognition.");
                return;
            }
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setText(prev => prev + ' ' + currentTranscript);
            };
            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
            };
            recognition.onend = () => setIsRecording(false);
            recognition.start();
            recognitionRef.current = recognition;
            setIsRecording(true);
        }
    };

    const handleAnalyze = async () => {
        if (text.length < 10) return;
        setLoading(true);
        try {
            const data = await journalAPI.analyze({
                text_content: text,
                title: title || undefined,
                self_reported_mood: mood || undefined
            }, token!);
            setResult(data);
            loadHistory(); // Refresh history
        } catch (error: any) {
            alert(error.message || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const rotatePrompt = () => {
        const currentIndex = WRITING_PROMPTS.indexOf(currentPrompt);
        const nextIndex = (currentIndex + 1) % WRITING_PROMPTS.length;
        setCurrentPrompt(WRITING_PROMPTS[nextIndex]);
    };

    const getRiskColor = (level: string) => {
        if (!level) return 'text-slate-500 bg-slate-50 border-slate-200';
        switch (level.toLowerCase()) {
            case 'low': return 'text-green-700 bg-green-50 border-green-200';
            case 'moderate': return 'text-amber-700 bg-amber-50 border-amber-200';
            case 'high': return 'text-orange-700 bg-orange-50 border-orange-200';
            case 'critical': return 'text-red-700 bg-red-50 border-red-200';
            default: return 'text-slate-500 bg-slate-50 border-slate-200';
        }
    };

    const getScoreColor = (score: number) => {
        if (score < 30) return 'text-green-600';
        if (score < 50) return 'text-amber-500';
        if (score < 70) return 'text-orange-600';
        return 'text-red-600';
    };

    const getTimelineColor = (score: number) => {
        if (score < 30) return '#16a34a'; // green-600
        if (score < 50) return '#f59e0b'; // amber-500
        if (score < 70) return '#ea580c'; // orange-600
        return '#dc2626'; // red-600
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 relative z-10 pb-12 animate-fade-in-up">
            <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Clinical Journal
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">Semantic analysis sandbox and longitudinal tracker.</p>
                </div>
            </header>

            {/* Mood Timeline (Top Area) */}
            {history.length > 0 && (
                <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp size={16} className="text-slate-400" />
                            Emotional Trajectory (SMILE Index)
                        </h3>
                        <div className="px-3 py-1 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Last 7 Entries
                        </div>
                    </div>
                    
                    <div className="relative h-20 flex items-center">
                        {/* Connecting Line */}
                        <div className="absolute left-6 right-6 h-[2px] bg-slate-100 top-1/2 -translate-y-1/2 rounded-full z-0 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                className="h-full bg-slate-300/50"
                            />
                        </div>
                        {/* Timeline Points */}
                        <div className="w-full flex justify-between items-center z-10 px-4 relative">
                            {[...history].reverse().slice(-7).map((entry, idx, arr) => {
                                const score = entry.smile_risk_index || 0;
                                const isLast = idx === arr.length - 1;
                                return (
                                    <div key={entry.id} className="flex flex-col items-center group relative">
                                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-md whitespace-nowrap shadow-lg z-20 pointer-events-none after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-slate-900">
                                            {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            <div className="text-slate-300 font-medium">Risk: {score}%</div>
                                        </div>
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: idx * 0.1, type: 'spring' }}
                                            className={`w-3.5 h-3.5 rounded-full ring-4 transition-transform cursor-pointer hover:scale-125 ${isLast ? 'ring-slate-50 scale-125' : 'ring-white'}`}
                                            style={{ backgroundColor: getTimelineColor(score) }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Input + Results (Span 8) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Input Editor */}
                    <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 overflow-hidden relative">
                        <div className="p-6">
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
                                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Feather size={16} className="text-slate-400" />
                                    Diagnostic Entry
                                </h2>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    {text.length} chars
                                </span>
                            </div>

                            {/* Self-Reported Mood Selector */}
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Tag Mood:</span>
                                {MOODS.map((m) => {
                                    const isActive = mood === m.label;
                                    return (
                                        <button
                                            key={m.label}
                                            onClick={() => setMood(m.label)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isActive ? m.activeClass : m.defaultClass}`}
                                        >
                                            <m.icon size={14} className={isActive ? "text-white" : ""} />
                                            {m.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Rotating Prompt Widget */}
                            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                <Sparkles size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-600">"{currentPrompt}"</p>
                                </div>
                                <button
                                    onClick={rotatePrompt}
                                    className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-all"
                                    title="Get a new prompt"
                                >
                                    <RefreshCcw size={14} />
                                </button>
                            </div>

                            <input
                                type="text"
                                placeholder="Session Title (optional)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-xl font-bold bg-transparent border-none focus:ring-0 focus:outline-none pb-2 mb-2 text-slate-900 placeholder:text-slate-300 transition-colors"
                            />

                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Start transcribing or typing..."
                                className="w-full h-48 bg-transparent focus:outline-none resize-none text-slate-700 text-base leading-relaxed placeholder:text-slate-300"
                            />
                        </div>

                        <div className="px-6 py-4 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={toggleRecording}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white shadow-md shadow-red-500/20 animate-pulse' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                                    title={isRecording ? "Stop dictation" : "Start voice dictation"}
                                >
                                    {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                                </button>
                                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wide">
                                    <ShieldAlert size={14} />
                                    Client-Encrypted
                                </p>
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={text.length < 10 || loading}
                                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Computing...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Process Sentiment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">Semantic Assessment Result</h2>
                                        <p className="text-xs text-slate-500 mt-1">Multi-modal behavioral and lexical baseline comparison.</p>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-md font-bold text-[10px] tracking-widest uppercase border whitespace-nowrap ${getRiskColor(result.risk_level)}`}>
                                        {result.risk_level} Priority
                                    </div>
                                </div>

                                {result.is_crisis && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 items-start">
                                        <AlertTriangle className="text-red-600 w-5 h-5 shrink-0" />
                                        <div>
                                            <h3 className="font-bold text-red-900 text-sm mb-1">Clinical Intervention Flag</h3>
                                            <p className="text-red-800 text-xs leading-relaxed">System detected acute distress terminology. Standard protocol requires offering external resources: National Crisis Lifeline (988).</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    {/* Score Gauge */}
                                    <div className="flex flex-col items-center justify-center border-r border-slate-100">
                                        <div className="relative flex items-center justify-center w-36 h-36">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                                                <motion.path
                                                    initial={{ strokeDasharray: "0, 100" }}
                                                    animate={{ strokeDasharray: `${result.smile_risk_index}, 100` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className={`${getScoreColor(result.smile_risk_index)}`}
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className={`text-4xl font-black ${getScoreColor(result.smile_risk_index)}`}>
                                                    {result.smile_risk_index}
                                                </span>
                                                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">SMILE Score</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Breakdown Bars */}
                                    <div className="space-y-5">
                                        <h3 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                                            <Info size={14} className="text-slate-400"/> Output Weights
                                        </h3>

                                        {result.fusion_details && (() => {
                                            const details = typeof result.fusion_details === 'string' ? JSON.parse(result.fusion_details) : result.fusion_details;
                                            const components = details.component_scores || {};
                                            return (
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="flex justify-between text-[11px] mb-1.5 font-bold text-slate-600">
                                                            <span>Lexical Diagnostics</span>
                                                            <span className={getScoreColor(components.text || 0)}>{(components.text || 0).toFixed(1)}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${components.text || 0}%` }}
                                                                transition={{ delay: 0.2, duration: 1 }}
                                                                className={`h-full rounded-full ${components.text < 30 ? 'bg-green-500' : components.text < 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                            />
                                                        </div>
                                                        {details.text_analysis && (
                                                            <p className="text-[10px] text-slate-400 mt-1.5 capitalize">
                                                                Signature match: {details.text_analysis.predicted_condition.replace('_', ' ')}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <div className="flex justify-between text-[11px] mb-1.5 font-bold text-slate-600">
                                                            <span>Lifestyle Factors</span>
                                                            <span className={getScoreColor(components.lifestyle || 0)}>{(components.lifestyle || 0).toFixed(1)}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${components.lifestyle || 0}%` }}
                                                                transition={{ delay: 0.3, duration: 1 }}
                                                                className={`h-full rounded-full ${components.lifestyle < 30 ? 'bg-green-500' : components.lifestyle < 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="flex justify-between text-[11px] mb-1.5 font-bold text-slate-600">
                                                            <span>Behavioral Factors</span>
                                                            <span className={getScoreColor(components.behavior || 0)}>{(components.behavior || 0).toFixed(1)}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${components.behavior || 0}%` }}
                                                                transition={{ delay: 0.4, duration: 1 }}
                                                                className={`h-full rounded-full ${components.behavior < 30 ? 'bg-green-500' : components.behavior < 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column: History Timeline (Span 4) */}
                <div className="lg:col-span-4 bg-white rounded-[1.5rem] shadow-sm border border-slate-200 p-6 h-fit max-h-[850px] overflow-y-auto custom-scrollbar">
                    <h2 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                        <Clock size={16} className="text-slate-400" />
                        Historical Archive
                    </h2>

                    {history.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <FileText size={20} />
                            </div>
                            <p className="text-slate-500 text-sm">No historical data found.<br />Logs will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[0.6rem] before:-translate-x-px before:h-full before:w-[2px] before:bg-slate-100">
                            {history.map((entry, idx) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="relative flex items-start group"
                                >
                                    {/* Timeline Node */}
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-[3px] border-white bg-slate-200 shrink-0 absolute left-0 transform" />

                                    {/* Content Card */}
                                    <div className="w-full pl-8">
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 group-hover:bg-slate-100/50 group-hover:border-slate-200 transition-colors">
                                            <div className="flex flex-col gap-1 mb-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                                    <span>{new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    {entry.self_reported_mood && (
                                                        <span className="text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm capitalize font-semibold">{entry.self_reported_mood}</span>
                                                    )}
                                                </p>
                                                {entry.title && (
                                                    <h4 className="font-bold text-slate-800 text-sm mt-1">{entry.title}</h4>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                                                {entry.text_content}
                                            </p>
                                            
                                            {entry.risk_level && (
                                                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                                                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded whitespace-nowrap ${getRiskColor(entry.risk_level)}`}>
                                                        {entry.risk_level}
                                                    </span>
                                                    <span className={`text-[10px] font-bold ${getScoreColor(entry.smile_risk_index || 0)}`}>
                                                        {entry.smile_risk_index}% Risk
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
