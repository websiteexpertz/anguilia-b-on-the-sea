import { NextRequest, NextResponse } from "next/server";
import { replaceGalleryImage } from "@/lib/db/services/galleryService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const altText = formData.get("altText") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Please select a replacement image file." },
        { status: 400 }
      );
    }

    const updated = await replaceGalleryImage(
      id,
      file,
      title?.trim() || undefined,
      altText?.trim() || undefined
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Image not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image replaced successfully.",
      item: updated,
    });
  } catch (error: unknown) {
    console.error("Error replacing gallery image:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to replace image." },
      { status: 500 }
    );
  }
}
