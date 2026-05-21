import { AdminUsersView } from "@/components/features/admin/AdminUsersView";
import { UserService } from "@/lib/services/user.service";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export const metadata = {
  title: "Administración de usuarios",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?error=unauthorized");
  }

  const dbUser = await UserService.getUserProfile(user.id);
  if (dbUser?.role?.name !== "ADMIN") {
    redirect("/dashboard?error=admin_required");
  }

  const [roles, locations] = await Promise.all([UserService.getRoles(), UserService.getGymLocations()]);

  return (
    <AppShell
      userName={dbUser.name || user.email || "Admin"}
      userEmail={user.email || ""}
      isAdmin
      title="Administración de usuarios"
      description="Gestiona perfiles, roles y acceso a la plataforma."
    >
      <AdminUsersView roles={roles} locations={locations} />
    </AppShell>
  );
}

