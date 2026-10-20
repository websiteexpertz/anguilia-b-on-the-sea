"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  XMarkIcon,
  ArrowPathRoundedSquareIcon,
  PhotoIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { GalleryItem } from "@/lib/types/gallery";

interface ReplaceImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GalleryItem | null;
  onReplaceSuccess: () => void;
}

export default function ReplaceImageModal({
  isOpen,
  onClose,
  item,
  onReplaceSuccess,
}: ReplaceImageModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setAltText(item.altText || "");
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  }, [item, isOpen]);

  if (!isOpen || !item || !mounted) return null;

  const handleFileSelect = (file: File) => {
    setError(null);
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setError("Please select a supported image format: JPEG, PNG, WebP, or AVIF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image exceeds the 10MB limit.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a new replacement file.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (title.trim()) formData.append("title", title.trim());
      if (altText.trim()) formData.append("altText", altText.trim());

      const res = await fetch(`/api/admin/gallery/${item._id}/replace`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to replace image");

      onReplaceSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error replacing image file");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-lg w-full border border-[#E7E5E4] shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F4EFE9] flex items-center justify-between bg-gradient-to-r from-stone-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4EFE9] text-[#C88A4B] flex items-center justify-center">
              <ArrowPathRoundedSquareIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                Replace Image File
              </h3>
              <p className="text-xs text-[#78716C]">
                Swap out the image file while preserving section & order
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
              <ExclamationCircleIcon className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Current vs New comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-xs font-semibold text-stone-700 mb-1.5">
                Current Photo
              </span>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                <Image
                  src={item.url}
                  alt={item.title}
                  fill
                  className="object-cover opacity-80"
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-stone-700 mb-1.5">
                New Photo
              </span>
              {previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border-2 border-[#C88A4B] cursor-pointer group"
                >
                  <Image
                    src={previewUrl}
                    alt="New Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">Change</span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[4/3] rounded-2xl border-2 border-dashed border-stone-300 hover:border-[#C88A4B] flex flex-col items-center justify-center p-3 text-center cursor-pointer bg-stone-50/70 transition-colors"
                >
                  <PhotoIcon className="w-6 h-6 text-stone-400 mb-1" />
                  <span className="text-[11px] font-bold text-stone-600">
                    Select Replacement
                  </span>
                </div>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {/* Title and Alt Text optional overrides */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Image Title <span className="text-stone-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Alt Text (SEO) <span className="text-stone-400 font-normal lowercase">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className="px-6 py-2.5 rounded-xl bg-[#C88A4B] hover:bg-[#B3783E] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Uploading Replacement..." : "Replace File"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
