import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { deleteDateBlock } from "@/lib/db/services/availabilityService";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const success = await deleteDateBlock(id);

    if (!success) {
      return NextResponse.json(
        { error: "Blocked date record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Dates unblocked and returned to availability.",
    });
  } catch (error) {
    console.error("Error unblocking dates:", error);
    return NextResponse.json(
      { error: "Failed to unblock dates." },
      { status: 500 }
    );
  }
}
