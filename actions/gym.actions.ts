"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function getGyms(includeInactive = false) {
  try {
    const gyms = await prisma.gymLocation.findMany({
      where: includeInactive ? undefined : { isActive: true },
      include: {
        city: true,
      },
      orderBy: { name: "asc" },
    });
    return { success: true, data: gyms };
  } catch (error: unknown) {
    console.error("Error fetching gyms:", error);
    return { success: false, error: "No se pudieron obtener los gimnasios." };
  }
}

export async function createGym(data: {
  name: string;
  address?: string;
  cityId: string;
  isActive?: boolean;
}) {
  try {
    const gym = await prisma.gymLocation.create({
      data: {
        name: data.name,
        address: data.address,
        cityId: data.cityId,
        isActive: data.isActive ?? true,
      },
    });
    revalidatePath("/admin/gyms");
    return { success: true, data: gym };
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "Ya existe un gimnasio con ese nombre." };
    }
    console.error("Error creating gym:", error);
    return { success: false, error: "Error al crear el gimnasio." };
  }
}

export async function updateGym(
  id: string,
  data: {
    name?: string;
    address?: string;
    cityId?: string;
    isActive?: boolean;
  },
) {
  try {
    const gym = await prisma.gymLocation.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/gyms");
    return { success: true, data: gym };
  } catch (error: unknown) {
    console.error("Error updating gym:", error);
    return { success: false, error: "Error al actualizar el gimnasio." };
  }
}

export async function toggleGymStatus(id: string) {
  try {
    const current = await prisma.gymLocation.findUnique({ where: { id } });
    if (!current) return { success: false, error: "Gimnasio no encontrado." };

    const gym = await prisma.gymLocation.update({
      where: { id },
      data: { isActive: !current.isActive },
    });

    revalidatePath("/admin/gyms");
    return { success: true, data: gym };
  } catch (error: unknown) {
    console.error("Error toggling gym status:", error);
    return {
      success: false,
      error: "Error al cambiar el estado del gimnasio.",
    };
  }
}
