"use client";

import { useAppStore } from '../store';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CalendarDays } from 'lucide-react';
import { ExpenseCategoryChart } from './ExpenseCategoryChart';
import { MonthlyFinanceTrend } from './MonthlyFinanceTrend';

export function PersonalFinanceDashboard() {
  const currentUserId = useAppStore(state => state.currentUserId);
  const transactions = useAppStore(state => state.transactions);
  
  const userExpenses = useMemo(() => {
    return transactions.filter(e => e.userId === currentUserId && e.type === 'expense');
  }, [transactions, currentUserId]);

  // Daily Expenses for Current Month
  const dailyData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const daysData: { name: string; amount: number }[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      daysData.push({ name: `${i}`, amount: 0 });
    }

    userExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
        const dayIndex = expenseDate.getDate() - 1;
        if (daysData[dayIndex]) {
          daysData[dayIndex].amount += expense.amount;
        }
      }
    });

    return daysData;
  }, [userExpenses]);

  if (transactions.filter(t => t.userId === currentUserId).length === 0) {
    return null; 
  }

  return (
    <div className="flex flex-col gap-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseCategoryChart />
        <MonthlyFinanceTrend />
      </div>

      {/* Daily Expenses Chart */}
      <div className="bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-[32px] p-6 lg:p-8 relative overflow-hidden">
        <h3 className="font-extrabold text-lg text-white mb-6 flex items-center gap-2 relative z-10">
          <CalendarDays className="w-5 h-5 text-orange-400" /> Daily Expenses (This Month)
        </h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d36" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: '#ffffff0a' }}
                contentStyle={{ backgroundColor: '#141618', borderColor: '#2a2d36', borderRadius: '16px', color: '#fff' }}
                itemStyle={{ fontWeight: 'bold' }}
                formatter={(value: any) => [`LKR ${value}`, 'Amount']}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={30}>
                {dailyData.map((entry, index) => {
                   const isToday = index + 1 === new Date().getDate();
                   return <Cell key={`cell-${index}`} fill={isToday ? "#f59e0b" : "#f97316"} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
