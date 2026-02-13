import { NextResponse } from "next/server";

import { getPublicCourts } from "@/lib/public-data";

export async function GET() {
  const courts = await getPublicCourts();
  return NextResponse.json({ data: courts }, { status: 200 });
}
