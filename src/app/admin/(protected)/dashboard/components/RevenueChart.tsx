"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CurrencyDollarIcon,
  CalendarDaysIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { RevenueDataPoint } from "@/lib/types/dashboard";

interface RevenueChartProps {
  totalRevenue: number;
  dataPoints: RevenueDataPoint[];
  currentPeriod: "7d" | "30d" | "90d" | "1y";
  onPeriodChange: (period: "7d" | "30d" | "90d" | "1y") => void;
  isLoading?: boolean;
}

export default function RevenueChart({
  totalRevenue,
  dataPoints,
  currentPeriod,
  onPeriodChange,
  isLoading,
}: RevenueChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<RevenueDataPoint | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const periodOptions: Array<{ id: "7d" | "30d" | "90d" | "1y"; label: string }> = [
    { id: "7d", label: "7 Days" },
    { id: "30d", label: "30 Days" },
    { id: "90d", label: "90 Days" },
    { id: "1y", label: "1 Year" },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-sm animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-36 h-6 bg-[#F4EFE9] rounded" />
          <div className="w-48 h-8 bg-[#F4EFE9] rounded-lg" />
        </div>
        <div className="w-full h-56 bg-[#F4EFE9] rounded-xl" />
      </div>
    );
  }

  const hasData = totalRevenue > 0 && dataPoints.length > 0;
  const maxAmount = hasData
    ? Math.max(...dataPoints.map((p) => p.amount), 1000)
    : 1000;

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-sm">
      {/* Header with Title & Period Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1C1917]">
              Revenue Overview
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
          <p className="text-xs text-[#78716C]">
            Confirmed reservation receipts across selected period
          </p>
        </div>

        {/* Period toggle */}
        <div className="inline-flex p-1 bg-[#F4EFE9] rounded-xl border border-[#E7E5E4] self-start sm:self-auto">
          {periodOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onPeriodChange(opt.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentPeriod === opt.id
                  ? "bg-white text-[#1C1917] shadow-sm"
                  : "text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Area */}
      {hasData ? (
        <div className="relative">
          {/* Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-0 right-4 z-10 bg-[#1C1917] text-white text-xs px-3 py-1.5 rounded-lg shadow-lg border border-[#C88A4B]/40 flex items-center gap-2">
              <span className="text-[#A8A29E]">{hoveredPoint.label}:</span>
              <span className="font-semibold text-[#C88A4B]">
                {formatCurrency(hoveredPoint.amount)}
              </span>
            </div>
          )}

          {/* SVG Bar / Area visualization */}
          <div className="h-60 w-full flex items-end gap-2 pt-6 pb-2">
            {dataPoints.map((point, index) => {
              const heightPercent = Math.max(
                (point.amount / maxAmount) * 100,
                6
              );

              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="flex-1 h-full flex flex-col items-center justify-end group cursor-pointer"
                >
                  <div className="w-full max-w-[28px] h-full flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-t-md bg-gradient-to-t from-[#1C1917] to-[#C88A4B] group-hover:from-[#C88A4B] group-hover:to-[#D49E64] transition-all relative shadow-sm"
                    />
                  </div>
                  <span className="text-[10px] text-[#78716C] group-hover:text-[#1C1917] font-medium mt-2 truncate w-full text-center">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="py-12 px-4 rounded-xl bg-[#FDFBF7] border border-dashed border-[#E7E5E4] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F4EFE9] text-[#78716C] flex items-center justify-center mb-3">
            <CurrencyDollarIcon className="w-6 h-6 text-[#C88A4B]" />
          </div>
          <h4 className="font-serif text-base font-semibold text-[#1C1917] mb-1">
            No revenue recorded for this period
          </h4>
          <p className="text-xs text-[#78716C] max-w-sm mb-4 leading-relaxed">
            Confirmed guest bookings with paid deposits will automatically plot here over time.
          </p>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C1917] hover:bg-[#2B2623] text-white text-xs font-semibold transition-all shadow-sm"
          >
            <PlusIcon className="w-4 h-4 text-[#C88A4B]" />
            <span>Create First Booking</span>
          </Link>
        </div>
      )}
    </div>
  );
}
