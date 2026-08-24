"use client";

import { Users, CreditCard, LayoutDashboard, Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight, AlertCircle, Brush, Droplets, Bath, Check, X, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { MobileAnimatedHero } from "@/components/MobileAnimatedHero";
import Link from "next/link";
import Image from "next/image";
import { useAppStore } from "@/store";
import { useMemo } from "react";
import { format } from "date-fns";
import { generateDeterministicSchedule } from "@/utils/rosterAlgorithm";
import { MiniTimetableWidget } from "@/components/MiniTimetableWidget";
import { DashboardNoticeBoard } from "@/components/DashboardNoticeBoard";
import { DailyExpenseWidget } from "@/components/DailyExpenseWidget";
import { DashboardFinanceHero } from "@/components/DashboardFinanceHero";
import { DashboardAcademicWidget } from "@/components/DashboardAcademicWidget";
import { DashboardDebtWidget } from "@/components/DashboardDebtWidget";
import nextDynamic from "next/dynamic";

const PerformanceGraph = nextDynamic(() => import("@/components/PerformanceGraph").then(mod => mod.PerformanceGraph), { 
  ssr: false, 
  loading: () => <div className="animate-pulse h-32 bg-white/5 rounded-2xl"></div> 
});

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const { 
    users = [], 
    completedTasksHistory = [], 
    currentUserId, 
    rosterConfig = { activeDays: [], tasks: [] }, 
    upcomingSwaps = [],
    updateUser,
    removeUser,
    completeTask,
    undoTaskCompletion
  } = useAppStore();
  
  const currentUser = users.find(u => u.id === currentUserId);
  
  if (!currentUser) return null;
  
  const pendingRequests = users.filter(u => u.roomId === currentUser?.roomId && u.status === 'pending_approval');

  const weeklySchedule = useMemo(() => {
    return generateDeterministicSchedule(new Date(), users, rosterConfig, completedTasksHistory, upcomingSwaps);
  }, [users, rosterConfig, completedTasksHistory, upcomingSwaps]);

  const todayName = format(new Date(), 'EEEE');
  let todaysSchedule = weeklySchedule.find(d => d.dayName === todayName);
  
  if (!todaysSchedule && weeklySchedule.length > 0) {
    todaysSchedule = weeklySchedule.find(d => d.dayName === 'Thursday');
  }
  
  const todaysTasks = todaysSchedule?.tasks || [];
  const displayDayName = todaysSchedule?.dayName || todayName;

  return (
    <div className="w-full flex flex-col pb-32 overflow-x-hidden relative">
      <MobileAnimatedHero />
      <div className="hidden md:block">
        <PageHeader 
          title="Dashboard" 
          icon={LayoutDashboard} 
          description="Overview of your boarding house activities and daily tasks."
          actionButton={<div className="w-fit"><DailyExpenseWidget /></div>}
        />
      </div>

      {currentUser.role === 'admin' && pendingRequests.length > 0 && (
        <div className="bg-amber-500/10 border-y md:border-x border-amber-500/20 md:rounded-3xl p-6 relative z-10 mb-4 w-full">
          <h2 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Pending Join Requests ({pendingRequests.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {pendingRequests.map(reqUser => (
              <div key={reqUser.id} className="bg-black/40 border border-[#2a2d36] p-4 rounded-2xl flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Image src={reqUser.avatar} alt={reqUser.name} width={40} height={40} className="rounded-full bg-[#23252b]" />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-white">{reqUser.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono">@{reqUser.username}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateUser(reqUser.id, { status: 'active' })} className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors"><Check className="w-4 h-4" /></button>
                  <button onClick={() => removeUser(reqUser.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="hidden md:block w-full sticky top-0 z-10 transition-all duration-300 shadow-2xl">
        <DashboardFinanceHero />
      </div>

      <div className="relative z-20 bg-[#0a0a0a] md:bg-transparent rounded-t-[2.5rem] md:rounded-none mt-[-3rem] md:mt-0 pt-8 pb-32 md:pb-0 px-0 md:px-0 shadow-[0_-15px_40px_rgba(0,0,0,0.5)] md:shadow-none min-h-screen flex flex-col gap-6">
      
        {/* Middle Row: Academics, Compact Duties, Timetable */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start w-full">
        {/* Academics Widget */}
        <DashboardAcademicWidget />

        {/* Compact My Task Completion */}
        <div className="bg-[#0B0C0E] border-y md:border-x border-white/[0.08] rounded-none md:rounded-[32px] p-6 shadow-2xl relative overflow-hidden h-full flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00ff9d]/10 to-blue-500/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-[2rem] pointer-events-none"></div>
          <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-white mb-4 border-b border-[#2a2d36] pb-2">My Task Completion</h3>
          <div className="flex-1 w-full relative min-h-[140px]"><PerformanceGraph /></div>
          <div className="mt-4">
             <Link href="/roster" className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest hover:text-emerald-300">View Roster &rarr;</Link>
          </div>
        </div>

        {/* Compact Today's Duties */}
        <div className="bg-[#0B0C0E] border-y md:border-x border-white/[0.08] rounded-none md:rounded-[32px] p-6 shadow-2xl relative flex flex-col h-full max-h-[350px]">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-[#00ff9d]/10 to-teal-500/5 rounded-full blur-[3rem] pointer-events-none"></div>
          <div className="relative z-10 flex justify-between items-center mb-4 border-b border-[#2a2d36] pb-2">
            <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-white">Today&apos;s Duties</h3>
            <span className="text-[9px] uppercase tracking-widest font-bold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md">{displayDayName}</span>
          </div>
          <div className="flex-1 flex flex-col gap-3 relative z-10 overflow-y-auto custom-scrollbar pr-1">
            {todaysTasks.length === 0 ? (
               <div className="flex-1 flex items-center justify-center bg-black/20 rounded-xl p-4 border border-dashed border-[#2a2d36]">
                 <p className="text-gray-500 text-xs font-medium">No duties today.</p>
               </div>
            ) : todaysTasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => {
                  if (!task.assigneeIds.includes(currentUser.id) && currentUser.role !== 'admin') return;
                  if (task.isCompleted) {
                    undoTaskCompletion(task);
                  } else {
                    completeTask(task, task.assigneeIds);
                  }
                }}
                className={`flex flex-col gap-2 p-3 rounded-xl border transition-colors cursor-pointer ${
                  task.isCompleted 
                    ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10' 
                    : 'bg-black/20 border-[#2a2d36] hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                    {task.title.includes('Sweep') ? <Brush className={`w-3.5 h-3.5 ${task.isCompleted ? 'text-emerald-500' : 'text-gray-400'}`} /> : task.title.includes('Mop') ? <Droplets className={`w-3.5 h-3.5 ${task.isCompleted ? 'text-emerald-500' : 'text-gray-400'}`} /> : <Bath className={`w-3.5 h-3.5 ${task.isCompleted ? 'text-emerald-500' : 'text-gray-400'}`} />}
                    {task.title}
                  </h4>
                  {task.isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />}
                </div>
                <div className="flex items-center -space-x-2">
                  {(task.isCompleted ? task.actualAssigneeIds : task.assigneeIds)?.map((id) => {
                    const assignee = users.find(u => u.id === id);
                    if (!assignee) return null;
                    return (
                      <div key={id} className={`w-6 h-6 rounded-full border border-[#1C1E22] overflow-hidden bg-[#23252b] ${task.isCompleted ? 'ring-1 ring-emerald-500' : ''}`}>
                        <Image src={assignee.avatar} alt={assignee.name} width={24} height={24} className="object-cover" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row: Notice Board, Timetable & Debts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start w-full">
        <div className="lg:col-span-2">
          <DashboardNoticeBoard isEditMode={false} />
        </div>
        <div className="lg:col-span-1">
          <MiniTimetableWidget isEditMode={false} />
        </div>
        <div className="lg:col-span-1">
          <DashboardDebtWidget />
        </div>
      </div>
      
      {/* End Overlap Container */}
      </div>
      
    </div>
  );
}
