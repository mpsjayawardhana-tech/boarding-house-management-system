"use client";

import { useAppStore } from "@/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

export default function AdminPage() {
  const { authenticateAdmin, users, setCurrentUserId } = useAppStore();
  const router = useRouter();
  
  const [loginUsername, setLoginUsername] = useState('Manusha');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticateAdmin(loginUsername, loginPassword)) {
      setLoginError('');
      // Force switch to the admin user in the store dropdown
      const adminUser = users.find(u => u.username === loginUsername && u.role === 'admin');
      if (adminUser) {
        setCurrentUserId(adminUser.id);
      }
      router.push('/settings');
    } else {
      setLoginError('Access Denied: Invalid credentials');
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4 bg-[#090A0C]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="bg-[#141618]/90 backdrop-blur-2xl border border-white/[0.08] shadow-2xl p-8 rounded-3xl w-full max-w-sm flex flex-col gap-6 relative overflow-hidden z-10"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-extrabold text-white">Admin Portal</h2>
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
        </form>
      </motion.div>
    </div>
  );
}
