"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function addWorkoutLog(data: {
  userId: string;
  exerciseId: string;
  sets: number;
  reps: number;
  weightLoad: number;
  recordedAt: Date;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado." };

    await prisma.workoutLog.create({
      data: {
        userId: user.id, // Mitigación de IDOR
        exerciseId: data.exerciseId,
        sets: data.sets,
        reps: data.reps,
        weightLoad: data.weightLoad,
        recordedAt: data.recordedAt,
      },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error adding workout log:", error);
    return { error: "Hubo un error al registrar el entrenamiento." };
  }
}

export async function getUserWorkoutProgress(userId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    if (user.id !== userId) {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { role: true } });
      if (dbUser?.role?.name !== "ADMIN") {
        return [];
      }
    }

    const logs = await prisma.workoutLog.findMany({
      where: { userId },
      include: { exercise: true },
      orderBy: { recordedAt: "asc" },
    });

    if (!logs.length) return [];

    // Group by exercise
    const exerciseGroups: Record<
      string,
      { exerciseName: string; logs: typeof logs }
    > = {};

    logs.forEach((log) => {
      const exName = log.exercise.name;
      if (!exerciseGroups[exName]) {
        exerciseGroups[exName] = { exerciseName: exName, logs: [] };
      }
      exerciseGroups[exName].logs.push(log);
    });

    // For each exercise, group by day and get max weight
    const progressData = Object.values(exerciseGroups).map((group) => {
      const dailyMaxes: Record<string, number> = {};

      group.logs.forEach((log) => {
        const dateStr = log.recordedAt.toISOString().split("T")[0];
        if (!dailyMaxes[dateStr] || log.weightLoad > dailyMaxes[dateStr]) {
          dailyMaxes[dateStr] = log.weightLoad;
        }
      });

      const chartData = Object.entries(dailyMaxes)
        .map(([date, maxWeight]) => ({
          date,
          maxWeight,
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

      const absoluteMax = Math.max(...chartData.map((d) => d.maxWeight));

      return {
        exerciseName: group.exerciseName,
        absoluteMax,
        data: chartData,
      };
    });

    progressData.sort((a, b) => b.absoluteMax - a.absoluteMax);

    return progressData;
  } catch (error) {
    console.error("Error fetching workout progress:", error);
    return [];
  }
}
