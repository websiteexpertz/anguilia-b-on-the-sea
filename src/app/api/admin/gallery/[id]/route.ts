import { NextRequest, NextResponse } from "next/server";
import {
  updateGalleryItem,
  deleteGalleryItem,
} from "@/lib/db/services/galleryService";
import { UpdateGalleryItemDto } from "@/lib/types/gallery";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateGalleryItemDto;

    const updated = await updateGalleryItem(id, body);
    if (!updated) {
      return NextResponse.json(
        { error: "Image not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Gallery image updated successfully.",
      item: updated,
    });
  } catch (error: unknown) {
    console.error("Error updating gallery image:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update image." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get("hard") === "true";

    const deleted = await deleteGalleryItem(id, hardDelete);
    if (!deleted) {
      return NextResponse.json(
        { error: "Image not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully.",
    });
  } catch (error: unknown) {
    console.error("Error deleting gallery image:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete image." },
      { status: 500 }
    );
  }
}
