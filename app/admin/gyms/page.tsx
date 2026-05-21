import { getGyms } from "@/actions/gym.actions";
import { getCities } from "@/actions/city.actions";
import { GymsView } from "@/components/features/admin/GymsView";
import { UserService } from "@/lib/services/user.service";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export const metadata = {
  title: "Administración de gimnasios",
};

export default async function AdminGymsPage() {
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

  const [{ data: initialGyms }, { data: activeCities }] = await Promise.all([
    getGyms(true),
    getCities(false),
  ]);

  return (
    <AppShell
      userName={dbUser.name || user.email || "Admin"}
      userEmail={user.email || ""}
      isAdmin
      title="Administración de gimnasios"
      description="Gestiona las sedes y su ciudad asociada."
    >
      <GymsView initialGyms={initialGyms || []} activeCities={activeCities || []} />
    </AppShell>
  );
}

