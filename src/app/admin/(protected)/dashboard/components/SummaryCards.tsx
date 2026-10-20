"use client";

import React from "react";
import {
  CalendarDaysIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";
import { SummaryCardsData } from "@/lib/types/dashboard";

interface SummaryCardsProps {
  data?: SummaryCardsData;
  isLoading?: boolean;
}

export default function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-sm animate-pulse space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F4EFE9]" />
              <div className="w-16 h-5 rounded-full bg-[#F4EFE9]" />
            </div>
            <div className="space-y-2">
              <div className="w-20 h-4 bg-[#F4EFE9] rounded" />
              <div className="w-28 h-8 bg-[#F4EFE9] rounded" />
            </div>
            <div className="w-32 h-4 bg-[#F4EFE9] rounded pt-2 border-t border-[#F4EFE9]" />
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* 1. Total Bookings */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-[#F4EFE9] text-[#1C1917] flex items-center justify-center">
            <CalendarDaysIcon className="w-6 h-6" />
          </div>
          {data.bookingsPeriodComparison ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <ArrowTrendingUpIcon className="w-3 h-3" />
              <span>{data.bookingsPeriodComparison}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#78716C] bg-[#F4EFE9] px-2.5 py-0.5 rounded-full">
              <MinusIcon className="w-3 h-3" />
              <span>No baseline</span>
            </span>
          )}
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-1">
          Total Bookings
        </p>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
            {data.totalBookings}
          </span>
          <span className="text-xs text-[#78716C]">all-time</span>
        </div>
        <div className="mt-3 pt-3 border-t border-[#F4EFE9] flex items-center justify-between text-xs text-[#78716C]">
          <span>Confirmed or Pending</span>
          <span className="font-semibold text-[#1C1917]">{data.totalBookings}</span>
        </div>
      </div>

      {/* 2. Inquiries */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-[#F4EFE9] text-[#1C1917] flex items-center justify-center">
            <EnvelopeIcon className="w-6 h-6" />
          </div>
          {data.unreadInquiries > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>{data.unreadInquiries} New</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span>All read</span>
            </span>
          )}
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-1">
          Customer Inquiries
        </p>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
            {data.totalInquiries}
          </span>
          <span className="text-xs text-[#78716C]">total leads</span>
        </div>
        <div className="mt-3 pt-3 border-t border-[#F4EFE9] flex items-center justify-between text-xs text-[#78716C]">
          <span>Unread inquiries</span>
          <span className="font-semibold text-[#C88A4B]">{data.unreadInquiries}</span>
        </div>
      </div>

      {/* 3. Revenue */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-[#F4EFE9] text-[#C88A4B] flex items-center justify-center">
            <CurrencyDollarIcon className="w-6 h-6" />
          </div>
          <span className="inline-flex items-center text-[11px] font-medium text-[#78716C] bg-[#F4EFE9] px-2 py-0.5 rounded-full">
            {data.revenuePeriod}
          </span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-1">
          Confirmed Revenue
        </p>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
            {formatCurrency(data.totalRevenue)}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-[#F4EFE9] flex items-center justify-between text-xs text-[#78716C]">
          <span>Gross value</span>
          <span className="font-semibold text-emerald-600">USD</span>
        </div>
      </div>

      {/* 4. Availability (Next 30 Days) */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-[#F4EFE9] text-[#1C1917] flex items-center justify-center">
            <ClockIcon className="w-6 h-6" />
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Next 30 Days</span>
          </span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-1">
          Availability Status
        </p>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-emerald-700">
            {data.availableDates}
          </span>
          <span className="text-xs text-[#78716C]">days open</span>
        </div>
        <div className="mt-3 pt-3 border-t border-[#F4EFE9] flex items-center justify-between text-xs text-[#78716C]">
          <span>{data.bookedDates} booked</span>
          <span>&bull;</span>
          <span>{data.blockedDates} blocked</span>
        </div>
      </div>
    </div>
  );
}
