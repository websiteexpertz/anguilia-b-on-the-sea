import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { verifySessionToken, createSessionToken } from "@/lib/auth/session";
import { changeAdminPassword } from "@/lib/db/services/adminProfileService";
import { ChangePasswordDto } from "@/lib/types/adminProfile";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_CONFIG.cookieName)?.value;
    const session = await verifySessionToken(token);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as ChangePasswordDto;

    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Please provide all required password fields." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation do not match." },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: "New password must be different from your current password." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasDigit = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasDigit) {
      return NextResponse.json(
        { error: "New password must contain at least one letter and one number." },
        { status: 400 }
      );
    }

    const result = await changeAdminPassword(
      session.username,
      currentPassword,
      newPassword
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to change password." },
        { status: 400 }
      );
    }

    // Refresh active session token with a freshly signed token
    const freshToken = await createSessionToken(session.username);

    const response = NextResponse.json({
      success: true,
      message: "Password updated successfully. Active session refreshed.",
    });

    response.cookies.set({
      name: AUTH_CONFIG.cookieName,
      value: freshToken,
      ...AUTH_CONFIG.cookieOptions,
    });

    return response;
  } catch (error: unknown) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while changing password." },
      { status: 500 }
    );
  }
}
