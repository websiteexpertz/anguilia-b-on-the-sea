import fs from "fs";
import path from "path";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export interface StoredImageResult {
  url: string;
  fileName: string;
  filePath: string;
  size: number;
  mimeType: string;
}

/**
 * Validates file MIME type and size.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported image format (${file.type}). Allowed formats: JPEG, PNG, WebP, AVIF.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  return { valid: true };
}

/**
 * Persists an uploaded image buffer to public/uploads/gallery/{section}/
 */
export async function saveUploadedFile(
  file: File,
  section: string
): Promise<StoredImageResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Sanitize section name for filesystem safety
  const safeSection = section.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();

  // Create target directory
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "gallery",
    safeSection
  );
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Generate clean unique filename
  const originalExt = path.extname(file.name) || ".jpg";
  const baseName = path
    .basename(file.name, originalExt)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);

  const timestamp = Date.now();
  const fileName = `${baseName || "photo"}-${timestamp}${originalExt.toLowerCase()}`;
  const filePath = path.join(uploadDir, fileName);

  // Write file buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(filePath, buffer);

  const publicUrl = `/uploads/gallery/${safeSection}/${fileName}`;

  return {
    url: publicUrl,
    fileName,
    filePath,
    size: file.size,
    mimeType: file.type,
  };
}

/**
 * Safely removes an uploaded file from disk.
 * NOTE: For safety, this only deletes files inside /uploads/gallery/ and never touches
 * original villa site assets in /uploads/aboutvillab/ or /uploads/attractions/.
 */
export async function deleteUploadedFile(fileUrl: string): Promise<boolean> {
  try {
    if (!fileUrl.startsWith("/uploads/gallery/")) {
      // Protect original legacy assets from physical deletion
      return false;
    }

    const relativePath = fileUrl.replace(/^\//, "");
    const absolutePath = path.join(process.cwd(), "public", relativePath);

    // Verify it is within public/uploads/gallery
    const safeBaseDir = path.join(process.cwd(), "public", "uploads", "gallery");
    if (!absolutePath.startsWith(safeBaseDir)) {
      return false;
    }

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return true;
    }
  } catch (err) {
    console.warn("Could not delete physical file:", fileUrl, err);
  }
  return false;
}
