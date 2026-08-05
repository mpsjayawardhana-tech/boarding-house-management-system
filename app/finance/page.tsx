"use client";

import { useAppStore } from "@/store";
import { format } from "date-fns";
import { CheckCircle2, Edit2, Plus, Trash2, WalletCards, ArrowRightLeft } from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";
import { BoardingFeeTracker } from "@/components/BoardingFeeTracker";

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function FinancePage() {
  const { users, p2pDebts, boardingFees, addP2PDebt, updateP2PDebt, deleteP2PDebt, toggleBoardingFee, currentUserId, currentUserRole } = useAppStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    payerId: users[0]?.id || '',
    borrowerIds: [] as string[],
    amount: 0,
    description: ''
  });

  const netBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    users.forEach(u => balances[u.id] = 0);

    p2pDebts.forEach(debt => {
      balances[debt.payerId] += debt.amount; // payer gets money back (+)
      balances[debt.borrowerId] -= debt.amount; // borrower owes money (-)
    });

    return balances;
  }, [p2pDebts, users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.borrowerIds.includes(formData.payerId)) {
      alert("Payer cannot be included in the split!");
      return;
    }
    if (formData.borrowerIds.length === 0) {
      alert("Please select at least one person who owes money.");
      return;
    }
    
    if (editingId) {
      updateP2PDebt(editingId, {
        date: formData.date,
        payerId: formData.payerId,
        borrowerId: formData.borrowerIds[0],
        amount: formData.amount,
        description: formData.description
      });
      setEditingId(null);
    } else {
      const splitAmount = Math.round(formData.amount / formData.borrowerIds.length);
      formData.borrowerIds.forEach(bId => {
        addP2PDebt({
          date: formData.date,
          payerId: formData.payerId,
          borrowerId: bId,
          amount: splitAmount,
          description: formData.description
        });
      });
      setIsAdding(false);
    }
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      payerId: users[0]?.id || '',
      borrowerIds: [],
      amount: 0,
      description: ''
    });
  };

  const handleEdit = (debt: any) => {
    setFormData({
      date: debt.date,
      payerId: debt.payerId,
      borrowerIds: [debt.borrowerId],
      amount: debt.amount,
      description: debt.description
    });
    setEditingId(debt.id);
    setIsAdding(true);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Financial Tracker</h1>
          <p className="text-gray-400 mt-1">Manage peer-to-peer debts and monthly boarding fees.</p>
        </div>
        <button 
          onClick={() => { setIsAdding(!isAdding); setEditingId(null); }}
          className="flex items-center gap-2 bg-emerald-500 text-black px-5 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-emerald-400 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Net Balances Widget */}
        <div className="lg:col-span-1 bg-[#181a1f] rounded-3xl p-6 border border-[#2a2d36] shadow-md flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-[#2a2d36] pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <WalletCards className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight text-white">Net Balances</h3>
              <p className="text-xs text-gray-400 font-medium">Who owes whom?</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            {users.filter(u => u.isActive || netBalances[u.id] !== 0).map(user => {
              const bal = netBalances[user.id] || 0;
              return (
                <div key={user.id} className={`flex items-center justify-between p-3 rounded-2xl border ${user.isActive ? 'bg-black/20 border-[#2a2d36]' : 'bg-[#23252b]/50 border-dashed border-[#2a2d36] opacity-70'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#23252b] border border-[#2a2d36] shadow-sm">
                      <Image src={user.avatar} alt={user.name} width={32} height={32} />
                    </div>
                    <span className="font-bold text-sm text-white">{user.name} {!user.isActive && <span className="text-[10px] font-normal text-gray-500 ml-1">(Deactivated)</span>}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold ${bal > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : bal < 0 ? 'bg-[#ff5a5a]/10 text-red-400 border border-[#ff5a5a]/20' : 'bg-[#23252b] text-gray-400 border border-[#2a2d36]'}`}>
                    {bal > 0 ? `Gets LKR ${bal}` : bal < 0 ? `Owes LKR ${Math.abs(bal)}` : 'Settled'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* P2P Debt Ledger */}
        <div className="lg:col-span-2 bg-[#181a1f] rounded-3xl p-6 md:p-8 border border-[#2a2d36] shadow-md">
          {isAdding && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-[#181a1f] rounded-3xl p-6 md:p-8 border border-[#2a2d36] shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-200 relative">
                <button 
                  onClick={() => setIsAdding(false)} 
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#23252b] hover:bg-white/10 text-gray-400 transition-colors"
                >
                  &times;
                </button>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                  <h3 className="font-extrabold text-2xl tracking-tight text-white">{editingId ? 'Edit Expense' : 'Log New Expense'}</h3>
                  <p className="text-gray-400 text-sm mb-2">Fill in the details below to log a peer-to-peer expense.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Dinner, Grocery run..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium"
                        required
                      />
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
                      <label className="text-xs font-bold text-gray-500 uppercase">Amount (LKR)</label>
                      <input 
                        type="number" 
                        min="1"
                        value={formData.amount}
                        onChange={e => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                        className="p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Who Paid?</label>
                      <select 
                        value={formData.payerId} 
                        onChange={e => setFormData({...formData, payerId: e.target.value})}
                        className="p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-emerald-400 shadow-sm font-semibold"
                        required
                      >
                        {users.filter(u => u.isActive).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center justify-between">
                        Who Owes?
                        <button type="button" className="text-emerald-400 hover:underline text-[10px]" onClick={() => setFormData({...formData, borrowerIds: users.filter(u => u.isActive && u.id !== formData.payerId).map(u => u.id)})}>Select All</button>
                      </label>
                      <div className="flex flex-col gap-2 max-h-32 overflow-y-auto p-2 border border-[#2a2d36] rounded-xl bg-black/20 shadow-sm">
                        {users.filter(u => u.isActive).map(u => (
                          <label key={u.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-white/5 rounded text-white">
                            <input 
                              type="checkbox" 
                              checked={formData.borrowerIds.includes(u.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({...formData, borrowerIds: [...formData.borrowerIds, u.id]});
                                } else {
                                  setFormData({...formData, borrowerIds: formData.borrowerIds.filter(id => id !== u.id)});
                                }
                              }}
                              className="rounded border-[#2a2d36] bg-[#23252b] text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                            />
                            <span className="text-sm font-semibold">{u.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-[#23252b] transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="bg-emerald-500 text-black px-6 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-emerald-400 transition-colors">
                      {editingId ? 'Save Changes' : 'Add Expense'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-6">
            <ArrowRightLeft className="w-5 h-5 text-gray-400" />
            <h3 className="font-extrabold text-xl tracking-tight text-white">Expense Ledger</h3>
          </div>
          
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2">
            {p2pDebts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8 bg-black/20 rounded-xl border border-dashed border-[#2a2d36]">No expenses logged yet.</p>
            ) : (
              p2pDebts.map(debt => {
                const payer = users.find(u => u.id === debt.payerId);
                const borrower = users.find(u => u.id === debt.borrowerId);
                
                return (
                  <div key={debt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#2a2d36] bg-black/20 hover:bg-white/5 transition-colors gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="font-bold text-white text-sm">{debt.description}</p>
                      <p className="text-xs text-gray-400">{debt.date}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-emerald-400">{payer?.name} paid</span>
                        <ArrowRightLeft className="w-3 h-3 text-gray-500" />
                        <span className="text-xs font-semibold text-red-400">{borrower?.name} owes</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                      <span className="font-extrabold text-lg text-white">LKR {debt.amount}</span>
                      <div className="flex items-center gap-2">
                        {currentUserRole === 'admin' || debt.payerId === currentUserId ? (
                          <>
                            <button onClick={() => handleEdit(debt)} className="p-2 text-gray-400 hover:text-emerald-400 bg-transparent hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteP2PDebt(debt.id)} className="p-2 text-gray-400 hover:text-emerald-400 bg-transparent hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent" title="Mark as Settled">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button disabled className="p-2 text-gray-600 bg-[#23252b]/50 rounded-lg cursor-not-allowed border border-[#2a2d36]" title="Only the payer or admin can settle this">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>

      <BoardingFeeTracker />

    </div>
  );
}
