"use client";

import { useAppStore } from "@/store";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Activity, Shield, Edit, KeyRound, UserX, UserCheck, Eye, List, Search, X, CheckCircle2, ShieldAlert,
  Building2, HeartPulse, Plus, ChevronDown, ChevronRight
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";

export default function SuperAdminDashboard() {
  const { 
    users, currentUserId, setCurrentUserId,
    setImpersonatedUserId, addAuditLog, updateUser,
    auditLogs, rooms, updateRoom
  } = useAppStore();
  
  const router = useRouter();
  const currentUser = users.find(u => u.id === currentUserId);
  const [activeTab, setActiveTab] = useState<'analytics' | 'rooms' | 'users' | 'finance' | 'audit' | 'health'>('analytics');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editRoomData, setEditRoomData] = useState({ name: '', logoUrl: '', university: '', faculty: '' });
  
  // User Management State
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  // Impersonation Modal State
  const [impersonateModal, setImpersonateModal] = useState<{ isOpen: boolean; userId: string | null }>({ isOpen: false, userId: null });
  const [impersonateReason, setImpersonateReason] = useState('');

  // Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const superAdmin = users.find(u => u.role === 'super_admin' && u.username === loginUsername);
    if (superAdmin && superAdmin.password === loginPassword) {
      setCurrentUserId(superAdmin.id);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  if (!currentUser || currentUser.role !== 'super_admin') {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-4 bg-[#090A0C]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          className="bg-[#141618]/90 backdrop-blur-2xl border border-white/[0.08] shadow-2xl p-8 rounded-3xl w-full max-w-sm flex flex-col gap-6 relative overflow-hidden z-10"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold text-white">Super Admin Portal</h2>
            <p className="text-sm text-gray-400">Strictly authorized access only.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4 relative z-10">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                className="bg-[#23252b] border border-[#2a2d36] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="bg-[#23252b] border border-[#2a2d36] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                required
              />
            </div>
            
            {loginError && <p className="text-red-400 text-xs font-medium">{loginError}</p>}

            <button 
              type="submit" 
              className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              Authenticate
            </button>
            <button 
              type="button"
              onClick={() => router.push('/')}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Back to Home
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleToggleStatus = (userId: string, currentStatus: string | undefined) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    updateUser(userId, { status: newStatus });
    addAuditLog({ actorId: currentUser.id, action: `Changed user status to ${newStatus}`, targetId: userId });
  };

  const handleResetPassword = (userId: string) => {
    if (confirm("Are you sure you want to reset this user's password? This will invalidate all their active sessions.")) {
      updateUser(userId, { password: 'abc123' }); // Mocking a reset
      addAuditLog({ actorId: currentUser.id, action: "Forced password reset", targetId: userId });
      alert("Password has been reset to default 'abc123'.");
    }
  };

  const initiateImpersonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (impersonateModal.userId && impersonateReason.trim()) {
      addAuditLog({ actorId: currentUser.id, action: `Started Impersonation Session. Reason: ${impersonateReason}`, targetId: impersonateModal.userId });
      setImpersonatedUserId(currentUser.id); // Store original admin ID
      const { setCurrentUserId } = useAppStore.getState();
      setCurrentUserId(impersonateModal.userId); // Become the user
      setImpersonateModal({ isOpen: false, userId: null });
      setImpersonateReason('');
      router.push('/'); // Redirect to dashboard to view as them
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#050608] text-white fixed inset-0 overflow-y-auto z-50">
      {/* Top Navbar */}
      <header className="w-full px-8 py-5 flex justify-between items-center bg-[#0B0C0E] border-b border-[#2a2d36] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">Super Admin Control</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">God Mode Activated</p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="px-5 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors text-sm"
        >
          Exit to App
        </button>
      </header>

      <div className="flex-1 flex w-full max-w-7xl mx-auto p-4 md:p-8 gap-8 flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <button onClick={() => setActiveTab('analytics')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-colors ${activeTab === 'analytics' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <Activity size={18} /> Live Analytics
          </button>
          <button onClick={() => setActiveTab('rooms')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-colors ${activeTab === 'rooms' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <Building2 size={18} /> Room Management
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-colors ${activeTab === 'users' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <Users size={18} /> User Management
          </button>
          <button onClick={() => setActiveTab('finance')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-colors ${activeTab === 'finance' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <Edit size={18} /> Financial Oversight
          </button>
          <button onClick={() => setActiveTab('audit')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-colors ${activeTab === 'audit' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <List size={18} /> Audit Logs
          </button>
          <button onClick={() => setActiveTab('health')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-colors ${activeTab === 'health' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <HeartPulse size={18} /> System Health
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 bg-[#0B0C0E] border border-[#2a2d36] rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <h2 className="text-2xl font-extrabold">Live Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#141618] border border-white/5 p-6 rounded-2xl flex flex-col gap-2">
                  <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Total Users</span>
                  <span className="text-4xl font-black text-white">{users.length}</span>
                </div>
                <div className="bg-[#141618] border border-white/5 p-6 rounded-2xl flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl"></div>
                  <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Online Now (Mock)</span>
                  <span className="text-4xl font-black text-emerald-400 flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></span> 4
                  </span>
                </div>
                <div className="bg-[#141618] border border-white/5 p-6 rounded-2xl flex flex-col gap-2">
                  <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Daily Active (DAU)</span>
                  <span className="text-4xl font-black text-white">85%</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rooms' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-extrabold">Room Management</h2>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl font-bold transition-colors text-sm">
                  <Plus size={16} /> New Room
                </button>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-gray-400 uppercase bg-[#141618]">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-xl rounded-bl-xl">Room Name</th>
                      <th className="px-4 py-3">Invite Code</th>
                      <th className="px-4 py-3">Members</th>
                      <th className="px-4 py-3 rounded-tr-xl rounded-br-xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map(room => {
                      const memberCount = users.filter(u => u.roomId === room.id).length;
                      return (
                        <tr key={room.id} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                          <td className="px-4 py-4">
                            <span className="font-bold">{room.name}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-mono bg-white/5 px-2 py-1 rounded-md text-xs">{room.inviteCode}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-gray-300">
                              <Users size={14} />
                              <span className="font-bold">{memberCount}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button 
                              onClick={() => {
                                setEditingRoomId(room.id);
                                setEditRoomData({ 
                                  name: room.name, 
                                  logoUrl: room.logoUrl || '',
                                  university: room.university || '',
                                  faculty: room.faculty || ''
                                });
                              }}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors"
                            >
                              Edit Room
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-extrabold">User Management</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-[#1A1D20] border border-[#2a2d36] rounded-xl text-sm focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full">
                {rooms.map(room => {
                  const roomUsers = filteredUsers.filter(u => u.roomId === room.id);
                  const isExpanded = expandedRoomId === room.id;
                  
                  return (
                    <div key={room.id} className="bg-[#141618] border border-[#2a2d36] rounded-2xl overflow-hidden">
                      <button 
                        onClick={() => setExpandedRoomId(isExpanded ? null : room.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                          <span className="font-bold text-lg">{room.name}</span>
                          <span className="px-2 py-1 bg-white/5 rounded-md text-xs font-mono text-gray-400">{roomUsers.length} Users</span>
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="p-4 border-t border-[#2a2d36] bg-[#090A0C]/50 flex flex-col gap-2">
                          {roomUsers.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">No users found in this room.</p>
                          ) : (
                            roomUsers.map(user => (
                              <div 
                                key={user.id} 
                                onClick={() => setSelectedUser(user)}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-[#23252b] relative overflow-hidden shrink-0">
                                    <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-sm">{user.name}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${user.role === 'admin' ? 'text-emerald-400' : 'text-gray-500'}`}>
                                      {user.role}
                                    </span>
                                  </div>
                                </div>
                                <span className={`flex items-center gap-1.5 text-xs font-bold ${user.status === 'suspended' ? 'text-red-400' : 'text-emerald-400'}`}>
                                  <span className={`w-2 h-2 rounded-full ${user.status === 'suspended' ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                                  {user.status === 'suspended' ? 'Suspended' : 'Active'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Global / Unassigned Users */}
                {(() => {
                  const unassignedUsers = filteredUsers.filter(u => !u.roomId);
                  if (unassignedUsers.length === 0) return null;
                  const isExpanded = expandedRoomId === 'global';

                  return (
                    <div className="bg-[#141618] border border-[#2a2d36] rounded-2xl overflow-hidden mt-2">
                      <button 
                        onClick={() => setExpandedRoomId(isExpanded ? null : 'global')}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                          <span className="font-bold text-lg text-indigo-400">Global / Unassigned</span>
                          <span className="px-2 py-1 bg-indigo-500/10 rounded-md text-xs font-mono text-indigo-400">{unassignedUsers.length} Users</span>
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="p-4 border-t border-[#2a2d36] bg-[#090A0C]/50 flex flex-col gap-2">
                          {unassignedUsers.map(user => (
                            <div 
                              key={user.id} 
                              onClick={() => setSelectedUser(user)}
                              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#23252b] relative overflow-hidden shrink-0">
                                  <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-sm">{user.name}</span>
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                                    {user.role.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                              <span className={`flex items-center gap-1.5 text-xs font-bold ${user.status === 'suspended' ? 'text-red-400' : 'text-emerald-400'}`}>
                                <span className={`w-2 h-2 rounded-full ${user.status === 'suspended' ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                                {user.status === 'suspended' ? 'Suspended' : 'Active'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* User Details Modal */}
              <AnimatePresence>
                {selectedUser && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                  >
                    <motion.div 
                      initial={{ scale: 0.95, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.95, y: 20 }}
                      className="bg-[#141618] border border-[#2a2d36] shadow-2xl rounded-3xl w-full max-w-md overflow-hidden flex flex-col"
                    >
                      <div className="p-6 border-b border-[#2a2d36] flex justify-between items-start relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[3rem] -translate-y-1/2 rounded-full pointer-events-none"></div>
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-16 h-16 rounded-full bg-[#23252b] border-2 border-[#2a2d36] relative overflow-hidden shrink-0">
                            <Image src={selectedUser.avatar} alt={selectedUser.name} fill className="object-cover" />
                          </div>
                          <div className="flex flex-col">
                            <h3 className="font-extrabold text-xl text-white">{selectedUser.name}</h3>
                            <span className="text-xs font-mono text-gray-500">ID: {selectedUser.id}</span>
                            <span className={`w-fit mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${selectedUser.role === 'super_admin' ? 'bg-red-500/10 text-red-400' : selectedUser.role === 'admin' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                              {selectedUser.role.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <button onClick={() => setSelectedUser(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors relative z-10">
                          <X size={18} className="text-gray-400" />
                        </button>
                      </div>

                      <div className="p-6 flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Room</span>
                            <select 
                              value={selectedUser.roomId || ''} 
                              onChange={(e) => {
                                updateUser(selectedUser.id, { roomId: e.target.value || null });
                                addAuditLog({ actorId: currentUser.id, action: `Changed room for ${selectedUser.name}`, targetId: selectedUser.id });
                                setSelectedUser({ ...selectedUser, roomId: e.target.value || null });
                              }}
                              disabled={selectedUser.role === 'super_admin'}
                              className="bg-[#1A1D20] border border-[#2a2d36] rounded-xl text-sm font-medium text-white px-3 py-2 focus:outline-none focus:border-indigo-500/50 disabled:opacity-50"
                            >
                              <option value="">No Room / Global</option>
                              {rooms.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Activate Time</span>
                            <div className="bg-[#1A1D20] border border-[#2a2d36] rounded-xl text-sm font-medium text-white px-3 py-2 flex items-center h-full">
                              {selectedUser.joinedAt ? format(new Date(selectedUser.joinedAt), 'MMM dd, yyyy') : 'Unknown'}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Administrative Actions</span>
                          {selectedUser.id !== currentUser.id ? (
                            <div className="flex flex-wrap gap-2">
                              <button 
                                onClick={() => {
                                  handleToggleStatus(selectedUser.id, selectedUser.status);
                                  setSelectedUser({ ...selectedUser, status: selectedUser.status === 'suspended' ? 'active' : 'suspended' });
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${selectedUser.status === 'suspended' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                              >
                                {selectedUser.status === 'suspended' ? <UserCheck size={14} /> : <UserX size={14} />}
                                {selectedUser.status === 'suspended' ? 'Reinstate User' : 'Suspend User'}
                              </button>
                              
                              <button 
                                onClick={() => {
                                  handleResetPassword(selectedUser.id);
                                }}
                                className="px-4 py-2 bg-[#23252b] hover:bg-white/10 border border-[#2a2d36] rounded-xl text-xs font-bold text-gray-300 transition-colors flex items-center gap-2"
                              >
                                <KeyRound size={14} /> Force Password Reset
                              </button>
                              
                              <button 
                                onClick={() => {
                                  setImpersonateModal({ isOpen: true, userId: selectedUser.id });
                                  setSelectedUser(null);
                                }}
                                className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl text-xs font-bold text-indigo-400 transition-colors flex items-center gap-2"
                              >
                                <Eye size={14} /> Impersonate
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic">You cannot perform administrative actions on yourself.</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <h2 className="text-2xl font-extrabold">System Audit Logs</h2>
              <div className="flex flex-col gap-3">
                {auditLogs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 border border-dashed border-[#2a2d36] rounded-2xl">
                    No logs found.
                  </div>
                ) : (
                  auditLogs.map(log => {
                    const actor = users.find(u => u.id === log.actorId);
                    return (
                      <div key={log.id} className="p-4 bg-[#141618] border border-[#2a2d36] rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#23252b] relative overflow-hidden shrink-0">
                            {actor && <Image src={actor.avatar} alt={actor.name} fill className="object-cover" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white"><span className="text-indigo-400">{actor?.name || 'Unknown'}</span> performed action</span>
                            <span className="text-xs text-gray-400">{log.action}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono bg-black/50 px-3 py-1 rounded-full w-fit">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}


          {activeTab === 'health' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <h2 className="text-2xl font-extrabold">System Health</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#141618] border border-white/5 p-6 rounded-2xl flex flex-col gap-2">
                  <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Database Status</span>
                  <span className="text-2xl font-black text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 size={24} /> Connected (MongoDB Atlas)
                  </span>
                </div>
                <div className="bg-[#141618] border border-white/5 p-6 rounded-2xl flex flex-col gap-2">
                  <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Server Latency</span>
                  <span className="text-2xl font-black text-white">42ms</span>
                </div>
                <div className="bg-[#141618] border border-white/5 p-6 rounded-2xl flex flex-col gap-2 md:col-span-2">
                  <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Recent Background Syncs</span>
                  <div className="flex flex-col gap-1 mt-2 text-sm text-gray-300 font-mono">
                    <span>[SUCCESS] Sync from Store - 2 mins ago</span>
                    <span>[SUCCESS] Sync from Store - 5 mins ago</span>
                    <span>[SUCCESS] Auth Token Refreshed - 1 hour ago</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </main>
      </div>

      <AnimatePresence>
        {editingRoomId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditingRoomId(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-[#141618] border border-[#2a2d36] rounded-3xl w-full max-w-md overflow-hidden relative z-10 shadow-2xl p-8 flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-extrabold text-white">Edit Room</h2>
                <button onClick={() => setEditingRoomId(null)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Room Name</label>
                  <input type="text" value={editRoomData.name} onChange={e => setEditRoomData({...editRoomData, name: e.target.value})} className="w-full bg-[#1A1D20] border border-[#2a2d36] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Room Logo</label>
                  <div className="flex items-center gap-4">
                    {editRoomData.logoUrl ? (
                      <div className="relative w-16 h-16 rounded-xl border border-[#2a2d36] overflow-hidden bg-[#23252b] shrink-0">
                        <img src={editRoomData.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl border border-[#2a2d36] border-dashed bg-[#1A1D20] flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-gray-500">No Image</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditRoomData({...editRoomData, logoUrl: reader.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">University</label>
                  <input type="text" value={editRoomData.university} onChange={e => setEditRoomData({...editRoomData, university: e.target.value})} className="w-full bg-[#1A1D20] border border-[#2a2d36] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Faculty</label>
                  <input type="text" value={editRoomData.faculty} onChange={e => setEditRoomData({...editRoomData, faculty: e.target.value})} className="w-full bg-[#1A1D20] border border-[#2a2d36] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                </div>
              </div>

              <button 
                onClick={() => {
                  updateRoom(editingRoomId, {
                    name: editRoomData.name,
                    logoUrl: editRoomData.logoUrl,
                    university: editRoomData.university,
                    faculty: editRoomData.faculty
                  });
                  addAuditLog({ actorId: currentUser?.id || 'sys', action: `Updated room details`, targetId: editingRoomId });
                  setEditingRoomId(null);
                }}
                className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-colors mt-2"
              >
                Save Changes
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Impersonation Modal */}
      <AnimatePresence>
        {impersonateModal.isOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setImpersonateModal({ isOpen: false, userId: null })} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#141618] border border-[#2a2d36] p-8 rounded-3xl w-full max-w-md relative z-10 flex flex-col gap-6 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
                  <Eye size={20} /> Initiate Impersonation
                </h3>
                <button onClick={() => setImpersonateModal({ isOpen: false, userId: null })} className="p-2 bg-white/5 rounded-full"><X size={16}/></button>
              </div>
              <p className="text-sm text-gray-400">
                You are about to access the system as another user. Every action taken during this session will be strictly logged.
              </p>
              <form onSubmit={initiateImpersonation} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Reason for Impersonation</label>
                  <input 
                    type="text" 
                    value={impersonateReason}
                    onChange={e => setImpersonateReason(e.target.value)}
                    placeholder="e.g. Fixing inventory bug #402"
                    className="w-full bg-[#23252b] border border-[#2a2d36] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-colors mt-2">
                  Start Session
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
