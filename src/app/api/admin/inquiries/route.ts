import { NextRequest, NextResponse } from "next/server";
import {
  listInquiries,
  createInquiry,
  getInquiryStats,
} from "@/lib/db/services/inquiryService";
import { InquiryFilterOptions, InquiryStatus } from "@/lib/types/inquiry";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as InquiryStatus | "all" | null;
    const readStatus = searchParams.get("readStatus") as "all" | "read" | "unread" | null;
    const search = searchParams.get("search") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;

    const filters: InquiryFilterOptions = {
      status: status || "all",
      readStatus: readStatus || "all",
      search,
      dateFrom,
      dateTo,
    };

    const [inquiries, stats] = await Promise.all([
      listInquiries(filters),
      getInquiryStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: inquiries,
      stats,
    });
  } catch (error: unknown) {
    console.error("Error listing customer inquiries:", error);
    return NextResponse.json(
      { error: "Failed to load customer inquiries." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Customer name is required." },
        { status: 400 }
      );
    }

    if (!body.email || !body.email.trim() || !body.email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!body.message || !body.message.trim()) {
      return NextResponse.json(
        { error: "Inquiry message is required." },
        { status: 400 }
      );
    }

    const created = await createInquiry({
      name: body.name,
      email: body.email,
      phone: body.phone,
      subject: body.subject || "Villa B General Inquiry",
      message: body.message,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guests: body.guests,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Customer inquiry submitted successfully.",
        inquiry: created,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating customer inquiry:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create inquiry." },
      { status: 500 }
    );
  }
}
