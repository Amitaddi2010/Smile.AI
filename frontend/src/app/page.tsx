import Link from 'next/link';
import InteractiveDemo from '@/components/InteractiveDemo';
import { Logo } from '@/components/Logo';
import RotatingSubtitle from '@/components/RotatingSubtitle';
import { Brain, Shield, BarChart3, Users, Heart, ArrowRight, Activity, TrendingUp, Lock, Zap, Sparkles, X } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Tri-Model AI Fusion',
    desc: 'Advanced v3 architecture combining NLP Text Sentiment, Lifestyle Patterns, and Behavioral Risk models.',
    color: '#1e40af',
  },
  {
    icon: Shield,
    title: 'Fully Explainable',
    desc: 'Transparent predictions with clear factor breakdowns and automatic Crisis Overrides for suicidal ideation.',
    color: '#1e40af',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    desc: 'Rich visualizations of wellness trends, risk factors, and behavioral patterns over time.',
    color: '#1e40af',
  },
];

const benefits = [
  { icon: Heart, title: 'For Students', desc: 'Self-assess lifestyle habits and get personalized mental health insights with actionable recommendations.' },
  { icon: Users, title: 'For Counselors', desc: 'Monitor student risk levels, identify at-risk individuals early, and provide targeted interventions.' },
  { icon: TrendingUp, title: 'For Institutions', desc: 'Gain population-level insights into student wellbeing and make data-driven policy decisions.' },
];

const stats = [
  { value: '3', label: 'Specialized ML Models' },
  { value: '96%+', label: 'Diagnostic Accuracy' },
  { value: '30+', label: 'Variables Tracked' },
  { value: '24/7', label: 'Crisis Detection' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen selection:bg-[#1e40af]/10" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 glass-nav shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white drop-shadow-sm">
            <Logo className="w-8 h-8" variant="white" />
            SMILE
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <Link href="#features" className="hover:text-white transition-colors relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
            </Link>
            <Link href="#about" className="hover:text-white transition-colors relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
            </Link>
            <Link href="#impact" className="hover:text-white transition-colors relative group">
              Impact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
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

      {/* Hero */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 px-4 sm:px-6 overflow-hidden min-h-[95vh] flex flex-col justify-center">
        {/* Big Sur Style Colorful Abstract Background */}
        <div className="absolute inset-0 z-0 bg-[#004dc9] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-[#3fd5ff] rounded-full mix-blend-screen filter blur-[120px] opacity-90 animate-pulse"></div>
          <div className="absolute top-[10%] left-[-20%] w-[100vw] h-[100vw] bg-[#ff2a5f] rounded-full mix-blend-normal filter blur-[130px] opacity-100"></div>
          <div className="absolute bottom-[-10%] right-[0%] w-[70vw] h-[70vw] bg-[#ffae00] rounded-full mix-blend-screen filter blur-[100px] opacity-90"></div>
          <div className="absolute top-[40%] left-[20%] w-[50vw] h-[50vw] bg-[#ff5e91] rounded-full mix-blend-screen filter blur-[120px] opacity-60"></div>
        </div>

        <div className="relative text-center max-w-5xl mx-auto animate-fade-in-up z-10 mb-12 lg:mb-16 mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 ring-1 ring-white/30 backdrop-blur-md shadow-lg">
            <Sparkles size={12} className="text-yellow-300" />
            V3 Architecture Now Live
          </div>

          <h1 className="heading-hero text-4xl sm:text-6xl lg:text-[5rem] mb-6 text-white drop-shadow-md leading-[1.05]">
            Contextual AI<br />
            for Student Wellness
          </h1>

          <p className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-sm mb-8">
            SMILE leverages advanced Tri-Model Fusion (Text, Lifestyle, and Behavioral) to identify early burnout risks and provide actionable, private insights without compromising your data.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary !bg-white !text-blue-600 hover:!bg-slate-50 !text-base !py-4 !px-10 !rounded-2xl w-full sm:w-auto shadow-2xl shadow-blue-900/40 border-none relative overflow-hidden group">
              <span className="relative z-10 flex items-center justify-center gap-2">Start your journey <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
            </Link>
          </div>
        </div>

        {/* Clace-Style macOS Window Wrapper */}
        <div className="w-full max-w-5xl mx-auto animate-fade-in-up z-20" style={{ animationDelay: '0.2s' }}>
          <div className="relative rounded-[1.5rem] bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] border border-white/20 overflow-hidden flex flex-col ring-1 ring-black/10 backdrop-blur-sm transition-transform duration-700 hover:scale-[1.01]">
            {/* macOS Window Header */}
            <div className="h-14 bg-white/95 backdrop-blur border-b border-slate-100 flex items-center justify-between px-4 sm:px-5 relative z-20">
              <div className="flex gap-2.5 relative z-10">
                <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e] cursor-pointer hover:bg-[#ff5f56]/80 flex items-center justify-center group"><X size={8} className="text-black/50 opacity-0 group-hover:opacity-100" /></div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123] cursor-pointer hover:bg-[#ffbd2e]/80"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29] cursor-pointer hover:bg-[#27c93f]/80"></div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-bold text-slate-800 text-[15px] tracking-tight flex items-center gap-2">
                  SMILE Context AI
                </span>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <div className="hidden sm:flex items-center bg-slate-100/80 rounded-full p-1 border border-slate-200 shadow-inner">
                  <div className="bg-blue-600 rounded-full px-4 py-1.5 text-xs font-bold shadow-sm text-white">Context</div>
                  <div className="text-xs font-semibold text-slate-600 px-4 py-1.5 cursor-pointer hover:text-slate-900 transition-colors">Fusion</div>
                </div>
                <div className="hidden sm:flex items-center text-xs font-semibold text-slate-600 ml-2 cursor-pointer hover:text-slate-900 transition-colors">
                  GPT 5.2 Pro <span className="ml-1 text-[10px] opacity-70">▼</span>
                </div>
                <div className="w-8 h-8 cursor-pointer rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-md ml-2 border-2 border-slate-800 hover:scale-105 transition-transform">A</div>
              </div>
            </div>

            {/* Window Content */}
            <div className="bg-slate-50 flex-1 relative max-h-[600px] overflow-hidden">
              {/* Inside the window, we render the InteractiveDemo */}
              <div className="h-full overflow-y-auto w-full p-0 sm:pr-2 bg-slate-50">
                <div className="p-4 sm:p-8">
                  <InteractiveDemo />
                </div>
              </div>

              {/* Fade out scroll at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="impact" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center group transition-transform hover:-translate-y-1">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0f172a] mb-2 tracking-tighter">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#1e40af] uppercase tracking-widest opacity-80">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 lg:py-40 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 lg:mb-32">
            <h2 className="heading-section text-3xl sm:text-5xl text-[#0f172a] mb-6">
              Precision Wellness Analytics
            </h2>
            <p className="text-[#64748b] text-base sm:text-lg max-w-2xl mx-auto font-light">
              We combine behavioral science with cutting-edge AI to provide institutional leaders with real-time awareness of student wellbeing.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {features.map((feat, i) => (
              <div
                key={feat.title}
                className="card-premium group p-8 sm:p-10 bg-white"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1e40af]/5 flex items-center justify-center mb-8 group-hover:bg-[#1e40af] transition-colors">
                  <feat.icon size={28} className="text-[#1e40af] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-4">{feat.title}</h3>
                <p className="text-[#64748b] text-sm leading-relaxed font-light">{feat.desc}</p>

                <div className="mt-8 pt-8 border-t border-[#f1f5f9]">
                  <Link href="/signup" className="text-sm font-bold text-[#1e40af] flex items-center gap-2 group/link">
                    Explore more <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Impact - Benefits Split */}
      <section id="about" className="py-24 lg:py-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#1e40af]/10 rounded-full blur-2xl opacity-50" />
              <p className="text-[#1e40af] font-bold text-xs uppercase tracking-[0.2em] mb-4">The SMILE Advantage</p>
              <h2 className="heading-section text-4xl sm:text-6xl text-[#0f172a] mb-8 leading-[1.1]">
                Early detection.
                <br />
                <span className="text-[#64748b]">Real world action.</span>
              </h2>
              <p className="text-lg text-[#64748b] leading-relaxed mb-10 font-light max-w-xl">
                By identifying subtle shifts in daily patterns, SMILE empowers counselors to intervene weeks before crises manifest, creating a safer campus environment for everyone.
              </p>
              <Link href="/signup" className="btn-primary !rounded-2xl !py-4 !px-8 shadow-xl shadow-[#1e40af]/20">
                Learn more about our methods
              </Link>
            </div>

            <div className="grid gap-10">
              {benefits.map((b) => (
                <div key={b.title} className="flex gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-[#f1f5f9] flex items-center justify-center flex-shrink-0 group-hover:bg-[#1e40af]/5 transition-colors duration-500">
                    <b.icon size={24} className="text-[#0f172a] opacity-40 group-hover:text-[#1e40af] group-hover:opacity-100 transition-all duration-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0f172a] mb-2">{b.title}</h4>
                    <p className="text-sm text-[#64748b] leading-relaxed font-light">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security - Dark Mode Section */}
      <section className="py-24 lg:py-40 bg-[#0a0a0a] relative overflow-hidden">
        {/* Dark theme accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mb-24 lg:mb-32">
            <p className="text-xs uppercase tracking-widest text-[#64748b] font-bold mb-4">Uncompromising Privacy</p>
            <h2 className="heading-section text-4xl sm:text-6xl text-white mb-8 leading-tight">
              Anonymized data.
              <br />
              <span className="text-[#64748b]">Absolute confidentiality.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16">
            <div className="group">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:bg-white/10 transition-colors">
                <Lock size={20} className="text-white" />
              </div>
              <h4 className="text-base font-bold text-white mb-3">Military-Grade Encryption</h4>
              <p className="text-sm text-[#94a3b8] leading-relaxed font-light">All datasets are fully anonymized at the source using advanced differential privacy techniques.</p>
            </div>
            <div className="group">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:bg-white/10 transition-colors">
                <Zap size={20} className="text-white" />
              </div>
              <h4 className="text-base font-bold text-white mb-3">Predictive Speed</h4>
              <p className="text-sm text-[#94a3b8] leading-relaxed font-light">Get risk scores instantly. Our distributed engine processes 100K+ data points in milliseconds.</p>
            </div>
            <div className="group">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:bg-white/10 transition-colors">
                <Users size={20} className="text-white" />
              </div>
              <h4 className="text-base font-bold text-white mb-3">Enterprise Controls</h4>
              <p className="text-sm text-[#94a3b8] leading-relaxed font-light">Granular RBAC ensures that only authorized counselors can view sensitive trend data.</p>
            </div>
            <div className="group">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:bg-white/10 transition-colors">
                <Shield size={20} className="text-white" />
              </div>
              <h4 className="text-base font-bold text-white mb-3">Open Validation</h4>
              <p className="text-sm text-[#94a3b8] leading-relaxed font-light">Our model logic is fully transparent and explainable with built-in SHAP visualizations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white border-b border-[#f1f5f9]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-[#0f172a] mb-8">Ready to revolutionize campus wellbeing?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary !text-lg !py-5 !px-12 !rounded-[2rem] w-full sm:w-auto shadow-2xl shadow-[#1e40af]/30">
              Get Started Free
            </Link>
            <Link href="/login" className="text-sm font-bold text-[#64748b] hover:text-[#0f172a] transition-colors p-4">
              Talk to our team
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
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
                <Link href="#" className="hover:text-[#1e40af] transition-colors">Contact Support</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0f172a] uppercase tracking-widest mb-6">Connect</h4>
              <div className="flex gap-4">
                {/* Social placeholders could go here */}
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

