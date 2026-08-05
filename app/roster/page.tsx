"use client";

import { useAppStore } from "@/store";
import { CheckCircle2, Users, Brush, Droplets, Bath } from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";
import { generateDeterministicSchedule, calculateHistoricalBalances } from "@/utils/rosterAlgorithm";

export default function RosterPage() {
  const { users, rosterConfig, completedTasksHistory, upcomingSwaps, completeTask, undoTaskCompletion } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const historicalBalances = useMemo(() => calculateHistoricalBalances(users, completedTasksHistory), [users, completedTasksHistory]);

  const weeklySchedule = useMemo(() => {
    return generateDeterministicSchedule(new Date(), users, rosterConfig, completedTasksHistory, upcomingSwaps);
  }, [users, rosterConfig, completedTasksHistory, upcomingSwaps]);

  const handleComplete = (task: any, actualAssignees: string[]) => {
    completeTask(task, actualAssignees);
    setSelectedTask(null);
  };

  const sortedUsers = [...users].sort((a, b) => (historicalBalances[a.id] || 0) - (historicalBalances[b.id] || 0));

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Weekly Roster</h1>
          <p className="text-muted-foreground mt-1">Mathematically fair deterministic scheduling for the active week.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Leaderboard Panel */}
        <div className="lg:col-span-1 bg-[#181a1f] rounded-3xl p-6 border border-[#2a2d36] shadow-md flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-[#2a2d36] pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight text-white">Fairness Balance</h3>
              <p className="text-xs text-gray-400 font-medium">Who owes tasks?</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            {sortedUsers.map(user => {
              const balance = historicalBalances[user.id] || 0;
              return (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-[#2a2d36]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#23252b] border border-[#2a2d36] shadow-sm">
                      <Image src={user.avatar} alt={user.name} width={32} height={32} />
                    </div>
                    <span className="font-bold text-sm text-white">{user.name}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold ${balance < 0 ? 'bg-[#ff5a5a]/10 text-red-400 border border-[#ff5a5a]/20' : balance > 0 ? 'bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/30' : 'bg-[#23252b] text-gray-400 border border-[#2a2d36]'}`}>
                    {balance < 0 ? `Debt: ${balance} Tasks` : balance > 0 ? `Surplus: +${balance} Tasks` : 'Balanced'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {weeklySchedule.length === 0 ? (
            <div className="md:col-span-2 flex flex-col items-center justify-center p-12 bg-[#181a1f] rounded-3xl border border-[#2a2d36] shadow-sm border-dashed">
              <p className="text-lg font-medium text-gray-400 mb-4">No active schedule for this week.</p>
              <p className="text-sm text-gray-400">Add active days in the Settings.</p>
            </div>
          ) : (
            weeklySchedule.map((day) => (
              <div key={day.dayName} className="bg-[#181a1f] rounded-3xl p-6 border border-[#2a2d36] shadow-md flex flex-col gap-4 relative overflow-hidden">
                <div className="flex justify-between items-center border-b border-[#2a2d36] pb-4">
                  <h3 className="font-extrabold text-xl tracking-tight text-white">{day.dayName}</h3>
                  <span className="text-xs font-bold bg-[#23252b] text-gray-400 px-3 py-1 rounded-full border border-[#2a2d36]">{day.tasks.length} Tasks</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  {day.tasks.map(task => (
                    <div key={task.id} className={`flex flex-col gap-3 p-4 rounded-2xl border ${task.isCompleted ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#1A1C1E] border-[#2a2d36]'} transition-colors shadow-sm`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="bg-[#121415] p-2 rounded-lg border border-[#2a2d36]">
                            {task.type === 'sweep' ? <Brush size={16} className="text-[#00ff9d]" /> : task.type === 'mop' ? <Droplets size={16} className="text-[#00ff9d]" /> : <Bath size={16} className="text-[#00ff9d]" />}
                          </span>
                          <span className={`font-mono uppercase tracking-widest text-[10px] font-bold ${task.isCompleted ? 'text-[#00ff9d]' : 'text-white'}`}>{task.title}</span>
                        </div>
                        {task.isCompleted && (
                          <span className="text-[#00ff9d] font-mono uppercase tracking-widest bg-emerald-500/10 border border-[#00ff9d]/30 px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3 h-3" /> DONE
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center -space-x-2">
                          {(task.isCompleted ? task.actualAssigneeIds : task.assigneeIds)?.map(id => {
                            const u = users.find(u => u.id === id);
                            return u ? (
                              <div key={id} className={`w-8 h-8 rounded-full border-2 border-[#1A1C1E] shadow-sm overflow-hidden bg-[#23252b] ${task.isCompleted ? 'ring-1 ring-[#00ff9d]' : ''}`} title={u.name}>
                                <Image src={u.avatar} alt={u.name} width={32} height={32} />
                              </div>
                            ) : null;
                          })}
                        </div>
                        
                        {!task.isCompleted ? (
                          <button 
                            onClick={() => setSelectedTask({...task, assignees: [...task.assigneeIds]})}
                            className="text-[10px] uppercase tracking-widest font-bold bg-[#121415] text-white border border-[#2a2d36] hover:text-[#00ff9d] hover:border-[#00ff9d] hover:shadow-[0_0_10px_rgba(0,255,157,0.3)] px-3 py-1.5 rounded-lg shadow-sm transition-all"
                          >
                            Mark Done
                          </button>
                        ) : (
                          <button 
                            onClick={() => undoTaskCompletion(task)}
                            className="text-xs font-bold bg-[#23252b] border border-[#2a2d36] text-red-400 hover:bg-red-500/20 hover:border-[#ff5a5a]/30 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                          >
                            Undo
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mark as Done Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#181a1f] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-[#2a2d36] animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-extrabold mb-2 text-white">Complete Task</h2>
            <p className="text-gray-400 text-sm mb-6">Who actually completed this duty? (Select all that apply to trigger fairness swaps if someone else covered).</p>
            
            <div className="flex flex-col gap-2 mb-8">
              {users.map(u => {
                const isSelected = selectedTask.assignees.includes(u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSelectedTask((prev: any) => {
                        if(!prev) return prev;
                        const has = prev.assignees.includes(u.id);
                        return {
                          ...prev,
                          assignees: has ? prev.assignees.filter((id: string) => id !== u.id) : [...prev.assignees, u.id]
                        };
                      });
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isSelected ? 'bg-emerald-500/10 border-emerald-500/30 shadow-sm' : 'bg-[#23252b] border-[#2a2d36] hover:bg-white/5'}`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-black/50 border border-[#2a2d36]">
                      <Image src={u.avatar} alt={u.name} width={32} height={32} />
                    </div>
                    <span className={`font-bold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>{u.name}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto shadow-[0_0_8px_rgba(16,185,129,0.5)] rounded-full" />}
                  </button>
                )
              })}
            </div>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setSelectedTask(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-[#23252b] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleComplete(selectedTask, selectedTask.assignees)}
                disabled={selectedTask.assignees.length === 0}
                className="px-5 py-2.5 rounded-xl font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
