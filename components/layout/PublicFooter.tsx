import Image from "next/image";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Image src="/icon.png" alt="Logo SpartanFit" width={34} height={34} className="rounded-lg" />
            <p className="text-base font-semibold text-zinc-100">SpartanFit</p>
          </div>
          <p className="text-sm text-zinc-400">
            Entrenamiento inteligente para hipertrofia, fuerza y rendimiento sostenible.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-300">Navegación</p>
          <div className="space-y-2 text-sm text-zinc-400">
            <a href="#beneficios" className="block hover:text-zinc-100">Beneficios</a>
            <a href="#funcionamiento" className="block hover:text-zinc-100">Cómo funciona</a>
            <a href="#coach" className="block hover:text-zinc-100">Coach IA</a>
            <a href="#progreso" className="block hover:text-zinc-100">Progreso</a>
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-300">Legal</p>
          <div className="space-y-2 text-sm text-zinc-400">
            <Link href="/" className="block hover:text-zinc-100">Privacidad</Link>
            <Link href="/" className="block hover:text-zinc-100">Términos</Link>
            <Link href="/" className="block hover:text-zinc-100">Contacto</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-800/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} SpartanFit. Todos los derechos reservados.</p>
          <p>Forjamos disciplina con datos y coaching asistido por IA.</p>
        </div>
      </div>
    </footer>
  );
}
