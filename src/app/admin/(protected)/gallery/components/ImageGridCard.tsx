"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathRoundedSquareIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { GalleryItem, GALLERY_SECTIONS } from "@/lib/types/gallery";

interface ImageGridCardProps {
  item: GalleryItem;
  isFirst: boolean;
  isLast: boolean;
  onPreview: (item: GalleryItem) => void;
  onEdit: (item: GalleryItem) => void;
  onReplace: (item: GalleryItem) => void;
  onDelete: (item: GalleryItem) => void;
  onMoveUp?: (item: GalleryItem) => void;
  onMoveDown?: (item: GalleryItem) => void;
}

export default function ImageGridCard({
  item,
  isFirst,
  isLast,
  onPreview,
  onEdit,
  onReplace,
  onDelete,
  onMoveUp,
  onMoveDown,
}: ImageGridCardProps) {
  const [imgError, setImgError] = useState(false);

  const sectionLabel =
    GALLERY_SECTIONS.find((s) => s.key === item.section)?.label || item.section;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="group bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      {/* Thumbnail Container */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer">
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-4 text-center">
            <EyeSlashIcon className="w-8 h-8 mb-1 opacity-50" />
            <span className="text-[11px] font-medium">Image unavailable</span>
          </div>
        ) : (
          <Image
            src={item.url}
            alt={item.altText || item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            onClick={() => onPreview(item)}
          />
        )}

        {/* Hover Overlay with Preview Icon */}
        <div
          onClick={() => onPreview(item)}
          className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
        >
          <span className="p-2.5 rounded-full bg-white/90 text-stone-800 shadow-lg hover:scale-110 transition-transform">
            <EyeIcon className="w-5 h-5" />
          </span>
        </div>

        {/* Top Badges: Section & Order */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/90 backdrop-blur-sm text-stone-800 border border-stone-200/60 shadow-xs">
            {sectionLabel}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-sm text-white shadow-xs">
            #{item.order}
          </span>
        </div>

        {/* Status indicator (if hidden) */}
        {item.status === "hidden" && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-white backdrop-blur-sm shadow-xs flex items-center gap-1">
              <EyeSlashIcon className="w-3 h-3" />
              <span>Hidden</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h4
            className="font-serif text-sm font-semibold text-stone-900 line-clamp-1 group-hover:text-[#C88A4B] transition-colors"
            title={item.title}
          >
            {item.title}
          </h4>

          {/* Alt text check */}
          <div className="mt-1 flex items-center gap-1.5 text-[11px]">
            {item.altText && item.altText.trim().length > 0 ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                <span className="line-clamp-1 max-w-[180px]" title={item.altText}>
                  {item.altText}
                </span>
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1 font-medium">
                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                <span>Missing Alt Text</span>
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500">
            <span>{formattedDate}</span>
            {item.fileSize && <span>{formatFileSize(item.fileSize)}</span>}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-3 border-t border-[#F4EFE9] flex items-center justify-between gap-1">
          {/* Reorder Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onMoveUp && onMoveUp(item)}
              disabled={isFirst}
              title="Move Up"
              className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-[#F4EFE9] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ArrowUpIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onMoveDown && onMoveDown(item)}
              disabled={isLast}
              title="Move Down"
              className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-[#F4EFE9] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ArrowDownIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Image Operations: Edit, Replace, Delete */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(item)}
              title="Edit Title & Section"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-[#F4EFE9] transition-colors cursor-pointer"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onReplace(item)}
              title="Replace Image File"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-[#F4EFE9] transition-colors cursor-pointer"
            >
              <ArrowPathRoundedSquareIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(item)}
              title="Delete Image"
              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
