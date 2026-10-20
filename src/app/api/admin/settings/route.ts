import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { verifySessionToken } from "@/lib/auth/session";
import {
  getSiteSettings,
  updateSiteSettings,
} from "@/lib/db/services/adminProfileService";
import { UpdateSiteSettingsDto } from "@/lib/types/adminProfile";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_CONFIG.cookieName)?.value;
    const session = await verifySessionToken(token);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getSiteSettings();

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: unknown) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json(
      { error: "Failed to load website settings." },
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

    const body = (await request.json()) as UpdateSiteSettingsDto;

    if (body.contactEmail && (!body.contactEmail.includes("@") || !body.contactEmail.includes("."))) {
      return NextResponse.json(
        { error: "Please provide a valid contact email address." },
        { status: 400 }
      );
    }

    if (
      body.notificationEmail !== undefined &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.notificationEmail)
    ) {
      return NextResponse.json(
        { error: "Please provide a valid notification email address." },
        { status: 400 }
      );
    }

    const updated = await updateSiteSettings(body);

    return NextResponse.json({
      success: true,
      message: "Villa settings updated successfully.",
      data: updated,
    });
  } catch (error: unknown) {
    console.error("Error updating site settings:", error);
    return NextResponse.json(
      { error: "Failed to update villa settings." },
      { status: 500 }
    );
  }
}
