import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserService } from "@/lib/services/user.service";
import { getActiveExercises } from "@/actions/exercise.actions";
import { getUserWorkoutProgress } from "@/actions/workout.actions";
import { AddWorkoutModal } from "@/app/dashboard/components/add-workout-modal";
import { WorkoutProgressCharts } from "@/app/dashboard/components/workout-progress-charts";

export const metadata = {
  title: "SpartanFit | Progreso",
};

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const dbUser = await UserService.syncUser(user);
  if (dbUser.goal === "pending") {
    redirect("/profile");
  }

  const [exercises, progressData] = await Promise.all([
    getActiveExercises(),
    getUserWorkoutProgress(dbUser.id),
  ]);

  return (
    <AppShell
      userName={dbUser.name || user.email || "Atleta"}
      userEmail={user.email || ""}
      isAdmin={dbUser.role?.name === "ADMIN"}
      title="Progreso visual"
      description="Sigue tu evolución de carga máxima por ejercicio y compara sesiones."
    >
      <section className="mb-4 flex items-center justify-end">
        <AddWorkoutModal userId={dbUser.id} exercises={exercises} />
      </section>
      <WorkoutProgressCharts chartsData={progressData} />
    </AppShell>
  );
}
