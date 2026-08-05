"use client";

import { ArrowRight, CheckCircle2, Star, AlertCircle, Brush, Droplets, Bath } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAppStore } from "@/store";
import { useMemo } from "react";
import { format } from "date-fns";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { BoardingFeeTracker } from "@/components/BoardingFeeTracker";
import { generateDeterministicSchedule } from "@/utils/rosterAlgorithm";
import { IconMapper } from "@/components/IconMapper";
import { PerformanceGraph } from "@/components/PerformanceGraph";
import { CursorSpotlightCard } from "@/components/CursorSpotlightCard";
import { useCountUp } from "@/hooks/useCountUp";

export default function Dashboard() {
  const { users, inventoryItems, inventoryLogs, p2pDebts, completedTasksHistory, currentUserId, rosterConfig, upcomingSwaps } = useAppStore();
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const weeklySchedule = useMemo(() => {
    return generateDeterministicSchedule(new Date(), users, rosterConfig, completedTasksHistory, upcomingSwaps);
  }, [users, rosterConfig, completedTasksHistory, upcomingSwaps]);

  const currentMonthIdx = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const boardingFees = useAppStore(state => state.boardingFees);
  const isCurrentFeePaid = currentUser ? (boardingFees[currentYear]?.[currentMonthIdx]?.[currentUser.id] || false) : false;



  const todayName = format(new Date(), 'EEEE');
  let todaysSchedule = weeklySchedule.find(d => d.dayName === todayName);
  
  if (!todaysSchedule && weeklySchedule.length > 0) {
    todaysSchedule = weeklySchedule.find(d => d.dayName === 'Thursday');
  }
  
  const todaysTasks = todaysSchedule?.tasks || [];
  const displayDayName = todaysSchedule?.dayName || todayName;

  const userOwesDebts = p2pDebts.filter(d => d.borrowerId === currentUser?.id);
  const pendingDebtsSum = userOwesDebts.reduce((sum, d) => sum + d.amount, 0);
  const animatedPendingDebtsSum = useCountUp(pendingDebtsSum);

  const inventoryAlerts = inventoryItems.map(item => {
    const cycleInfo = useAppStore.getState().inventoryCycles[item.id] || { currentCycle: 1, userProgress: {}, userDebts: {} };
    
    let completedCount = 0;
    let nextInLineId = users[0]?.id;
    let minProgress = Infinity;
    let userOwes = false;

    users.forEach(u => {
      const p = cycleInfo.userProgress[u.id] || 0;
      const d = cycleInfo.userDebts[u.id] || 0;
      const req = item.quota + d;
      
      if (p >= req) {
        completedCount++;
      } else {
        if (p < minProgress) {
          minProgress = p;
          nextInLineId = u.id;
        }
      }
      
      if (u.id === currentUser?.id && d > 0) {
        userOwes = true;
      }
    });

    return {
      id: item.id,
      name: item.name,
      icon: item.icon,
      color: item.color,
      currentCycle: cycleInfo.currentCycle,
      completedCount,
      nextInLineId,
      userOwes
    };
  });

  // Calculate Monthly Stats
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthlyStats = users.map(user => {
    let sweep = 0; let mop = 0; let toilet = 0;
    completedTasksHistory.forEach(task => {
      if (task.completedAt?.startsWith(currentMonth) && task.actualAssigneeIds?.includes(user.id)) {
        if (task.type === 'sweep') sweep++;
        if (task.type === 'mop') mop++;
        if (task.type === 'toilet') toilet++;
      }
    });
    return { user, sweep, mop, toilet, total: sweep + mop + toilet };
  }).sort((a, b) => b.total - a.total);
  
  const topPerformerId = monthlyStats[0]?.total > 0 ? monthlyStats[0].user.id : null;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Page Header (Moved from Topbar) */}
      <div className="flex flex-col mb-2">
        <h2 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{format(new Date(), "EEEE, MMMM do, yyyy")}</h2>
        <h1 className="text-3xl md:text-4xl font-bold text-white mt-1 tracking-tight">
          Morning, {currentUser?.name}
        </h1>
      </div>

      {/* Bento Grid Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#181a1f] to-[#181a1f] rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-emerald-500/5 relative overflow-hidden flex flex-col justify-center min-h-[240px] border border-[#2a2d36] stagger-1">
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-emerald-500/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 h-full">
            {/* Left Column: Greeting */}
            <div className="flex flex-col justify-between md:w-1/2">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-[10px] uppercase tracking-widest font-extrabold text-white">
                    Quick Overview
                  </h2>
                </div>
                
                <p className="text-gray-300 max-w-sm text-lg font-medium mb-4">
                  Let&apos;s check today&apos;s tasks. Don&apos;t forget to update the inventory if you bought something!
                </p>

                {/* Boarding Fee Indicator (Read-Only) */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm w-fit ${
                  isCurrentFeePaid 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                    : 'bg-[#ff5a5a]/20 text-[#ff5a5a] border-[#ff5a5a]/50'
                }`}>
                  {isCurrentFeePaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-[#ff5a5a] animate-pulse"></div>}
                  <span className="uppercase tracking-widest text-[10px]">{format(new Date(), 'MMMM yyyy')}: {isCurrentFeePaid ? 'PAID' : 'PENDING'}</span>
                </div>
              </div>
              <div className="mt-6 md:mt-8">
                <Link href="/roster" className="inline-flex items-center gap-2 bg-emerald-500 text-black hover:bg-emerald-400 transition-all duration-300 px-5 py-2.5 rounded-2xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  View Full Roster <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: Performance Graph */}
            <div className="md:w-1/2 flex flex-col border-t md:border-t-0 md:border-l border-[#2a2d36] pt-6 md:pt-0 md:pl-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-white">My Task Completion</h3>
              </div>
              <div className="flex-1 w-full relative min-h-[160px]">
                <PerformanceGraph />
              </div>
            </div>
          </div>
        </div>
        
        {/* Monthly Performance */}
        <div className="bg-[#181a1f] rounded-3xl p-6 md:p-8 border border-[#2a2d36] shadow-md flex flex-col min-h-[240px] stagger-2">
          <div className="flex justify-between items-center mb-4 border-b border-[#2a2d36] pb-2">
            <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-white">Monthly Performance</h3>
            <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">{format(new Date(), 'MMMM')}</span>
          </div>
          
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2">
            {monthlyStats.map((stat, idx) => {
              const isTop = stat.user.id === topPerformerId;
              return (
                <div key={stat.user.id} className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-colors ${isTop ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/20 border-[#2a2d36] hover:bg-white/5'}`}>
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#23252b] border border-[#2a2d36] shrink-0">
                    <Image src={stat.user.avatar} alt={stat.user.name} fill className="object-cover" />
                    {isTop && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#1C1E22] text-[10px] shadow-[0_0_8px_rgba(16,185,129,0.5)]"><Star className="w-3 h-3 text-black fill-black"/></div>}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className={`font-bold text-sm truncate ${isTop ? 'text-emerald-400' : 'text-white'}`}>
                      {stat.user.name}
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1"><Brush className="w-3 h-3" /> {stat.sweep}</span>
                      <span className="flex items-center gap-1"><Droplets className="w-3 h-3" /> {stat.mop}</span>
                      <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {stat.toilet}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Second Row of Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[350px]">
        {/* Today's Duties Card */}
        <div className="lg:col-span-1 bg-[#181a1f] rounded-3xl p-6 md:p-8 border border-[#2a2d36] shadow-md flex flex-col stagger-3">
          <div className="flex justify-between items-center mb-8 border-b border-[#2a2d36] pb-4">
            <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-white">Today&apos;s Duties</h3>
            <span className="text-[10px] uppercase tracking-widest font-bold bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-xl border border-emerald-500/20 shadow-sm">
              {displayDayName}
            </span>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            {todaysTasks.length === 0 ? (
               <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#2a2d36] rounded-2xl bg-black/20 p-6">
                 <p className="text-gray-400 text-sm font-medium">No duties assigned for today. Enjoy your day off!</p>
               </div>
            ) : todaysTasks.map((task) => (
              <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-black/20 border border-[#2a2d36] hover:bg-white/5 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#23252b] shadow-sm border border-[#2a2d36] flex items-center justify-center shrink-0">
                    <span className="text-gray-300">
                      {task.title.includes('Sweep') ? <Brush className="w-6 h-6" /> : task.title.includes('Mop') ? <Droplets className="w-6 h-6" /> : <Bath className="w-6 h-6" />}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-sm">{task.title}</h4>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5 font-bold">
                      {task.isCompleted ? 'Completed' : 'Assigned today'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center -space-x-3">
                  {(task.isCompleted ? task.actualAssigneeIds : task.assigneeIds)?.map((id) => {
                    const assignee = users.find(u => u.id === id);
                    if (!assignee) return null;
                    return (
                      <div key={id} className={`w-10 h-10 rounded-full border-2 border-[#1C1E22] shadow-sm overflow-hidden bg-[#23252b] relative group ${task.isCompleted ? 'ring-2 ring-emerald-500' : ''}`}>
                        <Image src={assignee.avatar} alt={assignee.name} width={40} height={40} className="object-cover" />
                      </div>
                    );
                  })}
                  {task.isCompleted && (
                     <div className="w-10 h-10 rounded-full border-2 border-[#1C1E22] shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-emerald-500 flex items-center justify-center z-10">
                       <CheckCircle2 className="w-5 h-5 text-black" />
                     </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary Card */}
        <div className="bg-[#181a1f] rounded-3xl p-6 md:p-8 border border-[#2a2d36] shadow-md flex flex-col stagger-4">
          <div className="flex justify-between items-center mb-8 border-b border-[#2a2d36] pb-4">
            <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-white">My Debts</h3>
            {pendingDebtsSum > 0 ? (
              <span className="text-[10px] uppercase tracking-widest font-bold bg-[#ff5a5a]/10 text-red-400 px-3 py-1 rounded-full border border-[#ff5a5a]/20 animate-pulse shadow-[0_0_10px_rgba(248,113,113,0.2)]">LKR <span className="font-mono text-sm">{animatedPendingDebtsSum}</span></span>
            ) : (
              <span className="text-[10px] uppercase tracking-widest font-bold bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">All Settled</span>
            )}
          </div>
          
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
            {userOwesDebts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#2a2d36] rounded-2xl bg-black/20 p-6">
                <p className="text-gray-400 text-sm font-medium text-center">You have no pending debts. Great job!</p>
              </div>
            ) : (
              userOwesDebts.map(debt => {
                const creditor = users.find(u => u.id === debt.payerId);
                return (
                  <div key={debt.id} className="bg-red-500/5 text-red-400 p-4 rounded-2xl border border-[#ff5a5a]/20 flex flex-col gap-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff5a5a]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-red-300">You owe {creditor?.name}</h4>
                    </div>
                    <div className="flex items-center justify-between mt-1 z-10">
                      <span className="text-[10px] uppercase tracking-widest font-bold bg-black/40 px-2 py-1 rounded shadow-sm text-red-300 backdrop-blur-sm">{debt.description}</span>
                      <span className="font-mono font-bold text-lg tracking-tight text-red-400">LKR {debt.amount}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Inventory Alerts Card */}
        <div className="bg-[#181a1f] rounded-3xl p-6 md:p-8 border border-[#2a2d36] shadow-md flex flex-col stagger-5">
          <div className="flex justify-between items-center mb-8 border-b border-[#2a2d36] pb-4">
            <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-white">Inventory Alerts</h3>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            {inventoryAlerts.map((item) => {
              const nextPerson = users.find(u => u.id === item.nextInLineId);
              
              return (
                <CursorSpotlightCard key={item.id} className="flex flex-col gap-3 p-4 rounded-2xl bg-black/20 border border-[#2a2d36]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-[#2a2d36] bg-[#23252b] text-emerald-400`}>
                        <IconMapper iconStr={item.icon || item.id} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm uppercase tracking-wider">{item.name}</h4>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Cycle <span className="font-mono">{item.currentCycle}</span> • <span className="font-mono">{item.completedCount}/6</span></p>
                      </div>
                    </div>
                  </div>
                  
                  {item.userOwes && (
                    <div className="bg-[#ff5a5a]/10 text-red-400 px-3 py-2 rounded-xl border border-[#ff5a5a]/20 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> You owe {item.name} this cycle!
                    </div>
                  )}

                  <div className="bg-[#23252b] p-2.5 rounded-xl border border-[#2a2d36] flex items-center justify-between mt-1 shadow-sm">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Next in queue:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-white">{nextPerson?.name}</span>
                      <div className="w-6 h-6 rounded-full border border-[#2a2d36] overflow-hidden bg-black/50">
                        {nextPerson && (
                          <Image src={nextPerson.avatar} alt={nextPerson.name} width={24} height={24} />
                        )}
                      </div>
                    </div>
                  </div>
                </CursorSpotlightCard>
              )
            })}
          </div>
        </div>
      </div>

      {/* Boarding Fee Heatmap (Read-Only) */}
      <div className="stagger-5"><BoardingFeeTracker isReadOnly={true} /></div>

      {/* Activity Heatmap Row */}
      <div className="bg-[#181a1f] rounded-3xl p-6 md:p-8 border border-[#2a2d36] shadow-md flex flex-col w-full overflow-hidden stagger-5">
        <ActivityHeatmap />
      </div>
    </div>
  );
}
