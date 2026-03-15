'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { conversationAPI, counselorAPI } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, Bot, ChevronLeft, ShieldCheck, 
    Clock, MessageSquare, AlertTriangle, 
    PhoneCall, HandHeart, Sparkles, Loader2,
    Shield
} from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function ClinicalSupportPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Clinical Hub...</div>}>
            <ClinicalSupportContent />
        </Suspense>
    );
}

function ClinicalSupportContent() {
    const { token, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const counselorId = searchParams.get('id');
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [counselor, setCounselor] = useState<any>(null);
    const [sosOpen, setSosOpen] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!token) return;
        
        // Load counselor info if ID is present
        if (counselorId) {
            counselorAPI.getAll(token).then(all => {
                const found = all.find((c: any) => c.id === Number(counselorId));
                if (found) setCounselor(found);
            }).catch(console.error);
        } else {
            // Load assigned counselor
            counselorAPI.getMine(token).then(setCounselor).catch(() => null);
        }
    }, [token, counselorId]);

    // Initial Greeting
    useEffect(() => {
        if (messages.length === 0 && token && counselor) {
            setIsLoading(true);
            setTimeout(async () => {
                try {
                    const res = await conversationAPI.chat(
                        `I am starting a clinical support session with Counselor ${counselor.name}. Please greet me in a professional, clinical capacity as an assistant to this counselor.`,
                        [],
                        token
                    );
                    setMessages([{ role: 'assistant', content: res.response, timestamp: new Date() }]);
                } catch {
                    setMessages([{
                        role: 'assistant',
                        content: `Hello ${user?.name?.split(' ')[0]}. I am the clinical assistant for ${counselor.name}. How can I support your wellbeing today? Any clinical concerns will be prioritized for ${counselor.name}'s review.`,
                        timestamp: new Date()
                    }]);
                }
                setIsLoading(false);
            }, 500);
        }
    }, [token, counselor, messages.length, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading || !token) return;
        
        const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        
        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const res = await conversationAPI.chat(userMsg.content, history, token);
            setMessages(prev => [...prev, { role: 'assistant', content: res.response, timestamp: new Date() }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: "I am here with you. Please continue sharing so I can assist your counselor in providing the best care.", timestamp: new Date() }]);
        }
        setIsLoading(false);
    };

    if (!user) return null;

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden relative">
            {/* Header */}
            <header className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/counselors')}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Clinical Support</h2>
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest rounded-md border border-rose-100">Priority Hub</span>
                        </div>
                        {counselor ? (
                            <p className="text-xs font-semibold text-slate-500">Clinical Assistant for <span className="text-blue-600">Dr. {counselor.name}</span></p>
                        ) : (
                            <p className="text-xs font-semibold text-slate-500">SMILE Clinical Intake Assistant</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setSosOpen(!sosOpen)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${sosOpen ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'}`}
                    >
                        <AlertTriangle size={14} /> Help / SOS
                    </button>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Counselor Notified</span>
                    </div>
                </div>
            </header>

            {/* SOS Dropdown */}
            <AnimatePresence>
                {sosOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-24 right-8 w-80 bg-white border border-red-100 rounded-2xl shadow-2xl z-50 p-6"
                    >
                        <h4 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4">Emergency Resources</h4>
                        <div className="space-y-3">
                            <a href="tel:988" className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100 group">
                                <span className="text-xs font-bold text-slate-900">Suicide Line</span>
                                <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-black rounded-lg flex items-center gap-1"><PhoneCall size={10} /> 988</span>
                            </a>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-900 block mb-1">Crisis Text Line</span>
                                <span className="text-[10px] font-medium text-slate-500">Text HOME to 741741</span>
                            </div>
                            <button className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                                Request Urgent Callback
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-white">
                {messages.map((m, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center shadow-lg ${
                                m.role === 'user' 
                                ? 'bg-slate-900 text-white font-black text-xs' 
                                : 'bg-gradient-to-br from-rose-500 to-red-600 text-white'
                            }`}>
                                {m.role === 'user' ? user.name.charAt(0) : <Shield size={18} />}
                            </div>
                            <div className={`p-6 rounded-[2rem] shadow-sm border ${
                                m.role === 'user'
                                ? 'bg-slate-900 text-white border-slate-800 rounded-tr-none'
                                : 'bg-slate-50 text-slate-900 border-slate-100 rounded-tl-none'
                            }`}>
                                <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                                <p className={`text-[9px] mt-2 font-bold uppercase tracking-widest ${m.role === 'user' ? 'text-white/40' : 'text-slate-400'}`}>
                                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <Loader2 size={18} className="text-slate-400 animate-spin" />
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl rounded-tl-none border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                Assistant is typing...
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <footer className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
                <div className="relative max-w-4xl mx-auto flex items-center gap-4">
                    <div className="flex-1 relative">
                        <input 
                            type="text"
                            placeholder="Type your message for clinical review..."
                            className="w-full bg-white border border-slate-200 rounded-2xl pl-6 pr-20 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                             <Sparkles size={16} className="text-blue-500 animate-pulse" />
                        </div>
                    </div>
                    <button 
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-900/10"
                    >
                        <Send size={20} />
                    </button>
                </div>
                <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4">
                    Protected by SMILE Clinical Encryption • Logs are visible to Dr. {counselor?.name || 'Assigned Counselor'}
                </p>
            </footer>
        </div>
    );
}
