"use client";

import { useState } from "react";
import { createExercise, updateExerciseStatus } from "@/actions/exercise.actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

type Exercise = {
  id: string;
  name: string;
  isActive: boolean;
};

export function ExercisesClient({ initialExercises }: { initialExercises: Exercise[] }) {
  const [exercises, setExercises] = useState(initialExercises);
  const [newExercise, setNewExercise] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const router = useRouter();
  const { pushToast } = useToast();

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newExercise.trim()) return;

    setLoading(true);
    const response = await createExercise(newExercise.trim());
    setLoading(false);

    if (response.success) {
      setNewExercise("");
      router.refresh();
      pushToast({
        variant: "success",
        title: "Ejercicio agregado",
        description: "Se creó correctamente en el catálogo.",
      });
      return;
    }

    pushToast({
      variant: "error",
      title: "No se pudo crear el ejercicio",
      description: response.error,
    });
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setSavingId(id);
    const response = await updateExerciseStatus(id, !currentStatus);
    setSavingId(null);

    if (response.success) {
      setExercises((prev) =>
        prev.map((exercise) =>
          exercise.id === id ? { ...exercise, isActive: !currentStatus } : exercise,
        ),
      );
      router.refresh();
      return;
    }

    pushToast({
      variant: "error",
      title: "No se pudo actualizar",
      description: response.error,
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="new-exercise" className="sr-only">
          Nombre del ejercicio
        </label>
        <Input
          id="new-exercise"
          type="text"
          value={newExercise}
          onChange={(event) => setNewExercise(event.target.value)}
          placeholder="Nombre del nuevo ejercicio"
          className="flex-1"
        />
        <Button type="submit" loading={loading}>
          Agregar
        </Button>
      </form>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-800/70">
              <tr>
                <th className="p-4 font-medium text-zinc-300">Ejercicio</th>
                <th className="p-4 text-center font-medium text-zinc-300">Estado</th>
                <th className="p-4 text-center font-medium text-zinc-300">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {exercises.map((exercise) => (
                <tr key={exercise.id} className="hover:bg-zinc-800/30">
                  <td className="p-4 font-medium capitalize text-zinc-100">{exercise.name}</td>
                  <td className="p-4 text-center">
                    <Badge variant={exercise.isActive ? "success" : "danger"}>
                      {exercise.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="p-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={savingId === exercise.id}
                      onClick={() => handleToggleStatus(exercise.id, exercise.isActive)}
                    >
                      {exercise.isActive ? "Desactivar" : "Activar"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {exercises.length === 0 && (
          <div className="p-8 text-center text-sm text-zinc-500">
            No hay ejercicios registrados. Agrega uno nuevo para comenzar.
          </div>
        )}
      </Card>
    </div>
  );
}

