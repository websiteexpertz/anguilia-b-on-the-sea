'use client';

import React from 'react';
import { GALLERY_SECTIONS, GallerySectionKey, GalleryStats } from '@/lib/types/gallery';
import {
  HomeModernIcon,
  SparklesIcon,
  EyeIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  Squares2X2Icon,
  SunIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';

interface SectionTabsProps {
  activeSection: GallerySectionKey | 'all' | 'hero';
  onSelectSection: (section: GallerySectionKey | 'all' | 'hero') => void;
  stats?: GalleryStats | null;
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  all: Squares2X2Icon,
  villa_exterior: HomeModernIcon,
  bedrooms: SparklesIcon,
  amenities: SunIcon,
  main_level: SwatchIcon,
  entertainment_deck: EyeIcon,
  gallery: BuildingStorefrontIcon,
  attractions: MapPinIcon,
  other: Squares2X2Icon,
  hero: SparklesIcon,
};

export default function SectionTabs({ activeSection, onSelectSection, stats }: SectionTabsProps) {
  const tabs = [
    { key: 'all' as const, label: 'All Photos' },
    { key: 'hero' as const, label: 'Hero Images' },
    ...GALLERY_SECTIONS.map((s) => ({ key: s.key, label: s.label })),
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-[#E7E5E4] p-1.5 shadow-sm">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeSection === tab.key;
          const Icon = SECTION_ICONS[tab.key] || Squares2X2Icon;
          const count =
            tab.key === 'hero'
              ? stats?.heroImages || 0
              : stats?.sectionCounts?.[tab.key] !== undefined
                ? stats.sectionCounts[tab.key]
                : 0;

          return (
            <button
              key={tab.key}
              onClick={() => onSelectSection(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#C88A4B] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#F4EFE9]/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#C88A4B]'}`} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
