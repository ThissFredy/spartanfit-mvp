"use client";

import { useEffect, useRef, useState } from "react";
// import { UserStats } from "@prisma/client";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatInterfaceProps {
  userName: string;
  userStats: any | null;
}

export default function ChatInterface({
  userName,
  userStats,
}: ChatInterfaceProps) {
  // 1. Estados nativos de React en lugar de useChat
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-greeting",
      role: "assistant",
      content: `Hola ${userName}, ¿en qué te puedo ayudar hoy con tu entrenamiento o nutrición?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. Función manual para hacer el POST al backend
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    // Guardamos el mensaje del usuario en la interfaz
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Hacemos la petición esperando a que el servidor termine
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          userStats,
        }),
      });

      if (!response.ok) throw new Error("Error en la respuesta del servidor");

      const data = await response.json();

      // Agregamos la respuesta completa de la IA de un solo golpe
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.content,
        },
      ]);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto w-full p-4">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col max-w-[80%] rounded-xl px-4 py-3 ${
              message.role === "user"
                ? "bg-blue-600 text-white self-end ml-auto rounded-br-none"
                : "bg-gray-800 text-gray-100 self-start mr-auto rounded-bl-none"
            }`}
          >
            <span className="text-xs opacity-70 mb-1">
              {message.role === "user" ? userName : "Coach"}
            </span>
            <div className="whitespace-pre-wrap">
              {/* Volvemos a renderizar solo el contenido plano */}
              {message.content}
            </div>
          </div>
        ))}

        {/* Indicador de carga (Súper importante ahora que no hay stream) */}
        {isLoading && (
          <div className="bg-gray-800 text-gray-400 self-start mr-auto rounded-xl rounded-bl-none px-4 py-3 max-w-[80%]">
            <div className="flex space-x-1 items-center h-4">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Area (Queda exactamente igual) */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-2 shadow-lg">
        <form onSubmit={handleSend} className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu consulta..."
            className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none px-3 py-2 text-white placeholder-gray-500"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-3 flex-shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-1 mr-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
