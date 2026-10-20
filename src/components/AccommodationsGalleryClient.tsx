'use client';

import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import Lightbox from './Lightbox';

type Props = {
  images: string[];
};

export default function AccommodationsGalleryClient({ images }: Props) {
  const [index, setIndex] = useState<number | null>(null);

  const open = useCallback((i: number) => {
    setIndex(i);
  }, []);

  const close = useCallback(() => {
    setIndex(null);
  }, []);

  const next = useCallback(() => {
    setIndex((current) => {
      if (current === null || images.length === 0) {
        return null;
      }

      return (current + 1) % images.length;
    });
  }, [images.length]);

  const prev = useCallback(() => {
    setIndex((current) => {
      if (current === null || images.length === 0) {
        return null;
      }

      return (current - 1 + images.length) % images.length;
    });
  }, [images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-slate-500">No bedroom images are currently available.</p>
      </div>
    );
  }

  return (
    <section aria-label="Villa bedroom gallery">
      {/* Gallery intro */}
      <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div>
          <p className="text-sm text-slate-500">Explore our private spaces</p>
        </div>

        <p className="text-sm text-slate-500">
          {images.length} {images.length === 1 ? 'photo' : 'photos'}
        </p>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-2 gap-3 auto-rows-[180px] sm:gap-4 sm:auto-rows-[200px] md:grid-cols-12 md:auto-rows-[240px]">
        {images.map((src, i) => {
          const pattern = i % 6;

          let className = 'col-span-2 row-span-2 md:col-span-6 md:row-span-2';

          if (pattern === 0) {
            className = 'col-span-2 row-span-2 md:col-span-7 md:row-span-2';
          }

          if (pattern === 1) {
            className = 'col-span-1 row-span-1 md:col-span-5 md:row-span-1';
          }

          if (pattern === 2) {
            className = 'col-span-1 row-span-1 md:col-span-5 md:row-span-1';
          }

          if (pattern === 3) {
            className = 'col-span-2 row-span-2 md:col-span-5 md:row-span-2';
          }

          if (pattern === 4) {
            className = 'col-span-1 row-span-1 md:col-span-4 md:row-span-1';
          }

          if (pattern === 5) {
            className = 'col-span-1 row-span-1 md:col-span-3 md:row-span-1';
          }

          return (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => open(i)}
              aria-label={`View bedroom photo ${i + 1}`}
              className={`${className} group relative overflow-hidden rounded-xl bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2`}
              style={{
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Image */}
              <div className="absolute inset-0">
                <Image
                  src={src}
                  alt={`Villa bedroom ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 60vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  priority={i === 0}
                />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 z-10 bg-black/0 transition-colors duration-500 group-hover:bg-black/15" />

              {/* View indicator */}
              <div className="absolute bottom-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-900 opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 3h6v6M21 3l-8 8M9 21H3v-6M3 21l8-8"
                  />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      {index !== null && (
        <Lightbox images={images} index={index} onClose={close} onNext={next} onPrev={prev} />
      )}
    </section>
  );
}
