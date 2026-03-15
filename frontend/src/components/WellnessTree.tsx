'use client';
import { motion } from 'framer-motion';
import { Leaf, Sprout, TreeDeciduous, Trophy, Zap, Heart } from 'lucide-react';

interface WellnessTreeProps {
    level: number;
    points: number;
}

export default function WellnessTree({ level, points }: WellnessTreeProps) {
    const isSprout = level < 3;
    const isSapling = level >= 3 && level < 7;
    const isTree = level >= 7;

    return (
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group h-full flex flex-col items-center justify-center">
            {/* Ambient Lighting */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10 text-center">
                <div className="mb-6 flex justify-center">
                    <motion.div
                        animate={{ 
                            y: [0, -10, 0],
                            rotate: [0, 2, -2, 0]
                        }}
                        transition={{ 
                            duration: 6, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="relative"
                    >
                        {isSprout && (
                            <div className="relative">
                                <Sprout size={100} className="text-emerald-500" strokeWidth={1.5} />
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-2 -right-2 text-yellow-400">
                                    <Zap size={24} fill="currentColor" />
                                </motion.div>
                            </div>
                        )}
                        {isSapling && (
                            <div className="relative">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex gap-[-20px]">
                                    <Leaf size={60} className="text-emerald-400 -rotate-12" strokeWidth={1.5} />
                                    <Leaf size={80} className="text-emerald-600 rotate-12" strokeWidth={1.5} />
                                </motion.div>
                            </div>
                        )}
                        {isTree && (
                            <div className="relative">
                                <TreeDeciduous size={120} className="text-emerald-700" strokeWidth={1.5} />
                                <motion.div 
                                    animate={{ opacity: [0.4, 1, 0.4], y: [-5, 5, -5] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute inset-0 flex items-center justify-center text-rose-500/20"
                                >
                                    <Heart size={40} fill="currentColor" />
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                </div>

                <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                    {isSprout ? 'Seedling Phase' : isSapling ? 'Deepening Roots' : 'Ancient Resilience'}
                </h3>
                <p className="text-sm font-medium text-slate-500 mb-10 px-6 leading-relaxed">
                    {isSprout ? 'Your wellness journey is just beginning. Keep completing missions to grow.' : 
                     isSapling ? 'You are establishing strong habits. Your mental resilience is flourishing.' : 
                     'A beacon of stability. You have mastered the art of sustainable wellness.'}
                </p>

                <div className="flex items-center justify-center gap-6">
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 font-extrabold text-xl shadow-inner border border-emerald-100">
                           {level}
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Stage</span>
                    </div>
                    <div className="w-px h-12 bg-slate-100" />
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 shadow-inner border border-amber-100">
                           <Trophy size={22} fill="currentColor" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">{points}<span className="text-[9px] opacity-40">/100</span> XP</span>
                    </div>
                </div>

                <div className="mt-10 w-full relative">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Evolution Progress</span>
                        <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">{points}%</span>
                    </div>
                    <div className="bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-100 p-0.5">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${points}%` }}
                            className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        />
                    </div>
                </div>
            </div>

            {/* Background Decorative Leaves */}
            <div className="absolute -bottom-10 -left-10 opacity-5 group-hover:opacity-10 transition-opacity duration-1000 rotate-45">
                <Leaf size={150} className="text-emerald-900" />
            </div>
        </div>
    );
}
