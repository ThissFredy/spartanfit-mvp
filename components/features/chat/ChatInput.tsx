"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => Promise<boolean>;
  isSending: boolean;
}

export function ChatInput({ onSend, isSending }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const submit = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    const success = await onSend(trimmed);
    if (success) {
      setMessage("");
    }
  };

  return (
    <div className="sticky bottom-0 z-20 border-t border-zinc-800 bg-zinc-950/95 p-3 backdrop-blur">
      <div className="mx-auto flex max-w-4xl gap-2">
        <label htmlFor="chat-message" className="sr-only">
          Escribe tu mensaje para SpartanFit IA
        </label>
        <Textarea
          id="chat-message"
          rows={2}
          placeholder="Escribe tu mensaje..."
          value={message}
          maxLength={1200}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          disabled={isSending}
          className="min-h-[48px] resize-none"
        />
        <Button
          type="button"
          onClick={() => void submit()}
          loading={isSending}
          disabled={isSending || !message.trim()}
          className="h-auto px-4"
        >
          <Send className="h-4 w-4" />
          Enviar
        </Button>
      </div>
      <p className="mx-auto mt-2 max-w-4xl text-xs text-zinc-500">
        Presiona Enter para enviar y Shift+Enter para salto de línea.
      </p>
    </div>
  );
}
