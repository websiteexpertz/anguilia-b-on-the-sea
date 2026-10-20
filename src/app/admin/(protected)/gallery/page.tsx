'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PhotoIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  GalleryItem,
  GallerySectionKey,
  GalleryStats,
  UpdateGalleryItemDto,
  GALLERY_SECTIONS,
} from '@/lib/types/gallery';
import SectionTabs from './components/SectionTabs';
import ImageGridCard from './components/ImageGridCard';
import UploadModal from './components/UploadModal';
import EditImageModal from './components/EditImageModal';
import ReplaceImageModal from './components/ReplaceImageModal';
import PreviewLightboxModal from './components/PreviewLightboxModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [stats, setStats] = useState<GalleryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [activeSection, setActiveSection] = useState<GallerySectionKey | 'all' | 'hero'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Toasts
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<GalleryItem | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<GalleryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);

  // Lightbox preview state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch gallery items
  const fetchGallery = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeSection === 'hero') params.append('hero', 'true');
      else if (activeSection !== 'all') params.append('section', activeSection);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/admin/gallery?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load gallery images');

      setItems(data.data || []);
      setStats(data.stats || null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error fetching gallery', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeSection, statusFilter, searchQuery]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  // Edit item handler
  const handleUpdateItem = async (id: string, updates: UpdateGalleryItemDto) => {
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update image');

    showToast('Image details updated successfully.');
    await fetchGallery();
  };

  // Delete item handler
  const handleDeleteItem = async (id: string) => {
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete image');

    showToast('Image deleted successfully.');
    await fetchGallery();
  };

  // Reorder items handler (Swap up/down)
  const handleMoveOrder = async (item: GalleryItem, direction: 'up' | 'down') => {
    const sectionItems = items.filter((i) => i.section === item.section);
    const currentIndex = sectionItems.findIndex((i) => i._id === item._id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sectionItems.length) return;

    // Swap positions
    const reordered = [...sectionItems];
    const temp = reordered[currentIndex];
    reordered[currentIndex] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const orderedIds = reordered.map((i) => i._id);

    // Optimistically update local items order
    setItems((prev) => {
      const updated = [...prev];
      reordered.forEach((reorderedItem, newIndex) => {
        const found = updated.find((u) => u._id === reorderedItem._id);
        if (found) found.order = newIndex + 1;
      });
      return updated.sort((a, b) => a.order - b.order);
    });

    try {
      const res = await fetch('/api/admin/gallery/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) throw new Error('Could not persist reorder');
      showToast('Display order updated.');
    } catch {
      showToast('Failed to persist display order', 'error');
      await fetchGallery();
    }
  };

  // Lightbox list is filtered items
  const activeSectionLabel = useMemo(() => {
    if (activeSection === 'all') return 'All Sections';
    if (activeSection === 'hero') return 'Hero Images';
    return GALLERY_SECTIONS.find((s) => s.key === activeSection)?.label || activeSection;
  }, [activeSection]);

  return (
    <div className="space-y-7 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-medium transition-all animate-slide-up ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
              : 'bg-rose-950 text-rose-100 border-rose-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#78716C] mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#C88A4B] font-semibold">Gallery & Media</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
              Gallery Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#F4EFE9] text-[#C88A4B] border border-[#E7E5E4]">
              Section-Wise
            </span>
          </div>
          <p className="text-sm text-[#78716C] mt-1 max-w-2xl">
            Manage villa photography by section, reorder display sequences, optimize SEO alt text,
            and upload new media.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchGallery()}
            disabled={isLoading}
            className="px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-stone-700 text-xs font-bold hover:bg-[#F4EFE9] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <ArrowPathIcon
              className={`w-4 h-4 text-[#C88A4B] ${isLoading ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C88A4B] to-[#B07338] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            Total Photos
          </span>
          <p className="font-serif text-2xl font-bold text-stone-900 mt-1">
            {stats ? stats.totalImages : '—'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            Active Online
          </span>
          <p className="font-serif text-2xl font-bold text-emerald-600 mt-1">
            {stats ? stats.activeImages : '—'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            Hidden Drafts
          </span>
          <p className="font-serif text-2xl font-bold text-amber-600 mt-1">
            {stats ? stats.hiddenImages : '—'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Missing Alt Text
            </span>
            {stats && stats.missingAltCount > 0 && (
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <p
            className={`font-serif text-2xl font-bold mt-1 ${
              stats && stats.missingAltCount > 0 ? 'text-amber-700' : 'text-stone-900'
            }`}
          >
            {stats ? stats.missingAltCount : '—'}
          </p>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <SectionTabs
        activeSection={activeSection}
        onSelectSection={(sec) => setActiveSection(sec)}
        stats={stats}
      />

      {/* Search and Secondary Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white rounded-2xl border border-[#E7E5E4] p-3 shadow-sm">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeSectionLabel}...`}
            className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#C88A4B] focus:bg-white text-stone-800 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#C88A4B] text-stone-700 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="hidden">Hidden Only</option>
          </select>

          {(searchQuery || statusFilter !== 'all' || activeSection !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setActiveSection('all');
              }}
              className="px-3 py-2 text-xs text-[#C88A4B] hover:text-[#B07338] font-semibold transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Image Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden p-4 shadow-sm animate-pulse space-y-3"
            >
              <div className="aspect-[4/3] bg-[#F4EFE9] rounded-xl" />
              <div className="h-4 bg-[#F4EFE9] rounded w-3/4" />
              <div className="h-3 bg-[#F4EFE9] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item, idx) => (
            <ImageGridCard
              key={item._id}
              item={item}
              isFirst={idx === 0}
              isLast={idx === items.length - 1}
              onPreview={() => setLightboxIndex(idx)}
              onEdit={(it) => setEditTarget(it)}
              onReplace={(it) => setReplaceTarget(it)}
              onDelete={(it) => setDeleteTarget(it)}
              onMoveUp={(it) => handleMoveOrder(it, 'up')}
              onMoveDown={(it) => handleMoveOrder(it, 'down')}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-[#E7E5E4] p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F4EFE9] text-[#C88A4B] flex items-center justify-center mx-auto shadow-sm">
            <PhotoIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              No photos found in {activeSectionLabel}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              {searchQuery
                ? `No images matched "${searchQuery}". Try clearing search filters.`
                : `This section currently has no images uploaded. Add photos to showcase this area on the website.`}
            </p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#C88A4B] text-white text-xs font-bold shadow-md hover:bg-[#B07338] transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Upload Photo to {activeSectionLabel}</span>
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        defaultSection={activeSection}
        onUploadSuccess={() => {
          showToast('Photo uploaded successfully.');
          fetchGallery();
        }}
      />

      {/* Edit Image Modal */}
      <EditImageModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        item={editTarget}
        onUpdate={handleUpdateItem}
      />

      {/* Replace Image Modal */}
      <ReplaceImageModal
        isOpen={!!replaceTarget}
        onClose={() => setReplaceTarget(null)}
        item={replaceTarget}
        onReplaceSuccess={() => {
          showToast('Photo replaced successfully.');
          fetchGallery();
        }}
      />

      {/* Lightbox Preview Modal */}
      <PreviewLightboxModal
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        items={items}
        currentIndex={lightboxIndex ?? 0}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        item={deleteTarget}
        onConfirmDelete={handleDeleteItem}
      />
    </div>
  );
}
