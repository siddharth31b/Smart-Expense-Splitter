"use client";

import { cn } from "@/lib/utils";

interface MemberChipProps {
  name: string;
  tone?: "green" | "blue";
  className?: string;
}

const toneClasses = {
  green: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  blue: "border-sky-500/20 bg-sky-500/10 text-sky-300",
};

export function MemberChip({
  name,
  tone = "green",
  className,
}: MemberChipProps) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {name}
    </span>
  );
}
