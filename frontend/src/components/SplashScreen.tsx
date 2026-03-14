'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
          }}
          className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 1, 
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2
              }}
              className="mb-8"
            >
                <div className="w-24 h-24 relative">
                    <div className="absolute inset-0 bg-blue-600 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 w-full h-full rounded-3xl flex items-center justify-center shadow-2xl border border-white/10">
                        <span className="text-white text-4xl font-black tracking-tighter italic">S</span>
                    </div>
                </div>
            </motion.div>

            {/* Brand Name */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                SMILE<span className="text-blue-500">.AI</span>
              </h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em]">
                Intelligent Learning Evaluator
              </p>
            </motion.div>

            {/* Loading Bar Container */}
            <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500"
              />
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest"
            >
              Initializing Clinical Neural Engine...
            </motion.p>
          </div>

          {/* Bottom Accreditation */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-12 flex items-center gap-6 opacity-40"
          >
            <div className="h-[1px] w-8 bg-slate-700"></div>
            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
              Secure Data Protocol 2.4
            </span>
            <div className="h-[1px] w-8 bg-slate-700"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
