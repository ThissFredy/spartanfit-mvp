import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

interface ErrorStateProps {
  title?: string;
  description: string;
  action?: ReactNode;
}

export function ErrorState({
  title = "Ocurrió un error",
  description,
  action,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-100"
    >
      <div className="mb-2 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-300" />
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-red-200/90">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
