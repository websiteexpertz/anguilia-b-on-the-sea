'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function Footer() {
  const [year, setYear] = useState('2026');
  const [settings, setSettings] = useState({
    siteName: 'Villa B on the Sea',
    contactEmail: 'anguillabonthesea@gmail.com',
    contactPhone: '+1 508-633-7355',
  });

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings({
            siteName: data.settings.siteName || 'Villa B on the Sea',
            contactEmail: data.settings.contactEmail || 'anguillabonthesea@gmail.com',
            contactPhone: data.settings.contactPhone || '+1 508-633-7355',
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-[#070709] text-white">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr_1fr_1.05fr] gap-12 xl:gap-16">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10">
                <img
                  src="/logo.png"
                  alt={settings.siteName}
                  className="h-8 w-auto object-contain"
                />
              </div>
              <div className="max-w-xs">
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                  {settings.siteName}
                </p>
                <p className="mt-2 text-sm uppercase tracking-[0.35em] text-white/50">
                  Anguilla, Caribbean
                </p>
              </div>
            </div>
            <p className="max-w-lg text-sm leading-7 text-white/70">
              A secluded luxury villa retreat on Sandy Hill Beach, designed for private stays with
              premium service, soulful Caribbean sunsets, and effortless hospitality.
            </p>
            <div className="grid grid-cols-1 gap-3 max-w-sm">
              <a
                href={`tel:${settings.contactPhone.replace(/[^+\d]/g, '')}`}
                className="group flex min-w-0 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 transition duration-300 hover:border-amber-200/25 hover:text-white"
              >
                <Icon
                  name="PhoneIcon"
                  size={16}
                  className="text-amber-200 transition duration-300 group-hover:text-amber-100"
                />
                <span className="min-w-0 break-words">{settings.contactPhone}</span>
              </a>
              <a
                href={`mailto:${settings.contactEmail}`}
                className="group flex min-w-0 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 transition duration-300 hover:border-amber-200/25 hover:text-white"
              >
                <Icon
                  name="EnvelopeIcon"
                  size={16}
                  className="text-amber-200 transition duration-300 group-hover:text-amber-100"
                />
                <span className="min-w-0 break-words leading-5">{settings.contactEmail}</span>
              </a>
            </div>
          </div>


          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Quick Links</p>
            <ul className="list-none space-y-2 pl-0">
              {[
                { label: 'RATES', href: '/villa-rental-rates' },
                { label: 'AMENITIES', href: '/amenities' },
                { label: 'ACCOMMODATIONS', href: '/accommodations' },
                { label: 'GALLERY', href: '/villa-b-on-the-sea' },
                { label: 'AVAILABILITY', href: '/book-now' },
                { label: 'FLOORPLANS', href: '/floorplans' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/65 no-underline transition duration-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Contact</p>
            <div className="space-y-3 text-sm text-white/70">
              <p className="leading-7">Sandy Hill Beach, Anguilla</p>
              <p className="leading-7">Concierge service available 24/7</p>
              <div className="flex items-center gap-3 text-white/70">
                <Icon name="MapPinIcon" size={16} className="text-amber-200" />
                <span>Private airport transfers available</span>
              </div>
            </div>
          </div>

          <div className="space-y-5 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Villa Brochure</p>
            <p className="text-sm leading-7 text-white/70">
              Download the complete villa guide for floor plans, amenities, and bespoke experiences
              at Villa B on the Sea.
            </p>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-200/15 bg-white/5 px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-amber-100 transition duration-300 hover:border-amber-200/30 hover:bg-amber-100/10 hover:text-amber-50">
              <Icon name="ArrowDownTrayIcon" size={16} />
              Download Brochure
            </button>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-white/50">
          <p className="text-white/60">© {year} Anguilla B on the Sea. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="#" className="text-white/60 transition duration-300 hover:text-amber-100">
              Privacy Policy
            </Link>
            <Link href="#" className="text-white/60 transition duration-300 hover:text-amber-100">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
