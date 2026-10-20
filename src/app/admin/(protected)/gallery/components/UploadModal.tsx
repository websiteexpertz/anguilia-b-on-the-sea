'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  XMarkIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { GALLERY_SECTIONS, GallerySectionKey } from '@/lib/types/gallery';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSection: GallerySectionKey | 'all';
  onUploadSuccess: () => void;
}

export default function UploadModal({
  isOpen,
  onClose,
  defaultSection,
  onUploadSuccess,
}: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [section, setSection] = useState<GallerySectionKey>('villa_exterior');
  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [status, setStatus] = useState<'active' | 'hidden'>('active');
  const [isHero, setIsHero] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultSection && defaultSection !== 'all') {
      setSection(defaultSection);
    } else {
      setSection('villa_exterior');
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setTitle('');
    setAltText('');
    setStatus('active');
    setIsHero(false);
    setError(null);
  }, [isOpen, defaultSection]);

  if (!isOpen || !mounted) return null;

  const handleFileSelect = (file: File) => {
    setError(null);
    // Validate format
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setError('Please select a supported image format: JPEG, PNG, WebP, or AVIF.');
      return;
    }
    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size exceeds the 10MB limit. Please optimize before uploading.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Auto-generate initial title from file name
    const rawName = file.name.replace(/\.[^/.]+$/, '');
    const generatedTitle = rawName
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
    if (!title) {
      setTitle(generatedTitle);
    }
    if (!altText) {
      setAltText(`${generatedTitle} at Villa B on the Sea, Anguilla`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image file to upload.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide an image title.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('section', section);
      formData.append('title', title.trim());
      formData.append('altText', altText.trim() || `${title.trim()} at Villa B on the Sea`);
      formData.append('status', status);
      formData.append('isHero', String(isHero));

      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');

      onUploadSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-xl w-full border border-[#E7E5E4] shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F4EFE9] flex items-center justify-between bg-gradient-to-r from-stone-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4EFE9] text-[#C88A4B] flex items-center justify-center">
              <ArrowUpTrayIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                Upload Villa Photography
              </h3>
              <p className="text-xs text-[#78716C]">
                Add new high-resolution imagery to the website gallery
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

          {/* Drag & Drop Area */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Select Photo <span className="text-rose-500">*</span>
            </label>

            {previewUrl ? (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 group">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-white text-stone-800 text-xs font-bold shadow-md hover:bg-stone-50"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#C88A4B] bg-[#F4EFE9]/50'
                    : 'border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-stone-100/70'
                }`}
              >
                <PhotoIcon className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-700">
                  Drag & drop image here, or <span className="text-[#C88A4B]">browse files</span>
                </p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Supported formats: JPEG, PNG, WebP, AVIF (Max 10MB)
                </p>
              </div>
            )}

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
          </div>

          {/* Section Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Website Section <span className="text-rose-500">*</span>
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value as GallerySectionKey)}
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#C88A4B] focus:bg-white text-stone-800 transition-colors"
            >
              {GALLERY_SECTIONS.map((sec) => (
                <option key={sec.key} value={sec.key}>
                  {sec.label} — {sec.description}
                </option>
              ))}
            </select>
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
              placeholder="e.g., Master Ocean Suite Sunset Balcony"
              required
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#C88A4B] focus:bg-white text-stone-800 transition-colors"
            />
          </div>

          {/* Alt Text (SEO & Accessibility) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-stone-700">
                Alt Text (SEO & Screen Readers)
              </label>
              <span className="text-[10px] text-[#C88A4B] font-semibold">
                Recommended for Accessibility
              </span>
            </div>
            <textarea
              rows={2}
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="e.g., King sized master bed with panoramic Caribbean ocean view at Villa B on the Sea"
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#C88A4B] focus:bg-white text-stone-800 transition-colors resize-none"
            />
          </div>

          {/* Display Status */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70">
            <div className="flex items-center gap-2.5">
              <InformationCircleIcon className="w-5 h-5 text-[#C88A4B]" />
              <div>
                <p className="text-xs font-bold text-stone-800">Homepage Hero Image</p>
                <p className="text-[11px] text-stone-500">
                  Include this upload in the hero slideshow.
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
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F4EFE9]/40 border border-[#E7E5E4]">
            <div className="flex items-center gap-2.5">
              <InformationCircleIcon className="w-5 h-5 text-[#C88A4B]" />
              <div>
                <p className="text-xs font-bold text-stone-800">Publish Immediately</p>
                <p className="text-[11px] text-stone-500">
                  Visible on public gallery once uploaded
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
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#F4EFE9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C88A4B] to-[#B07338] text-white text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
