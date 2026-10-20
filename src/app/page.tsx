import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/app/components/HeroSection';
import IntroSection from '@/app/components/IntroSection';
import FeatureBento from '@/app/components/FeatureBento';
import HowToGetHere from '@/app/components/HowToGetHere';
import TestimonialsSection from '@/app/components/TestimonialsSection';
import CtaStrip from '@/app/components/CtaStrip';
import { listReviews } from '@/lib/db/services/reviewService';
import { listGalleryItems } from '@/lib/db/services/galleryService';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let reviews: any[] = [];
  let galleryItems: any[] = [];

  try {
    reviews = await listReviews({ status: 'published' });
  } catch (err) {
    console.warn('Could not load reviews for homepage:', err);
  }

  try {
    galleryItems = await listGalleryItems({ status: 'active' });
  } catch (err) {
    console.warn('Could not load gallery items for homepage:', err);
  }

  // Strictly ensure each image shown on the page is 100% unique (no duplicate/double images)
  const usedUrls = new Set<string>();

  const pickUnique = (
    predicate: (item: any) => boolean,
    fallbackPredicate?: (item: any) => boolean
  ) => {
    let match = galleryItems.find((i) => !usedUrls.has(i.url) && predicate(i));
    if (!match && fallbackPredicate) {
      match = galleryItems.find((i) => !usedUrls.has(i.url) && fallbackPredicate(i));
    }
    if (!match) {
      match = galleryItems.find((i) => !usedUrls.has(i.url));
    }
    if (match) {
      usedUrls.add(match.url);
    }
    return match;
  };

  // 1. Hero Slideshow: use explicit admin selections, then retain the legacy fallback.
  const heroItems: any[] = galleryItems
    .filter((item) => item.isHero)
    .sort((a, b) => a.order - b.order);
  heroItems.forEach((item) => usedUrls.add(item.url));
  for (let i = heroItems.length; i < 4; i++) {
    const item = pickUnique(
      (it) => it.section === 'villa_exterior' || it.section === 'entertainment_deck',
      (it) => it.section === 'main_level'
    );
    if (item) heroItems.push(item);
  }
  const heroSlides = heroItems.map((i) => ({ src: i.url, alt: i.altText || i.title }));

  // 2. Intro Section ("About the Villa" arch) - 1 distinct interior/main level image
  const introItem = pickUnique(
    (it) => it.section === 'main_level',
    (it) => it.section === 'bedrooms'
  );
  const introImage = introItem
    ? { src: introItem.url, alt: introItem.altText || introItem.title }
    : undefined;

  // 3. Bento Grid - 4 distinct categories (beachfront, pools, theater, kitchen)
  const beachItem = pickUnique(
    (it) =>
      it.section === 'attractions' ||
      (it.section === 'villa_exterior' && /beach/i.test(it.title || '')),
    (it) => it.section === 'villa_exterior'
  );
  const poolItem = pickUnique(
    (it) => it.section === 'entertainment_deck' && /pool/i.test(it.title || ''),
    (it) => it.section === 'entertainment_deck'
  );
  const theaterItem = pickUnique(
    (it) => it.section === 'amenities' && /theater|cinema/i.test(it.title || ''),
    (it) => it.section === 'amenities'
  );
  const kitchenItem = pickUnique(
    (it) => it.section === 'main_level' && /kitchen|dining/i.test(it.title || ''),
    (it) => it.section === 'main_level'
  );

  const bentoImages = {
    beachfront: beachItem
      ? { src: beachItem.url, alt: beachItem.altText || beachItem.title }
      : undefined,
    pools: poolItem ? { src: poolItem.url, alt: poolItem.altText || poolItem.title } : undefined,
    theater: theaterItem
      ? { src: theaterItem.url, alt: theaterItem.altText || theaterItem.title }
      : undefined,
    amenities: kitchenItem
      ? { src: kitchenItem.url, alt: kitchenItem.altText || kitchenItem.title }
      : undefined,
  };

  // 4. CTA Strip - 1 distinct terrace/deck sunset view
  const ctaItem = pickUnique(
    (it) => it.section === 'entertainment_deck',
    (it) => it.section === 'bedrooms'
  );
  const ctaImage = ctaItem
    ? { src: ctaItem.url, alt: ctaItem.altText || ctaItem.title }
    : undefined;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection slides={heroSlides.length > 0 ? heroSlides : undefined} />
      <IntroSection image={introImage} />
      <FeatureBento images={bentoImages} />
      <HowToGetHere />
      <TestimonialsSection reviews={reviews} />
      <CtaStrip image={ctaImage} />
      <Footer />
    </main>
  );
}
