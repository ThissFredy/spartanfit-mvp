import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80",
        "after:absolute after:inset-0 after:animate-pulse after:bg-zinc-800/20",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.1s_ease-in-out_infinite]",
        "before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)]",
        className,
      )}
    />
  );
}
