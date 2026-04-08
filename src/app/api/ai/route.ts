import { NextRequest, NextResponse } from "next/server";
import { AIInsight, ExpenseCategory } from "@/types";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4.1-mini";

const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  food: [
    "food",
    "dinner",
    "lunch",
    "breakfast",
    "cafe",
    "coffee",
    "pizza",
    "restaurant",
    "snack",
    "zomato",
    "swiggy",
  ],
  travel: [
    "travel",
    "trip",
    "flight",
    "train",
    "uber",
    "ola",
    "taxi",
    "bus",
    "metro",
    "petrol",
    "fuel",
    "hotel",
  ],
  rent: ["rent", "lease", "deposit", "apartment", "flat", "room"],
  entertainment: [
    "movie",
    "concert",
    "party",
    "game",
    "netflix",
    "spotify",
    "club",
    "event",
  ],
  utilities: ["electricity", "water", "wifi", "internet", "gas", "bill", "recharge"],
  shopping: ["shopping", "mall", "amazon", "flipkart", "grocery", "store", "clothes"],
  health: ["doctor", "medicine", "hospital", "pharmacy", "health", "clinic", "medical"],
  other: [],
};

const CATEGORY_VALUES: ExpenseCategory[] = [
  "food",
  "travel",
  "rent",
  "entertainment",
  "utilities",
  "shopping",
  "health",
  "other",
];

type InsightExpense = {
  description: string;
  amount: number;
  category: string;
  date: string;
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
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

  const parsed = await requestStructuredJson({
    prompt: [
      "You categorize expense descriptions for a group expense app.",
      `Description: "${trimmedDescription}"`,
      `Allowed categories: ${CATEGORY_VALUES.join(", ")}.`,
      "Choose the single best category and a confidence between 0 and 1.",
    ].join("\n"),
    schemaName: "expense_category",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["category", "confidence"],
      properties: {
        category: {
          type: "string",
          enum: CATEGORY_VALUES,
        },
        confidence: {
          type: "number",
          minimum: 0,
          maximum: 1,
        },
      },
    },
  });

  if (!parsed) {
    return NextResponse.json(inferCategory(trimmedDescription));
  }

  return NextResponse.json({
    category: (parsed.category as ExpenseCategory) ?? "other",
    confidence:
      typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
  });
}

async function generateInsights(expenses: InsightExpense[]) {
  if (!expenses?.length) {
    return NextResponse.json({ insights: [] });
  }

  const summary = expenses
    .map(
      (expense) =>
        `${expense.category}: INR ${expense.amount} - ${expense.description} (${expense.date})`
    )
    .join("\n");

  const parsed = await requestStructuredJson({
    prompt: [
      "You are a personal finance assistant for a group expense splitter.",
      "Analyze the expense list and return 2 to 4 concise insights.",
      'Each insight must have a "type" of warning, info, or tip.',
      "Each message must be actionable and under 80 characters when possible.",
      "Expense list:",
      summary,
    ].join("\n"),
    schemaName: "expense_insights",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["insights"],
      properties: {
        insights: {
          type: "array",
          minItems: 2,
          maxItems: 4,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["type", "message"],
            properties: {
              type: {
                type: "string",
                enum: ["warning", "info", "tip"],
              },
              message: {
                type: "string",
              },
            },
          },
        },
      },
    },
  });

  if (!parsed || !Array.isArray(parsed.insights)) {
    return NextResponse.json({ insights: buildFallbackInsights(expenses) });
  }

  return NextResponse.json({ insights: parsed.insights as AIInsight[] });
}

async function requestStructuredJson({
  prompt,
  schemaName,
  schema,
}: {
  prompt: string;
  schemaName: string;
  schema: Record<string, unknown>;
}) {
  const apiKey = process.env.OPENAI_API_KEY ?? "";
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        input: prompt,
        text: {
          format: {
            type: "json_schema",
            name: schemaName,
            strict: true,
            schema,
          },
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as OpenAIResponse;
    const text = extractResponseText(data);
    if (!text) {
      return null;
    }

    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractResponseText(response: OpenAIResponse) {
  if (response.output_text?.trim()) {
    return response.output_text.trim();
  }

  const parts =
    response.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text?.trim() ?? "")
      .filter(Boolean) ?? [];

  return parts.join("\n").trim();
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
