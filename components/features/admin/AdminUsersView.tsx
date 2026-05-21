"use client";

import { useCallback, useEffect, useState } from "react";
import { UserFilters } from "./UserFilters";
import { UsersDataGrid } from "./UsersDataGrid";
import { AdminEditUserModal } from "./AdminEditUserModal";
import { getFilteredUsers, AdminUserFilters } from "@/actions/admin.actions";
import { AdminUserRecord, GymRecord, RoleOption } from "@/lib/types/admin.types";
import { useToast } from "@/components/ui/toast";

interface Props {
  roles: RoleOption[];
  locations: GymRecord[];
}

export function AdminUsersView({ roles, locations }: Props) {
  const [filters, setFilters] = useState<AdminUserFilters>({
    searchQuery: "",
    roleId: "ALL",
    ageRange: { min: 0, max: 150 },
    weightRange: { min: 0, max: 200 },
    includeNulls: true,
  });

  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const { pushToast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { users: fetchedUsers, totalCount: count } = await getFilteredUsers(filters, page, 10);
      setUsers(fetchedUsers as unknown as AdminUserRecord[]);
      setTotalCount(count);
    } catch (error) {
      console.error(error);
      pushToast({
        variant: "error",
        title: "No se pudieron cargar usuarios",
        description: "Intenta actualizar los filtros nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pushToast]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchUsers();
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [fetchUsers]);

  return (
    <div className="space-y-6">
      <UserFilters
        filters={filters}
        setFilters={(nextFilters) => {
          setFilters(nextFilters);
          setPage(1);
        }}
        roles={roles}
      />

      <UsersDataGrid
        users={users}
        totalCount={totalCount}
        page={page}
        setPage={setPage}
        isLoading={isLoading}
        onEdit={(user) => setEditingUser(user)}
      />

      {editingUser && (
        <AdminEditUserModal
          user={editingUser}
          roles={roles}
          locations={locations}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            void fetchUsers();
          }}
        />
      )}
    </div>
  );
}
