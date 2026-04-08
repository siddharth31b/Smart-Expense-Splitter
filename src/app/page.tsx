"use client";
import { useState } from "react";
import { Plus, SplitSquareHorizontal, TrendingUp, Users, Receipt } from "lucide-react";
import { GroupCard } from "@/components/groups/GroupCard";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { useGroups } from "@/hooks/useGroups";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const { groups, addGroup, removeGroup } = useGroups();
  const [showCreate, setShowCreate] = useState(false);

  const totalSpent = groups.reduce(
    (sum, g) => sum + g.expenses.reduce((s, e) => s + e.amount, 0),
    0
  );
  const totalExpenses = groups.reduce((sum, g) => sum + g.expenses.length, 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-surface-border bg-surface-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <SplitSquareHorizontal size={16} className="text-emerald-400" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">SplitWise</span>
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

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero / Stats */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-1">
            Your <span className="gradient-text">Expense Groups</span>
          </h1>
          <p className="text-slate-500">Split bills, track balances, settle debts — effortlessly.</p>

          {groups.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { icon: <Users size={18} />, label: "Groups", value: groups.length, color: "text-sky-400" },
                { icon: <Receipt size={18} />, label: "Expenses", value: totalExpenses, color: "text-violet-400" },
                { icon: <TrendingUp size={18} />, label: "Total Spent", value: formatCurrency(totalSpent), color: "text-emerald-400" },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
                  <div className={`${stat.color}`}>{stat.icon}</div>
                  <div>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                    <p className="font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <div className="glass-card p-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <SplitSquareHorizontal size={28} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No groups yet</h2>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              Create your first group for a trip, shared apartment, or any occasion where expenses are shared.
            </p>
            <button onClick={() => setShowCreate(true)} className="btn-primary mx-auto flex items-center gap-2">
              <Plus size={15} /> Create First Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
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
