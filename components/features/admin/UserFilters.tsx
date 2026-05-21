"use client";

import { AdminUserFilters } from "@/actions/admin.actions";
import { Select } from "@/components/ui/select";
import { RoleOption } from "@/lib/types/admin.types";

interface Props {
  filters: AdminUserFilters;
  setFilters: (filters: AdminUserFilters) => void;
  roles: RoleOption[];
}

const defaultAgeRange = { min: 0, max: 150 };
const defaultWeightRange = { min: 0, max: 200 };

export function UserFilters({ filters, setFilters, roles }: Props) {
  const ageRange = filters.ageRange ?? defaultAgeRange;
  const weightRange = filters.weightRange ?? defaultWeightRange;

  return (
    <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
      <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Filtros de búsqueda</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="user-search" className="mb-2 block text-sm font-medium text-zinc-300">
            Buscar por nombre
          </label>
          <input
            id="user-search"
            type="text"
            placeholder="Ej. Juan Perez"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spartan/70"
            value={filters.searchQuery || ""}
            onChange={(event) => setFilters({ ...filters, searchQuery: event.target.value })}
          />
        </div>

        <div>
          <label htmlFor="role-filter" className="mb-2 block text-sm font-medium text-zinc-300">
            Rol
          </label>
          <Select
            id="role-filter"
            value={filters.roleId || "ALL"}
            onChange={(event) => setFilters({ ...filters, roleId: event.target.value })}
          >
            <option value="ALL">Todos los roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-2 flex justify-between text-sm font-medium text-zinc-300">
            <span>Edad</span>
            <span className="font-semibold text-zinc-100">
              {ageRange.min} - {ageRange.max}
            </span>
          </label>
          <div className="flex items-center gap-4">
            <input
              aria-label="Edad minima"
              type="range"
              min="0"
              max="150"
              value={ageRange.min}
              onChange={(event) =>
                setFilters({ ...filters, ageRange: { ...ageRange, min: Number(event.target.value) } })
              }
              className="w-1/2 accent-spartan"
            />
            <input
              aria-label="Edad maxima"
              type="range"
              min="0"
              max="150"
              value={ageRange.max}
              onChange={(event) =>
                setFilters({ ...filters, ageRange: { ...ageRange, max: Number(event.target.value) } })
              }
              className="w-1/2 accent-spartan"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 flex justify-between text-sm font-medium text-zinc-300">
            <span>Peso (kg)</span>
            <span className="font-semibold text-zinc-100">
              {weightRange.min} - {weightRange.max}
            </span>
          </label>
          <div className="flex items-center gap-4">
            <input
              aria-label="Peso minimo"
              type="range"
              min="0"
              max="200"
              value={weightRange.min}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  weightRange: { ...weightRange, min: Number(event.target.value) },
                })
              }
              className="w-1/2 accent-spartan"
            />
            <input
              aria-label="Peso maximo"
              type="range"
              min="0"
              max="200"
              value={weightRange.max}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  weightRange: { ...weightRange, max: Number(event.target.value) },
                })
              }
              className="w-1/2 accent-spartan"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          id="includeNulls"
          checked={filters.includeNulls}
          onChange={(event) => setFilters({ ...filters, includeNulls: event.target.checked })}
          className="h-5 w-5 accent-spartan"
        />
        <label
          htmlFor="includeNulls"
          className="cursor-pointer select-none text-sm font-medium text-zinc-300"
        >
          Incluir usuarios sin edad o peso especificado
        </label>
      </div>
    </div>
  );
}

