import { NextResponse } from "next/server";
import {
  getBaseRate,
  listSeasonalRules,
  listAdditionalCharges,
} from "@/lib/db/services/pricingService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [baseRate, seasons, charges] = await Promise.all([
      getBaseRate(),
      listSeasonalRules(),
      listAdditionalCharges(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        baseRate,
        seasons: seasons.filter((s) => s.isActive),
        charges: charges.filter((c) => c.isActive),
      },
    });
  } catch (error) {
    console.error("Public pricing API error:", error);
    return NextResponse.json(
      { error: "Failed to load pricing information." },
      { status: 500 }
    );
  }
}
