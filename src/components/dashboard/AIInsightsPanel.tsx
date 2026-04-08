"use client";
import { useState } from "react";
import { Sparkles, Loader2, Lightbulb, AlertTriangle, Info } from "lucide-react";
import { Expense, AIInsight } from "@/types";

interface Props {
  expenses: Expense[];
}

const iconMap = {
  warning: <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />,
  info:    <Info size={14} className="text-sky-400 flex-shrink-0" />,
  tip:     <Lightbulb size={14} className="text-emerald-400 flex-shrink-0" />,
};

const bgMap = {
  warning: "bg-amber-500/10 border-amber-500/20",
  info:    "bg-sky-500/10 border-sky-500/20",
  tip:     "bg-emerald-500/10 border-emerald-500/20",
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
          expenses: expenses.map((e) => ({
            description: e.description,
            amount: e.amount,
            category: e.category,
            date: e.date,
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-400" />
          <h3 className="font-semibold text-white">AI Spending Insights</h3>
        </div>
        {!fetched && (
          <button
            onClick={fetchInsights}
            disabled={loading || expenses.length === 0}
            className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-lg px-3 py-1.5 flex items-center gap-1.5 hover:bg-emerald-500/10 transition-all disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 size={12} className="animate-spin" /> Analyzing…</>
            ) : (
              <><Sparkles size={12} /> Analyze</>
            )}
          </button>
        )}
        {fetched && (
          <button
            onClick={() => { setFetched(false); setInsights([]); fetchInsights(); }}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Refresh
          </button>
        )}
      </div>

      {!fetched && !loading && (
        <p className="text-slate-500 text-sm">
          Click &quot;Analyze&quot; to get AI-powered insights about your spending patterns.
        </p>
      )}

      {fetched && insights.length === 0 && (
        <p className="text-slate-500 text-sm">No insights available yet. Add more expenses.</p>
      )}

      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 p-3 rounded-xl border text-sm ${bgMap[insight.type]}`}
          >
            {iconMap[insight.type]}
            <span className="text-slate-300">{insight.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
