import { NextRequest, NextResponse } from "next/server";
import { AIInsight, ExpenseCategory } from "@/types";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  food: ["food", "dinner", "lunch", "breakfast", "cafe", "coffee", "pizza", "restaurant", "snack", "zomato", "swiggy"],
  travel: ["travel", "trip", "flight", "train", "uber", "ola", "taxi", "bus", "metro", "petrol", "fuel", "hotel"],
  rent: ["rent", "lease", "deposit", "apartment", "flat", "room"],
  entertainment: ["movie", "concert", "party", "game", "netflix", "spotify", "club", "event"],
  utilities: ["electricity", "water", "wifi", "internet", "gas", "bill", "recharge"],
  shopping: ["shopping", "mall", "amazon", "flipkart", "grocery", "store", "clothes"],
  health: ["doctor", "medicine", "hospital", "pharmacy", "health", "clinic", "medical"],
  other: [],
};

type InsightExpense = {
  description: string;
  amount: number;
  category: string;
  date: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, description, expenses } = body;

    if (action === "categorize") {
      return await categorizeExpense(description as string);
    }

    if (action === "insights") {
      return await generateInsights(expenses as InsightExpense[]);
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json({ error: "AI service failed." }, { status: 500 });
  }
}

async function categorizeExpense(description: string) {
  const trimmedDescription = description?.trim() ?? "";
  if (!trimmedDescription) {
    return NextResponse.json({ category: "other" as ExpenseCategory, confidence: 0 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!apiKey) {
    return NextResponse.json(inferCategory(trimmedDescription));
  }

  const systemPrompt = `You are an expense categorization assistant. Given an expense description, return ONLY a JSON object with:
- "category": one of ["food", "travel", "rent", "entertainment", "utilities", "shopping", "health", "other"]
- "confidence": number 0-1

Return ONLY valid JSON, no markdown, no explanation.`;

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 100,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Categorize this expense: "${trimmedDescription}"`,
          },
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json(inferCategory(trimmedDescription));
    }

    const data = await res.json();
    const text = data.content?.[0]?.text ?? "{}";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

    return NextResponse.json({
      category: (parsed.category as ExpenseCategory) ?? "other",
      confidence: parsed.confidence ?? 0.5,
    });
  } catch {
    return NextResponse.json(inferCategory(trimmedDescription));
  }
}

async function generateInsights(expenses: InsightExpense[]) {
  if (!expenses?.length) {
    return NextResponse.json({ insights: [] });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!apiKey) {
    return NextResponse.json({ insights: buildFallbackInsights(expenses) });
  }

  const systemPrompt = `You are a personal finance analyst. Analyze spending patterns from the given expense list and return ONLY a JSON array of insight objects.

Each object has:
- "type": "warning" | "info" | "tip"
- "message": a concise, actionable insight (max 80 chars)

Return 2-4 insights. Return ONLY valid JSON array, no markdown.`;

  const summary = expenses
    .map((expense) => `${expense.category}: INR ${expense.amount} - ${expense.description}`)
    .join("\n");

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: "user", content: `Expenses:\n${summary}` }],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ insights: buildFallbackInsights(expenses) });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text ?? "[]";
    const insights = JSON.parse(text.replace(/```json|```/g, "").trim()) as AIInsight[];
    return NextResponse.json({ insights });
  } catch {
    return NextResponse.json({ insights: buildFallbackInsights(expenses) });
  }
}

function inferCategory(description: string): {
  category: ExpenseCategory;
  confidence: number;
} {
  const normalizedDescription = description.toLowerCase();

  let bestCategory: ExpenseCategory = "other";
  let bestScore = 0;

  (Object.entries(CATEGORY_KEYWORDS) as [ExpenseCategory, string[]][]).forEach(
    ([category, keywords]) => {
      const score = keywords.reduce((sum, keyword) => {
        return sum + (normalizedDescription.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }
  );

  if (bestScore === 0) {
    return { category: "other", confidence: 0.24 };
  }

  return {
    category: bestCategory,
    confidence: Math.min(0.55 + bestScore * 0.12, 0.92),
  };
}

function buildFallbackInsights(expenses: InsightExpense[]): AIInsight[] {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = new Map<string, number>();

  expenses.forEach((expense) => {
    categoryTotals.set(
      expense.category,
      (categoryTotals.get(expense.category) ?? 0) + expense.amount
    );
  });

  const sortedCategories = Array.from(categoryTotals.entries()).sort(
    (a, b) => b[1] - a[1]
  );
  const insights: AIInsight[] = [];

  if (sortedCategories[0] && totalSpent > 0) {
    const [topCategory, amount] = sortedCategories[0];
    const percentage = Math.round((amount / totalSpent) * 100);
    insights.push({
      type: percentage >= 45 ? "warning" : "info",
      message: `${capitalize(topCategory)} makes up ${percentage}% of total spend.`,
    });
  }

  const recentThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentSpend = expenses
    .filter((expense) => new Date(expense.date).getTime() >= recentThreshold)
    .reduce((sum, expense) => sum + expense.amount, 0);

  if (recentSpend > 0) {
    insights.push({
      type: "info",
      message: `Spent INR ${recentSpend.toFixed(0)} in the last 7 days.`,
    });
  }

  const averageExpense = totalSpent / expenses.length;
  if (averageExpense > 0) {
    insights.push({
      type: "tip",
      message: `Average expense size is INR ${averageExpense.toFixed(0)}.`,
    });
  }

  if (expenses.length >= 3) {
    insights.push({
      type: "tip",
      message: "Add notes consistently to improve future category suggestions.",
    });
  }

  return insights.slice(0, 4);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
