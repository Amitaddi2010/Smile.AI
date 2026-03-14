'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SentimentVisualizerProps {
  isRecording: boolean;
  sentiment?: 'joyful' | 'calm' | 'neutral' | 'anxious' | 'stressed' | 'sad' | 'angry';
}

export default function SentimentVisualizer({ isRecording, sentiment = 'neutral' }: SentimentVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getSentimentColor = () => {
    switch (sentiment) {
      case 'joyful': return '#f59e0b'; // Amber
      case 'calm': return '#10b981'; // Emerald
      case 'anxious': return '#fbbf24'; // Yellow
      case 'stressed': return '#ef4444'; // Red
      case 'sad': return '#3b82f6'; // Blue
      case 'angry': return '#b91c1c'; // Dark Red
      default: return '#6366f1'; // Indigo
    }
  };

  useEffect(() => {
    if (!isRecording || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    let animationFrameId: number;
    let particles: any[] = [];

    const createParticle = () => {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height / 2,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 3 - 1.5,
        life: 1,
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const color = getSentimentColor();
      ctx.fillStyle = color;
      ctx.strokeStyle = color;

      // Draw Wave
      ctx.beginPath();
      ctx.lineWidth = 2;
      for (let i = 0; i < canvas.width; i++) {
        const y = canvas.height / 2 + Math.sin(i * 0.05 + Date.now() * 0.005) * 10;
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      // Particles
      if (particles.length < 50) particles.push(createParticle());

      particles.forEach((p, index) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= 0.01;

        if (p.life <= 0) {
          particles[index] = createParticle();
        }

        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRecording, sentiment]);

  return (
    <div className="relative w-full h-12 bg-slate-900/5 rounded-xl border border-slate-200 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={400}
        height={48}
        className="w-full h-full opacity-60"
      />
      {!isRecording && (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 bg-slate-300 rounded-full animate-ping"></div>
        </div>
      )}
    </div>
  );
}
