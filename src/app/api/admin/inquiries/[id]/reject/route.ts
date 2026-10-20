import { NextRequest, NextResponse } from "next/server";
import { rejectInquiry } from "@/lib/db/services/inquiryService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = body?.reason?.trim() || "Dates not available";

    const result = await rejectInquiry(id, reason, "admin");

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to reject inquiry." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inquiry rejected.",
      data: result,
    });
  } catch (error: any) {
    console.error("Error rejecting inquiry:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reject inquiry." },
      { status: 500 }
    );
  }
}
