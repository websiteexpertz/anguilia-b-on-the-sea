"use client";

import React, { useState } from "react";
import {
  CalculatorIcon,
  SparklesIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { PricingCalculationResult } from "@/lib/types/pricing";

export default function PriceSimulatorWidget() {
  const today = new Date();
  const dIn = new Date();
  dIn.setDate(today.getDate() + 14);
  const dOut = new Date();
  dOut.setDate(today.getDate() + 19);

  const [checkIn, setCheckIn] = useState(dIn.toISOString().split("T")[0]);
  const [checkOut, setCheckOut] = useState(dOut.toISOString().split("T")[0]);
  const [guests, setGuests] = useState(4);

  const [quote, setQuote] = useState<PricingCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (checkOut <= checkIn) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/pricing/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkIn, checkOut, guests }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Calculation failed");

      setQuote(data.quote);
    } catch (err: any) {
      setError(err?.message || "Failed to calculate pricing quote.");
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-7 shadow-sm space-y-5">
      {/* Header */}
      <div className="pb-4 border-b border-[#F4EFE9]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#F4EFE9] text-[#1C1917] flex items-center justify-center">
            <CalculatorIcon className="w-6 h-6 text-[#C88A4B]" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C88A4B] block">
              Live Testing Engine
            </span>
            <h3 className="font-serif text-lg font-bold text-[#1C1917]">
              Rate & Quote Simulator
            </h3>
          </div>
        </div>
        <p className="text-xs text-[#78716C] mt-1">
          Simulate check-in dates and guest counts to test your seasonal pricing rules and checkout taxes
        </p>
      </div>

      {/* Simulator Inputs */}
      <form onSubmit={handleCalculate} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
          >
            <ExclamationCircleIcon className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-[#44403C] mb-1">
              Check-In Date
            </label>
            <input
              type="date"
              required
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full rounded-xl border border-[#D8D2C6] bg-[#FDFBF7]/60 px-3 py-2 text-xs text-[#1C1917] focus:bg-white focus:border-[#C88A4B] focus:ring-2 focus:ring-[#C88A4B]/20 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#44403C] mb-1">
              Check-Out Date
            </label>
            <input
              type="date"
              required
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded-xl border border-[#D8D2C6] bg-[#FDFBF7]/60 px-3 py-2 text-xs text-[#1C1917] focus:bg-white focus:border-[#C88A4B] focus:ring-2 focus:ring-[#C88A4B]/20 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#44403C] mb-1">
              Number of Guests
            </label>
            <input
              type="number"
              min="1"
              max="14"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value, 10) || 1)}
              className="w-full rounded-xl border border-[#D8D2C6] bg-[#FDFBF7]/60 px-3 py-2 text-xs text-[#1C1917] focus:bg-white focus:border-[#C88A4B] focus:ring-2 focus:ring-[#C88A4B]/20 outline-none transition-all"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isCalculating}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1C1917] hover:bg-[#2B2623] text-white text-xs font-semibold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <SparklesIcon className="w-4 h-4 text-[#C88A4B]" />
              <span>{isCalculating ? "Calculating..." : "Calculate Quote"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Quote Breakdown Result */}
      {quote && (
        <div className="pt-4 border-t border-[#F4EFE9] space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E7E5E4]">
              <p className="text-[10px] uppercase tracking-wider text-[#78716C] font-semibold">
                Nights / Average Rate
              </p>
              <p className="font-serif text-lg font-bold text-[#1C1917]">
                {quote.nights} Nights &bull; {formatCurrency(quote.averageNightlyRate)}
              </p>
              <p className="text-[10px] text-[#78716C]">average per night</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E7E5E4]">
              <p className="text-[10px] uppercase tracking-wider text-[#78716C] font-semibold">
                Lodging Subtotal
              </p>
              <p className="font-serif text-lg font-bold text-[#1C1917]">
                {formatCurrency(quote.subtotal)}
              </p>
              <p className="text-[10px] text-[#78716C]">base & seasonal rates</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1C1917] text-white border border-[#1C1917]">
              <p className="text-[10px] uppercase tracking-wider text-[#C88A4B] font-semibold">
                Estimated Grand Total
              </p>
              <p className="font-serif text-2xl font-bold text-[#C88A4B]">
                {formatCurrency(quote.grandTotal)}
              </p>
              <p className="text-[10px] text-[#A8A29E]">all taxes & fees included</p>
            </div>
          </div>

          {/* Nightly breakdown tags */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C]">
              Nightly Rate Application
            </p>
            <div className="flex flex-wrap gap-2">
              {quote.nightlyBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-[#FDFBF7] border border-[#E7E5E4] text-[11px] flex items-center gap-1.5"
                >
                  <span className="text-[#78716C]">{item.date}:</span>
                  <span className="font-bold text-[#1C1917]">
                    {formatCurrency(item.rate)}
                  </span>
                  {item.seasonName && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-[#C88A4B]/20 text-[#C88A4B]">
                      {item.seasonName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Charges Breakdown */}
          {quote.chargesBreakdown.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-[#F4EFE9]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C]">
                Calculated Taxes & Fees
              </p>
              <div className="space-y-1 text-xs">
                {quote.chargesBreakdown.map((ch) => (
                  <div
                    key={ch.id}
                    className="flex items-center justify-between text-[#44403C]"
                  >
                    <span>
                      {ch.name} (
                      {ch.type === "percentage"
                        ? `${ch.rateValue}%`
                        : ch.type === "per_night"
                        ? `$${ch.rateValue}/nt`
                        : ch.type === "per_guest"
                        ? `$${ch.rateValue}/guest`
                        : "flat"}
                      ):
                    </span>
                    <span className="font-semibold text-[#1C1917]">
                      {formatCurrency(ch.calculatedAmount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
