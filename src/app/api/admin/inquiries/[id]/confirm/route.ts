import { NextRequest, NextResponse } from "next/server";
import { confirmInquiryBooking } from "@/lib/db/services/inquiryService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await confirmInquiryBooking(id, "admin");

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to confirm booking." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking successfully confirmed and dates blocked on live calendar.",
      data: result,
    });
  } catch (error: any) {
    console.error("Error confirming booking from inquiry:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to confirm booking." },
      { status: 500 }
    );
  }
}
