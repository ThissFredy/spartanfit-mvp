"use client";

import { useState } from "react";
import { createCity, toggleCityStatus, updateCity } from "@/actions/city.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { CityRecord } from "@/lib/types/admin.types";

interface Props {
  initialCities: CityRecord[];
}

export function CitiesView({ initialCities }: Props) {
  const [cities, setCities] = useState<CityRecord[]>(initialCities);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<CityRecord | null>(null);
  const [formData, setFormData] = useState({ name: "", isActive: true });
  const [loading, setLoading] = useState(false);
  const { pushToast } = useToast();

  const handleOpenModal = (city?: CityRecord) => {
    if (city) {
      setEditingCity(city);
      setFormData({ name: city.name, isActive: city.isActive });
    } else {
      setEditingCity(null);
      setFormData({ name: "", isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const response = editingCity
      ? await updateCity(editingCity.id, formData)
      : await createCity(formData);

    setLoading(false);

    if (response.success && response.data) {
      const savedCity = response.data as CityRecord;
      if (editingCity) {
        setCities((prev) => prev.map((city) => (city.id === savedCity.id ? savedCity : city)));
      } else {
        setCities((prev) => [...prev, savedCity]);
      }
      setIsModalOpen(false);
      pushToast({
        variant: "success",
        title: editingCity ? "Ciudad actualizada" : "Ciudad creada",
      });
      return;
    }

    pushToast({
      variant: "error",
      title: "No se pudo guardar la ciudad",
      description: response.error || "Error inesperado",
    });
  };

  const handleToggleStatus = async (id: string) => {
    const response = await toggleCityStatus(id);
    if (response.success && response.data) {
      setCities((prev) =>
        prev.map((city) => (city.id === id ? (response.data as CityRecord) : city)),
      );
      return;
    }

    pushToast({
      variant: "error",
      title: "No se pudo cambiar el estado",
      description: response.error || "Error inesperado",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenModal()}>+ Nueva ciudad</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70">
        <table className="w-full text-left text-sm text-zinc-200">
          <thead className="border-b border-zinc-800 bg-zinc-800/70 text-xs uppercase text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Nombre</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {cities.map((city) => (
              <tr key={city.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-6 py-4 font-medium">{city.name}</td>
                <td className="px-6 py-4">
                  <Badge variant={city.isActive ? "success" : "danger"}>
                    {city.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
                <td className="space-x-2 px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenModal(city)}>
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(city.id)}>
                    {city.isActive ? "Desactivar" : "Activar"}
                  </Button>
                </td>
              </tr>
            ))}
            {cities.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">
                  No hay ciudades registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingCity ? "Editar ciudad" : "Nueva ciudad"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="city-name" className="mb-1 block text-sm text-zinc-300">
              Nombre de la ciudad
            </label>
            <Input
              id="city-name"
              type="text"
              required
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Ej. Ciudad de Mexico"
            />
          </div>

          {!editingCity && (
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
            <Button type="submit" loading={loading}>
              Guardar
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

