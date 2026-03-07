'use client';
import { useState, useEffect } from 'react';

const messages = [
    { prefix: 'We help students ', highlight: 'understand their risk.' },
    { prefix: 'We help counselors ', highlight: 'monitor wellbeing.' },
    { prefix: 'We help institutions ', highlight: 'make data-driven decisions.' },
];

export default function RotatingSubtitle() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % messages.length);
        }, 3000); // Change text every 3 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-lg md:text-xl relative h-8 flex items-center justify-center overflow-hidden mb-12">
            {messages.map((msg, index) => {
                const isActive = index === currentIndex;
                return (
                    <div
                        key={index}
                        className={`absolute transition-all duration-500 ease-in-out whitespace-nowrap ${isActive
                                ? 'opacity-100 transform translate-y-0'
                                : 'opacity-0 transform translate-y-4'
                            }`}
                    >
                        <span className="text-[#64748b]">{msg.prefix}</span>
                        <span className="text-[#1e40af] font-medium">{msg.highlight}</span>
                    </div>
                );
            })}
        </div>
    );
}
