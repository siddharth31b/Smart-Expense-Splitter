"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  Expense,
  ExpenseCategory,
  ExpenseSplit,
  Group,
  SplitType,
} from "@/types";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  group: Group;
  onAdded: (expense: Expense) => void;
}

export function AddExpenseModal({ open, onClose, group, onAdded }: Props) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [paidBy, setPaidBy] = useState(group.members[0]?.id ?? "");
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiCategorized, setAiCategorized] = useState(false);

  const buildDefaultCustomSplits = (nextAmount: string) => {
    const total = parseFloat(nextAmount);
    const perPerson =
      total > 0 ? (total / Math.max(group.members.length, 1)).toFixed(2) : "";

    const nextSplits: Record<string, string> = {};
    group.members.forEach((member) => {
      nextSplits[member.id] = perPerson;
    });

    return nextSplits;
  };

  const handleDescriptionBlur = async () => {
    if (!description.trim() || description.length < 3) return;
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "categorize", description }),
      });
      const data = await res.json();
      if (data.category && data.confidence > 0.4) {
        setCategory(data.category);
        setAiCategorized(true);
      }
    } catch {
      // Silent fallback keeps the expense flow lightweight.
    } finally {
      setAiLoading(false);
    }
  };

  const handleSplitTypeChange = (nextType: SplitType) => {
    setSplitType(nextType);
    if (nextType === "custom" && Object.keys(customSplits).length === 0) {
      setCustomSplits(buildDefaultCustomSplits(amount));
    }
  };

  const customSplitTotal = group.members.reduce(
    (sum, member) => sum + (parseFloat(customSplits[member.id] ?? "0") || 0),
    0
  );

  const buildSplits = (): ExpenseSplit[] => {
    const total = parseFloat(amount);

    if (splitType === "equal") {
      const each = Math.round((total / group.members.length) * 100) / 100;
      return group.members.map((member, index) => ({
        memberId: member.id,
        amount:
          index === group.members.length - 1
            ? Math.round((total - each * (group.members.length - 1)) * 100) / 100
            : each,
      }));
    }

    return group.members.map((member) => ({
      memberId: member.id,
      amount: parseFloat(customSplits[member.id] ?? "0") || 0,
    }));
  };

  const handleSubmit = async () => {
    setError("");

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (!paidBy) {
      setError("Select who paid.");
      return;
    }

    const splits = buildSplits();
    const splitsTotal = splits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(splitsTotal - parsedAmount) > 0.05) {
      setError(
        `Split total (INR ${splitsTotal.toFixed(2)}) must equal amount (INR ${parsedAmount.toFixed(2)}).`
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group.id,
          description,
          amount: parsedAmount,
          currency: "INR",
          category,
          paidBy,
          splitType,
          splits,
          date: new Date(date).toISOString(),
          aiCategorized,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to add expense.");
        return;
      }

      onAdded(data.expense);
      setDescription("");
      setAmount("");
      setCategory("other");
      setPaidBy(group.members[0]?.id ?? "");
      setSplitType("equal");
      setCustomSplits({});
      setDate(new Date().toISOString().slice(0, 10));
      setAiCategorized(false);
      onClose();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Expense" size="md">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">
            Description *
            {aiLoading && (
              <Loader2 size={11} className="ml-2 inline animate-spin text-emerald-400" />
            )}
            {aiCategorized && !aiLoading && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-400">
                <Sparkles size={11} />
                AI categorized
              </span>
            )}
          </label>
          <input
            className="input-dark"
            placeholder="e.g. Dinner at Pizza Hut"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setAiCategorized(false);
            }}
            onBlur={handleDescriptionBlur}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Amount (INR) *
            </label>
            <input
              className="input-dark"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                if (splitType === "custom" && Object.keys(customSplits).length === 0) {
                  setCustomSplits(buildDefaultCustomSplits(event.target.value));
                }
              }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Date</label>
            <input
              className="input-dark"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              style={{ colorScheme: "dark" }}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Category</label>
          <div className="grid grid-cols-4 gap-1.5">
            {ALL_CATEGORIES.map((currentCategory) => {
              const meta = CATEGORY_META[currentCategory];
              return (
                <button
                  key={currentCategory}
                  onClick={() => {
                    setCategory(currentCategory);
                    setAiCategorized(false);
                  }}
                  className={`rounded-lg border p-2 text-center text-xs transition-all ${
                    category === currentCategory
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                      : "border-surface-border bg-surface text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <div className="mb-0.5 text-base">{meta.emoji}</div>
                  <div className="truncate">{meta.label.split(" ")[0]}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Paid By *</label>
          <select
            className="input-dark"
            value={paidBy}
            onChange={(event) => setPaidBy(event.target.value)}
            style={{ colorScheme: "dark" }}
          >
            {group.members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-slate-400">Split</label>
          <div className="mb-3 flex gap-2">
            {(["equal", "custom"] as SplitType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleSplitTypeChange(type)}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all ${
                  splitType === type
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-surface-border text-slate-400 hover:border-slate-600"
                }`}
              >
                {type === "equal" ? "Equal" : "Custom"}
              </button>
            ))}
          </div>

          {splitType === "custom" && (
            <div className="space-y-2">
              <div className="rounded-xl border border-surface-border bg-surface p-3 text-xs text-slate-400">
                Assigned {customSplitTotal.toFixed(2)} of{" "}
                {(parseFloat(amount) || 0).toFixed(2)}
              </div>
              {group.members.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <span className="w-28 truncate text-sm text-slate-300">
                    {member.name}
                  </span>
                  <input
                    className="input-dark"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={customSplits[member.id] ?? ""}
                    onChange={(event) =>
                      setCustomSplits((current) => ({
                        ...current,
                        [member.id]: event.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-surface-border py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
            {loading ? "Adding..." : "Add Expense"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
