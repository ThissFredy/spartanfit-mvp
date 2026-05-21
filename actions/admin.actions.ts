"use server";

import { createClient } from "@/utils/supabase/server";
import { UserService } from "@/lib/services/user.service";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UpdateUserProfileDTO } from "@/lib/types/user.types";
import { Prisma } from "@prisma/client";

export interface AdminUserFilters {
  searchQuery?: string;
  roleId?: string;
  ageRange?: { min: number; max: number };
  weightRange?: { min: number; max: number };
  includeNulls: boolean;
}

// Ensure the caller is an admin
async function ensureAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No estás autenticado");
  }

  const dbUser = await UserService.getUserProfile(user.id);
  if (dbUser?.role?.name !== "ADMIN") {
    throw new Error("Acceso denegado. Se requieren privilegios de Administrador.");
  }

  return user.id;
}

export async function getFilteredUsers(filters: AdminUserFilters, page: number = 1, pageSize: number = 10) {
  await ensureAdmin();

  const skip = (page - 1) * pageSize;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (filters.searchQuery) {
    andConditions.push({ name: { contains: filters.searchQuery, mode: "insensitive" } });
  }

  if (filters.roleId && filters.roleId !== "ALL") {
    andConditions.push({ roleId: filters.roleId });
  }

  // Age logic
  if (filters.ageRange) {
    const ageCondition = { age: { gte: filters.ageRange.min, lte: filters.ageRange.max } };
    if (filters.includeNulls) {
      andConditions.push({ OR: [ageCondition, { age: null }] });
    } else {
      andConditions.push(ageCondition);
    }
  }

  // Weight logic
  if (filters.weightRange) {
    const weightCondition = { weight: { gte: filters.weightRange.min, lte: filters.weightRange.max } };
    if (filters.includeNulls) {
      andConditions.push({ OR: [weightCondition, { weight: null }] });
    } else {
      andConditions.push(weightCondition);
    }
  }

  const whereClause: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      include: {
        role: true,
        userGyms: { include: { gymLocation: true } },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  return { users, totalCount };
}

// Omit name and email
export async function updateUserAsAdmin(
  userId: string,
  data: Omit<Partial<UpdateUserProfileDTO>, "name"> & { status?: "ACTIVE" | "SUSPENDED" },
) {
  await ensureAdmin();

  const { gymIds, ...safeData } = data;

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...safeData,
      ...(gymIds && {
        userGyms: {
          deleteMany: {},
          create: gymIds.map(gymId => ({ gymLocationId: gymId }))
        }
      })
    },
  });

  revalidatePath("/admin/users");
}
