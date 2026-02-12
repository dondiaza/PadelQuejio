import { AdminPlaceholder } from "@/components/admin-placeholder";

type Params = Promise<{ pistaId: string }>;

export default async function AdminCourtDetailPage(props: { params: Params }) {
  const { pistaId } = await props.params;
  return (
    <AdminPlaceholder
      title={`PISTA ${pistaId}`}
      description="Detalle y mantenimiento de la pista seleccionada."
    />
  );
}
