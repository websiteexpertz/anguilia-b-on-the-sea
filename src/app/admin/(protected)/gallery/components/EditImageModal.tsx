'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  XMarkIcon,
  PencilSquareIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  GalleryItem,
  GALLERY_SECTIONS,
  GallerySectionKey,
  UpdateGalleryItemDto,
} from '@/lib/types/gallery';

interface EditImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GalleryItem | null;
  onUpdate: (id: string, updates: UpdateGalleryItemDto) => Promise<void>;
}

export default function EditImageModal({ isOpen, onClose, item, onUpdate }: EditImageModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [section, setSection] = useState<GallerySectionKey>('villa_exterior');
  const [status, setStatus] = useState<'active' | 'hidden'>('active');
  const [isHero, setIsHero] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setAltText(item.altText || '');
      setSection(item.section);
      setStatus(item.status === 'hidden' ? 'hidden' : 'active');
      setIsHero(item.isHero === true);
    }
    setError(null);
  }, [item, isOpen]);

  if (!isOpen || !item || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Image title is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onUpdate(item._id, {
        title: title.trim(),
        altText: altText.trim(),
        section,
        status,
        isHero,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update image');
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
              <PencilSquareIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">Edit Image Details</h3>
              <p className="text-xs text-[#78716C]">
                Reassign section, modify title, or update SEO alt text
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

          {/* Thumbnail preview */}
          <div className="flex items-center gap-4 p-3 bg-stone-50/80 rounded-2xl border border-stone-200">
            <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-stone-200 shrink-0">
              <Image src={item.url} alt={item.title} fill className="object-cover" />
            </div>
            <div className="text-xs min-w-0 flex-1">
              <p className="font-semibold text-stone-800 truncate">{item.fileName}</p>
              <p className="text-stone-500 text-[11px] truncate">{item.url}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4EFE9] text-[#C88A4B]">
                Current: #{item.order}
              </span>
            </div>
          </div>

          {/* Section Selection (Reassignment) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Assigned Website Section <span className="text-rose-500">*</span>
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value as GallerySectionKey)}
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all cursor-pointer"
            >
              {GALLERY_SECTIONS.map((sec) => (
                <option key={sec.key} value={sec.key}>
                  {sec.label} — {sec.description}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-stone-500 mt-1">
              Moving this image will immediately update which section it appears under.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Image Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
            />
          </div>

          {/* Alt Text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-stone-700">
                Alt Text (SEO & Accessibility)
              </label>
              <span className="text-[10px] text-[#C88A4B] font-semibold">
                Screen Reader Description
              </span>
            </div>
            <textarea
              rows={2}
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descriptive explanation of what is pictured..."
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all resize-none"
            />
          </div>

          {/* Display Status */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70">
            <div className="flex items-center gap-2.5">
              <InformationCircleIcon className="w-5 h-5 text-[#C88A4B]" />
              <div>
                <p className="text-xs font-bold text-stone-800">Homepage Hero Image</p>
                <p className="text-[11px] text-stone-500">
                  Include this image in the homepage hero slideshow.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isHero}
                onChange={(e) => setIsHero(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C88A4B]" />
            </label>
          </div>

          {/* Display Status */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/80">
            <div className="flex items-center gap-2.5">
              <InformationCircleIcon className="w-5 h-5 text-[#C88A4B]" />
              <div>
                <p className="text-xs font-bold text-stone-800">Visibility</p>
                <p className="text-[11px] text-stone-500">
                  {status === 'active'
                    ? 'Visible to website visitors'
                    : 'Hidden from public website'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={status === 'active'}
                onChange={(e) => setStatus(e.target.checked ? 'active' : 'hidden')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C88A4B]" />
            </label>
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
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#C88A4B] hover:bg-[#B3783E] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
