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
  const users = useAppStore(state => state.users);
  
  const [selectedBorrowers, setSelectedBorrowers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    note: ''
  });

  const activeDebts = lentMoneys.filter(l => l.userId === currentUserId && !l.isPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !formData.amount || selectedBorrowers.length === 0) return;
    
    const totalAmount = Number(formData.amount);
    const splitAmount = totalAmount / selectedBorrowers.length;
    
    selectedBorrowers.forEach(borrower => {
      addLentMoney({
        userId: currentUserId,
        borrowerName: borrower,
        amount: splitAmount,
        date: formData.date,
        note: formData.note,
        isPaid: false
      });
    });
    
    // Deduct cash since you lent it out
    updateWalletBalance(currentUserId, -totalAmount);
    
    setFormData({
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      note: ''
    });
    setSelectedBorrowers([]);
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
              <Handshake className="w-5 h-5 text-indigo-400" /> Lend / Group Expense
            </h3>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Select Friends</label>
                <div className="flex flex-wrap gap-2">
                  {users.filter(u => u.id !== currentUserId).map(u => {
                    const isSelected = selectedBorrowers.includes(u.name);
                    return (
                      <button 
                        type="button"
                        key={u.id}
                        onClick={() => {
                          if (isSelected) setSelectedBorrowers(selectedBorrowers.filter(n => n !== u.name));
                          else setSelectedBorrowers([...selectedBorrowers, u.name]);
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${isSelected ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-black/40 text-gray-400 border-[#2a2d36] hover:bg-black/60'}`}
                      >
                        {u.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Total Amount (LKR)</label>
                <input 
                  type="number" 
                  min="1"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/40 text-white shadow-sm font-medium focus:border-indigo-500/50 focus:outline-none transition-colors"
                  required
                />
                {selectedBorrowers.length > 0 && formData.amount && (
                  <span className="text-xs text-indigo-400 font-medium mt-1">
                    Each selected friend will owe you: LKR {(Number(formData.amount) / selectedBorrowers.length).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                )}
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
              
              <button 
                type="submit" 
                disabled={selectedBorrowers.length === 0}
                className="mt-4 bg-indigo-500 text-white px-6 py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Group Expense
              </button>
            </form>

            <div className="border-t border-[#2a2d36] pt-6 mt-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                Friends Who Owe You
              </h4>
              
              {activeDebts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 bg-black/20 rounded-xl border border-white/5">
                  <Handshake className="w-8 h-8 text-white/10 mb-2" />
                  <p className="text-sm text-gray-500 text-center">No active debts found.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeDebts.map(debt => (
                    <div key={debt.id} className="flex items-center justify-between bg-[#121415] border border-[#2a2d36] p-4 rounded-2xl shadow-sm hover:border-indigo-500/30 transition-all group">
                      <div className="flex flex-col">
                        <p className="font-extrabold text-white text-[15px]">{debt.borrowerName}</p>
                        <p className="text-[11px] text-gray-500 font-medium">{format(new Date(debt.date), 'MMM dd, yyyy')} {debt.note && `• ${debt.note}`}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-bold text-indigo-400 text-sm">LKR {debt.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <button 
                          onClick={() => handleMarkPaid(debt.id, debt.amount)}
                          className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-black transition-colors"
                        >
                          <Check className="w-3 h-3" /> MARK PAID
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
