"use client";

import { useState } from 'react';
import { useAppStore, Transaction } from '../store';
import { format } from 'date-fns';
import { Plus, Banknote, Tag, Calendar, FileText, Trash2, Edit2, X, ArrowUpRight, ArrowDownRight, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/financeConstants';

export function TransactionEntry() {
  const currentUserId = useAppStore(state => state.currentUserId);
  const addTransaction = useAppStore(state => state.addTransaction);
  const updateTransaction = useAppStore(state => state.updateTransaction);
  const transactions = useAppStore(state => state.transactions);
  const removeTransaction = useAppStore(state => state.removeTransaction);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const userTransactions = transactions.filter(e => e.userId === currentUserId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [isFixed, setIsFixed] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    date: format(new Date(), 'yyyy-MM-dd'),
    note: ''
  });

  const activeCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setFormData(prev => ({
      ...prev,
      category: newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !formData.amount || isNaN(Number(formData.amount))) return;
    
    if (editingId) {
      updateTransaction(editingId, {
        type,
        isFixed,
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
        note: formData.note
      });
      setEditingId(null);
    } else {
      addTransaction({
        userId: currentUserId,
        type,
        isFixed,
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
        note: formData.note
      });
    }
    
    setFormData({
      amount: '',
      category: activeCategories[0],
      date: format(new Date(), 'yyyy-MM-dd'),
      note: ''
    });
    setIsFixed(false);
  };

  const startEdit = (t: Transaction) => {
    setEditingId(t.id);
    setType(t.type);
    setIsFixed(t.isFixed || false);
    setFormData({
      amount: t.amount.toString(),
      category: t.category,
      date: t.date,
      note: t.note
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setType('expense');
    setIsFixed(false);
    setFormData({
      amount: '',
      category: EXPENSE_CATEGORIES[0],
      date: format(new Date(), 'yyyy-MM-dd'),
      note: ''
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-[32px] p-6 lg:p-8 relative overflow-hidden">
        <h3 className="font-extrabold text-xl text-white mb-6 flex items-center gap-2 relative z-10">
          {editingId ? <Edit2 className="w-5 h-5 text-indigo-400" /> : <Plus className="w-5 h-5 text-indigo-400" />} 
          {editingId ? 'Edit Transaction' : 'Log Transaction'}
        </h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          
          <div className="flex flex-col sm:flex-row gap-4 mb-2">
            {/* Type Toggle */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${type === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:text-white'}`}
              >
                <ArrowUpRight className="w-4 h-4" /> Income
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${type === 'expense' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-400 hover:text-white'}`}
              >
                <ArrowDownRight className="w-4 h-4" /> Expense
              </button>
            </div>

            {/* Is Fixed Toggle */}
            <div className="flex items-center gap-3 bg-black/20 border border-white/5 px-4 py-2 rounded-xl">
               <Repeat className={`w-4 h-4 ${isFixed ? 'text-indigo-400' : 'text-gray-500'}`} />
               <span className="text-sm font-bold text-gray-300">Recurring/Fixed?</span>
               <button 
                 type="button"
                 onClick={() => setIsFixed(!isFixed)}
                 className={`w-10 h-5 rounded-full relative transition-colors ${isFixed ? 'bg-indigo-500' : 'bg-gray-600'}`}
               >
                 <motion.div 
                   className="w-4 h-4 bg-white rounded-full absolute top-0.5"
                   animate={{ left: isFixed ? '22px' : '2px' }}
                   transition={{ type: "spring", stiffness: 500, damping: 30 }}
                 />
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5" /> Amount (LKR)
              </label>
              <input 
                type="number" 
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-indigo-500/50 focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Category
              </label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium appearance-none cursor-pointer focus:border-indigo-500/50 focus:outline-none transition-colors"
                required
              >
                {activeCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Date
              </label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-indigo-500/50 focus:outline-none transition-colors [color-scheme:dark]"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Short Note
              </label>
              <input 
                type="text" 
                placeholder="Optional description"
                value={formData.note}
                onChange={e => setFormData({...formData, note: e.target.value})}
                className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium focus:border-indigo-500/50 focus:outline-none transition-colors"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-2 self-end w-full sm:w-auto">
            {editingId && (
              <button 
                type="button" 
                onClick={cancelEdit}
                className="bg-white/5 text-gray-300 px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
            <button type="submit" className={`text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-colors w-full sm:w-auto ${type === 'income' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-red-600 hover:bg-red-500 shadow-red-500/20'}`}>
              {editingId ? 'Update Transaction' : `Save ${type === 'income' ? 'Income' : 'Expense'}`}
            </button>
          </div>
        </form>
      </div>

      {userTransactions.length > 0 && (
        <div className="bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-[32px] p-6 lg:p-8">
          <h3 className="font-extrabold text-xl text-white mb-6">Recent Transactions</h3>
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2">
            <AnimatePresence>
              {userTransactions.map(t => (
                <motion.div 
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#2a2d36] bg-black/20 hover:bg-white/5 transition-colors gap-4 group relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${t.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  
                  <div className="flex flex-col gap-1 pl-2">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm">{t.category}</p>
                      {t.isFixed && <span className="bg-indigo-500/20 text-indigo-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">Fixed</span>}
                    </div>
                    {t.note && <p className="text-xs text-gray-400">{t.note}</p>}
                    <p className="text-[10px] text-gray-500 mt-1">{t.date}</p>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-2">
                    <span className={`font-extrabold text-lg ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'} LKR {t.amount}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(t)} 
                        className="p-2 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeTransaction(t.id)} 
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
