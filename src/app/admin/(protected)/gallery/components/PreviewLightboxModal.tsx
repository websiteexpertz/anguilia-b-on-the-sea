"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { GalleryItem, GALLERY_SECTIONS } from "@/lib/types/gallery";

interface PreviewLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GalleryItem[];
  currentIndex: number;
  onNavigate: (newIndex: number) => void;
}

export default function PreviewLightboxModal({
  isOpen,
  onClose,
  items,
  currentIndex,
  onNavigate,
}: PreviewLightboxModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentItem = items[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && currentIndex < items.length - 1)
        onNavigate(currentIndex + 1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, items.length, onClose, onNavigate]);

  if (!isOpen || !currentItem || !mounted) return null;

  const sectionLabel =
    GALLERY_SECTIONS.find((s) => s.key === currentItem.section)?.label ||
    currentItem.section;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Container */}
      <div
        className="relative max-w-5xl w-full h-[90vh] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between text-white py-2 px-4 bg-black/40 backdrop-blur-sm rounded-2xl mb-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-[#C88A4B] text-white font-bold text-[10px] tracking-wider uppercase">
              {sectionLabel}
            </span>
            <span className="text-stone-300">
              {currentIndex + 1} of {items.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={currentItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Open full resolution in new tab"
            >
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image Area with Nav Controls */}
        <div className="relative flex-1 rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center">
          <Image
            src={currentItem.url}
            alt={currentItem.altText || currentItem.title}
            fill
            className="object-contain"
            priority
          />

          {/* Left Arrow */}
          {currentIndex > 0 && (
            <button
              onClick={() => onNavigate(currentIndex - 1)}
              className="absolute left-3 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-all shadow-lg hover:scale-110 cursor-pointer"
              title="Previous Photo"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
          )}

          {/* Right Arrow */}
          {currentIndex < items.length - 1 && (
            <button
              onClick={() => onNavigate(currentIndex + 1)}
              className="absolute right-3 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-all shadow-lg hover:scale-110 cursor-pointer"
              title="Next Photo"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Details Bar */}
        <div className="mt-2 p-4 rounded-2xl bg-black/60 backdrop-blur-sm text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-serif text-base font-bold text-white truncate">
              {currentItem.title}
            </h3>
            {currentItem.altText && (
              <p className="text-xs text-stone-300 truncate mt-0.5">
                Alt: {currentItem.altText}
              </p>
            )}
          </div>
          <div className="text-[11px] text-stone-400 shrink-0 flex items-center gap-3">
            {currentItem.fileSize && <span>{formatFileSize(currentItem.fileSize)}</span>}
            <span>•</span>
            <span>{currentItem.fileName}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
