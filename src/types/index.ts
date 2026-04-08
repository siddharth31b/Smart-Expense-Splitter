// ─── Core Domain Types ───────────────────────────────────────────────────────

export interface Member {
  id: string;
  name: string;
  email?: string;
  avatar?: string; // initials-based color
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
  amount: number; // exact amount this member owes
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  paidBy: string; // memberId
  splitType: SplitType;
  splits: ExpenseSplit[];
  date: string; // ISO
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

// ─── Derived / Computed Types ─────────────────────────────────────────────────

export interface MemberBalance {
  memberId: string;
  memberName: string;
  totalPaid: number;
  totalOwed: number;
  settlementsPaid: number;
  settlementsReceived: number;
  netBalance: number; // positive = is owed money, negative = owes money
}

export interface Settlement {
  from: string; // memberId
  fromName: string;
  to: string; // memberId
  toName: string;
  amount: number;
}

export interface GroupSummary {
  group: Group;
  balances: MemberBalance[];
  settlements: Settlement[];
  totalExpenses: number;
  categoryBreakdown: { category: ExpenseCategory; amount: number }[];
}

// ─── AI Types ─────────────────────────────────────────────────────────────────

export interface AIInsight {
  type: "warning" | "info" | "tip";
  message: string;
}

export interface AIAnalysis {
  insights: AIInsight[];
  topCategory: ExpenseCategory;
  categoryBreakdown: { category: ExpenseCategory; amount: number; percentage: number }[];
}
