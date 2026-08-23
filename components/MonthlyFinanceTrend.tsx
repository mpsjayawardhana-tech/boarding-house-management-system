"use client";

import { useAppStore } from '../store';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

export function MonthlyFinanceTrend() {
  const currentUserId = useAppStore(state => state.currentUserId);
  const transactions = useAppStore(state => state.transactions);
  
  // Last 6 Months Trend (Income vs Expense)
  const trendData = useMemo(() => {
    const now = new Date();
    const monthsData: { name: string; income: number; expense: number; year: number; month: number }[] = [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthsData.push({
        name: monthNames[d.getMonth()],
        income: 0,
        expense: 0,
        year: d.getFullYear(),
        month: d.getMonth()
      });
    }

    transactions.forEach(t => {
      if (t.userId !== currentUserId) return;
      
      const tDate = new Date(t.date);
      const m = tDate.getMonth();
      const y = tDate.getFullYear();
      
      const targetMonth = monthsData.find(md => md.month === m && md.year === y);
      if (targetMonth) {
        if (t.type === 'income') {
          targetMonth.income += t.amount;
        } else {
          targetMonth.expense += t.amount;
        }
      }
    });

    return monthsData;
  }, [transactions, currentUserId]);

  if (transactions.filter(t => t.userId === currentUserId).length === 0) return null;

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg shadow-black/20 rounded-xl p-6 lg:p-8 relative overflow-hidden h-fit">
      <h3 className="font-extrabold text-lg text-white mb-6 flex items-center gap-2 relative z-10">
        <TrendingUp className="w-5 h-5 text-emerald-400" /> Income vs Expense (6 Months)
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d36" vertical={false} />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{ fill: '#ffffff0a' }}
              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff' }}
              itemStyle={{ fontWeight: 'bold' }}
              formatter={(value: any) => [`LKR ${Number(value)}`, 'Amount']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#9ca3af' }}
            />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="expense" name="Expense" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
