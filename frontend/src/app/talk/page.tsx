'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { conversationAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Mic, MicOff, Sparkles, Loader2, CheckCircle,
    LayoutDashboard, FileText, Volume2, VolumeX,
    Brain, Zap, Activity, Bot, Clock, ChevronLeft,
    MessageSquare, PanelRight, PanelRightClose, Trash2,
    Smile, Shield, Database, Cpu, Search, AlertTriangle,
    PhoneCall, Wind, HeartPulse, Settings2, HandHeart
} from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; timestamp: Date; }
interface SessionEntry { id: string; date: string; preview: string; mood?: string; risk?: number; }
interface ExtractionResult {
    status?: string;
    smile_risk_index?: number;
    weights_used?: Record<string, number>;
    models_used?: {
        reasoning?: string;
        component_scores?: Record<string, number>;
    };
    extracted?: {
        mood_score?: number;
        mood_label?: string;
        energy_level?: string;
        data_confidence?: string;
        journal_entry?: string;
    };
}

const QUICK_REPLIES = [
    "I'm feeling great today! 😊",
    "I'm a bit stressed lately",
    "I have terrible anxiety right now",
    "I just need to vent",
    "Can you guide me through a breathing exercise?",
];

const MOOD_EMOJIS = [
    { emoji: '😊', label: 'Happy', text: "I'm feeling happy and positive today" },
    { emoji: '😌', label: 'Calm', text: "I'm feeling calm and relaxed" },
    { emoji: '😐', label: 'Neutral', text: "I'm feeling okay, nothing special" },
    { emoji: '😔', label: 'Low', text: "I'm feeling a bit down today" },
    { emoji: '😰', label: 'Anxious', text: "I'm having terrible anxiety right now" },
];

export default function TalkPage() {
    const { user, token, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [sessionEnded, setSessionEnded] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [extractResult, setExtractResult] = useState<ExtractionResult | null>(null);
    const [ttsEnabled, setTtsEnabled] = useState(false);
    const [msgCount, setMsgCount] = useState(0);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [pipelineOpen, setPipelineOpen] = useState(false);
    const [sosOpen, setSosOpen] = useState(false);
    const [showBreathing, setShowBreathing] = useState(false);
    const [breathePhase, setBreathePhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
    const [sessions, setSessions] = useState<SessionEntry[]>([]);
    const [sessionStart] = useState(() => Date.now());
    const [elapsed, setElapsed] = useState('0:00');
    const [showMoodPicker, setShowMoodPicker] = useState(false);
    const [extractionStep, setExtractionStep] = useState(0);
    
    // Accessibility
    const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');

    // Advanced Clinical Features
    const [showGrounding54321, setShowGrounding54321] = useState(false);
    const [groundingStep, setGroundingStep] = useState(5);
    const [sessionIntentSelected, setSessionIntentSelected] = useState(false);
    
    // Inline Micro-Assessment
    const [showAssessment, setShowAssessment] = useState(false);
    const [phqScores, setPhqScores] = useState({ q1: -1, q2: -1 });
    const [showExitModal, setShowExitModal] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null); // JS Speech API types are often missing in standard TS
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auth guard
    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    // Navigation Guard (Popstate & BeforeUnload)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (msgCount > 0 && !sessionEnded) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        const handlePopState = (e: PopStateEvent) => {
            if (msgCount > 0 && !sessionEnded) {
                // Prevent going back, show modal
                window.history.pushState(null, '', window.location.pathname);
                setShowExitModal(true);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.history.pushState(null, '', window.location.pathname);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [msgCount, sessionEnded]);

    // Session timer
    useEffect(() => {
        const timer = setInterval(() => {
            const diff = Math.floor((Date.now() - sessionStart) / 1000);
            const mins = Math.floor(diff / 60);
            const secs = diff % 60;
            setElapsed(`${mins}:${secs.toString().padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(timer);
    }, [sessionStart]);

    // Breathing Context
    useEffect(() => {
        if (!showBreathing) return;
        let phase = 0;
        const phases: ('Inhale' | 'Hold' | 'Exhale')[] = ['Inhale', 'Hold', 'Exhale', 'Hold'];
        const intervals = [4000, 4000, 4000, 4000]; // Box breathing (4-4-4-4)
        
        const nextPhase = () => {
            setBreathePhase(phases[phase]);
            setTimeout(() => {
                if (showBreathing) {
                    phase = (phase + 1) % 4;
                    nextPhase();
                }
            }, intervals[phase]);
        };
        nextPhase();
        return () => {};
    }, [showBreathing]);

    // Auto-start session (only if bypassed intent)
    useEffect(() => {
        // if (messages.length === 0 && token) startSession();
    }, [token]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load session history
    useEffect(() => {
        const saved = localStorage.getItem('smile_sessions');
        if (saved) setSessions(JSON.parse(saved));
    }, []);

    const saveSession = useCallback((result: ExtractionResult) => {
        const entry: SessionEntry = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            preview: result?.extracted?.journal_entry?.slice(0, 80) || 'Session completed',
            mood: result?.extracted?.mood_label,
            risk: result?.smile_risk_index,
        };
        const updated = [entry, ...sessions].slice(0, 20);
        setSessions(updated);
        localStorage.setItem('smile_sessions', JSON.stringify(updated));
    }, [sessions]);

    /* 
    const startSession = async () => {
        setIsLoading(true);
        try {
            const res = await conversationAPI.chat('Hi', [], token!);
            setMessages([{ role: 'assistant', content: res.response, timestamp: new Date() }]);
            if (ttsEnabled) speak(res.response);
        } catch {
            setMessages([{
                role: 'assistant',
                content: `Hey ${user?.name?.split(' ')[0]} 👋 This is a safe space. How are you feeling right now?`,
                timestamp: new Date()
            }]);
        }
        setIsLoading(false);
    };
    */

    const handleIntentSelect = (intent: string) => {
        setSessionIntentSelected(true);
        setIsLoading(true);
        setTimeout(async () => {
            try {
                const res = await conversationAPI.chat(`My current focus is: ${intent}. Please greet me based on this.`, [], token!);
                setMessages([{ role: 'assistant', content: res.response, timestamp: new Date() }]);
                if (ttsEnabled) speak(res.response);
            } catch {
                setMessages([{
                    role: 'assistant',
                    content: `Hey ${user?.name?.split(' ')[0]} 👋 I'm ready to focus on ${intent} with you. How are you feeling right now?`,
                    timestamp: new Date()
                }]);
            }
            setIsLoading(false);
        }, 500);
    };

    const speak = (text: string) => {
        if (!ttsEnabled || typeof window === 'undefined') return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.95; u.pitch = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google') || v.lang.startsWith('en'));
        if (preferred) u.voice = preferred;
        window.speechSynthesis.speak(u);
    };

    const sendMessage = async (overrideText?: string) => {
        const text = overrideText || input.trim();
        if (!text || isLoading) return;
        
        const lowerText = text.toLowerCase();
        const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };

        // Automatic Crisis Interception Protocol (ACIP)
        const isCrisis = ['suicide', 'kill myself', 'end it', 'harm myself', 'want to die', 'cut myself', 'end my life'].some(kw => lowerText.includes(kw));
        if (isCrisis) {
            const newMessages: Message[] = [...messages, userMsg, { role: 'assistant', content: "I am so sorry you are feeling this way, but your safety is the most important thing right now. I have overridden this chat to open emergency resources for you. Please reach out to them immediately—there are people who want to support you. You are not alone.", timestamp: new Date() }];
            setMessages(newMessages);
            setInput('');
            setSosOpen(true);
            if (ttsEnabled) speak("I am so sorry you are feeling this way, but your safety is the most important thing right now. I have opened emergency resources for you. Please reach out to them immediately.");
            return;
        }

        // Triggers for specific UI features based on user input
        if (lowerText.includes('breathe') || lowerText.includes('breathing') || lowerText.includes('anxiety right now')) {
            setShowBreathing(true);
        }
        if (lowerText.includes('panic') || lowerText.includes('overwhelmed') || lowerText.includes('grounding') || lowerText.includes('freaking out')) {
            setShowGrounding54321(true);
            setGroundingStep(5);
        }
        if (lowerText.includes('assess me') || lowerText.includes('depression test') || lowerText.includes('check my mood')) {
            setShowAssessment(true);
            const newMessages: Message[] = [...messages, userMsg, { role: 'assistant', content: "I've brought up a quick 2-question screener (PHQ-2) above our chat. Please answer those so I can get a better baseline of how you're doing.", timestamp: new Date() }];
            setMessages(newMessages);
            setInput('');
            setIsLoading(false);
            if (ttsEnabled) speak("I've brought up a quick 2-question screener above our chat. Please answer those so I can get a better baseline.");
            return;
        }

        const newMessages: Message[] = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setShowMoodPicker(false);
        setIsLoading(true);
        setMsgCount(prev => prev + 1);
        try {
            const history = newMessages.map(m => ({ role: m.role, content: m.content }));
            const res = await conversationAPI.chat(userMsg.content, history, token!);
            setMessages(prev => [...prev, { role: 'assistant', content: res.response, timestamp: new Date() }]);
            if (ttsEnabled) speak(res.response);
        } catch (e) {
            console.error('Chat error:', e);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm here with you. Please take your time and tell me more.", timestamp: new Date() }]);
        }
        setIsLoading(false);
    };

    const endSession = async () => {
        setSessionEnded(true);
        setExtracting(true);
        setExtractionStep(0);
        
        // Detailed extraction steps for pure transparency
        const stepTimer = setInterval(() => setExtractionStep(prev => Math.min(prev + 1, 5)), 1200);
        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const res = await conversationAPI.extract(history, token!);
            clearInterval(stepTimer);
            setExtractionStep(5); // Complete
            setExtractResult(res);
            saveSession(res);
        } catch {
            clearInterval(stepTimer);
            setExtractResult({ status: 'error', extracted: { mood_label: 'unknown', data_confidence: 'low' } });
        }
        setExtracting(false);
    };

    const newSession = () => {
        setMessages([]); setSessionEnded(false); setExtractResult(null); setMsgCount(0); setShowBreathing(false); setShowGrounding54321(false); setSessionIntentSelected(false); setShowAssessment(false); setPhqScores({q1: -1, q2: -1});
    };

    const submitAssessment = () => {
        if (phqScores.q1 === -1 || phqScores.q2 === -1) return;
        const total = phqScores.q1 + phqScores.q2;
        let analysis = "";
        if (total >= 3) analysis = "Based on your answers, you're experiencing some significant symptoms of low mood or depression. I want you to know I am here to support you.";
        else analysis = "Based on your answers, your mood seems relatively stable, but I'm still here to listen to whatever is on your mind.";
        
        setShowAssessment(false);
        const newMessages: Message[] = [...messages, { role: 'assistant', content: analysis, timestamp: new Date() }];
        setMessages(newMessages);
        if (ttsEnabled) speak(analysis);
    };

    const toggleRecording = () => {
        if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); return; }
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) { alert("Speech Recognition not supported."); return; }
        const r = new SR();
        r.continuous = false; r.interimResults = true;
        r.onresult = (e: any) => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; setInput(t); };
        r.onerror = () => setIsRecording(false);
        r.onend = () => setIsRecording(false);
        r.start(); recognitionRef.current = r; setIsRecording(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const getScoreColor = (v: number) => v < 30 ? 'text-green-600' : v < 60 ? 'text-amber-500' : 'text-red-600';
    const getRiskBg = (v: number) => v < 30 ? 'bg-green-500' : v < 60 ? 'bg-amber-500' : 'bg-red-500';
    const getRiskLightBg = (v: number) => v < 30 ? 'bg-green-50' : v < 60 ? 'bg-amber-50' : 'bg-red-50';
    const getRiskBorder = (v: number) => v < 30 ? 'border-green-200' : v < 60 ? 'border-amber-200' : 'border-red-200';

    if (authLoading || !user) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="relative">
                <Loader2 size={40} className="text-indigo-600 animate-spin" />
            </div>
        </div>
    );

    // ══════════════════════════════════════════════════════════
    // SESSION ENDED — LIGHT THEME & TRANSPARENT RESULTS
    // ══════════════════════════════════════════════════════════
    if (sessionEnded) {
        const EXTRACTION_STEPS = [
            { label: 'LLaMA-3.3-70B: Extracting conversational context', icon: MessageSquare },
            { label: 'Preparing data array for ML models', icon: Database },
            { label: 'Model 1: Text XGBoost Sentiment Evaluation', icon: FileText },
            { label: 'Model 2: Lifestyle XGBoost Risk Assessment', icon: Activity },
            { label: 'Model 3: Behavioral XGBoost Pattern Analysis', icon: Search },
            { label: 'Weighted Fusion Engine processing...', icon: Cpu },
        ];

        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans relative overflow-x-hidden overflow-y-auto w-full">
                {/* Ambient Soft BG */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] mix-blend-multiply" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[120px] mix-blend-multiply" />
                </div>

                <div className="relative z-10 bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-900/5 p-10 text-center w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar my-4">
                    {extracting ? (
                        <div className="max-w-xl mx-auto py-10">
                            <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-8 shadow-inner shadow-indigo-100/50">
                                <Loader2 size={40} className="text-indigo-600 animate-spin" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Processing your session</h2>
                            <p className="text-sm text-slate-500 mb-10 max-w-md mx-auto">SMILE evaluates your data transparently using a 4-stage pipeline.</p>
                            
                            <div className="space-y-4 text-left">
                                {EXTRACTION_STEPS.map((step, i) => (
                                    <motion.div key={step.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                                        className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 ${
                                            i < extractionStep ? 'bg-green-50 border border-green-200' :
                                            i === extractionStep ? 'bg-indigo-50 border border-indigo-200' :
                                            'bg-slate-50 border border-slate-100'
                                        }`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                            i < extractionStep ? 'bg-green-100 text-green-600' : 
                                            i === extractionStep ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'
                                        }`}>
                                            <step.icon size={16} />
                                        </div>
                                        <span className={`text-sm font-bold flex-1 ${i < extractionStep ? 'text-green-700' : i === extractionStep ? 'text-indigo-700' : 'text-slate-400'}`}>
                                            {step.label}
                                        </span>
                                        {i < extractionStep && <CheckCircle size={18} className="text-green-500 shrink-0" />}
                                        {i === extractionStep && <Loader2 size={18} className="text-indigo-500 animate-spin shrink-0" />}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
                            <div className="w-20 h-20 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={36} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Analysis Complete, {user?.name?.split(' ')[0]}</h2>
                            <p className="text-sm text-slate-500 mb-10 max-w-md mx-auto">Your psychological profile has been updated using our transparent ML pipeline.</p>

                            {/* Core Metrics */}
                            {extractResult?.extracted && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                                    {[
                                        { val: extractResult.extracted.mood_score, suffix: '/10', label: 'Mood', icon: Smile },
                                        { val: extractResult.smile_risk_index, suffix: '%', label: 'SMILE Risk', icon: Activity, color: true },
                                        { val: extractResult.extracted.energy_level, suffix: '', label: 'Energy', icon: Zap, cap: true },
                                        { val: extractResult.extracted.data_confidence, suffix: '', label: 'Confidence', icon: Shield, cap: true },
                                    ].map(s => (
                                        <div key={s.label} className="bg-slate-50 rounded-[1.5rem] p-5 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-3 shadow-sm mx-auto">
                                                <s.icon size={14} className="text-slate-500" />
                                            </div>
                                            <p className={`text-3xl font-black ${s.color ? getScoreColor(Number(s.val) || 0) : 'text-slate-900'} ${s.cap ? 'capitalize text-xl' : ''}`}>
                                                {s.val ?? '—'}{s.suffix}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Transparent Pipeline Breakdown */}
                            {extractResult?.models_used && (
                                <div className="bg-white rounded-[2rem] border border-indigo-100 p-8 mb-8 text-left shadow-lg shadow-indigo-100/50">
                                    <div className="flex items-center gap-3 mb-6 border-b border-indigo-50 pb-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <Brain size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 tracking-tight">AI & ML Pipeline Breakdown</h3>
                                            <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">Full Transparency Report</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* LLM Info */}
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Sparkles size={14} className="text-indigo-500" /> LLaMA Reasoning Engine
                                            </h4>
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 h-full">
                                                <p className="text-[11px] font-medium text-slate-600 leading-relaxed mb-3">
                                                    We used the <strong className="text-indigo-600">Groq LLaMA-3.3-70B</strong> LLM not only for conversation, but to extract structured vectors (sleep, stress, context) formatted specifically for our ML predictors.
                                                </p>
                                                <div className="bg-white p-3 rounded-lg border border-slate-100 text-xs font-mono text-slate-500 overflow-hidden text-ellipsis">
                                                    Reasoning: {extractResult.models_used.reasoning}
                                                </div>
                                            </div>
                                        </div>

                                        {/* ML XGBoost Scores */}
                                        {extractResult.models_used.component_scores && Object.keys(extractResult.models_used.component_scores).length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <Cpu size={14} className="text-blue-500" /> 3 Trained XGBoost Predictors
                                                </h4>
                                                <div className="space-y-4">
                                                    {Object.entries(extractResult.models_used.component_scores).map(([k, v]: [string, any]) => {
                                                        const modelName = k === 'text' ? 'Clinical Text' : k === 'lifestyle' ? 'Lifestyle Behavior' : 'Psych Factors';
                                                        const w = extractResult.weights_used?.[k] || 0.33;
                                                        return (
                                                        <div key={k} className={`p-4 rounded-xl border ${getRiskLightBg(v)} ${getRiskBorder(v)}`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                                    {k === 'text' && <FileText size={12} className="text-slate-500" />}
                                                                    {k === 'lifestyle' && <Activity size={12} className="text-slate-500" />}
                                                                    {k === 'behavior' && <Brain size={12} className="text-slate-500" />}
                                                                    {modelName} (Wt: {w})
                                                                </span>
                                                                <span className={`text-xs font-black ${getScoreColor(v)}`}>{v}%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${v}%` }}
                                                                    transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
                                                                    className={`h-full rounded-full ${getRiskBg(v)}`}
                                                                />
                                                            </div>
                                                        </div>
                                                    )})}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Journal Preview */}
                            {extractResult?.extracted?.journal_entry && (
                                <div className="bg-slate-50 rounded-[2rem] border border-slate-200 p-8 mb-10 text-left shadow-sm">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <FileText size={14} className="text-slate-400" /> Auto-Generated Clinical Summary
                                    </h3>
                                    <p className="text-sm text-slate-700 leading-relaxed italic border-l-4 border-indigo-200 pl-4">&quot;{extractResult.extracted.journal_entry}&quot;</p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button onClick={newSession}
                                    className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                                    <MessageSquare size={16} /> Start Fresh Session
                                </button>
                                <button onClick={() => router.push('/dashboard')}
                                    className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 rounded-xl text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95">
                                    <LayoutDashboard size={16} /> Return to Dashboard
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Exit Confirmation Modal */}
                <AnimatePresence>
                    {showExitModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExitModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-white rounded-[2rem] border border-slate-200 shadow-2xl p-8 max-w-md w-full text-center">
                                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mx-auto mb-6">
                                    <AlertTriangle size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Wait, Session in Progress!</h3>
                                <p className="text-sm text-slate-500 mb-8 leading-relaxed">Leaving now will result in clinical data loss. For accurate wellness tracking, please end the session properly to save insights to your history.</p>
                                
                                <div className="flex flex-col gap-3">
                                    <button onClick={() => setShowExitModal(false)} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Keep Chatting</button>
                                    <button onClick={() => { setShowExitModal(false); endSession(); }} className="w-full py-4 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">End Session & Save</button>
                                    <button onClick={() => router.push('/dashboard')} className="w-full py-2 text-xs font-bold text-red-500 hover:text-red-600 transition-colors">Discard & Force Exit</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════════
    // ENHANCED LIGHT IMMERSIVE CHAT — WITH NEW UI FEATURES
    // ══════════════════════════════════════════════════════════
    
    // Dynamic Ambient Lighting mapping based on user input
    const getAmbientColors = () => {
        const lastMsg = messages.filter(m => m.role === 'user').pop()?.content.toLowerCase() || '';
        if (lastMsg.includes('happy') || lastMsg.includes('great')) return { primary: 'bg-orange-200/40', secondary: 'bg-yellow-200/30', tertiary: 'bg-pink-200/20' };
        if (lastMsg.includes('anxious') || lastMsg.includes('stress') || showBreathing) return { primary: 'bg-purple-200/40', secondary: 'bg-teal-200/30', tertiary: 'bg-blue-300/20' };
        return { primary: 'bg-blue-200/40', secondary: 'bg-indigo-200/30', tertiary: 'bg-purple-200/20' }; // Default neutral 
    };

    const ambient = getAmbientColors();

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans relative overflow-hidden transition-all duration-1000">
            {/* Ambient light floating orbs (Sentiment-responsive!) */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-[3s] ease-in-out">
                <div className={`absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full blur-[120px] transition-colors duration-1000 ${ambient.primary}`} style={{ animation: 'float 20s ease-in-out infinite' }} />
                <div className={`absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-1000 ${ambient.secondary}`} style={{ animation: 'float 25s ease-in-out infinite reverse' }} />
                <div className={`absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full blur-[150px] transition-colors duration-1000 ${ambient.tertiary}`} style={{ animation: 'float 18s ease-in-out infinite 2s' }} />
                
                {/* Noise texture overlay for premium feel */}
                <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
            </div>

            {/* ── Main Chat Area ── */}
            <div className={`relative z-10 flex-1 flex flex-col h-screen transition-all duration-300 ${historyOpen ? 'mr-[380px]' : ''}`}>

                {/* Glassmorphism Top Bar with Enhanced Features */}
                <header className="h-[76px] flex items-center justify-between px-8 bg-white/70 backdrop-blur-3xl border-b border-white shadow-sm shrink-0 z-40 transition-all">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/dashboard')}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-500 group shadow-sm" title="Back to dashboard">
                            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div className="flex items-center gap-3 bg-white pl-1.5 pr-4 py-1.5 rounded-full border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-inner shadow-white/20">
                                    <Bot size={18} className="text-white" />
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white animate-pulse" />
                            </div>
                            <div className="flex flex-col z-10 justify-center">
                                <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none mb-0.5">SMILE AI</h1>
                                <div className="flex items-center gap-1.5">
                                    <span className="flex items-center gap-1 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                        <Clock size={8} /> {elapsed}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Emergency / SOS Button - High Visibility */}
                        <div className="relative">
                            <button onClick={() => setSosOpen(!sosOpen)}
                                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-all shadow-sm">
                                <AlertTriangle size={14} /> Panic / SOS
                            </button>
                            
                            <AnimatePresence>
                                {sosOpen && (
                                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-3 w-[300px] bg-white rounded-2xl border border-red-100 shadow-xl shadow-red-900/10 p-5 z-50">
                                        <div className="flex items-center gap-2 text-red-600 mb-3">
                                            <AlertTriangle size={18} />
                                            <h4 className="text-sm font-black tracking-tight uppercase">Emergency Contacts</h4>
                                        </div>
                                        <p className="text-xs text-slate-600 mb-4 leading-relaxed">If you are in immediate danger or experiencing a crisis, please use the resources below immediately.</p>
                                        <div className="space-y-2">
                                            <a href="tel:988" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-red-50 transition-colors border border-slate-100 hover:border-red-200">
                                                <span className="text-sm font-bold text-slate-800">Suicide & Crisis Line</span>
                                                <span className="flex items-center gap-1 text-xs font-bold text-white bg-red-600 px-2 py-1 rounded-lg"><PhoneCall size={12}/> 988</span>
                                            </a>
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                <span className="text-sm font-bold text-slate-800">Crisis Text Line</span>
                                                <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-1 rounded-lg">Text HOME to 741741</span>
                                            </div>
                                            <button className="w-full flex items-center justify-center gap-2 p-3 mt-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm border border-blue-100 hover:bg-blue-100 transition-colors">
                                                <HandHeart size={16} /> Request Counselor Callback
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Transparency Badge - Expanding */}
                        <div onMouseEnter={() => setPipelineOpen(true)} onMouseLeave={() => setPipelineOpen(false)} className="relative h-10 flex items-center">
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-700 cursor-help transition-all hover:bg-indigo-100/50 h-full">
                                <Brain size={14} />
                                <span className="text-xs font-bold tracking-tight">Active Models: 4</span>
                            </div>
                            <AnimatePresence>
                                {pipelineOpen && (
                                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-3 w-[290px] bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 p-5 z-50 pointer-events-none">
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Pipeline Transparency</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Sparkles size={10} /></div>
                                                <div className="flex-1 text-left">
                                                    <p className="text-xs font-bold text-slate-700 leading-none">LLaMA 3.3 70B</p>
                                                    <p className="text-[9px] text-slate-500">Reasoning & Conversation</p>
                                                </div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><FileText size={10} /></div>
                                                <div className="flex-1 text-left">
                                                    <p className="text-xs font-bold text-slate-700 leading-none">Text XGBoost</p>
                                                    <p className="text-[9px] text-slate-500">Evaluating sentiment text</p>
                                                </div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><Activity size={10} /></div>
                                                <div className="flex-1 text-left">
                                                    <p className="text-xs font-bold text-slate-700 leading-none">Lifestyle & Behavior</p>
                                                    <p className="text-[9px] text-slate-500">2 Models waiting for closure</p>
                                                </div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        {/* Live AI Extraction Action Indicator */}
                        {messages.length > 2 && !isLoading && (
                            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                                <div className="flex gap-0.5 items-end h-3 overflow-hidden">
                                     <motion.div animate={{ height: ['40%', '100%', '40%'] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }} className="w-1 bg-indigo-400 rounded-full" />
                                     <motion.div animate={{ height: ['100%', '40%', '100%'] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }} className="w-1 bg-blue-400 rounded-full" />
                                     <motion.div animate={{ height: ['60%', '100%', '60%'] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }} className="w-1 bg-purple-400 rounded-full" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compiling Context</span>
                            </div>
                        )}

                        <div className="h-8 w-px bg-slate-200 mx-1"></div>

                        {/* Accessibility - Text Size */}
                        <button onClick={() => setTextSize(prev => prev === 'normal' ? 'large' : 'normal')}
                            className={`hidden sm:flex w-10 h-10 items-center justify-center rounded-xl border transition-all shadow-sm ${textSize === 'large' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`} title="Toggle Text Size">
                            <span className="font-serif font-bold text-[16px]">A</span>
                            <span className="font-serif font-bold text-[10px] uppercase ml-px">a</span>
                        </button>

                        <button onClick={() => setTtsEnabled(!ttsEnabled)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all shadow-sm ${ttsEnabled ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`} title="Toggle Voice Response">
                            {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </button>
                        <button onClick={() => setHistoryOpen(!historyOpen)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all shadow-sm ${historyOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                            title="Session history">
                            {historyOpen ? <PanelRightClose size={16} /> : <PanelRight size={16} />}
                        </button>
                        {msgCount >= 2 && (
                            <button onClick={endSession}
                                className="ml-2 px-5 h-10 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95 flex items-center">
                                End Session
                            </button>
                        )}
                    </div>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
                    <div className="max-w-4xl mx-auto relative h-full">
                        {/* Interactive Breathing Widget (Floating & Sticky) */}
                        <AnimatePresence>
                            {showBreathing && (
                                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="sticky top-6 z-30 mx-auto max-w-sm w-full bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-blue-200/50 shadow-2xl shadow-blue-900/10 p-6 text-center overflow-hidden mb-6">
                                    <button onClick={() => setShowBreathing(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-500 hover:border-red-100 transition-colors"><Settings2 size={14}/></button>
                                    
                                    <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center justify-center gap-2 tracking-tight">
                                        <Wind size={20} className="text-blue-500" /> Grounding Exercise
                                    </h3>
                                    <p className="text-[11px] text-slate-500 mb-6 font-bold uppercase tracking-widest">Box Breathing (4-4-4-4)</p>
                                    
                                    <div className="relative w-40 h-40 mx-auto flex items-center justify-center mb-6">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-indigo-50/50 rounded-full border border-blue-100/50" />
                                        <motion.div
                                            animate={{
                                                scale: breathePhase === 'Inhale' ? 1.6 : breathePhase === 'Exhale' ? 0.8 : 1.2,
                                                backgroundColor: breathePhase === 'Inhale' ? '#dbeafe' : breathePhase === 'Exhale' ? '#f1f5f9' : '#e0e7ff',
                                                boxShadow: breathePhase === 'Inhale' ? '0 0 50px rgba(59, 130, 246, 0.4)' : '0 0 10px rgba(59, 130, 246, 0.1)'
                                            }}
                                            transition={{ duration: 4, ease: "easeInOut" }}
                                            className="absolute w-24 h-24 rounded-full z-0 mix-blend-multiply"
                                        />
                                        <div className="relative z-10 text-xl font-black text-blue-700 tracking-[0.2em] uppercase">
                                            {breathePhase}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="max-w-3xl mx-auto space-y-6">

                        {/* Intent Selector Pre-Chat State */}
                        {messages.length === 0 && !sessionIntentSelected && !isLoading && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                className="text-center py-10 select-none">
                                <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 border border-indigo-100 shadow-sm flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
                                    <Brain size={36} className="text-indigo-500 relative z-10" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Hi, {user?.name?.split(' ')[0] || 'there'}.</h2>
                                <p className="text-sm font-medium text-slate-500 mb-8 max-w-sm mx-auto">
                                    Before we begin, how would you like me to support you today?
                                </p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                    {[
                                        { label: 'Just Venting', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', desc: 'I need to express my thoughts and be heard.' },
                                        { label: 'Anxiety Relief', icon: Wind, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', desc: 'Guide me through calming exercises and grounding.' },
                                        { label: 'Problem Solving', icon: Search, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', desc: 'Help me find structured solutions to my challenges.' },
                                        { label: 'Feeling Low', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', desc: 'Support me through sadness and find inspiration.' },
                                    ].map(intent => (
                                        <button key={intent.label} onClick={() => handleIntentSelect(intent.label)} className={`flex items-start gap-4 p-5 rounded-[2rem] border ${intent.border} bg-white/70 backdrop-blur-md hover:${intent.bg} transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95 group text-left h-full`}>
                                            <div className={`w-12 h-12 rounded-2xl ${intent.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                                                <intent.icon size={22} className={`${intent.color}`} />
                                            </div>
                                            <div>
                                                <span className="text-base font-black text-slate-800 block mb-0.5">{intent.label}</span>
                                                <span className="text-xs font-medium text-slate-500 leading-tight block">{intent.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Interactive Grounding 5-4-3-2-1 Widget */}
                        <AnimatePresence>
                            {showGrounding54321 && (
                                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="sticky top-6 z-30 mx-auto max-w-lg w-full bg-white/95 backdrop-blur-3xl rounded-[2.5rem] border border-teal-200/50 shadow-2xl shadow-teal-900/10 p-8 overflow-hidden mb-6">
                                    <button onClick={() => setShowGrounding54321(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-500 hover:border-red-100 transition-colors"><Settings2 size={14}/></button>
                                    
                                    <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2 tracking-tight">
                                        <Shield size={20} className="text-teal-500" /> 5-4-3-2-1 Grounding
                                    </h3>
                                    <p className="text-xs text-slate-500 mb-6 font-medium">This technique helps bring you back to the present moment when you feel overwhelmed.</p>
                                    
                                    <div className="space-y-4">
                                        {[
                                            { num: 5, label: "Things you can SEE", desc: "Look around you and name 5 objects." },
                                            { num: 4, label: "Things you can FEEL", desc: "Pay attention to your body. Think of 4 sensations (clothes on your skin, a breeze)." },
                                            { num: 3, label: "Things you can HEAR", desc: "Listen carefully. Identify 3 distinct sounds." },
                                            { num: 2, label: "Things you can SMELL", desc: "Notice 2 smells around you. Or name your 2 favorite smells." },
                                            { num: 1, label: "Thing you can TASTE", desc: "What does the inside of your mouth taste like right now?" }
                                        ].map((step) => (
                                            <div key={step.num} onClick={() => setGroundingStep(step.num)} className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-4 ${groundingStep === step.num ? 'bg-teal-50 border-teal-200 shadow-md shadow-teal-500/10 ring-2 ring-teal-500/20' : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'}`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shrink-0 transition-colors ${groundingStep === step.num ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30' : 'bg-slate-100 text-slate-400'}`}>
                                                    {step.num}
                                                </div>
                                                <div>
                                                    <h4 className={`text-sm font-bold ${groundingStep === step.num ? 'text-teal-800' : 'text-slate-700'}`}>{step.label}</h4>
                                                    <AnimatePresence>
                                                        {groundingStep === step.num && (
                                                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-teal-600 mt-1 font-medium leading-relaxed">
                                                                {step.desc}
                                                            </motion.p>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Inline Clinical Assessment (PHQ-2) */}
                        <AnimatePresence>
                            {showAssessment && (
                                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="mx-auto max-w-xl w-full bg-white rounded-[2.5rem] border border-blue-200 shadow-xl shadow-blue-900/5 p-8 mb-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full z-0 pointer-events-none" />
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                                <FileText size={20} className="text-blue-600" /> PHQ-2 Screening
                                            </h3>
                                            <button onClick={() => setShowAssessment(false)} className="text-slate-400 hover:text-red-500 transition-colors"><Settings2 size={16}/></button>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium mb-6">Over the last 2 weeks, how often have you been bothered by the following problems?</p>
                                        
                                        <div className="space-y-6">
                                            {/* Question 1 */}
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 mb-3">1. Little interest or pleasure in doing things.</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    {['Not at all', 'Several days', 'More than half', 'Nearly everyday'].map((opt, i) => (
                                                        <button key={opt} onClick={() => setPhqScores(p => ({...p, q1: i}))}
                                                            className={`p-2 rounded-xl text-xs font-bold border transition-all ${phqScores.q1 === i ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'}`}>
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Question 2 */}
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 mb-3">2. Feeling down, depressed, or hopeless.</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    {['Not at all', 'Several days', 'More than half', 'Nearly everyday'].map((opt, i) => (
                                                        <button key={opt} onClick={() => setPhqScores(p => ({...p, q2: i}))}
                                                            className={`p-2 rounded-xl text-xs font-bold border transition-all ${phqScores.q2 === i ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'}`}>
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-8 flex justify-end">
                                            <button 
                                                disabled={phqScores.q1 === -1 || phqScores.q2 === -1}
                                                onClick={submitAssessment}
                                                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center gap-2">
                                                Submit Answers <Send size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Welcome empty state (Fallback if needed) */}
                        {messages.length === 1 && !isLoading && !sessionIntentSelected && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="text-center py-12 select-none">
                                <div className="w-20 h-20 rounded-[2rem] bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-6 transform rotate-3 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-50/50" />
                                    <HeartPulse size={36} className="text-blue-500/80 relative z-10 animate-pulse" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">This is your safe space.</h2>
                                <p className="text-sm font-medium text-slate-500 bg-white inline-flex px-4 py-2 rounded-xl border border-slate-100 shadow-sm mt-2">
                                    <Shield size={14} className="inline mr-2 text-green-500" />
                                    Everything you share is encrypted and strictly private
                                </p>
                            </motion.div>
                        )}

                        <AnimatePresence>
                            {messages.map((msg, idx) => (
                                <motion.div key={idx}
                                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                                    className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    
                                    {msg.role === 'assistant' && (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 ring-4 ring-white mt-1">
                                            <Sparkles size={16} className="text-white" />
                                        </div>
                                    )}

                                    <div className={`max-w-[75%] lg:max-w-[65%] relative group ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white px-6 py-4 rounded-[1.5rem] rounded-tr-sm shadow-xl shadow-indigo-600/10'
                                        : 'bg-white text-slate-700 px-6 py-4 rounded-[1.5rem] rounded-tl-sm border border-slate-200 shadow-sm'
                                    }`}>
                                        <p className={`${textSize === 'normal' ? 'text-[15px]' : 'text-[18px]'} leading-relaxed whitespace-pre-wrap font-medium transition-all`}>{msg.content}</p>
                                        <p className={`text-[9px] font-bold mt-2 uppercase tracking-widest ${msg.role === 'user' ? 'text-indigo-200/60 text-right' : 'text-slate-400'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    {msg.role === 'user' && (
                                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 text-white text-[12px] font-bold shadow-md ring-4 ring-white mt-1">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Adaptive Quick Reply Chips based on context */}
                        {messages.length % 2 !== 0 && messages[messages.length - 1].role === 'assistant' && !isLoading && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 }}
                                className="flex flex-wrap gap-2 pl-14"
                            >
                                {QUICK_REPLIES.slice(0, 3 + (messages.length < 3 ? 1 : 0)).map((qr) => (
                                    <button key={qr} onClick={() => sendMessage(qr)}
                                        className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] active:scale-95">
                                        {qr}
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {/* Transparent Typing Indicator */}
                        {isLoading && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 ring-4 ring-white mt-1">
                                    <Sparkles size={16} className="text-white" />
                                </div>
                                <div>
                                    <div className="bg-white border border-slate-200 rounded-[1.5rem] rounded-tl-sm px-6 py-5 shadow-sm max-w-[200px]">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-300 animate-bounce [animation-delay:-0.3s]" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" />
                                            </div>
                                        </div>
                                    </div>
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-2 flex items-center gap-1.5">
                                        <Loader2 size={10} className="animate-spin inline text-indigo-400" />
                                        SMILE is analyzing context...
                                    </motion.p>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                    </div>
                </div>

                {/* ── Advanced Input Bar ── */}
                <div className="px-8 py-5 bg-white/80 backdrop-blur-3xl border-t border-white shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.05)] shrink-0 z-20 transition-all">
                    {/* Recording Indicator */}
                    {isRecording && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 mb-4 px-6 py-4 bg-red-50 border border-red-100 rounded-2xl max-w-3xl mx-auto shadow-inner shadow-red-100/50">
                            <div className="flex gap-1 items-center h-4">
                                {[...Array(6)].map((_, index) => (
                                    <div key={index} className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: `${8 + (index * 3) % 10}px`, animationDelay: `${index * 0.15}s` }} />
                                ))}
                            </div>
                            <span className="text-sm font-bold text-red-600 uppercase tracking-widest">Listening... speak now</span>
                            <button onClick={toggleRecording} className="ml-auto px-4 py-1.5 bg-white rounded-lg text-xs font-bold text-red-500 shadow-sm border border-red-100 hover:bg-red-50 transition-colors">Stop Recording</button>
                        </motion.div>
                    )}

                    {/* Mood Quick-Picker Context Menu */}
                    <AnimatePresence>
                        {showMoodPicker && (
                            <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="flex items-center gap-2 mb-4 max-w-3xl mx-auto p-3 bg-white border border-slate-200 rounded-[1.5rem] shadow-xl shadow-slate-900/5 overflow-x-auto custom-scrollbar">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1 ml-2 shrink-0">I am feeling</span>
                                {MOOD_EMOJIS.map(m => (
                                    <button key={m.label} onClick={() => { sendMessage(m.text); setShowMoodPicker(false); }}
                                        className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm transition-all active:scale-95 shrink-0">
                                        <span className="text-lg group-hover:scale-110 transition-transform">{m.emoji}</span>
                                        <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600 whitespace-nowrap">{m.label}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-end gap-3 max-w-3xl mx-auto">
                        {/* Action Toolbar on left */}
                        <div className="flex flex-col gap-2 shrink-0 pb-1">
                            <button onClick={toggleRecording}
                                className={`w-11 h-11 rounded-[1rem] flex items-center justify-center transition-all shadow-sm ${isRecording
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                                    : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50 hover:text-slate-600 hover:border-slate-300'
                                }`} title="Voice Input">
                                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                            <button onClick={() => setShowMoodPicker(!showMoodPicker)}
                                className={`w-11 h-11 rounded-[1rem] flex items-center justify-center transition-all shadow-sm ${showMoodPicker
                                    ? 'bg-blue-50 border border-blue-200 text-blue-600 shadow-inner'
                                    : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50 hover:text-slate-600 hover:border-slate-300'
                                }`} title="Quick Emote">
                                <Smile size={20} />
                            </button>
                        </div>

                        {/* Enhanced Text Input with Elasticity & Micro-Interactions */}
                        <div className="flex-1 relative group">
                            <motion.div
                                animate={{
                                    boxShadow: input.trim().length > 0 ? '0 8px 30px rgba(59, 130, 246, 0.15)' : '0 2px 10px rgba(0, 0, 0, 0.05)',
                                    scale: input.trim().length > 0 ? 1.01 : 1
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className="relative rounded-2xl bg-white border border-slate-200 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-400 transition-all duration-300"
                            >
                                {input.trim().length > 10 && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute -top-3 left-4 bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-blue-200 z-10 shadow-sm">
                                        Typing...
                                    </motion.div>
                                )}
                                <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                                    placeholder="Share what's on your mind... (or use voice)"
                                    rows={Math.min(4, Math.max(1, input.split('\n').length))}
                                    className={`w-full px-6 py-4 bg-transparent border-none ${textSize === 'normal' ? 'text-[15px]' : 'text-[18px]'} font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-0 resize-none transition-all caret-blue-600 custom-scrollbar max-h-[120px]`} />
                                
                                {/* Send Button embedded securely inside text area visual bounds */}
                                <motion.button onClick={() => sendMessage()} disabled={!input.trim() || isLoading}
                                    whileHover={{ scale: input.trim() ? 1.05 : 1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="absolute right-3 bottom-3 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-[0_4px_15px_rgba(59,130,246,0.2)] disabled:opacity-30 disabled:cursor-not-allowed transition-opacity z-10">
                                    <Send size={16} className="ml-1" />
                                </motion.button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════ Light Mode Session History Sidebar ══════ */}
            <AnimatePresence>
                {historyOpen && (
                    <motion.aside
                        initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed right-4 top-4 bottom-4 w-[380px] bg-white border border-slate-200 rounded-[2rem] z-50 flex flex-col shadow-2xl shadow-slate-900/10 overflow-hidden">
                        
                        <div className="h-[76px] flex items-center justify-between px-6 border-b border-slate-100 shrink-0 bg-slate-50/80 backdrop-blur-md">
                            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 tracking-tight">
                                <Clock size={16} className="text-blue-500" /> Session History Archives
                            </h2>
                            <div className="flex bg-white rounded-xl border border-slate-200 shadow-sm">
                                <button onClick={() => setHistoryOpen(false)} className="px-3 py-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors rounded-xl font-bold text-xs flex items-center gap-1">
                                    Close <PanelRightClose size={12} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/30">
                            {sessions.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 transform -rotate-3">
                                        <MessageSquare size={24} className="text-slate-400" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">No sessions yet</p>
                                    <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">Your completed check-ins will magically appear here.</p>
                                </div>
                            ) : (
                                sessions.map((s, i) => (
                                    <motion.div key={s.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="p-5 rounded-[1.5rem] bg-white border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all group cursor-default">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> {s.date}</span>
                                            {s.risk != null && (
                                                <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                                                    s.risk < 30 ? 'bg-green-50 text-green-600 border border-green-100' : s.risk < 60 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-red-50 text-red-600 border border-red-100'
                                                }`}>{s.risk}% RISK</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-3 group-hover:text-slate-900 transition-colors">&quot;{s.preview}&quot;</p>
                                        <div className="flex items-center gap-2 mt-4">
                                            {s.mood && (
                                                <span className="inline-block text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">{s.mood}</span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {sessions.length > 0 && (
                            <div className="p-5 border-t border-slate-100 shrink-0 bg-white">
                                <button onClick={() => { setSessions([]); localStorage.removeItem('smile_sessions'); }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm">
                                    <Trash2 size={14} /> Clear Full History
                                </button>
                            </div>
                        )}
                    </motion.aside>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    25% { transform: translateY(-20px) translateX(10px); }
                    50% { transform: translateY(5px) translateX(-5px); }
                    75% { transform: translateY(-15px) translateX(15px); }
                }
            `}</style>
        </div>
    );
}
