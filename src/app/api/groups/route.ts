import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { Group, Member } from "@/types";

// NOTE: This is a stateless API – data lives in the client (localStorage).
// These routes validate and shape data; client is the source of truth.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, members } = body as {
      name: string;
      description?: string;
      members: { name: string; email?: string }[];
    };

    const sanitizedMembers = (members ?? [])
      .map((member) => ({
        name: member.name?.trim() ?? "",
        email: member.email?.trim() ?? "",
      }))
      .filter((member) => member.name);

    if (!name?.trim() || sanitizedMembers.length < 2) {
      return NextResponse.json(
        { error: "Group name and at least two members are required." },
        { status: 400 }
      );
    }

    const uniqueNames = new Set(
      sanitizedMembers.map((member) => member.name.toLowerCase())
    );
    if (uniqueNames.size !== sanitizedMembers.length) {
      return NextResponse.json(
        { error: "Member names must be unique." },
        { status: 400 }
      );
    }

    const emails = sanitizedMembers
      .map((member) => member.email.toLowerCase())
      .filter(Boolean);
    if (new Set(emails).size !== emails.length) {
      return NextResponse.json(
        { error: "Member emails must be unique." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const group: Group = {
      id: uuidv4(),
      name: name.trim(),
      description: description?.trim(),
      members: sanitizedMembers.map((m) => ({
        id: uuidv4(),
        name: m.name,
        email: m.email || undefined,
      } as Member)),
      expenses: [],
      settlementsHistory: [],
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json({ group }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
