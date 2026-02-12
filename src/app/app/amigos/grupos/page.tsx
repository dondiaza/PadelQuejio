import Link from "next/link";

import { CreateGroupForm } from "@/components/app/groups-tools";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function GroupsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const groups = await prisma.group.findMany({
    where: { ownerUserId: session.user.id },
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
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">GRUPOS</h1>
        <p className="mt-2 text-sm text-muted">
          Crea grupos recurrentes para invitar con un clic al reservar.
        </p>
        <div className="mt-4">
          <CreateGroupForm />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {groups.length === 0 ? (
          <article className="card p-5 md:col-span-2">
            <p className="text-sm text-muted">Todavia no tienes grupos. Crea el primero arriba.</p>
          </article>
        ) : (
          groups.map((group) => (
            <article key={group.id} className="card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl">{group.name}</h2>
                <span className="pill">{group.members.length} miembros</span>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {group.members.slice(0, 4).map((member) => (
                  <li key={member.userId} className="text-muted">
                    {member.user.name ?? member.user.email} ({member.role})
                  </li>
                ))}
                {group.members.length > 4 ? (
                  <li className="text-muted">+{group.members.length - 4} mas...</li>
                ) : null}
              </ul>
              <div className="mt-4">
                <Link href={`/app/amigos/grupos/${group.id}`} className="btn-secondary text-sm">
                  Ver grupo
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
