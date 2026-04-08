"use client";
import { Group } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, Receipt, ArrowRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  group: Group;
  onDelete: (id: string) => void;
}

export function GroupCard({ group, onDelete }: Props) {
  const router = useRouter();
  const totalExpenses = group.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div
      className="glass-card p-5 cursor-pointer hover:border-emerald-500/30 transition-all duration-200 group/card relative"
      onClick={() => router.push(`/groups/${group.id}`)}
    >
      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(group.id); }}
        className="absolute top-4 right-4 p-1.5 rounded-lg opacity-0 group-hover/card:opacity-100 hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
      >
        <Trash2 size={14} />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <Users size={22} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{group.name}</h3>
          {group.description && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{group.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-slate-400">
              <span className="text-white font-medium">{group.members.length}</span> members
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Receipt size={11} />
              <span className="text-white font-medium">{group.expenses.length}</span> expenses
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-surface-border flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Total Spent</p>
          <p className="text-base font-bold text-white">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{formatDate(group.createdAt)}</span>
          <ArrowRight size={16} className="text-emerald-400 group-hover/card:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
