'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';

/*
BENTO GRID AUDIT:
Array has 4 cards: [Beachfront, Pools, HomeTheater, Amenities]

Desktop (md:grid-cols-3):
Row 1: [col-1-2: Beachfront cs-2 rs-2] [col-3: Pools cs-1 rs-1]
Row 2: [col-1-2: Beachfront (continued)] [col-3: HomeTheater cs-1 rs-1]
Row 3: [col-1-3: Amenities cs-3 rs-1]

Placed 4/4 cards ✓
*/

interface FeatureBentoProps {
  images?: {
    beachfront?: { src: string; alt?: string };
    pools?: { src: string; alt?: string };
    theater?: { src: string; alt?: string };
    amenities?: { src: string; alt?: string };
  };
}

export default function FeatureBento({ images }: FeatureBentoProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const features = [
    {
      id: 'beachfront',
      title: 'Sandy Hill Beachfront',
      desc: "Steps from the turquoise Caribbean Sea on one of Anguilla's most secluded beaches. Wake up to the sound of waves.",
      src: images?.beachfront?.src || '',
      alt: images?.beachfront?.alt || 'Pristine white sandy beach with turquoise water, bright sun, palm trees, Caribbean paradise',
      stat: '33 Beaches',
      statLabel: 'on the island',
      colSpan: 'md:col-span-2',
      rowSpan: 'md:row-span-2',
      tall: true,
    },
    {
      id: 'pools',
      title: '2 Private Pools',
      desc: 'Main-level infinity pool plus upper-deck spa wading pool with Caribbean views.',
      src: images?.pools?.src || '',
      alt: images?.pools?.alt || 'Luxury private pool with calm water and tropical surroundings',
      stat: '2',
      statLabel: 'private pools',
      colSpan: 'md:col-span-1',
      rowSpan: 'md:row-span-1',
      tall: false,
    },
    {
      id: 'theater',
      title: 'Home Theater',
      desc: '80" cinema screen, 7.1 Dolby surround sound, private screening room.',
      src: images?.theater?.src || '',
      alt: images?.theater?.alt || 'Private home theater with screen and plush seating',
      stat: '80"',
      statLabel: 'cinema screen',
      colSpan: 'md:col-span-1',
      rowSpan: 'md:row-span-1',
      tall: false,
    },
    {
      id: 'amenities',
      title: 'Full-Service Luxury',
      desc: 'Gourmet kitchen, whole-house music, gas grill, wine fridge, concierge, and personalized services throughout your stay.',
      src: images?.amenities?.src || '',
      alt: images?.amenities?.alt || 'Bright airy luxury kitchen with marble countertops, large windows, natural light, open plan, well-lit interior',
      stat: '5.5',
      statLabel: 'bathrooms',
      colSpan: 'md:col-span-3',
      rowSpan: 'md:row-span-1',
      tall: false,
      wide: true,
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { threshold: 0.08 }
    );
    const reveals = sectionRef?.current?.querySelectorAll('.reveal') ?? [];
    reveals?.forEach((el) => observer?.observe(el));
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-primary py-20 px-6 md:px-16 relative overflow-hidden">
      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />
      <div className="max-w-screen-xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 reveal">
          <div>
            <span className="text-xs font-bold text-black uppercase tracking-widest block mb-3">
              The Villa Experience
            </span>
            <h2 className="font-display text-section-title font-light text-black tracking-tight">
              More than a villa. <span className="italic text-black">A sanctuary.</span>
            </h2>
          </div>
          <p className="text-black/90 text-sm max-w-xs leading-relaxed">
            Every detail designed for total immersion in Caribbean luxury.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features?.map((f, i) => (
            <div
              key={f?.id}
              className={`${f?.colSpan} ${f?.rowSpan} relative rounded-3xl overflow-hidden group border border-white/8 reveal reveal-delay-${(i + 1) * 100 > 400 ? 400 : (i + 1) * 100}`}
              style={{
                minHeight: f?.tall ? '480px' : f?.wide ? '200px' : '240px',
              }}
            >
              {f?.src ? (
                <AppImage
                  src={f.src}
                  alt={f.alt}
                  fill
                  className={`object-cover transition-transform duration-700 group-hover:scale-105 ${f?.tall || f?.wide ? 'opacity-70' : 'opacity-60'} group-hover:opacity-80`}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 bg-slate-900" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8">
                {/* Stat badge */}
                <div className="flex justify-end">
                  <div className="glass-dark rounded-xl px-4 py-2 text-center">
                    <p className="font-display text-2xl font-medium text-white">{f?.stat}</p>
                    <p className="text-white/60 text-xs">{f?.statLabel}</p>
                  </div>
                </div>

                {/* Title + desc */}
                <div>
                  <h3
                    className={`font-display font-light text-white tracking-tight mb-2 ${f?.tall ? 'text-2xl md:text-3xl' : 'text-xl'}`}
                  >
                    {f?.title}
                  </h3>
                  <p
                    className={`text-white/70 text-sm leading-relaxed ${f?.wide ? 'max-w-lg' : 'max-w-xs'}`}
                  >
                    {f?.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
