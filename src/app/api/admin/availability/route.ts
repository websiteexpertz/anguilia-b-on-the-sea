import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getMonthAvailability,
  createDateBlock,
} from "@/lib/db/services/availabilityService";
import { BlockReason } from "@/lib/types/availability";

function isValidDateString(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(new Date(d).getTime());
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();

    const year = parseInt(searchParams.get("year") || String(now.getFullYear()), 10);
    const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1), 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Invalid year or month query parameters." },
        { status: 400 }
      );
    }

    const data = await getMonthAvailability(year, month);

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to retrieve calendar availability." },
      { status: 500 }
    );
  }
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

    const { startDate, endDate, reason, notes } = body;

    if (!startDate || !isValidDateString(startDate)) {
      return NextResponse.json(
        { error: "Valid start date (YYYY-MM-DD) is required." },
        { status: 400 }
      );
    }

    if (!endDate || !isValidDateString(endDate)) {
      return NextResponse.json(
        { error: "Valid end date (YYYY-MM-DD) is required." },
        { status: 400 }
      );
    }

    if (endDate < startDate) {
      return NextResponse.json(
        { error: "End date cannot precede start date." },
        { status: 400 }
      );
    }

    const validReasons: BlockReason[] = [
      "Maintenance",
      "Owner stay",
      "Renovation",
      "Private booking",
      "Seasonal closure",
      "Other",
    ];

    if (!reason || !validReasons.includes(reason)) {
      return NextResponse.json(
        { error: "A valid block reason is required." },
        { status: 400 }
      );
    }

    const block = await createDateBlock({
      startDate,
      endDate,
      reason,
      notes,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Dates successfully blocked.",
        block,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating date block:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to block dates." },
      { status: 400 }
    );
  }
}
