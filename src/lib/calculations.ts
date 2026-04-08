import { Group, MemberBalance, Settlement } from "@/types";

export function calculateBalances(group: Group): MemberBalance[] {
  const balances = new Map<string, MemberBalance>();

  for (const member of group.members) {
    balances.set(member.id, {
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
    const payer = balances.get(expense.paidBy);
    if (payer) {
      payer.totalPaid += expense.amount;
    }

    for (const split of expense.splits) {
      const debtor = balances.get(split.memberId);
      if (debtor) {
        debtor.totalOwed += split.amount;
      }
    }
  }

  for (const settlement of group.settlementsHistory) {
    const debtor = balances.get(settlement.from);
    if (debtor) {
      debtor.settlementsPaid += settlement.amount;
    }

    const creditor = balances.get(settlement.to);
    if (creditor) {
      creditor.settlementsReceived += settlement.amount;
    }
  }

  for (const balance of Array.from(balances.values())) {
    balance.netBalance =
      balance.totalPaid +
      balance.settlementsPaid -
      balance.totalOwed -
      balance.settlementsReceived;
  }

  return Array.from(balances.values());
}

export function calculateSettlements(balances: MemberBalance[]): Settlement[] {
  const settlements: Settlement[] = [];

  const creditors = balances
    .filter((balance) => balance.netBalance > 0.005)
    .map((balance) => ({ ...balance }))
    .sort((a, b) => b.netBalance - a.netBalance);

  const debtors = balances
    .filter((balance) => balance.netBalance < -0.005)
    .map((balance) => ({ ...balance }))
    .sort((a, b) => a.netBalance - b.netBalance);

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
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

    if (Math.abs(creditor.netBalance) < 0.005) {
      creditorIndex += 1;
    }

    if (Math.abs(debtor.netBalance) < 0.005) {
      debtorIndex += 1;
    }
  }

  return settlements;
}
