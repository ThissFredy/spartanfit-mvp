"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-zinc-950 px-4 text-zinc-100">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-semibold">Error inesperado</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Ocurrió un problema interno. Intenta cargar de nuevo.
          </p>
          <Button type="button" className="mt-5" onClick={reset}>
            Reintentar
          </Button>
        </main>
      </body>
    </html>
  );
}
