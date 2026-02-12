import { notFound } from "next/navigation";

import { CourtDetailManager } from "@/components/admin/court-detail-manager";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ pistaId: string }>;

export default async function AdminCourtDetailPage(props: { params: Params }) {
  const { pistaId } = await props.params;
  const court = await prisma.court.findUnique({
    where: { id: pistaId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      status: true,
      baseSlotMinutes: true,
    },
  });

  if (!court) {
    notFound();
  }

  return <CourtDetailManager court={court} />;
}
