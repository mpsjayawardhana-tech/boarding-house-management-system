"use client";

import { useAppStore } from '../store';
import { useMemo } from 'react';
import { calculateNetBalances } from '@/lib/financeUtils';
import { Wallet, Target, TrendingUp, TrendingDown, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';

export function NetWorthSummary() {
  const currentUserId = useAppStore(state => state.currentUserId);
  const walletBalances = useAppStore(state => state.walletBalances);
  const financialGoals = useAppStore(state => state.financialGoals);
  const personalDebts = useAppStore(state => state.personalDebts);
  const users = useAppStore(state => state.users);
  const p2pDebts = useAppStore(state => state.p2pDebts);
  const payments = useAppStore(state => state.payments);

  const stats = useMemo(() => {
    if (!currentUserId) return { netWorth: 0, wallet: 0, saved: 0, debt: 0, p2p: 0 };

    const wallet = walletBalances[currentUserId] || 0;
    
    const saved = financialGoals
      .filter(g => g.userId === currentUserId)
      .reduce((sum, g) => sum + g.currentSaved, 0);
      
    const personalDebtTotal = personalDebts
      .filter(d => d.userId === currentUserId)
      .reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);

    const p2pBalances = calculateNetBalances(users, currentUserId, p2pDebts, payments);
    const p2pDebtOwedByMe = Object.values(p2pBalances).reduce((sum, bal) => bal < 0 ? sum + Math.abs(bal) : sum, 0);
    const p2pDebtOwedToMe = Object.values(p2pBalances).reduce((sum, bal) => bal > 0 ? sum + bal : sum, 0);
    
    const totalDebt = personalDebtTotal + p2pDebtOwedByMe;
    const totalAssets = wallet + saved + p2pDebtOwedToMe;
    
    const netWorth = totalAssets - totalDebt;

    return {
      netWorth,
      wallet,
      saved,
      debt: totalDebt,
      p2p: p2pDebtOwedToMe - p2pDebtOwedByMe
    };
  }, [currentUserId, walletBalances, financialGoals, personalDebts, users, p2pDebts, payments]);

  if (!currentUserId) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full shrink-0 bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-3xl p-4 lg:p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 blur-[3rem] pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between relative z-10">
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30 shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Landmark className="w-7 h-7 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Net Worth</h2>
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-extrabold tracking-tight ${stats.netWorth >= 0 ? 'text-white' : 'text-rose-400'}`}>
                LKR {stats.netWorth.toLocaleString()}
              </span>
              {stats.netWorth >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-400 mb-1.5" />
              ) : (
                <TrendingDown className="w-5 h-5 text-rose-400 mb-1.5" />
              )}
            </div>
          </div>
        </div>

        <div className="hidden md:block w-px h-12 bg-white/10"></div>

        <div className="grid grid-cols-2 gap-4 w-full mt-4 md:mt-0 lg:flex lg:flex-wrap lg:gap-6 lg:flex-1 lg:justify-end">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5 whitespace-nowrap"><Wallet className="w-3.5 h-3.5 text-blue-400" /> Wallet</span>
            <span className="text-lg font-bold text-white mt-0.5 whitespace-nowrap">LKR {stats.wallet.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5 whitespace-nowrap"><Target className="w-3.5 h-3.5 text-emerald-400" /> Saved</span>
            <span className="text-lg font-bold text-emerald-400 mt-0.5 whitespace-nowrap">LKR {stats.saved.toLocaleString()}</span>
          </div>
          <div className="flex flex-col col-span-2 lg:col-span-1">
            <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5 whitespace-nowrap"><TrendingDown className="w-3.5 h-3.5 text-rose-400" /> Debt</span>
            <span className="text-lg font-bold text-rose-400 mt-0.5 whitespace-nowrap">LKR {stats.debt.toLocaleString()}</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
