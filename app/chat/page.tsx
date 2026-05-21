import { getChatMessagesAction, getChatProviderStatusAction } from "@/actions/chat.actions";
import { ChatPanel } from "@/components/features/chat/ChatPanel";
import { AppShell } from "@/components/layout/AppShell";
import { UserService } from "@/lib/services/user.service";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "SpartanFit | Chat IA",
};

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const [dbUser, messages, providerStatus] = await Promise.all([
    UserService.syncUser(user),
    getChatMessagesAction(),
    getChatProviderStatusAction(),
  ]);

  if (dbUser.goal === "pending") {
    redirect("/profile");
  }

  const safeUserName = dbUser.name || user.email || "Atleta";

  return (
    <AppShell
      userName={safeUserName}
      userEmail={user.email || ""}
      isAdmin={dbUser.role?.name === "ADMIN"}
      title="Coach IA SpartanFit"
      description="Consulta rutinas, estrategia de fuerza y análisis de progreso."
    >
      <ChatPanel
        userName={safeUserName}
        providerStatus={providerStatus}
        initialMessages={messages.map((message) => ({
          ...message,
          role: message.role as "user" | "coach",
          createdAt: new Date(message.createdAt),
        }))}
      />
    </AppShell>
  );
}
