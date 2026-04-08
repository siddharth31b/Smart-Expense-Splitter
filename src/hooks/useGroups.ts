"use client";
import { useState, useEffect, useCallback } from "react";
import { Group, Expense, Member, SettlementRecord } from "@/types";
import {
  getGroups,
  saveGroups,
  upsertGroup,
  deleteGroup as deleteGroupFromStorage,
  normalizeGroup,
} from "@/lib/storage";

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    setGroups(getGroups());

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "expense_splitter_groups") {
        setGroups(getGroups());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addGroup = useCallback((group: Group) => {
    upsertGroup(group);
    setGroups(getGroups());
  }, []);

  const updateGroup = useCallback(
    (groupId: string, updater: (group: Group) => Group) => {
      const all = getGroups();
      const index = all.findIndex((group) => group.id === groupId);
      if (index === -1) return;

      const nextGroup = normalizeGroup(updater(normalizeGroup(all[index])));
      nextGroup.updatedAt = new Date().toISOString();

      const nextGroups = [...all];
      nextGroups[index] = nextGroup;
      saveGroups(nextGroups);
      setGroups(nextGroups);
    },
    []
  );

  const removeGroup = useCallback((id: string) => {
    deleteGroupFromStorage(id);
    setGroups(getGroups());
  }, []);

  const addExpense = useCallback((groupId: string, expense: Expense) => {
    updateGroup(groupId, (group) => ({
      ...group,
      expenses: [...group.expenses, expense],
    }));
  }, [updateGroup]);

  const removeExpense = useCallback((groupId: string, expenseId: string) => {
    updateGroup(groupId, (group) => ({
      ...group,
      expenses: group.expenses.filter((expense) => expense.id !== expenseId),
    }));
  }, [updateGroup]);

  const addMember = useCallback((groupId: string, member: Member) => {
    updateGroup(groupId, (group) => ({
      ...group,
      members: [...group.members, member],
    }));
  }, [updateGroup]);

  const recordSettlement = useCallback(
    (groupId: string, settlement: SettlementRecord) => {
      updateGroup(groupId, (group) => ({
        ...group,
        settlementsHistory: [...group.settlementsHistory, settlement],
      }));
    },
    [updateGroup]
  );

  return {
    groups,
    addGroup,
    removeGroup,
    addExpense,
    removeExpense,
    addMember,
    recordSettlement,
  };
}
