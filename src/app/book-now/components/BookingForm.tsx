'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import type { AdditionalCharge, BaseRateConfig, SeasonalRule } from '@/lib/types/pricing';

interface BookingFormProps {
  initialCheckIn?: string;
  initialCheckOut?: string;
  onConflict?: (message: string) => void;
  pricingData: {
    baseRate: BaseRateConfig | null;
    seasons: SeasonalRule[];
    charges: AdditionalCharge[];
  };
}

export default function BookingForm({
  initialCheckIn = '',
  initialCheckOut = '',
  onConflict,
  pricingData,
}: BookingFormProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    checkIn: initialCheckIn,
    checkOut: initialCheckOut,
    guests: '2',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState({
    phone: '+1 508-633-7355',
    email: 'anguillabonthesea@gmail.com',
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: pricingData.baseRate?.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount);

  const getSeasonDateRange = (season: SeasonalRule) =>
    season.dateRange ||
    (season.from && season.to ? `${season.from} – ${season.to}` : '') ||
    (season.startDate && season.endDate ? `${season.startDate} – ${season.endDate}` : '');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setContactInfo({
            phone: data.settings.contactPhone || '+1 508-633-7355',
            email: data.settings.contactEmail || 'anguillabonthesea@gmail.com',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    if (form.checkIn && form.checkOut && form.checkOut <= form.checkIn) {
      setErrorMsg('Check-out date must be strictly after check-in date.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          checkIn: form.checkIn || undefined,
          checkOut: form.checkOut || undefined,
          guests: Number(form.guests) || 2,
          subject: `Villa Stay Inquiry: ${form.name} (${form.checkIn || 'Dates TBD'})`,
          message:
            form.message ||
            `Quote request for ${form.guests} guests from ${form.checkIn} to ${form.checkOut}.`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.conflict) {
          onConflict?.(data.error || 'Your selected dates are no longer available.');
          return;
        }
        throw new Error(data.error || 'Failed to submit inquiry. Please try again.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-background py-16 px-6 md:px-16 pb-24">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="bg-card border border-border rounded-3xl p-12 text-center card-shadow">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Icon name="CheckCircleIcon" size={32} className="text-primary" />
                </div>
                <h2 className="font-display text-2xl font-medium text-foreground mb-3">
                  Inquiry Received!
                </h2>
                <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  Thank you for your interest in Villa B on the Sea. Our concierge team will contact
                  you within 24 hours with availability and a personalized quote.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Questions? Call us at{' '}
                  <a
                    href={`tel:${contactInfo.phone.replace(/[^+\d]/g, '')}`}
                    className="text-primary font-semibold"
                  >
                    {contactInfo.phone}
                  </a>
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white border border-stone-200 rounded-3xl p-8 md:p-10 shadow-sm"
              >
                <h2 className="font-display text-2xl font-semibold text-stone-900 mb-2">
                  Request a Quote
                </h2>
                <p className="text-stone-600 text-sm mb-8">
                  Fill in your details and we&apos;ll get back to you within 24 hours.
                </p>

                {errorMsg && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-stone-700 block mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white transition-colors bg-white"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-stone-700 block mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white transition-colors bg-white"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-stone-700 block mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white transition-colors bg-white"
                    />
                  </div>

                  {/* Check In */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block mb-2">
                      Check-In Date *
                    </label>
                    <input
                      type="date"
                      name="checkIn"
                      value={form.checkIn}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors bg-background"
                    />
                  </div>

                  {/* Check Out */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block mb-2">
                      Check-Out Date *
                    </label>
                    <input
                      type="date"
                      name="checkOut"
                      value={form.checkOut}
                      onChange={handleChange}
                      required
                      min={form.checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full border border-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors bg-background"
                    />
                  </div>

                  {/* Guests */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block mb-2">
                      Number of Guests
                    </label>
                    <select
                      name="guests"
                      value={form.guests}
                      onChange={handleChange}
                      className="w-full border border-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors bg-background"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>
                          {n} guest{n > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block mb-2">
                      Special Requests or Questions
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell us about any special requests, dietary needs, or questions about the villa..."
                      className="w-full border border-input rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors bg-background resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-accent w-full mt-6 flex items-center justify-center gap-2 text-base disabled:opacity-60"
                >
                  {submitting ? 'Sending Request...' : 'Get Quote'}
                  <Icon name="ArrowRightIcon" size={18} />
                </button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  We respond within 24 hours. No booking fees.
                </p>
              </form>
            )}
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-5 space-y-5">
            {/* Why Book Direct */}
            <div className="bg-card border border-border rounded-2xl p-7 card-shadow">
              <h3 className="font-semibold text-foreground mb-5">Why Book Direct?</h3>
              <ul className="space-y-3">
                {[
                  'Best available rate — no agency markup',
                  'Direct contact with villa owner',
                  'Personalized concierge planning',
                  'Flexible payment arrangements',
                  'Local insider tips & restaurant bookings',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Icon
                      name="CheckCircleIcon"
                      size={16}
                      className="text-accent mt-0.5 flex-shrink-0"
                    />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rate Summary */}
            <div className="bg-muted border border-border rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Rates & Fees
              </p>
              {pricingData.baseRate || pricingData.seasons.length > 0 ? (
                <div className="space-y-3">
                  {pricingData.baseRate && (
                    <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                      <span className="text-xs text-muted-foreground">Standard nightly rate</span>
                      <span className="shrink-0 text-xs font-bold text-primary">
                        {formatCurrency(pricingData.baseRate.nightlyRate)} / night
                      </span>
                    </div>
                  )}
                  {pricingData.seasons.map((season) => {
                    const nightlyRate = season.perNight ?? season.nightlyRate;
                    const secondaryRates = [
                      season.weekendNight != null
                        ? `Weekend ${formatCurrency(season.weekendNight)}`
                        : '',
                      season.weekly != null ? `Weekly ${formatCurrency(season.weekly)}` : '',
                      season.monthly != null ? `Monthly ${formatCurrency(season.monthly)}` : '',
                    ].filter(Boolean);

                    return (
                      <div
                        key={season._id}
                        className="border-b border-border pb-2 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground">{season.name}</p>
                            {getSeasonDateRange(season) && (
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {getSeasonDateRange(season)}
                              </p>
                            )}
                          </div>
                          <span className="shrink-0 text-xs font-bold text-primary">
                            {formatCurrency(nightlyRate)} / night
                          </span>
                        </div>
                        {secondaryRates.length > 0 && (
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {secondaryRates.join(' · ')}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {pricingData.charges.length > 0 && (
                    <div className="space-y-1 border-t border-border pt-2">
                      {pricingData.charges.map((charge) => (
                        <div key={charge._id} className="flex justify-between gap-3 text-[11px]">
                          <span className="text-muted-foreground">{charge.name}</span>
                          <span className="shrink-0 font-semibold text-foreground">
                            {charge.type === 'percentage'
                              ? `${charge.amount}%`
                              : formatCurrency(charge.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Rates are temporarily unavailable. Contact us for a current quote.
                </p>
              )}
            </div>

            {/* Contact Card */}
            <div className="bg-primary rounded-2xl p-7 text-white">
              <h3 className="font-display text-xl font-medium mb-5">Contact Us Directly</h3>
              <div className="space-y-4">
                <a
                  href={`tel:${contactInfo.phone.replace(/[^+\d]/g, '')}`}
                  className="flex items-center gap-4 text-white/80 hover:text-white transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="PhoneIcon" size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-widest">Phone</p>
                    <p className="font-semibold text-sm">{contactInfo.phone}</p>
                  </div>
                </a>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-4 text-white/80 hover:text-white transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="EnvelopeIcon" size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-widest">Email</p>
                    <p className="font-semibold text-sm">{contactInfo.email}</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 text-white/80">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="UserIcon" size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-widest">Host</p>
                    <p className="font-semibold text-sm">David H Barrett</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
