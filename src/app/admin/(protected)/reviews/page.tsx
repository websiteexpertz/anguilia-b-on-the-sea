"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  StarIcon,
  SparklesIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import ReviewStatsCards from "./components/ReviewStatsCards";
import ReviewFilters from "./components/ReviewFilters";
import ReviewCard from "./components/ReviewCard";
import ReviewFormModal from "./components/ReviewFormModal";
import DeleteReviewModal from "./components/DeleteReviewModal";
import {
  ReviewItem,
  ReviewStats,
  ReviewStatus,
  ReviewSortOption,
  CreateReviewDto,
  UpdateReviewDto,
} from "@/lib/types/review";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and sorting
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReviewStatus | "all">("all");
  const [rating, setRating] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<ReviewSortOption>("newest");

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<"add" | "edit">("add");
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewItem | null>(null);

  // Notification Toast
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (rating !== "all") params.set("rating", String(rating));
      if (search.trim()) params.set("search", search.trim());
      if (sortBy) params.set("sortBy", sortBy);

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch reviews");
      }

      setReviews(json.data || []);
      setStats(json.stats || null);
    } catch (err: unknown) {
      console.error("Error loading reviews:", err);
      setError(err instanceof Error ? err.message : "Error loading reviews");
    } finally {
      setIsLoading(false);
    }
  }, [status, rating, search, sortBy]);

  // Initial load and filter change
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Toggle publish status handler
  const handleTogglePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ togglePublish: true }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to toggle status");
      }

      showNotification(
        "success",
        `Review status updated to "${json.data?.status}".`
      );

      // Refresh list and stats
      await fetchReviews();
    } catch (err: unknown) {
      showNotification(
        "error",
        err instanceof Error ? err.message : "Failed to toggle status."
      );
    }
  };

  // Open add modal
  const handleOpenAddModal = () => {
    setSelectedReview(null);
    setFormModalMode("add");
    setFormModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (review: ReviewItem) => {
    setSelectedReview(review);
    setFormModalMode("edit");
    setFormModalOpen(true);
  };

  // Open delete modal
  const handleOpenDeleteModal = (review: ReviewItem) => {
    setReviewToDelete(review);
    setDeleteModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveReview = async (data: CreateReviewDto | UpdateReviewDto) => {
    if (formModalMode === "add") {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create review");
      }
      showNotification("success", "Guest testimonial added successfully!");
    } else if (selectedReview) {
      const res = await fetch(`/api/admin/reviews/${selectedReview._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update review");
      }
      showNotification("success", "Guest testimonial updated successfully!");
    }
    await fetchReviews();
  };

  // Confirm delete
  const handleConfirmDelete = async (id: string) => {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to delete review");
    }
    showNotification("success", "Testimonial permanently deleted.");
    await fetchReviews();
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
              Testimonials & Reviews
            </h1>
            <div className="p-1 rounded-lg bg-amber-50 text-amber-600">
              <StarIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            Manage guest reviews, star ratings, and curate testimonials displayed on the public villa website.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReviews}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F5F5F4] border border-[#E7E5E4] rounded-xl text-xs font-semibold text-[#44403C] transition-colors shadow-sm self-start sm:self-auto disabled:opacity-50"
          title="Refresh reviews"
        >
          <ArrowPathIcon
            className={`w-4 h-4 text-[#78716C] ${isLoading ? "animate-spin" : ""}`}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold transition-all shadow-sm ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            ) : (
              <ExclamationCircleIcon className="w-4 h-4 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <ReviewStatsCards stats={stats} isLoading={isLoading} />

      {/* Filters and Controls */}
      <ReviewFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        rating={rating}
        onRatingChange={setRating}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onOpenAddModal={handleOpenAddModal}
        counts={
          stats
            ? {
                all: stats.totalReviews,
                published: stats.publishedReviews,
                draft: stats.draftReviews,
                hidden: stats.hiddenReviews,
              }
            : undefined
        }
      />

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium flex items-center gap-2">
          <ExclamationCircleIcon className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Reviews Grid / List */}
      {isLoading && reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-12 text-center shadow-sm">
          <ArrowPathIcon className="w-8 h-8 text-[#C88A4B] animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-[#78716C]">
            Loading guest testimonials...
          </p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-12 text-center shadow-sm max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#F4EFE9] text-[#C88A4B] flex items-center justify-center mx-auto mb-3">
            <ChatBubbleBottomCenterTextIcon className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-[#1C1917] mb-1">
            No Testimonials Found
          </h3>
          <p className="text-xs text-[#78716C] leading-relaxed mb-5">
            {search || status !== "all" || rating !== "all"
              ? "No reviews match your current filters. Try changing your search query or reset filter options."
              : "There are currently no reviews in the system. Add your first guest review to display it on the website."}
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C88A4B] hover:bg-[#B3783E] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Add First Review</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Form Modal (Portalled z-[100]) */}
      <ReviewFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleSaveReview}
        initialData={selectedReview}
        mode={formModalMode}
      />

      {/* Delete Confirmation Modal (Portalled z-[100]) */}
      <DeleteReviewModal
        isOpen={deleteModalOpen}
        review={reviewToDelete}
        onClose={() => {
          setDeleteModalOpen(false);
          setReviewToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
