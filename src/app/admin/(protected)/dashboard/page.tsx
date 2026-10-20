"use client";

import React, { useState, useEffect, useCallback } from "react";
import SummaryCards from "./components/SummaryCards";
import QuickActions from "./components/QuickActions";
import RevenueChart from "./components/RevenueChart";
import BookingOverview from "./components/BookingOverview";
import InquiryOverview from "./components/InquiryOverview";
import AvailabilityOverview from "./components/AvailabilityOverview";
import RecentActivity from "./components/RecentActivity";
import { DashboardData } from "@/lib/types/dashboard";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  const fetchDashboard = useCallback(
    async (selectedPeriod: "7d" | "30d" | "90d" | "1y", isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setIsError(false);
      setErrorMessage("");

      try {
        const response = await fetch(
          `/api/admin/dashboard?period=${selectedPeriod}`
        );
        if (!response.ok) {
          throw new Error("Server responded with error status");
        }
        const json = await response.json();
        if (json.success && json.data) {
          setDashboardData(json.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setIsError(true);
        setErrorMessage(
          "Unable to synchronize with the villa database. Please verify your connection or try again."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDashboard(period);
  }, [fetchDashboard, period]);

  const handlePeriodChange = (newPeriod: "7d" | "30d" | "90d" | "1y") => {
    setPeriod(newPeriod);
    fetchDashboard(newPeriod);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Welcome & System Control Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1C1917] p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#C88A4B]/15 blur-3xl"
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C88A4B]/20 border border-[#C88A4B]/40 text-[#C88A4B] text-[11px] font-semibold uppercase tracking-wider">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              <span>Control Center</span>
            </span>
            <span className="text-xs text-[#A8A29E] hidden sm:inline">
              Anguilla Beachfront Villa
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-3xl font-semibold tracking-tight text-white">
            Villa B on the Sea Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-[#D6D3D1] mt-1 leading-relaxed">
            Monitor real-time reservations, customer inquiries, availability calendar, and property performance.
          </p>
        </div>

        {/* Action button */}
        <div className="relative z-10 flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => fetchDashboard(period, true)}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#C88A4B] disabled:opacity-50 cursor-pointer"
          >
            <ArrowPathIcon
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#C88A4B]" : ""}`}
            />
            <span>{isRefreshing ? "Syncing..." : "Refresh Data"}</span>
          </button>
        </div>
      </div>

      {/* Error State Banner */}
      {isError && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-800 text-xs sm:text-sm"
        >
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0" />
            <p className="font-medium">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchDashboard(period)}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors self-start sm:self-auto shrink-0 shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* 1. Quick Actions Row */}
      <QuickActions />

      {/* 2. Top Summary Cards Row */}
      <SummaryCards
        data={dashboardData?.summary}
        isLoading={isLoading && !dashboardData}
      />

      {/* 3. Main Multi-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Primary Column (8 of 12 columns on large screen) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Revenue Visualization */}
          <RevenueChart
            totalRevenue={dashboardData?.revenue.total || 0}
            dataPoints={dashboardData?.revenue.dataPoints || []}
            currentPeriod={period}
            onPeriodChange={handlePeriodChange}
            isLoading={isLoading && !dashboardData}
          />

          {/* Bookings Overview */}
          <BookingOverview
            bookings={dashboardData?.recentBookings || []}
            isLoading={isLoading && !dashboardData}
          />

          {/* Inquiries Overview */}
          <InquiryOverview
            inquiries={dashboardData?.recentInquiries || []}
            isLoading={isLoading && !dashboardData}
          />
        </div>

        {/* Right / Secondary Column (4 of 12 columns on large screen) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Availability Overview */}
          <AvailabilityOverview
            availability={dashboardData?.availability}
            isLoading={isLoading && !dashboardData}
          />

          {/* Recent Activity Feed */}
          <RecentActivity
            activities={dashboardData?.recentActivities || []}
            isLoading={isLoading && !dashboardData}
          />
        </div>
      </div>
    </div>
  );
}
