"use client";

import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { Target, Plus, Check, X, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  "Rent",
  "Transport",
  "Food",
  "Academic",
  "Medical",
  "Entertainment",
  "Other"
];

export function BudgetTracker() {
  const currentUserId = useAppStore(state => state.currentUserId);
  const budgets = useAppStore(state => state.budgets);
  const transactions = useAppStore(state => state.transactions);
  const setBudget = useAppStore(state => state.setBudget);
  const deleteBudget = useAppStore(state => state.deleteBudget);

  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({ category: CATEGORIES[0], limit: '' });

  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totals: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.userId === currentUserId && t.type === 'expense') {
        const d = new Date(t.date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          totals[t.category] = (totals[t.category] || 0) + t.amount;
        }
      }
    });
    return totals;
  }, [transactions, currentUserId]);

  const userBudgets = budgets.filter(b => b.userId === currentUserId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !formData.category || !formData.limit || isNaN(Number(formData.limit))) return;
    
    setBudget(currentUserId, formData.category, Number(formData.limit));
    setIsAdding(false);
    setEditingCategory(null);
    setFormData({ category: CATEGORIES[0], limit: '' });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return 'bg-emerald-500';
    if (percentage <= 90) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg shadow-black/20 rounded-xl p-6 lg:p-8 relative overflow-hidden h-fit">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[4rem] pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" /> Budget Tracker
        </h3>
        <button 
          onClick={() => { setIsAdding(true); setEditingCategory(null); }}
          className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Limit
        </button>
      </div>

      <AnimatePresence>
        {(isAdding || editingCategory) && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 relative z-10"
          >
            <form onSubmit={handleSave} className="flex gap-3 bg-black/20 p-4 rounded-2xl border border-white/5 items-end">
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-gray-500"
                  disabled={!!editingCategory}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Monthly Limit (LKR)</label>
                <input 
                  type="number"
                  min="0"
                  value={formData.limit}
                  onChange={e => setFormData({...formData, limit: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-gray-500"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-colors"><Check className="w-4 h-4" /></button>
                <button type="button" onClick={() => { setIsAdding(false); setEditingCategory(null); }} className="w-10 h-10 rounded-xl bg-white/5 text-gray-400 flex items-center justify-center hover:bg-white/10 transition-colors"><X className="w-4 h-4" /></button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-5 relative z-10 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
        {userBudgets.length === 0 && !isAdding && (
          <p className="text-sm text-gray-400 text-center py-4 bg-black/20 rounded-xl border border-dashed border-[#2a2d36]">No budget limits set. Add one to track spending.</p>
        )}
        
        {userBudgets.map(budget => {
          const spent = currentMonthExpenses[budget.categoryId] || 0;
          const percentage = Math.min((spent / budget.monthlyLimit) * 100, 100);
          const colorClass = getProgressColor(percentage);

          return (
            <div key={budget.categoryId} className="flex flex-col gap-2 group p-3 -mx-3 rounded-2xl hover:bg-white/10 transition-colors rounded-lg border border-transparent">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{budget.categoryId}</span>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <button 
                      onClick={() => {
                        setEditingCategory(budget.categoryId);
                        setFormData({ category: budget.categoryId, limit: budget.monthlyLimit.toString() });
                        setIsAdding(false);
                      }}
                      className="text-gray-500 hover:text-emerald-400 transition-colors p-1 hover:bg-emerald-500/10 rounded-lg"
                    ><Edit2 className="w-3.5 h-3.5" /></button>
                    <button 
                      onClick={() => deleteBudget(currentUserId, budget.categoryId)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1 hover:bg-red-500/10 rounded-lg"
                    ><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="text-xs font-semibold">
                  <span className="text-white">LKR {spent.toLocaleString()}</span>
                  <span className="text-gray-500"> / {budget.monthlyLimit.toLocaleString()}</span>
                </div>
              </div>
              <div className="h-2 w-full bg-[#23252b] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full ${colorClass}`}
                />
              </div>
              {percentage >= 90 && <span className="text-[10px] text-red-400 font-bold text-right">Warning: Approaching limit!</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
