"use client";

import { useAppStore } from '@/store';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { TrendingDown } from 'lucide-react';

export function DailyExpenseWidget() {
  const currentUserId = useAppStore(state => state.currentUserId);
  const transactions = useAppStore(state => state.transactions);

  const todaysTotal = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return transactions
      .filter(t => t.userId === currentUserId && t.type === 'expense' && t.date === todayStr)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentUserId]);

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg shadow-black/20 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden group hover:border-white/10 transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-[2rem] pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
      
      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
        <TrendingDown className="w-5 h-5 text-red-400" />
      </div>
      <div className="flex flex-col z-10">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-0.5">Today&apos;s Expenses</h3>
        <span className="font-extrabold text-xl text-white tracking-tight">LKR {todaysTotal.toLocaleString()}</span>
      </div>
    </div>
  );
}
