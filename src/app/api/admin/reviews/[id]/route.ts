import { NextRequest, NextResponse } from "next/server";
import {
  getReviewById,
  updateReview,
  toggleReviewPublishStatus,
  deleteReview,
} from "@/lib/db/services/reviewService";
import { UpdateReviewDto } from "@/lib/types/review";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const review = await getReviewById(id);

    if (!review) {
      return NextResponse.json(
        { error: "Review not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error: unknown) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Failed to load review." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Support one-click quick toggle
    if (body.togglePublish === true) {
      const updated = await toggleReviewPublishStatus(id);
      if (!updated) {
        return NextResponse.json(
          { error: "Review not found or could not toggle status." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Review status changed to ${updated.status}.`,
        data: updated,
      });
    }

    const updateDto: UpdateReviewDto = {};
    if (body.guestName !== undefined) updateDto.guestName = body.guestName;
    if (body.location !== undefined) updateDto.location = body.location;
    if (body.rating !== undefined) updateDto.rating = Number(body.rating);
    if (body.reviewText !== undefined) updateDto.reviewText = body.reviewText;
    if (body.date !== undefined) updateDto.date = body.date;
    if (body.status !== undefined) updateDto.status = body.status;

    const updated = await updateReview(id, updateDto);

    if (!updated) {
      return NextResponse.json(
        { error: "Review not found or could not be updated." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Review updated successfully.",
      data: updated,
    });
  } catch (error: unknown) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update review." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteReview(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Review not found or could not be deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error: unknown) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review." },
      { status: 500 }
    );
  }
}
