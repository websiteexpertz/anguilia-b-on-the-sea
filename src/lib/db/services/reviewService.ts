import { ObjectId } from "mongodb";
import { getDatabase } from "../mongodb";
import {
  ReviewItem,
  CreateReviewDto,
  UpdateReviewDto,
  ReviewFilterOptions,
  ReviewStats,
  ReviewStatus,
} from "@/lib/types/review";

const COLLECTION_NAME = "reviews";

async function getReviewCollection() {
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
    console.warn("Could not log review activity:", err);
  }
}

let seedPromise: Promise<void> | null = null;

/**
 * Seeds initial realistic testimonials if collection is empty.
 */
export async function ensureSeedReviews(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const collection = await getReviewCollection();
    const count = await collection.countDocuments();
    if (count > 0) return;

    const sampleReviews: Omit<ReviewItem, "_id">[] = [
    {
      guestName: "Sophia & David Montgomery",
      location: "New York, NY",
      rating: 5,
      reviewText:
        "An unforgettable Caribbean haven. The unobstructed ocean views from the master terrace and infinity pool are simply breathtaking. Every bedroom was exquisitely appointed, and the team made us feel like royalty. We are already booking our return trip for next season!",
      date: "2026-02-18",
      status: "published",
      createdAt: new Date("2026-02-18T14:30:00.000Z").toISOString(),
      updatedAt: new Date("2026-02-18T14:30:00.000Z").toISOString(),
    },
    {
      guestName: "Oliver Sinclair",
      location: "London, UK",
      rating: 5,
      reviewText:
        "Villa B exceeded every expectation. The sleek modern architectural design combined with the gentle ocean breezes provided the ultimate sanctuary for our group of eight. Sunset cocktails on the entertainment deck were legendary.",
      date: "2026-01-05",
      status: "published",
      createdAt: new Date("2026-01-05T10:15:00.000Z").toISOString(),
      updatedAt: new Date("2026-01-05T10:15:00.000Z").toISOString(),
    },
    {
      guestName: "Isabella Rossi",
      location: "Milan, Italy",
      rating: 5,
      reviewText:
        "Perfection on the peaceful shores of Anguilla. The gourmet chef's kitchen, expansive open-plan living pavilion, and direct access to crystal-clear waters made our family holiday sublime. Truly five-star luxury with complete privacy.",
      date: "2025-12-14",
      status: "published",
      createdAt: new Date("2025-12-14T18:45:00.000Z").toISOString(),
      updatedAt: new Date("2025-12-14T18:45:00.000Z").toISOString(),
    },
    {
      guestName: "Dr. Harrison & Claire Vance",
      location: "Boston, MA",
      rating: 4,
      reviewText:
        "Exceptional property with extraordinary privacy and comfort. The bedding was plush, the air conditioning was whisper quiet, and the concierge recommendations for local dining in Sandy Ground were spot on. A true Caribbean jewel.",
      date: "2025-11-20",
      status: "published",
      createdAt: new Date("2025-11-20T09:20:00.000Z").toISOString(),
      updatedAt: new Date("2025-11-20T09:20:00.000Z").toISOString(),
    },
    {
      guestName: "Charlotte Dupont",
      location: "Paris, France",
      rating: 5,
      reviewText:
        "What an angelic sanctuary! Waking up to the turquoise sea and falling asleep to the gentle sound of the waves. Impeccable cleanliness, thoughtful amenities, and wonderful host communication throughout our stay.",
      date: "2026-03-01",
      status: "draft",
      createdAt: new Date("2026-03-01T16:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-03-01T16:00:00.000Z").toISOString(),
    },
  ];

    await collection.insertMany(sampleReviews as any);
    await logActivity(
      "REVIEWS_SEEDED",
      `Initialized ${sampleReviews.length} guest reviews and testimonials`
    );
  })();

  return seedPromise;
}

/**
 * Lists reviews with filtering and sorting.
 */
export async function listReviews(
  filters: ReviewFilterOptions = {}
): Promise<ReviewItem[]> {
  await ensureSeedReviews();
  const collection = await getReviewCollection();

  const query: Record<string, any> = {};

  // Status filter
  if (filters.status && filters.status !== "all") {
    query.status = filters.status;
  }

  // Rating filter
  if (filters.rating && filters.rating !== "all") {
    query.rating = Number(filters.rating);
  }

  // Search filter across guestName, location, reviewText
  if (filters.search && filters.search.trim()) {
    const searchRegex = new RegExp(filters.search.trim(), "i");
    query.$or = [
      { guestName: searchRegex },
      { location: searchRegex },
      { reviewText: searchRegex },
    ];
  }

  // Sorting
  let sortOption: Record<string, any> = { date: -1, createdAt: -1 };
  if (filters.sortBy === "oldest") {
    sortOption = { date: 1, createdAt: 1 };
  } else if (filters.sortBy === "highest_rating") {
    sortOption = { rating: -1, date: -1 };
  } else if (filters.sortBy === "lowest_rating") {
    sortOption = { rating: 1, date: -1 };
  } else {
    sortOption = { date: -1, createdAt: -1 };
  }

  const docs = await collection.find(query).sort(sortOption).toArray();

  return docs.map((doc) => ({
    _id: doc._id.toString(),
    guestName: doc.guestName,
    location: doc.location || "",
    rating: doc.rating,
    reviewText: doc.reviewText,
    date: doc.date,
    status: doc.status || "published",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
}

/**
 * Returns published reviews for display on the public website.
 */
export async function getPublishedReviews(limit = 10): Promise<ReviewItem[]> {
  await ensureSeedReviews();
  const collection = await getReviewCollection();

  const docs = await collection
    .find({ status: "published" })
    .sort({ rating: -1, date: -1 })
    .limit(limit)
    .toArray();

  return docs.map((doc) => ({
    _id: doc._id.toString(),
    guestName: doc.guestName,
    location: doc.location || "",
    rating: doc.rating,
    reviewText: doc.reviewText,
    date: doc.date,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
}

/**
 * Retrieves a single review by ID.
 */
export async function getReviewById(id: string): Promise<ReviewItem | null> {
  const collection = await getReviewCollection();
  if (!ObjectId.isValid(id)) return null;

  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;

  return {
    _id: doc._id.toString(),
    guestName: doc.guestName,
    location: doc.location || "",
    rating: doc.rating,
    reviewText: doc.reviewText,
    date: doc.date,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Creates a new review.
 */
export async function createReview(dto: CreateReviewDto): Promise<ReviewItem> {
  const collection = await getReviewCollection();
  const now = new Date().toISOString();

  const newDoc: Omit<ReviewItem, "_id"> = {
    guestName: dto.guestName.trim(),
    location: dto.location ? dto.location.trim() : "",
    rating: Math.max(1, Math.min(5, Math.round(Number(dto.rating) || 5))),
    reviewText: dto.reviewText.trim(),
    date: dto.date || new Date().toISOString().split("T")[0],
    status: dto.status || "published",
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(newDoc as any);
  await logActivity(
    "REVIEW_CREATED",
    `Added review from ${newDoc.guestName} (${newDoc.rating} stars, ${newDoc.status})`
  );

  return {
    ...newDoc,
    _id: result.insertedId.toString(),
  };
}

/**
 * Updates an existing review.
 */
export async function updateReview(
  id: string,
  dto: UpdateReviewDto
): Promise<ReviewItem | null> {
  const collection = await getReviewCollection();
  if (!ObjectId.isValid(id)) return null;

  const updateFields: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };

  if (dto.guestName !== undefined) updateFields.guestName = dto.guestName.trim();
  if (dto.location !== undefined) updateFields.location = dto.location.trim();
  if (dto.rating !== undefined) {
    updateFields.rating = Math.max(1, Math.min(5, Math.round(Number(dto.rating))));
  }
  if (dto.reviewText !== undefined) updateFields.reviewText = dto.reviewText.trim();
  if (dto.date !== undefined) updateFields.date = dto.date;
  if (dto.status !== undefined) updateFields.status = dto.status;

  await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

  const updated = await collection.findOne({ _id: new ObjectId(id) });
  if (updated) {
    await logActivity(
      "REVIEW_UPDATED",
      `Updated review from ${updated.guestName} (${updated.rating} stars, ${updated.status})`
    );

    return {
      _id: updated._id.toString(),
      guestName: updated.guestName,
      location: updated.location || "",
      rating: updated.rating,
      reviewText: updated.reviewText,
      date: updated.date,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  return null;
}

/**
 * Toggles a review's published status:
 * If published -> changes to 'draft'
 * If draft or hidden -> changes to 'published'
 */
export async function toggleReviewPublishStatus(
  id: string
): Promise<ReviewItem | null> {
  const current = await getReviewById(id);
  if (!current) return null;

  const newStatus: ReviewStatus =
    current.status === "published" ? "draft" : "published";

  return updateReview(id, { status: newStatus });
}

/**
 * Deletes a review permanently.
 */
export async function deleteReview(id: string): Promise<boolean> {
  const collection = await getReviewCollection();
  if (!ObjectId.isValid(id)) return false;

  const existing = await collection.findOne({ _id: new ObjectId(id) });
  const result = await collection.deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount > 0) {
    await logActivity(
      "REVIEW_DELETED",
      `Deleted review by ${existing?.guestName || id}`
    );
    return true;
  }
  return false;
}

/**
 * Calculates review stats.
 */
export async function getReviewStats(): Promise<ReviewStats> {
  await ensureSeedReviews();
  const collection = await getReviewCollection();

  const allReviews = await collection.find({}).toArray();

  const totalReviews = allReviews.length;
  const publishedReviews = allReviews.filter((r) => r.status === "published").length;
  const draftReviews = allReviews.filter((r) => r.status === "draft").length;
  const hiddenReviews = allReviews.filter((r) => r.status === "hidden").length;
  const fiveStarCount = allReviews.filter((r) => r.rating === 5).length;

  const sumRating = allReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
  const averageRating =
    totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 5.0;

  return {
    totalReviews,
    publishedReviews,
    draftReviews,
    hiddenReviews,
    averageRating,
    fiveStarCount,
  };
}
