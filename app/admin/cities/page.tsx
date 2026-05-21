import { getCities } from "@/actions/city.actions";
import { CitiesView } from "@/components/features/admin/CitiesView";
import { UserService } from "@/lib/services/user.service";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export const metadata = {
  title: "Administración de ciudades",
};

export default async function AdminCitiesPage() {
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

  const { data: initialCities } = await getCities(true);

  return (
    <AppShell
      userName={dbUser.name || user.email || "Admin"}
      userEmail={user.email || ""}
      isAdmin
      title="Administración de ciudades"
      description="Mantén actualizado el catálogo de ciudades disponibles."
    >
      <CitiesView initialCities={initialCities || []} />
    </AppShell>
  );
}

