import { ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import { getDatabase } from "../mongodb";
import {
  GalleryItem,
  GallerySectionKey,
  GALLERY_SECTIONS,
  CreateGalleryItemDto,
  UpdateGalleryItemDto,
  GalleryStats,
} from "@/lib/types/gallery";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/storage/imageStorage";

const COLLECTION_NAME = "gallery";
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|avif|gif)$/i;

async function getGalleryCollection() {
  const db = await getDatabase();
  return db.collection(COLLECTION_NAME);
}

async function logActivity(action: string, details: string) {
  try {
    const db = await getDatabase();
    await db.collection("activities").insertOne({
      action,
      details,
      timestamp: new Date().toISOString(),
      createdAt: new Date(),
    });
  } catch (err) {
    console.warn("Could not log gallery activity:", err);
  }
}

async function ensureDefaultHeroItems(): Promise<void> {
  const collection = await getGalleryCollection();
  const configuredCount = await collection.countDocuments({ isHero: { $exists: true } });
  if (configuredCount > 0) return;

  const defaults = await collection
    .find({ status: "active", section: { $in: ["villa_exterior", "entertainment_deck"] } })
    .sort({ section: 1, order: 1 })
    .limit(4)
    .toArray();

  if (defaults.length > 0) {
    await collection.updateMany(
      { _id: { $in: defaults.map((item) => item._id) } },
      { $set: { isHero: true, updatedAt: new Date().toISOString() } }
    );
  }
}

/**
 * Converts a filename into a human-readable title.
 */
function filenameToTitle(fileName: string, sectionLabel: string): string {
  const withoutExt = path.basename(fileName, path.extname(fileName));
  const cleaned = withoutExt
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

  if (/^\d+$/.test(cleaned)) {
    return `${sectionLabel} — Photo ${cleaned}`;
  }
  return cleaned || sectionLabel;
}

/**
 * Automatically seeds the gallery collection from existing local website assets if empty.
 */
export async function seedInitialGalleryFromDisk(): Promise<void> {
  const collection = await getGalleryCollection();
  const count = await collection.countDocuments();
  if (count > 0) return;

  const itemsToInsert: Omit<GalleryItem, "_id">[] = [];
  const baseUploadsDir = path.join(process.cwd(), "public", "uploads");

  // Section folders to scan
  const scanFolders: { section: GallerySectionKey; subPath: string }[] = [
    { section: "villa_exterior", subPath: "aboutvillab/1" },
    { section: "bedrooms", subPath: "aboutvillab/bedrooms" },
    { section: "amenities", subPath: "aboutvillab/amenities" },
    { section: "main_level", subPath: "aboutvillab/mainlevel" },
    { section: "main_level", subPath: "aboutvillab/viewmainlevel" },
    { section: "entertainment_deck", subPath: "aboutvillab/entertainmentdeck" },
    { section: "entertainment_deck", subPath: "aboutvillab/viewupperlevel" },
    { section: "gallery", subPath: "aboutvillab/gallery" },
    { section: "attractions", subPath: "attractions" },
  ];

  const sectionCounters: Record<string, number> = {};

  for (const { section, subPath } of scanFolders) {
    const dir = path.join(baseUploadsDir, subPath);
    if (!fs.existsSync(dir)) continue;

    const files = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.test(entry.name))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    const sectionConf = GALLERY_SECTIONS.find((s) => s.key === section);
    const sectionLabel = sectionConf ? sectionConf.label : "Villa";

    for (const file of files) {
      sectionCounters[section] = (sectionCounters[section] || 0) + 1;
      const order = sectionCounters[section];
      const publicUrl = `/uploads/${subPath}/${encodeURIComponent(file.name)}`;
      const title = filenameToTitle(file.name, sectionLabel);
      const altText = `${title} at Villa B on the Sea, Anguilla`;

      let fileSize: number | undefined;
      try {
        const stats = fs.statSync(path.join(dir, file.name));
        fileSize = stats.size;
      } catch {
        fileSize = undefined;
      }

      itemsToInsert.push({
        url: publicUrl,
        fileName: file.name,
        section,
        title,
        altText,
        order,
        status: "active",
        fileSize,
        mimeType: `image/${path.extname(file.name).slice(1).toLowerCase()}`,
        isLocalAsset: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  if (itemsToInsert.length > 0) {
    await collection.insertMany(itemsToInsert as any);
    await logActivity(
      "GALLERY_SEEDED",
      `Initialized ${itemsToInsert.length} villa images across all sections from public assets`
    );
  }
}

/**
 * Lists gallery items with optional filters and sorting.
 */
export async function listGalleryItems(options: {
  section?: GallerySectionKey | "all";
  status?: string;
  search?: string;
  hero?: boolean;
}): Promise<GalleryItem[]> {
  await seedInitialGalleryFromDisk();
  await ensureDefaultHeroItems();
  const collection = await getGalleryCollection();

  const query: Record<string, any> = {};

  // Status filter (default exclude archived)
  if (options.status && options.status !== "all") {
    query.status = options.status;
  } else {
    query.status = { $ne: "archived" };
  }

  // Section filter
  if (options.section && options.section !== "all") {
    query.section = options.section;
  }

  if (options.hero) {
    query.isHero = true;
  }

  // Search filter
  if (options.search && options.search.trim()) {
    const regex = new RegExp(options.search.trim(), "i");
    query.$or = [{ title: regex }, { altText: regex }, { fileName: regex }];
  }

  const docs = await collection
    .find(query)
    .sort({ section: 1, order: 1, createdAt: -1 })
    .toArray();

  return docs.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
  })) as GalleryItem[];
}

/**
 * Fetches gallery counts and metrics.
 */
export async function getGalleryStats(): Promise<GalleryStats> {
  await seedInitialGalleryFromDisk();
  await ensureDefaultHeroItems();
  const collection = await getGalleryCollection();

  const allItems = await collection
    .find({ status: { $ne: "archived" } })
    .toArray();

  const sectionCounts: Record<GallerySectionKey | "all", number> = {
    all: allItems.length,
    villa_exterior: 0,
    bedrooms: 0,
    amenities: 0,
    main_level: 0,
    entertainment_deck: 0,
    gallery: 0,
    attractions: 0,
    other: 0,
  };

  let activeImages = 0;
  let hiddenImages = 0;
  let missingAltCount = 0;
  let heroImages = 0;

  for (const item of allItems) {
    if (item.status === "active") activeImages++;
    if (item.status === "hidden") hiddenImages++;
    if (!item.altText || item.altText.trim() === "") missingAltCount++;
    if (item.isHero) heroImages++;

    const sec = item.section as GallerySectionKey;
    if (sectionCounts[sec] !== undefined) {
      sectionCounts[sec]++;
    } else {
      sectionCounts["other"]++;
    }
  }

  return {
    totalImages: allItems.length,
    activeImages,
    hiddenImages,
    missingAltCount,
    heroImages,
    sectionCounts,
  };
}

/**
 * Creates a new gallery item document.
 */
export async function createGalleryItem(
  data: CreateGalleryItemDto
): Promise<GalleryItem> {
  const collection = await getGalleryCollection();

  // Find current max order for this section
  const highest = await collection
    .find({ section: data.section, status: { $ne: "archived" } })
    .sort({ order: -1 })
    .limit(1)
    .toArray();

  const nextOrder =
    data.order !== undefined ? data.order : (highest[0]?.order || 0) + 1;

  const now = new Date().toISOString();
  const docToInsert = {
    url: data.url,
    fileName: data.fileName,
    section: data.section,
    title: data.title,
    altText: data.altText,
    order: nextOrder,
    status: data.status || "active",
    fileSize: data.fileSize,
    mimeType: data.mimeType,
    isLocalAsset: data.isLocalAsset || false,
    isHero: data.isHero || false,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(docToInsert as any);
  await logActivity(
    "GALLERY_IMAGE_UPLOADED",
    `Uploaded "${data.title}" to section ${data.section}`
  );

  return {
    ...docToInsert,
    _id: result.insertedId.toString(),
  };
}

/**
 * Updates metadata or section of an existing image.
 */
export async function updateGalleryItem(
  id: string,
  updates: UpdateGalleryItemDto
): Promise<GalleryItem | null> {
  const collection = await getGalleryCollection();
  if (!ObjectId.isValid(id)) return null;

  const updateFields: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };

  if (updates.title !== undefined) updateFields.title = updates.title;
  if (updates.altText !== undefined) updateFields.altText = updates.altText;
  if (updates.section !== undefined) updateFields.section = updates.section;
  if (updates.status !== undefined) updateFields.status = updates.status;
  if (updates.order !== undefined) updateFields.order = updates.order;
  if (updates.isHero !== undefined) updateFields.isHero = updates.isHero;

  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  );

  const updated = await collection.findOne({ _id: new ObjectId(id) });
  if (updated) {
    await logActivity(
      "GALLERY_IMAGE_UPDATED",
      `Updated image "${updated.title}" (Section: ${updated.section})`
    );
    return {
      ...updated,
      _id: updated._id.toString(),
    } as GalleryItem;
  }
  return null;
}

/**
 * Reorders an array of image IDs sequentially.
 */
export async function reorderGalleryItems(
  orderedIds: string[]
): Promise<boolean> {
  const collection = await getGalleryCollection();
  const bulkOps = orderedIds
    .filter((id) => ObjectId.isValid(id))
    .map((id, index) => ({
      updateOne: {
        filter: { _id: new ObjectId(id) },
        update: { $set: { order: index + 1, updatedAt: new Date().toISOString() } },
      },
    }));

  if (bulkOps.length > 0) {
    await collection.bulkWrite(bulkOps);
    await logActivity(
      "GALLERY_REORDERED",
      `Updated display order for ${bulkOps.length} gallery images`
    );
  }
  return true;
}

/**
 * Deletes or archives a gallery item.
 */
export async function deleteGalleryItem(
  id: string,
  hardDelete = false
): Promise<boolean> {
  const collection = await getGalleryCollection();
  if (!ObjectId.isValid(id)) return false;

  const item = await collection.findOne({ _id: new ObjectId(id) });
  if (!item) return false;

  // Clean up physical file if it was uploaded to /uploads/gallery/
  await deleteUploadedFile(item.url);

  if (hardDelete || !item.isLocalAsset) {
    await collection.deleteOne({ _id: new ObjectId(id) });
  } else {
    // Soft delete legacy assets so we never destroy website assets
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "archived", updatedAt: new Date().toISOString() } }
    );
  }

  await logActivity(
    "GALLERY_IMAGE_DELETED",
    `Removed image "${item.title}" from section ${item.section}`
  );

  return true;
}

/**
 * Replaces an existing image file while preserving or updating metadata.
 */
export async function replaceGalleryImage(
  id: string,
  newFile: File,
  updatedTitle?: string,
  updatedAlt?: string
): Promise<GalleryItem | null> {
  const collection = await getGalleryCollection();
  if (!ObjectId.isValid(id)) return null;

  const item = await collection.findOne({ _id: new ObjectId(id) });
  if (!item) return null;

  // Persist new file
  const stored = await saveUploadedFile(newFile, item.section);

  // If previous file was uploaded, safely delete it
  if (item.url && item.url.startsWith("/uploads/gallery/")) {
    await deleteUploadedFile(item.url);
  }

  const updateFields: Record<string, any> = {
    url: stored.url,
    fileName: stored.fileName,
    fileSize: stored.size,
    mimeType: stored.mimeType,
    updatedAt: new Date().toISOString(),
  };

  if (updatedTitle) updateFields.title = updatedTitle;
  if (updatedAlt) updateFields.altText = updatedAlt;

  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  );

  const updated = await collection.findOne({ _id: new ObjectId(id) });
  if (updated) {
    await logActivity(
      "GALLERY_IMAGE_REPLACED",
      `Replaced file for image "${updated.title}"`
    );
    return {
      ...updated,
      _id: updated._id.toString(),
    } as GalleryItem;
  }
  return null;
}
