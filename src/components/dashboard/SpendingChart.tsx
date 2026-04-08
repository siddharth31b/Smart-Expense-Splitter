"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Expense } from "@/types";
import { CATEGORY_META, formatCurrency } from "@/lib/utils";

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#64748b",
];

interface Props {
  expenses: Expense[];
}

export function SpendingChart({ expenses }: Props) {
  if (expenses.length === 0) return null;

  const categoryTotals = new Map<string, number>();
  expenses.forEach((expense) => {
    categoryTotals.set(
      expense.category,
      (categoryTotals.get(expense.category) ?? 0) + expense.amount
    );
  });

  const pieData = Array.from(categoryTotals.entries()).map(([category, amount]) => ({
    name: CATEGORY_META[category as keyof typeof CATEGORY_META]?.label ?? category,
    value: amount,
    emoji: CATEGORY_META[category as keyof typeof CATEGORY_META]?.emoji ?? "📦",
  }));

  const dayTotals = new Map<string, number>();
  expenses.forEach((expense) => {
    const day = expense.date.slice(0, 10);
    dayTotals.set(day, (dayTotals.get(day) ?? 0) + expense.amount);
  });

  const barData = Array.from(dayTotals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      }),
      amount,
    }));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="glass-card p-5">
        <h3 className="mb-4 font-semibold text-white">By Category</h3>
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
              contentStyle={{
                background: "#161b27",
                border: "1px solid #1e2737",
                borderRadius: 8,
                color: "#e8edf5",
              }}
              formatter={(value: number) => [formatCurrency(value), ""]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-2 space-y-1.5">
          {pieData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ background: COLORS[index % COLORS.length] }}
                />
                <span className="text-slate-400">
                  {item.emoji} {item.name}
                </span>
              </div>
              <span className="font-medium text-slate-300">
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {barData.length > 1 && (
        <div className="glass-card p-5">
          <h3 className="mb-4 font-semibold text-white">
            Daily Spending (Last 7 days)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2737" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6b7a96", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7a96", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={55}
                tickFormatter={(value) =>
                  `₹${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`
                }
              />
              <Tooltip
                contentStyle={{
                  background: "#161b27",
                  border: "1px solid #1e2737",
                  borderRadius: 8,
                  color: "#e8edf5",
                }}
                formatter={(value: number) => [formatCurrency(value), "Spent"]}
              />
              <Bar dataKey="amount" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
