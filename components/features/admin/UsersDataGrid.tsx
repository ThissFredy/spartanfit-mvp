"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AdminUserRecord } from "@/lib/types/admin.types";

interface Props {
  users: AdminUserRecord[];
  totalCount: number;
  page: number;
  setPage: (page: number) => void;
  isLoading: boolean;
  onEdit: (user: AdminUserRecord) => void;
}

export function UsersDataGrid({ users, totalCount, page, setPage, isLoading, onEdit }: Props) {
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-200">
          <thead className="bg-zinc-800/70 text-[11px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">Edad</th>
              <th className="px-6 py-4">Peso</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                  <Spinner className="mx-auto mb-3 h-6 w-6" />
                  <p>Cargando datos de usuarios...</p>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No se encontraron usuarios que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="group transition-colors hover:bg-zinc-800/40">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-100">{user.name}</div>
                    <div className="mt-0.5 text-xs text-zinc-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="muted">{user.role?.name || "Sin rol"}</Badge>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{user.age ? `${user.age} años` : "-"}</td>
                  <td className="px-6 py-4 text-zinc-300">{user.weight ? `${user.weight} kg` : "-"}</td>
                  <td className="px-6 py-4">
                    <Badge variant={user.status === "ACTIVE" ? "success" : "danger"}>
                      {user.status === "ACTIVE" ? "Activo" : "Suspendido"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit(user)}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-950/60 px-6 py-4">
        <span className="text-sm text-zinc-400">
          Mostrando <span className="text-zinc-200">{totalCount > 0 ? (page - 1) * pageSize + 1 : 0}</span> a{" "}
          <span className="text-zinc-200">{Math.min(page * pageSize, totalCount)}</span> de{" "}
          <span className="text-zinc-200">{totalCount}</span>
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages || totalCount === 0}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}

