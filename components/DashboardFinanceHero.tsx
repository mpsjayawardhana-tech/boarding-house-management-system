"use client";

import { useState } from 'react';
import { useAppStore } from '@/store';
import { format } from 'date-fns';
import { Wallet, TrendingDown, TrendingUp, Handshake } from 'lucide-react';
import { QuickExpenseModal } from './QuickExpenseModal';
import { QuickIncomeModal } from './QuickIncomeModal';
import { QuickDebtModal } from './QuickDebtModal';
import { Portal } from './Portal';

export function DashboardFinanceHero() {
  const currentUserId = useAppStore(state => state.currentUserId);
  const users = useAppStore(state => state.users);
  const currentUser = users.find(u => u.id === currentUserId);
  const [activeModal, setActiveModal] = useState<'expense' | 'income' | 'lend' | null>(null);

  if (!currentUser) return null;

  return (
    <div className="relative w-full rounded-none md:rounded-3xl overflow-hidden bg-[#0F1113] border-0 md:border border-white/5 p-6 md:p-8 mt-2 md:mt-4 shadow-2xl z-0">
      
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-transparent rounded-full blur-[4rem] -translate-y-1/2 translate-x-1/3 pointer-events-none z-0"></div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            Finance Hub
          </h2>
          <p className="text-sm text-gray-400 mt-1 font-medium">Quick actions and overview of your wallet.</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          
          {/* Expense Button */}
          <button 
            onClick={() => setActiveModal('expense')}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 text-gray-300 hover:text-rose-400 transition-all duration-300 py-3 px-5 rounded-2xl font-bold text-sm group"
          >
            <div className="p-1.5 rounded-xl bg-white/5 group-hover:bg-rose-500/20 transition-colors">
              <TrendingDown className="w-4 h-4" />
            </div>
            Log Expense
          </button>

          {/* Income Button */}
          <button 
            onClick={() => setActiveModal('income')}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 text-gray-300 hover:text-emerald-400 transition-all duration-300 py-3 px-5 rounded-2xl font-bold text-sm group"
          >
            <div className="p-1.5 rounded-xl bg-white/5 group-hover:bg-emerald-500/20 transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
            Add Income
          </button>

          {/* Lend Money Button */}
          <button 
            onClick={() => setActiveModal('lend')}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 text-gray-300 hover:text-indigo-400 transition-all duration-300 py-3 px-5 rounded-2xl font-bold text-sm group"
          >
            <div className="p-1.5 rounded-xl bg-white/5 group-hover:bg-indigo-500/20 transition-colors">
              <Handshake className="w-4 h-4" />
            </div>
            Lend
          </button>
        </div>
      </div>

      {/* Modals */}
      <Portal>
        {activeModal === 'expense' && <QuickExpenseModal isOpen={true} onClose={() => setActiveModal(null)} />}
        {activeModal === 'income' && <QuickIncomeModal isOpen={true} onClose={() => setActiveModal(null)} />}
        {activeModal === 'lend' && <QuickDebtModal isOpen={true} onClose={() => setActiveModal(null)} />}
      </Portal>
    </div>
  );
}
