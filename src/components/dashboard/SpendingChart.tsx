"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Expense } from "@/types";
import { CATEGORY_META, formatCurrency } from "@/lib/utils";

const COLORS = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#64748b"];

interface Props {
  expenses: Expense[];
}

export function SpendingChart({ expenses }: Props) {
  if (expenses.length === 0) return null;

  // Category breakdown
  const catMap = new Map<string, number>();
  expenses.forEach((e) => {
    catMap.set(e.category, (catMap.get(e.category) ?? 0) + e.amount);
  });
  const pieData = Array.from(catMap.entries()).map(([cat, amount]) => ({
    name: CATEGORY_META[cat as keyof typeof CATEGORY_META]?.label ?? cat,
    value: amount,
    emoji: CATEGORY_META[cat as keyof typeof CATEGORY_META]?.emoji ?? "📦",
  }));

  // Daily spending
  const dayMap = new Map<string, number>();
  expenses.forEach((e) => {
    const day = e.date.slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + e.amount);
  });
  const barData = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      amount,
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Pie chart */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4">By Category</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#161b27", border: "1px solid #1e2737", borderRadius: 8, color: "#e8edf5" }}
              formatter={(val: number) => [formatCurrency(val), ""]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-1.5 mt-2">
          {pieData.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-slate-400">{item.emoji} {item.name}</span>
              </div>
              <span className="text-slate-300 font-medium">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      {barData.length > 1 && (
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">Daily Spending (Last 7 days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2737" />
              <XAxis dataKey="date" tick={{ fill: "#6b7a96", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7a96", fontSize: 11 }} axisLine={false} tickLine={false} width={55}
                tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`}
              />
              <Tooltip
                contentStyle={{ background: "#161b27", border: "1px solid #1e2737", borderRadius: 8, color: "#e8edf5" }}
                formatter={(val: number) => [formatCurrency(val), "Spent"]}
              />
              <Bar dataKey="amount" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
