"use client";

import { useAppStore } from '../store';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { IndianRupee, PieChart as PieChartIcon } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  "Food": "#10b981", 
  "Transport": "#3b82f6", 
  "Academic": "#f59e0b", 
  "Rent": "#8b5cf6", 
  "Medical": "#ef4444",
  "Entertainment": "#ec4899", 
  "Other": "#64748b",
  // Old categories for backward compatibility
  "Food & Meals": "#10b981", 
  "Academic & Printings": "#f59e0b", 
  "Boarding/Rent": "#8b5cf6", 
};

export function ExpenseCategoryChart() {
  const currentUserId = useAppStore(state => state.currentUserId);
  const transactions = useAppStore(state => state.transactions);
  
  const userExpenses = useMemo(() => {
    return transactions.filter(e => e.userId === currentUserId && e.type === 'expense');
  }, [transactions, currentUserId]);

  const currentMonthData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const categoryTotals: Record<string, number> = {};
    let total = 0;

    userExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        total += expense.amount;
      }
    });

    const data = Object.keys(categoryTotals).map(cat => ({
      name: cat,
      value: categoryTotals[cat]
    })).sort((a, b) => b.value - a.value);

    return { data, total };
  }, [userExpenses]);

  if (userExpenses.length === 0) return null;

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = payload[0].value;
      const percentage = currentMonthData.total > 0 ? ((value / currentMonthData.total) * 100).toFixed(1) : '0.0';
      
      return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg shadow-black/20 flex flex-col gap-3 min-w-[180px]">
          <p className="font-extrabold text-white text-sm border-b border-white/10 pb-2">{data.name}</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400 text-xs font-bold uppercase">Total</span>
              <span className="font-extrabold text-indigo-400">LKR {value}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400 text-xs font-bold uppercase">Portion</span>
              <span className="font-extrabold text-emerald-400">{percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#141618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-[32px] p-6 lg:p-8 relative overflow-hidden h-fit">
      <h3 className="font-extrabold text-lg text-white mb-6 flex items-center gap-2 relative z-10">
        <PieChartIcon className="w-5 h-5 text-indigo-400" /> Current Month Breakdown
      </h3>
      
      {currentMonthData.total > 0 ? (
        <div className="h-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={currentMonthData.data}
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {currentMonthData.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS["Other"]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#9ca3af' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total</span>
            <span className="text-xl font-extrabold text-white">LKR {currentMonthData.total}</span>
          </div>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-center">
           <IndianRupee className="w-10 h-10 text-gray-600 mb-2" />
           <p className="text-sm font-bold text-gray-400">No expenses this month</p>
        </div>
      )}
    </div>
  );
}
