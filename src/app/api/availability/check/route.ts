import { NextRequest, NextResponse } from "next/server";
import { checkInquiryAvailability } from "@/lib/db/services/inquiryService";

export const dynamic = "force-dynamic";

function isValidDate(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const today = new Date().toISOString().slice(0, 10);

  if (
    !isValidDate(checkIn) ||
    !isValidDate(checkOut) ||
    checkIn < today ||
    checkOut <= checkIn
  ) {
    return NextResponse.json(
      { success: false, error: "Choose valid check-in and check-out dates." },
      { status: 400 }
    );
  }

  try {
    const availability = await checkInquiryAvailability(checkIn, checkOut);
    return NextResponse.json(
      {
        success: true,
        isAvailable: availability.isAvailable,
        hasConflict: availability.hasConflict,
        conflictReason: availability.isAvailable
          ? undefined
          : "Your selected dates are already booked. Choose different dates or contact us for help.",
      },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
    );
  } catch (error) {
    console.error("Availability check failed:", error);
    return NextResponse.json(
      { success: false, error: "We could not check these dates right now. Please try again or contact us." },
      { status: 500 }
    );
  }
}