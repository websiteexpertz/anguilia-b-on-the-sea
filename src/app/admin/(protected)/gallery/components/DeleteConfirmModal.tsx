"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { TrashIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { GalleryItem } from "@/lib/types/gallery";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GalleryItem | null;
  onConfirmDelete: (id: string) => Promise<void>;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  item,
  onConfirmDelete,
}: DeleteConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !item || !mounted) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDelete(item._id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
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
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <TrashIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                Delete Gallery Image?
              </h3>
              <p className="text-xs text-[#78716C]">
                Remove asset from website gallery
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
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-left">
            <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              This image will be permanently removed from the website gallery section.
            </p>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 bg-stone-50/80 rounded-2xl border border-stone-200 text-left">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-200 shrink-0">
              <Image
                src={item.url}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-stone-800 truncate">{item.title}</p>
              <p className="text-[11px] text-stone-500 truncate">{item.fileName}</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Confirm & Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
