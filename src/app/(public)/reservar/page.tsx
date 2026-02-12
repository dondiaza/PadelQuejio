import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function ReserveEntryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/app/reservar");
  }

  redirect("/app/reservar");
}
