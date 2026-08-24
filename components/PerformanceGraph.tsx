"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const assignedCounts = [0, 0, 0, 0];
    const completedCounts = [0, 0, 0, 0];

    // Generate schedule for dates covering the entire month
    const datesToQuery = [];
    for (let d = 1; d <= daysInMonth; d += 7) {
      datesToQuery.push(new Date(currentYear, currentMonth, d));
    }
    datesToQuery.push(new Date(currentYear, currentMonth, daysInMonth));

    const processedTaskIds = new Set<string>();

    datesToQuery.forEach(date => {
      const schedule = generateDeterministicSchedule(date, users, rosterConfig, completedTasksHistory, upcomingSwaps || []);
      
      schedule.forEach(day => {
        day.tasks.forEach(task => {
          if (processedTaskIds.has(task.id)) return;
          processedTaskIds.add(task.id);
          
          const dateMatch = task.id.match(/\d{4}-\d{2}-\d{2}$/);
          if (dateMatch) {
            const [y, m, d] = dateMatch[0].split('-');
            const taskDate = new Date(Number(y), Number(m)-1, Number(d));
            
            // Only care about tasks in the current month
            if (taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear) {
              const dayOfMonth = taskDate.getDate();
              // Bin 0 (W1): 1-7, Bin 1 (W2): 8-14, Bin 2 (W3): 15-21, Bin 3 (W4): 22+
              const binIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 3);
              
              if (task.assigneeIds.includes(currentUser.id)) {
                assignedCounts[binIndex]++;
              }
            }
          }
        });
      });
    });

    completedTasksHistory.forEach(task => {
      if (task.actualAssigneeIds?.includes(currentUser.id)) {
        const dateMatch = task.id.match(/\d{4}-\d{2}-\d{2}$/);
        if (dateMatch) {
          const [y, m, d] = dateMatch[0].split('-');
          const taskDate = new Date(Number(y), Number(m)-1, Number(d));
          if (taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear) {
            const dayOfMonth = taskDate.getDate();
            const binIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 3);
            completedCounts[binIndex]++;
          }
        }
      }
    });

    return [0, 1, 2, 3].map(i => {
      const assigned = assignedCounts[i];
      const completed = completedCounts[i];
      const percentage = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
      return {
        name: `W${i + 1}`,
        assigned,
        completed,
        percentage
      };
    });
  }, [currentUser, completedTasksHistory, rosterConfig, users, upcomingSwaps]);

  if (!isMounted || !currentUser) return null;

  return (
    <div className="w-full h-full min-h-[160px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff9d" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#00ff9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }} 
            dy={10}
          />
          <YAxis hide={true} domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#141618', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff', fontWeight: 500, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            itemStyle={{ color: '#fff' }}
            cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          
          <Area 
            type="monotone" 
            dataKey="percentage" 
            stroke="#00ff9d" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCompleted)" 
            name="Completion %"
            activeDot={{ r: 6, fill: '#00ff9d', stroke: '#141618', strokeWidth: 2, style: { filter: 'drop-shadow(0 0 8px rgba(0,255,157,0.3))' } }}
          />

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
