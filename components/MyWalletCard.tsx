"use client";

import { useState } from 'react';
import { useAppStore } from '../store';
import { Wallet, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MyWalletCard() {
  const currentUserId = useAppStore(state => state.currentUserId);
  const walletBalances = useAppStore(state => state.walletBalances);
  const updateWalletBalance = useAppStore(state => state.updateWalletBalance);
  
  const balance = walletBalances[currentUserId] || 0;
  const [isUpdating, setIsUpdating] = useState(false);
  const [amount, setAmount] = useState('');

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !amount || isNaN(Number(amount))) return;
    
    updateWalletBalance(currentUserId, Number(amount));
    setIsUpdating(false);
    setAmount('');
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg shadow-black/20 rounded-xl p-6 lg:p-8 relative overflow-hidden h-fit">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-[4rem] pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Wallet className="w-7 h-7 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wider mb-1">My Wallet Balance</h3>
            <span className="font-extrabold text-4xl text-white tracking-tight">LKR {balance.toLocaleString()}</span>
          </div>
        </div>

        <button 
          onClick={() => setIsUpdating(true)}
          className="bg-white/5 border border-white/10 hover:bg-white/10 transition-colors px-5 py-3 rounded-xl flex items-center gap-2 font-bold text-sm text-gray-200"
        >
          <Plus className="w-4 h-4" /> Adjust Balance
        </button>
      </div>

      <AnimatePresence>
        {isUpdating && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden relative z-10"
          >
            <div className="p-5 rounded-2xl bg-black/20 border border-white/5">
              <form onSubmit={handleUpdate} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold text-sm">LKR</span>
                  </div>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="Enter new wallet balance"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-14 pr-4 py-3 rounded-xl border border-[#2a2d36] bg-black/40 text-white shadow-sm font-medium focus:border-indigo-500/50 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:bg-indigo-400 transition-colors">
                    Save
                  </button>
                  <button type="button" onClick={() => setIsUpdating(false)} className="bg-white/5 text-gray-300 px-4 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors flex items-center justify-center">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
