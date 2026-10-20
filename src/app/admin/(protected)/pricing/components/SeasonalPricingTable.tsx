"use client";

import React from "react";
import {
  CalendarDaysIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { SeasonalRule } from "@/lib/types/pricing";

interface SeasonalPricingTableProps {
  seasons: SeasonalRule[];
  onAddSeason: () => void;
  onEditSeason: (season: SeasonalRule) => void;
  onDeleteSeason: (id: string, name: string) => void;
  onToggleActive: (season: SeasonalRule) => void;
  isLoading?: boolean;
}

export default function SeasonalPricingTable({
  seasons,
  onAddSeason,
  onEditSeason,
  onDeleteSeason,
  onToggleActive,
  isLoading,
}: SeasonalPricingTableProps) {
  const formatCurrency = (val?: number | null) => {
    if (val === null || val === undefined) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-[#F4EFE9] rounded w-1/4" />
        <div className="h-40 bg-[#F4EFE9] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F4EFE9]">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1C1917]">
            Seasonal Rates
          </h2>
          <p className="text-sm text-[#78716C] mt-1">
            All rates are in USD per night unless otherwise noted.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddSeason}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#2B2623] text-white text-xs font-semibold transition-all shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <PlusIcon className="w-4 h-4 text-[#C88A4B]" />
          <span>Add Season Rate</span>
        </button>
      </div>

      {/* Main Table */}
      {seasons.length > 0 ? (
        <div className="rounded-2xl border border-[#E7E5E4] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E7E5E4] text-[11px] font-bold uppercase tracking-wider text-[#57534E]">
                  <th className="py-4 px-6">Season</th>
                  <th className="py-4 px-5">Per Night</th>
                  <th className="py-4 px-5">Weekend</th>
                  <th className="py-4 px-5">Weekly</th>
                  <th className="py-4 px-5">Monthly</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4] text-sm">
                {seasons.map((season) => {
                  const dateLabel =
                    season.dateRange ||
                    (season.from && season.to ? `${season.from} – ${season.to}` : "") ||
                    (season.startDate && season.endDate ? `${season.startDate} – ${season.endDate}` : "");

                  const perNightVal = season.perNight ?? season.nightlyRate;

                  return (
                    <tr
                      key={season._id}
                      className="hover:bg-[#FAF8F5] transition-colors"
                    >
                      {/* Season & Date Range */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-[#1C1917] text-sm">
                          {season.name}
                        </div>
                        {dateLabel && (
                          <div className="text-xs text-[#78716C] mt-0.5">
                            {dateLabel}
                          </div>
                        )}
                        {season.minStay && (
                          <div className="text-[11px] text-[#A8A29E] mt-0.5">
                            Min. stay: {season.minStay} nights
                          </div>
                        )}
                      </td>

                      {/* Per Night */}
                      <td className="py-4 px-5 font-bold text-[#1C1917]">
                        {formatCurrency(perNightVal)}
                      </td>

                      {/* Weekend */}
                      <td className="py-4 px-5 text-[#44403C] font-normal">
                        {season.weekendNight !== undefined && season.weekendNight !== null
                          ? formatCurrency(season.weekendNight)
                          : formatCurrency(perNightVal)}
                      </td>

                      {/* Weekly */}
                      <td className="py-4 px-5 text-[#44403C] font-normal">
                        {formatCurrency(season.weekly)}
                      </td>

                      {/* Monthly */}
                      <td className="py-4 px-5 text-[#44403C] font-normal">
                        {season.monthly !== undefined && season.monthly !== null
                          ? formatCurrency(season.monthly)
                          : "—"}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleActive(season)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            season.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              season.isActive ? "bg-emerald-500" : "bg-stone-400"
                            }`}
                          />
                          <span>{season.isActive ? "Active" : "Disabled"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditSeason(season)}
                            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#C88A4B] hover:bg-[#F4EFE9] transition-colors cursor-pointer"
                            title="Edit Season"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteSeason(season._id, season.name)}
                            className="p-1.5 rounded-lg text-[#78716C] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Season"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="py-12 px-4 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#E7E5E4] text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F4EFE9] text-[#78716C] flex items-center justify-center mb-3">
            <CalendarDaysIcon className="w-6 h-6 text-[#C88A4B]" />
          </div>
          <h4 className="font-serif text-base font-semibold text-[#1C1917] mb-1">
            No seasonal rates configured
          </h4>
          <p className="text-xs text-[#78716C] max-w-sm mb-4 leading-relaxed">
            Configure Low, High, Shoulder, or Holiday Peak seasons with custom nightly, weekend, weekly, and monthly rates.
          </p>
          <button
            type="button"
            onClick={onAddSeason}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#2B2623] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <PlusIcon className="w-4 h-4 text-[#C88A4B]" />
            <span>Create First Season</span>
          </button>
        </div>
      )}
    </div>
  );
}
