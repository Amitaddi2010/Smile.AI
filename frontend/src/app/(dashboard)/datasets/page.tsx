'use client';
import { FileText, Database, BarChart3, Users, Brain, Activity } from 'lucide-react';

const datasets = [
    { name: 'Student Lifestyle (Primary)', file: 'student_lifestyle_100k.csv', rows: '100,000', features: 9, description: 'Primary training dataset with student lifestyle and academic data.', target: 'Depression (Binary)', color: '#1e40af', status: 'Active Model v3' },
    { name: 'Mental Health Conditions', file: 'Mental_Health_Condition_Classification.csv', rows: '103,960', features: 17, description: 'Broad classification data (Anxiety, Depression, Stress, Bipolar, Suicidal).', target: 'Condition', color: '#8b5cf6', status: 'Active Model v3' },
    { name: 'Gaming & Mental Health', file: 'Gaming and Mental Health.csv', rows: '13,464', features: 13, description: 'Gaming behavior and mental health including anxiety/depression indicators.', target: 'SWL_T (Satisfaction)', color: '#3b82f6', status: 'Available' },
    { name: 'Global Mental Health 2025', file: 'Global_Mental_Health_Dataset_2025.csv', rows: '10,000', features: 13, description: 'Global mental health indicators including country, mood score, sleep quality.', target: 'Treatment Status', color: '#10b981', status: 'Available' },
    { name: 'Social Media Addiction', file: 'Students Social Media Addiction.csv', rows: '1,200', features: 8, description: 'Social media usage patterns and addiction indicators among students.', target: 'Addiction Level', color: '#ec4899', status: 'Available' },
    { name: 'Academic Stress Level', file: 'academic Stress level.csv', rows: '1,100', features: 7, description: 'Academic stress factors including workload, peer pressure, exam anxiety.', target: 'Stress Level', color: '#f59e0b', status: 'Available' },
    { name: 'Social Media & Mental Health', file: 'social_media_mental_health.csv', rows: '481', features: 20, description: 'Comprehensive social media usage and mental health effects.', target: 'Multiple indicators', color: '#06b6d4', status: 'Available' },
];

export default function DatasetsPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
            <header className="mb-4 pt-2">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Database className="text-blue-600" size={32} />
                    Dataset Insights
                </h1>
                <p className="text-slate-500 mt-2 text-sm sm:text-base font-medium">Explore the high-quality datasets powering our Tri-Model Fusion predictions.</p>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-7 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                        <Database size={24} />
                    </div>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">{datasets.length}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Datasets</p>
                </div>
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-7 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                        <Users size={24} />
                    </div>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">230K+</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Total Records</p>
                </div>
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-7 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                        <BarChart3 size={24} />
                    </div>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">80+</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Total Features</p>
                </div>
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-7 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                        <Brain size={24} />
                    </div>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">3</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Active Models</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {datasets.map((ds) => (
                    <div key={ds.file} className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] border border-white/60 hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 group flex flex-col">
                        <div className="flex items-start justify-between gap-4 mb-5">
                            <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 shadow-inner" style={{ backgroundColor: `${ds.color}15`, color: ds.color }}>
                                <FileText size={22} className="group-hover:scale-110 transition-transform" />
                            </div>
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest whitespace-nowrap ${ds.status.startsWith('Active') ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                                }`}>
                                {ds.status}
                            </span>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug mb-2 group-hover:text-blue-600 transition-colors">{ds.name}</h3>
                            <p className="text-sm font-semibold text-slate-500 mb-6 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">{ds.description}</p>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-slate-100 w-full">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 font-bold flex items-center gap-2"><Activity size={16} className="text-slate-400" /> Source Data</span>
                                <span className="font-black text-slate-900">{ds.rows} rows</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 font-bold flex items-center gap-2"><BarChart3 size={16} className="text-slate-400" /> Dimensions</span>
                                <span className="font-black text-slate-900">{ds.features} features</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 font-bold flex items-center gap-2"><Brain size={16} className="text-slate-400" /> Target Var</span>
                                <span className="font-black text-slate-900 truncate max-w-[120px]" title={ds.target}>{ds.target}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50/80 backdrop-blur-2xl rounded-[2rem] border border-blue-100 p-8 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-blue-900 tracking-tight mb-2">Data Privacy & Security Notice</h3>
                        <p className="text-sm font-semibold text-blue-800/80 leading-relaxed max-w-4xl">
                            All datasets used for foundation model training are anonymized research datasets. No personally identifiable information is stored, processed, or mapped to internal system users. Our Tri-Model Architecture is 100% compliant with standard PII guidelines.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
