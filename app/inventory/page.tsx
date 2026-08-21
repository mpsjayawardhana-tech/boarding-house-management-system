"use client";

import { useAppStore } from "@/store";
import { format } from "date-fns";
import { Edit2, Plus, Trash2, Box, AlertCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";
import { IconMapper } from "@/components/IconMapper";
import { parseSmartAmount } from "@/utils/parseAmount";
import { motion } from "framer-motion";

export const dynamic = 'force-dynamic';

export default function InventoryPage() {
  const { users, inventoryItems, inventoryLogs, inventoryCycles, addInventoryLog, updateInventoryLog, deleteInventoryLog, addInventoryContribution, currentUserId } = useAppStore();
  const currentUser = users.find(u => u.id === currentUserId);
  if (!currentUser) return null;
  const currentUserRole = currentUser.role;
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const [formData, setFormData] = useState({
    itemId: 'sugar',
    date: format(new Date(), 'yyyy-MM-dd'),
    amountStr: '',
    userId: users[0]?.id || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const item = inventoryItems.find(i => i.id === formData.itemId);
    const amountInUnits = parseSmartAmount(formData.amountStr, item?.unit || 'g');
    
    if (amountInUnits === null) {
      alert("Invalid amount format. Please enter a number optionally followed by a unit (e.g., 2, 500g, 1.5kg).");
      return;
    }
    
    if (editingId) {
      updateInventoryLog(editingId, formData);
      setEditingId(null);
    } else {
      addInventoryLog(formData);
      addInventoryContribution(formData.itemId, formData.userId, amountInUnits);
      setIsAdding(false);
    }
    setFormData({
      itemId: 'sugar',
      date: format(new Date(), 'yyyy-MM-dd'),
      amountStr: '',
      userId: users[0]?.id || ''
    });
  };

  const handleEdit = (log: any) => {
    setFormData({
      itemId: log.itemId,
      date: log.date,
      amountStr: log.amountStr,
      userId: log.userId
    });
    setEditingId(log.id);
    setIsAdding(true);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Advanced Inventory</h1>
          <p className="text-gray-400 mt-1">Smart quota cycles and debt tracking.</p>
        </div>
        <button 
          onClick={() => { setIsAdding(!isAdding); setEditingId(null); }}
          className="flex items-center gap-2 bg-emerald-500 text-black px-5 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-emerald-400 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Cancel' : 'Log Purchase'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Cycle Overview Widgets */}
        {inventoryItems.map((item, idx) => {
          const cycleInfo = inventoryCycles[item.id] || { currentCycle: 1, userProgress: {}, userDebts: {} };
          const userProgress = cycleInfo.userProgress || {};
          const userDebts = cycleInfo.userDebts || {};
          
          const userStatus = users.filter(u => u.isActive !== false && u.role !== 'super_admin').map(u => {
            const p = userProgress[u.id] || 0;
            const d = userDebts[u.id] || 0;
            const required = (item.quota || 0) + d;
            const isDone = p >= required;
            return {
              user: u,
              progress: p,
              debt: d,
              required,
              isDone
            };
          });
          
          const pending = userStatus.filter(u => !u.isDone).sort((a, b) => {
            if (a.debt > 0 && b.debt === 0) return -1;
            if (b.debt > 0 && a.debt === 0) return 1;
            if (a.debt > 0 && b.debt > 0) return b.debt - a.debt;
            return a.progress - b.progress;
          });
          const completed = userStatus.filter(u => u.isDone).sort((a, b) => b.progress - a.progress);
          
          const veryNext = pending[0]; // Person with highest debt or least progress

          return (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, y: 50, scale: 0.95 }} 
              whileInView={{ opacity: 1, y: 0, scale: 1 }} 
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 * Math.min(idx, 3) }}
              viewport={{ once: true, amount: 0.1 }}
              className={`bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-[32px] p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden w-full min-h-[40vh] md:min-h-0`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-[4rem] pointer-events-none"></div>
              
              <div className="flex justify-between items-center border-b border-[#2a2d36] pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-[#2a2d36] shadow-sm text-2xl ${item.color}`}>
                    <IconMapper iconStr={item.icon || item.id} className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-2xl tracking-tight text-white">{item.name}</h3>
                    <p className="text-xs text-gray-400 font-bold">Quota: {item.quota ?? 0} {item.unit || 'g'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-extrabold text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-xl border border-emerald-500/20">
                    Cycle {cycleInfo.currentCycle}
                  </span>
                </div>
              </div>

              {/* Very Next */}
              {veryNext && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/20 border border-emerald-500/30 shadow-sm relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#1C1E22] shadow-md bg-[#23252b]">
                      <Image src={veryNext.user.avatar} alt={veryNext.user.name} width={56} height={56} className="object-cover" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 block">Very Next</span>
                      <h4 className="font-extrabold text-lg text-white">{veryNext.user.name}</h4>
                    </div>
                  </div>
                  {veryNext.debt > 0 && (
                    <div className="flex items-center gap-1.5 text-red-400 bg-[#ff5a5a]/10 px-3 py-1.5 rounded-lg border border-[#ff5a5a]/20 shadow-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-bold">Debt: {veryNext.debt} {item.unit || 'g'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Pending Queue */}
              {pending.length > 0 && (
                <div className="flex flex-col gap-3 relative z-10">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Pending in Queue</h4>
                  {pending.map((p) => {
                    const pct = Math.min((p.progress / p.required) * 100, 100);
                    
                    return (
                      <div key={p.user.id} className="flex flex-col gap-2 p-3 rounded-xl border border-[#2a2d36] bg-black/20 hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#2a2d36] shadow-sm bg-[#23252b] relative group">
                              <Image src={p.user.avatar} alt={p.user.name} width={36} height={36} className="object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-white">{p.user.name}</span>
                              {p.debt > 0 && (
                                <span className="text-[10px] font-bold text-red-400">Previous Debt: {p.debt} {item.unit || 'g'}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-gray-500">{p.progress} / {p.required} {item.unit || 'g'}</span>
                          </div>
                        </div>
                        
                        <div className="h-2 w-full bg-[#1A1C20] rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${p.debt > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {completed.length > 0 && (
                <div className="flex flex-col gap-3 relative z-10 mt-2">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Completed This Cycle</h4>
                  {completed.map((p) => {
                      const surplusAmount = p.progress - p.required;
                      const futureCycles = item.quota > 0 ? Math.floor(surplusAmount / item.quota) : 0;
                      
                      return (
                        <div key={p.user.id} className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full overflow-hidden border-2 shadow-sm bg-[#23252b] ${futureCycles > 0 ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#1C1E22] border-[#2A2D35]' : 'border-emerald-500/50'}`}>
                              <Image src={p.user.avatar} alt={p.user.name} width={40} height={40} className="object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-emerald-400">{p.user.name}</span>
                              {futureCycles > 0 && (
                                <span className="text-[10px] font-bold text-emerald-500">Covered for {futureCycles} future cycle(s)</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {surplusAmount > 0 && (
                               <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/30">Surplus +{surplusAmount} {item.unit || 'g'}</span>
                            )}
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> {p.progress} {item.unit || 'g'}</span>
                          </div>
                        </div>
                      )
                  })}
                </div>
              )}

            </motion.div>
          )
        })}

        {/* Logs Form & Table */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }} 
          whileInView={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
          viewport={{ once: true, amount: 0.1 }}
          className="xl:col-span-2 bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-[32px] p-6 md:p-8 relative overflow-hidden w-full min-h-[40vh] md:min-h-0"
        >
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-full translate-y-1/3 -translate-x-1/3 blur-[5rem] pointer-events-none"></div>
          <div className="relative z-10">
          {isAdding && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-3xl p-6 md:p-8 border border-[#2a2d36] shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-200 relative">
                <button 
                  onClick={() => setIsAdding(false)} 
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#23252b] hover:bg-white/10 text-gray-400 transition-colors"
                >
                  &times;
                </button>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                  <h3 className="font-extrabold text-2xl tracking-tight text-white">{editingId ? 'Edit Purchase Log' : 'New Purchase Log'}</h3>
                  <p className="text-gray-400 text-sm mb-2">Fill in the details below to log a purchase.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Item</label>
                      <select 
                        value={formData.itemId} 
                        onChange={e => setFormData({...formData, itemId: e.target.value})}
                        className="p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium"
                        required
                      >
                        {inventoryItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                      </select>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                      <input 
                        type="date" 
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium [color-scheme:dark]"
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Amount (e.g. 500, 2, 1kg)</label>
                      <input 
                        type="text" 
                        placeholder="500, 2, 1kg..."
                        value={formData.amountStr}
                        onChange={e => setFormData({...formData, amountStr: e.target.value})}
                        className="p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Who brought it?</label>
                      <select 
                        value={formData.userId} 
                        onChange={e => setFormData({...formData, userId: e.target.value})}
                        className="p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-emerald-400 shadow-sm font-semibold"
                        required
                      >
                        {users.filter(u => u.isActive !== false && u.role !== 'super_admin').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-[#23252b] transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="bg-emerald-500 text-black px-6 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-emerald-400 transition-colors">
                      {editingId ? 'Save Changes' : 'Save Log'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6 cursor-pointer hover:bg-white/5 p-2 -ml-2 rounded-xl transition-colors" onClick={() => setShowHistory(!showHistory)}>
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-gray-400" />
              <h3 className="font-extrabold text-xl tracking-tight text-white">Master Purchase History</h3>
            </div>
            <button className="text-sm font-bold text-emerald-400 px-4 py-1.5 bg-emerald-500/10 rounded-lg">
              {showHistory ? 'Hide History' : 'View History'}
            </button>
          </div>
          
          {showHistory && (
            <div className="flex flex-col gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
              {inventoryLogs.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8 bg-black/20 rounded-xl border border-dashed border-[#2a2d36]">No purchases logged yet.</p>
            ) : (
              inventoryLogs.map(log => {
                const item = inventoryItems.find(i => i.id === log.itemId);
                const user = users.find(u => u.id === log.userId);
                
                return (
                  <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#2a2d36] bg-black/20 hover:bg-white/5 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-[#2a2d36] shadow-sm ${item?.color || 'bg-[#23252b]'}`}>
                        <IconMapper iconStr={item?.icon || item?.id || ''} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white">{item?.name}</h4>
                          <span className="text-xs font-bold bg-[#23252b] px-2 py-0.5 rounded-md text-gray-400">{log.amountStr}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{log.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#23252b] shadow-sm border border-[#2a2d36]">
                          {user && <Image src={user.avatar} alt={user.name} width={32} height={32} className="object-cover" />}
                        </div>
                        <span className="font-semibold text-sm text-white">{user?.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {(currentUserRole === 'admin' || log.userId === currentUserId) && (
                          <>
                            <button onClick={() => handleEdit(log)} className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg border border-transparent transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteInventoryLog(log.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-[#ff5a5a]/10 rounded-lg border border-transparent transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            </div>
          )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
