import { SpecialDatesManager } from "@/components/admin/special-dates-manager";
import { prisma } from "@/lib/prisma";

function toTime(date: Date | null) {
  return date ? date.toISOString().slice(11, 16) : null;
}

export default async function AdminSpecialDatesPage() {
  const rows = await prisma.specialDate.findMany({
    orderBy: { date: "asc" },
  });

  return (
    <SpecialDatesManager
      initialRows={rows.map((row) => ({
        id: row.id,
        date: row.date.toISOString().slice(0, 10),
        isClosed: row.isClosed,
        opensAt: toTime(row.opensAt),
        closesAt: toTime(row.closesAt),
        note: row.note,
      }))}
    />
  );
}
