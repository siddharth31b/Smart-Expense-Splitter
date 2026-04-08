"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Receipt, Trash2, Users } from "lucide-react";
import { Group } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  group: Group;
  onDelete: (id: string) => void;
}

export function GroupCard({ group, onDelete }: Props) {
  const router = useRouter();
  const totalExpenses = group.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div
      className="glass-card group/card relative cursor-pointer p-4 transition-all duration-200 hover:border-emerald-500/30 sm:p-5"
      onClick={() => router.push(`/groups/${group.id}`)}
    >
      <button
        onClick={(event) => {
          event.stopPropagation();
          onDelete(group.id);
        }}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500 opacity-100 transition-all hover:bg-red-500/20 hover:text-red-400 sm:right-4 sm:top-4 sm:opacity-0 sm:group-hover/card:opacity-100"
      >
        <Trash2 size={14} />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
          <Users size={22} className="text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1 pr-8 sm:pr-10">
          <h3 className="truncate font-semibold text-white">{group.name}</h3>
          {group.description && (
            <p className="mt-0.5 truncate text-xs text-slate-500">{group.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs text-slate-400">
              <span className="font-medium text-white">{group.members.length}</span> members
            </span>
            <span className="text-slate-600">/</span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Receipt size={11} />
              <span className="font-medium text-white">{group.expenses.length}</span> expenses
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-surface-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">Total Spent</p>
          <p className="text-base font-bold text-white">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <span className="text-xs text-slate-500">{formatDate(group.createdAt)}</span>
          <ArrowRight
            size={16}
            className="text-emerald-400 transition-transform group-hover/card:translate-x-1"
          />
        </div>
      </div>
    </div>
  );
}
