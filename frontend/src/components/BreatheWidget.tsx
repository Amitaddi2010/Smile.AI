'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, X, Zap } from 'lucide-react';

export default function BreatheWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const phases: ('Inhale' | 'Hold' | 'Exhale' | 'Pause')[] = ['Inhale', 'Hold', 'Exhale', 'Pause'];
    let currentPhaseIdx = 0;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          currentPhaseIdx = (currentPhaseIdx + 1) % phases.length;
          setPhase(phases[currentPhaseIdx]);
          return 0;
        }
        return prev + 2.5; // 4 seconds per phase (100 / 40 updates per phase)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen]);

  const getPhaseText = () => {
    switch (phase) {
      case 'Inhale': return 'Breathe In';
      case 'Hold': return 'Hold';
      case 'Exhale': return 'Breathe Out';
      case 'Pause': return 'Rest';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-72 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-2xl shadow-indigo-900/10 p-8 flex flex-col items-center"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
            >
              <X size={16} />
            </button>

            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-8">Box Breathing</h3>

            <div className="relative w-40 h-40 flex items-center justify-center mb-10">
              {/* Outer Glow */}
              <motion.div 
                animate={{ 
                  scale: phase === 'Inhale' ? 1.5 : phase === 'Exhale' ? 0.8 : phase === 'Hold' ? 1.5 : 0.8,
                  opacity: phase === 'Inhale' || phase === 'Hold' ? 0.4 : 0.1
                }}
                transition={{ duration: 4, ease: "linear" }}
                className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl"
              />
              
              {/* Inner Circle */}
              <motion.div 
                animate={{ 
                  scale: phase === 'Inhale' ? 1.2 : phase === 'Exhale' ? 1 : phase === 'Hold' ? 1.2 : 1,
                  borderRadius: phase === 'Inhale' ? "40% 60% 70% 30% / 40% 50% 60% 70%" : "50%"
                }}
                transition={{ duration: 4, ease: "linear" }}
                className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full shadow-lg shadow-indigo-500/40 flex items-center justify-center z-10"
              >
                <Zap size={24} className="text-white fill-white animate-pulse" />
              </motion.div>

              {/* Progress Ring */}
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-slate-100"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray="440"
                  strokeDashoffset={440 - (440 * progress) / 100}
                  className="text-indigo-500 transition-all duration-100 ease-linear"
                />
              </svg>
            </div>

            <motion.p 
              key={phase}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-black text-slate-900 tracking-tight"
            >
              {getPhaseText()}
            </motion.p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 px-6 text-center">
              Focus on the rhythm of your breath
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${
          isOpen 
            ? 'bg-slate-900 text-white rotate-90' 
            : 'bg-white text-indigo-600 border border-slate-100 hover:shadow-indigo-500/20'
        }`}
      >
        {isOpen ? <X size={24} /> : <Wind size={24} />}
      </motion.button>
    </div>
  );
}
