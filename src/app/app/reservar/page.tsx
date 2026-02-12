import { ReserveForm } from "@/components/reservations/reserve-form";
import { prisma } from "@/lib/prisma";

export default async function ReservePage() {
  const courts = await prisma.court.findMany({
    where: { status: "active" },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });

  return <ReserveForm courts={courts} />;
}
