import { notFound } from "next/navigation";

import { AddGroupMemberForm } from "@/components/app/groups-tools";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ grupoId: string }>;

export default async function GroupDetailPage(props: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const { grupoId } = await props.params;
  const group = await prisma.group.findFirst({
    where: {
      id: grupoId,
      OR: [
        { ownerUserId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!group) {
    notFound();
  }

  const existingUserIds = new Set(group.members.map((member) => member.userId));
  const userOptions = await prisma.user.findMany({
    where: {
      status: "active",
      id: { notIn: Array.from(existingUserIds) },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">{group.name.toUpperCase()}</h1>
        <p className="mt-2 text-sm text-muted">
          Gestiona miembros para invitar rapido desde tus reservas.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="text-3xl">Miembros ({group.members.length})</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {group.members.map((member) => (
            <article key={member.userId} className="rounded-xl border border-border bg-white p-3 text-sm">
              <p className="font-semibold">{member.user.name ?? member.user.email}</p>
              <p className="text-muted">{member.user.email}</p>
              <p className="chip mt-2">{member.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-3xl">Agregar miembro</h2>
        {userOptions.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No hay usuarios disponibles para agregar.</p>
        ) : (
          <div className="mt-3">
            <AddGroupMemberForm
              groupId={group.id}
              users={userOptions.map((user) => ({
                id: user.id,
                label: `${user.name ?? user.email} - ${user.email}`,
              }))}
            />
          </div>
        )}
      </section>
    </div>
  );
}
