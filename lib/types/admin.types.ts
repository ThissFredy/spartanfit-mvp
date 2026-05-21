export interface RoleOption {
  id: string;
  name: string;
}

export interface CityRecord {
  id: string;
  name: string;
  isActive: boolean;
}

export interface GymRecord {
  id: string;
  name: string;
  address: string | null;
  cityId: string;
  isActive: boolean;
  city?: {
    id: string;
    name: string;
    isActive?: boolean;
  } | null;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  age: number | null;
  weight: number | null;
  height: number | null;
  activityIndex: number | null;
  goal: string;
  roleId: string | null;
  status: "ACTIVE" | "SUSPENDED";
  role: {
    id: string;
    name: string;
  } | null;
  userGyms: {
    gymLocation: {
      id: string;
      name: string;
    };
  }[];
}
