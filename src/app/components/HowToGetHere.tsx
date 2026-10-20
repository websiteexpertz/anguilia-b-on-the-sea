'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

const routes = [
  {
    icon: 'PaperAirplaneIcon',
    title: 'Via St. Maarten (SXM)',
    subtitle: 'Most popular route',
    steps: [
      'Fly into Princess Juliana International Airport (SXM)',
      'Services major airlines from across the world',
      '20-minute public ferry or private charter to Anguilla',
      '10-minute scenic flight on Tradewinds Aviation',
    ],
    accent: true,
  },
  {
    icon: 'GlobeAmericasIcon',
    title: 'Via San Juan, Puerto Rico',
    subtitle: 'Alternative gateway',
    steps: [
      'Fly into Luis Muñoz Marín International Airport (SJU)',
      'Direct flights via Anguilla Air Express',
      'Connects directly to Clayton J Lloyd Airport',
      'Multiple daily departures available',
    ],
    accent: false,
  },
  {
    icon: 'BuildingOffice2Icon',
    title: 'Direct to Anguilla',
    subtitle: 'Private jet option',
    steps: [
      'Clayton J Lloyd Airport supports private jets',
      'Tradewinds Aviation: charter service from SXM',
      'Scenic 10-minute flight over the Caribbean',
      'Concierge ground transfer arranged on request',
    ],
    accent: false,
  },
];

export default function HowToGetHere() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { threshold: 0.1 }
    );
    const reveals = sectionRef.current?.querySelectorAll('.reveal') ?? [];
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-background py-20 px-6 md:px-16">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14 reveal">
          <span className="inline-block px-4 py-1.5 rounded-full border border-accent/30 text-xs font-semibold text-accent uppercase tracking-widest mb-5">
            Getting Here
          </span>
          <h2 className="font-display text-section-title font-light tracking-tight text-foreground mb-4">
            How to Get to Anguilla
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Anguilla is easily accessible via St. Maarten, Puerto Rico, or direct private charter —
            all just minutes from the island.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {routes.map((route, i) => (
            <div
              key={route.title}
              className={`reveal reveal-delay-${(i + 1) * 100} rounded-2xl p-8 border border-stone-200 bg-white shadow-sm transition-all duration-300 group hover:shadow-lg`}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-amber-50 text-amber-600 transition-colors">
                <Icon
                  name={route.icon as 'PaperAirplaneIcon'}
                  size={22}
                  className="text-amber-600"
                />
              </div>
              <div className="mb-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-600">
                  {route.subtitle}
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-5 text-stone-900">
                {route.title}
              </h3>
              <ul className="space-y-3">
                {route.steps.map((step, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-amber-500" />
                    <span className="text-sm leading-relaxed text-stone-700">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
