"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { ensureAdmin } from "./admin.actions";

export async function getCities(includeInactive = false) {
  try {
    const cities = await prisma.city.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { name: "asc" },
    });
    return { success: true, data: cities };
  } catch (error: unknown) {
    console.error("Error fetching cities:", error);
    return { success: false, error: "No se pudieron obtener las ciudades." };
  }
}

export async function createCity(data: { name: string; isActive?: boolean }) {
  try {
    await ensureAdmin();
    const city = await prisma.city.create({
      data: {
        name: data.name,
        isActive: data.isActive ?? true,
      },
    });
    revalidatePath("/admin/cities");
    revalidatePath("/admin/gyms");
    return { success: true, data: city };
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "Ya existe una ciudad con ese nombre." };
    }
    console.error("Error creating city:", error);
    return { success: false, error: "Error al crear la ciudad." };
  }
}

export async function updateCity(id: string, data: { name: string; isActive?: boolean }) {
  try {
    await ensureAdmin();
    const city = await prisma.city.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/cities");
    revalidatePath("/admin/gyms");
    return { success: true, data: city };
  } catch (error: unknown) {
    console.error("Error updating city:", error);
    return { success: false, error: "Error al actualizar la ciudad." };
  }
}

export async function toggleCityStatus(id: string) {
  try {
    await ensureAdmin();
    const current = await prisma.city.findUnique({ where: { id } });
    if (!current) return { success: false, error: "Ciudad no encontrada." };

    const city = await prisma.city.update({
      where: { id },
      data: { isActive: !current.isActive },
    });
    
    // Si desactivamos la ciudad, desactivamos los gimnasios?
    // El spec no lo indica estrictamente, pero revalidamos de todas formas.
    revalidatePath("/admin/cities");
    revalidatePath("/admin/gyms");
    
    return { success: true, data: city };
  } catch (error: unknown) {
    console.error("Error toggling city status:", error);
    return { success: false, error: "Error al cambiar el estado de la ciudad." };
  }
}
