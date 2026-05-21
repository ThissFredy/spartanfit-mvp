"use client";

import { useMemo, useState } from "react";
import { updateUserAsAdmin } from "@/actions/admin.actions";
import { GymMultiSelect } from "../users/GymMultiSelect";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { AdminUserRecord, GymRecord, RoleOption } from "@/lib/types/admin.types";

interface Props {
  user: AdminUserRecord;
  roles: RoleOption[];
  locations: GymRecord[];
  onClose: () => void;
  onSuccess: () => void;
}

interface FormState {
  age: string;
  weight: string;
  height: string;
  activityIndex: string;
  roleId: string;
  gymIds: string[];
  status: "ACTIVE" | "SUSPENDED";
}

export function AdminEditUserModal({ user, roles, locations, onClose, onSuccess }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    age: user.age ? String(user.age) : "",
    weight: user.weight ? String(user.weight) : "",
    height: user.height ? String(user.height) : "",
    activityIndex: user.activityIndex ? String(user.activityIndex) : "",
    roleId: user.roleId || "",
    gymIds: user.userGyms.map((userGym) => userGym.gymLocation.id),
    status: user.status,
  });
  const { pushToast } = useToast();

  const payload = useMemo(
    () => ({
      age: formData.age ? Number(formData.age) : null,
      weight: formData.weight ? Number(formData.weight) : null,
      height: formData.height ? Number(formData.height) : null,
      activityIndex: formData.activityIndex ? Number(formData.activityIndex) : null,
      roleId: formData.roleId || null,
      gymIds: formData.gymIds,
      status: formData.status,
    }),
    [formData],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await updateUserAsAdmin(user.id, payload);
      pushToast({
        variant: "success",
        title: "Usuario actualizado",
        description: "Los cambios se guardaron correctamente.",
      });
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Hubo un error al guardar los cambios.";
      pushToast({
        variant: "error",
        title: "No se pudo guardar",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Editar perfil"
      description={`Modificando a ${user.name}`}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Nombre</label>
            <Input value={user.name} readOnly disabled />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Correo</label>
            <Input value={user.email} readOnly disabled />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="admin-age" className="mb-1 block text-sm text-zinc-300">
              Edad
            </label>
            <Input
              id="admin-age"
              type="number"
              value={formData.age}
              onChange={(event) => setFormData((prev) => ({ ...prev, age: event.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="admin-weight" className="mb-1 block text-sm text-zinc-300">
              Peso (kg)
            </label>
            <Input
              id="admin-weight"
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(event) => setFormData((prev) => ({ ...prev, weight: event.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="admin-height" className="mb-1 block text-sm text-zinc-300">
              Altura (cm)
            </label>
            <Input
              id="admin-height"
              type="number"
              step="0.1"
              value={formData.height}
              onChange={(event) => setFormData((prev) => ({ ...prev, height: event.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="admin-activity" className="mb-1 block text-sm text-zinc-300">
              Índice actividad
            </label>
            <Input
              id="admin-activity"
              type="number"
              min={1}
              max={10}
              value={formData.activityIndex}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, activityIndex: event.target.value }))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="admin-role" className="mb-1 block text-sm text-zinc-300">
              Rol
            </label>
            <Select
              id="admin-role"
              value={formData.roleId}
              onChange={(event) => setFormData((prev) => ({ ...prev, roleId: event.target.value }))}
            >
              <option value="">Sin rol (usuario base)</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="admin-status" className="mb-1 block text-sm text-zinc-300">
              Estado de cuenta
            </label>
            <Select
              id="admin-status"
              value={formData.status}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  status: event.target.value as "ACTIVE" | "SUSPENDED",
                }))
              }
            >
              <option value="ACTIVE">Activo</option>
              <option value="SUSPENDED">Suspendido</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-300">Gimnasios</label>
          <GymMultiSelect
            gyms={locations.map((location) => ({ id: location.id, name: location.name }))}
            initialSelectedIds={formData.gymIds}
            onChange={(gymIds) => setFormData((prev) => ({ ...prev, gymIds }))}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSaving}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

