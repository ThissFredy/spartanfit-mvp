import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserService } from "@/lib/services/user.service";
import { getActiveExercises } from "@/actions/exercise.actions";
import { getUserWorkoutProgress } from "@/actions/workout.actions";
import { AddWorkoutModal } from "./components/add-workout-modal";
import { WorkoutProgressCharts } from "./components/workout-progress-charts";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Bot, Dumbbell, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "SpartanFit | Dashboard",
};

export default async function DashboardPage() {
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

  const gymNames = dbUser.userGyms
    .map((userGym) => userGym.gymLocation?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <AppShell
      userName={dbUser.name || user.email || "Atleta"}
      userEmail={user.email || ""}
      isAdmin={dbUser.role?.name === "ADMIN"}
      title={`Bienvenido, ${dbUser.name || user.email || "Atleta"}`}
      description="Monitorea tu progreso, registra entrenamientos y optimiza tu plan con IA."
    >
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="transition-transform hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Dumbbell className="h-4 w-4 text-spartan-light" />
              Objetivo actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold capitalize">{dbUser.goal}</p>
          </CardContent>
        </Card>

        <Card className="transition-transform hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Activity className="h-4 w-4 text-spartan-light" />
              Ejercicios activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{exercises.length}</p>
          </CardContent>
        </Card>

        <Card className="transition-transform hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Bot className="h-4 w-4 text-spartan-light" />
              Coach IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-spartan-light">Disponible</p>
          </CardContent>
        </Card>

        <Card className="transition-transform hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <ShieldCheck className="h-4 w-4 text-spartan-light" />
              Rol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={dbUser.role?.name === "ADMIN" ? "warning" : "muted"}>
              {dbUser.role?.name || "Sin rol"}
            </Badge>
          </CardContent>
        </Card>
      </section>

      <section className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sedes registradas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-300">{gymNames || "Aún no has seleccionado gimnasios."}</p>
          </CardContent>
        </Card>
      </section>

      {dbUser.role?.name === "ADMIN" && (
        <section className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/users" className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800">
            Usuarios
          </Link>
          <Link href="/admin/gyms" className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800">
            Gimnasios
          </Link>
          <Link href="/admin/cities" className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800">
            Ciudades
          </Link>
          <Link href="/admin/exercises" className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800">
            Ejercicios
          </Link>
        </section>
      )}

      <section className="mt-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Progreso de entrenamiento</h2>
          <AddWorkoutModal userId={dbUser.id} exercises={exercises} />
        </div>
        <WorkoutProgressCharts chartsData={progressData} />
      </section>
    </AppShell>
  );
}


