"use client";

import Link from 'next/link';
import InteractiveDemo from '@/components/InteractiveDemo';
import { Logo } from '@/components/Logo';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Brain, Shield, BarChart3, Users, Heart, ArrowRight, Activity, TrendingUp, Lock, Zap, Sparkles, X, Eye, Cpu, Layers } from 'lucide-react';

/* ── Animated Counter Hook ── */
function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!startOnView || !isInView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, isInView, startOnView]);
  return { count, ref };
}

/* ── Animation Variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

/* ── Stat Counter Card ── */
function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value, 1800);
  return (
    <div ref={ref} className="text-center group transition-transform hover:-translate-y-1">
      <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0f172a] mb-2 tracking-tighter tabular-nums">
        {count}{suffix}
      </div>
      <div className="text-xs sm:text-sm font-bold text-[#1e40af] uppercase tracking-widest opacity-80">
        {label}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen selection:bg-[#1e40af]/10" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
      {/* ═══════════════════ NAVIGATION ═══════════════════ */}
      <header className="fixed top-0 w-full z-50 glass-nav shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white drop-shadow-sm">
            <Logo className="w-8 h-8" variant="white" />
            SMILE
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <Link href="#features" className="hover:text-white transition-colors relative group">
              Features<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
            </Link>
            <Link href="/about" className="hover:text-white transition-colors relative group">
              About<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
            </Link>
            <Link href="#impact" className="hover:text-white transition-colors relative group">
              Impact<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
            </Link>
          </nav>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/login" className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Log In</Link>
            <Link href="/signup" className="btn-primary !bg-white !text-blue-600 !px-5 !py-2.5 !rounded-full text-xs sm:text-sm shadow-xl shadow-blue-900/20 border-none">
              Try SMILE free
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 px-4 sm:px-6 overflow-hidden min-h-[95vh] flex flex-col justify-center">
        <div className="absolute inset-0 z-0 bg-[#004dc9] overflow-hidden pointer-events-none">
          <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.9, 1, 0.9] }} transition={{ duration: 12, repeat: Infinity }} className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-[#3fd5ff] rounded-full mix-blend-screen filter blur-[120px]" />
          <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 18, repeat: Infinity }} className="absolute top-[10%] left-[-20%] w-[100vw] h-[100vw] bg-[#ff2a5f] rounded-full mix-blend-normal filter blur-[130px] opacity-100" />
          <motion.div animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ duration: 15, repeat: Infinity }} className="absolute bottom-[-10%] right-[0%] w-[70vw] h-[70vw] bg-[#ffae00] rounded-full mix-blend-screen filter blur-[100px] opacity-90" />
          <div className="absolute top-[40%] left-[20%] w-[50vw] h-[50vw] bg-[#ff5e91] rounded-full mix-blend-screen filter blur-[120px] opacity-60" />
        </div>

        <motion.div
          initial="hidden" animate="visible" variants={stagger}
          className="relative text-center max-w-5xl mx-auto z-10 mb-12 lg:mb-16 mt-10"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 ring-1 ring-white/30 backdrop-blur-md shadow-lg">
            <Sparkles size={12} className="text-yellow-300" />
            V3 Architecture Now Live
          </motion.div>

          <motion.h1 variants={fadeUp} className="heading-hero text-4xl sm:text-6xl lg:text-[5rem] mb-6 text-white drop-shadow-md leading-[1.05]">
            Contextual AI<br />
            for Student Wellness
          </motion.h1>

          <motion.p variants={fadeUp} className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-sm mb-8">
            SMILE leverages advanced Tri-Model Fusion (Text, Lifestyle, and Behavioral) to identify early burnout risks and provide actionable, private insights without compromising your data.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary !bg-white !text-blue-600 hover:!bg-slate-50 !text-base !py-4 !px-10 !rounded-2xl w-full sm:w-auto shadow-2xl shadow-blue-900/40 border-none relative overflow-hidden group">
              <span className="relative z-10 flex items-center justify-center gap-2">Start your journey <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
            </Link>
          </motion.div>
        </motion.div>

        {/* macOS Window */}
        <motion.div
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-5xl mx-auto z-20"
        >
          <div className="relative rounded-[1.5rem] bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] border border-white/20 overflow-hidden flex flex-col ring-1 ring-black/10 backdrop-blur-sm transition-transform duration-700 hover:scale-[1.01]">
            <div className="h-14 bg-white/95 backdrop-blur border-b border-slate-100 flex items-center justify-between px-4 sm:px-5 relative z-20">
              <div className="flex gap-2.5 relative z-10">
                <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e] cursor-pointer hover:bg-[#ff5f56]/80 flex items-center justify-center group"><X size={8} className="text-black/50 opacity-0 group-hover:opacity-100" /></div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123] cursor-pointer hover:bg-[#ffbd2e]/80" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29] cursor-pointer hover:bg-[#27c93f]/80" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-bold text-slate-800 text-[15px] tracking-tight flex items-center gap-2">SMILE Context AI</span>
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="hidden sm:flex items-center bg-slate-100/80 rounded-full p-1 border border-slate-200 shadow-inner">
                  <div className="bg-blue-600 rounded-full px-4 py-1.5 text-xs font-bold shadow-sm text-white">Context</div>
                  <div className="text-xs font-semibold text-slate-600 px-4 py-1.5 cursor-pointer hover:text-slate-900 transition-colors">Fusion</div>
                </div>
                <div className="w-8 h-8 cursor-pointer rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-md ml-2 border-2 border-slate-800 hover:scale-105 transition-transform">A</div>
              </div>
            </div>
            <div className="bg-slate-50 flex-1 relative max-h-[600px] overflow-hidden">
              <div className="h-full overflow-y-auto w-full p-0 sm:pr-2 bg-slate-50">
                <div className="p-4 sm:p-8"><InteractiveDemo /></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════ ANIMATED STATS ═══════════════════ */}
      <section id="impact" className="py-20 lg:py-32 bg-white">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
            <motion.div variants={fadeUp}><StatCounter value={3} suffix="" label="Specialized ML Models" /></motion.div>
            <motion.div variants={fadeUp}><StatCounter value={96} suffix="%+" label="Diagnostic Accuracy" /></motion.div>
            <motion.div variants={fadeUp}><StatCounter value={30} suffix="+" label="Variables Tracked" /></motion.div>
            <motion.div variants={fadeUp}>
              <div className="text-center group transition-transform hover:-translate-y-1">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0f172a] mb-2 tracking-tighter">24/7</div>
                <div className="text-xs sm:text-sm font-bold text-[#1e40af] uppercase tracking-widest opacity-80">Crisis Detection</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════ BENTO GRID FEATURES ═══════════════════ */}
      <section id="features" className="py-24 lg:py-40 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}
            className="text-center mb-16 lg:mb-24"
          >
            <motion.p variants={fadeUp} className="text-[#1e40af] font-bold text-xs uppercase tracking-[0.2em] mb-4">Capabilities</motion.p>
            <motion.h2 variants={fadeUp} className="heading-section text-3xl sm:text-5xl text-[#0f172a] mb-6">
              Precision Wellness Analytics
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#64748b] text-base sm:text-lg max-w-2xl mx-auto font-light">
              We combine behavioral science with cutting-edge AI to provide institutional leaders with real-time awareness of student wellbeing.
            </motion.p>
          </motion.div>

          {/* ── Bento Grid ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-[minmax(200px,auto)]"
          >
            {/* Card 1: Tri-Model Fusion — Large Card (spans 2 cols) */}
            <motion.div variants={scaleIn} className="md:col-span-2 relative group rounded-[1.5rem] bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 sm:p-10 overflow-hidden border border-white/5 cursor-default">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[80px] group-hover:bg-blue-600/30 transition-all duration-700" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:bg-blue-600 transition-colors duration-500">
                  <Brain size={28} className="text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Tri-Model AI Fusion</h3>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg font-light">
                  Advanced v3 architecture combining NLP Text Sentiment, Lifestyle Patterns, and Behavioral Risk models into a unified prediction engine with automatic crisis overrides.
                </p>
                <div className="mt-8 flex gap-3 flex-wrap">
                  {['NLP Sentiment', 'Lifestyle Patterns', 'Behavioral Risk'].map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-full bg-white/5 text-white/70 text-xs font-bold ring-1 ring-white/10">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Card 2: Explainable AI — Tall Card */}
            <motion.div variants={scaleIn} className="md:row-span-2 relative group rounded-[1.5rem] bg-white p-8 sm:p-10 overflow-hidden border border-slate-200 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500 cursor-default">
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-[#1e40af]/5 flex items-center justify-center mb-6 group-hover:bg-[#1e40af] transition-colors duration-500">
                  <Eye size={28} className="text-[#1e40af] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-3">Fully Explainable</h3>
                <p className="text-[#64748b] text-sm leading-relaxed font-light flex-1">
                  Transparent predictions with clear factor breakdowns. Every risk score comes with SHAP visualizations showing exactly which variables influenced the outcome. No black boxes.
                </p>
                <div className="mt-auto pt-8">
                  <div className="space-y-3">
                    {[
                      { label: 'Sleep Quality', pct: 82 },
                      { label: 'Social Engagement', pct: 45 },
                      { label: 'Academic Load', pct: 68 },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                          <span>{item.label}</span><span>{item.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.pct}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
                            className="h-full bg-[#1e40af] rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Analytics Dashboard */}
            <motion.div variants={scaleIn} className="relative group rounded-[1.5rem] bg-white p-8 overflow-hidden border border-slate-200 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500 cursor-default">
              <div className="w-12 h-12 rounded-2xl bg-[#1e40af]/5 flex items-center justify-center mb-5 group-hover:bg-[#1e40af] transition-colors duration-500">
                <BarChart3 size={24} className="text-[#1e40af] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">Analytics Dashboard</h3>
              <p className="text-[#64748b] text-sm leading-relaxed font-light">
                Rich visualizations of wellness trends, risk factors, and behavioral patterns over time.
              </p>
            </motion.div>

            {/* Card 4: Real-Time Processing */}
            <motion.div variants={scaleIn} className="relative group rounded-[1.5rem] bg-white p-8 overflow-hidden border border-slate-200 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500 cursor-default">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500 transition-colors duration-500">
                <Cpu size={24} className="text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">Real-Time Processing</h3>
              <p className="text-[#64748b] text-sm leading-relaxed font-light">
                100K+ data points processed in milliseconds with our distributed inference engine.
              </p>
            </motion.div>

            {/* Card 5: Privacy — Dark Card (spans 2 cols) */}
            <motion.div variants={scaleIn} className="md:col-span-2 lg:col-span-3 relative group rounded-[1.5rem] bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] p-8 sm:p-10 overflow-hidden border border-white/5 cursor-default">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] group-hover:bg-blue-600/20 transition-all duration-700 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/10">
                      <Lock size={20} className="text-white" />
                    </div>
                    <Shield size={20} className="text-blue-400" />
                    <Layers size={20} className="text-purple-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Privacy First. Always.</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-light max-w-xl">
                    Military-grade encryption, full anonymization at source, granular RBAC, and open validation via SHAP. Your students{"'"} data never leaves your perimeter.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 shrink-0">
                  {[
                    { v: 'AES-256', l: 'Encryption' },
                    { v: 'RBAC', l: 'Access Control' },
                    { v: 'SHAP', l: 'Explainability' },
                    { v: 'Zero', l: 'Data Leakage' },
                  ].map(s => (
                    <div key={s.l} className="text-center p-3 rounded-xl bg-white/5 ring-1 ring-white/10">
                      <div className="text-lg font-black text-white">{s.v}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ WHO IT'S FOR ═══════════════════ */}
      <section className="py-24 lg:py-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
            className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center"
          >
            <motion.div variants={fadeUp} className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#1e40af]/10 rounded-full blur-2xl opacity-50" />
              <p className="text-[#1e40af] font-bold text-xs uppercase tracking-[0.2em] mb-4">The SMILE Advantage</p>
              <h2 className="heading-section text-4xl sm:text-6xl text-[#0f172a] mb-8 leading-[1.1]">
                Early detection.<br />
                <span className="text-[#64748b]">Real world action.</span>
              </h2>
              <p className="text-lg text-[#64748b] leading-relaxed mb-10 font-light max-w-xl">
                By identifying subtle shifts in daily patterns, SMILE empowers counselors to intervene weeks before crises manifest, creating a safer campus environment for everyone.
              </p>
              <Link href="/signup" className="btn-primary !rounded-2xl !py-4 !px-8 shadow-xl shadow-[#1e40af]/20">
                Learn more about our methods
              </Link>
            </motion.div>

            <motion.div variants={stagger} className="grid gap-10">
              {[
                { icon: Heart, title: 'For Students', desc: 'Self-assess lifestyle habits and get personalized mental health insights with actionable recommendations.' },
                { icon: Users, title: 'For Counselors', desc: 'Monitor student risk levels, identify at-risk individuals early, and provide targeted interventions.' },
                { icon: TrendingUp, title: 'For Institutions', desc: 'Gain population-level insights into student wellbeing and make data-driven policy decisions.' },
              ].map((b) => (
                <motion.div key={b.title} variants={fadeUp} className="flex gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-[#f1f5f9] flex items-center justify-center flex-shrink-0 group-hover:bg-[#1e40af]/5 transition-colors duration-500">
                    <b.icon size={24} className="text-[#0f172a] opacity-40 group-hover:text-[#1e40af] group-hover:opacity-100 transition-all duration-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0f172a] mb-2">{b.title}</h4>
                    <p className="text-sm text-[#64748b] leading-relaxed font-light">{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="py-24 bg-white border-b border-[#f1f5f9]">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="max-w-4xl mx-auto px-4 text-center"
        >
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-bold text-[#0f172a] mb-8">Ready to revolutionize campus wellbeing?</motion.h2>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary !text-lg !py-5 !px-12 !rounded-[2rem] w-full sm:w-auto shadow-2xl shadow-[#1e40af]/30 hover:scale-105 transition-transform duration-300">
              Get Started Free
            </Link>
            <Link href="/login" className="text-sm font-bold text-[#64748b] hover:text-[#0f172a] transition-colors p-4">
              Talk to our team
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <Logo className="w-8 h-8 text-[#1e40af]" />
                <span className="text-2xl font-black text-[#0f172a] tracking-tighter">SMILE</span>
              </div>
              <p className="text-sm text-[#64748b] leading-relaxed font-light">
                Empowering academic institutions with intelligent, ethical, and predictive mental health tools.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0f172a] uppercase tracking-widest mb-6">Platform</h4>
              <nav className="flex flex-col gap-4 text-sm text-[#64748b] font-light">
                <Link href="/signup" className="hover:text-[#1e40af] transition-colors">Start Assessment</Link>
                <Link href="/login" className="hover:text-[#1e40af] transition-colors">Counselor Login</Link>
                <Link href="#features" className="hover:text-[#1e40af] transition-colors">AI Capabilities</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0f172a] uppercase tracking-widest mb-6">Resources</h4>
              <nav className="flex flex-col gap-4 text-sm text-[#64748b] font-light">
                <Link href="#" className="hover:text-[#1e40af] transition-colors">Methodology</Link>
                <Link href="#" className="hover:text-[#1e40af] transition-colors">Privacy Guide</Link>
                <Link href="/about" className="hover:text-[#1e40af] transition-colors">About the Developer</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0f172a] uppercase tracking-widest mb-6">Connect</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center hover:bg-[#1e40af] hover:text-white transition-all cursor-pointer">
                  <Heart size={18} />
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center hover:bg-[#1e40af] hover:text-white transition-all cursor-pointer">
                  <Users size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-[#f1f5f9] flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] sm:text-xs font-bold text-[#94a3b8] uppercase tracking-widest">
            <p>© 2026 SMILE-AI PLATFORM. DATA DRIVEN WELLBEING.</p>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-[#0f172a] transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#0f172a] transition-colors">Terms of Use</Link>
              <Link href="#" className="hover:text-[#0f172a] transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
