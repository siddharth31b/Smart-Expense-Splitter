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

  const addMember = () => setMembers((m) => [...m, { name: "", email: "" }]);
  const removeMember = (i: number) => setMembers((m) => m.filter((_, idx) => idx !== i));
  const updateMember = (i: number, field: "name" | "email", val: string) =>
    setMembers((m) => m.map((mem, idx) => (idx === i ? { ...mem, [field]: val } : mem)));

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) { setError("Group name is required."); return; }
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
      if (!res.ok) { setError(data.error ?? "Failed to create group."); return; }
      onCreated(data.group);
      // Reset
      setName(""); setDescription(""); setMembers([{ name: "", email: "" }]);
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
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Group Name *</label>
          <input
            className="input-dark"
            placeholder="e.g. Goa Trip 2024"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
          <input
            className="input-dark"
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Users size={13} /> Members *
            </label>
            <button
              onClick={addMember}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <Plus size={13} /> Add Member
            </button>
          </div>
          <div className="space-y-2">
            {members.map((m, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  className="input-dark"
                  placeholder={`Member ${i + 1} name`}
                  value={m.name}
                  onChange={(e) => updateMember(i, "name", e.target.value)}
                />
                <input
                  className="input-dark"
                  placeholder="Email (optional)"
                  value={m.email}
                  onChange={(e) => updateMember(i, "email", e.target.value)}
                />
                {members.length > 1 && (
                  <button
                    onClick={() => removeMember(i)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-surface-border text-slate-400 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
            {loading ? "Creating…" : "Create Group"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
