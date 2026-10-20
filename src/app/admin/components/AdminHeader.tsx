"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bars3Icon,
  ArrowTopRightOnSquareIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface AdminHeaderProps {
  onOpenMobile: () => void;
  adminUsername?: string;
}

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin/dashboard": {
    title: "Dashboard Overview",
    subtitle: "Villa status, performance metrics, and quick actions",
  },
  "/admin/bookings": {
    title: "Bookings Management",
    subtitle: "Review reservations, guest requests, and booking statuses",
  },
  "/admin/availability": {
    title: "Calendar & Availability",
    subtitle: "Manage dates, blocked periods, and villa availability",
  },
  "/admin/pricing": {
    title: "Rates & Pricing",
    subtitle: "Configure seasonal rates, holiday premiums, and minimum stays",
  },
  "/admin/gallery": {
    title: "Media & Gallery",
    subtitle: "Manage villa photos, video showcases, and image captions",
  },
  "/admin/inquiries": {
    title: "Guest Inquiries",
    subtitle: "Direct inquiries, concierge requests, and lead management",
  },
  "/admin/reviews": {
    title: "Reviews & Testimonials",
    subtitle: "Moderate client testimonials and guest feedback",
  },
  "/admin/profile": {
    title: "Administrator Profile",
    subtitle: "Security settings, credentials, and console preferences",
  },
};

export default function AdminHeader({
  onOpenMobile,
  adminUsername = "admin",
}: AdminHeaderProps) {
  const pathname = usePathname();
  const currentRouteInfo = ROUTE_TITLES[pathname] || {
    title: "Admin Console",
    subtitle: "Villa B on the Sea Management System",
  };

  const breadcrumbSection =
    pathname.split("/").filter(Boolean)[1] || "dashboard";

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#E7E5E4] px-4 sm:px-8 py-4 flex items-center justify-between transition-all">
      {/* Left side: Hamburger button (mobile) + Page Title & Breadcrumb */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-[#44403C] hover:text-[#1C1917] hover:bg-[#F4EFE9] border border-[#E7E5E4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C88A4B]"
          aria-label="Open sidebar menu"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Title & Breadcrumb */}
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-[#78716C] mb-0.5">
            <Link href="/admin/dashboard" className="hover:text-[#1C1917] transition-colors">
              Admin
            </Link>
            <span>/</span>
            <span className="capitalize text-[#C88A4B] font-semibold">
              {breadcrumbSection}
            </span>
          </nav>
          <h1 className="font-serif text-lg sm:text-2xl font-semibold text-[#1C1917] truncate tracking-tight">
            {currentRouteInfo.title}
          </h1>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Public Site Link */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#44403C] hover:text-[#1C1917] hover:bg-[#F4EFE9] border border-[#E7E5E4] transition-all"
        >
          <span>Live Website</span>
          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
        </Link>

        {/* Security Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#44403C] bg-[#F4EFE9] px-3 py-1.5 rounded-xl border border-[#E7E5E4]">
          <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
          <span className="font-medium capitalize">{adminUsername} (Online)</span>
        </div>
      </div>
    </header>
  );
}
