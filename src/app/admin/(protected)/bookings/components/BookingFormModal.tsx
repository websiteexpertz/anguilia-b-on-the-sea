"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  ExclamationCircleIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  Booking,
  BookingStatus,
  PaymentStatus,
  CreateBookingDto,
} from "@/lib/types/booking";

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateBookingDto) => Promise<void>;
  initialBooking?: Booking | null;
}

export default function BookingFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialBooking,
}: BookingFormModalProps) {
  const isEditing = !!initialBooking;
  const [mounted, setMounted] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [accommodation, setAccommodation] = useState("Villa B on the Sea (Full Villa)");
  const [amount, setAmount] = useState(3500);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [status, setStatus] = useState<BookingStatus>("pending");
  const [notes, setNotes] = useState("");

  const [nights, setNights] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Populate fields when modal opens or initialBooking changes
  useEffect(() => {
    if (initialBooking) {
      setGuestName(initialBooking.guestName || "");
      setEmail(initialBooking.email || "");
      setPhone(initialBooking.phone || "");
      setCheckIn(initialBooking.checkIn || "");
      setCheckOut(initialBooking.checkOut || "");
      setGuests(initialBooking.guests || 2);
      setAccommodation(initialBooking.accommodation || "Villa B on the Sea (Full Villa)");
      setAmount(initialBooking.amount || 0);
      setPaymentStatus(initialBooking.paymentStatus || "pending");
      setStatus(initialBooking.status || "pending");
      setNotes(initialBooking.notes || "");
    } else {
      // Default to next week for new booking
      const today = new Date();
      const inDate = new Date();
      inDate.setDate(today.getDate() + 7);
      const outDate = new Date();
      outDate.setDate(today.getDate() + 12);

      const inStr = inDate.toISOString().split("T")[0];
      const outStr = outDate.toISOString().split("T")[0];

      setGuestName("");
      setEmail("");
      setPhone("");
      setCheckIn(inStr);
      setCheckOut(outStr);
      setGuests(4);
      setAccommodation("Villa B on the Sea (Full Villa)");
      setAmount(4500);
      setPaymentStatus("pending");
      setStatus("confirmed");
      setNotes("");
    }
    setErrorMessage(null);
  }, [initialBooking, isOpen]);

  // Recalculate nights when dates change
  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
        const diffDays = Math.ceil(
          Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
        setNights(diffDays);
      } else {
        setNights(0);
      }
    }
  }, [checkIn, checkOut]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Client-side validations
    if (!guestName.trim()) {
      setErrorMessage("Guest full name is required.");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("A valid email address is required.");
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("A contact phone number is required.");
      return;
    }

    if (!checkIn || !checkOut) {
      setErrorMessage("Both check-in and check-out dates are required.");
      return;
    }

    if (checkOut <= checkIn) {
      setErrorMessage("Check-out date must be strictly after check-in date.");
      return;
    }

    if (guests < 1) {
      setErrorMessage("Number of guests must be at least 1.");
      return;
    }

    if (amount < 0) {
      setErrorMessage("Total booking amount cannot be negative.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onSubmit({
        guestName: guestName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        checkIn,
        checkOut,
        guests: Number(guests),
        accommodation,
        amount: Number(amount),
        paymentStatus,
        status,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full border border-[#E7E5E4] shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#F4EFE9] bg-gradient-to-r from-stone-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4EFE9] text-[#C88A4B] flex items-center justify-center shrink-0">
              <CalendarDaysIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                {isEditing ? `Edit Booking: ${initialBooking?.bookingRef}` : "Create New Booking"}
              </h3>
              <p className="text-xs text-[#78716C]">
                {isEditing
                  ? "Update reservation information and guest details"
                  : "Record a manual or direct concierge reservation"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-[#F4EFE9] transition-colors focus:outline-none"
            aria-label="Close dialog"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto" noValidate>
          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5"
            >
              <ExclamationCircleIcon className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Guest Details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-[#C88A4B]" />
              <span>Guest Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guest@example.com"
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (264) 555-0199"
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Dates & Accommodation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
              <CalendarDaysIcon className="w-4 h-4 text-[#C88A4B]" />
              <span>Dates & Occupancy</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Check-In <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Check-Out <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Nights
                </label>
                <div className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-[#F4EFE9] text-xs font-semibold text-stone-800">
                  {nights > 0 ? `${nights} Nights` : "Invalid dates"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Guests Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Villa / Accommodation Selection
              </label>
              <select
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all cursor-pointer"
              >
                <option value="Villa B on the Sea (Full Villa)">
                  Villa B on the Sea (Full 5-Bedroom Estate)
                </option>
                <option value="Villa B - East Wing Only">
                  Villa B - East Wing Suites (3 Bedrooms)
                </option>
                <option value="Villa B - West Wing Only">
                  Villa B - West Wing Suites (2 Bedrooms)
                </option>
              </select>
            </div>
          </div>

          {/* Section 3: Financial & Status */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
              <CurrencyDollarIcon className="w-4 h-4 text-[#C88A4B]" />
              <span>Pricing & Status</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Total Amount (USD) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-serif font-bold text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Paid (Full)</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Booking Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BookingStatus)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Internal Administrative Notes <span className="text-stone-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Guest preferences, arrival logistics, special requests..."
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#C88A4B] hover:bg-[#B3783E] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Saving Booking...</span>
              ) : (
                <span>{isEditing ? "Update Booking" : "Create Booking"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
