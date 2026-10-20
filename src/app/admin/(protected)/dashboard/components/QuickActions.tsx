"use client";

import React from "react";
import Link from "next/link";
import {
  CalendarDaysIcon,
  NoSymbolIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

export default function QuickActions() {
  const actions = [
    {
      label: "Add Booking",
      desc: "Record a reservation",
      href: "/admin/bookings",
      icon: CalendarDaysIcon,
      primary: true,
    },
    {
      label: "Block Dates",
      desc: "Update villa calendar",
      href: "/admin/availability",
      icon: NoSymbolIcon,
      primary: false,
    },
    {
      label: "Manage Pricing",
      desc: "Seasonal rate tiers",
      href: "/admin/pricing",
      icon: CurrencyDollarIcon,
      primary: false,
    },
    {
      label: "Add Gallery Image",
      desc: "Upload villa photos",
      href: "/admin/gallery",
      icon: PhotoIcon,
      primary: false,
    },
    {
      label: "View Inquiries",
      desc: "Client communication",
      href: "/admin/inquiries",
      icon: EnvelopeIcon,
      primary: false,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1C1917]">
            Quick Actions
          </h3>
          <p className="text-xs text-[#78716C]">
            Fast-path operations for everyday villa management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.label}
              href={act.href}
              className={`group p-4 rounded-xl border transition-all flex flex-col items-start justify-between min-h-[96px] ${
                act.primary
                  ? "bg-[#1C1917] text-white border-[#1C1917] hover:bg-[#2B2623] hover:border-[#2B2623] shadow-sm"
                  : "bg-[#FDFBF7] text-[#1C1917] border-[#E7E5E4] hover:border-[#C88A4B] hover:bg-white hover:shadow-sm"
              }`}
            >
              <div
                className={`p-2 rounded-lg mb-2 transition-colors ${
                  act.primary
                    ? "bg-[#C88A4B] text-[#1C1917]"
                    : "bg-[#F4EFE9] text-[#1C1917] group-hover:bg-[#C88A4B] group-hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold leading-tight">
                  {act.label}
                </p>
                <p
                  className={`text-[10px] mt-0.5 ${
                    act.primary ? "text-[#D6D3D1]" : "text-[#78716C]"
                  }`}
                >
                  {act.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
