import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateBaseRate } from "@/lib/db/services/pricingService";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { villaName, nightlyRate, minStay, currency } = body;

    if (nightlyRate !== undefined && (isNaN(Number(nightlyRate)) || Number(nightlyRate) < 0)) {
      return NextResponse.json(
        { error: "Base nightly rate must be 0 or greater." },
        { status: 400 }
      );
    }

    if (minStay !== undefined && (isNaN(Number(minStay)) || Number(minStay) < 1)) {
      return NextResponse.json(
        { error: "Minimum stay must be at least 1 night." },
        { status: 400 }
      );
    }

    const updated = await updateBaseRate({
      villaName,
      nightlyRate: Number(nightlyRate),
      minStay: Number(minStay),
      currency,
    });

    return NextResponse.json({
      success: true,
      message: "Base pricing updated successfully.",
      baseRate: updated,
    });
  } catch (error: any) {
    console.error("Error updating base rate:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update base rate." },
      { status: 400 }
    );
  }
}
