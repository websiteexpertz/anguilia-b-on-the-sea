'use client';

import { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface HeroSliderProps {
  slides?: Array<{
    src: string;
    alt: string;
  }>;
}

export default function HeroSlider({ slides = [] }: HeroSliderProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[90vh] min-h-[680px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/40" />
      {slides.map((slide, index) => (
        <div
          key={slide.alt}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <img src={slide.src} alt={slide.alt} className="h-full w-full object-cover" />
        </div>
      ))}

      <div className="absolute inset-0 mx-auto flex max-w-screen-2xl flex-col justify-end px-6 pb-20 sm:px-10 lg:px-16">
        <div className="max-w-3xl rounded-3xl border border-white/10 bg-stone-950/40 p-8 shadow-2xl backdrop-blur-xl text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Availability & Rates</p>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="block text-sm text-white/80">
              Check-in date
              <input
                type="date"
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </label>
            <label className="block text-sm text-white/80">
              Check-out date
              <input
                type="date"
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/80">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/30 bg-stone-900 text-amber-400 focus:ring-amber-400"
              />
              My dates are flexible
            </label>
            <button className="rounded-2xl bg-amber-500 px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-stone-950 shadow-xl shadow-amber-500/20 transition hover:bg-amber-400">
              INQUIRE NOW
            </button>
          </div>
        </div>
      </div>

      <div className="absolute left-6 top-1/2 z-20 flex -translate-y-1/2 gap-3">
        <button
          type="button"
          onClick={() => setActive((prev) => (prev - 1 + slides.length) % slides.length)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:border-amber-300 hover:text-amber-300"
          aria-label="Previous slide"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setActive((prev) => (prev + 1) % slides.length)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:border-amber-300 hover:text-amber-300"
          aria-label="Next slide"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
