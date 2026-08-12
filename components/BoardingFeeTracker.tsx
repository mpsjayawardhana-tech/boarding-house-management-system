"use client";

import { useAppStore } from "@/store";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

export function BoardingFeeTracker({ isReadOnly = false }: { isReadOnly?: boolean }) {
  const { users = [], boardingFees = {}, toggleBoardingFee, currentUserId } = useAppStore();
  const currentUser = users.find(u => u.id === currentUserId);
  const currentUserRole = currentUser?.role;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMonthEl = document.getElementById('current-month-col');
    if (currentMonthEl && scrollContainerRef.current) {
      // Small timeout ensures layout is fully painted before scrolling
      setTimeout(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const scrollLeft = currentMonthEl.offsetLeft - container.offsetWidth / 2 + currentMonthEl.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }, 100);
    }
  }, []);

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[2rem] p-6 md:p-8 shadow-2xl flex flex-col gap-6 w-full hover:bg-[#1A1D20] hover:border-white/[0.15] transition-all duration-300">
      <div className="flex justify-between items-center border-b border-[#2a2d36] pb-4">
        <div>
          <h3 className="font-extrabold text-xl tracking-tight text-white">
            {isReadOnly ? 'Boarding Fee Overview' : 'Boarding Fee Tracker'} ({currentYear})
          </h3>
          <p className="text-xs text-gray-400 font-medium">12-month payment overview</p>
        </div>
      </div>
      
      <div className="overflow-x-auto pb-4" ref={scrollContainerRef}>
        <div className="min-w-max">
          {/* Header Row */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-48 shrink-0"></div> {/* Spacer for user column */}
            {months.map((m, i) => (
              <div 
                key={m} 
                id={i === currentMonth ? 'current-month-col' : undefined}
                className={`w-10 text-center text-[10px] font-bold uppercase tracking-wider ${i === currentMonth ? 'text-emerald-400' : 'text-gray-500'}`}
              >
                {m}
              </div>
            ))}
          </div>
          
          {/* User Rows */}
          <div className="flex flex-col gap-4">
            {users.filter(u => u.isActive !== false).map(user => {
              
              const canEdit = currentUserRole === 'admin' || user.id === currentUserId;
              const disableRow = !isReadOnly && !canEdit;

              return (
                <div key={user.id} className={`flex items-center gap-2 ${disableRow ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="w-48 flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#23252b] border border-[#2a2d36]">
                      <Image src={user.avatar} alt={user.name} width={32} height={32} />
                    </div>
                    <span className="font-bold text-sm text-white truncate">{user.name}</span>
                  </div>
                  
                  {/* 12 Months Heatmap Squares Column */}
                  <div className="flex items-center gap-2">
                    {months.map((_, monthIndex) => {
                      const isPaid = boardingFees[currentYear]?.[monthIndex]?.[user.id] || false;
                      
                      return (
                        <button
                          key={monthIndex}
                          onClick={(isReadOnly || disableRow) ? undefined : () => toggleBoardingFee(user.id, currentYear, monthIndex)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border shrink-0 ${
                            isPaid 
                              ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] text-black' 
                              : monthIndex === currentMonth 
                                ? `bg-emerald-500/10 border-emerald-500/30 ${!isReadOnly && !disableRow && 'hover:bg-emerald-500/20'}`
                                : `bg-[#23252b] border-[#2a2d36] ${!isReadOnly && !disableRow && 'hover:bg-white/5'}`
                          } ${(isReadOnly || disableRow) ? 'cursor-default' : 'cursor-pointer'}`}
                          title={`${user.name} - ${months[monthIndex]} ${isPaid ? 'Paid' : 'Unpaid'}`}
                          disabled={isReadOnly || disableRow}
                        >
                          {isPaid && <CheckCircle2 className="w-5 h-5 text-black" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
