"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { ChatService } from "@/lib/services/chat.service";

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No estás autenticado");
  }

  return user.id;
}

export async function getChatMessagesAction() {
  const userId = await getAuthenticatedUserId();
  return ChatService.getMessagesByUser(userId);
}

export async function getChatProviderStatusAction() {
  await getAuthenticatedUserId();
  return ChatService.getProviderStatus();
}

export async function sendChatMessageAction(rawMessage: string) {
  const userId = await getAuthenticatedUserId();
  const userMessage = rawMessage.trim();

  if (!userMessage) {
    return { success: false, error: "Escribe un mensaje antes de enviar." };
  }

  if (userMessage.length > 1200) {
    return { success: false, error: "El mensaje excede el máximo de 1200 caracteres." };
  }

  try {
    const existingMessages = await ChatService.getMessagesByUser(userId);

    const createdUserMessage = await ChatService.createMessage(userId, "user", userMessage);
    const coachReply = await ChatService.generateCoachReply({
      userId,
      userMessage,
      recentMessages: existingMessages.slice(-12),
    });
    const createdCoachMessage = await ChatService.createMessage(
      userId,
      "coach",
      coachReply.content,
    );

    revalidatePath("/chat");

    return {
      success: true,
      data: {
        userMessage: createdUserMessage,
        coachMessage: createdCoachMessage,
      },
      meta: {
        provider: coachReply.source,
        model: coachReply.model,
        reason: coachReply.reason,
      },
    };
  } catch (error) {
    console.error("Error sending chat message:", error);
    return {
      success: false,
      error: "No pudimos procesar tu mensaje ahora. Intenta de nuevo.",
    };
  }
}
