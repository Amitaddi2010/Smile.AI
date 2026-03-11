"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
 Search, Home, Activity, Brain, FileText, Settings, Users,
 BarChart3, Sparkles, ArrowRight, Command, X
} from "lucide-react";

const allCommands = [
 { label: "Dashboard", href: "/dashboard", icon: Home, section: "Navigation" },
 { label: "Assessment", href: "/assessment", icon: Activity, section: "Navigation" },
 { label: "Journal", href: "/journal", icon: FileText, section: "Navigation" },
 { label: "Wellness", href: "/wellness", icon: Sparkles, section: "Navigation" },
 { label: "AI Insights", href: "/ai-insights", icon: Brain, section: "Navigation" },
 { label: "Settings", href: "/settings", icon: Settings, section: "Navigation" },
 { label: "Students", href: "/counselor", icon: Users, section: "Admin" },
 { label: "Analytics", href: "/admin", icon: BarChart3, section: "Admin" },
 { label: "Model Explainability", href: "/explainability", icon: Brain, section: "Admin" },
 { label: "Datasets", href: "/datasets", icon: FileText, section: "Admin" },
 { label: "About SMILE", href: "/about", icon: ArrowRight, section: "Quick Links" },
 { label: "Home Page", href: "/", icon: Home, section: "Quick Links" },
];

export default function CommandPalette() {
 const [open, setOpen] = useState(false);
 const [query, setQuery] = useState("");
 const [selectedIndex, setSelectedIndex] = useState(0);
 const inputRef = useRef<HTMLInputElement>(null);
 const router = useRouter();

 const filtered = query
 ? allCommands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
 : allCommands;

 // Group by section
 const grouped = filtered.reduce((acc, cmd) => {
 if (!acc[cmd.section]) acc[cmd.section] = [];
 acc[cmd.section].push(cmd);
 return acc;
 }, {} as Record<string, typeof allCommands>);

 const flatFiltered = Object.values(grouped).flat();

 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if ((e.metaKey || e.ctrlKey) && e.key === "k") {
 e.preventDefault();
 setOpen(prev => !prev);
 }
 if (e.key === "Escape") setOpen(false);
 };
 const handleCustomOpen = () => setOpen(true);
 window.addEventListener("keydown", handleKeyDown);
 window.addEventListener("open-command-palette", handleCustomOpen);
 return () => {
 window.removeEventListener("keydown", handleKeyDown);
 window.removeEventListener("open-command-palette", handleCustomOpen);
 };
 }, []);

 useEffect(() => {
 if (open) {
 setQuery("");
 setSelectedIndex(0);
 setTimeout(() => inputRef.current?.focus(), 50);
 }
 }, [open]);

 const handleSelect = (href: string) => {
 setOpen(false);
 router.push(href);
 };

 const handleKeyNav = (e: React.KeyboardEvent) => {
 if (e.key === "ArrowDown") {
 e.preventDefault();
 setSelectedIndex(i => Math.min(i + 1, flatFiltered.length - 1));
 } else if (e.key === "ArrowUp") {
 e.preventDefault();
 setSelectedIndex(i => Math.max(i - 1, 0));
 } else if (e.key === "Enter" && flatFiltered[selectedIndex]) {
 handleSelect(flatFiltered[selectedIndex].href);
 }
 };

 return (
 <AnimatePresence>
 {open && (
 <>
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.15 }}
 className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
 onClick={() => setOpen(false)}
 />

 {/* Palette */}
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: -20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: -20 }}
 transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
 className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[101]"
 >
 <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 border border-slate-200 overflow-hidden">
 {/* Search Input */}
 <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 ">
 <Search size={20} className="text-slate-500 shrink-0" />
 <input
 ref={inputRef}
 type="text"
 placeholder="Search pages, actions..."
 value={query}
 onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
 onKeyDown={handleKeyNav}
 className="flex-1 bg-transparent text-slate-900 placeholder-slate-500 text-sm font-medium outline-none"
 />
 <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600 border border-slate-200 ">
 ESC
 </kbd>
 </div>

 {/* Results */}
 <div className="max-h-[320px] overflow-y-auto py-2">
 {flatFiltered.length === 0 ? (
 <div className="px-5 py-8 text-center text-slate-500 text-sm">
 No results found for &ldquo;{query}&rdquo;
 </div>
 ) : (
 Object.entries(grouped).map(([section, items]) => (
 <div key={section}>
 <div className="px-5 py-2">
 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ">{section}</span>
 </div>
 {items.map((cmd) => {
 const globalIdx = flatFiltered.indexOf(cmd);
 const isSelected = globalIdx === selectedIndex;
 return (
 <button
 key={cmd.href}
 onClick={() => handleSelect(cmd.href)}
 onMouseEnter={() => setSelectedIndex(globalIdx)}
 className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${isSelected
 ? "bg-blue-50 text-blue-600 "
 : "text-slate-700 hover:bg-slate-50 "
 }`}
 >
 <cmd.icon size={18} className={isSelected ? "text-blue-500" : "text-slate-500 "} />
 <span className="flex-1 text-left">{cmd.label}</span>
 {isSelected && (
 <ArrowRight size={14} className="text-blue-400" />
 )}
 </button>
 );
 })}
 </div>
 ))
 )}
 </div>

 {/* Footer */}
 <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
 <span className="flex items-center gap-1.5">
 <Command size={10} /> Navigate with ↑↓ Enter
 </span>
 <span className="flex items-center gap-1.5">
 <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px]">Ctrl</kbd>
 +
 <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px]">K</kbd>
 to toggle
 </span>
 </div>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}
