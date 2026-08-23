"use client";

import { useState } from 'react';
import { useAppStore } from '../store';
import { CreditCard, Plus, CheckCircle2, Trash2, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export function DebtManager() {
  const currentUserId = useAppStore(state => state.currentUserId);
  const debts = useAppStore(state => state.personalDebts);
  const addDebt = useAppStore(state => state.addPersonalDebt);
  const updateDebt = useAppStore(state => state.updatePersonalDebt);
  const deleteDebt = useAppStore(state => state.deletePersonalDebt);
  const addTransaction = useAppStore(state => state.addTransaction);
  const updateWalletBalance = useAppStore(state => state.updateWalletBalance);
  const walletBalances = useAppStore(state => state.walletBalances);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ lenderName: '', totalAmount: '', interestRate: '' });

  const userDebts = debts.filter(d => d.userId === currentUserId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !formData.lenderName || !formData.totalAmount || isNaN(Number(formData.totalAmount))) return;
    
    if (editingId) {
      updateDebt(editingId, {
        lenderName: formData.lenderName,
        totalAmount: Number(formData.totalAmount),
        interestRate: formData.interestRate ? Number(formData.interestRate) : undefined
      });
      setEditingId(null);
    } else {
      addDebt({
        userId: currentUserId,
        lenderName: formData.lenderName,
        totalAmount: Number(formData.totalAmount),
        paidAmount: 0,
        interestRate: formData.interestRate ? Number(formData.interestRate) : undefined
      });
    }
    
    setIsAdding(false);
    setFormData({ lenderName: '', totalAmount: '', interestRate: '' });
  };

  const cancelAddOrEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ lenderName: '', totalAmount: '', interestRate: '' });
  };

  const handlePayment = (debtId: string) => {
    const amountStr = payAmount[debtId];
    if (!amountStr || isNaN(Number(amountStr)) || !currentUserId) return;
    
    const amount = Number(amountStr);
    const debt = userDebts.find(d => d.id === debtId);
    if (!debt) return;

    // Deduct from wallet
    const currentBalance = walletBalances[currentUserId] || 0;
    updateWalletBalance(currentUserId, currentBalance - amount);

    // Log as transaction
    addTransaction({
      userId: currentUserId,
      type: 'expense',
      isFixed: false,
      amount,
      category: 'Debt Repayment',
      date: format(new Date(), 'yyyy-MM-dd'),
      note: `Payment for ${debt.lenderName}`
    });

    // Update debt
    updateDebt(debtId, { paidAmount: debt.paidAmount + amount });
    
    // Clear input
    setPayAmount({ ...payAmount, [debtId]: '' });
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg shadow-black/20 rounded-xl p-6 lg:p-8 relative overflow-hidden h-fit flex flex-col">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[4rem] pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-400" /> Debts & Cards
        </h3>
        <button 
          onClick={() => {
            if (isAdding) {
              cancelAddOrEdit();
            } else {
              setIsAdding(true);
            }
          }}
          className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {isAdding ? 'Cancel' : 'Add Debt'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 relative z-10"
          >
            <form onSubmit={handleSave} className="flex flex-col gap-3 bg-black/20 p-4 rounded-2xl border border-white/5">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Lender / Bank Name</label>
                <input 
                  type="text"
                  value={formData.lenderName}
                  onChange={e => setFormData({...formData, lenderName: e.target.value})}
                  className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-indigo-500/50 focus:outline-none transition-colors"
                  required
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Total Amount (LKR)</label>
                  <input 
                    type="number"
                    min="0"
                    value={formData.totalAmount}
                    onChange={e => setFormData({...formData, totalAmount: e.target.value})}
                    className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-indigo-500/50 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Interest % (Opt)</label>
                  <input 
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.interestRate}
                    onChange={e => setFormData({...formData, interestRate: e.target.value})}
                    className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-indigo-500/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={cancelAddOrEdit} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-400 transition-colors">{editingId ? 'Update Debt' : 'Save Debt'}</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4 relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[350px]">
        {userDebts.length === 0 && !isAdding && (
          <p className="text-sm text-gray-400 text-center py-4 bg-black/20 rounded-xl border border-dashed border-[#2a2d36] mt-4">No debts or credit cards added.</p>
        )}
        
        {userDebts.map(debt => {
          const percentage = Math.min((debt.paidAmount / debt.totalAmount) * 100, 100);
          const remaining = debt.totalAmount - debt.paidAmount;
          const isSettled = remaining <= 0;

          return (
            <div key={debt.id} className={`flex flex-col gap-3 p-4 rounded-2xl border ${isSettled ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-black/20 border-[#2a2d36] hover:bg-white/5 transition-all'} group`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    {debt.lenderName}
                    {debt.interestRate ? <span className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded font-normal">{debt.interestRate}% APR</span> : null}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">Remaining: <span className="font-semibold text-white">LKR {remaining.toLocaleString()}</span></p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className="text-xs font-bold text-gray-400 block mb-1">Total: LKR {debt.totalAmount.toLocaleString()}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => {
                      setEditingId(debt.id);
                      setFormData({ lenderName: debt.lenderName, totalAmount: debt.totalAmount.toString(), interestRate: debt.interestRate?.toString() || '' });
                      setIsAdding(true);
                    }} className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteDebt(debt.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-1.5 w-full bg-[#23252b] rounded-full overflow-hidden mt-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full ${isSettled ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                />
              </div>

              {!isSettled && (
                <div className="flex gap-2 mt-2">
                  <input 
                    type="number"
                    placeholder="Payment Amount"
                    value={payAmount[debt.id] || ''}
                    onChange={e => setPayAmount({...payAmount, [debt.id]: e.target.value})}
                    className="flex-1 p-2 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium text-xs focus:border-emerald-500/50 focus:outline-none transition-colors"
                  />
                  <button 
                    onClick={() => handlePayment(debt.id)}
                    className="bg-emerald-500/10 text-emerald-400 px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-black transition-colors flex items-center gap-1 shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pay
                  </button>
                </div>
              )}
              {isSettled && (
                <div className="mt-1 text-center py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Fully Paid Off
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
