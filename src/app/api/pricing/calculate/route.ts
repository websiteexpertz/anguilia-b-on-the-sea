import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getBaseRate,
  listSeasonalRules,
  listAdditionalCharges,
} from "@/lib/db/services/pricingService";
import { calculateStayQuote } from "@/lib/pricing/calculator";

function isValidDateString(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(new Date(d).getTime());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { checkIn, checkOut, guests } = body;

    if (!checkIn || !isValidDateString(checkIn)) {
      return NextResponse.json(
        { error: "Valid check-in date is required." },
        { status: 400 }
      );
    }

    if (!checkOut || !isValidDateString(checkOut)) {
      return NextResponse.json(
        { error: "Valid check-out date is required." },
        { status: 400 }
      );
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { error: "Check-out date must be strictly after check-in date." },
        { status: 400 }
      );
    }

    const [baseRate, seasons, charges] = await Promise.all([
      getBaseRate(),
      listSeasonalRules(),
      listAdditionalCharges(),
    ]);

    const quote = calculateStayQuote({
      checkIn,
      checkOut,
      guests: Number(guests) || 2,
      baseRate,
      seasons,
      charges,
    });

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (error: any) {
    console.error("Public pricing calculation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to calculate pricing." },
      { status: 400 }
    );
  }
}
