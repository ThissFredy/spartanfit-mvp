"use client";

import { useMemo, useState } from "react";
import { addWorkoutLog } from "@/actions/workout.actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

interface WorkoutFormState {
  exerciseId: string;
  sets: string;
  reps: string;
  weightLoad: string;
  recordedAt: string;
}

function getLocalIsoTime() {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(Date.now() - tzOffset).toISOString().slice(0, 16);
}

export function AddWorkoutModal({
  userId,
  exercises,
}: {
  userId: string;
  exercises: { id: string; name: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { pushToast } = useToast();

  const [formData, setFormData] = useState<WorkoutFormState>({
    exerciseId: "",
    sets: "1",
    reps: "1",
    weightLoad: "0",
    recordedAt: getLocalIsoTime(),
  });

  const resetForm = () => {
    setFormData({
      exerciseId: "",
      sets: "1",
      reps: "1",
      weightLoad: "0",
      recordedAt: getLocalIsoTime(),
    });
    setFieldErrors({});
    setError(null);
  };

  const updateField = (field: keyof WorkoutFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const payload = useMemo(() => {
    return {
      exerciseId: formData.exerciseId,
      sets: Number(formData.sets),
      reps: Number(formData.reps),
      weightLoad: Number(formData.weightLoad),
      recordedAt: new Date(formData.recordedAt),
    };
  }, [formData]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!payload.exerciseId) {
      nextErrors.exerciseId = "Selecciona un ejercicio.";
    }

    if (!Number.isFinite(payload.sets) || payload.sets < 1 || payload.sets > 20) {
      nextErrors.sets = "Los sets deben estar entre 1 y 20.";
    }

    if (!Number.isFinite(payload.reps) || payload.reps < 1 || payload.reps > 100) {
      nextErrors.reps = "Las repeticiones deben estar entre 1 y 100.";
    }

    if (!Number.isFinite(payload.weightLoad) || payload.weightLoad < 0 || payload.weightLoad > 1000) {
      nextErrors.weightLoad = "El peso debe estar entre 0 y 1000 kg.";
    }

    if (Number.isNaN(payload.recordedAt.getTime())) {
      nextErrors.recordedAt = "Selecciona una fecha válida.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      pushToast({
        variant: "error",
        title: "Revisa los campos",
        description: "Hay valores inválidos en el entrenamiento.",
      });
      return;
    }

    setLoading(true);
    setError(null);

    const response = await addWorkoutLog({
      userId,
      exerciseId: payload.exerciseId,
      sets: payload.sets,
      reps: payload.reps,
      weightLoad: payload.weightLoad,
      recordedAt: payload.recordedAt,
    });

    setLoading(false);

    if (response.success) {
      setIsOpen(false);
      resetForm();
      router.refresh();
      pushToast({
        variant: "success",
        title: "Entrenamiento guardado",
        description: "Tu registro ya aparece en el historial y progreso.",
      });
      return;
    }

    const message = response.error || "Hubo un error al registrar el entrenamiento.";
    setError(message);
    pushToast({
      variant: "error",
      title: "No se pudo guardar",
      description: message,
    });
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>+ Agregar entrenamiento</Button>

      <Dialog
        open={isOpen}
        onOpenChange={(nextOpen) => {
          setIsOpen(nextOpen);
          if (!nextOpen) resetForm();
        }}
        title="Registrar entrenamiento"
        description="Guarda tus series para actualizar métricas de progreso."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="workout-recordedAt" className="mb-1 block text-sm text-zinc-300">
              Fecha y hora
            </label>
            <Input
              id="workout-recordedAt"
              type="datetime-local"
              value={formData.recordedAt}
              hasError={Boolean(fieldErrors.recordedAt)}
              onChange={(event) => updateField("recordedAt", event.target.value)}
              required
              disabled={loading}
            />
            {fieldErrors.recordedAt && <p className="mt-1 text-xs text-red-300">{fieldErrors.recordedAt}</p>}
          </div>

          <div>
            <label htmlFor="workout-exercise" className="mb-1 block text-sm text-zinc-300">
              Ejercicio
            </label>
            <Select
              id="workout-exercise"
              value={formData.exerciseId}
              hasError={Boolean(fieldErrors.exerciseId)}
              onChange={(event) => updateField("exerciseId", event.target.value)}
              required
              disabled={loading}
            >
              <option value="" disabled>
                Selecciona un ejercicio
              </option>
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </Select>
            {fieldErrors.exerciseId && <p className="mt-1 text-xs text-red-300">{fieldErrors.exerciseId}</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="workout-sets" className="mb-1 block text-sm text-zinc-300">
                Sets
              </label>
              <Input
                id="workout-sets"
                type="number"
                min={1}
                value={formData.sets}
                hasError={Boolean(fieldErrors.sets)}
                onChange={(event) => updateField("sets", event.target.value)}
                required
                disabled={loading}
              />
              {fieldErrors.sets && <p className="mt-1 text-xs text-red-300">{fieldErrors.sets}</p>}
            </div>
            <div>
              <label htmlFor="workout-reps" className="mb-1 block text-sm text-zinc-300">
                Reps
              </label>
              <Input
                id="workout-reps"
                type="number"
                min={1}
                value={formData.reps}
                hasError={Boolean(fieldErrors.reps)}
                onChange={(event) => updateField("reps", event.target.value)}
                required
                disabled={loading}
              />
              {fieldErrors.reps && <p className="mt-1 text-xs text-red-300">{fieldErrors.reps}</p>}
            </div>
            <div>
              <label htmlFor="workout-weight" className="mb-1 block text-sm text-zinc-300">
                Peso (kg)
              </label>
              <Input
                id="workout-weight"
                type="number"
                min={0}
                step="0.1"
                value={formData.weightLoad}
                hasError={Boolean(fieldErrors.weightLoad)}
                onChange={(event) => updateField("weightLoad", event.target.value)}
                required
                disabled={loading}
              />
              {fieldErrors.weightLoad && <p className="mt-1 text-xs text-red-300">{fieldErrors.weightLoad}</p>}
            </div>
          </div>

          {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Guardar
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

