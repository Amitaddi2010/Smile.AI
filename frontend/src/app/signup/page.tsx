'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, ArrowLeft, Brain, Activity, Shield, Sparkles } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signup(name, email, password, 'student');
            router.push('/checkin');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans selection:bg-blue-600/10">
            {/* Left panel - Living Animated Gradient Mesh */}
            <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-slate-900 flex-col justify-between p-12">
                {/* Animated mesh gradient background */}
                <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#3fd5ff] rounded-full mix-blend-screen filter blur-[100px] opacity-70" style={{ animation: 'mesh1 12s ease-in-out infinite' }} />
                    <div className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] bg-[#ff2a5f] rounded-full mix-blend-screen filter blur-[120px] opacity-80" style={{ animation: 'mesh2 16s ease-in-out infinite' }} />
                    <div className="absolute bottom-[-20%] left-[10%] w-[60vw] h-[60vw] bg-[#ffae00] rounded-full mix-blend-screen filter blur-[120px] opacity-60" style={{ animation: 'mesh3 14s ease-in-out infinite' }} />
                    <div className="absolute top-[50%] left-[30%] w-[30vw] h-[30vw] bg-[#8b5cf6] rounded-full mix-blend-screen filter blur-[100px] opacity-40" style={{ animation: 'mesh2 20s ease-in-out infinite reverse' }} />
                </div>

                {/* Fine noise overlay */}
                <div className="absolute inset-0 z-10 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

                {/* Floating accent orbs */}
                <div className="absolute top-[15%] right-[15%] w-3 h-3 rounded-full bg-white/30 z-20" style={{ animation: 'float 6s ease-in-out infinite' }} />
                <div className="absolute top-[60%] left-[20%] w-2 h-2 rounded-full bg-white/20 z-20" style={{ animation: 'float 8s ease-in-out infinite 1s' }} />
                <div className="absolute top-[75%] right-[30%] w-4 h-4 rounded-full bg-white/10 z-20" style={{ animation: 'float 10s ease-in-out infinite 2s' }} />

                <div className="relative z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center">
                            <Logo className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">SMILE</span>
                    </div>
                </div>

                {/* Floating Glassmorphism Hero Card */}
                <div className="relative z-20 w-full mb-10">
                    <div className="rounded-[2rem] bg-white/10 border border-white/20 backdrop-blur-2xl p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] hover:bg-white/[0.12] transition-all duration-500 group">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                            Your mental wellness<br />journey starts here.
                        </h2>
                        <p className="text-white/80 text-sm leading-relaxed font-light">
                            Join thousands of students leveraging AI to understand their behavioral patterns, reduce burnout, and thrive academically.
                        </p>

                        <div className="mt-8 flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[4, 5, 6].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-slate-900/50 flex items-center justify-center overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="user" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-white/70 font-medium">Over 50+ Universities</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right panel - Ultra Clean Auth Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-16 lg:px-24 relative xl:px-36 overflow-y-auto">

                {/* Back button */}
                <Link href="/" className="absolute top-8 left-8 sm:top-12 sm:left-12 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-900 transition-colors group z-10">
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                    Home
                </Link>

                <div className="w-full max-w-sm mx-auto my-auto pt-16 lg:pt-0">
                    {/* Mobile Logo (hidden on desktop since it's in the left panel) */}
                    <div className="flex lg:hidden items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center">
                            <Logo className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">SMILE</span>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">Create an account.</h1>
                        <p className="text-slate-500 text-sm sm:text-base">Let's get started on your wellness journey.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-50/50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-3">
                            <Shield size={16} className="text-red-500" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Full Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border-none text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all shadow-inner shadow-slate-100 text-sm sm:text-base font-medium"
                                placeholder="John Doe" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Email Address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border-none text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all shadow-inner shadow-slate-100 text-sm sm:text-base font-medium"
                                placeholder="name@university.edu" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Password</label>
                            <div className="relative">
                                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border-none text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all shadow-inner shadow-slate-100 text-sm sm:text-base font-medium pr-12"
                                    placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors bg-white p-1 rounded-md shadow-sm border border-slate-100">
                                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-slate-900/10 text-sm sm:text-base">
                                {loading ? 'Creating account...' : 'Create account'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center pb-8">
                        <p className="text-sm text-slate-500 font-medium">
                            Already have an account?{' '}
                            <Link href="/login" className="text-slate-900 font-bold hover:text-blue-600 transition-colors underline decoration-slate-300 underline-offset-4 hover:decoration-blue-600">
                                Sign in instead
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
