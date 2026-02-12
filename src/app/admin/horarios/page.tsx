import { OpeningHoursManager } from "@/components/admin/opening-hours-manager";
import { prisma } from "@/lib/prisma";

function toTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

export default async function AdminSchedulesPage() {
  const rows = await prisma.openingHour.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  const normalized = Array.from({ length: 7 }, (_, dayOfWeek) => {
    const row = rows.find((entry) => entry.dayOfWeek === dayOfWeek);
    return {
      dayOfWeek,
      opensAt: row ? toTime(row.opensAt) : "08:00",
      closesAt: row ? toTime(row.closesAt) : "23:00",
    };
  });

  return <OpeningHoursManager initialRows={normalized} />;
}
