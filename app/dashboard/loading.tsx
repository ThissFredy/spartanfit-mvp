import { PageLoading } from "@/components/ui/page-loading";

export default function DashboardLoading() {
  return (
    <PageLoading
      title="Cargando dashboard"
      subtitle="Sincronizando métricas de entrenamiento y progreso visual."
    />
  );
}
