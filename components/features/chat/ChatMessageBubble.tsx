import { Bot } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

interface ChatMessageBubbleProps {
  role: "user" | "coach";
  content: string;
  createdAt: Date;
  userName?: string;
}

export function ChatMessageBubble({ role, content, createdAt, userName }: ChatMessageBubbleProps) {
  const isUser = role === "user";
  return (
    <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-spartan/30 bg-spartan/15">
          <Bot className="h-4 w-4 text-spartan-light" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-soft sm:max-w-[70%]",
          isUser
            ? "rounded-br-md bg-spartan text-white"
            : "rounded-bl-md border border-zinc-700 bg-zinc-900 text-zinc-100",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
        <p className={cn("mt-2 text-[11px]", isUser ? "text-white/80" : "text-zinc-500")}>
          {createdAt.toLocaleString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "short",
          })}
        </p>
      </div>

      {isUser && <Avatar className="mt-0.5 h-9 w-9 text-xs" name={userName || "Usuario"} />}
    </div>
  );
}
