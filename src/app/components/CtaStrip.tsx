'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface CtaStripProps {
  image?: {
    src: string;
    alt?: string;
  };
}

export default function CtaStrip({ image }: CtaStripProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgSrc = image?.src || '';
  const bgAlt =
    image?.alt ||
    'Luxury villa terrace at sunset, warm golden light, ocean view beyond, deep amber shadows';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { threshold: 0.1 }
    );
    const reveals = sectionRef?.current?.querySelectorAll('.reveal') ?? [];
    reveals?.forEach((el) => observer?.observe(el));
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-background py-12 px-6 md:px-16 pb-20">
      <div className="max-w-screen-xl mx-auto">
        <div className="relative rounded-4xl overflow-hidden reveal bg-slate-900">
          {/* Background Image */}
          {bgSrc ? (
            <AppImage
              src={bgSrc}
              alt={bgAlt}
              fill
              className="object-cover"
              sizes="100vw"
            />
          ) : null}

          {/* Scrim */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/65" />
          {/* Noise */}
          <div className="absolute inset-0 noise-overlay" />

          {/* Content */}
          <div className="relative z-10 px-10 md:px-16 py-16 md:py-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-xs font-bold text-accent uppercase tracking-widest block mb-4">
                Reserve Your Stay
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-tight mb-5">
                Rates from <span className="italic text-white/90">$1,200/night</span>
              </h2>
              <p className="text-white/90 text-base leading-relaxed mb-2">
                Peak season fills quickly. Secure your dates now and let our concierge team handle
                every detail of your Anguilla escape.
              </p>
              <div className="flex items-center gap-6 mt-5">
                {[
                  { v: '5★', l: 'Guest Rating' },
                  { v: '5', l: 'Bedrooms' },
                  { v: '2', l: 'Pools' },
                ]?.map((s) => (
                  <div key={s?.l}>
                    <p className="font-display text-2xl text-white font-medium">{s?.v}</p>
                    <p className="text-white/70 text-xs uppercase tracking-widest">{s?.l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 flex-shrink-0">
              <Link href="/book-now" className="btn-accent flex items-center gap-2 justify-center">
                Book Now
                <Icon name="ArrowRightIcon" size={16} />
              </Link>
              <Link
                href="/villa-rental-rates"
                className="px-8 py-3.5 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-all flex items-center gap-2 justify-center"
              >
                View Full Rates
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
