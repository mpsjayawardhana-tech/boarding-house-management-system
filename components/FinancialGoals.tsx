"use client";

import { useState } from 'react';
import { useAppStore } from '../store';
import { Target, Plus, CheckCircle2, TrendingUp, X, Banknote, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FinancialGoals() {
  const currentUserId = useAppStore(state => state.currentUserId);
  const goals = useAppStore(state => state.financialGoals);
  const addGoal = useAppStore(state => state.addFinancialGoal);
  const updateGoal = useAppStore(state => state.updateFinancialGoal);
  const deleteGoal = useAppStore(state => state.deleteFinancialGoal);
  const updateWalletBalance = useAppStore(state => state.updateWalletBalance);
  const walletBalances = useAppStore(state => state.walletBalances);

  const [isAdding, setIsAdding] = useState(false);
  const [addFundsId, setAddFundsId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState<string>('');
  const [formData, setFormData] = useState({ title: '', targetAmount: '', type: 'Short-term' });

  const userGoals = goals.filter(g => g.userId === currentUserId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !formData.title || !formData.targetAmount || isNaN(Number(formData.targetAmount))) return;
    
    if (editingId) {
      updateGoal(editingId, {
        title: formData.title,
        targetAmount: Number(formData.targetAmount),
        type: formData.type as any
      });
      setEditingId(null);
    } else {
      addGoal({
        userId: currentUserId,
        title: formData.title,
        targetAmount: Number(formData.targetAmount),
        currentSaved: 0,
        type: formData.type as any
      });
    }
    
    setIsAdding(false);
    setFormData({ title: '', targetAmount: '', type: 'Short-term' });
  };

  const cancelAddOrEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ title: '', targetAmount: '', type: 'Short-term' });
  };

  const handleAddFunds = (goalId: string) => {
    const amount = Number(fundAmount);
    if (isNaN(amount) || amount <= 0 || !currentUserId) return;

    const currentBalance = walletBalances[currentUserId] || 0;
    if (amount > currentBalance) {
      alert("Insufficient funds in your wallet. Please add money to your wallet first.");
      return;
    }

    const goal = userGoals.find(g => g.id === goalId);
    if (!goal) return;

    // Deduct from wallet
    updateWalletBalance(currentUserId, currentBalance - amount);

    // Add to goal
    updateGoal(goalId, { currentSaved: goal.currentSaved + amount });
    
    // Clear
    setAddFundsId(null);
    setFundAmount('');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Emergency': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Long-term': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg shadow-black/20 rounded-xl p-6 lg:p-8 relative overflow-hidden h-fit">
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-full translate-y-1/2 translate-x-1/3 blur-[4rem] pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" /> Savings & Goals
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
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {isAdding ? 'Cancel' : 'Add Goal'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Goal Title</label>
                  <input 
                    type="text"
                    placeholder="e.g. Emergency Fund, Laptop"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Target Amount (LKR)</label>
                  <input 
                    type="number"
                    min="1"
                    value={formData.targetAmount}
                    onChange={e => setFormData({...formData, targetAmount: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Goal Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-gray-500"
                  >
                    <option value="Short-term">Short-term</option>
                    <option value="Long-term">Long-term</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={cancelAddOrEdit} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-emerald-500 text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors">{editingId ? 'Update Goal' : 'Save Goal'}</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 relative z-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {userGoals.length === 0 && !isAdding && (
          <div className="col-span-full py-8 text-center bg-black/20 rounded-2xl border border-dashed border-[#2a2d36]">
            <Target className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No financial goals set yet. Start saving today!</p>
          </div>
        )}
        
        {userGoals.map(goal => {
          const percentage = Math.min((goal.currentSaved / goal.targetAmount) * 100, 100);
          const isComplete = percentage >= 100;

          return (
            <div key={goal.id} className={`flex flex-col gap-3 p-5 rounded-2xl border ${isComplete ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-[#23252b]/50 border-[#2a2d36] hover:bg-white/5 transition-all'} group`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getTypeColor(goal.type)} mb-2 inline-block`}>{goal.type}</span>
                  <h4 className="font-extrabold text-white text-base leading-tight mb-1">{goal.title}</h4>
                  <p className="text-xs font-semibold text-emerald-400">LKR {goal.currentSaved.toLocaleString()} <span className="text-gray-500">/ {goal.targetAmount.toLocaleString()}</span></p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => {
                    setEditingId(goal.id);
                    setFormData({ title: goal.title, targetAmount: goal.targetAmount.toString(), type: goal.type });
                    setIsAdding(true);
                  }} className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteGoal(goal.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Circular Progress */}
              <div className="mt-2 flex items-center gap-3">
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[#2a2d36]" />
                    <circle 
                      cx="24" cy="24" r="20" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      fill="transparent" 
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - percentage / 100)}`}
                      className={`transition-all duration-1000 ease-out ${isComplete ? 'text-emerald-400' : 'text-blue-500'}`} 
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-white">{Math.round(percentage)}%</span>
                </div>
                <div className="flex-1">
                  {addFundsId === goal.id ? (
                    <div className="flex gap-1 animate-in fade-in zoom-in-95 duration-200">
                      <input 
                        type="number"
                        placeholder="Amount"
                        value={fundAmount}
                        onChange={e => setFundAmount(e.target.value)}
                        className="flex-1 min-w-0 p-1.5 rounded-lg border border-[#2a2d36] bg-black/40 text-white shadow-sm font-medium text-xs focus:border-emerald-500/50 focus:outline-none transition-colors"
                        autoFocus
                      />
                      <button onClick={() => handleAddFunds(goal.id)} className="w-7 h-7 flex items-center justify-center bg-emerald-500 text-black rounded-lg shrink-0 hover:bg-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { setAddFundsId(null); setFundAmount(''); }} className="w-7 h-7 flex items-center justify-center bg-[#2a2d36] text-gray-400 rounded-lg shrink-0 hover:bg-white/10"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setAddFundsId(goal.id)}
                      disabled={isComplete}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${isComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
                    >
                      {isComplete ? <><CheckCircle2 className="w-3.5 h-3.5" /> Goal Reached</> : <><Banknote className="w-3.5 h-3.5 text-emerald-400" /> Add Funds</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
