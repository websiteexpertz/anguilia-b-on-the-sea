import { NextRequest, NextResponse } from "next/server";
import {
  listGalleryItems,
  getGalleryStats,
  createGalleryItem,
} from "@/lib/db/services/galleryService";
import { saveUploadedFile } from "@/lib/storage/imageStorage";
import { GallerySectionKey } from "@/lib/types/gallery";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = (searchParams.get("section") as GallerySectionKey | "all") || "all";
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";
    const heroOnly = searchParams.get("hero") === "true";

    const [items, stats] = await Promise.all([
      listGalleryItems({ section, status, search, hero: heroOnly }),
      getGalleryStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      stats,
    });
  } catch (error) {
    console.error("Error listing gallery images:", error);
    return NextResponse.json(
      { error: "Failed to load gallery images." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const section = (formData.get("section") as GallerySectionKey) || "villa_exterior";
    const title = (formData.get("title") as string)?.trim();
    const altText = (formData.get("altText") as string)?.trim();
    const status = (formData.get("status") as "active" | "hidden") || "active";
    const isHero = formData.get("isHero") === "true";

    if (!file) {
      return NextResponse.json(
        { error: "Please select an image file to upload." },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Image title is required." },
        { status: 400 }
      );
    }

    // Persist to local filesystem storage
    const stored = await saveUploadedFile(file, section);

    // Save record to MongoDB
    const newItem = await createGalleryItem({
      url: stored.url,
      fileName: stored.fileName,
      section,
      title,
      altText: altText || `${title} at Villa B on the Sea, Anguilla`,
      status,
      isHero,
      fileSize: stored.size,
      mimeType: stored.mimeType,
      isLocalAsset: false,
    });

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully.",
      item: newItem,
    });
  } catch (error: unknown) {
    console.error("Error uploading gallery image:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload image." },
      { status: 500 }
    );
  }
}
