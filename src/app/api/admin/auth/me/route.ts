import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { verifySessionToken } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_CONFIG.cookieName)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.json(
      { authenticated: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      username: session.username,
      role: session.role,
      expiresAt: session.exp,
    },
  });
}
