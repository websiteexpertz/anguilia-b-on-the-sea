"use client";

import React from "react";
import Link from "next/link";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MinusCircleIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { AvailabilitySummary } from "@/lib/types/dashboard";

interface AvailabilityOverviewProps {
  availability?: AvailabilitySummary;
  isLoading?: boolean;
}

export default function AvailabilityOverview({
  availability,
  isLoading,
}: AvailabilityOverviewProps) {
  if (isLoading || !availability) {
    return (
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-sm animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-36 h-6 bg-[#F4EFE9] rounded" />
          <div className="w-24 h-4 bg-[#F4EFE9] rounded" />
        </div>
        <div className="h-20 bg-[#F4EFE9] rounded-xl" />
        <div className="h-16 bg-[#F4EFE9] rounded-xl" />
      </div>
    );
  }

  const renderTodayBadge = () => {
    switch (availability.todayStatus) {
      case "booked":
        return (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
            <XCircleIcon className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Currently Booked</p>
              <p className="text-[11px] text-amber-700">Villa is currently occupied by guests.</p>
            </div>
          </div>
        );
      case "blocked":
        return (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-100 border border-stone-200 text-stone-900">
            <MinusCircleIcon className="w-5 h-5 text-stone-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Currently Blocked</p>
              <p className="text-[11px] text-stone-600">Reserved for villa maintenance / owner hold.</p>
            </div>
          </div>
        );
      case "available":
      default:
        return (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Available Today</p>
              <p className="text-[11px] text-emerald-700">Open for immediate booking / guest check-in.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1C1917]">
              Availability Pulse
            </h3>
            <p className="text-xs text-[#78716C]">
              Real-time property occupancy and date status
            </p>
          </div>
          <Link
            href="/admin/availability"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1C1917] hover:text-[#C88A4B] transition-colors"
          >
            <span>Manage Availability</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Today's Status Banner */}
        <div className="mb-4">{renderTodayBadge()}</div>

        {/* Key availability metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#E7E5E4]">
            <p className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider mb-1">
              Upcoming Booked
            </p>
            <p className="font-serif text-xl font-bold text-[#1C1917]">
              {availability.upcomingBookedDates.length}
            </p>
            <p className="text-[10px] text-[#78716C]">
              {availability.upcomingBookedDates.length === 0 ? "None scheduled" : "dates scheduled"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#E7E5E4]">
            <p className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider mb-1">
              Upcoming Blocked
            </p>
            <p className="font-serif text-xl font-bold text-[#1C1917]">
              {availability.upcomingBlockedDates.length}
            </p>
            <p className="text-[10px] text-[#78716C]">
              {availability.upcomingBlockedDates.length === 0 ? "No active blocks" : "dates blocked"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer next available estimate */}
      <div className="pt-3 border-t border-[#F4EFE9] flex items-center justify-between text-xs">
        <span className="text-[#78716C]">Next Available Check-in:</span>
        <span className="font-semibold text-[#C88A4B]">
          {availability.nextAvailableDate || "Immediate"}
        </span>
      </div>
    </div>
  );
}
