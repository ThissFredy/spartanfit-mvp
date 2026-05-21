"use client";

import { useMemo, useState, useTransition } from "react";
import { updateProfileAction, suspendAccountAction } from "@/actions/user.actions";
import { UserProfileResponse } from "@/lib/types/user.types";
import { GymMultiSelect } from "./../users/GymMultiSelect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ErrorState } from "@/components/ui/error-state";

interface Props {
  user: UserProfileResponse;
  gyms: { id: string; name: string }[];
}

interface FormState {
  name: string;
  age: string;
  weight: string;
  height: string;
  activityIndex: string;
  goal: string;
}

const defaultGoal = "pending";

export function ProfileForm({ user, gyms }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectedGymIds, setSelectedGymIds] = useState<string[]>(
    user.userGyms?.map((userGym) => userGym.gymLocation.id) || [],
  );
  const [form, setForm] = useState<FormState>({
    name: user.name || "",
    age: user.age ? String(user.age) : "",
    weight: user.weight ? String(user.weight) : "",
    height: user.height ? String(user.height) : "",
    activityIndex: user.activityIndex ? String(user.activityIndex) : "",
    goal: user.goal || defaultGoal,
  });

  const { pushToast } = useToast();

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const parsedPayload = useMemo(() => {
    const toNumberOrNull = (value: string) => {
      if (!value.trim()) return null;
      return Number(value);
    };

    return {
      name: form.name.trim(),
      age: toNumberOrNull(form.age),
      weight: toNumberOrNull(form.weight),
      height: toNumberOrNull(form.height),
      activityIndex: toNumberOrNull(form.activityIndex),
      goal: form.goal,
      gymIds: selectedGymIds,
    };
  }, [form, selectedGymIds]);

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!parsedPayload.name || parsedPayload.name.length < 2) {
      nextErrors.name = "Ingresa un nombre válido de al menos 2 caracteres.";
    }

    if (parsedPayload.age !== null && (parsedPayload.age < 10 || parsedPayload.age > 100)) {
      nextErrors.age = "La edad debe estar entre 10 y 100.";
    }

    if (parsedPayload.weight !== null && (parsedPayload.weight < 20 || parsedPayload.weight > 400)) {
      nextErrors.weight = "El peso debe estar entre 20 y 400 kg.";
    }

    if (parsedPayload.height !== null && (parsedPayload.height < 80 || parsedPayload.height > 250)) {
      nextErrors.height = "La altura debe estar entre 80 y 250 cm.";
    }

    if (
      parsedPayload.activityIndex !== null &&
      (parsedPayload.activityIndex < 1 || parsedPayload.activityIndex > 10)
    ) {
      nextErrors.activityIndex = "El índice de actividad debe estar entre 1 y 10.";
    }

    if (!parsedPayload.goal || parsedPayload.goal === defaultGoal) {
      nextErrors.goal = "Selecciona un objetivo principal.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      pushToast({
        variant: "error",
        title: "Revisa el formulario",
        description: "Hay campos pendientes o con valores inválidos.",
      });
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        await updateProfileAction(parsedPayload);
        pushToast({
          variant: "success",
          title: "Perfil actualizado",
          description: "Tus cambios se guardaron correctamente.",
        });
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "Error al actualizar perfil";
        setError(message);
        pushToast({
          variant: "error",
          title: "No se pudo actualizar",
          description: message,
        });
      }
    });
  };

  const confirmSuspend = () => {
    startTransition(async () => {
      try {
        setError(null);
        await suspendAccountAction();
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "Error al suspender cuenta";
        setError(message);
        pushToast({
          variant: "error",
          title: "No se pudo eliminar la cuenta",
          description: message,
        });
      }
    });
  };

  return (
    <>
      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Mi perfil</CardTitle>
          <CardDescription>
            Completa tus datos para personalizar tu plan de entrenamiento y seguimiento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-5">
              <ErrorState description={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-zinc-300">
                Nombre
              </label>
              <Input
                id="name"
                name="name"
                value={form.name}
                hasError={Boolean(fieldErrors.name)}
                onChange={(event) => updateField("name", event.target.value)}
                disabled={isPending}
                required
              />
              {fieldErrors.name && <p className="text-xs text-red-300">{fieldErrors.name}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="age" className="text-sm font-medium text-zinc-300">
                  Edad
                </label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={form.age}
                  hasError={Boolean(fieldErrors.age)}
                  onChange={(event) => updateField("age", event.target.value)}
                  disabled={isPending}
                />
                {fieldErrors.age && <p className="text-xs text-red-300">{fieldErrors.age}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="weight" className="text-sm font-medium text-zinc-300">
                  Peso (kg)
                </label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  value={form.weight}
                  hasError={Boolean(fieldErrors.weight)}
                  onChange={(event) => updateField("weight", event.target.value)}
                  disabled={isPending}
                />
                {fieldErrors.weight && <p className="text-xs text-red-300">{fieldErrors.weight}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="height" className="text-sm font-medium text-zinc-300">
                  Altura (cm)
                </label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  step="0.1"
                  value={form.height}
                  hasError={Boolean(fieldErrors.height)}
                  onChange={(event) => updateField("height", event.target.value)}
                  disabled={isPending}
                />
                {fieldErrors.height && <p className="text-xs text-red-300">{fieldErrors.height}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="activityIndex" className="text-sm font-medium text-zinc-300">
                  Índice de actividad (1-10)
                </label>
                <Input
                  id="activityIndex"
                  name="activityIndex"
                  type="number"
                  min={1}
                  max={10}
                  value={form.activityIndex}
                  hasError={Boolean(fieldErrors.activityIndex)}
                  onChange={(event) => updateField("activityIndex", event.target.value)}
                  disabled={isPending}
                />
                {fieldErrors.activityIndex && (
                  <p className="text-xs text-red-300">{fieldErrors.activityIndex}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="goal" className="text-sm font-medium text-zinc-300">
                Objetivo principal
              </label>
              <Select
                id="goal"
                name="goal"
                value={form.goal}
                hasError={Boolean(fieldErrors.goal)}
                onChange={(event) => updateField("goal", event.target.value)}
                disabled={isPending}
              >
                <option value={defaultGoal} disabled>
                  Selecciona un objetivo...
                </option>
                <option value="hipertrofia">Hipertrofia</option>
                <option value="fuerza">Fuerza</option>
                <option value="perdida de peso">Pérdida de peso</option>
                <option value="mantencion">Mantención</option>
                <option value="salud general">Salud general</option>
              </Select>
              {fieldErrors.goal && <p className="text-xs text-red-300">{fieldErrors.goal}</p>}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-300">Gimnasios a los que asistes</p>
              <GymMultiSelect
                gyms={gyms}
                initialSelectedIds={selectedGymIds}
                onChange={setSelectedGymIds}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Rol asignado</label>
              <Input value={user.role?.name || "Usuario"} readOnly disabled />
              <p className="text-xs text-zinc-500">
                El rol de acceso lo asigna únicamente un administrador.
              </p>
            </div>

            <Button type="submit" loading={isPending} className="w-full sm:w-auto">
              Guardar perfil
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mx-auto mt-6 w-full max-w-3xl border-red-500/30 bg-red-500/5">
        <CardHeader>
          <CardTitle className="text-red-200">Zona de peligro</CardTitle>
          <CardDescription>
            Eliminar tu cuenta suspenderá tu acceso inmediatamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="danger" onClick={() => setIsSuspendOpen(true)} disabled={isPending}>
            Eliminar cuenta
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={isSuspendOpen}
        onOpenChange={setIsSuspendOpen}
        title="¿Eliminar cuenta?"
        description="Esta acción suspenderá tu acceso de manera inmediata."
        confirmText="Sí, eliminar"
        onConfirm={confirmSuspend}
        pending={isPending}
      />
    </>
  );
}
