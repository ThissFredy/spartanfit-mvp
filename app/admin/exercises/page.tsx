import { getExercises } from "@/actions/exercise.actions";
import { ExercisesClient } from "./exercises-client";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserService } from "@/lib/services/user.service";
import { AppShell } from "@/components/layout/AppShell";

export const metadata = {
  title: "Administración de ejercicios",
};

export default async function AdminExercisesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const dbUser = await UserService.syncUser(user);
  if (dbUser.role?.name !== "ADMIN") {
    redirect("/dashboard");
  }

  const exercises = await getExercises();

  return (
    <AppShell
      userName={dbUser.name || user.email || "Admin"}
      userEmail={user.email || ""}
      isAdmin
      title="Gestión de ejercicios"
      description="Agrega, activa o desactiva ejercicios del catálogo central."
    >
      <ExercisesClient initialExercises={exercises} />
    </AppShell>
  );
}

