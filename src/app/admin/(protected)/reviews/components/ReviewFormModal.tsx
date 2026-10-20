"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  StarIcon as StarSolid,
} from "@heroicons/react/24/solid";
import {
  StarIcon as StarOutline,
  CheckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { ReviewItem, CreateReviewDto, UpdateReviewDto, ReviewStatus } from "@/lib/types/review";

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReviewDto | UpdateReviewDto) => Promise<void>;
  initialData?: ReviewItem | null;
  mode: "add" | "edit";
}

export default function ReviewFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: ReviewFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [status, setStatus] = useState<ReviewStatus>("published");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialData && mode === "edit") {
      setGuestName(initialData.guestName);
      setLocation(initialData.location || "");
      setRating(initialData.rating);
      setDate(initialData.date);
      setReviewText(initialData.reviewText);
      setStatus(initialData.status);
    } else {
      setGuestName("");
      setLocation("");
      setRating(5);
      setDate(new Date().toISOString().split("T")[0]);
      setReviewText("");
      setStatus("published");
    }
    setError(null);
  }, [initialData, mode, isOpen]);

  if (!mounted || !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!guestName.trim()) {
      setError("Please enter the guest or customer name.");
      return;
    }

    if (!reviewText.trim()) {
      setError("Please enter the review or testimonial text.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5 stars.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        guestName: guestName.trim(),
        location: location.trim(),
        rating,
        date: date || new Date().toISOString().split("T")[0],
        reviewText: reviewText.trim(),
        status,
      });
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to save review. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return "5 Stars — Exceptional / Five-Star Luxury";
      case 4:
        return "4 Stars — Very Good Experience";
      case 3:
        return "3 Stars — Average Stay";
      case 2:
        return "2 Stars — Below Expectations";
      case 1:
        return "1 Star — Unsatisfactory";
      default:
        return `${stars} Stars`;
    }
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-xl w-full border border-[#E7E5E4] shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F4EFE9] flex items-center justify-between bg-gradient-to-r from-stone-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4EFE9] text-[#C88A4B] flex items-center justify-center shrink-0">
              <StarSolid className="w-5 h-5 fill-[#C88A4B]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                {mode === "add" ? "Add Guest Review" : "Edit Guest Review"}
              </h3>
              <p className="text-xs text-[#78716C]">
                {mode === "add"
                  ? "Enter guest testimonial details for the villa website"
                  : "Modify guest information, ratings, or publishing status"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-[#F4EFE9] transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Guest Name & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Guest Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Sophia & David Montgomery"
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Guest Location <span className="text-stone-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. New York, NY or London, UK"
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
              />
            </div>
          </div>

          {/* Interactive Star Rating Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Star Rating <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-3 p-3.5 bg-stone-50/70 border border-stone-200 rounded-2xl">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 text-amber-500 hover:scale-110 transition-transform focus:outline-none"
                    title={`${star} Star`}
                  >
                    {star <= currentDisplayRating ? (
                      <StarSolid className="w-6 h-6 fill-amber-500" />
                    ) : (
                      <StarOutline className="w-6 h-6 text-[#D6D3D1]" />
                    )}
                  </button>
                ))}
              </div>
              <span className="text-xs font-medium text-stone-600 ml-1">
                {getRatingLabel(currentDisplayRating)}
              </span>
            </div>
          </div>

          {/* Date and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Review / Stay Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Publishing Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReviewStatus)}
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all cursor-pointer"
              >
                <option value="published">Published (Visible on public site)</option>
                <option value="draft">Draft (Review internally first)</option>
                <option value="hidden">Hidden (Archived / Inactive)</option>
              </select>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Review Content / Testimonial Quote <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Enter the guest's detailed review or testimonial quote..."
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C88A4B] hover:bg-[#B3783E] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" />
                  <span>{mode === "add" ? "Save Testimonial" : "Save Changes"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
