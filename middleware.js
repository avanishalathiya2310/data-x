import { NextResponse } from "next/server";

// Pass-through middleware so Next.js is satisfied and requests continue.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"],
};
