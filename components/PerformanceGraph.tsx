"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { ComposedChart, Area, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '@/store';
import { getISOWeek, startOfMonth, addWeeks } from 'date-fns';

import { generateDeterministicSchedule } from '@/utils/rosterAlgorithm';

export function PerformanceGraph() {
  const { currentUserId, completedTasksHistory = [], rosterConfig = { activeDays: [], tasks: [] }, users = [], upcomingSwaps = [] } = useAppStore();
  const currentUser = users.find(u => u.id === currentUserId);
  if (!currentUser) return null;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const data = useMemo(() => {
    if (!currentUser) return [];

    const today = new Date();
    const monthStart = startOfMonth(today);
    const weeksData = [];

    for (let i = 0; i < 4; i++) {
      const weekDate = addWeeks(monthStart, i);
      const weekNum = getISOWeek(weekDate);
      
      const pastHistory = completedTasksHistory.filter(t => t.completedAt && new Date(t.completedAt) < weekDate);
      const schedule = generateDeterministicSchedule(weekDate, users, rosterConfig, pastHistory, upcomingSwaps || []);
      
      let assignedCount = 0;
      schedule.forEach(day => {
        day.tasks.forEach(task => {
          if (task.assigneeIds.includes(currentUser.id)) {
            assignedCount++;
          }
        });
      });

      let completedCount = 0;
      completedTasksHistory.forEach(task => {
        if (task.actualAssigneeIds?.includes(currentUser.id) && task.completedAt) {
           const taskDate = new Date(task.completedAt);
           if (getISOWeek(taskDate) === weekNum) {
             completedCount++;
           }
        }
      });

      weeksData.push({
        name: `W${i + 1}`,
        assigned: assignedCount,
        completed: completedCount
      });
    }

    return weeksData;
  }, [currentUser, completedTasksHistory, rosterConfig, users, upcomingSwaps]);

  if (!isMounted || !currentUser) return null;

  return (
    <div className="w-full h-full min-h-[160px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e2e8f0" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#e2e8f0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }} 
            dy={10}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#141618', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff', fontWeight: 500, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            itemStyle={{ color: '#fff' }}
            cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          
          <Area 
            type="monotone" 
            dataKey="completed" 
            stroke="#e2e8f0" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCompleted)" 
            name="Completed"
            activeDot={{ r: 6, fill: '#e2e8f0', stroke: '#141618', strokeWidth: 2, style: { filter: 'drop-shadow(0 0 8px rgba(226,232,240,0.3))' } }}
          />
          <Line 
            type="monotone" 
            dataKey="assigned" 
            stroke="#64748b" 
            strokeDasharray="3 3" 
            strokeWidth={2}
            dot={false}
            name="Assigned"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
