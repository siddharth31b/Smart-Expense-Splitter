"use client";

import { ArrowRight, CheckCircle2, PartyPopper } from "lucide-react";
import { Settlement, SettlementRecord } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MemberChip } from "@/components/ui/MemberChip";

interface Props {
  settlements: Settlement[];
  history?: SettlementRecord[];
  onSettle?: (settlement: Settlement) => void;
}

export function SettlementList({ settlements, history = [], onSettle }: Props) {
  if (settlements.length === 0 && history.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <PartyPopper size={28} className="mx-auto mb-2 text-emerald-400" />
        <p className="font-semibold text-emerald-400">All settled up!</p>
        <p className="mt-1 text-sm text-slate-500">
          No outstanding balances in this group.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-5">
        <h3 className="mb-4 font-semibold text-white">Suggested Settlements</h3>
        {settlements.length === 0 ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            Outstanding balances are currently settled.
          </div>
        ) : (
          <div className="space-y-3">
            {settlements.map((settlement, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-xl border border-surface-border bg-white/[0.03] p-3 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <MemberChip name={settlement.fromName} />
                    <ArrowRight size={13} className="flex-shrink-0 text-slate-500" />
                    <MemberChip name={settlement.toName} tone="blue" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Payment to settle debt</p>
                </div>

                <div className="flex-shrink-0 text-left sm:ml-2 sm:text-right">
                  <p className="font-bold text-amber-400">
                    {formatCurrency(settlement.amount)}
                  </p>
                </div>

                {onSettle && (
                  <button
                    onClick={() => onSettle(settlement)}
                    className="flex w-full items-center justify-center rounded-lg border border-surface-border px-3 py-2 text-slate-400 transition-all hover:bg-emerald-500/10 hover:text-emerald-400 sm:ml-2 sm:w-auto sm:border-transparent sm:px-2 sm:py-2"
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
                  className="flex flex-col gap-2 rounded-xl border border-surface-border bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">
                      {settlement.fromName} paid {settlement.toName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(settlement.date)}
                      {settlement.note ? ` • ${settlement.note}` : ""}
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
