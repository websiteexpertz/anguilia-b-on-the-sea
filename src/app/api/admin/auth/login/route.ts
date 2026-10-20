import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { createSessionToken } from "@/lib/auth/session";
import { authenticateAdmin } from "@/lib/db/services/adminProfileService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 400 }
      );
    }

    const { username, password } = body;

    // Validate inputs
    if (
      !username ||
      !password ||
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 400 }
      );
    }

    // Trim username, preserve password exact whitespace
    const cleanUsername = username.trim();
    const cleanPassword = password;

    // Verify credentials via MongoDB adminProfileService (with config fallback)
    const authResult = await authenticateAdmin(cleanUsername, cleanPassword);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Generate signed session token
    const token = await createSessionToken(authResult.user.username);

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        username: authResult.user.username,
        displayName: authResult.user.displayName,
        role: "admin",
      },
    });

    // Set HTTP-only secure cookie
    response.cookies.set({
      name: AUTH_CONFIG.cookieName,
      value: token,
      ...AUTH_CONFIG.cookieOptions,
    });

    return response;
  } catch (error) {
    console.error("Admin authentication error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
