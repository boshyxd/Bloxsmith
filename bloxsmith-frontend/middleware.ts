import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE !== "true") return NextResponse.next()
  if (request.nextUrl.pathname === "/maintenance") return NextResponse.next()
  if (request.nextUrl.pathname.startsWith("/_next")) return NextResponse.next()
  if (request.nextUrl.pathname.startsWith("/logos")) return NextResponse.next()
  if (request.nextUrl.pathname === "/favicon.ico") return NextResponse.next()

  return NextResponse.rewrite(new URL("/maintenance", request.url))
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}
