"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CurrencyDollarIcon,
  ArrowPathIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  BaseRateConfig,
  SeasonalRule,
  AdditionalCharge,
  CreateSeasonDto,
  CreateChargeDto,
} from "@/lib/types/pricing";
import BaseRateCard from "./components/BaseRateCard";
import SeasonalPricingTable from "./components/SeasonalPricingTable";
import AdditionalChargesList from "./components/AdditionalChargesList";
import PriceSimulatorWidget from "./components/PriceSimulatorWidget";
import SeasonFormModal from "./components/SeasonFormModal";
import ChargeFormModal from "./components/ChargeFormModal";

export default function AdminPricingPage() {
  const [baseRate, setBaseRate] = useState<BaseRateConfig | null>(null);
  const [seasons, setSeasons] = useState<SeasonalRule[]>([]);
  const [charges, setCharges] = useState<AdditionalCharge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modals state
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<SeasonalRule | null>(null);

  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<AdditionalCharge | null>(null);

  // Delete confirm modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "season" | "charge";
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification helper
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch all pricing data
  const fetchPricingData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/pricing");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load pricing configurations");

      if (data.data) {
        setBaseRate(data.data.baseRate);
        setSeasons(data.data.seasons || data.data.seasonalRules || []);
        setCharges(data.data.charges || data.data.additionalCharges || []);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error fetching rates", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPricingData();
  }, [fetchPricingData]);

  // Base rate update handler
  const handleUpdateBaseRate = async (updates: Partial<BaseRateConfig>) => {
    const res = await fetch("/api/admin/pricing/base", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update base rate");

    setBaseRate(data.data);
    showToast("Base rates and villa minimum stay saved successfully.");
  };

  // Seasonal Rules Handlers
  const handleOpenAddSeason = () => {
    setEditingSeason(null);
    setIsSeasonModalOpen(true);
  };

  const handleOpenEditSeason = (season: SeasonalRule) => {
    setEditingSeason(season);
    setIsSeasonModalOpen(true);
  };

  const handleSaveSeason = async (dto: CreateSeasonDto) => {
    if (editingSeason) {
      // PATCH
      const res = await fetch(`/api/admin/pricing/seasons/${editingSeason._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update season");

      showToast(`Seasonal tier "${dto.name}" updated successfully.`);
    } else {
      // POST
      const res = await fetch("/api/admin/pricing/seasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create season");

      showToast(`Seasonal tier "${dto.name}" created successfully.`);
    }
    await fetchPricingData();
  };

  const handleToggleSeasonActive = async (season: SeasonalRule) => {
    try {
      const res = await fetch(`/api/admin/pricing/seasons/${season._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !season.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setSeasons((prev) =>
        prev.map((s) => (s._id === season._id ? { ...s, isActive: !season.isActive } : s))
      );
      showToast(
        `Seasonal tier "${season.name}" is now ${!season.isActive ? "active" : "inactive"}.`
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error updating status", "error");
    }
  };

  // Additional Charges Handlers
  const handleOpenAddCharge = () => {
    setEditingCharge(null);
    setIsChargeModalOpen(true);
  };

  const handleOpenEditCharge = (charge: AdditionalCharge) => {
    setEditingCharge(charge);
    setIsChargeModalOpen(true);
  };

  const handleSaveCharge = async (dto: CreateChargeDto) => {
    if (editingCharge) {
      // PATCH
      const res = await fetch(`/api/admin/pricing/charges/${editingCharge._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update charge");

      showToast(`Charge "${dto.name}" updated successfully.`);
    } else {
      // POST
      const res = await fetch("/api/admin/pricing/charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create charge");

      showToast(`Charge "${dto.name}" added successfully.`);
    }
    await fetchPricingData();
  };

  const handleToggleChargeActive = async (charge: AdditionalCharge) => {
    try {
      const res = await fetch(`/api/admin/pricing/charges/${charge._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !charge.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setCharges((prev) =>
        prev.map((c) => (c._id === charge._id ? { ...c, isActive: !charge.isActive } : c))
      );
      showToast(
        `Charge "${charge.name}" is now ${!charge.isActive ? "active" : "inactive"}.`
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error updating status", "error");
    }
  };

  // Delete Confirmations
  const confirmDelete = (type: "season" | "charge", id: string, name: string) => {
    setDeleteTarget({ type, id, name });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const endpoint =
        deleteTarget.type === "season"
          ? `/api/admin/pricing/seasons/${deleteTarget.id}`
          : `/api/admin/pricing/charges/${deleteTarget.id}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete request failed");

      showToast(`${deleteTarget.type === "season" ? "Season" : "Charge"} deleted successfully.`);
      setDeleteTarget(null);
      await fetchPricingData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error during deletion", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-medium transition-all animate-slide-up ${
            toastMessage.type === "success"
              ? "bg-emerald-950 text-emerald-100 border-emerald-800"
              : "bg-rose-950 text-rose-100 border-rose-800"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#78716C] mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#C88A4B] font-semibold">Pricing & Rates</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
              Rates & Pricing Control
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#F4EFE9] text-[#C88A4B] border border-[#E7E5E4]">
              USD ($)
            </span>
          </div>
          <p className="text-sm text-[#78716C] mt-1 max-w-2xl">
            Configure standard base rates, seasonal surge rules, mandatory fees, and test
            live price simulations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPricingData()}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-stone-700 text-xs font-bold hover:bg-[#F4EFE9] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <ArrowPathIcon
              className={`w-4 h-4 text-[#C88A4B] ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh Rates</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls (Base + Seasonal + Charges) | Right Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Management Sections */}
        <div className="lg:col-span-8 space-y-8">
          {/* Base Rate Card */}
          <BaseRateCard
            baseRate={baseRate}
            onUpdateBaseRate={handleUpdateBaseRate}
            isLoading={isLoading}
          />

          {/* Seasonal Pricing Rules */}
          <SeasonalPricingTable
            seasons={seasons}
            onAddSeason={handleOpenAddSeason}
            onEditSeason={handleOpenEditSeason}
            onDeleteSeason={(id, name) => confirmDelete("season", id, name)}
            onToggleActive={handleToggleSeasonActive}
            isLoading={isLoading}
          />

          {/* Additional Charges / Fees */}
          <AdditionalChargesList
            charges={charges}
            onAddCharge={handleOpenAddCharge}
            onEditCharge={handleOpenEditCharge}
            onDeleteCharge={(id, name) => confirmDelete("charge", id, name)}
            onToggleActive={handleToggleChargeActive}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column: Simulator Widget & Rate Strategy Info */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <PriceSimulatorWidget />

          {/* Pricing Policy Card */}
          <div className="bg-gradient-to-br from-[#F4EFE9]/70 to-[#FAF6F0] rounded-3xl border border-[#E7E5E4] p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#C88A4B]">
              <SparklesIcon className="w-5 h-5 shrink-0" />
              <h4 className="font-serif text-sm font-bold text-[#1C1917]">
                Pricing Strategy Guidelines
              </h4>
            </div>
            <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-[#C88A4B] font-bold">•</span>
                <span>
                  <strong>Priority Hierarchy:</strong> Seasonal rules automatically take precedence over the base rate for each individual calendar night.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#C88A4B] font-bold">•</span>
                <span>
                  <strong>Collision Prevention:</strong> The system automatically prohibits creating overlapping seasonal tiers to avoid conflicting nightly quotes.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#C88A4B] font-bold">•</span>
                <span>
                  <strong>Tax & Surcharges:</strong> Additional percentage fees (e.g. Tourism tax) are applied after the stay subtotal is calculated.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Season Form Modal */}
      <SeasonFormModal
        isOpen={isSeasonModalOpen}
        onClose={() => setIsSeasonModalOpen(false)}
        onSubmit={handleSaveSeason}
        editingSeason={editingSeason}
      />

      {/* Charge Form Modal */}
      <ChargeFormModal
        isOpen={isChargeModalOpen}
        onClose={() => setIsChargeModalOpen(false)}
        onSubmit={handleSaveCharge}
        editingCharge={editingCharge}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white rounded-3xl max-w-md w-full border border-[#E7E5E4] shadow-2xl overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#F4EFE9] flex items-center justify-between bg-gradient-to-r from-stone-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <TrashIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                    Delete {deleteTarget.type === "season" ? "Seasonal Tier" : "Charge"}?
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Permanent rule removal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-[#F4EFE9] transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                Are you sure you want to permanently remove{" "}
                <strong className="text-stone-900 font-semibold">
                  &ldquo;{deleteTarget.name}&rdquo;
                </strong>
                ? Future quote calculations will no longer apply this rule.
              </p>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
