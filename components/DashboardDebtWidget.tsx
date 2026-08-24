import { useAppStore } from "@/store";
import { Handshake, Check, ExternalLink, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import { calculateNetBalances } from "@/lib/financeUtils";
import Link from "next/link";

export function DashboardDebtWidget() {
  const currentUserId = useAppStore(state => state.currentUserId);
  const users = useAppStore(state => state.users);
  const p2pDebts = useAppStore(state => state.p2pDebts);
  const payments = useAppStore(state => state.payments);
  const lentMoneys = useAppStore(state => state.lentMoneys);
  const personalDebts = useAppStore(state => state.personalDebts);
  const markLentMoneyPaid = useAppStore(state => state.markLentMoneyPaid);
  const updateWalletBalance = useAppStore(state => state.updateWalletBalance);

  if (!currentUserId) return null;

  const groupBalances = calculateNetBalances(users, currentUserId, p2pDebts, payments);
  
  // Payables (You Owe)
  const groupPayables = Object.entries(groupBalances)
    .filter(([_, amount]) => amount < 0)
    .map(([userId, amount]) => {
      const user = users.find(u => u.id === userId);
      return { 
        id: `pay-group-${userId}`, 
        name: user?.name || 'Unknown', 
        amount: Math.abs(amount), 
        type: 'group-payable' as const,
        label: 'You Owe'
      };
    });

  const myPersonalDebts = personalDebts
    .filter(d => d.userId === currentUserId && d.totalAmount > d.paidAmount)
    .map(d => ({
      id: `pay-personal-${d.id}`,
      name: d.lenderName,
      amount: d.totalAmount - d.paidAmount,
      type: 'personal-payable' as const,
      label: 'You Owe'
    }));

  // Receivables (Owed To You)
  const groupReceivables = Object.entries(groupBalances)
    .filter(([_, amount]) => amount > 0)
    .map(([userId, amount]) => {
      const user = users.find(u => u.id === userId);
      return { 
        id: `rec-group-${userId}`, 
        name: user?.name || 'Unknown', 
        amount, 
        type: 'group-receivable' as const,
        label: 'Owes You'
      };
    });

  const personalReceivables = lentMoneys
    .filter(l => l.userId === currentUserId && !l.isPaid)
    .map(l => ({ 
      id: `rec-personal-${l.id}`, 
      originalId: l.id,
      name: l.borrowerName, 
      amount: l.amount, 
      date: l.date, 
      note: l.note, 
      type: 'personal-receivable' as const,
      label: 'Owes You'
    }));

  const allItems = [...groupPayables, ...myPersonalDebts, ...groupReceivables, ...personalReceivables];

  const totalOwedByMe = groupPayables.reduce((s, i) => s + i.amount, 0) + myPersonalDebts.reduce((s, i) => s + i.amount, 0);
  const totalOwedToMe = groupReceivables.reduce((s, i) => s + i.amount, 0) + personalReceivables.reduce((s, i) => s + i.amount, 0);

  const handleMarkPaid = (id: string, amount: number) => {
    markLentMoneyPaid(id);
    updateWalletBalance(currentUserId, amount);
  };

  return (
    <div className="bg-[#0B0C0E] border-y md:border-x border-white/[0.08] rounded-none md:rounded-[32px] p-6 shadow-2xl relative flex flex-col h-full max-h-[380px]">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-full blur-[3rem] pointer-events-none"></div>
      
      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-4 border-b border-[#2a2d36] pb-2">
        <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-white flex items-center gap-1.5">
          <Handshake className="w-3.5 h-3.5 text-indigo-400" /> Debt Overview
        </h3>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex flex-col">
          <span className="text-[9px] uppercase tracking-widest font-bold text-rose-400 mb-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> You Owe</span>
          <span className="font-extrabold text-white text-sm">LKR {totalOwedByMe.toLocaleString()}</span>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex flex-col">
          <span className="text-[9px] uppercase tracking-widest font-bold text-emerald-400 mb-1 flex items-center gap-1"><ArrowDownRight className="w-3 h-3"/> Owes You</span>
          <span className="font-extrabold text-white text-sm">LKR {totalOwedToMe.toLocaleString()}</span>
        </div>
      </div>
      
      {/* List */}
      <div className="flex-1 flex flex-col gap-2 relative z-10 overflow-y-auto custom-scrollbar pr-1 max-h-[180px]">
        {allItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center bg-black/20 rounded-xl p-4 border border-dashed border-[#2a2d36]">
            <p className="text-gray-500 text-xs font-medium">No pending debts. You're all clear!</p>
          </div>
        ) : (
          allItems.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-black/20 border border-[#2a2d36] p-3 rounded-xl hover:bg-white/5 transition-colors">
              <div>
                <p className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  {item.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${
                    item.label === 'You Owe' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {item.label}
                  </span>
                  {item.type === 'personal-receivable' && (
                    <span className="text-[9px] text-gray-500 font-medium">
                      {format(new Date(item.date!), 'MMM dd')} {item.note && `• ${item.note}`}
                    </span>
                  )}
                  {(item.type === 'group-payable' || item.type === 'group-receivable') && (
                    <span className="text-[9px] text-gray-500 font-medium">(Group)</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-extrabold text-xs ${item.label === 'You Owe' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {item.amount.toLocaleString()} <span className="text-[9px]">LKR</span>
                </span>
                
                {item.type === 'personal-receivable' ? (
                  <button 
                    onClick={() => handleMarkPaid(item.originalId, item.amount)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors shrink-0"
                    title="Mark as Paid"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Link 
                    href="/finance" 
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors shrink-0"
                    title="View Details in Finance"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
