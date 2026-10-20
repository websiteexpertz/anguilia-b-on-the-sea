"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CurrencyDollarIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { BaseRateConfig } from "@/lib/types/pricing";

interface BaseRateCardProps {
  baseRate: BaseRateConfig | null;
  onUpdateBaseRate: (data: Partial<BaseRateConfig>) => Promise<void>;
  isLoading?: boolean;
}

export default function BaseRateCard({
  baseRate,
  onUpdateBaseRate,
  isLoading,
}: BaseRateCardProps) {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [villaName, setVillaName] = useState("");
  const [nightlyRate, setNightlyRate] = useState(2500);
  const [minStay, setMinStay] = useState(3);
  const [currency, setCurrency] = useState("USD");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openEdit = () => {
    if (baseRate) {
      setVillaName(baseRate.villaName);
      setNightlyRate(baseRate.nightlyRate);
      setMinStay(baseRate.minStay);
      setCurrency(baseRate.currency);
    }
    setError(null);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nightlyRate < 0) {
      setError("Nightly rate cannot be negative.");
      return;
    }
    if (minStay < 1) {
      setError("Minimum stay must be at least 1 night.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onUpdateBaseRate({
        villaName,
        nightlyRate,
        minStay,
        currency,
      });
      setIsEditing(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update base rate."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-[#E7E5E4] shadow-sm animate-pulse">
        <div className="h-6 w-36 bg-stone-200 rounded-lg mb-4" />
        <div className="h-10 w-48 bg-stone-100 rounded-xl" />
      </div>
    );
  }

  if (!baseRate) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 lg:p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4EFE9]/40 rounded-full blur-3xl -z-1 pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F4EFE9]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C88A4B]" />
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#78716C]">
              Global Base Rate
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1C1917]">
            Standard Pricing Setup
          </h2>
          <p className="text-xs text-[#78716C] mt-1">
            Default pricing applies to dates not covered by custom seasonal rules.
          </p>
        </div>

        <button
          type="button"
          onClick={openEdit}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#2B2623] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <PencilSquareIcon className="w-4 h-4" />
          <span>Edit Base Tariff</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#F4EFE9]">
          <span className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider">
            Nightly Rate
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl lg:text-3xl font-bold font-serif text-[#1C1917]">
              ${baseRate.nightlyRate.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-[#78716C]">
              {baseRate.currency} / night
            </span>
          </div>
          <p className="text-[10px] text-[#78716C] mt-2">
            Applies year-round unless season rule overrides
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#F4EFE9]">
          <span className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider">
            Minimum Stay
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl lg:text-3xl font-bold font-serif text-[#1C1917]">
              {baseRate.minStay}
            </span>
            <span className="text-xs font-medium text-[#78716C]">
              nights minimum
            </span>
          </div>
          <p className="text-[10px] text-[#78716C] mt-2">
            Base booking duration threshold
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#F4EFE9] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#E7E5E4] flex items-center justify-center shrink-0 text-[#C88A4B] shadow-sm">
            <CurrencyDollarIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#78716C]">
              Active Listing
            </span>
            <p className="font-semibold text-sm text-[#1C1917] truncate mt-1">
              {baseRate.villaName}
            </p>
            <p className="text-[10px] text-[#78716C] mt-1 flex items-center gap-1">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full estate access</span>
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal (Luxury Styled & Portalled) */}
      {isEditing && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsEditing(false);
            }}
            aria-label="Close modal"
            className="fixed inset-0"
          />

          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-[#E7E5E4] shadow-2xl overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#F4EFE9] flex items-center justify-between bg-gradient-to-r from-stone-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F4EFE9] text-[#C88A4B] flex items-center justify-center shrink-0">
                  <CurrencyDollarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                    Edit Base Villa Pricing
                  </h3>
                  <p className="text-xs text-stone-500">
                    Configure default nightly tariff & stay rules
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-[#F4EFE9] transition-colors"
                aria-label="Close dialog"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs"
                >
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Villa / Property Name
                </label>
                <input
                  type="text"
                  required
                  value={villaName}
                  onChange={(e) => setVillaName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Nightly Rate (USD) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={nightlyRate}
                    onChange={(e) => setNightlyRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Minimum Stay (Nights) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minStay}
                    onChange={(e) => setMinStay(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#C88A4B] hover:bg-[#B3783E] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Base Rate"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
