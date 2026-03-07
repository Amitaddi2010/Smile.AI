import React from 'react';

export function Logo({ className = "w-8 h-8", variant = "default" }: { className?: string; variant?: 'default' | 'white' }) {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {variant === 'default' ? (
                <rect width="100" height="100" rx="24" fill="url(#smile-gradient)" />
            ) : (
                <rect width="100" height="100" rx="24" fill="white" fillOpacity="0.2" />
            )}

            {/* Abstract Brain / Neural Nodes */}
            <circle cx="35" cy="40" r="6" fill="white" />
            <circle cx="50" cy="30" r="8" fill="white" />
            <circle cx="65" cy="40" r="6" fill="white" />

            {/* Connections between nodes */}
            <path d="M35 40 L50 30 L65 40" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8" />
            <path d="M50 30 L50 45" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />

            {/* Smile / Growth Curve */}
            <path d="M25 60 C 25 60, 40 80, 75 55" stroke="white" strokeWidth="8" strokeLinecap="round" fill="none" />

            <defs>
                <linearGradient id="smile-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1e40af" />
                    <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
            </defs>
        </svg>
    );
}
