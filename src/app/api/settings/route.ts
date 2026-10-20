import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/db/services/adminProfileService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSiteSettings();

    // Expose only public website settings
    return NextResponse.json({
      success: true,
      settings: {
        siteName: settings.siteName,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        currency: settings.currency,
        timezone: settings.timezone,
      },
    });
  } catch (error: any) {
    console.error("Public settings fetch error:", error);
    return NextResponse.json(
      {
        success: true,
        settings: {
          siteName: "Villa B on the Sea, Anguilla",
          contactEmail: "anguillabonthesea@gmail.com",
          contactPhone: "+1 508-633-7355",
          currency: "USD",
          timezone: "America/Anguilla",
        },
      },
      { status: 200 }
    );
  }
}
