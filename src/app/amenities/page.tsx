import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PillBar from './components/PillBar';
import { listGalleryItems } from '@/lib/db/services/galleryService';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Luxury Amenities | B on the Sea',
  description:
    'Curated amenities for an unforgettable Caribbean escape — pools, spa, home theater, gourmet kitchen, and concierge.',
};

export default async function AmenitiesPage() {
  let galleryItems: any[] = [];
  try {
    galleryItems = await listGalleryItems({ status: 'active' });
  } catch (err) {
    console.warn('Could not load gallery items for amenities page:', err);
  }

  // Strictly ensure each image shown on the amenities page is 100% unique (no duplicates)
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

  // 1. Featured Bento Grid (4 distinct images)
  const poolItem = pickUnique(
    (i) => i.section === 'entertainment_deck' && /pool/i.test(i.title || ''),
    (i) => i.section === 'entertainment_deck' || i.section === 'amenities'
  );
  const cinemaItem = pickUnique(
    (i) => i.section === 'amenities' && /theater|cinema/i.test(i.title || ''),
    (i) => i.section === 'amenities'
  );
  const kitchenItem = pickUnique(
    (i) => i.section === 'main_level' && /kitchen|dining/i.test(i.title || ''),
    (i) => i.section === 'main_level'
  );
  const loungingItem = pickUnique(
    (i) => i.section === 'entertainment_deck' || i.section === 'attractions',
    (i) => i.section === 'main_level'
  );

  // 2. Categorized Breakdown Cards (3 distinct images, strictly non-overlapping)
  const outdoorItem = pickUnique(
    (i) => i.section === 'entertainment_deck' || i.section === 'attractions',
    (i) => i.section === 'villa_exterior'
  );
  const techItem = pickUnique(
    (i) => i.section === 'amenities',
    (i) => i.section === 'main_level'
  );
  const culinaryItem = pickUnique(
    (i) => i.section === 'main_level',
    (i) => i.section === 'entertainment_deck'
  );

  const poolSrc = poolItem?.url;
  const cinemaSrc = cinemaItem?.url;
  const kitchenSrc = kitchenItem?.url;
  const loungingSrc = loungingItem?.url;

  const outdoorSrc = outdoorItem?.url;
  const techSrc = techItem?.url;
  const culinarySrc = culinaryItem?.url;

  return (
    <main className="min-h-screen bg-[#FBFBF9] text-[#0F172A] antialiased">
      <Header />

      <section className="pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide text-[#0369A1] bg-[#E6F6FF] rounded-full">
              LUXURY LIVING &amp; COMFORT
            </span>
            <h1 className="mt-5 text-3xl sm:text-4xl font-serif font-extrabold leading-tight text-[#0F172A]">
              Curated Amenities for an Unforgettable Escape
            </h1>
            <p className="mt-3 text-base text-[#475569]">
              The ultimate entertainment villa, B On The Sea, enhances your Caribbean experience
              with resort-caliber amenities, panoramic sea views, and bespoke concierge care.
            </p>
          </div>
        </div>
      </section>

      {/* Pills quick-nav */}
      <section className="-mt-4 mb-6">
        <div className="max-w-6xl mx-auto px-6">
          <PillBar />
        </div>
      </section>

      {/* Featured Bento Grid */}
      <section className="pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-fr items-stretch">
            <article
              id="aquatic"
              className="lg:col-span-2 rounded-2xl overflow-hidden relative group shadow-lg border border-slate-100 bg-slate-900 h-full"
            >
              {poolSrc && (
                <Image
                  src={poolSrc}
                  alt={poolItem?.altText || "Pool at B On The Sea"}
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                  priority
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white max-w-[70%] shadow-md">
                  <h3 className="text-xl font-semibold font-serif">
                    Dual Level Aquatic Experience
                  </h3>
                  <p className="mt-1 text-sm max-w-prose">
                    Main Level Pool &amp; Upper Level Spa — sun, sea, and serenity across two
                    levels.
                  </p>
                </div>
              </div>
            </article>

            <article
              id="cinema"
              className="rounded-2xl overflow-hidden relative group shadow-lg border border-slate-100 bg-slate-900 h-full"
            >
              {cinemaSrc && (
                <Image
                  src={cinemaSrc}
                  alt={cinemaItem?.altText || "Home theater"}
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white shadow-sm">
                  <h3 className="text-lg font-semibold font-serif">Cinema &amp; Acoustics</h3>
                  <p className="mt-1 text-xs max-w-prose">
                    Private home theater and whole-house Sonos audio for immersive moments.
                  </p>
                </div>
              </div>
            </article>

            <article
              id="culinary"
              className="rounded-2xl overflow-hidden relative group shadow-lg border border-slate-100 bg-slate-900 lg:col-span-1 h-full"
            >
              {kitchenSrc && (
                <Image
                  src={kitchenSrc}
                  alt={kitchenItem?.altText || "Kitchen and alfresco dining"}
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white shadow-sm">
                  <h3 className="text-lg font-semibold font-serif">
                    Culinary &amp; Alfresco Dining
                  </h3>
                  <p className="mt-1 text-xs max-w-prose">
                    Indoor chef’s kitchen, outdoor prep station, gas grill, and wine refrigeration.
                  </p>
                </div>
              </div>
            </article>

            <article
              id="lounging"
              className="rounded-2xl overflow-hidden relative group shadow-lg border border-slate-100 bg-slate-900 lg:col-span-3 h-full"
            >
              {loungingSrc && (
                <Image
                  src={loungingSrc}
                  alt={loungingItem?.altText || "Ocean deck lounging"}
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white max-w-[60%] shadow-md">
                  <h3 className="text-xl font-semibold font-serif">Open-Air Lounging</h3>
                  <p className="mt-1 text-sm max-w-prose">
                    Expansive sun and ocean decks designed for breezy gatherings and golden-hour
                    views.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Categorized Amenities Breakdown */}
      <section className="-mt-8 pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="relative h-28 w-full overflow-hidden bg-slate-900">
                {outdoorSrc && (
                  <Image
                    src={outdoorSrc}
                    alt={outdoorItem?.altText || "Outdoor & Pools"}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <svg
                    className="w-9 h-9 text-[#0369A1]"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2v20"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <h4 className="text-base font-semibold">Outdoor &amp; Pools</h4>
                </div>
                <ul className="space-y-2 text-sm text-[#334155]">
                  <li>
                    <strong>Main Level Pool:</strong> Crystal clear oceanfront swimming.
                  </li>
                  <li>
                    <strong>Upper-Deck Spa Pool:</strong> Multi-person heated spa with sunset
                    panoramas.
                  </li>
                  <li>
                    <strong>Dual Sun Decks:</strong> Seamless indoor-outdoor Caribbean living.
                  </li>
                  <li>
                    <strong>Outdoor Grill &amp; Dining:</strong> Premium gas grill and alfresco
                    dining setup.
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="relative h-28 w-full overflow-hidden bg-slate-900">
                {techSrc && (
                  <Image
                    src={techSrc}
                    alt={techItem?.altText || "Entertainment & Tech"}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <svg
                    className="w-9 h-9 text-[#0F172A]"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 6h16M4 12h16M4 18h16"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <h4 className="text-base font-semibold">Entertainment &amp; Tech</h4>
                </div>
                <ul className="space-y-2 text-sm text-[#334155]">
                  <li>
                    <strong>Private Home Theater:</strong> High-definition projector/screen with
                    surround seating.
                  </li>
                  <li>
                    <strong>Whole-House Audio:</strong> Synchronized indoor/outdoor multi-zone music
                    system.
                  </li>
                  <li>
                    <strong>High-Speed Starlink/Wi-Fi:</strong> Uninterrupted connectivity
                    throughout the villa.
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="relative h-28 w-full overflow-hidden bg-slate-900">
                {culinarySrc && (
                  <Image
                    src={culinarySrc}
                    alt={culinaryItem?.altText || "Culinary & Hospitality"}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <svg
                    className="w-9 h-9 text-[#0284C7]"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 7h18M12 3v18"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <h4 className="text-base font-semibold">Culinary &amp; Hospitality</h4>
                </div>
                <ul className="space-y-2 text-sm text-[#334155]">
                  <li>
                    <strong>Dual Kitchen Setup:</strong> Fully equipped gourmet indoor kitchen +
                    outdoor prep station.
                  </li>
                  <li>
                    <strong>Dedicated Wine Refrigerator:</strong> Temperature-controlled storage for
                    fine vintages.
                  </li>
                  <li>
                    <strong>Full Concierge Service:</strong> Itinerary planning, boat charters, and
                    island bookings.
                  </li>
                  <li>
                    <strong>Personalized Services (On Request):</strong> Private chef, in-villa
                    massage, daily housekeeping, and Butler services.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concierge CTA Banner */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-2xl bg-[#16202A] text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Have a Special Request?</h3>
              <p className="mt-1 text-sm text-slate-200 max-w-lg">
                From private island hopping to personalized dining experiences, our concierge team
                curates every detail of your stay.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/book-now"
                className="inline-block bg-white text-[#16202A] px-4 py-2 rounded-md font-semibold shadow hover:shadow-lg transition"
              >
                Inquire Concierge
              </a>
              <a
                href="/accommodations"
                className="inline-block border border-white text-white px-4 py-2 rounded-md font-semibold hover:bg-white/5 transition"
              >
                Explore Accommodations
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
