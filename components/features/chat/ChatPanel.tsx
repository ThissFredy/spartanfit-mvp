"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Sparkles, TriangleAlert } from "lucide-react";
import { sendChatMessageAction } from "@/actions/chat.actions";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { ChatInput } from "./ChatInput";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { ChatTypingIndicator } from "./ChatTypingIndicator";

interface ChatPanelProps {
  initialMessages: Array<{
    id: string;
    role: "user" | "coach";
    content: string;
    createdAt: Date;
  }>;
  userName?: string;
  providerStatus: {
    configured: boolean;
    preferredModel: string;
    candidates: string[];
  };
}

const suggestionPrompts = [
  "¿Cómo mejoro mi hipertrofia?",
  "¿Qué rutina puedo hacer hoy?",
  "¿Cómo progreso en fuerza?",
  "Analiza mi último entrenamiento",
];

export function ChatPanel({ initialMessages, userName, providerStatus }: ChatPanelProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string>("");
  const [lastProvider, setLastProvider] = useState<"gemini" | "fallback" | null>(null);
  const [lastModel, setLastModel] = useState<string | null>(null);
  const { pushToast } = useToast();
  const endRef = useRef<HTMLDivElement | null>(null);
  const optimisticCounter = useRef(0);

  const hasMessages = useMemo(() => messages.length > 0, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  const handleSend = async (message: string) => {
    setIsSending(true);
    setErrorMessage(null);
    setRetryMessage(message);

    const optimisticUserMessage = {
      id: `temp-${optimisticCounter.current++}`,
      role: "user" as const,
      content: message,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);

    const response = await sendChatMessageAction(message);
    setIsSending(false);

    if (!response.success || !response.data) {
      setMessages((prev) => prev.filter((item) => item.id !== optimisticUserMessage.id));
      setErrorMessage(response.error || "No pudimos responder ahora.");
      pushToast({
        variant: "error",
        title: "No se pudo enviar el mensaje",
        description: "Intenta nuevamente en unos segundos.",
      });
      return false;
    }

    const provider = response.meta?.provider || "fallback";
    setLastProvider(provider);
    setLastModel(response.meta?.model || null);

    if (provider === "fallback") {
      const reason = response.meta?.reason || "gemini_error";
      const reasonMessage =
        reason === "gemini_rate_limited"
          ? "Gemini alcanzó límite de cuota/requests. Se usó respuesta local temporal."
          : reason === "gemini_auth_error"
            ? "Gemini rechazó credenciales. Revisa GEMINI_API_KEY."
            : reason === "gemini_model_not_found"
              ? "Modelo Gemini no disponible. Se usó fallback local."
              : "Gemini no respondió en este intento. Se usó fallback local.";
      pushToast({
        variant: "info",
        title: "Respuesta temporal en modo local",
        description: reasonMessage,
      });
    }

    setMessages((prev) => {
      const withoutOptimistic = prev.filter((item) => item.id !== optimisticUserMessage.id);
      return [
        ...withoutOptimistic,
        {
          id: response.data.userMessage.id,
          role: "user",
          content: response.data.userMessage.content,
          createdAt: new Date(response.data.userMessage.createdAt),
        },
        {
          id: response.data.coachMessage.id,
          role: "coach",
          content: response.data.coachMessage.content,
          createdAt: new Date(response.data.coachMessage.createdAt),
        },
      ];
    });
    return true;
  };

  return (
    <Card className="flex min-h-[70vh] flex-col overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-zinc-100">Estado del asistente</p>
          <p className="text-xs text-zinc-400">
            {providerStatus.configured
              ? `Gemini configurado (${providerStatus.preferredModel})`
              : "Gemini no configurado, se usará fallback local"}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
            lastProvider === "gemini"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : lastProvider === "fallback"
                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                : "border-zinc-700 bg-zinc-800 text-zinc-300"
          }`}
        >
          {lastProvider === "gemini" ? (
            <Sparkles className="h-3.5 w-3.5" />
          ) : lastProvider === "fallback" ? (
            <TriangleAlert className="h-3.5 w-3.5" />
          ) : (
            <MessageCircle className="h-3.5 w-3.5" />
          )}
          {lastProvider === "gemini"
            ? `Gemini${lastModel ? ` (${lastModel})` : ""}`
            : lastProvider === "fallback"
              ? "Fallback local"
              : "Sin mensajes"}
        </span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {!hasMessages && (
          <EmptyState
            title="Empieza tu conversación"
            description="Hazle una pregunta al coach para planificar tu entrenamiento."
            icon={<MessageCircle className="h-6 w-6" />}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {suggestionPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleSend(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            }
          />
        )}

        {messages.map((message) => (
          <ChatMessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            createdAt={new Date(message.createdAt)}
            userName={userName}
          />
        ))}

        {isSending && <ChatTypingIndicator />}

        {errorMessage && (
          <ErrorState
            title="No pudimos generar respuesta"
            description={errorMessage}
            action={
              <Button
                variant="secondary"
                type="button"
                onClick={() => void handleSend(retryMessage)}
              >
                Reintentar
              </Button>
            }
          />
        )}
        <div ref={endRef} />
      </div>

      <ChatInput onSend={handleSend} isSending={isSending} />
    </Card>
  );
}
