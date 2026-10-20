"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { CustomerInquiry } from "@/lib/types/inquiry";

interface RejectInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: CustomerInquiry | null;
  onReject: (id: string, reason: string) => Promise<void>;
}

const COMMON_REASONS = [
  "Requested dates are already booked or unavailable",
  "Villa is scheduled for maintenance / private owner stay",
  "Reservation does not meet the minimum night stay requirement",
  "Exceeds maximum guest occupancy limit",
  "Rates or terms could not be mutually agreed upon",
];

export default function RejectInquiryModal({
  isOpen,
  onClose,
  inquiry,
  onReject,
}: RejectInquiryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedPreset(COMMON_REASONS[0]);
      setCustomReason("");
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen || !inquiry || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason =
      selectedPreset === "custom" ? customReason.trim() : selectedPreset;

    if (!finalReason) {
      setErrorMsg("Please select or enter a rejection reason.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      await onReject(inquiry._id, finalReason);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reject inquiry. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-rose-50/70 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <XCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Reject Customer Inquiry
              </h3>
              <p className="text-xs text-stone-500">
                Inquiry from <span className="font-semibold text-stone-700">{inquiry.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <ExclamationCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Requested dates reminder */}
          {inquiry.checkIn && inquiry.checkOut && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-xs text-stone-700 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-400 block uppercase tracking-wider font-semibold">
                  Requested Dates
                </span>
                <span className="font-bold text-stone-900">
                  {inquiry.checkIn} → {inquiry.checkOut}
                </span>
              </div>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-emerald-200">
                Dates will NOT be blocked
              </span>
            </div>
          )}

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              Reason for Rejection
            </label>
            <div className="space-y-2">
              {COMMON_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedPreset === reason
                      ? "bg-rose-50/50 border-rose-300 text-rose-950"
                      : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectionReason"
                    checked={selectedPreset === reason}
                    onChange={() => setSelectedPreset(reason)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                  selectedPreset === "custom"
                    ? "bg-rose-50/50 border-rose-300 text-rose-950"
                    : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                }`}
              >
                <input
                  type="radio"
                  name="rejectionReason"
                  checked={selectedPreset === "custom"}
                  onChange={() => setSelectedPreset("custom")}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <span>Custom explanation</span>
              </label>
            </div>

            {selectedPreset === "custom" && (
              <textarea
                rows={3}
                required
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Explain why this inquiry cannot be confirmed..."
                className="w-full mt-2 p-3 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-500 focus:bg-white text-stone-800 resize-none transition-colors"
              />
            )}
          </div>

          <p className="text-[11px] text-stone-500 leading-relaxed">
            Note: Rejecting this inquiry will update its status to <strong>Rejected</strong> and save the reason in your internal notes. The calendar will remain 100% available for other inquiries.
          </p>

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <XCircleIcon className="w-4 h-4" />
              <span>{isProcessing ? "Rejecting..." : "Reject Inquiry"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
