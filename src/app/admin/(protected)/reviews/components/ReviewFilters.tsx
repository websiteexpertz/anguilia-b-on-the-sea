"use client";

import React from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import { ReviewStatus, ReviewSortOption } from "@/lib/types/review";

interface ReviewFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: ReviewStatus | "all";
  onStatusChange: (status: ReviewStatus | "all") => void;
  rating: number | "all";
  onRatingChange: (rating: number | "all") => void;
  sortBy: ReviewSortOption;
  onSortByChange: (sort: ReviewSortOption) => void;
  onOpenAddModal: () => void;
  counts?: {
    all: number;
    published: number;
    draft: number;
    hidden: number;
  };
}

export default function ReviewFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  rating,
  onRatingChange,
  sortBy,
  onSortByChange,
  onOpenAddModal,
  counts,
}: ReviewFiltersProps) {
  const statusTabs: { key: ReviewStatus | "all"; label: string; count?: number }[] = [
    { key: "all", label: "All Reviews", count: counts?.all },
    { key: "published", label: "Published", count: counts?.published },
    { key: "draft", label: "Drafts", count: counts?.draft },
    { key: "hidden", label: "Hidden", count: counts?.hidden },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top row: Status Tabs & Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#F5F5F4] pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {statusTabs.map((tab) => {
            const isActive = status === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onStatusChange(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#C88A4B] text-white shadow-sm"
                    : "bg-[#F5F5F4] text-[#78716C] hover:bg-[#E7E5E4] hover:text-[#1C1917]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-[#E7E5E4] text-[#44403C]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1C1917] hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Bottom row: Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
            <MagnifyingGlassIcon className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by guest name, location, or review text..."
            className="w-full pl-9 pr-9 py-2 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A8A29E] hover:text-[#44403C]"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Rating Filter */}
        <div className="sm:col-span-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A8A29E]">
            <FunnelIcon className="w-3.5 h-3.5" />
          </div>
          <select
            value={rating === "all" ? "all" : String(rating)}
            onChange={(e) =>
              onRatingChange(e.target.value === "all" ? "all" : Number(e.target.value))
            }
            aria-label="Filter by star rating"
            className="w-full pl-8 pr-7 py-2 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">5 Stars ★★★★★</option>
            <option value="4">4 Stars ★★★★☆</option>
            <option value="3">3 Stars ★★★☆☆</option>
            <option value="2">2 Stars ★★☆☆☆</option>
            <option value="1">1 Star ★☆☆☆☆</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="sm:col-span-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A8A29E]">
            <ArrowsUpDownIcon className="w-3.5 h-3.5" />
          </div>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as ReviewSortOption)}
            aria-label="Sort reviews by"
            className="w-full pl-8 pr-7 py-2 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all appearance-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest_rating">Highest Rating</option>
            <option value="lowest_rating">Lowest Rating</option>
          </select>
        </div>
      </div>
    </div>
  );
}
