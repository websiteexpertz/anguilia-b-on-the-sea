import { NextRequest, NextResponse } from "next/server";
import {
  getInquiryById,
  updateInquiry,
  deleteInquiry,
} from "@/lib/db/services/inquiryService";
import { UpdateInquiryDto } from "@/lib/types/inquiry";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const inquiry = await getInquiryById(id);

    if (!inquiry) {
      return NextResponse.json(
        { error: "Customer inquiry not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: inquiry,
    });
  } catch (error: unknown) {
    console.error("Error fetching inquiry details:", error);
    return NextResponse.json(
      { error: "Failed to load inquiry details." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateInquiryDto;

    const updated = await updateInquiry(id, body);

    if (!updated) {
      return NextResponse.json(
        { error: "Customer inquiry not found or could not be updated." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Customer inquiry updated successfully.",
      data: updated,
    });
  } catch (error: unknown) {
    console.error("Error updating customer inquiry:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update inquiry." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    const deleted = await deleteInquiry(id, permanent);

    if (!deleted) {
      return NextResponse.json(
        { error: "Customer inquiry not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: permanent
        ? "Customer inquiry permanently deleted."
        : "Customer inquiry archived successfully.",
    });
  } catch (error: unknown) {
    console.error("Error deleting customer inquiry:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete inquiry." },
      { status: 500 }
    );
  }
}
