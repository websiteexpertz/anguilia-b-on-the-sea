"use client";

import React from "react";
import {
  TagIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { AdditionalCharge } from "@/lib/types/pricing";

interface AdditionalChargesListProps {
  charges: AdditionalCharge[];
  onAddCharge: () => void;
  onEditCharge: (charge: AdditionalCharge) => void;
  onDeleteCharge: (id: string, name: string) => void;
  onToggleActive: (charge: AdditionalCharge) => void;
  isLoading?: boolean;
}

export default function AdditionalChargesList({
  charges,
  onAddCharge,
  onEditCharge,
  onDeleteCharge,
  onToggleActive,
  isLoading,
}: AdditionalChargesListProps) {
  const formatRate = (charge: AdditionalCharge) => {
    if (charge.type === "percentage") {
      return `${charge.amount}%`;
    }
    return `$${charge.amount}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-[#F4EFE9] rounded w-1/4" />
        <div className="h-32 bg-[#F4EFE9] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F4EFE9]">
        <div>
          <h3 className="font-serif text-2xl md:text-3xl font-normal text-[#1C1917]">
            Taxes & Fees
          </h3>
          <p className="text-sm text-[#78716C] mt-1">
            Mandatory taxes and service fees applied to bookings.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddCharge}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#2B2623] text-white text-xs font-semibold transition-all shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <PlusIcon className="w-4 h-4 text-[#C88A4B]" />
          <span>Add Fee / Tax</span>
        </button>
      </div>

      {/* Main Table */}
      {charges.length > 0 ? (
        <div className="rounded-2xl border border-[#E7E5E4] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E7E5E4] text-[11px] font-bold uppercase tracking-wider text-[#57534E]">
                  <th className="py-4 px-6">Fee Type</th>
                  <th className="py-4 px-6">Rate</th>
                  <th className="py-4 px-6">Applied To</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4] text-sm">
                {charges.map((charge) => {
                  const appliedToText =
                    charge.appliedTo ||
                    (charge.type === "percentage"
                      ? "Applied to total rental"
                      : charge.type === "per_night"
                      ? "Per night"
                      : "Applied once per stay");

                  return (
                    <tr
                      key={charge._id}
                      className="hover:bg-[#FAF8F5] transition-colors"
                    >
                      {/* Fee Type */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-[#1C1917]">
                          {charge.name}
                        </div>
                        {charge.description && (
                          <div className="text-xs text-[#78716C] mt-0.5 max-w-sm">
                            {charge.description}
                          </div>
                        )}
                      </td>

                      {/* Rate */}
                      <td className="py-4 px-6 font-bold text-[#1C1917]">
                        {formatRate(charge)}
                      </td>

                      {/* Applied To */}
                      <td className="py-4 px-6 text-[#57534E] text-sm font-normal">
                        {appliedToText}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleActive(charge)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            charge.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              charge.isActive ? "bg-emerald-500" : "bg-stone-400"
                            }`}
                          />
                          <span>{charge.isActive ? "Active" : "Disabled"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditCharge(charge)}
                            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#C88A4B] hover:bg-[#F4EFE9] transition-colors cursor-pointer"
                            title="Edit Charge"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCharge(charge._id, charge.name)}
                            className="p-1.5 rounded-lg text-[#78716C] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Charge"
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
        <div className="py-10 px-4 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#E7E5E4] text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F4EFE9] text-[#78716C] flex items-center justify-center mb-3">
            <TagIcon className="w-6 h-6 text-[#C88A4B]" />
          </div>
          <h4 className="font-serif text-base font-semibold text-[#1C1917] mb-1">
            No taxes or fees configured
          </h4>
          <p className="text-xs text-[#78716C] max-w-sm mb-4 leading-relaxed">
            Configure standard island tourism taxes and service charges.
          </p>
          <button
            type="button"
            onClick={onAddCharge}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#2B2623] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <PlusIcon className="w-4 h-4 text-[#C88A4B]" />
            <span>Add First Fee</span>
          </button>
        </div>
      )}
    </div>
  );
}
