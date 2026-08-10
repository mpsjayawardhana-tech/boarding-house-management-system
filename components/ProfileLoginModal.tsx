"use client";

import { useAppStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { X, Lock, ArrowRight } from "lucide-react";

export function ProfileLoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { users, setCurrentUserId, authenticateAdmin } = useAppStore();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setPassword('');
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.id === selectedUserId);
    if (!user) return;

    if (user.role === 'admin' || user.role === 'super_admin') {
      if (authenticateAdmin(user.username || '', password)) {
        setCurrentUserId(user.id);
        onClose();
      } else {
        setError("Invalid admin password");
      }
    } else {
      // Standard member login
      if (password.trim() === (user.password || 'abc123')) {
        setCurrentUserId(user.id);
        onClose();
      } else {
        setError("Invalid password");
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#141618]/90 backdrop-blur-2xl border border-white/[0.08] shadow-2xl p-6 md:p-8 rounded-3xl w-full max-w-2xl flex flex-col gap-6 relative overflow-hidden z-10"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Select Profile</h2>
                <p className="text-sm text-gray-400">Choose your account to continue</p>
              </div>
              <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="relative z-10">
              <AnimatePresence mode="wait">
                {!selectedUserId ? (
                  <motion.div 
                    key="profiles"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4"
                  >
                    {users.filter(u => u.role !== 'super_admin').map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleUserSelect(user.id)}
                        className="group flex flex-col items-center gap-3 cursor-pointer focus:outline-none"
                      >
                        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border border-white/10 group-hover:border-emerald-400 transition-all duration-300 transform group-hover:scale-105 shadow-xl bg-[#1A1D20]">
                          <Image 
                            src={user.avatar} 
                            alt={user.name} 
                            fill 
                            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
                          />
                          {!user.isActive && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-[8px] uppercase font-bold text-white/50 tracking-widest bg-black/40 px-2 py-1 rounded-full">Inactive</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-center gap-0.5 text-center">
                          <span className="text-white/70 group-hover:text-white font-bold text-xs md:text-sm transition-colors duration-300">
                            {user.name}
                          </span>
                          {user.role === 'admin' && (
                            <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-emerald-400">
                              <Lock size={8} /> Admin
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="password"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col items-center gap-6 py-4"
                  >
                    {(() => {
                      const admin = users.find(u => u.id === selectedUserId);
                      return (
                        <>
                          <div className="flex flex-col items-center gap-2">
                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-emerald-400/50 shadow-xl bg-[#1A1D20]">
                              <Image src={admin?.avatar || ''} alt={admin?.name || ''} fill className="object-cover" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Welcome, {admin?.name}</h3>
                          </div>
                          
                          <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                {admin?.role === 'admin' ? 'Admin Password' : 'Login Password'}
                              </label>
                              <input 
                                type="password" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="bg-[#23252b] border border-[#2a2d36] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                                required
                              />
                              {error && <p className="text-red-400 text-xs font-medium mt-1">{error}</p>}
                            </div>
                            
                            <div className="flex gap-3">
                              <button 
                                type="button" 
                                onClick={() => setSelectedUserId(null)}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                              >
                                Back
                              </button>
                              <button 
                                type="submit" 
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.15)] text-sm"
                              >
                                Enter <ArrowRight size={16} />
                              </button>
                            </div>
                          </form>
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
