'use client';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { counselorAPI } from '@/lib/api';
import { User, Star, Shield, MessageSquare, Heart, Search, Filter, Award, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CounselorsPage() {
    const { token, user } = useAuth();
    const [counselors, setCounselors] = useState<any[]>([]);
    const [myCounselor, setMyCounselor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Rating state
    const [showRateModal, setShowRateModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);

    useEffect(() => {
        if (!token) return;
        Promise.all([
            counselorAPI.getAll(token),
            counselorAPI.getMine(token).catch(() => null)
        ]).then(([all, mine]) => {
            setCounselors(all);
            setMyCounselor(mine);
        })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    const handleRate = async () => {
        if (!myCounselor) return;
        setSubmittingRating(true);
        try {
            await counselorAPI.rate({
                counselor_id: myCounselor.id,
                rating,
                feedback
            }, token!);
            setShowRateModal(false);
            alert('Thank you for your feedback!');

            // Refresh counselor data
            const all = await counselorAPI.getAll(token!);
            setCounselors(all);
        } catch (e) {
            alert('Failed to submit rating');
        } finally {
            setSubmittingRating(false);
        }
    };

    const filteredCounselors = counselors.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-black text-slate-900 tracking-tight"
                    >
                        Medical <span className="text-blue-600">Support</span>
                    </motion.h1>
                    <p className="text-slate-500 mt-2 font-medium">Connect with certified clinical counselors and psychologists.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-64 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {myCounselor && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-1 gap-1 shadow-2xl shadow-blue-500/20"
                >
                    <div className="bg-white/10 backdrop-blur-3xl rounded-[2.9rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] -mr-32 -mt-32" />

                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-white/20 border border-white/30 flex items-center justify-center text-3xl font-black shadow-inner">
                                {myCounselor.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Your Counselor</span>
                                    <div className="flex items-center gap-1.5 text-amber-300">
                                        <Star size={14} className="fill-amber-300" />
                                        <span className="text-xs font-black">{myCounselor.avg_rating.toFixed(1)}</span>
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black mt-2 tracking-tight">{myCounselor.name}</h2>
                                <p className="text-blue-100/80 font-medium mt-1">Available for priority support and clinical guidance.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                            <button
                                onClick={() => setShowRateModal(true)}
                                className="flex-1 md:flex-none px-8 py-4 bg-white text-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-black/5 hover:bg-blue-50 transition-all active:scale-95"
                            >
                                Leave Review
                            </button>
                            <button className="flex-1 md:flex-none px-8 py-4 bg-white/10 border border-white/20 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95">
                                Open Chat
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {showRateModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative"
                    >
                        <button onClick={() => setShowRateModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Rate your Experience</h2>
                        <p className="text-slate-500 mt-2 font-medium">Your feedback helps us provide the best care possible.</p>

                        <div className="mt-8 flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${star <= rating ? 'bg-amber-100 text-amber-500' : 'bg-slate-50 text-slate-300'}`}
                                >
                                    <Star size={24} className={star <= rating ? 'fill-amber-500' : ''} />
                                </button>
                            ))}
                        </div>

                        <textarea
                            placeholder="Tell us about your sessions..."
                            className="mt-8 w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-6 py-5 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 min-h-[150px]"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />

                        <button
                            onClick={handleRate}
                            disabled={submittingRating}
                            className="mt-8 w-full py-5 bg-blue-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                        >
                            {submittingRating ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </motion.div>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-80 bg-slate-100 rounded-[2.5rem] animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCounselors.map((c, idx) => (
                        <CounselorCard key={c.id} counselor={c} index={idx} />
                    ))}
                    {filteredCounselors.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <User size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900">No counselors found</h3>
                            <p className="text-slate-500 mt-1">Try adjusting your search criteria.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function CounselorCard({ counselor, index }: { counselor: any, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100/50 transition-colors" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                        <User size={36} />
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            <span className="text-xs font-black text-amber-700">{counselor.avg_rating.toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{counselor.rating_count} Reviews</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 leading-tight flex items-center gap-2">
                        {counselor.name}
                        {counselor.avg_rating >= 4.5 && <Award size={18} className="text-blue-500" />}
                    </h3>
                    <p className="text-sm font-bold text-blue-600/80 uppercase tracking-widest">Clinical Psychologist</p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${counselor.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                            <span className="text-xs font-bold text-slate-700">{counselor.is_available ? 'Available Now' : 'Offline'}</span>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Response</p>
                        <p className="text-xs font-bold text-slate-700 underline decoration-slate-200">~2 Hours</p>
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-3">
                    <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.1em] hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10">
                        Book Session
                    </button>
                    <button className="w-14 h-14 bg-white border border-slate-200 text-slate-900 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95">
                        <MessageSquare size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
