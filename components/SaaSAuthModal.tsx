"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Key, User, Building2, Search, ArrowRight, ArrowLeft, Building, MapPin, Image as ImageIcon, Loader2 } from "lucide-react";
import { useAppStore, Room } from "@/store";

export function SaaSAuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { users, rooms, addRoom, addUser, setCurrentUserId } = useAppStore();
  
  const [mode, setMode] = useState<'login' | 'choice' | 'create' | 'join'>('login');
  
  // Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Common Signup State
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  // Create Room State
  const [roomName, setRoomName] = useState('');
  const [university, setUniversity] = useState('');
  const [faculty, setFaculty] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  // Join Room State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username?.toLowerCase() === loginUsername.toLowerCase());
    
    if (!user || user.password !== loginPassword) {
      setLoginError("Invalid username or password");
      return;
    }
    
    if (user.status === 'pending_approval') {
      setLoginError("Your account is pending admin approval.");
      return;
    }
    
    setCurrentUserId(user.id);
    onClose();
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupUsername || !signupPassword || !roomName) {
      setLoginError("Please fill all required fields");
      return;
    }

    const roomId = `room_${Date.now()}`;
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    addRoom({
      name: roomName,
      inviteCode,
      university,
      faculty,
      logoUrl
    });
    
    const userId = Date.now().toString();
    addUser({
      name: signupUsername,
      username: signupUsername,
      password: signupPassword,
      role: 'admin',
      status: 'active',
      roomId,
      avatar: `https://api.dicebear.com/8.x/notionists/svg?seed=${signupUsername}`,
      isActive: true,
      dashboardLayout: ['overview', 'monthly', 'timetable', 'duties', 'financial', 'inventory', 'feeTracker', 'heatmap']
    });
    
    setCurrentUserId(userId);
    onClose();
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupUsername || !signupPassword || !selectedRoomId) {
      setLoginError("Please fill all required fields and select a room");
      return;
    }

    addUser({
      name: signupUsername,
      username: signupUsername,
      password: signupPassword,
      role: 'member',
      status: 'pending_approval',
      roomId: selectedRoomId,
      avatar: `https://api.dicebear.com/8.x/notionists/svg?seed=${signupUsername}`,
      isActive: true,
      dashboardLayout: ['overview', 'monthly', 'timetable', 'duties', 'financial', 'inventory', 'feeTracker', 'heatmap']
    });
    
    setSuccessMsg("Join request sent! Please wait for the Room Admin to approve your account.");
    setTimeout(() => {
      setMode('login');
      setSuccessMsg('');
    }, 4000);
  };

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.inviteCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#141618] border border-[#2a2d36] rounded-3xl w-full max-w-md overflow-hidden relative z-10 shadow-2xl"
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors z-20">
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">
          {mode === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-8 flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Welcome back</h2>
                <p className="text-sm text-gray-400">Sign in to your Bodima account</p>
              </div>

              {successMsg && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-medium">{successMsg}</div>}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} required className="w-full bg-[#1A1D20] border border-[#2a2d36] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="w-full bg-[#1A1D20] border border-[#2a2d36] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                  </div>
                </div>
                
                {loginError && <p className="text-red-400 text-xs font-medium">{loginError}</p>}
                
                <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-colors mt-2 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  Sign In
                </button>
              </form>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex-1 h-px bg-[#2a2d36]"></div>
                <span>OR</span>
                <div className="flex-1 h-px bg-[#2a2d36]"></div>
              </div>

              <button onClick={() => { setMode('choice'); setLoginError(''); }} className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors">
                Create an Account
              </button>
            </motion.div>
          )}

          {mode === 'choice' && (
            <motion.div key="choice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 flex flex-col gap-6">
              <div>
                <button onClick={() => setMode('login')} className="text-gray-500 hover:text-white transition-colors mb-4 flex items-center gap-1 text-sm font-medium"><ArrowLeft size={16} /> Back to Login</button>
                <h2 className="text-2xl font-extrabold text-white">Join the Platform</h2>
                <p className="text-sm text-gray-400">Choose how you want to get started</p>
              </div>

              <div className="flex flex-col gap-4">
                <button onClick={() => setMode('create')} className="p-4 border border-[#2a2d36] hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-2xl flex items-start gap-4 transition-all text-left group">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">Create a New Room</h3>
                    <p className="text-xs text-gray-400 mt-1">Start a brand new tenant for your boarding house or university group.</p>
                  </div>
                </button>

                <button onClick={() => setMode('join')} className="p-4 border border-[#2a2d36] hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-2xl flex items-start gap-4 transition-all text-left group">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">Join Existing Room</h3>
                    <p className="text-xs text-gray-400 mt-1">Search for your existing group and send a join request to the admin.</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
              <div>
                <button onClick={() => setMode('choice')} className="text-gray-500 hover:text-white transition-colors mb-4 flex items-center gap-1 text-sm font-medium"><ArrowLeft size={16} /> Back</button>
                <h2 className="text-2xl font-extrabold text-white">Create New Room</h2>
                <p className="text-sm text-gray-400">Set up your admin credentials and room details.</p>
              </div>

              <form onSubmit={handleCreateRoom} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Admin Username</label>
                    <input type="text" value={signupUsername} onChange={e => setSignupUsername(e.target.value)} required className="w-full bg-[#1A1D20] border border-[#2a2d36] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Admin Password</label>
                    <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required className="w-full bg-[#1A1D20] border border-[#2a2d36] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Room Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input type="text" placeholder="e.g. Wayamba Tech Boarding" value={roomName} onChange={e => setRoomName(e.target.value)} required className="w-full bg-[#1A1D20] border border-[#2a2d36] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">University (Optional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input type="text" value={university} onChange={e => setUniversity(e.target.value)} className="w-full bg-[#1A1D20] border border-[#2a2d36] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Logo URL (Optional)</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input type="url" placeholder="https://..." value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="w-full bg-[#1A1D20] border border-[#2a2d36] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                  </div>
                </div>

                {loginError && <p className="text-red-400 text-xs font-medium">{loginError}</p>}
                
                <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-colors mt-4">
                  Create Room
                </button>
              </form>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div key="join" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
              <div>
                <button onClick={() => setMode('choice')} className="text-gray-500 hover:text-white transition-colors mb-4 flex items-center gap-1 text-sm font-medium"><ArrowLeft size={16} /> Back</button>
                <h2 className="text-2xl font-extrabold text-white">Join Existing Room</h2>
                <p className="text-sm text-gray-400">Search for your room and send a request.</p>
              </div>

              <form onSubmit={handleJoinRoom} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Username</label>
                    <input type="text" value={signupUsername} onChange={e => setSignupUsername(e.target.value)} required className="w-full bg-[#1A1D20] border border-[#2a2d36] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
                    <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required className="w-full bg-[#1A1D20] border border-[#2a2d36] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Search Room</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input type="text" placeholder="Name or Invite Code" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#1A1D20] border border-[#2a2d36] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto rounded-xl border border-[#2a2d36] p-2 bg-black/20">
                  {filteredRooms.length === 0 ? (
                    <div className="text-center p-4 text-xs text-gray-500">No rooms found.</div>
                  ) : (
                    filteredRooms.map(room => (
                      <button 
                        key={room.id}
                        type="button"
                        onClick={() => setSelectedRoomId(room.id)}
                        className={`flex justify-between items-center p-2 rounded-lg text-sm text-left transition-colors ${selectedRoomId === room.id ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400' : 'hover:bg-white/5 text-white'}`}
                      >
                        <span className="font-bold truncate max-w-[150px]">{room.name}</span>
                        <span className="text-xs font-mono text-gray-500">{room.inviteCode}</span>
                      </button>
                    ))
                  )}
                </div>

                {loginError && <p className="text-red-400 text-xs font-medium">{loginError}</p>}
                
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-colors mt-2">
                  Send Join Request
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
