"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Brain, Shield, ArrowRight, Award, BookOpen, Code } from 'lucide-react';

export default function AboutPage() {
    const fadeIn = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-[#1e40af]/10 font-sans">
            {/* Navigation */}
            <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-md shadow-sm border-b border-white/10 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white drop-shadow-sm group">
                        <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
                            <Logo className="w-8 h-8" variant="white" />
                        </motion.div>
                        SMILE
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
                        <Link href="/#features" className="hover:text-white transition-colors relative group">
                            Features
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
                        </Link>
                        <Link href="/about" className="text-white relative group">
                            About
                            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-white transition-all" />
                        </Link>
                        <Link href="/#impact" className="hover:text-white transition-colors relative group">
                            Impact
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link href="/login" className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Log In</Link>
                        <Link href="/signup" className="group btn-primary !bg-white !text-blue-600 !px-5 !py-2.5 !rounded-full text-xs sm:text-sm shadow-xl shadow-blue-900/20 border-none flex items-center gap-2 hover:bg-slate-100 transition-colors">
                            Try SMILE free
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-24 px-4 sm:px-6 bg-[#0a0a0a] min-h-[45vh] flex flex-col justify-center relative overflow-hidden">
                {/* Animated Background Gradients */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 right-[-10%] w-[40rem] h-[40rem] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none"
                />
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none"
                />

                <div className="max-w-7xl mx-auto w-full relative z-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="flex flex-col items-start"
                    >
                        <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 border border-white/20 backdrop-blur-sm">
                            <Shield size={14} className="text-blue-400" />
                            About the Platform
                        </motion.div>

                        <motion.h1 variants={fadeIn} className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
                            Advancing AI for <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 animate-gradient">
                                Human Wellbeing
                            </span>
                        </motion.h1>

                        <motion.p variants={fadeIn} className="text-lg sm:text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
                            SMILE AI was built with a clear mission: to harness the power of contextual artificial intelligence to identify early warning signs of stress and burnout in academic environments, prioritizing privacy and ethical standards.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Developer Profile Section */}
            <section className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-white">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-12 gap-16 lg:gap-20 items-center">

                        {/* Developer Image & Info - Left Side */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="lg:col-span-5 relative"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <motion.div
                                    whileHover={{ y: -10 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="relative bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden"
                                >
                                    <div className="relative w-full rounded-[2rem] overflow-hidden bg-slate-100 shadow-inner flex items-center justify-center">
                                        {/* Show full size image without cropping */}
                                        <Image
                                            src="/amit.png"
                                            alt="Amit Raj Saraswat"
                                            width={800}
                                            height={1200}
                                            className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
                                            priority
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60"></div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Floating Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, type: "spring" }}
                                className="absolute -bottom-8 -right-8 sm:bottom-10 sm:-right-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 z-20 backdrop-blur-xl"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Brain size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Platform Developer</p>
                                        <p className="text-sm font-extrabold text-[#0f172a]">Lead Scientist</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Developer Details & Philosophy - Right Side */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className="lg:col-span-7"
                        >
                            <div className="mb-12">
                                <motion.h2 variants={fadeIn} className="text-4xl sm:text-5xl font-extrabold text-[#0f172a] mb-3 tracking-tight">Amit Raj Saraswat</motion.h2>
                                <motion.div variants={fadeIn} className="inline-flex items-center gap-2 text-blue-600 font-bold tracking-widest uppercase text-xs sm:text-sm mb-6 bg-blue-50 px-4 py-2 rounded-full">
                                    <Code size={16} /> Research Scientist & AI Architect
                                </motion.div>

                                <motion.p variants={fadeIn} className="text-lg text-slate-600 leading-relaxed font-light mb-8">
                                    Amit Kumar (also known as Amit Raj Saraswat) is a distinguished Research Scientist with profound expertise in Artificial Intelligence, Machine Learning, and Blockchain Technology. With over eight years of experience driving enterprise AI solutions and leading critical healthcare innovation projects, Amit engineered SMILE AI to bridge the gap between advanced deep learning and actionable, ethical mental healthcare.
                                </motion.p>

                                <motion.div variants={fadeIn} className="grid sm:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 hover:bg-blue-50/50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-1">
                                            <Award size={18} />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-[#0f172a] text-sm mb-1">Healthcare AI</h5>
                                            <p className="text-xs text-slate-600 leading-relaxed">Leads the Smart Foot Project at PGIMER focusing on scalable AI.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-purple-100 hover:bg-purple-50/50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 mt-1">
                                            <BookOpen size={18} />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-[#0f172a] text-sm mb-1">Research Excellence</h5>
                                            <p className="text-xs text-slate-600 leading-relaxed">Over 56+ research papers, 1 patent granted (2 filed, 2 in process), and 1 copyright.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Platform Philosophy */}
                            <div className="pt-12 border-t border-slate-100">
                                <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest mb-6">
                                    Our Philosophy
                                </motion.div>
                                <motion.h3 variants={fadeIn} className="text-3xl font-bold text-[#0f172a] mb-8 leading-tight">
                                    Built on ethical AI principles.
                                </motion.h3>

                                <div className="space-y-8">
                                    <motion.div variants={fadeIn} className="flex gap-6 group">
                                        <div className="shrink-0 w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:bg-[#0f172a] group-hover:text-white transition-all duration-300">
                                            <Shield size={24} className="text-slate-600 group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-[#0f172a] mb-2">Privacy by Design</h4>
                                            <p className="text-slate-600 font-light leading-relaxed text-sm">
                                                SMILE AI ensures all behavioral datasets are fully anonymized. We prioritize student confidentiality with enterprise-grade encryption and strict access controls.
                                            </p>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={fadeIn} className="flex gap-6 group">
                                        <div className="shrink-0 w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:bg-[#0f172a] group-hover:text-white transition-all duration-300">
                                            <Brain size={24} className="text-slate-600 group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-[#0f172a] mb-2">Explainable Models</h4>
                                            <p className="text-slate-600 font-light leading-relaxed text-sm">
                                                Unlike &quot;black-box&quot; systems, our Tri-Model Fusion architecture provides transparent insights via SHAP visualizations, empowering counselors to make informed decisions.
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#1e40af]/5 transform -skew-y-3 origin-top-left z-0"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl sm:text-5xl font-bold text-[#0f172a] mb-8">Experience the future of student wellness.</h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup" className="btn-primary !text-lg !py-5 !px-12 !rounded-[2rem] w-full sm:w-auto shadow-2xl shadow-[#1e40af]/30 hover:scale-105 transition-transform duration-300">
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
                    <Logo className="w-8 h-8 text-[#1e40af] mb-4" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        © 2026 SMILE-AI PLATFORM. DATA DRIVEN WELLBEING.
                    </p>
                </div>
            </footer>

            {/* Next.js Global Styles for Animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 4s linear infinite;
        }
      `}} />
        </div>
    );
}
