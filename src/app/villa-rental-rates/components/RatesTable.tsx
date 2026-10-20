'use client';

import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { SeasonalRule, AdditionalCharge } from '@/lib/types/pricing';

const fallbackRateRows = [
  {
    from: 'May 1',
    to: 'Nov 14',
    season: 'Low Season',
    perNight: '$1,200',
    weekendNight: '$1,400',
    weekly: '$7,500',
    monthly: '$22,000',
  },
  {
    from: 'Nov 15',
    to: 'Dec 14',
    season: 'Shoulder Season',
    perNight: '$1,800',
    weekendNight: '$2,000',
    weekly: '$11,500',
    monthly: '$30,000',
  },
  {
    from: 'Dec 15',
    to: 'Jan 5',
    season: 'Holiday Peak',
    perNight: '$3,500',
    weekendNight: '$4,000',
    weekly: '$22,000',
    monthly: '—',
  },
  {
    from: 'Jan 6',
    to: 'Apr 30',
    season: 'High Season',
    perNight: '$2,500',
    weekendNight: '$2,800',
    weekly: '$16,000',
    monthly: '$42,000',
  },
];

const fallbackFeeRows = [
  { label: 'Government Tax', value: '10%', note: 'Applied to total rental' },
  { label: 'Service Fee', value: '10%', note: 'Applied to total rental' },
];

interface RatesTableProps {
  initialSeasons?: SeasonalRule[];
  initialCharges?: AdditionalCharge[];
}

export default function RatesTable({ initialSeasons, initialCharges }: RatesTableProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<null | {
    nights: number;
    subtotal: number;
    tax: number;
    service: number;
    total: number;
    charges?: Array<{ name: string; amount: number }>;
  }>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('active');
        });
      },
      { threshold: 0.08 }
    );
    const reveals = sectionRef.current?.querySelectorAll('.reveal') ?? [];
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Map dynamic seasons if available, else use fallback
  const displayedSeasons =
    initialSeasons && initialSeasons.length > 0
      ? initialSeasons
          .filter((s) => s.isActive)
          .map((s) => {
            const nightly = s.perNight ?? s.nightlyRate ?? 0;
            const weekend = s.weekendNight ?? nightly;
            return {
              season: s.name,
              from: s.from || (s.dateRange ? s.dateRange.split('–')[0]?.trim() : ''),
              to: s.to || (s.dateRange ? s.dateRange.split('–')[1]?.trim() : ''),
              dateRange: s.dateRange || (s.from && s.to ? `${s.from} – ${s.to}` : ''),
              perNight: formatCurrency(nightly),
              weekendNight: formatCurrency(weekend),
              weekly: s.weekly ? formatCurrency(s.weekly) : '—',
              monthly: s.monthly ? formatCurrency(s.monthly) : '—',
            };
          })
      : fallbackRateRows.map((r) => ({
          season: r.season,
          from: r.from,
          to: r.to,
          dateRange: `${r.from} – ${r.to}`,
          perNight: r.perNight,
          weekendNight: r.weekendNight,
          weekly: r.weekly,
          monthly: r.monthly,
        }));

  // Map dynamic charges if available, else use fallback
  const displayedFees =
    initialCharges && initialCharges.length > 0
      ? initialCharges
          .filter((c) => c.isActive)
          .map((c) => ({
            label: c.name,
            value: c.type === 'percentage' ? `${c.amount}%` : `$${c.amount}`,
            note: c.appliedTo || (c.type === 'percentage' ? 'Applied to total rental' : 'Applied once per stay'),
          }))
      : fallbackFeeRows;

  const computeEstimate = async () => {
    if (!checkIn || !checkOut) return;
    if (checkOut <= checkIn) {
      setCalcError('Check-out date must be after check-in date.');
      return;
    }

    setIsCalculating(true);
    setCalcError(null);

    try {
      const res = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkIn, checkOut, guests: 2 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to calculate quote');

      const quote = data.quote;
      let taxAmount = 0;
      let serviceAmount = 0;

      quote.chargesBreakdown?.forEach((c: any) => {
        if (c.name.toLowerCase().includes('tax') || c.name.toLowerCase().includes('levy')) {
          taxAmount += c.calculatedAmount;
        } else if (c.name.toLowerCase().includes('service')) {
          serviceAmount += c.calculatedAmount;
        }
      });

      setEstimate({
        nights: quote.nights,
        subtotal: quote.subtotal,
        tax: taxAmount,
        service: serviceAmount,
        total: quote.grandTotal,
        charges: quote.chargesBreakdown?.map((c: any) => ({
          name: c.name,
          amount: c.calculatedAmount,
        })),
      });
    } catch (err: any) {
      setCalcError(err?.message || 'Calculation error. Please verify dates.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <section ref={sectionRef} className="bg-background py-20 px-6 md:px-16">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Table */}
          <div className="lg:col-span-8">
            {/* Season Rates */}
            <div className="reveal mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground mb-2">
                Seasonal Rates
              </h2>
              <p className="text-muted-foreground text-sm mb-8">
                All rates are in USD per night unless otherwise noted.
              </p>

              <div className="rounded-2xl border border-border overflow-hidden card-shadow bg-card">
                {/* Table Header */}
                <div className="bg-muted/80 text-foreground grid grid-cols-6 gap-0 text-xs font-bold uppercase tracking-widest border-b border-border">
                  <div className="px-5 py-4 col-span-2">Season</div>
                  <div className="px-4 py-4">Per Night</div>
                  <div className="px-4 py-4">Weekend</div>
                  <div className="px-4 py-4">Weekly</div>
                  <div className="px-4 py-4">Monthly</div>
                </div>
                {displayedSeasons.map((row, i) => (
                  <div
                    key={i}
                    className={`rate-row grid grid-cols-6 gap-0 border-t border-border hover:bg-accent/5 transition-colors group`}
                  >
                    <div className="px-5 py-4 col-span-2">
                      <p className="font-semibold text-sm text-foreground">{row.season}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {row.dateRange || `${row.from} – ${row.to}`}
                      </p>
                    </div>
                    <div className="px-4 py-4 flex items-center">
                      <span className="font-bold text-primary text-sm">{row.perNight}</span>
                    </div>
                    <div className="px-4 py-4 flex items-center">
                      <span className="text-sm text-foreground">{row.weekendNight}</span>
                    </div>
                    <div className="px-4 py-4 flex items-center">
                      <span className="text-sm text-foreground">{row.weekly}</span>
                    </div>
                    <div className="px-4 py-4 flex items-center">
                      <span className="text-sm text-muted-foreground">{row.monthly}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fees Table */}
            <div className="reveal reveal-delay-100 mb-10">
              <h3 className="font-display text-xl font-medium text-foreground mb-5">
                Taxes & Fees
              </h3>
              <div className="rounded-2xl border border-border overflow-hidden card-shadow bg-card">
                <div className="bg-muted/80 grid grid-cols-3 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border">
                  <div className="px-5 py-4">Fee Type</div>
                  <div className="px-4 py-4">Rate</div>
                  <div className="px-4 py-4">Applied To</div>
                </div>
                {displayedFees.map((fee, i) => (
                  <div key={i} className="rate-row grid grid-cols-3 border-t border-border">
                    <div className="px-5 py-4">
                      <p className="font-semibold text-sm text-foreground">{fee.label}</p>
                    </div>
                    <div className="px-4 py-4">
                      <span className="font-bold text-accent text-sm">{fee.value}</span>
                    </div>
                    <div className="px-4 py-4">
                      <span className="text-sm text-muted-foreground">{fee.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Instant Quote */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 reveal reveal-delay-200">
              <div className="bg-card border border-border rounded-2xl p-7 card-shadow">
                <h3 className="font-display text-xl font-medium text-foreground mb-1">
                  Instant Quote
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Select your dates for an accurate rate estimate.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block mb-2">
                      Check-In
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full border border-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block mb-2">
                      Check-Out
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full border border-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors bg-background"
                    />
                  </div>

                  {calcError && (
                    <p className="text-xs text-rose-500 font-medium">{calcError}</p>
                  )}

                  <button
                    type="button"
                    onClick={computeEstimate}
                    disabled={isCalculating}
                    className="btn-primary w-full text-center flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60"
                  >
                    {isCalculating ? 'Calculating...' : 'Get Quote'}
                    <Icon name="CalculatorIcon" size={16} />
                  </button>
                </div>

                {/* Estimate / Action */}
                <div className="mt-6 pt-6 border-t border-border">
                  {estimate ? (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Nights</span>
                        <span className="font-semibold">{estimate.nights}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Subtotal</span>
                        <span className="font-semibold">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(estimate.subtotal)}
                        </span>
                      </div>

                      {estimate.charges && estimate.charges.length > 0 ? (
                        estimate.charges.map((c, i) => (
                          <div key={i} className="flex justify-between mb-2">
                            <span className="text-sm text-muted-foreground">{c.name}</span>
                            <span className="font-semibold">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                              }).format(c.amount)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Government Tax</span>
                            <span className="font-semibold">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                              }).format(estimate.tax)}
                            </span>
                          </div>
                          <div className="flex justify-between mb-4">
                            <span className="text-sm text-muted-foreground">Service Fee</span>
                            <span className="font-semibold">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                              }).format(estimate.service)}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between items-center mb-4 pt-2 border-t border-border">
                        <span className="text-sm font-semibold">Estimated Total</span>
                        <span className="text-xl font-bold text-primary">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(estimate.total)}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <a
                          href={`/book-now?checkIn=${checkIn}&checkOut=${checkOut}`}
                          className="btn-primary flex-1 inline-flex items-center justify-center gap-2 py-3"
                        >
                          Book Now
                        </a>
                        <button
                          onClick={() => setEstimate(null)}
                          className="btn-outline flex-1 py-3 cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  ) : (
                    <a
                      href="/book-now"
                      className="w-full btn-primary inline-flex items-center justify-center gap-2 py-3 text-sm"
                    >
                      Book Now
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
