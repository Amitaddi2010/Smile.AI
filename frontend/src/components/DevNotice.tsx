'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Terminal } from 'lucide-react';

export default function DevNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('smile_dev_notice_dismissed');
    if (!isDismissed) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem('smile_dev_notice_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-6 pointer-events-auto overflow-hidden relative"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-inner">
                  <AlertCircle size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">Development Phase Notice</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">SMILE-AI is currently in active beta. </p>
                </div>
                <button 
                  onClick={dismiss}
                  className="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-900/5 rounded-2xl border border-slate-900/5">
                  <p className="text-slate-700 text-sm leading-relaxed">
                    You may experience <span className="font-bold text-amber-700">slower response times</span> or intermittent glitches as we scale our clinical models and infrastructure. 
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={dismiss}
                    className="flex-1 py-3 px-6 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
                  >
                    I Understand
                  </button>
                  <a 
                    href="/about"
                    className="flex items-center justify-center gap-2 py-3 px-6 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    <Terminal size={14} />
                    View Changelog
                  </a>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6 text-center">
                Ref: VERSION_1.0.0_STABLE_ALPHA
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
