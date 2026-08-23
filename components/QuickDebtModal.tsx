"use client";

import { useAppStore } from '@/store';
import { format } from 'date-fns';
import { useState } from 'react';
import { X, Handshake, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickDebtModal({ isOpen, onClose }: QuickDebtModalProps) {
  const currentUserId = useAppStore(state => state.currentUserId);
  const lentMoneys = useAppStore(state => state.lentMoneys);
  const addLentMoney = useAppStore(state => state.addLentMoney);
  const markLentMoneyPaid = useAppStore(state => state.markLentMoneyPaid);
  const updateWalletBalance = useAppStore(state => state.updateWalletBalance);
  
  const [formData, setFormData] = useState({
    borrowerName: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    note: ''
  });

  const activeDebts = lentMoneys.filter(l => l.userId === currentUserId && !l.isPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !formData.amount || !formData.borrowerName) return;
    
    const amountNum = Number(formData.amount);
    
    addLentMoney({
      userId: currentUserId,
      borrowerName: formData.borrowerName,
      amount: amountNum,
      date: formData.date,
      note: formData.note,
      isPaid: false
    });
    
    // Deduct cash since you lent it out
    updateWalletBalance(currentUserId, -amountNum);
    
    setFormData({
      borrowerName: '',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      note: ''
    });
  };

  const handleMarkPaid = (id: string, amount: number) => {
    markLentMoneyPaid(id);
    // Add cash back to wallet since it was paid back
    updateWalletBalance(currentUserId, amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-gray-900/90 backdrop-blur-2xl shadow-2xl rounded-[32px] p-6 md:p-8 border border-white/10 max-w-md w-full relative max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="font-extrabold text-xl text-white mb-6 flex items-center gap-2">
              <Handshake className="w-5 h-5 text-indigo-400" /> Lend Money
            </h3>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Friend's Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Kasun"
                  value={formData.borrowerName}
                  onChange={e => setFormData({...formData, borrowerName: e.target.value})}
                  className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/40 text-white shadow-sm font-medium focus:border-indigo-500/50 focus:outline-none transition-colors"
                  required
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Amount (LKR)</label>
                <input 
                  type="number" 
                  min="1"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/40 text-white shadow-sm font-medium focus:border-indigo-500/50 focus:outline-none transition-colors"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/40 text-white shadow-sm font-medium focus:border-indigo-500/50 focus:outline-none transition-colors [color-scheme:dark]"
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
                    className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/40 text-white shadow-sm font-medium focus:border-indigo-500/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              
              <button type="submit" className="mt-4 bg-indigo-500 text-white px-6 py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:bg-indigo-400 transition-colors">
                Add Debt Record
              </button>
            </form>

            <div className="border-t border-[#2a2d36] pt-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Friends Who Owe You</h4>
              
              {activeDebts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4 bg-black/20 rounded-xl border border-white/5">No active debts found.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeDebts.map(debt => (
                    <div key={debt.id} className="flex items-center justify-between bg-black/40 border border-white/5 p-3 rounded-xl">
                      <div>
                        <p className="font-bold text-white text-sm">{debt.borrowerName}</p>
                        <p className="text-xs text-gray-500">{format(new Date(debt.date), 'MMM dd, yyyy')} {debt.note && `• ${debt.note}`}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-indigo-400 text-sm">LKR {debt.amount.toLocaleString()}</span>
                        <button 
                          onClick={() => handleMarkPaid(debt.id, debt.amount)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors"
                          title="Mark as Paid"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
