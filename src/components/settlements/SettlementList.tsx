"use client";
import { Settlement, SettlementRecord } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowRight, CheckCircle2, PartyPopper } from "lucide-react";

interface Props {
  settlements: Settlement[];
  history?: SettlementRecord[];
  onSettle?: (settlement: Settlement) => void;
}

export function SettlementList({ settlements, history = [], onSettle }: Props) {
  if (settlements.length === 0 && history.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <PartyPopper size={28} className="mx-auto text-emerald-400 mb-2" />
        <p className="text-emerald-400 font-semibold">All settled up!</p>
        <p className="text-slate-500 text-sm mt-1">No outstanding balances in this group.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4">Suggested Settlements</h3>
        {settlements.length === 0 ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            Outstanding balances are currently settled.
          </div>
        ) : (
          <div className="space-y-3">
            {settlements.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-surface-border bg-white/[0.03] p-3"
              >
                <Avatar name={s.fromName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{s.fromName}</span>
                    <ArrowRight size={13} className="text-slate-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-white truncate">{s.toName}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Payment to settle debt</p>
                </div>
                <Avatar name={s.toName} size="md" />
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-bold text-amber-400">{formatCurrency(s.amount)}</p>
                </div>
                {onSettle && (
                  <button
                    onClick={() => onSettle(s)}
                    className="ml-2 p-2 rounded-lg hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-400 transition-all flex-shrink-0"
                    title="Mark as settled"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="mb-4 font-semibold text-white">Recent Settlements</h3>
          <div className="space-y-3">
            {[...history]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 6)
              .map((settlement) => (
                <div
                  key={settlement.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-white/[0.03] p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">
                      {settlement.fromName} paid {settlement.toName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(settlement.date)}
                      {settlement.note ? ` · ${settlement.note}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">
                    {formatCurrency(settlement.amount)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
