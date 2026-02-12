import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  return (
    <section className="card p-6">
      <h1 className="text-5xl">USUARIOS</h1>
      <div className="mt-4 space-y-2 text-sm">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/admin/usuarios/${user.id}`}
            className="block rounded-xl border border-border bg-white p-3"
          >
            <p className="font-semibold">{user.name ?? user.email}</p>
            <p className="text-muted">{user.email}</p>
            <p className="text-muted">
              Roles: {user.userRoles.map((entry) => entry.role.name).join(", ") || "user"}
            </p>
            <p className="text-muted">Estado: {user.status}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
