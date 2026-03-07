'use client';

import React from 'react';
import { Activity, FileText, History, MessageSquare, Play, Settings, Sparkles, Plus, Cpu, Shield, Search } from 'lucide-react';

export default function InteractiveDemo() {
    return (
        <div className="relative w-full max-w-4xl mx-auto h-[480px] sm:h-[550px] rounded-2xl shadow-2xl bg-white border border-[#e2e8f0] overflow-hidden flex flex-col font-sans text-left z-20">
            {/* Navbar (macOS style) */}
            <div className="h-14 bg-white border-b border-[#f1f5f9] flex items-center px-4 justify-between shrink-0">
                <div className="flex space-x-2 w-1/4 sm:w-1/3">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89f24]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1ea32b]" />
                </div>
                <div className="flex justify-center w-2/4 sm:w-1/3 overflow-hidden">
                    <span className="font-semibold text-xs sm:text-sm text-[#0f172a] truncate">SMILE Context AI</span>
                </div>
                <div className="flex items-center justify-end space-x-2 sm:space-x-3 w-1/4 sm:w-1/3 text-[#64748b]">
                    <div className="hidden md:flex items-center bg-[#f0f3fa] text-[#1e40af] px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer hover:bg-[#dbeafe] transition-colors border border-[#dbeafe]">
                        <span className="mr-2 text-[#0f172a] font-medium">Context</span>
                        <div className="w-6 h-4 bg-[#1e40af] rounded-full relative">
                            <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5" />
                        </div>
                    </div>
                    <div className="flex items-center text-[10px] sm:text-xs font-medium cursor-pointer hover:bg-gray-50 px-2 py-1 rounded whitespace-nowrap">
                        GPT 5.2 <span className="ml-1 text-[8px] hidden sm:inline">▼</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden bg-[#fafafa]">
                {/* Sidebar - Hidden on mobile for space */}
                <div className="hidden sm:flex w-[72px] bg-white border-r border-[#f1f5f9] flex-col items-center py-4 space-y-6">
                    <button className="flex flex-col items-center justify-center text-[#1e40af] p-2 bg-[#f0f3fa] rounded-xl w-14 h-14">
                        <MessageSquare size={20} strokeWidth={2.5} />
                        <span className="text-[10px] font-medium mt-1">Chat</span>
                    </button>
                    <button className="flex flex-col items-center justify-center text-[#94a3b8] hover:text-[#0f172a] p-2 hover:bg-gray-50 rounded-xl w-14 h-14 transition-colors">
                        <History size={20} />
                        <span className="text-[10px] font-medium mt-1">History</span>
                    </button>
                    <button className="flex flex-col items-center justify-center text-[#94a3b8] hover:text-[#0f172a] p-2 hover:bg-gray-50 rounded-xl w-14 h-14 transition-colors">
                        <Cpu size={20} />
                        <span className="text-[10px] font-medium mt-1">Rulesets</span>
                    </button>

                    <div className="flex-1" />

                    <button className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                        C
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col relative bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-32 space-y-6 sm:space-y-8">
                        {/* User Message */}
                        <div className="flex justify-end group">
                            <div className="max-w-[95%] sm:max-w-[85%] relative">
                                <div className="flex gap-2 items-center">
                                    <div className="flex-1 min-w-0 rounded-2xl rounded-br-md px-4 py-3 sm:px-5 sm:py-3.5 bg-[#1e40af] text-white shadow-sm font-light text-[13px] sm:text-[15px] tracking-wide leading-relaxed">
                                        <div className="whitespace-pre-wrap break-words overflow-hidden">
                                            Generate a weekly wellbeing report for Student ID 492 based on recent LMS and clinic data.
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 justify-end mt-2">
                                    <span style={{ fontSize: '8px', padding: '2px 6px', borderRadius: '9999px', background: 'rgba(30, 64, 175, 0.1)', color: 'rgba(0, 0, 0, 0.7)', fontWeight: 600 }}>
                                        LMS Hub
                                    </span>
                                    <span style={{ fontSize: '8px', padding: '2px 6px', borderRadius: '9999px', background: 'rgba(34, 197, 94, 0.1)', color: 'rgba(0, 0, 0, 0.7)', fontWeight: 600 }}>
                                        Health API
                                    </span>
                                </div>
                                <p className="text-[9px] text-[#94a3b8] mt-1 text-right font-medium">10:42 am</p>
                            </div>
                        </div>

                        {/* AI Message */}
                        <div className="flex justify-start">
                            <div className="max-w-[95%] sm:max-w-[90%] relative">
                                <div className="bg-white border border-[#e2e8f0] text-[#0f172a] p-4 sm:p-6 rounded-2xl rounded-tl-md shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] space-y-4 font-light text-[13px] sm:text-[15px] leading-relaxed">

                                    {/* Context Cards internal to message */}
                                    <div className="flex flex-col xs:flex-row gap-3 mb-2 sm:mb-4">
                                        <div className="border border-[#e2e8f0] bg-[#f8fafc] rounded-lg px-3 py-2 flex items-center shadow-sm">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#dbeafe] flex items-center justify-center mr-3">
                                                <Search size={14} className="text-[#1e40af]" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-[#64748b] font-medium uppercase tracking-wider mb-0.5">Found Data</p>
                                                <p className="text-xs font-semibold text-[#0f172a]">3 sources</p>
                                            </div>
                                        </div>

                                        <div className="border border-[#e2e8f0] bg-[#f8fafc] rounded-lg px-3 py-2 flex items-center shadow-sm">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#fef08a] flex items-center justify-center mr-3">
                                                <Activity size={14} className="text-[#ca8a04]" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-[#64748b] font-medium uppercase tracking-wider mb-0.5">Risk Level</p>
                                                <p className="text-xs font-semibold text-[#0f172a]">Elevated (68)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <p>Based on the integrated telemetry, here is the weekly wellbeing assessment for Student 492:</p>

                                    <ul className="list-disc pl-5 space-y-2 text-[#334155] marker:text-[#1e40af]">
                                        <li><strong>Academic Interaction:</strong> Login frequency dropped 40%.</li>
                                        <li><strong>Health Context:</strong> Sleep avg: 4.5h/night.</li>
                                        <li><strong>Sentiment:</strong> Increased stress detected in posts.</li>
                                    </ul>

                                    <p className="hidden xs:block"><strong>Action:</strong> Early intervention advised. Counselor draft prepared.</p>
                                </div>
                                <p className="text-[9px] text-[#94a3b8] mt-2 text-left font-medium flex items-center">
                                    <Sparkles size={10} className="mr-1 text-[#1e40af]" /> Validated AI Prediction
                                </p>
                            </div>
                        </div>

                        <div className="h-4"></div> {/* Bottom spacer */}
                    </div>

                    {/* Floating Input Area (Absolute positioned at bottom) */}
                    <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-[700px]">
                        <div className="bg-white border border-[#e2e8f0] shadow-2xl rounded-2xl px-2 py-2 flex flex-col backdrop-blur-xl bg-white/90">

                            {/* Input Tools - Hidden/Simplified on mobile */}
                            <div className="hidden sm:flex gap-4 px-3 py-1.5 text-[#64748b] mb-1">
                                <button className="flex items-center text-[10px] font-medium hover:text-[#0f172a] transition-colors"><Plus size={12} className="mr-1" /> Attach</button>
                                <button className="flex items-center text-[10px] font-medium hover:text-[#0f172a] transition-colors"><Shield size={12} className="mr-1" /> MCP</button>
                                <button className="flex items-center text-[10px] font-medium hover:text-[#0f172a] transition-colors"><Activity size={12} className="mr-1" /> Stats</button>
                            </div>

                            {/* Input Field Area */}
                            <div className="flex items-center bg-[#f8fafc] rounded-xl border border-[#f1f5f9] p-1.2 sm:p-1.5">
                                <input
                                    type="text"
                                    placeholder="Ask follow-up..."
                                    className="flex-1 bg-transparent outline-none px-2 sm:px-3 text-[#0f172a] text-[13px] sm:text-[15px] font-light placeholder:text-[#94a3b8]"
                                    readOnly
                                />
                                <button className="bg-[#1e40af] hover:bg-[#1d4ed8] text-white p-2 sm:p-2.5 rounded-lg shadow-md transition-colors flex items-center justify-center">
                                    <Play size={14} className="fill-current" />
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

