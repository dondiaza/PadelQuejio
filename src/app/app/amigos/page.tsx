import Link from "next/link";

import { auth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function FriendsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const [groups, recentInvites, upcomingReservations] = await Promise.all([
    prisma.group.findMany({
      where: { ownerUserId: session.user.id },
      include: { members: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.reservationInvite.findMany({
      where: {
        reservation: {
          userId: session.user.id,
        },
      },
      include: {
        reservation: {
          include: { court: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.reservation.count({
      where: {
        userId: session.user.id,
        startAt: { gte: new Date() },
      },
    }),
  ]);

  const membersCount = groups.reduce((acc, group) => acc + group.members.length, 0);

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">AMIGOS Y GRUPOS</h1>
        <p className="mt-2 text-sm text-muted">
          Organiza tu juego social: crea grupos y reutiliza invitaciones en cada reserva.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/app/amigos/grupos" className="btn-primary text-sm">
            Gestionar grupos
          </Link>
          <Link href="/app/reservar" className="btn-secondary text-sm">
            Reservar e invitar
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card p-4">
          <p className="text-sm text-muted">Grupos activos</p>
          <p className="text-4xl text-secondary">{groups.length}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Miembros en tus grupos</p>
          <p className="text-4xl text-secondary">{membersCount}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted">Tus reservas futuras</p>
          <p className="text-4xl text-secondary">{upcomingReservations}</p>
        </article>
      </section>

      <section className="card p-5">
        <h2 className="text-3xl">Ultimas invitaciones</h2>
        <div className="mt-3 space-y-2 text-sm">
          {recentInvites.length === 0 ? (
            <p className="text-muted">Aun no has enviado invitaciones.</p>
          ) : (
            recentInvites.map((invite) => (
              <article key={invite.id} className="rounded-xl border border-border bg-white p-3">
                <p className="font-semibold">{invite.reservation.court.name}</p>
                <p>{formatDateTime(invite.reservation.startAt)}</p>
                <p className="text-muted">
                  Destino: {invite.invitedName ?? invite.invitedEmail ?? invite.invitedPhone ?? "link"}
                </p>
                <p className="text-muted">Estado: {invite.status}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
