import { NextRequest, NextResponse } from "next/server";
import { listGalleryItems } from "@/lib/db/services/galleryService";
import { GALLERY_SECTIONS, GallerySectionKey } from "@/lib/types/gallery";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionParam = searchParams.get("section");
    const sectionKey =
      sectionParam && sectionParam !== "all"
        ? (sectionParam as GallerySectionKey)
        : undefined;

    const items = await listGalleryItems({
      section: sectionKey,
      status: "active",
    });

    // Group items by section according to GALLERY_SECTIONS config
    const groupedSections = GALLERY_SECTIONS.map((conf) => {
      const sectionItems = items.filter((item) => item.section === conf.key);
      return {
        key: conf.key,
        label: conf.label,
        description: conf.description,
        images: sectionItems.map((item) => item.url),
        items: sectionItems,
      };
    }).filter((sec) => sec.images.length > 0);

    return NextResponse.json({
      success: true,
      items,
      sections: groupedSections,
    });
  } catch (error: any) {
    console.error("Public gallery fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load gallery items" },
      { status: 500 }
    );
  }
}
