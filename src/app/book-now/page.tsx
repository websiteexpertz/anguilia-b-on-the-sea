import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookNowHero from '@/app/book-now/components/BookNowHero';
import BookingFlow from '@/app/book-now/components/BookingFlow';

import { listGalleryItems } from '@/lib/db/services/galleryService';
import { checkInquiryAvailability } from '@/lib/db/services/inquiryService';
import {
  getBaseRate,
  listAdditionalCharges,
  listSeasonalRules,
} from '@/lib/db/services/pricingService';
import type { AdditionalCharge, BaseRateConfig, SeasonalRule } from '@/lib/types/pricing';

export const dynamic = 'force-dynamic';

type BookNowSearchParams = Promise<{
  checkIn?: string | string[];
  checkOut?: string | string[];
}>;

function getSingleDate(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value : '';
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export default async function BookNowPage({ searchParams }: { searchParams: BookNowSearchParams }) {
  const params = await searchParams;
  const checkIn = getSingleDate(params.checkIn);
  const checkOut = getSingleDate(params.checkOut);
  const today = new Date().toISOString().slice(0, 10);
  const hasValidDateRange =
    isValidDate(checkIn) && isValidDate(checkOut) && checkIn >= today && checkOut > checkIn;
  let initialAvailability: { isAvailable: boolean; message?: string } | undefined;

  if (checkIn || checkOut) {
    if (!hasValidDateRange) {
      initialAvailability = {
        isAvailable: false,
        message: 'Please choose valid future check-in and check-out dates.',
      };
    } else {
      try {
        const result = await checkInquiryAvailability(checkIn, checkOut);
        initialAvailability = {
          isAvailable: result.isAvailable,
          message: result.isAvailable
            ? undefined
            : 'Your selected dates are already booked. Choose different dates or contact us for help.',
        };
      } catch (error) {
        console.error('Could not validate dates for the booking page:', error);
        initialAvailability = {
          isAvailable: false,
          message:
            'We could not verify those dates right now. Please select dates below or contact us.',
        };
      }
    }
  }

  let pricingData: {
    baseRate: BaseRateConfig | null;
    seasons: SeasonalRule[];
    charges: AdditionalCharge[];
  } = { baseRate: null, seasons: [], charges: [] };
  try {
    const [baseRate, seasons, charges] = await Promise.all([
      getBaseRate(),
      listSeasonalRules(),
      listAdditionalCharges(),
    ]);
    pricingData = {
      baseRate,
      seasons: seasons.filter((season) => season.isActive),
      charges: charges.filter((charge) => charge.isActive),
    };
  } catch (error) {
    console.error('Could not load database pricing for the booking page:', error);
  }

  let heroImage: string | undefined;
  try {
    const items = await listGalleryItems({ status: 'active' });
    const match =
      items.find((i) => i.section === 'entertainment_deck') ||
      items.find((i) => i.section === 'villa_exterior') ||
      items[0];
    heroImage = match?.url;
  } catch (err) {
    console.warn('Failed to load hero image for book-now:', err);
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <BookNowHero image={heroImage} />
      <BookingFlow
        initialCheckIn={hasValidDateRange ? checkIn : ''}
        initialCheckOut={hasValidDateRange ? checkOut : ''}
        initialAvailability={initialAvailability}
        pricingData={pricingData}
      />
      <Footer />
    </main>
  );
}
