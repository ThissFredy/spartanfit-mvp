import { PageLoading } from "@/components/ui/page-loading";

export default function AdminLoading() {
  return (
    <PageLoading
      title="Cargando panel admin"
      subtitle="Sincronizando usuarios, ciudades y gimnasios."
    />
  );
}
