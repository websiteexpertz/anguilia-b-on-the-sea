import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RatesHero from '@/app/villa-rental-rates/components/RatesHero';
import RatesTable from '@/app/villa-rental-rates/components/RatesTable';
import PoliciesSection from '@/app/villa-rental-rates/components/PoliciesSection';
import { listSeasonalRules, listAdditionalCharges } from '@/lib/db/services/pricingService';
import { listGalleryItems } from '@/lib/db/services/galleryService';

export const dynamic = 'force-dynamic';

export default async function VillaRentalRatesPage() {
  const [seasons, charges, galleryItems] = await Promise.all([
    listSeasonalRules().catch(() => []),
    listAdditionalCharges().catch(() => []),
    listGalleryItems({ status: 'active' }).catch(() => []),
  ]);

  const heroImage =
    galleryItems.find((i) => i.section === 'villa_exterior')?.url ||
    galleryItems.find((i) => i.section === 'entertainment_deck')?.url ||
    galleryItems[0]?.url;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <RatesHero image={heroImage} />
      <RatesTable initialSeasons={seasons} initialCharges={charges} />
      <PoliciesSection />
      <Footer />
    </main>
  );
}
