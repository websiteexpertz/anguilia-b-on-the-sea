"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { ReviewItem } from "@/lib/types/review";

interface DeleteReviewModalProps {
  isOpen: boolean;
  review: ReviewItem | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export default function DeleteReviewModal({
  isOpen,
  review,
  onClose,
  onConfirm,
}: DeleteReviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setError(null);
  }, [isOpen]);

  if (!mounted || !isOpen || !review) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await onConfirm(review._id);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to delete review. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-md w-full border border-[#E7E5E4] shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F4EFE9] flex items-center justify-between bg-gradient-to-r from-stone-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <ExclamationTriangleIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                Delete Testimonial?
              </h3>
              <p className="text-xs text-[#78716C]">
                Permanent action cannot be undone
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

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            Are you sure you want to permanently remove the review by{" "}
            <strong className="text-stone-900 font-semibold">{review.guestName}</strong>?
            This will immediately remove it from all villa website displays.
          </p>

          <div className="p-3.5 bg-stone-50/80 border border-stone-200 rounded-2xl text-xs text-stone-600 italic">
            &ldquo;{review.reviewText.length > 130
              ? `${review.reviewText.slice(0, 130)}...`
              : review.reviewText}&rdquo;
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <TrashIcon className="w-4 h-4" />
                  <span>Delete Permanently</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
