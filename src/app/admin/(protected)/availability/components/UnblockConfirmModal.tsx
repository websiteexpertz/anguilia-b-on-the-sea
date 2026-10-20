"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  LockOpenIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface UnblockConfirmModalProps {
  blockId: string | null;
  reason: string;
  dateRange: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (blockId: string) => Promise<void>;
}

export default function UnblockConfirmModal({
  blockId,
  reason,
  dateRange,
  isOpen,
  onClose,
  onConfirm,
}: UnblockConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !blockId || !mounted) return null;

  const handleConfirm = async () => {
    if (isReleasing) return;
    setIsReleasing(true);
    try {
      await onConfirm(blockId);
      onClose();
    } finally {
      setIsReleasing(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-md w-full border border-[#E7E5E4] shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F4EFE9] flex items-center justify-between bg-gradient-to-r from-stone-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <LockOpenIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                Release Blocked Dates?
              </h3>
              <p className="text-xs text-[#78716C]">
                Restore calendar availability for reservations
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
            You are about to release the manual block for{" "}
            <strong className="text-stone-900 font-semibold">{dateRange}</strong>.
            These dates will immediately become available for guest bookings and calendar inquiries.
          </p>

          <div className="p-3.5 bg-stone-50/80 border border-stone-200 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">Hold Reason:</span>
            <span className="font-semibold text-[#C88A4B]">{reason}</span>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isReleasing}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Keep Blocked
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isReleasing}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isReleasing ? "Releasing Dates..." : "Confirm & Unblock"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
