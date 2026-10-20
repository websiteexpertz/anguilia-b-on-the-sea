'use client';

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Lightbox from './Lightbox';

type Section = {
  key: string;
  label: string;
  images: string[];
};

type GalleryClientProps = {
  sections: Section[];
  hero: string | null;
};

type GalleryImageProps = {
  src: string;
  alt: string;
  index: number;
  section: string;
  className: string;
  onClick: () => void;
};

const GalleryImage = memo(function GalleryImage({
  src,
  alt,
  index,
  section,
  className,
  onClick,
}: GalleryImageProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${section} image ${index + 1}`}
      className={[
        className,
        'group relative overflow-hidden rounded-[2px]',
        'bg-slate-100',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900',
        'focus-visible:ring-offset-2',
      ].join(' ')}
    >
      <Image
        src={src}
        alt={alt}
        fill
        loading={index < 2 ? 'eager' : 'lazy'}
        quality={82}
        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
      />

      <span
        aria-hidden="true"
        className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10"
      />

      <span
        aria-hidden="true"
        className="
          absolute bottom-4 right-4
          flex h-9 w-9 items-center justify-center
          rounded-full bg-white/90 text-slate-900
          opacity-0 translate-y-2
          shadow-sm backdrop-blur
          transition-all duration-300
          group-hover:translate-y-0 group-hover:opacity-100
        "
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M15 3h6v6" />
          <path d="M10 14 21 3" />
          <path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6" />
        </svg>
      </span>
    </button>
  );
});

function SectionGallery({
  section,
  sectionIndex,
  onOpen,
}: {
  section: Section;
  sectionIndex: number;
  onOpen: (images: string[], index: number) => void;
}) {
  const title =
    section.label === 'Bedrooms'
      ? 'Private Sanctuaries'
      : section.label === 'Main Level'
        ? 'The Heart of the Villa'
        : section.label === 'Entertainment Deck'
          ? 'Made for Long Evenings'
          : section.label === 'Main Level Views'
            ? 'Caribbean Horizons'
            : section.label === 'Upper Level Views'
              ? 'Views from Above'
              : section.label;

  return (
    <section
      id={`section-${section.key}`}
      className="scroll-mt-24"
      aria-labelledby={`heading-${section.key}`}
    >
      <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-slate-400" />

            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-slate-500">
              {String(sectionIndex + 1).padStart(2, '0')} /{' '}
              {String(section.images.length).padStart(2, '0')} images
            </p>
          </div>

          <h2
            id={`heading-${section.key}`}
            className="font-display text-3xl leading-tight text-slate-950 md:text-4xl"
          >
            {title}
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            {section.label === 'Bedrooms'
              ? 'Quiet spaces designed for slow mornings and restful Caribbean nights.'
              : section.label === 'Entertainment Deck'
                ? 'Open-air spaces made for sunset drinks, conversation, and unforgettable evenings.'
                : 'A glimpse into life at B on the Sea.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpen(section.images, 0)}
          className="
            hidden items-center gap-2 self-start text-xs
            font-medium uppercase tracking-[0.18em]
            text-slate-500 transition-colors
            hover:text-slate-950 md:flex
          "
        >
          View collection
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {section.images.map((src, index) => {
          return (
            <GalleryImage
              key={`${section.key}-${src}-${index}`}
              src={src}
              index={index}
              section={section.label}
              alt={`${section.label} — image ${index + 1}`}
              className="aspect-[4/3]"
              onClick={() => onOpen(section.images, index)}
            />
          );
        })}
      </div>
    </section>
  );
}

export default function GalleryClient({ sections, hero }: GalleryClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState('all');

  const totalImages = useMemo(
    () => sections.reduce((total, section) => total + section.images.length, 0),
    [sections]
  );

  const openLightbox = useCallback((images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const next = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null || lightboxImages.length === 0) {
        return null;
      }

      return (current + 1) % lightboxImages.length;
    });
  }, [lightboxImages.length]);

  const prev = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null || lightboxImages.length === 0) {
        return null;
      }

      return (current - 1 + lightboxImages.length) % lightboxImages.length;
    });
  }, [lightboxImages.length]);

  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveSection(visible[0].target.id.replace('section-', ''));
        }
      },
      {
        rootMargin: '-20% 0px -65% 0px',
        threshold: 0,
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(`section-${section.key}`);

      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = useCallback((id: string) => {
    if (id === 'all') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return;
    }

    const element = document.getElementById(`section-${id}`);

    element?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  if (sections.length === 0) {
    return (
      <main className="min-h-[70vh] bg-white">
        <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6 text-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">B on the Sea</p>

            <h1 className="mt-5 font-display text-4xl text-slate-950 md:text-5xl">
              The gallery is coming soon
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-500">
              We are preparing a collection of images from the villa, its private spaces, decks, and
              Caribbean surroundings.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[#fafaf9] text-slate-950">
      {/* HERO */}
      <section className="relative h-[72vh] min-h-[560px] w-full overflow-hidden bg-slate-900">
        {hero && (
          <Image
            src={hero}
            alt="B on the Sea villa"
            fill
            priority
            quality={88}
            sizes="100vw"
            className="object-cover"
          />
        )}

        <div className="absolute inset-0 bg-black/25" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-12 md:pb-16">
          <div className="max-w-none text-white">
            <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.35em] text-white/70">
              B on the Sea · Villa Gallery
            </p>

            <h1 className="whitespace-nowrap font-display text-3xl leading-none tracking-tight sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl">
              A place worth seeing.
            </h1>

            <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center">
              <p className="max-w-lg text-sm leading-6 text-white/75 md:text-base">
                Explore {totalImages} images of the villa, its private spaces, expansive decks, and
                breathtaking Caribbean surroundings. Spaces designed for effortless island living.
              </p>

              <button
                type="button"
                onClick={() => scrollToSection('all')}
                className="
                  inline-flex shrink-0 items-center justify-center
                  gap-3 border border-white/40 bg-white/10
                  px-5 py-3 text-xs font-medium uppercase
                  tracking-[0.18em] text-white backdrop-blur-md
                  transition-all duration-300
                  hover:border-white hover:bg-white hover:text-slate-950
                "
              >
                Explore
                <span aria-hidden="true">↓</span>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 hidden text-[10px] uppercase tracking-[0.25em] text-white/50 md:block">
          Scroll to explore
        </div>
      </section>

      {/* STICKY NAV */}
      <nav
        aria-label="Gallery sections"
        className="
          sticky top-0 z-30 border-b border-slate-200/70
          bg-[#fafaf9]/90 backdrop-blur-xl
        "
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex overflow-x-auto scrollbar-none">
            <div className="flex min-w-max items-center gap-1 py-3">
              <button
                type="button"
                onClick={() => scrollToSection('all')}
                className={`
                  relative px-4 py-2 text-[11px] font-medium
                  uppercase tracking-[0.16em] transition-colors
                  ${
                    activeSection === 'all'
                      ? 'text-slate-950'
                      : 'text-slate-400 hover:text-slate-900'
                  }
                `}
              >
                All
                {activeSection === 'all' && (
                  <span className="absolute inset-x-4 -bottom-3 h-px bg-slate-950" />
                )}
              </button>

              {sections.map((section) => {
                const active = activeSection === section.key;

                return (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => scrollToSection(section.key)}
                    className={`
                      relative px-4 py-2 text-[11px] font-medium
                      uppercase tracking-[0.16em] transition-colors
                      ${active ? 'text-slate-950' : 'text-slate-400 hover:text-slate-900'}
                    `}
                  >
                    {section.label}

                    {active && <span className="absolute inset-x-4 -bottom-3 h-px bg-slate-950" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* GALLERY */}
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="space-y-24 md:space-y-32">
          {sections.map((section, index) => (
            <SectionGallery
              key={section.key}
              section={section}
              sectionIndex={index}
              onOpen={openLightbox}
            />
          ))}
        </div>

        {/* CTA */}
        <section className="relative mt-28 overflow-hidden bg-slate-950 px-6 py-20 text-center text-white md:mt-40 md:px-10 md:py-28">
          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/45">
              Experience B on the Sea
            </p>

            <h2 className="mt-5 font-display text-4xl leading-tight md:text-6xl">
              Some places are better
              <br />
              experienced in person.
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/55 md:text-base">
              Discover the privacy, views, and effortless Caribbean living that make B on the Sea
              unforgettable.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/book-now"
                className="
                  inline-flex items-center justify-center
                  bg-white px-7 py-3.5 text-xs font-medium
                  uppercase tracking-[0.18em] text-slate-950
                  transition-transform duration-300
                  hover:-translate-y-0.5
                "
              >
                Book Your Stay
              </Link>

              <Link
                href="/"
                className="
                  inline-flex items-center justify-center
                  border border-white/20 px-7 py-3.5
                  text-xs font-medium uppercase tracking-[0.18em]
                  text-white transition-colors duration-300
                  hover:border-white/50
                "
              >
                Return Home
              </Link>
            </div>
          </div>
        </section>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          index={lightboxIndex}
          onClose={closeLightbox}
          onNext={next}
          onPrev={prev}
        />
      )}
    </main>
  );
}
