"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Info,
  Lightbulb,
  Loader2,
  Sparkles,
} from "lucide-react";
import { AIInsight, Expense } from "@/types";

interface Props {
  expenses: Expense[];
}

const iconMap = {
  warning: <AlertTriangle size={14} className="flex-shrink-0 text-amber-400" />,
  info: <Info size={14} className="flex-shrink-0 text-sky-400" />,
  tip: <Lightbulb size={14} className="flex-shrink-0 text-emerald-400" />,
};

const bgMap = {
  warning: "border-amber-500/20 bg-amber-500/10",
  info: "border-sky-500/20 bg-sky-500/10",
  tip: "border-emerald-500/20 bg-emerald-500/10",
};

export function AIInsightsPanel({ expenses }: Props) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchInsights = async () => {
    if (expenses.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "insights",
          expenses: expenses.map((expense) => ({
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
          })),
        }),
      });
      const data = await res.json();
      setInsights(data.insights ?? []);
      setFetched(true);
    } catch {
      setInsights([{ type: "info", message: "Could not load insights. Try again." }]);
      setFetched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-400" />
          <h3 className="font-semibold text-white">AI Spending Insights</h3>
        </div>

        {!fetched ? (
          <button
            onClick={fetchInsights}
            disabled={loading || expenses.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-400 transition-all hover:bg-emerald-500/10 hover:text-emerald-300 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={12} />
                Analyze
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => {
              setFetched(false);
              setInsights([]);
              fetchInsights();
            }}
            disabled={loading}
            className="text-xs text-slate-400 transition-colors hover:text-white"
          >
            Refresh
          </button>
        )}
      </div>

      {!fetched && !loading && (
        <p className="text-sm text-slate-500">
          Click &quot;Analyze&quot; to get AI-powered insights about your spending patterns.
        </p>
      )}

      {fetched && insights.length === 0 && (
        <p className="text-sm text-slate-500">
          No insights available yet. Add more expenses.
        </p>
      )}

      <div className="space-y-2">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`flex items-start gap-2.5 rounded-xl border p-3 text-sm ${bgMap[insight.type]}`}
          >
            {iconMap[insight.type]}
            <span className="text-slate-300">{insight.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
