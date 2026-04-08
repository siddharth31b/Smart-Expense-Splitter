import { NextRequest, NextResponse } from "next/server";
import { calculateBalances, calculateSettlements } from "@/lib/calculations";
import { Group } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { group } = await req.json() as { group: Group };
    if (!group) return NextResponse.json({ error: "Group required." }, { status: 400 });

    const balances = calculateBalances(group);
    const settlements = calculateSettlements(balances);

    return NextResponse.json({ balances, settlements });
  } catch {
    return NextResponse.json({ error: "Failed to calculate settlements." }, { status: 500 });
  }
}
