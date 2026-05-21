import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-spartan-light">404</p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-100">Página no encontrada</h1>
        <p className="mt-3 text-sm text-zinc-400">
          La ruta que buscas no existe o fue movida.
        </p>
        <Link href="/" className="mt-6 inline-flex">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
