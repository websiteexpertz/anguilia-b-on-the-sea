'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export interface HeroSlide {
  src: string;
  alt: string;
}

interface HeroSectionProps {
  slides?: HeroSlide[];
}

export default function HeroSection({ slides = [] }: HeroSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [flexible, setFlexible] = useState(false);

  const nextSlide = useCallback(() => {
    if (slides.length > 0) {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }
  }, [slides.length]);

  useEffect(() => {
    setActiveSlide(0);
  }, [slides]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 2000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const bookingHref = checkIn && checkOut
    ? `/book-now?${new URLSearchParams({ checkIn, checkOut }).toString()}`
    : '/book-now';

  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      {/* Slideshow */}
      {slides?.map((slide, i) => (
        <div
          key={i}
          className={`hero-slide ${i === activeSlide ? 'active' : ''}`}
          style={{ zIndex: i === activeSlide ? 1 : 0 }}
        >
          <AppImage
            src={slide?.src}
            alt={slide?.alt}
            fill
            priority={i === 0}
            className="object-cover object-center scale-105"
            sizes="100vw"
          />
        </div>
      ))}
      {/* Gradient Scrim */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
      {/* Rotating Badge */}
      <div className="absolute top-28 right-8 md:right-16 z-20 pointer-events-none hidden md:block">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="animate-spin-slow w-full h-full" viewBox="0 0 100 100">
            <defs>
              <path
                id="heroCircle"
                d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                fill="transparent"
              />
            </defs>
            <text
              fontSize="9.5"
              fontFamily="var(--font-dm-sans)"
              fontWeight="500"
              letterSpacing="2.5px"
              fill="white"
              opacity="0.85"
            >
              <textPath href="#heroCircle" startOffset="0%">
                ANGUILLA • CARIBBEAN • LUXURY •
              </textPath>
            </text>
          </svg>
          <div className="absolute w-8 h-8 rounded-full border border-white/40 flex items-center justify-center">
            <Icon name="StarIcon" size={14} className="text-accent" variant="solid" />
          </div>
        </div>
      </div>
      {/* Hero Content */}
      <div className="relative z-20 min-h-screen px-6 md:px-16">
        <div className="absolute left-1/2 top-20 flex w-[calc(100%-3rem)] max-w-screen-xl -translate-x-1/2 flex-col items-center text-center">
          {/* Eyebrow */}
          <div className="hero-eyebrow animate-enter delay-100">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full glass-dark px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/90">
              <span className="w-2 h-2 rounded-full bg-accent" />
              World&apos;s Best Caribbean Island — 4 Years Running
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-title mb-3 max-w-4xl animate-enter delay-200 font-display font-light leading-none tracking-tight text-white">
            Anguilla
            <br className="hero-title-break" />
            <span className="italic text-white/70">Villa B on the Sea</span>
          </h1>
        </div>
        {/* Availability Widget */}
        <div className="hero-booking absolute left-1/2 w-[calc(100%-3rem)] max-w-6xl -translate-x-1/2 -translate-y-1/2 animate-enter delay-500 rounded-xl border border-white/20 bg-white/5 p-5 shadow-2xl backdrop-blur-[5px] sm:p-7">
          <div className="grid w-full grid-cols-2 items-end gap-4 lg:grid-cols-[1fr_1fr_0.8fr_auto]">
            {/* Check In */}
            <div className="flex flex-col gap-1">
              <label className="text-white/80 text-base uppercase tracking-widest font-semibold">
                Check-In
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e?.target?.value)}
                  className="w-full min-w-0 rounded-md border border-white/20 bg-white/10 px-5 py-3 text-base text-white transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-900/20 sm:py-3.5 sm:text-lg"
                />
              </div>
            </div>
            {/* Check Out */}
            <div className="flex flex-col gap-1">
              <label className="text-white/80 text-base uppercase tracking-widest font-semibold">
                Check-Out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e?.target?.value)}
                className="w-full min-w-0 rounded-md border border-white/20 bg-white/10 px-5 py-3 text-base text-white transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-900/20 sm:py-3.5 sm:text-lg"
              />
            </div>
            {/* Flexible Dates */}
            <div className="flex min-h-[72px] items-center sm:min-h-[80px]">
              <label className="flex cursor-pointer items-center gap-3 py-2.5">
                <input
                  type="checkbox"
                  checked={flexible}
                  onChange={(e) => setFlexible(e.target.checked)}
                  className="h-7 w-7 accent-amber-500 focus:ring-2 focus:ring-amber-500"
                />
                <span className="whitespace-nowrap text-lg text-white/85">Flexible Dates</span>
              </label>
            </div>
            {/* CTA */}
            <div className="flex min-h-[72px] items-center sm:min-h-[80px]">
              <Link
                href={bookingHref}
                className="btn-accent flex w-full items-center justify-center gap-2 py-3.5 text-center text-lg lg:w-auto lg:px-7"
              >
                Inquire Now
                <Icon name="ArrowRightIcon" size={18} />
              </Link>
            </div>
          </div>
        </div>
        {/* Subheadline */}
        <p className="hero-description absolute left-1/2 w-[calc(100%-3rem)] max-w-2xl -translate-x-1/2 animate-enter delay-300 text-center font-light leading-snug text-white/85">
          A private 5-bedroom beachfront villa on Sandy Hill Beach — 2 pools, home theater, gourmet
          kitchen, and full concierge service.
        </p>
      </div>
    </section>
  );
}
