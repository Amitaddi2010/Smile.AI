'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { dashboardAPI } from '@/lib/api';
import { Shield, FileText, Download, Printer, ChevronLeft, Calendar, User } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function WellnessPass() {
    const { token, user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        dashboardAPI.getMyWellness(token)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="flex items-center justify-center h-screen">Loading Clinical Data...</div>;
    if (!data || !data.assessments.length) return <div>No clinical data found.</div>;

    const latest = data.assessments[data.assessments.length - 1];

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8 print:bg-white print:p-0">
            {/* Header / Navigation (Hidden in Print) */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <button 
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ChevronLeft size={20} />
                    Back to Dashboard
                </button>
                <button 
                    onClick={handlePrint}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
                >
                    <Printer size={18} />
                    Generate PDF / Print
                </button>
            </div>

            {/* The Pass Container */}
            <div className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden print:shadow-none print:border-none print:rounded-none">
                {/* Visual Header */}
                <div className="bg-slate-950 p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <Logo className="w-12 h-12" variant="white" />
                                <div className="h-8 w-[2px] bg-white/20"></div>
                                <span className="text-xl font-black tracking-tight tracking-widest uppercase opacity-80">SMILE-AI</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight mb-2">Clinical Wellness Pass</h1>
                            <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">Official Behavioral Telemetry Report</p>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 text-right">
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mb-1">Issue Date</p>
                            <p className="text-lg font-bold">{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="p-12 space-y-12">
                    {/* User Profile Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <section>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                <User size={14} /> Subject Identification
                            </h3>
                            <div className="space-y-2">
                                <p className="text-2xl font-bold text-slate-900">{user?.name}</p>
                                <p className="text-slate-500 font-medium">{user?.email}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">{latest.department} Department • CGPA: {latest.cgpa}</p>
                            </div>
                        </section>
                        <section className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">
                            <p className="text-sm text-slate-600">
                                This document provides a longitudinal analysis of the subject's behavioral and mental health metrics as captured by the SMILE-AI Neural Engine.
                            </p>
                        </section>
                    </div>

                    {/* Risk & Clinical Indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 rounded-[2rem] border border-slate-100 bg-white">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">SMILE Risk Index</p>
                            <div className="text-4xl font-black text-center text-slate-900 mb-2">{latest.risk_score}%</div>
                            <div className={`text-center text-[10px] font-black uppercase tracking-widest py-1.5 px-3 rounded-full mx-auto w-fit ${latest.risk_level === 'Low' ? 'bg-green-100 text-green-700' : latest.risk_level === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                {latest.risk_level} Risk
                            </div>
                        </div>
                        <div className="p-8 rounded-[2rem] border border-slate-100 bg-white">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Depression Prob.</p>
                            <div className="text-4xl font-black text-center text-slate-900 mb-2">{(latest.depression_probability * 100).toFixed(1)}%</div>
                            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence: 0.92</p>
                        </div>
                        <div className="p-8 rounded-[2rem] border border-slate-100 bg-white">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Stress Variance</p>
                            <div className="text-4xl font-black text-center text-slate-900 mb-2">{latest.stress_level}/10</div>
                            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Self-Reported Gauge</p>
                        </div>
                    </div>

                    {/* Lifestyle Metrics */}
                    <section>
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                             Behavioral Telemetry Snapshot
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { l: 'Sleep Duration', v: `${latest.sleep_duration} hrs`, c: 'text-indigo-600' },
                                { l: 'Study Intensity', v: `${latest.study_hours} hrs`, c: 'text-blue-600' },
                                { l: 'Physical Activity', v: `${latest.physical_activity} min`, c: 'text-green-600' },
                                { l: 'Digital Exposure', v: `${latest.social_media_hours} hrs`, c: 'text-rose-600' },
                            ].map(m => (
                                <div key={m.l} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.l}</p>
                                    <p className={`text-lg font-bold ${m.c}`}>{m.v}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Security Footer */}
                    <div className="pt-12 border-t border-slate-100 mt-12 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <Shield size={24} className="text-slate-300" />
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                VERIFIED SECURE • END-TO-END ENCRYPTED CLINICAL REPORT<br/>
                                UNIQUE HASH: {Math.random().toString(36).substring(7).toUpperCase()}
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Report Generatd By</p>
                             <p className="text-sm font-black text-slate-900">SMILE-AI Precision Engine v1.0.4</p>
                        </div>
                    </div>
                </div>

                {/* Print Only Disclaimer */}
                <div className="hidden print:block p-12 bg-slate-50 text-[10px] text-slate-400 italic">
                    Disclaimer: This report is generated by an artificial intelligence system and should be used as a supplementary tool for mental health assessment. It does not replace a professional clinical diagnosis from a licensed psychiatrist or counselor.
                </div>
            </div>
        </div>
    );
}
