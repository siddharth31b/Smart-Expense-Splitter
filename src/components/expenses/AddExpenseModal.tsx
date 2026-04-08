"use client";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Group, Expense, ExpenseCategory, SplitType, ExpenseSplit } from "@/types";
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

  // AI categorize on description blur
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
      // silent fail
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
      return group.members.map((m, i) => ({
        memberId: m.id,
        amount: i === group.members.length - 1
          ? Math.round((total - each * (group.members.length - 1)) * 100) / 100
          : each,
      }));
    }
    return group.members.map((m) => ({
      memberId: m.id,
      amount: parseFloat(customSplits[m.id] ?? "0") || 0,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    if (!description.trim()) { setError("Description is required."); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount."); return; }
    if (!paidBy) { setError("Select who paid."); return; }

    const splits = buildSplits();
    const splitsTotal = splits.reduce((s, sp) => s + sp.amount, 0);
    if (Math.abs(splitsTotal - amt) > 0.05) {
      setError(`Split total (₹${splitsTotal.toFixed(2)}) must equal amount (₹${amt.toFixed(2)}).`);
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
          amount: amt,
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
      if (!res.ok) { setError(data.error ?? "Failed to add expense."); return; }
      onAdded(data.expense);
      // Reset form
      setDescription(""); setAmount(""); setCategory("other");
      setPaidBy(group.members[0]?.id ?? ""); setSplitType("equal");
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
        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Description *
            {aiLoading && <Loader2 size={11} className="inline ml-2 animate-spin text-emerald-400" />}
            {aiCategorized && !aiLoading && (
              <span className="ml-2 text-emerald-400 text-xs flex items-center gap-1 inline-flex">
                <Sparkles size={11} /> AI categorized
              </span>
            )}
          </label>
          <input
            className="input-dark"
            placeholder="e.g. Dinner at Pizza Hut"
            value={description}
            onChange={(e) => { setDescription(e.target.value); setAiCategorized(false); }}
            onBlur={handleDescriptionBlur}
          />
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount (₹) *</label>
            <input
              className="input-dark"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (splitType === "custom" && Object.keys(customSplits).length === 0) {
                  setCustomSplits(buildDefaultCustomSplits(e.target.value));
                }
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Date</label>
            <input
              className="input-dark"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ colorScheme: "dark" }}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
          <div className="grid grid-cols-4 gap-1.5">
            {ALL_CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setAiCategorized(false); }}
                  className={`p-2 rounded-lg border text-center text-xs transition-all ${
                    category === cat
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                      : "border-surface-border bg-surface hover:border-slate-600 text-slate-400"
                  }`}
                >
                  <div className="text-base mb-0.5">{meta.emoji}</div>
                  <div className="truncate">{meta.label.split(" ")[0]}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Paid By */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Paid By *</label>
          <select
            className="input-dark"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            style={{ colorScheme: "dark" }}
          >
            {group.members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Split Type */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Split</label>
          <div className="flex gap-2 mb-3">
            {(["equal", "custom"] as SplitType[]).map((t) => (
              <button
                key={t}
                onClick={() => handleSplitTypeChange(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  splitType === t
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-surface-border text-slate-400 hover:border-slate-600"
                }`}
              >
                {t === "equal" ? "⚖️ Equal" : "✏️ Custom"}
              </button>
            ))}
          </div>

          {splitType === "custom" && (
            <div className="space-y-2">
              <div className="rounded-xl border border-surface-border bg-surface p-3 text-xs text-slate-400">
                Assigned {customSplitTotal.toFixed(2)} of {(parseFloat(amount) || 0).toFixed(2)}
              </div>
              {group.members.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <span className="text-sm text-slate-300 w-28 truncate">{m.name}</span>
                  <input
                    className="input-dark"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={customSplits[m.id] ?? ""}
                    onChange={(e) =>
                      setCustomSplits((s) => ({ ...s, [m.id]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-surface-border text-slate-400 hover:text-white text-sm font-medium transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
            {loading ? "Adding…" : "Add Expense"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
