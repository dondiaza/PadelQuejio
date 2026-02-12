import { SettingsManager } from "@/components/admin/settings-manager";
import { prisma } from "@/lib/prisma";

export default async function AdminSettingsPage() {
  const rows = await prisma.setting.findMany({
    orderBy: { key: "asc" },
  });

  const initialSettings = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  return <SettingsManager initialSettings={initialSettings} />;
}
