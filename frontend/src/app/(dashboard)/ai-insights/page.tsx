'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { aiAPI, predictAPI } from '@/lib/api';
import {
    Brain, Sparkles, Send, Bot, User,
    RefreshCcw, MessageSquare, ShieldCheck,
    Lightbulb, AlertCircle, Loader2, ArrowRight
} from 'lucide-react';

export default function AIInsightsPage() {
    const { user, token } = useAuth();
    const [messages, setMessages] = useState<any[]>([
        { role: 'ai', content: `Hello ${user?.name || 'there'}! I'm SMILE-AI, your personalized mental health companion. How are you feeling today?` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState<string | null>(null);
    const [loadingInsights, setLoadingInsights] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await aiAPI.chat(userMsg, token!);
            setMessages(prev => [...prev, { role: 'ai', content: res.response }]);
        } catch (err: any) {
            setMessages(prev => [...prev, { role: 'ai', content: "I'm sorry, I'm having trouble thinking right now. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const fetchInsights = async (force: boolean = false) => {
        if (!token) return;

        try {
            // Check if we need fresh insights
            const history = await predictAPI.getHistory(token);
            const latestId = history.length > 0 ? history[0].id : 'none';
            const cachedId = localStorage.getItem('last_assessment_id');
            const cachedInsights = localStorage.getItem('cached_insights');

            if (!force && latestId === cachedId && cachedInsights) {
                setInsights(cachedInsights.replace(/\*/g, ''));
                return;
            }

            setLoadingInsights(true);
            const res = await aiAPI.getInsights(token);
            const cleanInsights = res.insights.replace(/\*/g, '');
            setInsights(cleanInsights);

            // Update cache
            localStorage.setItem('last_assessment_id', latestId.toString());
            localStorage.setItem('cached_insights', cleanInsights);
        } catch (err) {
            setInsights("Could not generate insights at this time. Please complete a wellness audit first.");
        } finally {
            setLoadingInsights(false);
        }
    };

    useEffect(() => {
        if (token) fetchInsights();
    }, [token]);

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-12 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-[#0f172a] mb-2 leading-tight">
                        Cognitive <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e40af] to-[#8b5cf6]">Insights</span>
                    </h1>
                    <p className="text-[#64748b] text-lg font-light max-w-xl">Deep behavioral analysis and empathetic AI support powered by LLaMA 3.1 & Groq.</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-[#1e40af]/5 rounded-2xl border border-[#1e40af]/10 backdrop-blur-xl">
                    <ShieldCheck size={20} className="text-[#1e40af]" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#1e40af]">Privacy Guaranteed</p>
                        <p className="text-xs font-bold text-[#0f172a]">Encrypted Session</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left: AI Deep Insights */}
                <div className="lg:col-span-5 flex flex-col gap-8 h-[750px]">
                    <div className="flex-1 glass-card flex flex-col rounded-[2.5rem] relative overflow-hidden border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
                        {/* Header */}
                        <div className="p-8 border-b border-slate-100/50 bg-white/30 backdrop-blur-md flex items-center justify-between shrink-0">
                            <h2 className="text-xl font-black text-[#0f172a] flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                                    <Lightbulb size={20} strokeWidth={2.5} />
                                </div>
                                Clinical Narrative
                            </h2>
                            <Sparkles size={20} className="text-[#1e40af] opacity-20" />
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                            {loadingInsights ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4">
                                    <Loader2 size={32} className="text-[#1e40af] animate-spin" />
                                    <p className="text-sm font-bold text-[#64748b] uppercase tracking-widest text-center">Syncing behavioral<br />telemetry...</p>
                                </div>
                            ) : (
                                <div className="prose prose-slate max-w-none">
                                    <div className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium text-sm space-y-4">
                                        {insights ? (
                                            insights.split('\n\n').map((chunk, idx) => {
                                                if (chunk.match(/^[A-Z\s]{10,}$/m)) {
                                                    return <h4 key={idx} className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-8 mb-2 first:mt-0">{chunk}</h4>;
                                                }
                                                return <p key={idx} className="mb-4">{chunk}</p>;
                                            })
                                        ) : 'Your personalized AI analysis will appear here after your first assessment.'}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 border-t border-slate-100/50 bg-slate-50/30 shrink-0">
                            <button
                                onClick={() => fetchInsights(true)}
                                className="w-full py-4 flex items-center justify-center gap-3 text-[10px] font-black text-[#1e40af] transition-all uppercase tracking-widest bg-white border border-blue-100 rounded-2xl hover:bg-blue-50 active:scale-[0.98]"
                            >
                                <RefreshCcw size={14} className={loadingInsights ? 'animate-spin' : ''} />
                                Recalculate Intelligence Model
                            </button>
                        </div>
                    </div>

                    <div className="shrink-0 bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-blue-900/10">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full" />
                        <h3 className="text-base font-bold mb-2 flex items-center gap-2 relative z-10">
                            <ShieldCheck size={18} className="text-blue-400" /> Mental Fitness Guard
                        </h3>
                        <p className="text-slate-400 text-[11px] font-medium leading-relaxed relative z-10">
                            Active session encryption and clinical safety guardrails are enabled for this intelligence sync.
                        </p>
                    </div>
                </div>

                {/* Right: Interactive Chat */}
                <div className="lg:col-span-7 flex flex-col h-[750px] glass-card rounded-[2.5rem] overflow-hidden border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
                    <div className="p-6 border-b border-slate-100/50 flex items-center justify-between bg-white/30 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#1e40af] flex items-center justify-center text-white shadow-xl shadow-[#1e40af]/30 border border-white/20">
                                <Bot size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#0f172a] text-lg tracking-tight">Live Companion</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500/50" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Synthesis Active</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setMessages([{ role: 'ai', content: `Hello ${user?.name || 'there'}! I'm SMILE-AI. I've reset our context. How can I help?` }])}
                            className="p-3 rounded-xl hover:bg-white transition-all text-slate-400 border border-transparent hover:border-slate-100 hover:shadow-sm"
                        >
                            <RefreshCcw size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-slate-50/10">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${m.role === 'user' ? 'bg-white text-[#1e40af] border-slate-100' : 'bg-slate-900 text-white border-transparent'
                                        }`}>
                                        {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                    </div>
                                    <div className={`p-5 rounded-[2rem] text-sm leading-relaxed ${m.role === 'user'
                                        ? 'bg-white text-[#0f172a] border border-slate-100 rounded-tr-none shadow-sm shadow-black/[0.02]'
                                        : 'bg-white/80 text-slate-600 border border-white/60 rounded-tl-none shadow-sm'
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="flex gap-4 max-w-[85%]">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                        <Bot size={20} />
                                    </div>
                                    <div className="p-4 rounded-[1.5rem] bg-white border border-slate-100 flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e40af]/40 animate-bounce" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e40af]/40 animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e40af]/40 animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleChat} className="p-8 border-t border-slate-100/50 bg-white/30 backdrop-blur-md">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full pl-6 pr-16 py-4 rounded-[1.5rem] bg-white border border-slate-200 text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold placeholder:text-slate-400 border-none shadow-sm shadow-black/[0.05]"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="absolute right-2 p-3.5 bg-slate-900 text-white rounded-xl hover:bg-[#1e40af] transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-blue-500/10"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
