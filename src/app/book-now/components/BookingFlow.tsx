'use client';

import { useEffect, useRef, useState } from 'react';
import AvailabilityCalendar from '@/app/villa-rental-rates/components/AvailabilityCalendar';
import type { AdditionalCharge, BaseRateConfig, SeasonalRule } from '@/lib/types/pricing';
import BookingForm from './BookingForm';

interface BookingFlowProps {
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAvailability?: {
    isAvailable: boolean;
    message?: string;
  };
  pricingData: {
    baseRate: BaseRateConfig | null;
    seasons: SeasonalRule[];
    charges: AdditionalCharge[];
  };
}

interface ContactInfo {
  phone: string;
  email: string;
}

export default function BookingFlow({
  initialCheckIn = '',
  initialCheckOut = '',
  initialAvailability,
  pricingData,
}: BookingFlowProps) {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [availability, setAvailability] = useState(initialAvailability ?? null);
  const [warning, setWarning] = useState(initialAvailability?.message || '');
  const [isChecking, setIsChecking] = useState(false);
  const [showForm, setShowForm] = useState(initialAvailability?.isAvailable === true);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '+1 508-633-7355',
    email: 'anguillabonthesea@gmail.com',
  });
  const checkSequence = useRef(0);
  const formRef = useRef<HTMLDivElement>(null);
  const showFloatingBookNow =
    !showForm && availability?.isAvailable && Boolean(checkIn && checkOut) && !isChecking;

  useEffect(() => {
    let active = true;
    fetch('/api/settings')
      .then((response) => response.json())
      .then((data) => {
        if (active && data.success && data.settings) {
          setContactInfo({
            phone: data.settings.contactPhone || '+1 508-633-7355',
            email: data.settings.contactEmail || 'anguillabonthesea@gmail.com',
          });
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const handleSelectDate = (date: string) => {
    const requestId = ++checkSequence.current;
    setWarning('');
    setAvailability(null);
    setShowForm(false);

    if (!checkIn || checkOut || date <= checkIn) {
      setCheckIn(date);
      setCheckOut('');
      setIsChecking(false);
      return;
    }

    setCheckOut(date);
    setIsChecking(true);
    fetch(
      `/api/availability/check?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(date)}`,
      { cache: 'no-store' }
    )
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'We could not check those dates. Please try again.');
        }
        if (requestId !== checkSequence.current) return;
        setAvailability({ isAvailable: result.isAvailable });
        if (!result.isAvailable) {
          setWarning(
            result.conflictReason ||
              'Your selected dates are already booked. Choose different dates or contact us for help.'
          );
        }
      })
      .catch((error: unknown) => {
        if (requestId !== checkSequence.current) return;
        setAvailability({ isAvailable: false });
        setWarning(
          error instanceof Error
            ? error.message
            : 'We could not check those dates. Please try again or contact us.'
        );
      })
      .finally(() => {
        if (requestId === checkSequence.current) setIsChecking(false);
      });
  };

  const handleFormConflict = (message: string) => {
    setWarning(message);
    setAvailability({ isAvailable: false });
    setShowForm(false);
  };

  const handleChangeDates = () => {
    setShowForm(false);
    setAvailability(null);
    setCheckIn('');
    setCheckOut('');
    setWarning('');
  };

  const handleBookNow = () => {
    setShowForm(true);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const phoneHref = `tel:${contactInfo.phone.replace(/[^+\d]/g, '')}`;

  return (
    <section
      className={`bg-background px-6 py-12 md:px-16 md:py-16 ${showFloatingBookNow ? 'pb-32' : ''}`}
    >
      <div className="mx-auto max-w-screen-xl">
        {showForm && availability?.isAvailable ? (
          <div ref={formRef}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                  Dates available
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {checkIn} to {checkOut}
                </p>
              </div>
              <button
                type="button"
                onClick={handleChangeDates}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Change dates
              </button>
            </div>
            <BookingForm
              initialCheckIn={checkIn}
              initialCheckOut={checkOut}
              pricingData={pricingData}
              onConflict={handleFormConflict}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {warning && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-900"
              >
                <h2 className="font-semibold">
                  {warning.toLowerCase().includes('already booked')
                    ? 'Your dates are already booked'
                    : 'We could not confirm these dates'}
                </h2>
                <p className="mt-1 text-sm">
                  {warning} Select different dates below, or contact us and we&apos;ll help with
                  your stay.
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                  <a className="underline underline-offset-2" href={phoneHref}>
                    {contactInfo.phone}
                  </a>
                  <a className="underline underline-offset-2" href={`mailto:${contactInfo.email}`}>
                    {contactInfo.email}
                  </a>
                </div>
              </div>
            )}

            {checkIn && !checkOut && !warning && (
              <p className="text-sm font-medium text-foreground">
                Check-in: {checkIn}. Now choose your check-out date.
              </p>
            )}
            {isChecking && (
              <p role="status" className="text-sm text-muted-foreground">
                Checking your selected dates...
              </p>
            )}

            <AvailabilityCalendar
              checkIn={checkIn}
              checkOut={checkOut}
              initialCheckIn={initialCheckIn}
              onSelectDate={handleSelectDate}
            />
          </div>
        )}
      </div>

      {showFloatingBookNow && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="pointer-events-auto mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-white/95 p-3 shadow-2xl backdrop-blur">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-emerald-800">Dates available</p>
              <p className="mt-0.5 truncate text-sm font-medium text-stone-900">
                {checkIn} to {checkOut}
              </p>
            </div>
            <button
              type="button"
              onClick={handleBookNow}
              className="btn-accent shrink-0 px-5 py-3 text-sm font-semibold"
            >
              Book Now
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
