import { AppPlaceholder } from "@/components/app-placeholder";

type Params = Promise<{ grupoId: string }>;

export default async function GroupDetailPage(props: { params: Params }) {
  const { grupoId } = await props.params;
  return (
    <AppPlaceholder
      title={`GRUPO ${grupoId}`}
      description="Detalle de miembros, invitaciones y actividad del grupo."
    />
  );
}
