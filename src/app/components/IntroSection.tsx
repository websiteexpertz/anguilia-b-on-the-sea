'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

const highlights = [
  {
    icon: 'HomeIcon',
    label: '5 Ensuite Bedrooms',
    desc: 'Each with private bathroom and ocean or garden views',
  },
  {
    icon: 'SparklesIcon',
    label: '2 Private Pools',
    desc: 'Main level pool and upper-deck spa wading pool',
  },
  {
    icon: 'FilmIcon',
    label: 'Home Theater',
    desc: '80" screen with 7.1 Dolby surround sound system',
  },
  {
    icon: 'BuildingStorefrontIcon',
    label: 'Gourmet Kitchen',
    desc: 'Fully equipped with premium appliances and wine fridge',
  },
];

interface IntroSectionProps {
  image?: {
    src: string;
    alt: string;
  };
}

export default function IntroSection({ image }: IntroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );
    const reveals =
      sectionRef.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right') ?? [];
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-background py-24 px-6 md:px-16 relative overflow-hidden"
    >
      {/* Background blob */}
      <div className="absolute top-0 right-0 w-96 h-96 blob-accent pointer-events-none" />

      <div className="max-w-screen-xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 reveal">
          <span className="inline-block px-4 py-1.5 rounded-full border border-accent/30 text-xs font-semibold text-accent uppercase tracking-widest mb-5">
            About the Villa
          </span>
          <h2 className="font-display text-section-title font-light tracking-tight text-foreground mb-5">
            Anguilla B on the Sea
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Nestled on Sandy Hill Beach, Villa B on the Sea sits on the #1 Caribbean island as
            ranked by Travel + Leisure&apos;s World&apos;s Best Awards — four years in a row.
          </p>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          {/* Image Column */}
          <div className="lg:col-span-5 reveal-left">
            <div className="relative">
              {/* Main image - arch shape from Template 2 */}
              <div className="relative h-[520px] rounded-t-arch rounded-b-2xl overflow-hidden shadow-2xl bg-muted flex items-center justify-center">
                {image?.src ? (
                  <AppImage
                    src={image.src}
                    alt={image.alt || 'Villa B on the Sea'}
                    fill
                    className="absolute inset-0 object-cover object-center hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                  />
                ) : (
                  <span className="text-muted-foreground text-sm">Villa B on the Sea</span>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent pointer-events-none" />
              </div>
              {/* Floating stat card */}
              <div className="absolute -bottom-6 -right-6 glass-light card-shadow rounded-2xl p-5 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Icon name="StarIcon" size={22} className="text-accent" variant="solid" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-medium text-foreground">4.9</p>
                    <p className="text-xs text-muted-foreground">Guest Rating</p>
                  </div>
                </div>
              </div>
              {/* Award badge */}
              <div className="absolute -top-4 -left-4 glass-light card-shadow rounded-2xl px-4 py-3 hidden md:block">
                <p className="text-xs font-bold text-primary uppercase tracking-widest">
                  #1 Caribbean Island
                </p>
                <p className="text-xs text-muted-foreground">World&apos;s Best Awards 2024</p>
              </div>
            </div>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="reveal reveal-delay-100">
              <p className="text-muted-foreground text-base leading-relaxed border-l-2 border-accent pl-6 mb-6">
                With 33 pristine beaches spanning 16 miles of coastline, Anguilla offers an
                unmatched Caribbean escape. Villa B on the Sea places you steps from the water with
                every luxury at hand.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                This fully staffed, 5-bedroom ensuite villa features a gourmet kitchen, two private
                pools, a state-of-the-art home theater, and personalized concierge service —
                everything you need for the perfect Caribbean retreat.
              </p>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 reveal reveal-delay-200">
              {highlights.map((h) => (
                <div
                  key={h.label}
                  className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-accent/30 hover:bg-accent/5 transition-all duration-300 group card-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition-colors">
                    <Icon
                      name={h.icon as 'HomeIcon'}
                      size={20}
                      className="text-primary group-hover:text-accent transition-colors"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground mb-0.5">{h.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 reveal reveal-delay-300">
              <Link href="/villa-rental-rates" className="btn-primary flex items-center gap-2">
                View Rates
                <Icon name="ArrowRightIcon" size={16} />
              </Link>
              <Link href="/book-now" className="btn-outline flex items-center gap-2">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
