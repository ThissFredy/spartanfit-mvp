"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <ErrorState
        title="No se pudo cargar el dashboard"
        description="Hubo un problema al consultar tus datos de entrenamiento."
        action={
          <Button onClick={reset} type="button">
            Reintentar
          </Button>
        }
      />
    </div>
  );
}
