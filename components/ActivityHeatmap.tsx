"use client";

import { useAppStore } from "@/store";
import { format, subDays, startOfWeek, addDays, getDay } from "date-fns";
import { useMemo } from "react";

export function ActivityHeatmap() {
  const { completedTasksHistory = [], inventoryLogs = [], users = [] } = useAppStore();

  const heatmapData = useMemo(() => {
    // Generate the last 364 days (52 weeks * 7 days)
    const today = new Date();
    // Align to start of week (Sunday = 0, Monday = 1, etc.)
    // We want the right-most column to end on the current week.
    // GitHub typically aligns rows to days of the week.
    
    // Let's create an array of 52 weeks, each with 7 days.
    // Day 0 is Sunday, Day 6 is Saturday.
    // The very last day should be `today`. But to keep the grid aligned, we need to pad the future days of the current week with 'empty' or just calculate exactly 364 days ending on Saturday of this week.
    const endOfThisWeek = addDays(startOfWeek(today), 6);
    const startDate = subDays(endOfThisWeek, 363); // 52 weeks * 7 days = 364 days

    const dates = [];
    for (let i = 0; i < 364; i++) {
      dates.push(addDays(startDate, i));
    }

    // Process logs and tasks into a quick lookup dictionary by date string 'yyyy-MM-dd'
    const activityMap: Record<string, { level: number; tooltip: string[] }> = {};

    // 1. Process Inventory Logs (Level 3)
    inventoryLogs.forEach(log => {
      const user = users.find(u => u.id === log.userId);
      const itemText = log.itemId === 'sugar' ? 'Sugar' : 'Soap Powder';
      const msg = `${user?.name || 'Someone'} brought ${log.amountStr} ${itemText}`;
      
      if (!activityMap[log.date]) {
        activityMap[log.date] = { level: 3, tooltip: [msg] };
      } else {
        activityMap[log.date].level = 3;
        activityMap[log.date].tooltip.push(msg);
      }
    });

    // 2. Process Completed Tasks (Level 1 & 2)
    completedTasksHistory.forEach(task => {
      if (task.isCompleted && task.completedAt) {
        const dateStr = task.completedAt;
        
        let level = 1; // sweep
        if (task.type === 'mop' || task.type === 'toilet') level = 2; // mop or toilet
        
        const actualUsers = task.actualAssigneeIds?.map(id => users.find(u => u.id === id)?.name).join(' & ') || 'Someone';
        const msg = `${actualUsers} did ${task.title}`;

        if (!activityMap[dateStr]) {
          activityMap[dateStr] = { level, tooltip: [msg] };
        } else {
          // Keep the highest level (if inventory was already logged, keep level 3)
          activityMap[dateStr].level = Math.max(activityMap[dateStr].level, level);
          activityMap[dateStr].tooltip.push(msg);
        }
      }
    });

    return dates.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const isFuture = date > today;
      return {
        date,
        dateStr,
        isFuture,
        activity: activityMap[dateStr] || { level: 0, tooltip: [] }
      };
    });
  }, [completedTasksHistory, inventoryLogs, users]);

  // Transform flat array into 7 rows (one for each day of the week)
  const rows = [[], [], [], [], [], [], []] as any[][];
  heatmapData.forEach(day => {
    const dayOfWeek = getDay(day.date); // 0 (Sun) to 6 (Sat)
    rows[dayOfWeek].push(day);
  });

  const getLevelColor = (level: number) => {
    switch(level) {
      case 1: return 'bg-slate-800 border-slate-700';
      case 2: return 'bg-slate-600 border-slate-500 text-white';
      case 3: return 'bg-slate-400 border-slate-300 shadow-[0_0_8px_rgba(255,255,255,0.1)] text-black';
      default: return 'bg-white/5 border-white/10';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-extrabold text-xl tracking-tight text-white">Weekly Workload</h3>
          <p className="text-xs text-gray-400 font-medium">Household contribution heatmap</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-[#23252b] border border-[#2a2d36]"></div>
          <div className="w-3 h-3 rounded-sm bg-emerald-900 border border-emerald-800"></div>
          <div className="w-3 h-3 rounded-sm bg-emerald-600 border border-emerald-500"></div>
          <div className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
          <span>More</span>
        </div>
      </div>
      
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-2 min-w-max">
          <div className="flex flex-col gap-1.5 justify-around text-[10px] font-bold text-gray-500 uppercase pr-2 pt-4">
            <span className="h-3.5 flex items-center">Sun</span>
            <span className="h-3.5 flex items-center">Mon</span>
            <span className="h-3.5 flex items-center">Tue</span>
            <span className="h-3.5 flex items-center">Wed</span>
            <span className="h-3.5 flex items-center">Thu</span>
            <span className="h-3.5 flex items-center">Fri</span>
            <span className="h-3.5 flex items-center">Sat</span>
          </div>
          
          <div className="flex flex-col gap-1.5">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1.5">
                {row.map((cell, colIndex) => {
                  const tooltipText = cell.activity.tooltip.length > 0 
                    ? `${format(cell.date, 'MMM d, yyyy')}:\n${cell.activity.tooltip.join('\n')}`
                    : `${format(cell.date, 'MMM d, yyyy')}: No activity`;
                    
                  return (
                    <div 
                      key={`${rowIndex}-${colIndex}`}
                      title={cell.isFuture ? '' : tooltipText}
                      className={`w-3.5 h-3.5 rounded-sm border transition-all ${cell.isFuture ? 'bg-transparent border-transparent' : getLevelColor(cell.activity.level)} ${cell.isFuture ? '' : 'hover:ring-2 hover:ring-offset-1 hover:ring-emerald-400 hover:ring-offset-[#1C1E22] cursor-crosshair'}`}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
