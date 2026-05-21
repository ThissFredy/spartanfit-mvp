import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserService } from "@/lib/services/user.service";
import { ProfileForm } from "@/components/features/profile/ProfileForm";
import { AppShell } from "@/components/layout/AppShell";

export const metadata = {
  title: "SpartanFit | Perfil",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const [dbUser, gyms] = await Promise.all([
    UserService.syncUser(user),
    UserService.getGymLocations(),
  ]);

  return (
    <AppShell
      userName={dbUser.name || user.email || "Atleta"}
      userEmail={user.email || ""}
      isAdmin={dbUser.role?.name === "ADMIN"}
      title={dbUser.goal === "pending" ? "Completa tu perfil" : "Configuración de perfil"}
      description="Ajusta tus datos físicos, objetivo y configuración de cuenta."
    >
      <ProfileForm user={dbUser} gyms={gyms} />
    </AppShell>
  );
}
