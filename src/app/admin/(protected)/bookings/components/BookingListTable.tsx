"use client";

import React from "react";
import {
  EyeIcon,
  PencilSquareIcon,
  XCircleIcon,
  PlusIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Booking, BookingStatus } from "@/lib/types/booking";

interface BookingListTableProps {
  bookings: Booking[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onSelectBooking: (booking: Booking) => void;
  onEditBooking: (booking: Booking) => void;
  onCancelBooking: (booking: Booking) => void;
  onAddBooking: () => void;
  isLoading?: boolean;
}

export default function BookingListTable({
  bookings,
  total,
  page,
  totalPages,
  onPageChange,
  onSelectBooking,
  onEditBooking,
  onCancelBooking,
  onAddBooking,
  isLoading,
}: BookingListTableProps) {
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
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-8 bg-[#F4EFE9] rounded-lg w-1/4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-[#F4EFE9] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-10 sm:p-16 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-[#F4EFE9] text-[#C88A4B] flex items-center justify-center mx-auto mb-4">
          <CalendarDaysIcon className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-lg font-semibold text-[#1C1917] mb-1">
          No bookings found
        </h3>
        <p className="text-xs sm:text-sm text-[#78716C] max-w-sm mx-auto mb-6 leading-relaxed">
          No reservation records matched your search or filters. You can record a new reservation manually.
        </p>
        <button
          type="button"
          onClick={onAddBooking}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#2B2623] text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
        >
          <PlusIcon className="w-4 h-4 text-[#C88A4B]" />
          <span>Add New Booking</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop / Tablet Table View (hidden on small mobile screens) */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#E7E5E4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E7E5E4] bg-[#FDFBF7] text-[11px] font-semibold uppercase tracking-wider text-[#78716C]">
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Guest</th>
                <th className="py-3.5 px-4">Stay Dates</th>
                <th className="py-3.5 px-4">Nights</th>
                <th className="py-3.5 px-4">Guests</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE9] text-xs">
              {bookings.map((b) => (
                <tr
                  key={b._id}
                  onClick={() => onSelectBooking(b)}
                  className="hover:bg-[#FDFBF7]/80 transition-colors cursor-pointer group"
                >
                  {/* Reference */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#1C1917]">
                    <span className="bg-[#F4EFE9] px-2 py-0.5 rounded text-[11px] group-hover:bg-[#C88A4B]/20 transition-colors">
                      {b.bookingRef}
                    </span>
                  </td>

                  {/* Guest */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#1C1917]">
                      {b.guestName}
                    </div>
                    <div className="text-[11px] text-[#78716C] truncate max-w-[160px]">
                      {b.email}
                    </div>
                  </td>

                  {/* Stay Dates */}
                  <td className="py-3.5 px-4 text-[#44403C]">
                    <div className="font-medium text-[#1C1917]">{b.checkIn}</div>
                    <div className="text-[11px] text-[#78716C]">to {b.checkOut}</div>
                  </td>

                  {/* Nights */}
                  <td className="py-3.5 px-4 text-[#44403C] font-medium">
                    {b.nights} {b.nights === 1 ? "night" : "nights"}
                  </td>

                  {/* Guests */}
                  <td className="py-3.5 px-4 text-[#44403C] font-medium">
                    {b.guests} {b.guests === 1 ? "guest" : "guests"}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 font-semibold text-[#1C1917]">
                    {formatCurrency(b.amount)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">{getStatusBadge(b.status)}</td>

                  {/* Actions */}
                  <td
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectBooking(b)}
                        className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#F4EFE9] transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditBooking(b)}
                        className="p-1.5 rounded-lg text-[#78716C] hover:text-[#C88A4B] hover:bg-[#F4EFE9] transition-colors"
                        title="Edit Booking"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      {b.status !== "cancelled" && (
                        <button
                          type="button"
                          onClick={() => onCancelBooking(b)}
                          className="p-1.5 rounded-lg text-[#78716C] hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Cancel Booking"
                        >
                          <XCircleIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (shown only on small mobile screens) */}
      <div className="md:hidden space-y-3">
        {bookings.map((b) => (
          <div
            key={b._id}
            onClick={() => onSelectBooking(b)}
            className="bg-white rounded-2xl border border-[#E7E5E4] p-4 shadow-sm hover:border-[#C88A4B] transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold bg-[#F4EFE9] px-2 py-0.5 rounded text-[#1C1917]">
                {b.bookingRef}
              </span>
              <div>{getStatusBadge(b.status)}</div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-[#1C1917]">
                {b.guestName}
              </h4>
              <p className="text-xs text-[#78716C]">{b.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#F4EFE9]">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#78716C]">
                  Stay Dates
                </p>
                <p className="font-medium text-[#1C1917]">
                  {b.checkIn} &rarr; {b.checkOut}
                </p>
                <p className="text-[11px] text-[#78716C]">
                  {b.nights} nights &bull; {b.guests} guests
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-[#78716C]">
                  Total Amount
                </p>
                <p className="font-serif font-bold text-sm text-[#1C1917]">
                  {formatCurrency(b.amount)}
                </p>
              </div>
            </div>

            <div
              className="pt-2 border-t border-[#F4EFE9] flex items-center justify-end gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => onSelectBooking(b)}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#F4EFE9] text-[#1C1917] hover:bg-[#E7E5E4]"
              >
                View
              </button>
              <button
                type="button"
                onClick={() => onEditBooking(b)}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#F4EFE9] text-[#1C1917] hover:bg-[#E7E5E4]"
              >
                Edit
              </button>
              {b.status !== "cancelled" && (
                <button
                  type="button"
                  onClick={() => onCancelBooking(b)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] px-4 py-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#78716C]">
        <div>
          Showing{" "}
          <span className="font-semibold text-[#1C1917]">
            {bookings.length}
          </span>{" "}
          of <span className="font-semibold text-[#1C1917]">{total}</span>{" "}
          bookings (Page {page} of {totalPages})
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E7E5E4] bg-[#FDFBF7] font-semibold text-[#1C1917] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeftIcon className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E7E5E4] bg-[#FDFBF7] font-semibold text-[#1C1917] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <span>Next</span>
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
