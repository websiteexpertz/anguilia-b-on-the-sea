import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createSeasonalRule,
  isValidSeasonDateRange,
  listSeasonalRules,
  normalizeSeasonDate,
} from "@/lib/db/services/pricingService";

export async function GET() {
  try {
    const seasons = await listSeasonalRules();
    return NextResponse.json({
      success: true,
      seasons,
      data: seasons,
    });
  } catch (error: any) {
    console.error("Error fetching seasonal rules:", error);
    return NextResponse.json(
      { error: "Failed to load seasonal rules." },
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

    const { name, nightlyRate, minStay, description, isActive } = body;
    const startDate = normalizeSeasonDate(body.startDate || body.from);
    const endDate = normalizeSeasonDate(body.endDate || body.to);

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Season name is required." },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        { error: "Valid start date is required (for example, Dec 19 or 2026-12-19)." },
        { status: 400 }
      );
    }

    if (!endDate) {
      return NextResponse.json(
        { error: "Valid end date is required (for example, Jan 02 or 2027-01-02)." },
        { status: 400 }
      );
    }

    if (!isValidSeasonDateRange(startDate, endDate)) {
      return NextResponse.json(
        { error: "End date must be after the start date." },
        { status: 400 }
      );
    }

    if (isNaN(Number(nightlyRate)) || Number(nightlyRate) < 0) {
      return NextResponse.json(
        { error: "Nightly rate must be 0 or greater." },
        { status: 400 }
      );
    }

    const season = await createSeasonalRule({
      name,
      startDate,
      endDate,
      from: typeof body.from === "string" ? body.from.trim() : undefined,
      to: typeof body.to === "string" ? body.to.trim() : undefined,
      dateRange: typeof body.dateRange === "string" ? body.dateRange.trim() : undefined,
      nightlyRate: Number(nightlyRate),
      perNight: body.perNight !== undefined ? Number(body.perNight) : undefined,
      weekendNight: body.weekendNight !== undefined ? Number(body.weekendNight) : undefined,
      weekly: body.weekly !== undefined ? Number(body.weekly) : undefined,
      monthly: body.monthly !== undefined ? body.monthly : undefined,
      minStay: Math.max(1, Number(minStay) || 3),
      description,
      isActive: isActive !== false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Seasonal rule created successfully.",
        season,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating seasonal rule:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create seasonal rule." },
      { status: 400 }
    );
  }
}
