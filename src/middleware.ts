import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "./lib/auth/session";
import { AUTH_CONFIG } from "./lib/auth/config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_CONFIG.cookieName)?.value;
  const session = await verifySessionToken(token);
  const isAuthenticated = !!session;

  // Handle Root Admin Route: /admin
  if (pathname === "/admin" || pathname === "/admin/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Handle Admin Login Route: /admin/login
  if (pathname === "/admin/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    // Allow unauthenticated access to /admin/login
    return NextResponse.next();
  }

  // Handle API Admin Routes: /api/admin/*
  if (pathname.startsWith("/api/admin")) {
    // Whitelist login route
    if (pathname === "/api/admin/auth/login") {
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required to access admin API." },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // Handle all other /admin/* protected routes
  if (pathname.startsWith("/admin/")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
