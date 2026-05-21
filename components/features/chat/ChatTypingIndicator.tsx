import { cn } from "@/lib/utils/cn";
import { Sparkles } from "lucide-react";

export function ChatTypingIndicator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-300 shadow-soft",
        className,
      )}
      aria-live="polite"
    >
      <span className="flex items-center gap-1" aria-hidden="true">
        <span className="h-2 w-2 animate-bounce rounded-full bg-spartan [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-spartan [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-spartan" />
      </span>
      <span className="flex items-center gap-1.5">
        <Sparkles className="h-4 w-4 text-spartan-light" />
        SpartanFit IA está pensando...
      </span>
    </div>
  );
}
