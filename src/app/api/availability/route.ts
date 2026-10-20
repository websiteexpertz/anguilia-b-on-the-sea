import { NextRequest, NextResponse } from "next/server";
import { getMonthAvailability } from "@/lib/db/services/availabilityService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const year = parseInt(searchParams.get("year") || String(now.getFullYear()), 10);
    const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1), 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { success: false, error: "Invalid year or month parameter" },
        { status: 400 }
      );
    }

    const data = await getMonthAvailability(year, month);

    // Sanitize guest sensitive info for public calendar
    const sanitizedDays = data.days.map((day) => ({
      date: day.date,
      dayOfMonth: day.dayOfMonth,
      isCurrentMonth: day.isCurrentMonth,
      isToday: day.isToday,
      status: day.status,
      isCheckIn: day.isCheckIn || false,
      isCheckOut: day.isCheckOut || false,
    }));

    return NextResponse.json(
      {
        success: true,
        year: data.year,
        month: data.month,
        monthName: data.monthName,
        availableCount: data.summary?.availableCount ?? 0,
        bookedCount: data.summary?.bookedCount ?? 0,
        blockedCount: data.summary?.blockedCount ?? 0,
        days: sanitizedDays,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("Public availability fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load availability" },
      { status: 500 }
    );
  }
}
