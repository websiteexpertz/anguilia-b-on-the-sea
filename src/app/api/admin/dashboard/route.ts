import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDashboardData } from "@/lib/db/services/dashboardService";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { verifySessionToken } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_CONFIG.cookieName)?.value;
    const session = await verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Admin authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get("period");
    const validPeriod =
      periodParam === "7d" ||
      periodParam === "30d" ||
      periodParam === "90d" ||
      periodParam === "1y"
        ? periodParam
        : "30d";

    const data = await getDashboardData(validPeriod);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Unable to load dashboard data. Please try again." },
      { status: 500 }
    );
  }
}
