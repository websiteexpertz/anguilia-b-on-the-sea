import { NextResponse } from "next/server";
import { listReviews } from "@/lib/db/services/reviewService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reviews = await listReviews({ status: "published" });

    // Map public-safe fields
    const sanitizedReviews = reviews.map((r) => ({
      _id: r._id,
      guestName: r.guestName,
      location: r.location,
      rating: r.rating,
      reviewText: r.reviewText,
      date: r.date,
      createdAt: r.createdAt,
    }));

    return NextResponse.json({
      success: true,
      reviews: sanitizedReviews,
    });
  } catch (error: any) {
    console.error("Public reviews fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load reviews" },
      { status: 500 }
    );
  }
}
