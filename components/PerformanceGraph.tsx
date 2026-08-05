"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { ComposedChart, Area, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '@/store';
import { getISOWeek, startOfMonth, addWeeks } from 'date-fns';

import { generateDeterministicSchedule } from '@/utils/rosterAlgorithm';

export function PerformanceGraph() {
  const { currentUserId, completedTasksHistory, rosterConfig, users, upcomingSwaps } = useAppStore();
  const currentUser = users.find(u => u.id === currentUserId) || users[0];
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
              <stop offset="5%" stopColor="#00ff9d" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#00ff9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8b92a5', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-space-mono)' }} 
            dy={10}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1A1C1E', borderColor: '#00ff9d', borderRadius: '12px', boxShadow: '0 0 15px rgba(0,255,157,0.15)', color: '#fff', fontWeight: 600, fontFamily: 'var(--font-space-mono)' }}
            itemStyle={{ color: '#fff' }}
            cursor={{ stroke: '#2a2d36', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          
          <Area 
            type="monotone" 
            dataKey="completed" 
            stroke="#00ff9d" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCompleted)" 
            name="Completed"
            activeDot={{ r: 6, fill: '#00ff9d', stroke: '#1A1C1E', strokeWidth: 2, style: { filter: 'drop-shadow(0 0 8px rgba(0,255,157,0.8))' } }}
          />
          <Line 
            type="monotone" 
            dataKey="assigned" 
            stroke="#8b92a5" 
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
