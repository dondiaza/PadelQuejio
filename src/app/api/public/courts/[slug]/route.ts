import { NextResponse } from "next/server";

import { getPublicCourts } from "@/lib/public-data";

type Params = Promise<{ slug: string }>;

export async function GET(_: Request, context: { params: Params }) {
  const { slug } = await context.params;

  const courts = await getPublicCourts();
  const court = courts.find((entry) => entry.slug === slug);

  if (!court) {
    return NextResponse.json({ error: "Court not found" }, { status: 404 });
  }

  return NextResponse.json({ data: court });
}
