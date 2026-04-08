"use client";
import { useState } from "react";
import { Expense, Member } from "@/types";
import { CATEGORY_META, formatCurrency, formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, Trash2, Receipt, SlidersHorizontal } from "lucide-react";

interface Props {
  expenses: Expense[];
  members: Member[];
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, members, onDelete }: Props) {
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "highest" | "lowest">("recent");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));
  const visibleExpenses = [...expenses]
    .filter((expense) => {
      const expenseDate = expense.date.slice(0, 10);
      if (fromDate && expenseDate < fromDate) return false;
      if (toDate && expenseDate > toDate) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }

      if (sortBy === "highest") {
        return b.amount - a.amount;
      }

      if (sortBy === "lowest") {
        return a.amount - b.amount;
      }

      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  if (expenses.length === 0) {
    return (
      <div className="glass-card p-10 text-center">
        <Receipt size={32} className="mx-auto text-slate-600 mb-3" />
        <p className="text-slate-400 font-medium">No expenses yet</p>
        <p className="text-slate-600 text-sm mt-1">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Expense History</h3>
          <span className="text-xs text-slate-500">
            {visibleExpenses.length} of {expenses.length} shown
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Sort</label>
            <select
              className="input-dark"
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value as "recent" | "oldest" | "highest" | "lowest"
                )
              }
              style={{ colorScheme: "dark" }}
            >
              <option value="recent">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Amount high to low</option>
              <option value="lowest">Amount low to high</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">From</label>
            <input
              className="input-dark"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              style={{ colorScheme: "dark" }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">To</label>
            <input
              className="input-dark"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              style={{ colorScheme: "dark" }}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSortBy("recent");
                setFromDate("");
                setToDate("");
              }}
              className="w-full rounded-xl border border-surface-border py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {visibleExpenses.length === 0 && (
        <div className="glass-card p-8 text-center">
          <p className="text-sm font-medium text-white">No expenses match these filters</p>
          <p className="mt-1 text-sm text-slate-500">
            Try widening the date range or resetting the sort and filters.
          </p>
        </div>
      )}

      {visibleExpenses.map((expense) => {
        const meta = CATEGORY_META[expense.category];
        const payer = memberMap[expense.paidBy];
        const splitSummary =
          expense.splitType === "equal"
            ? `${formatCurrency(expense.amount / Math.max(members.length, 1))} each`
            : `${expense.splits.length} custom shares`;

        return (
          <div
            key={expense.id}
            className="glass-card p-4 flex items-center gap-4 hover:border-slate-600/50 transition-all group/item"
          >
            {/* Category icon */}
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
              {meta.emoji}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-white text-sm truncate">{expense.description}</span>
                {expense.aiCategorized && (
                  <Sparkles size={12} className="text-emerald-400 flex-shrink-0" />
                )}
                <Badge variant="muted">{meta.label}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {payer && <Avatar name={payer.name} size="sm" />}
                <span className="text-xs text-slate-500">
                  {payer?.name ?? "Unknown"} paid · {formatDate(expense.date)} ·{" "}
                  {expense.splitType === "equal" ? "Split equally" : "Custom split"}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-white">{formatCurrency(expense.amount)}</p>
              <p className="text-xs text-slate-500">{splitSummary}</p>
            </div>

            {/* Delete */}
            <button
              onClick={() => onDelete(expense.id)}
              className="p-2 opacity-0 group-hover/item:opacity-100 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-all flex-shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
