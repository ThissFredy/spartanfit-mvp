import { cn } from "@/lib/utils/cn";
import { Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { Skeleton } from "./skeleton";

interface PageLoadingProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function PageLoading({
  title = "Cargando experiencia",
  subtitle = "Estamos preparando tu panel...",
  className,
}: PageLoadingProps) {
  const skeletonItems = Array.from({ length: 4 });

  return (
    <div className={cn("min-h-screen bg-page-gradient p-4", className)}>
      <div className="mx-auto max-w-6xl space-y-5 animate-[fade-in-up_360ms_ease-out]">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
          <div className="pointer-events-none absolute inset-x-0 -top-12 h-32 bg-[radial-gradient(circle_at_top,rgba(194,37,36,0.18),transparent_72%)]" />
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-spartan/30 bg-spartan/10 px-3 py-1 text-xs font-semibold text-spartan-light">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            SpartanFit cargando
          </div>
          <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full w-1/3 animate-[loading-slide_1.7s_ease-in-out_infinite] rounded-full bg-[linear-gradient(90deg,#c22524,#ef605f,#c22524)]" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {skeletonItems.map((_, index) => (
            <Skeleton
              key={index}
              className="h-28 animate-[fade-in-up_520ms_ease-out]"
              style={{ animationDelay: `${index * 70}ms` } as CSSProperties}
            />
          ))}
        </div>
        <Skeleton className="h-[46vh] animate-[fade-in-up_640ms_ease-out]" />
      </div>
    </div>
  );
}
