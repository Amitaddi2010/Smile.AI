'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { dashboardAPI } from '@/lib/api';
import { Users, Shield, User, Key, Search, AlertCircle, UserPlus, Info } from 'lucide-react';

export default function AdminUsersPage() {
 const { token } = useAuth();
 const [users, setUsers] = useState<any[]>([]);
 const [counselors, setCounselors] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [updatingParams, setUpdatingParams] = useState<number | null>(null);
 const [errorMsg, setErrorMsg] = useState('');



 const loadUsers = useCallback(async () => {
 setLoading(true);
 try {
 const [usersData, counselorsData] = await Promise.all([
 dashboardAPI.getSystemUsers(token!),
 dashboardAPI.getCounselors(token!)
 ]);
 setUsers(usersData);
 setCounselors(counselorsData);
 } catch (error) {
 console.error(error);
 } finally {
 setLoading(false);
 }
 }, [token]);

 useEffect(() => {
  if (token) loadUsers();
 }, [token, loadUsers]);

 const handleRoleChange = async (userId: number, newRole: string) => {
 setUpdatingParams(userId);
 setErrorMsg('');
 try {
 await dashboardAPI.updateUserRole(userId, newRole, token!);
 setUsers(users.map(u => u.id === userId ? { ...u, role: newRole, counselor_id: newRole !== 'student' ? null : u.counselor_id } : u));

 // Reload counselors if someone was promoted/demoted to/from counselor
 if (newRole === 'counselor' || users.find(u => u.id === userId)?.role === 'counselor') {
 const refreshedCounselors = await dashboardAPI.getCounselors(token!);
 setCounselors(refreshedCounselors);
 }
 } catch (error: any) {
 setErrorMsg(error.message || 'Failed to update user role');
 setTimeout(() => setErrorMsg(''), 5000);
 } finally {
 setUpdatingParams(null);
 }
 };

 const handleCounselorAssign = async (userId: number, counselorIdStr: string) => {
 setUpdatingParams(userId);
 setErrorMsg('');
 try {
 const counselorId = counselorIdStr === "" ? null : parseInt(counselorIdStr);
 await dashboardAPI.assignCounselor(userId, counselorId, token!);
 setUsers(users.map(u => u.id === userId ? { ...u, counselor_id: counselorId } : u));
 } catch (error: any) {
 setErrorMsg(error.message || 'Failed to assign counselor');
 setTimeout(() => setErrorMsg(''), 5000);
 } finally {
 setUpdatingParams(null);
 }
 };

 const filtered = users.filter(u =>
 u.name.toLowerCase().includes(search.toLowerCase()) ||
 u.email.toLowerCase().includes(search.toLowerCase()) ||
 u.role.toLowerCase().includes(search.toLowerCase())
 );

 return (
 <div className="max-w-7xl mx-auto space-y-8 relative z-10 animate-fade-in-up">
 <header className="mb-4 pt-2">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
 <Users className="text-blue-600" size={32} />
 System Users
 </h1>
 <p className="text-slate-500 mt-2 text-sm sm:text-base font-medium">Manage user access and roles across the SMILE-AI platform.</p>
 </div>
 </div>
 </header>

 <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex gap-4 items-start">
 <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
 <UserPlus size={20} />
 </div>
 <div>
 <h3 className="text-sm font-black text-blue-900 mb-1">How to Create an Admin or Counselor Account?</h3>
 <p className="text-sm text-blue-800/80 leading-relaxed max-w-3xl">
 To add a new Counselor or Admin, instruct the staff member to <strong>create a standard account</strong> via the main signup page. Once they are registered, locate their account in the table below and change their Role to &quot;Counselor&quot; or &quot;Admin&quot;. They will automatically gain access to the respective dashboards.
 </p>
 </div>
 </div>

 {errorMsg && (
 <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
 <AlertCircle size={20} />
 <p className="font-bold text-sm">{errorMsg}</p>
 </div>
 )}

 <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden">
 <div className="p-6 sm:p-8 border-b border-white/40 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="relative flex-1 w-full max-w-md">
 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 " />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Search by name, email, or role..."
 className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/50 border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold shadow-inner"
 />
 </div>
 </div>

 <div className="overflow-x-auto custom-scrollbar">
 <table className="w-full min-w-[700px]">
 <thead className="bg-white/40 backdrop-blur-3xl border-b border-white ">
 <tr>
 <th className="px-8 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">User Profile</th>
 <th className="px-8 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Role</th>
 <th className="px-8 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Assigned Counselor</th>
 <th className="px-8 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Joined Date</th>
 <th className="px-8 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
 <th className="px-8 py-5 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/60 bg-white/30 ">
 {filtered.map(user => (
 <tr key={user.id} className="hover:bg-white/80 transition-all duration-300">
 <td className="px-8 py-6 whitespace-nowrap">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-[1.25rem] bg-slate-900 flex items-center justify-center text-lg font-black text-white shadow-xl shadow-slate-900/10">
 {user.name.charAt(0).toUpperCase()}
 </div>
 <div>
 <p className="text-slate-900 font-extrabold text-base">{user.name}</p>
 <p className="text-slate-500 text-sm font-semibold">{user.email}</p>
 </div>
 </div>
 </td>
 <td className="px-8 py-6 whitespace-nowrap">
 <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200' :
 user.role === 'counselor' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' :
 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
 }`}>
 {user.role === 'admin' && <Key size={14} />}
 {user.role === 'counselor' && <Shield size={14} />}
 {user.role === 'student' && <User size={14} />}
 {user.role}
 </span>
 </td>
 <td className="px-8 py-6 whitespace-nowrap">
 {user.role === 'student' ? (
 <select
 value={user.counselor_id || ''}
 onChange={(e) => handleCounselorAssign(user.id, e.target.value)}
 disabled={updatingParams === user.id}
 className="px-3 py-1.5 bg-blue-50/50 border border-blue-100 rounded-lg text-blue-700 font-semibold text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer disabled:opacity-50 transition-colors w-full min-w-[140px]"
 >
 <option value="">Unguided</option>
 {counselors.map(c => (
 <option key={c.id} value={c.id}>
 {c.name}
 </option>
 ))}
 </select>
 ) : (
 <span className="text-slate-400 text-sm font-medium italic">-</span>
 )}
 </td>
 <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-slate-700 ">
 {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
 </td>
 <td className="px-8 py-6 whitespace-nowrap">
 <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${user.is_active ? 'bg-green-100 text-green-700 ring-1 ring-green-200' : 'bg-red-100 text-red-700 ring-1 ring-red-200'
 }`}>
 <div className={`w-2 h-2 rounded-full shadow-inner ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
 {user.is_active ? 'Active' : 'Inactive'}
 </span>
 </td>
 <td className="px-8 py-6 whitespace-nowrap text-right text-sm">
 <select
 value={user.role}
 onChange={(e) => handleRoleChange(user.id, e.target.value)}
 disabled={updatingParams === user.id}
 className="px-4 py-2 bg-white/80 border border-slate-200 rounded-xl text-slate-900 font-black text-xs uppercase tracking-widest focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer disabled:opacity-50 hover:bg-white transition-colors"
 >
 <option value="student">Student</option>
 <option value="counselor">Counselor</option>
 <option value="admin">Admin</option>
 </select>
 </td>
 </tr>
 ))}
 {filtered.length === 0 && !loading && (
 <tr>
 <td colSpan={5} className="py-20 text-center">
 <div className="w-16 h-16 bg-slate-100/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
 <Search size={24} />
 </div>
 <h3 className="text-lg font-black text-slate-900 mb-1">No users found</h3>
 <p className="text-slate-500 font-medium">Try adjusting your search query "{search}"</p>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}
