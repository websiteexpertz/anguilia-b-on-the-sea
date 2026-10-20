import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  updateSeasonalRule,
  deleteSeasonalRule,
} from "@/lib/db/services/pricingService";

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

    const updated = await updateSeasonalRule(id, body);
    if (!updated) {
      return NextResponse.json(
        { error: "Seasonal pricing rule not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Seasonal rule updated successfully.",
      season: updated,
    });
  } catch (error: any) {
    console.error("Error updating seasonal rule:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update seasonal rule." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const success = await deleteSeasonalRule(id);

    if (!success) {
      return NextResponse.json(
        { error: "Seasonal rule not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Seasonal rule deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting seasonal rule:", error);
    return NextResponse.json(
      { error: "Failed to delete seasonal rule." },
      { status: 500 }
    );
  }
}

export const PUT = PATCH;
