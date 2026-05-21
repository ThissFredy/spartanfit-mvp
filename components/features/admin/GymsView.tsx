"use client";

import { useState } from "react";
import { createGym, toggleGymStatus, updateGym } from "@/actions/gym.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { CityRecord, GymRecord } from "@/lib/types/admin.types";

interface Props {
  initialGyms: GymRecord[];
  activeCities: CityRecord[];
}

interface GymFormState {
  name: string;
  address: string;
  cityId: string;
  isActive: boolean;
}

export function GymsView({ initialGyms, activeCities }: Props) {
  const [gyms, setGyms] = useState<GymRecord[]>(initialGyms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGym, setEditingGym] = useState<GymRecord | null>(null);
  const [formData, setFormData] = useState<GymFormState>({
    name: "",
    address: "",
    cityId: activeCities[0]?.id || "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const { pushToast } = useToast();

  const handleOpenModal = (gym?: GymRecord) => {
    if (gym) {
      setEditingGym(gym);
      setFormData({
        name: gym.name,
        address: gym.address || "",
        cityId: gym.cityId,
        isActive: gym.isActive,
      });
    } else {
      setEditingGym(null);
      setFormData({
        name: "",
        address: "",
        cityId: activeCities[0]?.id || "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.cityId) {
      pushToast({
        variant: "error",
        title: "Selecciona una ciudad",
      });
      return;
    }

    setLoading(true);
    const response = editingGym
      ? await updateGym(editingGym.id, formData)
      : await createGym(formData);
    setLoading(false);

    if (response.success && response.data) {
      const selectedCity = activeCities.find((city) => city.id === formData.cityId);
      const savedGym: GymRecord = {
        ...(response.data as GymRecord),
        city: selectedCity ? { id: selectedCity.id, name: selectedCity.name } : editingGym?.city,
      };

      if (editingGym) {
        setGyms((prev) => prev.map((gym) => (gym.id === savedGym.id ? savedGym : gym)));
      } else {
        setGyms((prev) => [...prev, savedGym]);
      }

      setIsModalOpen(false);
      pushToast({
        variant: "success",
        title: editingGym ? "Gimnasio actualizado" : "Gimnasio creado",
      });
      return;
    }

    pushToast({
      variant: "error",
      title: "No se pudo guardar",
      description: response.error || "Error inesperado",
    });
  };

  const handleToggleStatus = async (id: string) => {
    const response = await toggleGymStatus(id);
    if (response.success && response.data) {
      const nextGym = response.data as GymRecord;
      setGyms((prev) =>
        prev.map((gym) =>
          gym.id === id
            ? {
                ...gym,
                isActive: nextGym.isActive,
              }
            : gym,
        ),
      );
      return;
    }

    pushToast({
      variant: "error",
      title: "No se pudo actualizar estado",
      description: response.error || "Error inesperado",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenModal()}>+ Nuevo gimnasio</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70">
        <table className="w-full text-left text-sm text-zinc-200">
          <thead className="border-b border-zinc-800 bg-zinc-800/70 text-xs uppercase text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Nombre</th>
              <th className="px-6 py-4 font-medium">Ciudad</th>
              <th className="px-6 py-4 font-medium">Dirección</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {gyms.map((gym) => (
              <tr key={gym.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-6 py-4 font-medium">{gym.name}</td>
                <td className="px-6 py-4 text-zinc-300">{gym.city?.name || "N/A"}</td>
                <td className="px-6 py-4 text-zinc-300">{gym.address || "-"}</td>
                <td className="px-6 py-4">
                  <Badge variant={gym.isActive ? "success" : "danger"}>
                    {gym.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
                <td className="space-x-2 px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenModal(gym)}>
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(gym.id)}>
                    {gym.isActive ? "Desactivar" : "Activar"}
                  </Button>
                </td>
              </tr>
            ))}
            {gyms.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                  No hay gimnasios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingGym ? "Editar gimnasio" : "Nuevo gimnasio"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="gym-name" className="mb-1 block text-sm text-zinc-300">
              Nombre
            </label>
            <Input
              id="gym-name"
              type="text"
              required
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Ej. Sede central"
            />
          </div>

          <div>
            <label htmlFor="gym-city" className="mb-1 block text-sm text-zinc-300">
              Ciudad
            </label>
            <Select
              id="gym-city"
              required
              value={formData.cityId}
              onChange={(event) => setFormData((prev) => ({ ...prev, cityId: event.target.value }))}
            >
              {activeCities.length === 0 && (
                <option value="" disabled>
                  No hay ciudades activas
                </option>
              )}
              {activeCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="gym-address" className="mb-1 block text-sm text-zinc-300">
              Dirección (opcional)
            </label>
            <Input
              id="gym-address"
              type="text"
              value={formData.address}
              onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))}
              placeholder="Calle principal 123"
            />
          </div>

          {!editingGym && (
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, isActive: event.target.checked }))
                }
                className="h-4 w-4 accent-spartan"
              />
              Activo desde su creación
            </label>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading} disabled={activeCities.length === 0}>
              Guardar
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

