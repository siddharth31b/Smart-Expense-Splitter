export interface Member {
  id: string;
  name: string;
  email?: string;
}

export type ExpenseCategory =
  | "food"
  | "travel"
  | "rent"
  | "entertainment"
  | "utilities"
  | "shopping"
  | "health"
  | "other";

export type SplitType = "equal" | "custom";

export interface ExpenseSplit {
  memberId: string;
  amount: number;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  paidBy: string;
  splitType: SplitType;
  splits: ExpenseSplit[];
  date: string;
  createdAt: string;
  aiCategorized?: boolean;
}

export interface SettlementRecord {
  id: string;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: Member[];
  expenses: Expense[];
  settlementsHistory: SettlementRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface MemberBalance {
  memberId: string;
  memberName: string;
  totalPaid: number;
  totalOwed: number;
  settlementsPaid: number;
  settlementsReceived: number;
  netBalance: number;
}

export interface Settlement {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export interface AIInsight {
  type: "warning" | "info" | "tip";
  message: string;
}
