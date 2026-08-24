"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import Image from "next/image";
import { TrendingDown, TrendingUp, Handshake, Bell } from "lucide-react";
import { QuickExpenseModal } from "./QuickExpenseModal";
import { QuickIncomeModal } from "./QuickIncomeModal";
import { QuickDebtModal } from "./QuickDebtModal";

export function MobileAnimatedHero() {
  const { currentUserId, users } = useAppStore();
  const currentUser = users.find(u => u.id === currentUserId);
  const [activeModal, setActiveModal] = useState<'expense' | 'income' | 'lend' | null>(null);

  if (!currentUser) return null;

  return (
    <>
      <div className="md:hidden relative w-full pt-12 pb-24 overflow-hidden">
        {/* Gradient Overlays (Optional, kept for subtle shading) */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/10 via-transparent to-[#0a0a0a]"></div>



        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-6 mt-4 w-full">
          {/* The Avatar */}
          <div className="relative z-10 w-28 h-28 mx-auto rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-[#00ff9d] shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <div className="relative w-full h-full rounded-full border-2 border-[#0a0a0a] overflow-hidden bg-[#23252b]">
              <Image 
                src={currentUser.avatar || '/default-avatar.png'} 
                alt={currentUser.name} 
                fill
                className="object-cover"
              />
            </div>
          </div>

          <h1 className="relative z-10 text-center text-3xl font-black font-sans text-white mt-4 tracking-tight drop-shadow-md">
            {currentUser.name}
          </h1>
          
          <div className="relative z-10 flex justify-center gap-6 mt-8 w-full">
            <button 
              onClick={() => setActiveModal('expense')}
              className="flex flex-col items-center gap-2 group flex-1 max-w-[80px]"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <TrendingDown className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-bold text-white/80 group-hover:text-white text-center uppercase tracking-wider drop-shadow-md">Expense</span>
            </button>

            <button 
              onClick={() => setActiveModal('income')}
              className="flex flex-col items-center gap-2 group flex-1 max-w-[80px]"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <TrendingUp className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-bold text-white/80 group-hover:text-white text-center uppercase tracking-wider drop-shadow-md">Income</span>
            </button>

            <button 
              onClick={() => setActiveModal('lend')}
              className="flex flex-col items-center gap-2 group flex-1 max-w-[80px]"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <Handshake className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-bold text-white/80 group-hover:text-white text-center uppercase tracking-wider drop-shadow-md">Lend</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'expense' && <QuickExpenseModal isOpen={true} onClose={() => setActiveModal(null)} />}
      {activeModal === 'income' && <QuickIncomeModal isOpen={true} onClose={() => setActiveModal(null)} />}
      {activeModal === 'lend' && <QuickDebtModal isOpen={true} onClose={() => setActiveModal(null)} />}
    </>
  );
}
