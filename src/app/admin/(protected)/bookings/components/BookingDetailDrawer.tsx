"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  UserIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Booking, BookingStatus } from "@/lib/types/booking";

interface BookingDetailDrawerProps {
  booking: Booking | null;
  onClose: () => void;
  onEdit: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onStatusChange: (id: string, newStatus: BookingStatus) => Promise<void>;
  onNotesSave: (id: string, newNotes: string) => Promise<void>;
}

export default function BookingDetailDrawer({
  booking,
  onClose,
  onEdit,
  onCancel,
  onStatusChange,
  onNotesSave,
}: BookingDetailDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [notesText, setNotesText] = useState(booking?.notes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state when booking changes
  useEffect(() => {
    if (booking) {
      setNotesText(booking.notes || "");
    }
  }, [booking]);

  if (!booking || !mounted) return null;

  const handleStatusClick = async (status: BookingStatus) => {
    if (isUpdatingStatus || status === booking.status) return;
    setIsUpdatingStatus(true);
    try {
      await onStatusChange(booking._id, status);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleNotesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingNotes) return;
    setIsSavingNotes(true);
    try {
      await onNotesSave(booking._id, notesText);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-[#E7E5E4] animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div>
          <div className="px-6 py-5 border-b border-[#F4EFE9] bg-gradient-to-r from-stone-50 to-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4EFE9] text-[#C88A4B] flex items-center justify-center shrink-0">
                <CalendarDaysIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[11px] font-bold bg-stone-900 text-white px-2 py-0.5 rounded-md">
                    {booking.bookingRef}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C88A4B]">
                    {booking.status}
                  </span>
                </div>
                <h2 className="font-serif text-lg font-bold text-[#1C1917]">
                  {booking.guestName}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-[#F4EFE9] transition-colors focus:outline-none"
              aria-label="Close drawer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-5 sm:p-6 space-y-6 text-sm">
            {/* 1. Quick Status Controls */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-2">
                Update Booking Status
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["pending", "confirmed", "completed", "cancelled"] as BookingStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusClick(st)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold capitalize transition-all text-center border ${
                      booking.status === st
                        ? "bg-[#1C1917] text-white border-[#1C1917] shadow-sm"
                        : "bg-[#FDFBF7] text-[#78716C] border-[#E7E5E4] hover:border-[#C88A4B] hover:text-[#1C1917]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Guest Information */}
            <div className="bg-[#FDFBF7] rounded-2xl border border-[#E7E5E4] p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#44403C]">
                <UserIcon className="w-4 h-4 text-[#C88A4B]" />
                <span>Guest Information</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[11px] text-[#78716C]">Full Name</p>
                  <p className="font-semibold text-[#1C1917] text-sm">
                    {booking.guestName}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#78716C]">Number of Guests</p>
                  <p className="font-semibold text-[#1C1917] text-sm">
                    {booking.guests} {booking.guests === 1 ? "Guest" : "Guests"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#78716C]">Email Address</p>
                  <a
                    href={`mailto:${booking.email}`}
                    className="font-medium text-[#C88A4B] hover:underline"
                  >
                    {booking.email}
                  </a>
                </div>
                <div>
                  <p className="text-[11px] text-[#78716C]">Phone Number</p>
                  <a
                    href={`tel:${booking.phone}`}
                    className="font-medium text-[#1C1917] hover:underline"
                  >
                    {booking.phone || "None specified"}
                  </a>
                </div>
              </div>
            </div>

            {/* 3. Stay Information */}
            <div className="bg-[#FDFBF7] rounded-2xl border border-[#E7E5E4] p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#44403C]">
                <CalendarDaysIcon className="w-4 h-4 text-[#C88A4B]" />
                <span>Stay & Accommodation</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[11px] text-[#78716C]">Check-In</p>
                  <p className="font-semibold text-[#1C1917] text-sm">
                    {booking.checkIn}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#78716C]">Check-Out</p>
                  <p className="font-semibold text-[#1C1917] text-sm">
                    {booking.checkOut}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#78716C]">Duration</p>
                  <p className="font-semibold text-[#1C1917]">
                    {booking.nights} Nights
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#78716C]">Accommodation</p>
                  <p className="font-semibold text-[#1C1917] truncate">
                    {booking.accommodation}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Financial & Payment */}
            <div className="bg-[#FDFBF7] rounded-2xl border border-[#E7E5E4] p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#44403C]">
                <CurrencyDollarIcon className="w-4 h-4 text-[#C88A4B]" />
                <span>Payment & Invoicing</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-[#78716C]">Total Reservation Cost</p>
                  <p className="font-serif text-2xl font-bold text-[#1C1917]">
                    {formatCurrency(booking.amount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-[#78716C] mb-1">Payment Status</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white border border-[#E7E5E4] text-[#1C1917]">
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Administrative Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="booking-notes"
                  className="text-xs font-semibold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5"
                >
                  <DocumentTextIcon className="w-4 h-4 text-[#C88A4B]" />
                  <span>Internal Admin Notes</span>
                </label>
              </div>
              <form onSubmit={handleNotesSubmit} className="space-y-2">
                <textarea
                  id="booking-notes"
                  rows={3}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Special requests, arrival notes, concierge requirements..."
                  className="w-full rounded-xl border border-[#D8D2C6] bg-[#FDFBF7]/60 p-3 text-xs text-[#1C1917] placeholder-[#78716C] focus:bg-white focus:border-[#C88A4B] focus:ring-2 focus:ring-[#C88A4B]/20 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={isSavingNotes}
                  className="px-3 py-1.5 rounded-lg bg-[#1C1917] text-white text-xs font-semibold hover:bg-[#2B2623] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSavingNotes ? "Saving Notes..." : "Save Notes"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-[#E7E5E4] bg-[#FDFBF7] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onEdit(booking)}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1C1917] hover:bg-[#2B2623] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <PencilSquareIcon className="w-4 h-4 text-[#C88A4B]" />
            <span>Edit Booking</span>
          </button>

          {booking.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => onCancel(booking)}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <XCircleIcon className="w-4 h-4" />
              <span>Cancel Booking</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
