import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get("callbackUrl");
  const destination = callbackUrl
    ? `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/api/auth/signin/google";

  return NextResponse.redirect(new URL(destination, request.url));
}
