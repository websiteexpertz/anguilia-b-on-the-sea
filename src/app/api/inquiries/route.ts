import { NextRequest, NextResponse } from "next/server";
import {
  checkInquiryAvailability,
  createInquiry,
} from "@/lib/db/services/inquiryService";
import { sendInquiryNotification } from "@/lib/email/sendInquiryNotification";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, phone, subject, message, checkIn, checkOut, guests } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    if (!email || !email.trim() || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required" },
        { status: 400 }
      );
    }

    if (checkIn && checkOut && checkOut <= checkIn) {
      return NextResponse.json(
        { success: false, error: "Check-out date must be after check-in date" },
        { status: 400 }
      );
    }

    if (checkIn && checkIn < new Date().toISOString().slice(0, 10)) {
      return NextResponse.json(
        { success: false, error: "Check-in date cannot be in the past." },
        { status: 400 }
      );
    }

    if (checkIn && checkOut) {
      const availability = await checkInquiryAvailability(checkIn, checkOut);
      if (!availability.isAvailable) {
        return NextResponse.json(
          {
            success: false,
            error: availability.conflictReason || "These dates are no longer available.",
            conflict: true,
          },
          { status: 409 }
        );
      }
    }

    const inquiry = await createInquiry({
      name: name.trim(),
      email: email.trim(),
      phone: phone ? String(phone).trim() : undefined,
      subject: subject && subject.trim() ? subject.trim() : "Website Quote Request",
      message: message && message.trim() ? message.trim() : "Interested in booking Villa B on the Sea.",
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests: guests ? Number(guests) : undefined,
    });
    await sendInquiryNotification(inquiry);

    return NextResponse.json({
      success: true,
      inquiry,
      message: "Inquiry received successfully",
    });
  } catch (error: any) {
    console.error("Public inquiry submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit inquiry. Please try again or contact us directly." },
      { status: 500 }
    );
  }
}
