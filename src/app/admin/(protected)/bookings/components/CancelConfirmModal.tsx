"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Booking } from "@/lib/types/booking";

interface CancelConfirmModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingId: string, reason?: string) => Promise<void>;
}

export default function CancelConfirmModal({
  booking,
  isOpen,
  onClose,
  onConfirm,
}: CancelConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  const [reason, setReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !booking || !mounted) return null;

  const handleConfirm = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    try {
      await onConfirm(booking._id, reason.trim());
      setReason("");
      onClose();
    } finally {
      setIsCancelling(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Modal Card */}
      <div
        className="bg-white rounded-3xl max-w-md w-full border border-[#E7E5E4] shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F4EFE9] flex items-center justify-between bg-gradient-to-r from-stone-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <ExclamationTriangleIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                Cancel Reservation?
              </h3>
              <p className="text-xs text-[#78716C]">
                Ref: {booking.bookingRef}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-[#F4EFE9] transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            Are you sure you want to cancel the booking for{" "}
            <strong className="text-stone-900 font-semibold">{booking.guestName}</strong> (
            {booking.checkIn} to {booking.checkOut})? The reservation will be
            marked as <strong className="text-rose-600">Cancelled</strong> and dates will be released.
          </p>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Cancellation Reason <span className="text-stone-400 font-normal lowercase">(optional note)</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Guest requested refund, travel disruption..."
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
            />
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isCancelling}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Keep Booking
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isCancelling}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
