"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <ErrorState
          title="Algo salió mal"
          description="No pudimos cargar esta vista. Puedes intentarlo de nuevo."
          action={
            <Button type="button" onClick={reset}>
              Reintentar
            </Button>
          }
        />
      </div>
    </div>
  );
}
