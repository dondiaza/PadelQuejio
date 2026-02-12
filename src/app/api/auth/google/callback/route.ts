import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const callback = new URL("/api/auth/callback/google", url.origin);
  url.searchParams.forEach((value, key) => {
    callback.searchParams.set(key, value);
  });

  return NextResponse.redirect(callback);
}
