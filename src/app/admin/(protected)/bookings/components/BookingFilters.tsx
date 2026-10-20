"use client";

import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import { BookingStatus } from "@/lib/types/booking";

interface BookingFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: BookingStatus | "all";
  onStatusChange: (status: BookingStatus | "all") => void;
  timeframe: "all" | "upcoming" | "past";
  onTimeframeChange: (tf: "all" | "upcoming" | "past") => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (field: string, order: "asc" | "desc") => void;
}

export default function BookingFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  timeframe,
  onTimeframeChange,
  sortBy,
  sortOrder,
  onSortChange,
}: BookingFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const statusOptions: Array<{ id: BookingStatus | "all"; label: string }> = [
    { id: "all", label: "All Statuses" },
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const timeframeOptions: Array<{ id: "all" | "upcoming" | "past"; label: string }> = [
    { id: "all", label: "All Dates" },
    { id: "upcoming", label: "Upcoming Stays" },
    { id: "past", label: "Past Stays" },
  ];

  const sortOptions = [
    { label: "Newest Created", field: "createdAt", order: "desc" },
    { label: "Oldest Created", field: "createdAt", order: "asc" },
    { label: "Earliest Check-In", field: "checkIn", order: "asc" },
    { label: "Latest Check-In", field: "checkIn", order: "desc" },
    { label: "Highest Amount", field: "amount", order: "desc" },
    { label: "Lowest Amount", field: "amount", order: "asc" },
  ];

  const currentSortKey = `${sortBy}_${sortOrder}`;

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top row: Search and Sort */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#78716C]">
            <MagnifyingGlassIcon className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by guest name, email, booking ref (e.g. VB-2026), phone..."
            className="block w-full rounded-xl border border-[#D8D2C6] bg-[#FDFBF7]/60 pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#1C1917] placeholder-[#78716C] focus:bg-white focus:border-[#C88A4B] focus:ring-2 focus:ring-[#C88A4B]/20 transition-all outline-none"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#78716C] hover:text-[#1C1917]"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <ArrowsUpDownIcon className="w-4 h-4 text-[#78716C] hidden sm:inline" />
          <select
            value={currentSortKey}
            onChange={(e) => {
              const selected = sortOptions.find(
                (opt) => `${opt.field}_${opt.order}` === e.target.value
              );
              if (selected) {
                onSortChange(selected.field, selected.order as "asc" | "desc");
              }
            }}
            className="rounded-xl border border-[#D8D2C6] bg-[#FDFBF7]/60 px-3 py-2 text-xs font-semibold text-[#1C1917] focus:border-[#C88A4B] focus:ring-2 focus:ring-[#C88A4B]/20 outline-none transition-all cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option
                key={`${opt.field}_${opt.order}`}
                value={`${opt.field}_${opt.order}`}
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Chips / Tabs row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F4EFE9]">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider mr-1 flex items-center gap-1">
            <FunnelIcon className="w-3 h-3" />
            <span>Status:</span>
          </span>
          {statusOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onStatusChange(opt.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                status === opt.id
                  ? "bg-[#1C1917] text-white shadow-sm"
                  : "bg-[#F4EFE9] text-[#78716C] hover:text-[#1C1917] hover:bg-[#E7E5E4]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Timeframe filter pills */}
        <div className="flex items-center gap-1.5">
          {timeframeOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onTimeframeChange(opt.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                timeframe === opt.id
                  ? "bg-[#C88A4B] text-white font-semibold shadow-sm"
                  : "bg-[#F4EFE9] text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
