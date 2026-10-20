import type { Metadata } from 'next';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import GalleryClient from '../../components/GalleryClient';
import { listGalleryItems } from '@/lib/db/services/galleryService';
import { GALLERY_SECTIONS } from '@/lib/types/gallery';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gallery — B on the Sea',
  description:
    'Explore B on the Sea through photographs of the villa, bedrooms, decks, views, amenities, and Caribbean surroundings.',
};

type Section = {
  key: string;
  label: string;
  images: string[];
};

async function getLiveGalleryData(): Promise<{ sections: Section[]; hero: string | null }> {
  try {
    const dbItems = await listGalleryItems({ status: 'active' });
    if (!dbItems || dbItems.length === 0) {
      return { sections: [], hero: null };
    }

    const seenUrls = new Set<string>();

    // 1. Prefer the first explicitly configured homepage hero image.
    const heroItem =
      dbItems.find((i) => i.isHero) ||
      dbItems.find((i) => i.section === 'villa_exterior') ||
      dbItems.find((i) => i.section === 'entertainment_deck') ||
      dbItems[0];
    const hero = heroItem?.url || null;
    if (hero) {
      seenUrls.add(hero);
    }

    // 2. Build sections with strictly unique images (no duplicate with hero or across sections)
    const sections: Section[] = GALLERY_SECTIONS.map((conf) => {
      const secImages = dbItems
        .filter((item) => item.section === conf.key)
        .sort((a, b) => a.order - b.order)
        .map((item) => item.url)
        .filter((url) => {
          if (!url || seenUrls.has(url)) return false;
          seenUrls.add(url);
          return true;
        });

      return {
        key: conf.key,
        label: conf.label,
        images: secImages,
      };
    }).filter((sec) => sec.images.length > 0);

    return { sections, hero };
  } catch (err) {
    console.warn('Failed to load gallery from DB:', err);
    return { sections: [], hero: null };
  }
}

export default async function GalleryPage() {
  const { sections, hero } = await getLiveGalleryData();

  return (
    <>
      <Header />
      <GalleryClient sections={sections} hero={hero} />
      <Footer />
    </>
  );
}
