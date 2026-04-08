"use client";

import { MemberBalance } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  balances: MemberBalance[];
}

export function BalanceCard({ balances }: Props) {
  return (
    <div className="glass-card p-5">
      <h3 className="mb-4 font-semibold text-white">Member Balances</h3>
      <div className="space-y-3">
        {balances.map((balance) => {
          const isPositive = balance.netBalance > 0.01;
          const isNegative = balance.netBalance < -0.01;

          return (
            <div key={balance.memberId} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1">
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                    {balance.memberName}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Paid {formatCurrency(balance.totalPaid)} · Owed{" "}
                  {formatCurrency(balance.totalOwed)}
                </p>
                {(balance.settlementsPaid > 0 || balance.settlementsReceived > 0) && (
                  <p className="text-xs text-slate-600">
                    Settled {formatCurrency(balance.settlementsPaid)} out · Received{" "}
                    {formatCurrency(balance.settlementsReceived)}
                  </p>
                )}
              </div>

              <div className="flex flex-shrink-0 items-center gap-2 text-right">
                {isPositive ? (
                  <TrendingUp size={14} className="text-emerald-400" />
                ) : isNegative ? (
                  <TrendingDown size={14} className="text-red-400" />
                ) : (
                  <Minus size={14} className="text-slate-500" />
                )}
                <div>
                  <p
                    className={`text-sm font-bold ${
                      isPositive
                        ? "text-emerald-400"
                        : isNegative
                          ? "text-red-400"
                          : "text-slate-500"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {formatCurrency(balance.netBalance)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isPositive ? "gets back" : isNegative ? "owes" : "settled"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
