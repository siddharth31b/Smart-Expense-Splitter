import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { Expense, ExpenseCategory, ExpenseSplit, SplitType } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      groupId,
      description,
      amount,
      currency = "INR",
      category,
      paidBy,
      splitType,
      splits,
      date,
      aiCategorized,
    } = body as {
      groupId: string;
      description: string;
      amount: number;
      currency?: string;
      category: ExpenseCategory;
      paidBy: string;
      splitType: SplitType;
      splits: ExpenseSplit[];
      date?: string;
      aiCategorized?: boolean;
    };

    if (!groupId || !description?.trim() || !amount || !paidBy || !splits?.length) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Expense amount must be greater than zero." },
        { status: 400 }
      );
    }

    const invalidSplit = splits.some((split) => split.amount < 0 || !split.memberId);
    if (invalidSplit) {
      return NextResponse.json(
        { error: "Each split must have a valid member and non-negative amount." },
        { status: 400 }
      );
    }

    // Validate splits sum
    const splitsTotal = splits.reduce((sum, s) => sum + s.amount, 0);
    if (Math.abs(splitsTotal - amount) > 0.01) {
      return NextResponse.json(
        { error: `Splits total (${splitsTotal}) must equal expense amount (${amount}).` },
        { status: 400 }
      );
    }

    const expense: Expense = {
      id: uuidv4(),
      groupId,
      description: description.trim(),
      amount,
      currency,
      category,
      paidBy,
      splitType,
      splits,
      date: date ?? new Date().toISOString(),
      createdAt: new Date().toISOString(),
      aiCategorized: aiCategorized ?? false,
    };

    return NextResponse.json({ expense }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
