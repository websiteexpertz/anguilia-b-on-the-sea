"use client";

import React from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { InquiryStatus, InquiryStats } from "@/lib/types/inquiry";

interface InquiryFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: InquiryStatus | "all";
  onStatusChange: (status: InquiryStatus | "all") => void;
  readStatus: "all" | "read" | "unread";
  onReadStatusChange: (val: "all" | "read" | "unread") => void;
  dateFrom: string;
  onDateFromChange: (val: string) => void;
  dateTo: string;
  onDateToChange: (val: string) => void;
  stats: InquiryStats | null;
  onReset: () => void;
}

export default function InquiryFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  readStatus,
  onReadStatusChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  stats,
  onReset,
}: InquiryFiltersProps) {
  const statusTabs: { key: InquiryStatus | "all"; label: string; count?: number }[] = [
    { key: "all", label: "All Active", count: (stats?.total ?? 0) - (stats?.archivedCount ?? 0) },
    { key: "new", label: "New", count: stats?.newCount ?? 0 },
    { key: "confirmed", label: "Confirmed", count: stats?.confirmedCount ?? 0 },
    { key: "rejected", label: "Rejected", count: stats?.rejectedCount ?? 0 },
    { key: "contacted", label: "Contacted", count: stats?.contactedCount ?? 0 },
    { key: "in_progress", label: "In Progress", count: stats?.inProgressCount ?? 0 },
    { key: "resolved", label: "Resolved", count: stats?.resolvedCount ?? 0 },
    { key: "archived", label: "Archived", count: stats?.archivedCount ?? 0 },
  ];

  const hasActiveFilters =
    search ||
    status !== "all" ||
    readStatus !== "all" ||
    dateFrom ||
    dateTo;

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top row: Search input + Read state + Date pickers */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <MagnifyingGlassIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by customer name, email, or subject..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#C88A4B] focus:bg-white text-stone-800 transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Read status filter */}
        <div className="md:col-span-3">
          <select
            value={readStatus}
            onChange={(e) =>
              onReadStatusChange(e.target.value as "all" | "read" | "unread")
            }
            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#C88A4B] text-stone-700 font-medium transition-colors"
          >
            <option value="all">All Read States</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="md:col-span-3 flex items-center gap-1.5">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            title="Date from"
            className="w-1/2 px-2 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#C88A4B] text-stone-700"
          />
          <span className="text-stone-400 text-xs">-</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            title="Date to"
            className="w-1/2 px-2 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#C88A4B] text-stone-700"
          />
        </div>
      </div>

      {/* Bottom row: Status Pills & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#F4EFE9]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {statusTabs.map((tab) => {
            const isActive = status === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onStatusChange(tab.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-[#C88A4B] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-[#F4EFE9]/70"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-xs text-[#C88A4B] hover:text-[#B07338] font-semibold transition-colors shrink-0 cursor-pointer self-end sm:self-auto"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
