import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listBookings, createBooking } from "@/lib/db/services/bookingService";
import { BookingStatus } from "@/lib/types/booking";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidDateString(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(new Date(d).getTime());
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as BookingStatus | "all") || "all";
    const timeframe = (searchParams.get("timeframe") as "all" | "upcoming" | "past") || "all";
    const sortBy = (searchParams.get("sortBy") as any) || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10) || 1;
    const limit = parseInt(searchParams.get("limit") || "10", 10) || 10;

    const result = await listBookings({
      search,
      status,
      timeframe,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error listing bookings:", error);
    return NextResponse.json(
      { error: "Failed to retrieve bookings." },
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

    const {
      guestName,
      email,
      phone,
      checkIn,
      checkOut,
      guests,
      accommodation,
      amount,
      paymentStatus,
      status,
      notes,
    } = body;

    // 1. Required fields
    if (!guestName || typeof guestName !== "string" || !guestName.trim()) {
      return NextResponse.json(
        { error: "Guest full name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { error: "A contact phone number is required." },
        { status: 400 }
      );
    }

    // 2. Dates
    if (!checkIn || !isValidDateString(checkIn)) {
      return NextResponse.json(
        { error: "Check-in date is required and must be valid (YYYY-MM-DD)." },
        { status: 400 }
      );
    }

    if (!checkOut || !isValidDateString(checkOut)) {
      return NextResponse.json(
        { error: "Check-out date is required and must be valid (YYYY-MM-DD)." },
        { status: 400 }
      );
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { error: "Check-out date must be after check-in date." },
        { status: 400 }
      );
    }

    // 3. Guests & Amount
    const guestsNum = Number(guests);
    if (isNaN(guestsNum) || guestsNum < 1) {
      return NextResponse.json(
        { error: "Number of guests must be at least 1." },
        { status: 400 }
      );
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum < 0) {
      return NextResponse.json(
        { error: "Booking amount must be 0 or greater." },
        { status: 400 }
      );
    }

    const booking = await createBooking({
      guestName,
      email,
      phone,
      checkIn,
      checkOut,
      guests: guestsNum,
      accommodation: accommodation || "Villa B on the Sea (Full Villa)",
      amount: amountNum,
      paymentStatus: paymentStatus || "pending",
      status: status || "pending",
      notes: notes || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully",
        booking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create booking." },
      { status: 400 }
    );
  }
}
