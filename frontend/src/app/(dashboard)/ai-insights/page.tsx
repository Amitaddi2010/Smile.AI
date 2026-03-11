'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { aiAPI, predictAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
 Brain, Sparkles, Send, Bot, User,
 RefreshCcw, ShieldCheck, Lightbulb,
 Loader2, ThumbsUp, ThumbsDown, Activity, ArrowRight,
 TrendingUp, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

const SUGGESTED_PROMPTS = [
 "Am I improving?",
 "What should I change today?",
 "Explain my latest risk score.",
 "Give me a 5-minute stress relief exercise."
];

// Mock rich card triggers based on keywords
const getRichCard = (content: string) => {
 const lower = content.toLowerCase();
 if (lower.includes('risk') || lower.includes('score')) {
 return (
 <div className="mt-4 p-4 bg-white rounded-2xl border border-blue-100 shadow-sm flex items-start gap-4">
 <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
 <Activity size={20} className="text-blue-600 " />
 </div>
 <div>
 <h4 className="text-sm font-bold text-slate-900 mb-1">Your Latest Assessment</h4>
 <p className="text-xs text-slate-500 mb-3 leading-relaxed">Your risk level has stabilized compared to last week. Keep up the good work!</p>
 <Link href="/assessment" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
 Retake Assessment <ArrowRight size={14} />
 </Link>
 </div>
 </div>
 );
 }
 if (lower.includes('habit') || lower.includes('change')) {
 return (
 <div className="mt-4 p-4 bg-white rounded-2xl border border-amber-100 shadow-sm flex items-start gap-4">
 <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
 <TrendingUp size={20} className="text-amber-600 " />
 </div>
 <div>
 <h4 className="text-sm font-bold text-slate-900 mb-1">Recommended Habit</h4>
 <p className="text-xs text-slate-500 mb-3 leading-relaxed">Reducing short-form media by 30 mins before bed is your highest-leverage action right now.</p>
 </div>
 </div>
 );
 }
 return null;
};

export default function AIInsightsPage() {
 const { user, token } = useAuth();
 const [messages, setMessages] = useState<any[]>([
 { role: 'ai', content: `Hello ${user?.name || 'there'}! I'm SMILE-AI, your personalized mental wellness companion. How are you feeling today?` }
 ]);
 const [input, setInput] = useState('');
 const [loading, setLoading] = useState(false);
 const [insights, setInsights] = useState<string | null>(null);
 const [loadingInsights, setLoadingInsights] = useState(false);
 const [reactions, setReactions] = useState<Record<number, 'up' | 'down'>>({});
 const chatEndRef = useRef<HTMLDivElement>(null);

 const scrollToBottom = () => {
 chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 };

 useEffect(() => {
 scrollToBottom();
 }, [messages, loading]);

 const handleChat = async (e?: React.FormEvent, promptOverride?: string) => {
 if (e) e.preventDefault();
 const userMsg = promptOverride || input;
 if (!userMsg.trim() || loading) return;

 setInput('');
 setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
 setLoading(true);

 try {
 const res = await aiAPI.chat(userMsg, token!);
 setMessages(prev => [...prev, { role: 'ai', content: res.response }]);
 } catch (err: any) {
 setMessages(prev => [...prev, { role: 'ai', content: "I'm sorry, I'm having trouble connecting to my cognitive engine right now. Please try again." }]);
 } finally {
 setLoading(false);
 }
 };

 const handleReaction = (msgIndex: number, type: 'up' | 'down') => {
 setReactions(prev => ({ ...prev, [msgIndex]: prev[msgIndex] === type ? undefined : type } as any));
 };

 const fetchInsights = async (force: boolean = false) => {
 if (!token) return;
 try {
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
 localStorage.setItem('last_assessment_id', latestId.toString());
 localStorage.setItem('cached_insights', cleanInsights);
 } catch (err) {
 setInsights("Could not generate clinical insights at this time. Please complete a wellness audit first.");
 } finally {
 setLoadingInsights(false);
 }
 };

 useEffect(() => {
 if (token) fetchInsights();
 }, [token]);

 return (
 <div className="max-w-6xl mx-auto space-y-10 pb-12 animate-fade-in-up">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div>
 <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2 leading-tight">
 Cognitive <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 ">Insights</span>
 </h1>
 <p className="text-slate-500 text-lg font-light max-w-xl">Deep behavioral analysis and empathetic AI support powered by LLaMA 3.1 & Groq.</p>
 </div>
 <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-50 rounded-2xl border border-blue-100 backdrop-blur-xl">
 <ShieldCheck size={20} className="text-blue-600 " />
 <div>
 <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 ">Privacy Guaranteed</p>
 <p className="text-xs font-bold text-slate-900 ">Encrypted Session</p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
 {/* Left Panel: Clinical Narrative */}
 <div className="lg:col-span-5 flex flex-col gap-8 h-[750px]">
 <div className="flex-1 bg-white/70 backdrop-blur-2xl flex flex-col rounded-[2.5rem] relative overflow-hidden border border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
 <div className="p-8 border-b border-slate-100/50 bg-white/30 backdrop-blur-md flex items-center justify-between shrink-0">
 <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm border border-amber-100 ">
 <Lightbulb size={20} strokeWidth={2.5} />
 </div>
 Clinical Narrative
 </h2>
 <Sparkles size={20} className="text-blue-600 opacity-20" />
 </div>

 <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
 {loadingInsights ? (
 <div className="flex flex-col items-center justify-center h-full space-y-4">
 <Loader2 size={32} className="text-blue-600 animate-spin" />
 <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Syncing behavioral<br />telemetry...</p>
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

 <div className="p-6 border-t border-slate-100/50 bg-slate-50/30 shrink-0">
 <button
 onClick={() => fetchInsights(true)}
 className="w-full py-4 flex items-center justify-center gap-3 text-[10px] font-black text-blue-600 transition-all uppercase tracking-widest bg-white border border-blue-100 rounded-2xl hover:bg-blue-50 active:scale-[0.98] shadow-sm"
 >
 <RefreshCcw size={14} className={loadingInsights ? 'animate-spin' : ''} />
 Recalculate Intelligence Model
 </button>
 </div>
 </div>

 <div className="shrink-0 bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-800">
 <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full" />
 <h3 className="text-base font-bold mb-2 flex items-center gap-2 relative z-10">
 <ShieldCheck size={18} className="text-blue-400" /> Mental Fitness Guard
 </h3>
 <p className="text-slate-400 text-[11px] font-medium leading-relaxed relative z-10">
 Active session encryption and clinical safety guardrails are enabled for this intelligence sync.
 </p>
 </div>
 </div>

 {/* Right Panel: Interactive Chat */}
 <div className="lg:col-span-7 flex flex-col h-[750px] bg-white/70 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden border border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
 <div className="p-6 border-b border-slate-100/50 flex items-center justify-between bg-white/30 backdrop-blur-md shrink-0">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/30 border border-white/20">
 <Bot size={24} />
 </div>
 <div>
 <h3 className="font-bold text-slate-900 text-lg tracking-tight">Live Companion</h3>
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500/50" />
 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Synthesis Active</span>
 </div>
 </div>
 </div>
 <button
 onClick={() => setMessages([{ role: 'ai', content: `Hello ${user?.name || 'there'}! I'm SMILE-AI. I've reset our context. How can I help?` }])}
 className="p-3 rounded-xl hover:bg-white transition-all text-slate-400 border border-transparent hover:border-slate-200 hover:shadow-sm"
 title="Reset Conversation"
 >
 <RefreshCcw size={18} />
 </button>
 </div>

 <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scrollbar-hide bg-slate-50/30 ">
 {messages.map((m, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, y: 10, scale: 0.98 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={{ duration: 0.3 }}
 className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
 >
 <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${m.role === 'user' ? 'bg-white text-blue-600 border-slate-200 ' : 'bg-slate-900 text-white border-transparent'
 }`}>
 {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
 </div>
 <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
 <div className={`p-5 rounded-[2rem] text-sm leading-relaxed ${m.role === 'user'
 ? 'bg-white text-slate-900 border border-slate-200 rounded-tr-none shadow-sm'
 : 'bg-white/80 backdrop-blur-sm text-slate-700 border border-white/60 rounded-tl-none shadow-sm'
 }`}>
 {m.content}
 {m.role === 'ai' && getRichCard(m.content)}
 </div>

 {/* RLHF Reactions for AI messages */}
 {m.role === 'ai' && i > 0 && (
 <div className="flex items-center gap-2 mt-2 ml-4">
 <button
 onClick={() => handleReaction(i, 'up')}
 className={`p-1.5 rounded-lg transition-colors ${reactions[i] === 'up' ? 'text-green-600 bg-green-50 ' : 'text-slate-400 hover:text-green-600 hover:bg-slate-100 '}`}
 >
 <ThumbsUp size={14} />
 </button>
 <button
 onClick={() => handleReaction(i, 'down')}
 className={`p-1.5 rounded-lg transition-colors ${reactions[i] === 'down' ? 'text-red-600 bg-red-50 ' : 'text-slate-400 hover:text-red-600 hover:bg-slate-100 '}`}
 >
 <ThumbsDown size={14} />
 </button>
 </div>
 )}
 </div>
 </div>
 </motion.div>
 ))}

 {/* Typing Indicator */}
 {loading && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
 <div className="flex gap-4 max-w-[85%]">
 <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
 <Bot size={20} />
 </div>
 <div className="py-4 px-5 rounded-[2rem] rounded-tl-none bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm flex items-center gap-2">
 <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 rounded-full bg-blue-600/40 " />
 <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-blue-600/40 " />
 <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-blue-600/60 " />
 </div>
 </div>
 </motion.div>
 )}
 <div ref={chatEndRef} />
 </div>

 {/* Suggested Prompts & Input */}
 <div className="p-4 sm:p-6 border-t border-slate-100/50 bg-white/30 backdrop-blur-md shrink-0">
 {messages.length < 3 && !loading && (
 <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide hide-scroll-arrows">
 {SUGGESTED_PROMPTS.map((prompt, i) => (
 <button
 key={i}
 onClick={() => handleChat(undefined, prompt)}
 className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm shrink-0"
 >
 {prompt}
 </button>
 ))}
 </div>
 )}
 <form onSubmit={(e) => handleChat(e)} className="relative flex items-center">
 <input
 type="text"
 value={input}
 onChange={(e) => setInput(e.target.value)}
 placeholder="Type a message to your AI companion..."
 className="w-full pl-6 pr-16 py-4 rounded-[1.5rem] bg-white border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold placeholder:text-slate-400 shadow-sm shadow-black/[0.02]"
 />
 <button
 type="submit"
 disabled={!input.trim() || loading}
 className="absolute right-2 p-3.5 bg-slate-900 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-blue-500/10 "
 >
 <Send size={20} />
 </button>
 </form>
 <p className="text-center mt-3 text-[10px] text-slate-400 font-medium">SMILE-AI can make mistakes. Consider verifying important clinical information.</p>
 </div>
 </div>
 </div>
 </div>
 );
}
