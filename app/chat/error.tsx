"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function ChatError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <ErrorState
        title="No se pudo abrir el chat"
        description="Tuvimos un problema al cargar tus mensajes. Intenta nuevamente."
        action={
          <Button onClick={reset} type="button">
            Reintentar
          </Button>
        }
      />
    </div>
  );
}
