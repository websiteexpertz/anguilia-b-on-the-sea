"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  TrashIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { CustomerInquiry } from "@/lib/types/inquiry";

interface DeleteInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: CustomerInquiry | null;
  onArchive: (id: string) => Promise<void>;
  onPermanentDelete: (id: string) => Promise<void>;
}

export default function DeleteInquiryModal({
  isOpen,
  onClose,
  inquiry,
  onArchive,
  onPermanentDelete,
}: DeleteInquiryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !inquiry || !mounted) return null;

  const handleArchive = async () => {
    setIsProcessing(true);
    try {
      await onArchive(inquiry._id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermanent = async () => {
    setIsProcessing(true);
    try {
      await onPermanentDelete(inquiry._id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full border border-[#E7E5E4] shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F4EFE9] flex items-center justify-between bg-gradient-to-r from-stone-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4EFE9] text-[#C88A4B] flex items-center justify-center shrink-0">
              <ArchiveBoxIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                Manage Inquiry Record
              </h3>
              <p className="text-xs text-[#78716C]">
                Archive or remove customer submission
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
            Would you like to archive or permanently remove the inquiry from{" "}
            <strong className="text-stone-900 font-semibold">{inquiry.name}</strong>?
          </p>

          <div className="p-3.5 bg-stone-50/80 rounded-2xl border border-stone-200 text-left text-xs space-y-0.5">
            <p className="font-bold text-stone-800 truncate">
              {inquiry.subject}
            </p>
            <p className="text-stone-500 text-[11px] truncate">{inquiry.email}</p>
          </div>

          {/* Action Options */}
          <div className="space-y-2.5 pt-2 border-t border-stone-100">
            {/* Option 1: Archive (Recommended) */}
            <button
              type="button"
              onClick={handleArchive}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-xl bg-[#C88A4B] hover:bg-[#B3783E] text-white text-xs font-semibold shadow-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArchiveBoxIcon className="w-4 h-4" />
              <span>Archive Inquiry (Recommended)</span>
            </button>

            {/* Option 2: Permanent Delete */}
            <button
              type="button"
              onClick={handlePermanent}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Permanently Delete</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="w-full py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
