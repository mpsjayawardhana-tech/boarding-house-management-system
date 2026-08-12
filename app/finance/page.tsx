"use client";

import { useAppStore } from "@/store";
import { format } from "date-fns";
import { CheckCircle2, Edit2, Plus, Trash2, WalletCards, ArrowRightLeft, Coins } from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";
import { BoardingFeeTracker } from "@/components/BoardingFeeTracker";
import { motion } from "framer-motion";

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function FinancePage() {
  const { users, p2pDebts, payments, boardingFees, addP2PDebt, updateP2PDebt, deleteP2PDebt, addPayment, toggleBoardingFee, currentUserId = '1' } = useAppStore();
  const currentUser = users.find(u => u.id === currentUserId);
  if (!currentUser) return null;
  const currentUserRole = currentUser.role;
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [upfrontPayments, setUpfrontPayments] = useState<Record<string, number>>({});
  const [partialPaymentTargetId, setPartialPaymentTargetId] = useState<string | null>(null);
  const [partialPaymentDirection, setPartialPaymentDirection] = useState<'from_me' | 'to_me'>('from_me');
  const [partialPaymentAmount, setPartialPaymentAmount] = useState<number>(0);
  
  const [activeTab, setActiveTab] = useState<'balances' | 'ledger'>('balances');

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    payerId: users[0]?.id || '',
    borrowerIds: [] as string[],
    amount: 0,
    description: ''
  });

  const personalBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    
    users.filter(u => u.id !== currentUserId).forEach(otherUser => {
      // amountTheyOweYou: Sum of all active debts where creditorId === currentUser.id and debtorId === otherUser.id
      const amountTheyOweYou = p2pDebts
        .filter(debt => debt.payerId === currentUserId && debt.borrowerId === otherUser.id)
        .reduce((sum, debt) => sum + Number(debt.amount), 0);

      // amountYouOweThem: Sum of all active debts where creditorId === otherUser.id and debtorId === currentUser.id
      const amountYouOweThem = p2pDebts
        .filter(debt => debt.payerId === otherUser.id && debt.borrowerId === currentUserId)
        .reduce((sum, debt) => sum + Number(debt.amount), 0);

      // (Optional: handle payments if you want a true net running balance. 
      //  The instructions specified just amountTheyOweYou - amountYouOweThem for the debts, but we'll include payments to keep the app working correctly!)
      const paymentsIReceived = payments
        .filter(p => p.payeeId === currentUserId && p.payerId === otherUser.id)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const paymentsIMade = payments
        .filter(p => p.payerId === currentUserId && p.payeeId === otherUser.id)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      balances[otherUser.id] = (amountTheyOweYou - amountYouOweThem) - (paymentsIReceived - paymentsIMade);
    });

    return balances;
  }, [p2pDebts, payments, users, currentUserId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        if (bId === formData.payerId) return;
        
        const upfrontPaid = upfrontPayments[bId] || 0;
        const remainingDebt = splitAmount - upfrontPaid;

        if (remainingDebt > 0) {
          addP2PDebt({
            date: formData.date,
            payerId: formData.payerId,
            borrowerId: bId,
            amount: remainingDebt,
            description: formData.description
          });
        }
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
    setUpfrontPayments({});
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

  const handleBorrowerToggle = (uId: string, checked: boolean) => {
    setFormData(prev => {
      if (checked) {
        if (!prev.borrowerIds.includes(uId)) {
          return { ...prev, borrowerIds: [...prev.borrowerIds, uId] };
        }
        return prev;
      } else {
        return { ...prev, borrowerIds: prev.borrowerIds.filter(id => id !== uId) };
      }
    });

    if (!checked) {
      setUpfrontPayments(prev => {
        const next = { ...prev };
        delete next[uId];
        return next;
      });
    }
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

      <div className="flex bg-[#131418] border border-white/5 p-1 rounded-full w-fit mb-2">
        <button 
          onClick={() => setActiveTab('balances')} 
          className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${activeTab === 'balances' ? 'bg-[#00ff9d]/10 text-[#00ff9d]' : 'text-white/50 hover:text-white/80'}`}
        >
          Personal Balances
        </button>
        <button 
          onClick={() => setActiveTab('ledger')} 
          className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${activeTab === 'ledger' ? 'bg-[#00ff9d]/10 text-[#00ff9d]' : 'text-white/50 hover:text-white/80'}`}
        >
          Expense History
        </button>
      </div>

      <div className="w-full">
        {activeTab === 'balances' && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }} 
          whileInView={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          viewport={{ once: true, amount: 0.1 }}
          className="lg:col-span-1 bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-[32px] p-6 flex flex-col gap-6 relative overflow-hidden w-full min-h-[40vh] md:min-h-0"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/15 to-[#00ff9d]/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-[4rem] pointer-events-none"></div>
          <div className="relative z-10 flex items-center gap-2 border-b border-[#2a2d36] pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <WalletCards className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight text-white">Your Balances</h3>
              <p className="text-xs text-gray-400 font-medium">Who you owe & who owes you</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            {users.filter(u => u.id !== currentUserId && (u.isActive || personalBalances[u.id] !== 0)).map(user => {
              const bal = personalBalances[user.id] || 0;
              return (
                <div key={user.id} className={`flex flex-col gap-3 p-4 rounded-2xl border ${user.isActive ? 'bg-black/20 border-[#2a2d36]' : 'bg-[#23252b]/50 border-dashed border-[#2a2d36] opacity-70'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#23252b] border border-[#2a2d36] shadow-sm">
                        <Image src={user.avatar} alt={user.name} width={40} height={40} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-white">{user.name} {!user.isActive && <span className="text-[10px] font-normal text-gray-500 ml-1">(Deactivated)</span>}</span>
                        {bal > 0 ? (
                          <span className="text-xs font-semibold text-emerald-400">Owes you LKR {bal}</span>
                        ) : bal < 0 ? (
                          <span className="text-xs font-semibold text-rose-400">You owe LKR {Math.abs(bal)}</span>
                        ) : (
                          <span className="text-xs font-semibold text-white/40">Settled up</span>
                        )}
                      </div>
                    </div>
                    
                    {bal !== 0 && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { 
                            setPartialPaymentTargetId(user.id); 
                            setPartialPaymentDirection(bal > 0 ? 'to_me' : 'from_me');
                            setPartialPaymentAmount(0); 
                          }} 
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-yellow-400 transition-colors border border-white/10 flex items-center justify-center"
                          title="Partial Pay"
                        >
                          <Coins className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (bal > 0) {
                              addPayment(user.id, currentUserId, Math.abs(bal));
                            } else {
                              addPayment(currentUserId, user.id, Math.abs(bal));
                            }
                          }}
                          className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors border border-emerald-500/20 flex items-center justify-center"
                          title="Full Settle"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {partialPaymentTargetId && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-[#141618] border border-[#2a2d36] shadow-2xl rounded-3xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
                <h3 className="font-bold text-lg text-white mb-4">Record Payment</h3>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Amount Paid (LKR)</label>
                <input 
                  type="number" 
                  min="1"
                  value={partialPaymentAmount || ''}
                  onChange={e => setPartialPaymentAmount(parseInt(e.target.value) || 0)}
                  className="w-full p-3 rounded-xl border border-[#2a2d36] bg-black/20 text-white shadow-sm font-medium mb-6"
                  required
                />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setPartialPaymentTargetId(null)} className="px-4 py-2 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                  <button 
                    onClick={() => {
                      if (partialPaymentAmount > 0 && partialPaymentTargetId) {
                        const payer = partialPaymentDirection === 'from_me' ? currentUserId : partialPaymentTargetId;
                        const payee = partialPaymentDirection === 'from_me' ? partialPaymentTargetId : currentUserId;
                        addPayment(payer, payee, partialPaymentAmount);
                        setPartialPaymentTargetId(null);
                      }
                    }} 

                    className="bg-emerald-500 text-black px-4 py-2 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-emerald-400 transition-colors"
                  >
                    Save Payment
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
        )}

        {/* P2P Debt Ledger */}
        {activeTab === 'ledger' && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }} 
          whileInView={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, amount: 0.1 }}
          className="bg-[#0B0C0E] border border-white/[0.08] shadow-2xl rounded-[32px] p-6 md:p-8 relative overflow-hidden w-full min-h-[40vh] md:min-h-0"
        >
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-[#00ff9d]/10 to-blue-500/5 rounded-full translate-y-1/3 translate-x-1/3 blur-[5rem] pointer-events-none"></div>
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
                        <button type="button" className="text-emerald-400 hover:underline text-[10px]" onClick={() => setFormData({...formData, borrowerIds: users.filter(u => u.isActive).map(u => u.id)})}>Select All</button>
                      </label>
                      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto p-2 border border-[#2a2d36] rounded-xl bg-black/20 shadow-sm">
                        {users.filter(u => u.isActive).map(u => (
                          <div key={u.id} className="flex items-center justify-between p-1 hover:bg-white/5 rounded">
                            <label className="flex items-center gap-2 cursor-pointer text-white flex-1">
                              <input 
                                type="checkbox" 
                                checked={formData.borrowerIds.includes(u.id)}
                                onChange={(e) => handleBorrowerToggle(u.id, e.target.checked)}
                                className="rounded border-[#2a2d36] bg-[#23252b] text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                              />
                              <span className="text-sm font-semibold">{u.name}</span>
                            </label>
                            
                            {formData.borrowerIds.includes(u.id) && u.id !== formData.payerId && (
                              <input 
                                type="number" 
                                placeholder="Paid upfront (optional)"
                                value={upfrontPayments[u.id] || ''}
                                onChange={e => setUpfrontPayments({...upfrontPayments, [u.id]: parseInt(e.target.value) || 0})}
                                className="w-40 p-1.5 text-xs rounded-lg border border-[#2a2d36] bg-[#23252b] text-white placeholder-gray-500 text-right"
                              />
                            )}
                          </div>
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
                        {currentUserRole === 'admin' && (
                          <>
                            <button onClick={() => handleEdit(debt)} className="p-2 text-gray-400 hover:text-emerald-400 bg-transparent hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteP2PDebt(debt.id)} className="p-2 text-gray-400 hover:text-red-400 bg-transparent hover:bg-red-500/10 rounded-lg transition-colors border border-transparent" title="Delete Expense">
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
          </div>
        </motion.div>
        )}
      </div>

      <BoardingFeeTracker />

    </div>
  );
}
