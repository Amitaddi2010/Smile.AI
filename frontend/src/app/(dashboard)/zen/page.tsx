'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { 
    Wind, Volume2, VolumeX, Moon, Heart, Settings2, Play, Pause, 
    ChevronLeft, Sparkles, Droplets, Leaf, Maximize2, Minimize2, Music, 
    Smile, Zap, Waves, Brain, Clock, ShieldCheck, Quote, Trophy, RefreshCcw,
    X, ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { dashboardAPI } from '@/lib/api';

const MANTRAS = [
    "I am grounded. I am calm.",
    "Breathe in peace, breathe out tension.",
    "My mind is clear and my body is relaxed.",
    "I am present in this moment.",
    "Every breath I take is a step towards serenity.",
    "I release what I cannot control."
];

const SOUNDSCAPES = [
    { id: 'forest', name: 'Emerald Forest', icon: Leaf, color: 'text-emerald-400', freq: 432, desc: 'Binaural Wind & Rustle' },
    { id: 'ocean', name: 'Deep Tide', icon: Waves, color: 'text-blue-400', freq: 528, desc: 'Low-Frequency Rhythms' },
    { id: 'rain', name: 'Celestial Rain', icon: Droplets, color: 'text-sky-400', freq: 639, desc: 'High-Fidelity droplets' },
    { id: 'white', name: 'Pure Void', icon: Wind, color: 'text-white/60', freq: 741, desc: 'Deep Alpha Drone' }
];

const MODES = {
    calm: {
        inhale: 4,
        hold: 4,
        exhale: 6,
        label: 'Calm Down',
        desc: 'Soft & Flowing',
        icon: Wind,
        accent: '#60a5fa',
        grad: 'from-blue-900/40 via-teal-900/20 to-slate-950',
        orb: 'bg-blue-400/20'
    },
    focus: {
        inhale: 4,
        hold: 2,
        exhale: 4,
        label: 'Deep Focus',
        desc: 'Steady & Sharp',
        icon: Brain,
        accent: '#a78bfa',
        grad: 'from-purple-900/40 via-indigo-900/20 to-slate-950',
        orb: 'bg-purple-400/20'
    },
    rest: {
        inhale: 5,
        hold: 5,
        exhale: 5,
        label: 'Deep Sleep',
        desc: 'Slow & Deep',
        icon: Moon,
        accent: '#f43f5e',
        grad: 'from-rose-900/30 via-orange-900/10 to-slate-950',
        orb: 'bg-rose-400/20'
    }
};

export default function ZenZonePage() {
    const router = useRouter();
    const { token } = useAuth();
    const [mode, setMode] = useState<keyof typeof MODES>('calm');
    const [breathePhase, setBreathePhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
    const [timer, setTimer] = useState(MODES['calm'].inhale);
    const [isPlaying, setIsPlaying] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [activeSound, setActiveSound] = useState('forest');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [mantraIndex, setMantraIndex] = useState(0);
    const [sessionTime, setSessionTime] = useState(0);
    const [showIntentSelector, setShowIntentSelector] = useState(true);
    const [showSummary, setShowSummary] = useState(false);
    
    // Advanced Audio Engine Refs
    const audioCtx = useRef<AudioContext | null>(null);
    const mainGain = useRef<GainNode | null>(null);
    const noiseNode = useRef<AudioBufferSourceNode | null>(null);
    const filterNode = useRef<BiquadFilterNode | null>(null);
    const lfo = useRef<OscillatorNode | null>(null);
    const lfoGain = useRef<GainNode | null>(null);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothX = useSpring(mouseX, { damping: 20, stiffness: 100 });
    const smoothY = useSpring(mouseY, { damping: 20, stiffness: 100 });

    // Generate White Noise Buffer
    const createNoiseBuffer = (ctx: AudioContext) => {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    };

    // Interaction Handlers
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            setShowControls(true);
            if (isPlaying) {
                const timeout = setTimeout(() => setShowControls(false), 4000);
                return () => clearTimeout(timeout);
            }
        };
        const handleTouch = () => setShowControls(true);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchstart', handleTouch);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchstart', handleTouch);
        };
    }, [isPlaying]);

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // Advanced Audio Logic
    useEffect(() => {
        if (soundEnabled && isPlaying) {
            if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const ctx = audioCtx.current;

            // Cleanup previous
            mainGain.current?.disconnect();
            noiseNode.current?.stop();
            lfo.current?.stop();

            mainGain.current = ctx.createGain();
            mainGain.current.gain.setValueAtTime(0, ctx.currentTime);
            mainGain.current.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2);
            mainGain.current.connect(ctx.destination);

            noiseNode.current = ctx.createBufferSource();
            noiseNode.current.buffer = createNoiseBuffer(ctx);
            noiseNode.current.loop = true;

            filterNode.current = ctx.createBiquadFilter();
            
            // Mode-specific synthesis - Enhanced for distinctiveness
            if (activeSound === 'ocean') {
                // Deep Tide: Heavy Low-pass noise with slower, deeper LFO
                filterNode.current.type = 'lowpass';
                filterNode.current.frequency.setValueAtTime(250, ctx.currentTime);
                filterNode.current.Q.setValueAtTime(4, ctx.currentTime);

                lfo.current = ctx.createOscillator();
                lfoGain.current = ctx.createGain();
                lfo.current.frequency.setValueAtTime(0.08, ctx.currentTime); // 12-second deep wave
                lfoGain.current.gain.setValueAtTime(0.2, ctx.currentTime);
                
                lfo.current.connect(lfoGain.current);
                lfoGain.current.connect(mainGain.current.gain);
                lfo.current.start();
            } else if (activeSound === 'rain') {
                // Celestial Rain: High-pass noise with 'pitter-patter' modulation
                filterNode.current.type = 'highpass';
                filterNode.current.frequency.setValueAtTime(3500, ctx.currentTime);
                filterNode.current.Q.setValueAtTime(1, ctx.currentTime);

                const modulator = ctx.createOscillator();
                const mGain = ctx.createGain();
                modulator.frequency.setValueAtTime(8, ctx.currentTime); // Fast pitter-patter
                mGain.gain.setValueAtTime(0.05, ctx.currentTime);
                modulator.connect(mGain);
                mGain.connect(filterNode.current.frequency);
                modulator.start();
            } else if (activeSound === 'forest') {
                // Emerald Forest: Dual Band-pass for wind whistling
                filterNode.current.type = 'bandpass';
                filterNode.current.frequency.setValueAtTime(1200, ctx.currentTime);
                filterNode.current.Q.setValueAtTime(12, ctx.currentTime);
                
                const windMod = ctx.createOscillator();
                const wGain = ctx.createGain();
                windMod.frequency.setValueAtTime(0.2, ctx.currentTime);
                wGain.gain.setValueAtTime(400, ctx.currentTime);
                windMod.connect(wGain);
                wGain.connect(filterNode.current.frequency);
                windMod.start();
            } else {
                // Pure Void: Deep Binaural drone
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(50, ctx.currentTime);
                const oscGain = ctx.createGain();
                oscGain.gain.setValueAtTime(0.2, ctx.currentTime);
                osc.connect(oscGain);
                oscGain.connect(mainGain.current);
                osc.start();
                lfo.current = osc;
            }

            noiseNode.current.connect(filterNode.current);
            filterNode.current.connect(mainGain.current);
            noiseNode.current.start();

        } else {
            mainGain.current?.gain.linearRampToValueAtTime(0, (audioCtx.current?.currentTime || 0) + 1);
            setTimeout(() => {
                noiseNode.current?.stop();
                lfo.current?.stop();
            }, 1000);
        }

        return () => {
            noiseNode.current?.stop();
            lfo.current?.stop();
        };
    }, [soundEnabled, isPlaying, activeSound]);

    // Breathing Logic
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setSessionTime(prev => prev + 1);
            setTimer((prev) => {
                if (prev === 1) {
                    const currentMode = MODES[mode];
                    if (breathePhase === 'Inhale') {
                        setBreathePhase('Hold');
                        return currentMode.hold;
                    } else if (breathePhase === 'Hold') {
                        setBreathePhase('Exhale');
                        return currentMode.exhale;
                    } else {
                        setBreathePhase('Inhale');
                        return currentMode.inhale;
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying, breathePhase, mode]);

    // Reset timer when mode changes
    useEffect(() => {
        setTimer(MODES[mode].inhale);
        setBreathePhase('Inhale');
    }, [mode]);

    // Mantra Rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setMantraIndex(prev => (prev + 1) % MANTRAS.length);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleEndSession = async () => {
        setIsPlaying(false);
        setShowSummary(true);
        
        // Log to backend if token exists
        if (token && sessionTime > 10) {
            try {
                await dashboardAPI.logZenSession(sessionTime, token);
                console.log("Wellness XP synchronized successfully");
            } catch (err) {
                console.error("Failed to sync Wellness XP:", err);
            }
        }
    };

    const [portalLoaded, setPortalLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setPortalLoaded(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (!portalLoaded) {
        return (
            <div className="fixed inset-0 bg-[#020617] flex items-center justify-center z-[200]">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="w-16 h-16 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] animate-pulse">Neural Portal Initializing</p>
                </motion.div>
            </div>
        );
    }

    const config = MODES[mode];

    if (showSummary) {
        return (
            <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-6 z-[2000] overflow-y-auto">
                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-transparent" />
                 <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 max-w-lg w-full bg-slate-900/50 border border-white/10 backdrop-blur-3xl rounded-[3rem] p-12 text-center"
                 >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-8">
                        <Trophy size={40} />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-2">Serenity Achieved</h2>
                    <p className="text-slate-400 mb-6">You've successfully synchronized your neural rhythms.</p>
                    
                    <div className="flex items-center justify-center gap-2 mb-8 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit mx-auto">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Wellness XP Synchronized</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                            <Clock className="text-blue-400 mb-2 mx-auto" size={20} />
                            <p className="text-2xl font-black text-white">{Math.floor(sessionTime / 60)}m {sessionTime % 60}s</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Flow Time</p>
                        </div>
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                            <Smile className="text-emerald-400 mb-2 mx-auto" size={20} />
                            <p className="text-2xl font-black text-white">+{Math.floor(sessionTime / 10)}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Wellness XP</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push('/dashboard')}
                            className="w-full py-5 rounded-[2rem] bg-white text-slate-950 font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-white/20 transition-all"
                        >
                            Return to Dashboard
                        </motion.button>
                        <button
                            onClick={() => { setShowSummary(false); setSessionTime(0); setShowIntentSelector(true); }}
                            className="flex items-center gap-2 text-slate-500 hover:text-white mx-auto text-[10px] font-black uppercase tracking-[0.2em] py-2"
                        >
                            <RefreshCcw size={14} /> Restart Session
                        </button>
                    </div>
                 </motion.div>
            </div>
        );
    }

    if (showIntentSelector) {
        return (
            <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-6 z-[1000] overflow-y-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-30 animate-pulse" />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="relative z-10 max-w-2xl w-full text-center py-12"
                >
                    <div className="mb-12 inline-flex p-4 rounded-3xl bg-white/5 border border-white/10">
                        <Sparkles className="text-blue-400" size={32} />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">The Silence Portal</h1>
                    <p className="text-slate-400 font-medium mb-12 px-6">Your personal sanctuary for neurological recalibration.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-4">
                        {(Object.entries(MODES) as [keyof typeof MODES, typeof MODES['calm']][]).map(([key, i]) => (
                            <motion.button
                                key={key}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { setMode(key); setShowIntentSelector(false); }}
                                className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all flex flex-col items-center gap-4 group"
                            >
                                <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                                    <i.icon size={28} />
                                </div>
                                <div className="text-center">
                                    <h4 className="text-white font-black text-sm tracking-tight">{i.label}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{i.desc}</p>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/dashboard')}
                        className="mt-12 flex items-center gap-2 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                        <ArrowLeft size={14} /> Back to Dashboard
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#020617] overflow-hidden transition-all duration-1000 z-[100] cursor-default">
            {/* Background Layer */}
            <div className={`absolute inset-0 transition-all duration-[3000ms] bg-gradient-to-b ${config.grad}`} />
            <motion.div 
                style={{ x: smoothX, y: smoothY, translateX: '-50%', translateY: '-50%' }}
                className={`absolute w-[60vw] h-[60vw] rounded-full blur-[160px] opacity-30 mix-blend-screen pointer-events-none transition-colors duration-1000 ${config.orb}`}
            />
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

            {/* Minimal Interactive HUD (Non-obstructive) */}
            <AnimatePresence>
                {showControls && isPlaying && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ x: smoothX, y: smoothY, translateX: '-50%', translateY: '-50%' }}
                        className="fixed top-0 left-0 w-12 h-12 rounded-full border border-white/10 z-[100] flex items-center justify-center mix-blend-difference pointer-events-none"
                    >
                        <div className="w-1 h-1 bg-white/40 rounded-full" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header HUD - Responsive & Pro */}
            <header className={`absolute top-0 left-0 right-0 p-4 md:p-10 flex justify-between items-center z-50 transition-all duration-700 ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isFullscreen ? toggleFullscreen : handleEndSession}
                    className="group flex items-center gap-4 text-white hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.3em] bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 hover:border-white/20 shadow-xl"
                >
                    {isFullscreen ? <Minimize2 size={16} /> : <ArrowLeft size={16} />}
                    <span className="hidden md:inline">{isFullscreen ? 'Exit Fullscreen' : 'Exit Portal'}</span>
                </motion.button>

                <div className="flex items-center gap-4">
                    <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-2xl flex items-center gap-4">
                         <span className="text-white font-black text-[10px] tracking-widest uppercase opacity-40 mr-2">{mode} Mode</span>
                         <span className="text-blue-400 font-mono text-xs tabular-nums">
                            {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    </div>
                </div>
            </header>

            <main className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 transition-transform duration-1000">
                <AnimatePresence mode="wait">
                    {!showControls && isPlaying && (
                        <motion.div
                            key={mantraIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 0.3, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-[15%] md:top-[18%] text-white font-serif italic text-lg md:text-2xl tracking-wide text-center px-8 md:px-12 max-w-2xl pointer-events-none"
                        >
                            <Quote size={20} className="inline-block mr-3 mb-1 opacity-50 rotate-180" />
                            {MANTRAS[mantraIndex]}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* The Core Orb HUD */}
                <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
                    <AnimatePresence>
                        {isPlaying && [...Array(2)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: [0, 0.1, 0], scale: [0.8, 2.2] }}
                                transition={{ duration: 8, repeat: Infinity, delay: i * 4 }}
                                className="absolute inset-0 border border-white/10 rounded-full"
                            />
                        ))}
                    </AnimatePresence>

                    {/* The Breathing Orb */}
                    <motion.div
                        animate={{ 
                            scale: !isPlaying ? 1 : breathePhase === 'Inhale' ? 1.7 : breathePhase === 'Exhale' ? 0.9 : 1.3,
                            backgroundColor: breathePhase === 'Inhale' ? 'rgba(219,234,254,0.15)' : 'rgba(255,255,255,0.02)',
                            boxShadow: breathePhase === 'Inhale' ? `0 0 100px ${config.accent}33` : '0 0 20px rgba(255,255,255,0.05)',
                        }}
                        transition={{ duration: timer, ease: "easeInOut" }}
                        className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full border border-white/10"
                        style={{ borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%' }}
                    />
                    
                    <div className="relative z-20 flex flex-col items-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={breathePhase}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-center"
                            >
                                <div className={`relative z-10 text-xl font-black tracking-[0.2em] uppercase transition-colors duration-1000 ${
                                            breathePhase === 'Inhale' ? 'text-blue-900' : 'text-blue-700'
                                        }`}>
                                            {breathePhase}
                                        </div>
                                <div className="text-5xl md:text-7xl font-thin text-white/20 font-mono tracking-tighter">
                                    00:{timer.toString().padStart(2, '0')}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Controls Layer */}
                <motion.div 
                    animate={{ y: showControls ? 0 : 60, opacity: showControls ? 1 : 0 }}
                    className="mt-12 md:mt-16 flex flex-col items-center gap-6 md:gap-10 w-full max-w-4xl px-4"
                >
                    <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                        {SOUNDSCAPES.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSound(s.id)}
                                className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeSound === s.id ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'}`}
                            >
                                <s.icon size={12} className={activeSound === s.id ? 'text-slate-900' : s.color} />
                                <span className="hidden md:inline">{s.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-10 md:gap-16">
                        <div className="flex gap-3 md:gap-5">
                            <button onClick={() => setSoundEnabled(!soundEnabled)} className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all shadow-xl group">
                                {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-white text-slate-900 text-[8px] font-black px-2 py-1 rounded">SOUND</div>
                            </button>
                            <button onClick={toggleFullscreen} className="hidden sm:flex w-16 h-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all group">
                                {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-white text-slate-900 text-[8px] font-black px-2 py-1 rounded">SCREEN</div>
                            </button>
                        </div>

                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={`w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center transition-all border-2 ${isPlaying ? 'bg-white/5 border-white/20 text-white' : 'bg-white border-transparent text-slate-900 shadow-2xl shadow-blue-500/20'}`}
                        >
                            {isPlaying ? <Pause size={48} /> : <Play size={48} className="ml-2" />}
                        </button>

                        <div className="flex gap-3 md:gap-5">
                            <button onClick={() => setShowIntentSelector(true)} className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all group">
                                <Settings2 size={24} />
                                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-white text-slate-900 text-[8px] font-black px-2 py-1 rounded">INTENT</div>
                            </button>
                            <div className="hidden sm:flex w-16 h-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40 opacity-20">
                                <ShieldCheck size={24} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>

            <footer className={`absolute bottom-6 md:bottom-12 left-6 md:left-12 right-6 md:right-12 flex justify-between items-end z-50 transition-opacity duration-700 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="hidden md:block space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <Waves size={16} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">Neural Stability Factor</p>
                            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div animate={{ width: isPlaying ? ['20%', '95%', '40%'] : '5%' }} transition={{ duration: 10, repeat: Infinity }} className="h-full bg-blue-500" />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="text-right">
                    <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">Proprietary HRV Engine v4.0</p>
                    <p className="text-[8px] font-bold text-white/5 uppercase tracking-[0.2em] mt-1">© SMILE CLINICAL NEURAL LABS</p>
                </div>
            </footer>

            <style jsx global>{`
                body { background: #020617; overflow: hidden; }
                .no-select { user-select: none; }
            `}</style>
        </div>
    );
}
