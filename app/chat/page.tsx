import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserService } from "@/lib/services/user.service";
import db from "@/lib/prisma";
import ChatInterface from "@/components/features/chat/ChatInterface";

export const metadata = {
  title: "SpartanFit | Virtual Coach",
};

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Get user from DB
  const dbUser = await UserService.syncUser(user);

  if (dbUser.goal === "pending" || !dbUser.roleId) {
    redirect("/profile");
  }

  // Fetch UserStats
  const userStats = await db.userStats.findUnique({
    where: { userId: dbUser.id },
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="p-4 border-b border-zinc-800 flex justify-between items-center max-w-3xl mx-auto">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-[#c22524]">SpartanFit</span> Coach IA
        </h1>
        <a href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
          Volver al Dashboard
        </a>
      </header>
      <main>
        <ChatInterface userName={dbUser.name} userStats={userStats} />
      </main>
    </div>
  );
}
