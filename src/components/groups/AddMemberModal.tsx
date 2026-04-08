"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { UserPlus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Group, Member } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  group: Group;
  onAdded: (member: Member) => void;
}

export function AddMemberModal({ open, onClose, group, onAdded }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setEmail("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError("Member name is required.");
      return;
    }

    const duplicateName = group.members.some(
      (member) => member.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicateName) {
      setError("A member with this name already exists.");
      return;
    }

    const duplicateEmail =
      trimmedEmail &&
      group.members.some(
        (member) => member.email?.trim().toLowerCase() === trimmedEmail
      );
    if (duplicateEmail) {
      setError("This email is already used by another member.");
      return;
    }

    onAdded({
      id: uuidv4(),
      name: trimmedName,
      email: trimmedEmail || undefined,
    });
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Member" size="sm">
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2 text-emerald-300">
            <UserPlus size={16} />
            <span className="text-sm font-medium">Add people to {group.name}</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            New members will be available immediately for future expenses and settlements.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">
            Member Name *
          </label>
          <input
            className="input-dark"
            placeholder="e.g. Priya Sharma"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">
            Email
          </label>
          <input
            className="input-dark"
            type="email"
            placeholder="Optional email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleClose}
            className="flex-1 rounded-xl border border-surface-border py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary flex-1">
            Add Member
          </button>
        </div>
      </div>
    </Modal>
  );
}
