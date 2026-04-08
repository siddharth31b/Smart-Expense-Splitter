"use client";

import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Group } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (group: Group) => void;
}

export function CreateGroupModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([{ name: "", email: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addMember = () => setMembers((current) => [...current, { name: "", email: "" }]);
  const removeMember = (index: number) =>
    setMembers((current) => current.filter((_, memberIndex) => memberIndex !== index));
  const updateMember = (index: number, field: "name" | "email", value: string) =>
    setMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member
      )
    );

  const handleSubmit = async () => {
    setError("");

    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }

    const validMembers = members
      .map((member) => ({
        name: member.name.trim(),
        email: member.email.trim(),
      }))
      .filter((member) => member.name);

    if (validMembers.length < 2) {
      setError("Add at least two members to create a shared expense group.");
      return;
    }

    const uniqueNames = new Set(validMembers.map((member) => member.name.toLowerCase()));
    if (uniqueNames.size !== validMembers.length) {
      setError("Member names must be unique.");
      return;
    }

    const emails = validMembers
      .map((member) => member.email.toLowerCase())
      .filter(Boolean);
    if (new Set(emails).size !== emails.length) {
      setError("Member emails must be unique.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, members: validMembers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create group.");
        return;
      }

      onCreated(data.group);
      setName("");
      setDescription("");
      setMembers([{ name: "", email: "" }]);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Group" size="md">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">
            Group Name *
          </label>
          <input
            className="input-dark"
            placeholder="e.g. Goa Trip 2024"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">
            Description
          </label>
          <input
            className="input-dark"
            placeholder="Optional description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Users size={13} />
              Members *
            </label>
            <button
              onClick={addMember}
              className="flex items-center gap-1 text-xs text-emerald-400 transition-colors hover:text-emerald-300"
            >
              <Plus size={13} />
              Add Member
            </button>
          </div>

          <div className="space-y-2">
            {members.map((member, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  className="input-dark"
                  placeholder={`Member ${index + 1} name`}
                  value={member.name}
                  onChange={(event) => updateMember(index, "name", event.target.value)}
                />
                <input
                  className="input-dark"
                  placeholder="Email (optional)"
                  value={member.email}
                  onChange={(event) => updateMember(index, "email", event.target.value)}
                />
                {members.length > 1 && (
                  <button
                    onClick={() => removeMember(index)}
                    className="flex-shrink-0 p-2 text-slate-500 transition-colors hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-surface-border py-2.5 text-sm font-medium text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
          >
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
