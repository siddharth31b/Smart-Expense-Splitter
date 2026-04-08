"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  CreditCard,
  Plus,
  Receipt,
  SplitSquareHorizontal,
  UserPlus,
  Users,
} from "lucide-react";
import { AddExpenseModal } from "@/components/expenses/AddExpenseModal";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { AddMemberModal } from "@/components/groups/AddMemberModal";
import { BalanceCard } from "@/components/settlements/BalanceCard";
import { SettlementList } from "@/components/settlements/SettlementList";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { AIInsightsPanel } from "@/components/dashboard/AIInsightsPanel";
import { useGroups } from "@/hooks/useGroups";
import { calculateBalances, calculateSettlements } from "@/lib/calculations";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Settlement } from "@/types";

type Tab = "expenses" | "balances" | "analytics";

interface PageProps {
  params: { id: string };
}

export default function GroupPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const { groups, addExpense, removeExpense, addMember, recordSettlement } =
    useGroups();

  const [activeTab, setActiveTab] = useState<Tab>("expenses");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const group = groups.find((entry) => entry.id === id);

  useEffect(() => {
    if (groups.length > 0 && !group) {
      router.push("/");
    }
  }, [group, groups, router]);

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  const balances = calculateBalances(group);
  const settlements = calculateSettlements(balances);
  const totalSpent = group.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const outstandingTotal = settlements.reduce(
    (sum, settlement) => sum + settlement.amount,
    0
  );

  const handleSettle = (settlement: Settlement) => {
    recordSettlement(group.id, {
      id: uuidv4(),
      from: settlement.from,
      fromName: settlement.fromName,
      to: settlement.to,
      toName: settlement.toName,
      amount: settlement.amount,
      date: new Date().toISOString(),
      note: "Marked as settled from the balances tab",
    });
  };

  const tabs = [
    { id: "expenses" as Tab, label: "Expenses", icon: <Receipt size={14} /> },
    { id: "balances" as Tab, label: "Balances", icon: <CreditCard size={14} /> },
    { id: "analytics" as Tab, label: "Analytics", icon: <BarChart3 size={14} /> },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-surface-border bg-surface-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/20">
                <SplitSquareHorizontal size={16} className="text-emerald-400" />
              </div>
              <span className="text-lg font-bold text-white">SplitWise</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddMember(true)}
              className="rounded-xl border border-surface-border px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-emerald-500/40 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <UserPlus size={15} />
                Add Member
              </span>
            </button>

            <button
              onClick={() => setShowAddExpense(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={15} />
              Add Expense
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <div className="glass-card p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                <Users size={24} className="text-emerald-400" />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{group.name}</h1>
                {group.description && (
                  <p className="text-sm text-slate-500">{group.description}</p>
                )}

                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <div className="flex flex-wrap gap-2">
                    {group.members.map((member) => (
                      <span
                        key={member.id}
                        className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300"
                      >
                        {member.name}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">
                    {group.members.map((member) => member.name).join(", ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-surface-border bg-surface p-4">
                <p className="text-xs text-slate-500">Total Spent</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {formatCurrency(totalSpent)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Since {formatDate(group.createdAt)}
                </p>
              </div>

              <div className="rounded-2xl border border-surface-border bg-surface p-4">
                <p className="text-xs text-slate-500">Outstanding</p>
                <p className="mt-1 text-xl font-bold text-amber-400">
                  {formatCurrency(outstandingTotal)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {settlements.length} suggested payments left
                </p>
              </div>

              <div className="rounded-2xl border border-surface-border bg-surface p-4">
                <p className="text-xs text-slate-500">Members & Settlements</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {group.members.length} / {group.settlementsHistory.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Members / completed settlements
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 rounded-xl bg-surface-card p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "expenses" && (
          <ExpenseList
            expenses={group.expenses}
            members={group.members}
            onDelete={(expenseId) => removeExpense(group.id, expenseId)}
          />
        )}

        {activeTab === "balances" && (
          <>
            <BalanceCard balances={balances} />
            <SettlementList
              settlements={settlements}
              history={group.settlementsHistory}
              onSettle={handleSettle}
            />
          </>
        )}

        {activeTab === "analytics" && (
          <>
            <SpendingChart expenses={group.expenses} />
            <AIInsightsPanel expenses={group.expenses} />
          </>
        )}
      </main>

      <AddExpenseModal
        open={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        group={group}
        onAdded={(expense) => addExpense(group.id, expense)}
      />

      <AddMemberModal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        group={group}
        onAdded={(member) => addMember(group.id, member)}
      />
    </div>
  );
}
