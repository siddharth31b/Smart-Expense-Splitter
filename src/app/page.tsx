"use client";

import { useState } from "react";
import { Plus, Receipt, SplitSquareHorizontal, TrendingUp, Users } from "lucide-react";
import { GroupCard } from "@/components/groups/GroupCard";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { useGroups } from "@/hooks/useGroups";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const { groups, addGroup, removeGroup } = useGroups();
  const [showCreate, setShowCreate] = useState(false);

  const totalSpent = groups.reduce(
    (sum, group) =>
      sum + group.expenses.reduce((expenseSum, expense) => expenseSum + expense.amount, 0),
    0
  );
  const totalExpenses = groups.reduce((sum, group) => sum + group.expenses.length, 0);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-surface-border bg-surface-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/20">
              <SplitSquareHorizontal size={16} className="text-emerald-400" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">SplitWise</span>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={15} />
            New Group
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="mb-1 text-3xl font-bold text-white">
            Your <span className="gradient-text">Expense Groups</span>
          </h1>
          <p className="text-slate-500">
            Split bills, track balances, and settle debts with a clean local-first workflow.
          </p>

          {groups.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Users size={18} />,
                  label: "Groups",
                  value: groups.length,
                  color: "text-sky-400",
                },
                {
                  icon: <Receipt size={18} />,
                  label: "Expenses",
                  value: totalExpenses,
                  color: "text-violet-400",
                },
                {
                  icon: <TrendingUp size={18} />,
                  label: "Total Spent",
                  value: formatCurrency(totalSpent),
                  color: "text-emerald-400",
                },
              ].map((stat) => (
                <div key={stat.label} className="glass-card flex items-center gap-3 p-4">
                  <div className={stat.color}>{stat.icon}</div>
                  <div>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                    <p className="font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {groups.length === 0 ? (
          <div className="glass-card animate-fade-in p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <SplitSquareHorizontal size={28} className="text-emerald-400" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-white">No groups yet</h2>
            <p className="mx-auto mb-6 max-w-sm text-slate-500">
              Create your first group for a trip, shared apartment, team outing, or any
              shared spending situation.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary mx-auto flex items-center gap-2"
            >
              <Plus size={15} />
              Create First Group
            </button>
          </div>
        ) : (
          <div className="animate-fade-in grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} onDelete={removeGroup} />
            ))}
          </div>
        )}
      </main>

      <CreateGroupModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={addGroup}
      />
    </div>
  );
}
