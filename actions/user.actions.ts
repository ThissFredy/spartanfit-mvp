"use server";

import { createClient } from "@/utils/supabase/server";
import { UserService } from "@/lib/services/user.service";
import { UpdateUserProfileDTO } from "@/lib/types/user.types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfileAction(data: UpdateUserProfileDTO) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No estás autenticado");
  }

  if (data.activityIndex !== undefined && data.activityIndex !== null) {
    if (data.activityIndex < 1 || data.activityIndex > 10) {
      throw new Error("El índice de actividad debe estar entre 1 y 10");
    }
  }

  // Security hardening: perfil de usuario nunca puede asignar/editar roles.
  if (data.roleId) {
    throw new Error("No tienes permisos para modificar roles.");
  }

  await UserService.updateUserProfile(user.id, {
    ...data,
    roleId: undefined,
  });

  revalidatePath("/dashboard");
  revalidatePath("/profile");
}

export async function suspendAccountAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No estás autenticado");
  }

  await UserService.suspendUserAccount(user.id);

  await supabase.auth.signOut();
  redirect("/?suspended=true");
}
