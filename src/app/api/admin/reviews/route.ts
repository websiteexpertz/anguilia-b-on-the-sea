import { NextRequest, NextResponse } from "next/server";
import {
  listReviews,
  createReview,
  getReviewStats,
} from "@/lib/db/services/reviewService";
import {
  ReviewFilterOptions,
  ReviewStatus,
  ReviewSortOption,
  CreateReviewDto,
} from "@/lib/types/review";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ReviewStatus | "all" | null;
    const ratingParam = searchParams.get("rating");
    const search = searchParams.get("search") || undefined;
    const sortBy = (searchParams.get("sortBy") as ReviewSortOption) || "newest";

    const rating = ratingParam && ratingParam !== "all" ? Number(ratingParam) : "all";

    const filters: ReviewFilterOptions = {
      status: status || "all",
      rating,
      search,
      sortBy,
    };

    const [reviews, stats] = await Promise.all([
      listReviews(filters),
      getReviewStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: reviews,
      stats,
    });
  } catch (error: unknown) {
    console.error("Error listing reviews:", error);
    return NextResponse.json(
      { error: "Failed to load testimonials and reviews." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.guestName || !body.guestName.trim()) {
      return NextResponse.json(
        { error: "Guest or customer name is required." },
        { status: 400 }
      );
    }

    if (!body.reviewText || !body.reviewText.trim()) {
      return NextResponse.json(
        { error: "Review text content is required." },
        { status: 400 }
      );
    }

    const rating = Number(body.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be a number between 1 and 5." },
        { status: 400 }
      );
    }

    const dto: CreateReviewDto = {
      guestName: body.guestName.trim(),
      location: body.location ? body.location.trim() : "",
      rating: Math.round(rating),
      reviewText: body.reviewText.trim(),
      date: body.date || new Date().toISOString().split("T")[0],
      status: (body.status as ReviewStatus) || "published",
    };

    const newReview = await createReview(dto);

    return NextResponse.json({
      success: true,
      message: "Review created successfully.",
      data: newReview,
    });
  } catch (error: unknown) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review." },
      { status: 500 }
    );
  }
}
