"use client";

import React from "react";
import Link from "next/link";
import {
  CalendarDaysIcon,
  ArrowRightIcon,
  PlusIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { BookingRecord, BookingStatus } from "@/lib/types/dashboard";

interface BookingOverviewProps {
  bookings: BookingRecord[];
  isLoading?: boolean;
}

export default function BookingOverview({
  bookings,
  isLoading,
}: BookingOverviewProps) {
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Confirmed
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            Cancelled
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Pending
          </span>
        );
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-sm animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-36 h-6 bg-[#F4EFE9] rounded" />
          <div className="w-24 h-4 bg-[#F4EFE9] rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-[#F4EFE9] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1C1917]">
            Recent Bookings
          </h3>
          <p className="text-xs text-[#78716C]">
            Latest reservation requests and confirmed arrivals
          </p>
        </div>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1C1917] hover:text-[#C88A4B] transition-colors"
        >
          <span>View All Bookings</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </Link>
      </div>

      {bookings.length > 0 ? (
        <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-[#F4EFE9] text-[11px] font-semibold uppercase tracking-wider text-[#78716C]">
                <th className="pb-3">Guest</th>
                <th className="pb-3">Check-In</th>
                <th className="pb-3">Check-Out</th>
                <th className="pb-3">Guests</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE9] text-xs">
              {bookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="hover:bg-[#FDFBF7] transition-colors"
                >
                  <td className="py-3 font-semibold text-[#1C1917]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#F4EFE9] text-[#1C1917] flex items-center justify-center font-medium shrink-0 text-[11px]">
                        {booking.guestName.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[140px]">
                        {booking.guestName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-[#78716C]">
                    {booking.checkIn || "TBD"}
                  </td>
                  <td className="py-3 text-[#78716C]">
                    {booking.checkOut || "TBD"}
                  </td>
                  <td className="py-3 text-[#78716C]">
                    {booking.guests} {booking.guests === 1 ? "Guest" : "Guests"}
                  </td>
                  <td className="py-3">{getStatusBadge(booking.status)}</td>
                  <td className="py-3 text-right font-semibold text-[#1C1917]">
                    {formatCurrency(booking.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Professional Empty State */
        <div className="py-10 px-4 rounded-xl bg-[#FDFBF7] border border-dashed border-[#E7E5E4] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F4EFE9] text-[#78716C] flex items-center justify-center mb-3">
            <CalendarDaysIcon className="w-6 h-6 text-[#C88A4B]" />
          </div>
          <h4 className="font-serif text-sm sm:text-base font-semibold text-[#1C1917] mb-1">
            No bookings yet
          </h4>
          <p className="text-xs text-[#78716C] max-w-sm mb-4 leading-relaxed">
            When guests book the villa through the booking portal or direct concierge, their stays will appear here.
          </p>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1C1917] hover:bg-[#2B2623] text-white text-xs font-semibold transition-all shadow-sm"
          >
            <PlusIcon className="w-4 h-4 text-[#C88A4B]" />
            <span>Create First Booking</span>
          </Link>
        </div>
      )}
    </div>
  );
}
