'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const navLinks = [
  { label: 'RATES', href: '/villa-rental-rates' },
  { label: 'AMENITIES', href: '/amenities' },
  { label: 'ACCOMMODATIONS', href: '/accommodations' },
  { label: 'GALLERY', href: '/gallery' },
  { label: 'AVAILABILITY', href: '/book-now' },
  { label: 'FLOORPLANS', href: '/floorplans' },
];

export default function Header({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSolid = solid || scrolled;
  const navTextPrimary = isSolid ? 'text-stone-900' : 'text-white';
  const navTextSecondary = isSolid ? 'text-stone-700' : 'text-white/70';
  const navLinkText = isSolid
    ? 'text-stone-900/95 hover:text-stone-700'
    : 'text-white/90 hover:text-white';
  const menuLineColor = isSolid ? 'bg-stone-900' : 'bg-white';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body?.classList?.add('mobile-menu-open');
    } else {
      document.body?.classList?.remove('mobile-menu-open');
    }
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isSolid
            ? 'bg-white border-b border-stone-200 shadow-xl py-3'
            : 'bg-stone-950/5 backdrop-blur-[5px] shadow-sm py-4'
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-6 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="flex h-12 w-[76px] items-center justify-center rounded-3xl bg-white/10 shadow-sm backdrop-blur-md">
              <img
                src="/logo.png"
                alt="Villa B on the Sea"
                className="h-auto max-h-[59px] w-full object-contain"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks?.map((link) => (
              <Link
                key={link?.label}
                href={link?.href}
                className={`${navLinkText} no-underline text-sm font-medium tracking-wide transition-colors`}
              >
                {link?.label}
              </Link>
            ))}
          </nav>

          {/* Contact Icons */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+15086337355"
              className={`w-10 h-10 rounded-3xl border ${isSolid ? 'border-stone-200/70 text-stone-900/85 hover:text-stone-700 hover:border-stone-300' : 'border-white/15 text-white/80 hover:text-white hover:border-white/30'} flex items-center justify-center transition-all duration-300 bg-white/5`}
              aria-label="Call us"
            >
              <Icon name="PhoneIcon" size={16} />
            </a>
            <a
              href="mailto:anguillabonthesea@gmail.com"
              className={`w-10 h-10 rounded-3xl border ${isSolid ? 'border-stone-200/70 text-stone-900/85 hover:text-stone-700 hover:border-stone-300' : 'border-white/15 text-white/80 hover:text-white hover:border-white/30'} flex items-center justify-center transition-all duration-300 bg-white/5`}
              aria-label="Email us"
            >
              <Icon name="EnvelopeIcon" size={16} />
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            className={`lg:hidden w-11 h-11 flex flex-col gap-1.5 items-center justify-center rounded-3xl ring-1 backdrop-blur-md transition-all duration-300 ${isSolid ? 'bg-stone-100 ring-stone-200' : 'bg-white/10 ring-white/15'}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 ${menuLineColor} transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`}
            />
            <span
              className={`block w-4 h-0.5 ${menuLineColor} transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`block w-6 h-0.5 ${menuLineColor} transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`}
            />
          </button>
        </div>
      </header>
      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-stone-950/95 backdrop-blur-xl flex flex-col transition-all duration-500 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex-1 flex flex-col justify-center px-8 pt-20 pb-8 overflow-y-auto">
          {navLinks?.map((link, i) => (
            <div key={link?.label}>
              <Link
                href={link?.href}
                onClick={() => setMobileOpen(false)}
                className="block py-4 text-2xl font-display font-light text-white border-b border-white/10 hover:text-accent transition-colors"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {link?.label}
              </Link>
            </div>
          ))}
          <div className="mt-8 flex flex-col gap-3">
            <a href="tel:+15086337355" className="flex items-center gap-3 text-white/70">
              <Icon name="PhoneIcon" size={18} />
              <span>+1 508-633-7355</span>
            </a>
            <a
              href="mailto:anguillabonthesea@gmail.com"
              className="flex items-center gap-3 text-white/70"
            >
              <Icon name="EnvelopeIcon" size={18} />
              <span>anguillabonthesea@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
