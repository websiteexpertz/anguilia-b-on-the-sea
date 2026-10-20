"use client";

import React, { useState } from "react";
import {
  StarIcon as StarSolid,
} from "@heroicons/react/24/solid";
import {
  StarIcon as StarOutline,
  MapPinIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  TrashIcon,
  GlobeAltIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { ReviewItem } from "@/lib/types/review";

interface ReviewCardProps {
  review: ReviewItem;
  onEdit: (review: ReviewItem) => void;
  onDelete: (review: ReviewItem) => void;
  onTogglePublish: (id: string) => Promise<void>;
}

export default function ReviewCard({
  review,
  onEdit,
  onDelete,
  onTogglePublish,
}: ReviewCardProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    try {
      setIsToggling(true);
      await onTogglePublish(review._id);
    } finally {
      setIsToggling(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = () => {
    switch (review.status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Published</span>
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Draft</span>
          </span>
        );
      case "hidden":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            <EyeSlashIcon className="w-3.5 h-3.5 text-stone-500" />
            <span>Hidden</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Header: Guest Info & Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#1C1917] leading-snug">
              {review.guestName}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#78716C]">
              {review.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="w-3.5 h-3.5 text-[#C88A4B]" />
                  <span>{review.location}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <CalendarDaysIcon className="w-3.5 h-3.5 text-[#A8A29E]" />
                <span>{formatDate(review.date)}</span>
              </span>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Star Rating Rendering */}
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) =>
            star <= review.rating ? (
              <StarSolid key={star} className="w-4 h-4 text-amber-500" />
            ) : (
              <StarOutline key={star} className="w-4 h-4 text-[#D6D3D1]" />
            )
          )}
          <span className="text-xs font-bold text-[#44403C] ml-1.5">
            {review.rating}.0
          </span>
        </div>

        {/* Review Quote */}
        <div className="relative pl-3 border-l-2 border-[#C88A4B]/40 mb-4">
          <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed italic">
            &ldquo;{review.reviewText}&rdquo;
          </p>
        </div>
      </div>

      {/* Footer: Quick Actions Bar */}
      <div className="pt-4 border-t border-[#F5F5F4] flex flex-wrap items-center justify-between gap-2">
        {/* Toggle Publish Button */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isToggling}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            review.status === "published"
              ? "bg-stone-100 text-stone-700 hover:bg-stone-200"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
          }`}
          title={
            review.status === "published"
              ? "Unpublish to draft (remove from public site)"
              : "Publish to public villa website"
          }
        >
          {isToggling ? (
            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
          ) : review.status === "published" ? (
            <EyeSlashIcon className="w-3.5 h-3.5 text-stone-500" />
          ) : (
            <GlobeAltIcon className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>
            {review.status === "published" ? "Unpublish" : "Publish to Website"}
          </span>
        </button>

        {/* Edit & Delete Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(review)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#44403C] hover:bg-[#F5F5F4] hover:text-[#1C1917] transition-colors"
          >
            <PencilSquareIcon className="w-3.5 h-3.5 text-[#78716C]" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(review)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <TrashIcon className="w-3.5 h-3.5 text-rose-500" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
