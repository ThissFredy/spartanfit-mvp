"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureAdmin } from "./admin.actions";

export async function getExercises() {
  try {
    return await prisma.exercise.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return [];
  }
}

export async function getActiveExercises() {
  try {
    return await prisma.exercise.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching active exercises:", error);
    return [];
  }
}

export async function createExercise(name: string) {
  try {
    await ensureAdmin();
    await prisma.exercise.create({
      data: { name },
    });
    revalidatePath("/admin/exercises");
    return { success: true };
  } catch (error) {
    console.error("Error creating exercise:", error);
    return { error: "No se pudo crear el ejercicio." };
  }
}

export async function updateExerciseStatus(id: string, isActive: boolean) {
  try {
    await ensureAdmin();
    await prisma.exercise.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/admin/exercises");
    return { success: true };
  } catch (error) {
    console.error("Error updating exercise:", error);
    return { error: "No se pudo actualizar el ejercicio." };
  }
}
