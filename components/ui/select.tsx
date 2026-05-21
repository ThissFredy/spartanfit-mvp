import { cn } from "@/lib/utils/cn";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export function Select({ className, hasError = false, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spartan/70",
        hasError
          ? "border-red-500/80 focus-visible:ring-red-500/70"
          : "border-zinc-700 hover:border-zinc-600 focus-visible:border-spartan",
        "disabled:cursor-not-allowed disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
}
