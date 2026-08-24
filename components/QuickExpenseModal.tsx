"use client";

import { useAppStore } from '@/store';
import { format } from 'date-fns';
import { useState } from 'react';
import { X, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXPENSE_CATEGORIES } from '@/lib/financeConstants';

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickExpenseModal({ isOpen, onClose }: QuickExpenseModalProps) {
  const currentUserId = useAppStore(state => state.currentUserId);
  const addTransaction = useAppStore(state => state.addTransaction);
  const updateWalletBalance = useAppStore(state => state.updateWalletBalance);
  
  const [formData, setFormData] = useState({
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    date: format(new Date(), 'yyyy-MM-dd'),
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !formData.amount) return;
    
    const amountNum = Number(formData.amount);
    
    addTransaction({
      userId: currentUserId,
      type: 'expense',
      amount: amountNum,
      category: formData.category,
      date: formData.date,
      note: formData.note,
      isFixed: false
    });
    
    updateWalletBalance(currentUserId, -amountNum);
    
    setFormData({
      amount: '',
      category: EXPENSE_CATEGORIES[0],
      date: format(new Date(), 'yyyy-MM-dd'),
      note: ''
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-gray-900/95 border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="font-extrabold text-xl text-white mb-6 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-400" /> Log Expense
            </h3>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Amount (LKR)</label>
                <input 
                  type="number" 
                  min="1"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/40 text-white shadow-sm font-medium focus:border-rose-500/50 focus:outline-none transition-colors"
                  required
                  autoFocus
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/40 text-white shadow-sm font-medium focus:border-rose-500/50 focus:outline-none transition-colors appearance-none"
                  required
                >
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/40 text-white shadow-sm font-medium focus:border-rose-500/50 focus:outline-none transition-colors [color-scheme:dark]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Short Note</label>
                  <input 
                    type="text" 
                    placeholder="Optional"
                    value={formData.note}
                    onChange={e => setFormData({...formData, note: e.target.value})}
                    className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/40 text-white shadow-sm font-medium focus:border-rose-500/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              
              <button type="submit" className="mt-4 bg-rose-500 text-white px-6 py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:bg-rose-400 transition-colors">
                Log Expense
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
