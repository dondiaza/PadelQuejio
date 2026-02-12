import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type Params = Promise<{ slug: string }>;

export async function GET(_: Request, context: { params: Params }) {
  const { slug } = await context.params;

  const court = await prisma.court.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!court) {
    return NextResponse.json({ error: "Court not found" }, { status: 404 });
  }

  return NextResponse.json({ data: court });
}
