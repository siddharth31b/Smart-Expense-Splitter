import {
  Group,
  MemberBalance,
  Settlement,
  GroupSummary,
  ExpenseCategory,
} from "@/types";

// ─── Balance Calculation ──────────────────────────────────────────────────────

export function calculateBalances(group: Group): MemberBalance[] {
  const map = new Map<string, MemberBalance>();

  // initialise every member
  for (const member of group.members) {
    map.set(member.id, {
      memberId: member.id,
      memberName: member.name,
      totalPaid: 0,
      totalOwed: 0,
      settlementsPaid: 0,
      settlementsReceived: 0,
      netBalance: 0,
    });
  }

  for (const expense of group.expenses) {
    // payer gets credit
    const payer = map.get(expense.paidBy);
    if (payer) {
      payer.totalPaid += expense.amount;
    }

    // each split member owes their portion
    for (const split of expense.splits) {
      const debtor = map.get(split.memberId);
      if (debtor) {
        debtor.totalOwed += split.amount;
      }
    }
  }

  for (const settlement of group.settlementsHistory) {
    const debtor = map.get(settlement.from);
    if (debtor) {
      debtor.settlementsPaid += settlement.amount;
    }

    const creditor = map.get(settlement.to);
    if (creditor) {
      creditor.settlementsReceived += settlement.amount;
    }
  }

  // compute net balance
  for (const balance of Array.from(map.values())) {
    balance.netBalance =
      balance.totalPaid +
      balance.settlementsPaid -
      balance.totalOwed -
      balance.settlementsReceived;
  }

  return Array.from(map.values());
}

// ─── Minimum Transactions Settlement Algorithm ────────────────────────────────

export function calculateSettlements(balances: MemberBalance[]): Settlement[] {
  const settlements: Settlement[] = [];

  // Deep-copy so we don't mutate
  const creditors = balances
    .filter((b) => b.netBalance > 0.005)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.netBalance - a.netBalance);

  const debtors = balances
    .filter((b) => b.netBalance < -0.005)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.netBalance - b.netBalance);

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];
    const amount = Math.min(creditor.netBalance, -debtor.netBalance);

    if (amount > 0.005) {
      settlements.push({
        from: debtor.memberId,
        fromName: debtor.memberName,
        to: creditor.memberId,
        toName: creditor.memberName,
        amount: Math.round(amount * 100) / 100,
      });
    }

    creditor.netBalance -= amount;
    debtor.netBalance += amount;

    if (Math.abs(creditor.netBalance) < 0.005) ci++;
    if (Math.abs(debtor.netBalance) < 0.005) di++;
  }

  return settlements;
}

// ─── Category Breakdown ───────────────────────────────────────────────────────

export function getCategoryBreakdown(
  group: Group
): { category: ExpenseCategory; amount: number }[] {
  const map = new Map<ExpenseCategory, number>();
  for (const expense of group.expenses) {
    map.set(expense.category, (map.get(expense.category) ?? 0) + expense.amount);
  }
  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

// ─── Full Group Summary ───────────────────────────────────────────────────────

export function getGroupSummary(group: Group): GroupSummary {
  const balances = calculateBalances(group);
  const settlements = calculateSettlements(balances);
  const categoryBreakdown = getCategoryBreakdown(group);
  const totalExpenses = group.expenses.reduce((sum, e) => sum + e.amount, 0);

  return { group, balances, settlements, totalExpenses, categoryBreakdown };
}
