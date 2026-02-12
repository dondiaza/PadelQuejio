import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  return (
    <section className="card p-6">
      <h1 className="text-5xl">PERFIL</h1>
      <div className="mt-4 grid gap-2 text-sm">
        <p>Nombre: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>Telefono: {user.phone ?? "-"}</p>
        <p>Estado: {user.status}</p>
        <p>Roles: {user.userRoles.map((item) => item.role.name).join(", ")}</p>
      </div>
      <p className="mt-4 text-sm text-muted">
        Actualiza tu nombre y telefono desde `/api/me` (PATCH).
      </p>
    </section>
  );
}
