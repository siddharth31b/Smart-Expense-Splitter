import { Group } from "@/types";

const STORAGE_KEY = "expense_splitter_groups";

export function normalizeGroup(group: Group): Group {
  return {
    ...group,
    members: Array.isArray(group.members) ? group.members : [],
    expenses: Array.isArray(group.expenses) ? group.expenses : [],
    settlementsHistory: Array.isArray(group.settlementsHistory)
      ? group.settlementsHistory
      : [],
  };
}

export function getGroups(): Group[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const groups = raw ? (JSON.parse(raw) as Group[]) : [];
    return groups.map(normalizeGroup);
  } catch {
    return [];
  }
}

export function saveGroups(groups: Group[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups.map(normalizeGroup)));
}

export function getGroupById(id: string): Group | undefined {
  return getGroups().find((g) => g.id === id);
}

export function upsertGroup(group: Group): void {
  const groups = getGroups();
  const idx = groups.findIndex((g) => g.id === group.id);
  const normalizedGroup = normalizeGroup(group);
  if (idx >= 0) {
    groups[idx] = normalizedGroup;
  } else {
    groups.push(normalizedGroup);
  }
  saveGroups(groups);
}

export function deleteGroup(id: string): void {
  const groups = getGroups().filter((g) => g.id !== id);
  saveGroups(groups);
}
