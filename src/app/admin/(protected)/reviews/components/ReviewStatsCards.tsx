"use client";

import React from "react";
import {
  StarIcon as StarSolid,
} from "@heroicons/react/24/solid";
import {
  ChatBubbleBottomCenterTextIcon,
  GlobeAltIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { ReviewStats } from "@/lib/types/review";

interface ReviewStatsCardsProps {
  stats: ReviewStats | null;
  isLoading: boolean;
}

export default function ReviewStatsCards({
  stats,
  isLoading,
}: ReviewStatsCardsProps) {
  const cards = [
    {
      title: "Total Reviews",
      value: stats ? stats.totalReviews : "-",
      subtext: `${stats ? stats.fiveStarCount : 0} five-star testimonials`,
      icon: ChatBubbleBottomCenterTextIcon,
      color: "text-stone-700 bg-stone-100",
    },
    {
      title: "Published on Site",
      value: stats ? stats.publishedReviews : "-",
      subtext: "Visible on public website",
      icon: GlobeAltIcon,
      color: "text-emerald-700 bg-emerald-50 border border-emerald-100",
    },
    {
      title: "Average Rating",
      value: stats ? `${stats.averageRating.toFixed(1)} / 5.0` : "-",
      subtext: "Across all submitted reviews",
      icon: StarSolid,
      color: "text-amber-600 bg-amber-50 border border-amber-100",
      isRating: true,
    },
    {
      title: "Drafts & Hidden",
      value: stats ? stats.draftReviews + stats.hiddenReviews : "-",
      subtext: `${stats ? stats.draftReviews : 0} draft, ${stats ? stats.hiddenReviews : 0} hidden`,
      icon: DocumentDuplicateIcon,
      color: "text-stone-600 bg-stone-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-[#E7E5E4] p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold tracking-wider text-[#78716C] uppercase">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                {isLoading ? "..." : card.value}
              </span>
              {card.isRating && !isLoading && stats && (
                <div className="flex items-center text-amber-500">
                  <StarSolid className="w-4 h-4" />
                </div>
              )}
            </div>

            <p className="mt-1 text-xs text-[#78716C]">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
