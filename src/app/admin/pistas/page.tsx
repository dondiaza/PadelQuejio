import { CourtsManager } from "@/components/admin/courts-manager";
import { prisma } from "@/lib/prisma";

export default async function AdminCourtsPage() {
  const courts = await prisma.court.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      baseSlotMinutes: true,
    },
  });

  return <CourtsManager initialCourts={courts} />;
}
