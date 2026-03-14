'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
    MessageCircle, Heart, Share2, Send, Plus, 
    ShieldCheck, Filter, TrendingUp, AlertTriangle, 
    Search, UserCircle2, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SafeSpacePost {
    id: number;
    pseudonym: string;
    content: string;
    category: string;
    likes: number;
    comment_count: number;
    created_at: string;
    comments: any[];
}

export default function SafeSpacePage() {
    const { token } = useAuth();
    const [posts, setPosts] = useState<SafeSpacePost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('General');
    const [filter, setFilter] = useState('All');

    const fetchPosts = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/safe-space/posts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setPosts(data);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleCreatePost = async () => {
        if (!newPostContent.trim() || !token) return;
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/safe-space/posts`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: newPostContent,
                    category: selectedCategory
                })
            });
            
            if (res.ok) {
                setNewPostContent('');
                setIsPosting(false);
                fetchPosts();
            }
        } catch (error) {
            console.error("Post failed", error);
        }
    };

    const handleLike = async (postId: number) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/safe-space/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
            }
        } catch (error) {
            console.error("Like failed", error);
        }
    };

    const CATEGORIES = ["General", "Exam Stress", "Social Anxiety", "Academic Pressure", "Relationship", "Motivation"];

    return (
        <div className="max-w-4xl mx-auto pb-20 px-4 sm:px-0">
            {/* Header Section */}
            <div className="mb-10 pt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                            <ShieldCheck size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Safe Space</h1>
                    </div>
                    <p className="text-slate-500 font-medium max-w-lg">An encrypted, anonymous sanctuary for peer support. Monitored by SMILE AI for safety.</p>
                </div>
                
                <button 
                   onClick={() => setIsPosting(true)}
                   className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
                >
                    <Plus size={20} />
                    New Confession
                </button>
            </div>

            {/* Posting Modal */}
            <AnimatePresence>
                {isPosting && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
                        >
                            <div className="p-8 pb-4 flex justify-between items-center">
                                <h2 className="text-xl font-black text-slate-900">Share Anonymously</h2>
                                <button onClick={() => setIsPosting(false)} className="text-slate-400 hover:text-slate-900 font-bold p-2">Close</button>
                            </div>
                            <div className="px-8 pb-8 space-y-6">
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button 
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                <textarea 
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    placeholder="What's on your mind? Be honest, your identity is hidden."
                                    className="w-full h-40 bg-slate-50 rounded-3xl p-6 text-slate-900 placeholder:text-slate-400 border border-slate-100 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none resize-none transition-all"
                                />
                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">
                                    <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-indigo-500" /> AI Moderation Active</span>
                                    <span>{newPostContent.length}/2000</span>
                                </div>
                                <button 
                                    onClick={handleCreatePost}
                                    disabled={newPostContent.length < 10}
                                    className="w-full py-4 bg-indigo-600 disabled:opacity-50 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-indigo-600/20"
                                >
                                    <Send size={20} />
                                    Cast into the Void
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Feed Controls */}
            <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search support topics..." 
                        className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-slate-900/5 transition-all text-slate-900 shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    {['All', 'Hot', 'New'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === t ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts Feed */}
            {loading ? (
                <div className="space-y-6">
                    {[1,2,3].map(i => <div key={i} className="h-48 bg-white border border-slate-100 rounded-3xl animate-pulse"></div>)}
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map((post, idx) => (
                        <motion.div 
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/20 transition-all group border-l-4 border-l-transparent hover:border-l-indigo-600"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-white shadow-inner">
                                        <UserCircle2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{post.pseudonym}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                    {post.category}
                                </span>
                            </div>

                            <p className="text-slate-700 text-lg leading-relaxed mb-8 selection:bg-indigo-100">
                                {post.content}
                            </p>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <button 
                                        onClick={() => handleLike(post.id)}
                                        className="flex items-center gap-2 text-slate-400 hover:text-rose-500 font-bold transition-colors group/btn"
                                    >
                                        <div className="p-2 rounded-full group-hover/btn:bg-rose-50 transition-colors">
                                            <Heart size={18} className={post.likes > 0 ? "fill-rose-500 text-rose-500" : ""} />
                                        </div>
                                        <span className="text-sm">{post.likes}</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold transition-colors group/btn">
                                        <div className="p-2 rounded-full group-hover/btn:bg-indigo-50 transition-colors">
                                            <MessageCircle size={18} />
                                        </div>
                                        <span className="text-sm">{post.comment_count}</span>
                                    </button>
                                </div>
                                <button className="p-2 text-slate-400 hover:text-slate-900 transition-all rounded-full hover:bg-slate-100">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    
                    {posts.length === 0 && (
                        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <TrendingUp size={24} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">The void is silent.</h3>
                            <p className="text-slate-500 max-w-xs mx-auto mt-2">Be the first to share a thought anonymously in this safe space.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Security Bottom Note */}
            <div className="mt-12 p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                    <ShieldCheck size={24} />
                </div>
                <div>
                   <h4 className="font-black text-indigo-900 text-sm uppercase tracking-widest mb-1">Encrypted Sanctuary</h4>
                   <p className="text-xs text-indigo-700/70 font-medium leading-relaxed">Identity hashing is active. Your profile name is never stored with posts. AI moderators automatically flag harmful content for counselor review.</p>
                </div>
            </div>
        </div>
    );
}
