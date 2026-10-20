import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getBookingById,
  updateBooking,
  cancelBooking,
} from "@/lib/db/services/bookingService";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to retrieve booking." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    // Check if cancellation action
    if (body.action === "cancel") {
      const cancelledBooking = await cancelBooking(id, body.reason);
      if (!cancelledBooking) {
        return NextResponse.json(
          { error: "Booking not found." },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Booking cancelled successfully",
        booking: cancelledBooking,
      });
    }

    // Regular update
    const updated = await updateBooking(id, body);
    if (!updated) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
      booking: updated,
    });
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update booking." },
      { status: 400 }
    );
  }
}
