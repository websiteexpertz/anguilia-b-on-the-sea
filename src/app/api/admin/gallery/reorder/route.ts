import { NextRequest, NextResponse } from "next/server";
import { reorderGalleryItems } from "@/lib/db/services/galleryService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderedIds = body.orderedIds as string[];

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty orderedIds list." },
        { status: 400 }
      );
    }

    await reorderGalleryItems(orderedIds);

    return NextResponse.json({
      success: true,
      message: "Gallery order updated successfully.",
    });
  } catch (error: unknown) {
    console.error("Error reordering gallery images:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update order." },
      { status: 500 }
    );
  }
}
