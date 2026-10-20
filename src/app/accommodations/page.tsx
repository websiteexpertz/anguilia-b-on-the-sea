import AccommodationsGalleryClient from '../../components/AccommodationsGalleryClient';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { listGalleryItems } from '@/lib/db/services/galleryService';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Villa Bedrooms | B on the Sea',
  description:
    'Explore the private bedrooms at B on the Sea, designed for comfort, privacy, and relaxing Caribbean views.',
};

export default async function AccommodationsPage() {
  let images: string[] = [];

  try {
    const items = await listGalleryItems({ section: 'bedrooms', status: 'active' });
    if (items && items.length > 0) {
      const seen = new Set<string>();
      images = items
        .sort((a, b) => a.order - b.order)
        .map((i) => i.url)
        .filter((url) => {
          if (!url || seen.has(url)) return false;
          seen.add(url);
          return true;
        });
    }
  } catch (err) {
    console.warn('Failed to load bedrooms from DB:', err);
  }

  return (
    <>
      <Header />


      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
        {/* Page Header */}
        <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <p className="text-xs font-medium tracking-[0.3em] text-slate-500 sm:text-sm">
            ACCOMMODATIONS
          </p>

          <h1 className="mt-3 font-display text-4xl leading-tight text-slate-900 sm:text-5xl">
            Villa Bedrooms
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Wake to Caribbean views and retreat to beautifully appointed private spaces designed for
            comfort, privacy, and restful stays.
          </p>
        </header>

        {/* Gallery */}
        <AccommodationsGalleryClient images={images} />

        {/* Booking CTA */}
        <section className="mt-16 border-t border-slate-200 pt-12 text-center sm:mt-20 sm:pt-16">
          <p className="text-xs font-medium tracking-[0.25em] text-slate-500">
            YOUR CARIBBEAN ESCAPE
          </p>

          <h2 className="mt-3 font-display text-3xl text-slate-900 sm:text-4xl">
            Experience B on the Sea
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Discover private villa stay where beautiful surroundings, peaceful spaces, and
            Caribbean living come together.
          </p>

          <a
            href="/book-now"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-7 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:bg-slate-800 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            Book Your Stay
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </section>
      </main>

      <Footer />
    </>
  );
}
