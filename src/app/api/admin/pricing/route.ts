import { NextResponse } from "next/server";
import {
  getBaseRate,
  listSeasonalRules,
  listAdditionalCharges,
} from "@/lib/db/services/pricingService";

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
        seasons,
        charges,
      },
    });
  } catch (error) {
    console.error("Error fetching pricing configuration:", error);
    return NextResponse.json(
      { error: "Failed to load pricing configuration." },
      { status: 500 }
    );
  }
}
