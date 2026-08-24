"use client";

import { useState } from 'react';
import { useAppStore } from '@/store';
import { format } from 'date-fns';
import { Wallet, TrendingDown, TrendingUp, Handshake } from 'lucide-react';
import { QuickExpenseModal } from './QuickExpenseModal';
import { QuickIncomeModal } from './QuickIncomeModal';
import { QuickDebtModal } from './QuickDebtModal';

const CATEGORIES = ["Food & Dining", "Transportation", "Academic", "Entertainment", "Shopping", "Other"];

export function DashboardFinanceHero() {
  const currentUserId = useAppStore(state => state.currentUserId);
  const addTransaction = useAppStore(state => state.addTransaction);
  const updateWalletBalance = useAppStore(state => state.updateWalletBalance);
  
  const [activeModal, setActiveModal] = useState<'expense' | 'income' | 'lend' | null>(null);
  
  const closeModal = () => setActiveModal(null);

  return (
    <div className="bg-[#0B0C0E] border-b md:border border-white/[0.08] rounded-b-[2.5rem] md:rounded-[32px] p-6 lg:p-8 shadow-2xl relative overflow-hidden flex flex-col h-fit w-full z-20">
      
      {/* Header */}
      <div className="mb-6 relative z-10">
        <h3 className="text-xs uppercase tracking-widest font-extrabold text-white flex items-center gap-2">
          <Wallet className="w-4 h-4 text-gray-400" /> Quick Actions
        </h3>
      </div>

      {/* Quick Action Buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full">
        
        {/* Expense Button */}
        <button 
          onClick={() => setActiveModal('expense')}
          className="flex-1 flex items-center justify-center gap-3 bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 text-gray-300 hover:text-rose-400 transition-all duration-300 py-4 px-4 rounded-2xl font-bold text-sm group"
        >
          <div className="p-2 rounded-xl bg-white/5 group-hover:bg-rose-500/20 transition-colors">
            <TrendingDown className="w-4 h-4" />
          </div>
          Log Expense
        </button>

        {/* Income Button */}
        <button 
          onClick={() => setActiveModal('income')}
          className="flex-1 flex items-center justify-center gap-3 bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 text-gray-300 hover:text-emerald-400 transition-all duration-300 py-4 px-4 rounded-2xl font-bold text-sm group"
        >
          <div className="p-2 rounded-xl bg-white/5 group-hover:bg-emerald-500/20 transition-colors">
            <TrendingUp className="w-4 h-4" />
          </div>
          Add Income
        </button>

        {/* Lend Money Button */}
        <button 
          onClick={() => setActiveModal('lend')}
          className="flex-1 flex items-center justify-center gap-3 bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 text-gray-300 hover:text-indigo-400 transition-all duration-300 py-4 px-4 rounded-2xl font-bold text-sm group"
        >
          <div className="p-2 rounded-xl bg-white/5 group-hover:bg-indigo-500/20 transition-colors">
            <Handshake className="w-4 h-4" />
          </div>
          Lend Money
        </button>
      </div>

      <QuickExpenseModal isOpen={activeModal === 'expense'} onClose={closeModal} />
      <QuickIncomeModal isOpen={activeModal === 'income'} onClose={closeModal} />
      <QuickDebtModal isOpen={activeModal === 'lend'} onClose={closeModal} />
    </div>
  );
}
