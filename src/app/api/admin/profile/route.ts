import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { verifySessionToken } from "@/lib/auth/session";
import {
  getAdminProfile,
  updateAdminProfile,
} from "@/lib/db/services/adminProfileService";
import { UpdateProfileDto, SessionInfo } from "@/lib/types/adminProfile";

function formatTimeRemaining(expUnix: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diffSeconds = expUnix - now;
  if (diffSeconds <= 0) return "Expired";
  const days = Math.floor(diffSeconds / 86400);
  const hours = Math.floor((diffSeconds % 86400) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_CONFIG.cookieName)?.value;
    const session = await verifySessionToken(token);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getAdminProfile(session.username);

    if (!profile) {
      return NextResponse.json(
        { error: "Administrator profile not found." },
        { status: 404 }
      );
    }

    const tokenSignature = token?.split(".")[1] || "";
    const tokenSignaturePreview = tokenSignature
      ? `${tokenSignature.slice(0, 10)}...${tokenSignature.slice(-6)}`
      : undefined;

    const sessionInfo: SessionInfo = {
      username: session.username,
      role: session.role,
      iat: session.iat,
      exp: session.exp,
      tokenSignaturePreview,
      durationDays: Math.round(AUTH_CONFIG.sessionDuration / 86400),
      timeRemaining: formatTimeRemaining(session.exp),
      isValid: true,
    };

    return NextResponse.json({
      success: true,
      profile,
      session: sessionInfo,
    });
  } catch (error: unknown) {
    console.error("Error fetching admin profile:", error);
    return NextResponse.json(
      { error: "Failed to retrieve administrator profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_CONFIG.cookieName)?.value;
    const session = await verifySessionToken(token);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as UpdateProfileDto;

    if (body.email && (!body.email.includes("@") || !body.email.includes("."))) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const updated = await updateAdminProfile(session.username, body);

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update profile." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Administrator profile updated successfully.",
      profile: updated,
    });
  } catch (error: unknown) {
    console.error("Error updating admin profile:", error);
    return NextResponse.json(
      { error: "Failed to update administrator profile." },
      { status: 500 }
    );
  }
}
