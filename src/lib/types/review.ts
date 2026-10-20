export type ReviewStatus = "published" | "draft" | "hidden";

export type ReviewSortOption =
  | "newest"
  | "oldest"
  | "highest_rating"
  | "lowest_rating";

export interface ReviewItem {
  _id: string;
  guestName: string;
  location?: string;
  rating: number; // 1 to 5
  reviewText: string;
  date: string; // YYYY-MM-DD
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewDto {
  guestName: string;
  location?: string;
  rating: number;
  reviewText: string;
  date: string;
  status?: ReviewStatus;
}

export interface UpdateReviewDto {
  guestName?: string;
  location?: string;
  rating?: number;
  reviewText?: string;
  date?: string;
  status?: ReviewStatus;
}

export interface ReviewFilterOptions {
  status?: ReviewStatus | "all";
  rating?: number | "all";
  search?: string;
  sortBy?: ReviewSortOption;
}

export interface ReviewStats {
  totalReviews: number;
  publishedReviews: number;
  draftReviews: number;
  hiddenReviews: number;
  averageRating: number;
  fiveStarCount: number;
}
