import prisma from "@/lib/prisma";
import { UpdateUserProfileDTO, UserProfileResponse } from "../types/user.types";

interface AuthUserInput {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string;
  } | null;
}

export class UserService {
  
  /**
   * Syncs a Supabase auth user with Prisma User table.
   */
  static async syncUser(authUser: AuthUserInput): Promise<UserProfileResponse> {
    const user = await prisma.user.upsert({
      where: { id: authUser.id },
      update: {},
      create: {
        id: authUser.id,
        email: authUser.email || "",
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || "Usuario",
        goal: "pending",
      },
      include: {
        userGyms: { include: { gymLocation: true } },
        role: true,
      },
    });
    return user as unknown as UserProfileResponse;
  }

  /**
   * Retrieves the user profile including related gym location and role.
   */
  static async getUserProfile(userId: string): Promise<UserProfileResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userGyms: { include: { gymLocation: true } },
        role: true,
      },
    });
    
    return user as unknown as UserProfileResponse | null;
  }

  /**
   * Updates the user profile with the provided data.
   */
  static async updateUserProfile(userId: string, data: UpdateUserProfileDTO): Promise<UserProfileResponse> {
    const { gymIds, ...restData } = data;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...restData,
        ...(gymIds && {
          userGyms: {
            deleteMany: {},
            create: gymIds.map(gymId => ({ gymLocationId: gymId }))
          }
        })
      },
      include: {
        userGyms: { include: { gymLocation: true } },
        role: true,
      },
    });

    return user as unknown as UserProfileResponse;
  }

  /**
   * Suspends a user account (Soft Delete).
   */
  static async suspendUserAccount(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { status: "SUSPENDED" },
    });
  }

  /**
   * Fetches all gym locations for selection dropdowns.
   */
  static async getGymLocations() {
    return prisma.gymLocation.findMany();
  }

  /**
   * Fetches all roles for selection dropdowns.
   */
  static async getRoles() {
    return prisma.role.findMany();
  }
}
