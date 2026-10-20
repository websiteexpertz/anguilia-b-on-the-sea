'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

type Asset = {
  src: string;
  name: string;
};

type FloorplansClientProps = {
  floorplan: Asset | null;
  entertainment: Asset | null;
};

/* ============================================================
   REUSABLE FLOORPLAN / IMAGE VIEWER
   ============================================================ */

function FloorplanViewer({ asset, alt }: { asset: Asset; alt: string }) {
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  /* ==========================================================
     ZOOM FUNCTIONS
     ========================================================== */

  const zoomIn = useCallback(() => {
    setZoom((current) => Math.min(current + 0.25, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((current) => Math.max(current - 0.25, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  /* ==========================================================
     KEYBOARD CONTROLS
     ========================================================== */

  useEffect(() => {
    if (!fullscreen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullscreen(false);
      }

      if (event.key === '+' || event.key === '=') {
        zoomIn();
      }

      if (event.key === '-') {
        zoomOut();
      }

      if (event.key === '0') {
        resetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullscreen, zoomIn, zoomOut, resetZoom]);

  /* ==========================================================
     RESET ZOOM WHEN ENTERING / EXITING FULLSCREEN
     ========================================================== */

  const toggleFullscreen = useCallback(() => {
    setFullscreen((current) => !current);
    setZoom(1);
  }, []);

  /* ==========================================================
     IMAGE SOURCE
     
     IMPORTANT:
     DO NOT PUT A HARDCODED IMAGE HERE.

     We use:
     
       src={asset.src}

     Therefore Main Level and Entertainment Deck can
     display completely different files.
     ========================================================== */

  const isSvg = asset.name.toLowerCase().endsWith('.svg');

  return (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-[100] bg-[#f7f7f5]'
          : 'relative overflow-hidden border border-slate-200 bg-white'
      }
    >
      {/* =====================================================
          TOP ZOOM CONTROLS
      ====================================================== */}

      <div className="absolute left-4 top-4 z-30 flex items-center overflow-hidden border border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
        {/* ZOOM OUT */}

        <button
          type="button"
          onClick={zoomOut}
          disabled={zoom <= 0.5}
          className="flex h-10 w-10 items-center justify-center text-xl text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Zoom out"
          title="Zoom out"
        >
          −
        </button>

        {/* ZOOM PERCENTAGE */}

        <button
          type="button"
          onClick={resetZoom}
          className="min-w-[60px] px-2 text-[10px] font-medium uppercase tracking-[0.15em] text-slate-500 transition-colors hover:bg-slate-100"
          aria-label="Reset zoom"
          title="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>

        {/* ZOOM IN */}

        <button
          type="button"
          onClick={zoomIn}
          disabled={zoom >= 3}
          className="flex h-10 w-10 items-center justify-center text-xl text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Zoom in"
          title="Zoom in"
        >
          +
        </button>
      </div>

      {/* =====================================================
          FULLSCREEN BUTTON
      ====================================================== */}

      <button
        type="button"
        onClick={toggleFullscreen}
        className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center border border-slate-200 bg-white/95 text-slate-700 shadow-sm backdrop-blur-md transition-colors hover:bg-white"
        aria-label={fullscreen ? 'Exit fullscreen' : 'Open fullscreen'}
        title={fullscreen ? 'Exit fullscreen' : 'Open fullscreen'}
      >
        {fullscreen ? (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M8 3v5H3" />
            <path d="M16 3v5h5" />
            <path d="M8 21v-5H3" />
            <path d="M16 21v-5h5" />
          </svg>
        ) : (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M8 3H3v5" />
            <path d="M16 3h5v5" />
            <path d="M8 21H3v-5" />
            <path d="M16 21h5v-5" />
          </svg>
        )}
      </button>

      {/* =====================================================
          IMAGE VIEWER
      ====================================================== */}

      <div
        className={`
          flex items-center justify-center overflow-auto
          bg-[#fcfcfa]
          ${
            fullscreen
              ? 'h-screen w-screen p-6 md:p-16'
              : 'min-h-[500px] p-6 md:min-h-[680px] md:p-12'
          }
        `}
      >
        <div
          className="relative shrink-0 transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <Image
            src={asset.src}
            alt={alt}
            width={1800}
            height={1300}
            priority
            unoptimized={isSvg}
            className="h-auto max-h-[78vh] w-auto max-w-none object-contain"
          />
        </div>
      </div>

      {/* =====================================================
          BOTTOM INFO
      ====================================================== */}

      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap border border-slate-200 bg-white/90 px-4 py-2 text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500 shadow-sm backdrop-blur-md">
        Zoom · Explore · Fullscreen
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
   ============================================================ */

function EmptyState({ title }: { title: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center border border-dashed border-slate-300 bg-white">
      <div className="px-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-slate-400">
          +
        </div>

        <h3 className="mt-5 font-display text-xl text-slate-900">{title}</h3>

        <p className="mt-2 text-sm text-slate-500">Image coming soon.</p>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function FloorplansClient({ floorplan, entertainment }: FloorplansClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  /* ==========================================================
     LIGHTBOX
     ========================================================== */

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, closeLightbox]);

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <main className="bg-[#fafaf9] text-slate-950">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-slate-950 px-6 py-24 text-white md:py-32 lg:py-40">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-white/30" />

              <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/45">
                B on the Sea · Anguilla
              </p>
            </div>

            <h1 className="mt-7 font-display text-5xl leading-[0.92] tracking-tight md:text-7xl lg:text-8xl">
              Designed around
              <br />
              the Caribbean.
            </h1>

            <p className="mt-8 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
              Explore the main level floorplan and entertainment deck of B on the Sea — thoughtfully
              designed spaces that bring indoor living, outdoor living and the Caribbean together.
            </p>
          </div>
        </div>

        {/* DECORATIVE CIRCLES */}

        <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full border border-white/[0.06]" />

        <div className="pointer-events-none absolute -right-10 -top-10 h-[350px] w-[350px] rounded-full border border-white/[0.05]" />

        <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <nav className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#fafaf9]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 overflow-x-auto">
              <a
                href="#main-level"
                className="whitespace-nowrap px-4 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-slate-950"
              >
                01 · Main Level Floorplan
              </a>

              <a
                href="#entertainment"
                className="whitespace-nowrap px-4 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-slate-950"
              >
                02 · Entertainment Deck
              </a>
            </div>

            <div className="hidden text-[9px] uppercase tracking-[0.2em] text-slate-400 md:block">
              B on the Sea
            </div>
          </div>
        </div>
      </nav>

      {/* =====================================================
          MAIN LEVEL FLOORPLAN
      ====================================================== */}

      <section id="main-level" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 lg:py-36">
          {/* HEADER */}

          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-slate-400" />

                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-slate-400">
                  01 · Main Level Floorplan
                </p>
              </div>

              <h2 className="mt-6 font-display text-4xl leading-[1] tracking-tight md:text-6xl">
                The heart
                <br />
                of the villa.
              </h2>
            </div>

            <div className="max-w-2xl lg:justify-self-end">
              <p className="text-sm leading-7 text-slate-600 md:text-base">
                The main level features an inviting open layout surrounded by glass doors presenting
                expansive views of the sea, St Martin, St Barth and Anguilla to be seen day and
                night.
              </p>

              <p className="mt-5 text-sm leading-7 text-slate-600 md:text-base">
                The gourmet kitchen is perfect for the chef at heart who can still join in the fun
                and games happening in the living room. Enjoy the activities on the deck and in the
                pool.
              </p>

              <p className="mt-5 text-sm leading-7 text-slate-600 md:text-base">
                The warm breezes and starry skies provide the ultimate relaxation before retiring to
                the private sanctuary of your room for a peaceful sleep.
              </p>
            </div>
          </div>

          {/* =================================================
              MAIN LEVEL VIEWER
          ================================================== */}

          <div className="mt-12 md:mt-16">
            {floorplan ? (
              <FloorplanViewer asset={floorplan} alt="B on the Sea Main Level Floorplan" />
            ) : (
              <EmptyState title="Main Level Floorplan" />
            )}
          </div>

          {/* SMALL FEATURES */}

          <div className="mt-8 grid grid-cols-2 border-y border-slate-200 md:grid-cols-4">
            <div className="border-r border-slate-200 px-5 py-5">
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Layout</p>

              <p className="mt-2 text-sm text-slate-700">Open Living</p>
            </div>

            <div className="border-r border-slate-200 px-5 py-5">
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Kitchen</p>

              <p className="mt-2 text-sm text-slate-700">Gourmet</p>
            </div>

            <div className="border-r border-slate-200 px-5 py-5">
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Outdoor</p>

              <p className="mt-2 text-sm text-slate-700">Deck & Pool</p>
            </div>

            <div className="px-5 py-5">
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Views</p>

              <p className="mt-2 text-sm text-slate-700">Caribbean Sea</p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          DIVIDER
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-6">
        <div className="h-px bg-slate-200" />
      </div>

      {/* =====================================================
          ENTERTAINMENT DECK
      ====================================================== */}

      <section id="entertainment" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 lg:py-36">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-20">
            {/* =================================================
                ENTERTAINMENT DECK VIEWER
            ================================================== */}

            <div className="relative">
              {entertainment ? (
                <FloorplanViewer
                  asset={entertainment}
                  alt="B on the Sea Entertainment Deck Floorplan"
                />
              ) : (
                <EmptyState title="Entertainment Deck" />
              )}
            </div>

            {/* =================================================
                ENTERTAINMENT TEXT
            ================================================== */}

            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-slate-400" />

                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-slate-400">
                  02 · Entertainment Deck
                </p>
              </div>

              <h2 className="mt-6 font-display text-4xl leading-[1] tracking-tight md:text-6xl">
                Made for
                <br />
                long evenings.
              </h2>

              <p className="mt-8 text-sm leading-7 text-slate-600 md:text-base">
                Villa B on the Sea is a luxurious villa with all the indoor and outdoor amenities
                desired for a vacation in Anguilla for family and friends.
              </p>

              <p className="mt-5 text-sm leading-7 text-slate-600 md:text-base">
                The villa host will meet you at the port of entry and guide you back to the villa
                for a personal tour of the villa, allowing you to settle effortlessly into your
                stay.
              </p>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-200 pt-6">
                <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400">
                  Indoor Living
                </span>

                <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400">
                  Outdoor Living
                </span>

                <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Pool</span>

                <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400">
                  Sea Views
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="bg-slate-950 px-6 py-20 text-center text-white md:py-28 lg:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/35">
            B on the Sea · Anguilla
          </p>

          <h2 className="mt-6 font-display text-4xl leading-tight md:text-6xl">
            See the space.
            <br />
            Experience the view.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/50">
            Discover the privacy, views and effortless Caribbean living of B on the Sea.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/book-now"
              className="inline-flex items-center justify-center bg-white px-7 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-950 transition-transform duration-300 hover:-translate-y-0.5"
            >
              Book Your Stay
            </a>

            <a
              href="/gallery"
              className="inline-flex items-center justify-center border border-white/20 px-7 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:border-white/50"
            >
              View Gallery
            </a>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN LEVEL LIGHTBOX
      ====================================================== */}

      {lightboxOpen && floorplan && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 md:p-10"
          role="dialog"
          aria-modal="true"
          aria-label="Main Level Floorplan"
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
            aria-label="Close floorplan"
          >
            ×
          </button>

          <div className="relative h-[90vh] w-[95vw]">
            <Image
              src={floorplan.src}
              alt="B on the Sea Main Level Floorplan"
              fill
              sizes="95vw"
              unoptimized={floorplan.name.toLowerCase().endsWith('.svg')}
              className="object-contain"
            />
          </div>
        </div>
      )}
    </main>
  );
}
