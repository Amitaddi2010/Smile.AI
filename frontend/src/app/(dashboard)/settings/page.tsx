'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
 User, Mail, Shield, Calendar, LogOut,
 Moon, Bell, Download, Smartphone,
 Lock, ExternalLink, Activity, CheckCircle2,
 Edit3, Key
} from 'lucide-react';
import { authAPI, dashboardAPI } from '@/lib/api';
import { useTheme } from '@/lib/theme-context';

export default function SettingsPage() {
 const { user, token, logout } = useAuth();
 const { theme, toggleTheme } = useTheme();
 const darkMode = theme === 'dark';
 const [notifications, setNotifications] = useState(true);
 const [exportLoading, setExportLoading] = useState(false);
 const [profileLoading, setProfileLoading] = useState(false);
 const [passwordLoading, setPasswordLoading] = useState(false);
 const [showSuccess, setShowSuccess] = useState(false);
 const [successMsg, setSuccessMsg] = useState('');
 const [isEditing, setIsEditing] = useState(false);
 const [profileForm, setProfileForm] = useState({ name: '', email: '' });
 const [passwordForm, setPasswordForm] = useState({ current: '', new: '' });

 useEffect(() => {
 if (user) {
 setProfileForm({ name: user.name, email: user.email });
 }
 }, [user]);

 const handleProfileUpdate = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!token) return;
 setProfileLoading(true);
 try {
 await authAPI.updateProfile(profileForm, token);
 setSuccessMsg('Profile updated successfully!');
 setShowSuccess(true);
 setIsEditing(false);
 setTimeout(() => setShowSuccess(false), 3000);
 // Ideally we'd refresh auth context here
 } catch (error: any) {
 alert(error.message || 'Update failed');
 } finally {
 setProfileLoading(true);
 setProfileLoading(false);
 }
 };

 const handlePasswordUpdate = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!token) return;
 setPasswordLoading(true);
 try {
 await authAPI.updatePassword({
 current_password: passwordForm.current,
 new_password: passwordForm.new
 }, token);
 setSuccessMsg('Password updated successfully!');
 setShowSuccess(true);
 setPasswordForm({ current: '', new: '' });
 setTimeout(() => setShowSuccess(false), 3000);
 } catch (error: any) {
 alert(error.message || 'Password update failed');
 } finally {
 setPasswordLoading(false);
 }
 };

 if (!user) return null;

 const handleExport = async () => {
 if (!token) return;
 setExportLoading(true);
 try {
 const data = await dashboardAPI.exportUserData(token);
 const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = `smile-ai-${user.name.toLowerCase().replace(/\s+/g, '-')}-data.json`;
 link.click();
 URL.revokeObjectURL(url);

 setSuccessMsg('Vault data exported successfully.');
 setShowSuccess(true);
 setTimeout(() => setShowSuccess(false), 3000);
 } catch (error) {
 console.error('Export failed:', error);
 alert('Data export failed. Please try again.');
 } finally {
 setExportLoading(false);
 }
 };

 const handleNotificationToggle = async () => {
 if (!notifications) {
 const permission = await Notification.requestPermission();
 if (permission === 'granted') {
 setNotifications(true);
 new Notification("SMILE-AI Alerts Enabled", {
 body: "We will now notify you of high-risk diagnostics.",
 icon: "/favicon.ico"
 });
 } else {
 alert("Please enable notification permission in your browser settings.");
 }
 } else {
 setNotifications(false);
 }
 };

 return (
 <div className="max-w-5xl mx-auto space-y-10 relative z-10 animate-fade-in-up">
 <header className="mb-2">
 <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">System Settings</h1>
 <p className="text-slate-600 mt-2 font-medium">Personalize your SMILE-AI experience & manage your secure data vault.</p>
 </header>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Profile Section */}
 <div className="lg:col-span-1 space-y-6">
 <div className="glass-card rounded-[2.5rem] p-8">
 <div className="flex flex-col items-center text-center">
 <div className="group relative">
 <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-blue-500/20 mb-6 group-hover:scale-105 transition-transform">
 {user.name.charAt(0).toUpperCase()}
 </div>
 <div className="absolute inset-0 rounded-[2rem] border-2 border-white/20 animate-pulse opacity-0 group-hover:opacity-100" />
 </div>

 {!isEditing ? (
 <>
 <h2 className="text-xl font-black text-slate-900 mb-1">{user.name}</h2>
 <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{user.role}</p>
 <button
 onClick={() => setIsEditing(true)}
 className="mt-4 px-4 py-1.5 rounded-lg bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-200"
 >
 Edit Profile
 </button>
 </>
 ) : (
 <form onSubmit={handleProfileUpdate} className="w-full space-y-4">
 <input
 type="text"
 value={profileForm.name}
 onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 ring-blue-500/20 outline-none"
 placeholder="Full Name"
 />
 <div className="flex gap-2">
 <button type="submit" disabled={profileLoading} className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50">
 {profileLoading ? '...' : 'Save'}
 </button>
 <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-slate-50 text-slate-600 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200">
 Cancel
 </button>
 </div>
 </form>
 )}

 <div className="w-full h-px bg-slate-100 my-8" />

 <div className="w-full space-y-5 text-left">
 <div className="flex items-center gap-4 group">
 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
 <Mail size={18} />
 </div>
 <div className="flex-1 overflow-hidden">
 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Email</p>
 <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
 </div>
 </div>
 <div className="flex items-center gap-4 group">
 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
 <Calendar size={18} />
 </div>
 <div className="flex-1 overflow-hidden">
 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Joined</p>
 <p className="text-sm font-bold text-slate-900">{new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
 </div>
 </div>
 </div>
 </div>
 </div>

 <button
 onClick={logout}
 className="w-full group flex items-center justify-center gap-3 py-4 rounded-[1.5rem] bg-red-50 text-red-600 font-black uppercase tracking-widest text-xs border border-red-100/50 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-600/20 transition-all active:scale-[0.98]"
 >
 <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
 Log Out Session
 </button>
 </div>

 {/* Right Content Area */}
 <div className="lg:col-span-2 space-y-8">
 {/* User Preferences Section */}
 <div className="glass-card rounded-[2.5rem] p-8">
 <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-8">System Preferences</h3>
 <div className="space-y-6">
 <div className="flex items-center justify-between group">
 <div className="flex items-center gap-4">
 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${notifications ? 'bg-green-100 text-green-600 shadow-inner' : 'bg-slate-50 text-slate-500'}`}>
 <Bell size={22} className={notifications ? 'animate-pulse' : ''} />
 </div>
 <div>
 <p className="text-[15px] font-black text-slate-900 tracking-tight">Smart Notifications</p>
 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Predictive risk alerts</p>
 </div>
 </div>
 <button
 onClick={handleNotificationToggle}
 className={`relative w-14 h-8 transition-all duration-300 rounded-[1rem] ${notifications ? 'bg-green-600' : 'bg-slate-200'}`}
 >
 <span className={`absolute top-1 left-1 w-6 h-6 rounded-lg bg-white shadow-md transition-transform duration-300 ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
 </button>
 </div>
 </div>
 </div>

 {/* Infrastructure & Privacy Section */}
 <div className="glass-card rounded-[2.5rem] p-8 overflow-hidden relative">
 <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 pointer-events-none text-slate-500">
 <Shield size={160} />
 </div>

 <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Secure Data Vault</h3>
 <p className="text-sm font-bold text-slate-600 mb-8 leading-relaxed max-w-sm">Every assessment and journal entry in our system is encrypted end-to-end. You maintain 100% ownership.</p>

 <div className="flex flex-col sm:flex-row gap-4">
 <button
 onClick={handleExport}
 disabled={exportLoading}
 className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest border transition-all ${exportLoading
 ? 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed'
 : 'bg-blue-600 text-white border-blue-700 shadow-xl shadow-blue-600/20 hover:-translate-y-1 active:scale-[0.98]'
 }`}
 >
 {exportLoading ? (
 <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
 ) : (
 <Download size={16} />
 )}
 {exportLoading ? 'Packaging Vault...' : 'Export My Health Records'}
 </button>

 <button className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-[1.5rem] bg-slate-900 text-white text-xs font-black uppercase tracking-widest border border-slate-900 shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-1 transition-all active:scale-[0.98]">
 <Lock size={16} />
 Manage Access Keys
 </button>
 </div>

 <div className="w-full h-px bg-slate-200 opacity-30 my-8" />

 <div className="space-y-6">
 <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
 <Shield size={14} className="text-blue-600" /> Infrastructure Integrity
 </h4>
 <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Current Password</p>
 <input
 type="password"
 required
 value={passwordForm.current}
 onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
 className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:ring-4 ring-blue-500/10 outline-none transition-all"
 placeholder="••••••••"
 />
 </div>
 <div className="space-y-1.5">
 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</p>
 <input
 type="password"
 required
 value={passwordForm.new}
 onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
 className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:ring-4 ring-blue-500/10 outline-none transition-all"
 placeholder="Min. 6 chars"
 />
 </div>
 <div className="sm:col-span-2">
 <button
 type="submit"
 disabled={passwordLoading}
 className="w-full bg-slate-50 text-slate-900 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2 group"
 >
 {passwordLoading ? (
 <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
 ) : (
 <Lock size={14} className="group-hover:scale-110 transition-transform" />
 )}
 Rotate Security Credentials
 </button>
 </div>
 </form>
 </div>

 {showSuccess && (
 <div className="mt-8 flex items-center gap-3 text-green-600 bg-green-50 p-5 rounded-2xl animate-fade-in-up border border-green-100 ">
 <CheckCircle2 size={24} className="animate-bounce" />
 <div>
 <p className="text-[11px] font-black uppercase tracking-widest">Operation Successful</p>
 <p className="text-sm font-bold opacity-80">{successMsg}</p>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
