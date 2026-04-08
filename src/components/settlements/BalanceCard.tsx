"use client";
import { MemberBalance } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  balances: MemberBalance[];
}

export function BalanceCard({ balances }: Props) {
  return (
    <div className="glass-card p-5">
      <h3 className="font-semibold text-white mb-4">Member Balances</h3>
      <div className="space-y-3">
        {balances.map((b) => {
          const isPositive = b.netBalance > 0.01;
          const isNegative = b.netBalance < -0.01;
          return (
            <div key={b.memberId} className="flex items-center gap-3">
              <Avatar name={b.memberName} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{b.memberName}</p>
                <p className="text-xs text-slate-500">
                  Paid {formatCurrency(b.totalPaid)} · Owed {formatCurrency(b.totalOwed)}
                </p>
                {(b.settlementsPaid > 0 || b.settlementsReceived > 0) && (
                  <p className="text-xs text-slate-600">
                    Settled {formatCurrency(b.settlementsPaid)} out · Received{" "}
                    {formatCurrency(b.settlementsReceived)}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0 flex items-center gap-2">
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
                    {formatCurrency(b.netBalance)}
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
