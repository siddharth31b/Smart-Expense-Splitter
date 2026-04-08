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
      className="glass-card group/card relative cursor-pointer p-5 transition-all duration-200 hover:border-emerald-500/30"
      onClick={() => router.push(`/groups/${group.id}`)}
    >
      <button
        onClick={(event) => {
          event.stopPropagation();
          onDelete(group.id);
        }}
        className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 opacity-0 transition-all group-hover/card:opacity-100 hover:bg-red-500/20 hover:text-red-400"
      >
        <Trash2 size={14} />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
          <Users size={22} className="text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-white">{group.name}</h3>
          {group.description && (
            <p className="mt-0.5 truncate text-xs text-slate-500">{group.description}</p>
          )}
          <div className="mt-2 flex items-center gap-3">
            <span className="text-xs text-slate-400">
              <span className="font-medium text-white">{group.members.length}</span> members
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Receipt size={11} />
              <span className="font-medium text-white">{group.expenses.length}</span> expenses
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-surface-border pt-4">
        <div>
          <p className="text-xs text-slate-500">Total Spent</p>
          <p className="text-base font-bold text-white">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="flex items-center gap-2">
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
