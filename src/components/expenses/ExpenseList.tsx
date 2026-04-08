"use client";

import { useState } from "react";
import { Expense, Member } from "@/types";
import { CATEGORY_META, formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, Trash2, Receipt, SlidersHorizontal } from "lucide-react";

interface Props {
  expenses: Expense[];
  members: Member[];
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, members, onDelete }: Props) {
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "highest" | "lowest">(
    "recent"
  );
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const memberMap = Object.fromEntries(members.map((member) => [member.id, member]));

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
        <Receipt size={32} className="mx-auto mb-3 text-slate-600" />
        <p className="font-medium text-slate-400">No expenses yet</p>
        <p className="mt-1 text-sm text-slate-600">
          Add your first expense to get started
        </p>
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
            className="glass-card group/item flex items-center gap-4 p-4 transition-all hover:border-slate-600/50"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl">
              {meta.emoji}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-medium text-white">
                  {expense.description}
                </span>
                {expense.aiCategorized && (
                  <Sparkles size={12} className="flex-shrink-0 text-emerald-400" />
                )}
                <Badge variant="muted">{meta.label}</Badge>
              </div>

              <div className="mt-1 flex items-center gap-2">
                {payer && (
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                    {payer.name}
                  </span>
                )}
                <span className="text-xs text-slate-500">
                  {(payer?.name ?? "Unknown")} paid · {formatDate(expense.date)} ·{" "}
                  {expense.splitType === "equal" ? "Split equally" : "Custom split"}
                </span>
              </div>
            </div>

            <div className="flex-shrink-0 text-right">
              <p className="font-bold text-white">{formatCurrency(expense.amount)}</p>
              <p className="text-xs text-slate-500">{splitSummary}</p>
            </div>

            <button
              onClick={() => onDelete(expense.id)}
              className="flex-shrink-0 rounded-lg p-2 text-slate-500 opacity-0 transition-all group-hover/item:opacity-100 hover:bg-red-500/20 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
