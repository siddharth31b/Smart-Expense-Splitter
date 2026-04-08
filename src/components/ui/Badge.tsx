"use client";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "red" | "blue" | "amber" | "muted";
  className?: string;
}

const variants = {
  green: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  red:   "bg-red-500/10 text-red-400 border border-red-500/20",
  blue:  "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  amber: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  muted: "bg-white/5 text-slate-400 border border-white/10",
};

export function Badge({ children, variant = "muted", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
