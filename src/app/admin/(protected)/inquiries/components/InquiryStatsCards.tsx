"use client";

import React from "react";
import {
  EnvelopeIcon,
  EnvelopeOpenIcon,
  ClockIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { InquiryStats } from "@/lib/types/inquiry";

interface InquiryStatsCardsProps {
  stats: InquiryStats | null;
  isLoading?: boolean;
}

export default function InquiryStatsCards({
  stats,
  isLoading,
}: InquiryStatsCardsProps) {
  const cards = [
    {
      title: "Total Inquiries",
      value: stats?.total ?? 0,
      subtext: "Lifetime customer messages",
      icon: EnvelopeIcon,
      color: "text-stone-900",
      bgIcon: "bg-[#F4EFE9] text-[#C88A4B]",
    },
    {
      title: "Unread Leads",
      value: stats?.unread ?? 0,
      subtext: "Awaiting admin review",
      icon: EnvelopeOpenIcon,
      color: stats?.unread && stats.unread > 0 ? "text-amber-600" : "text-stone-900",
      bgIcon: "bg-amber-50 text-amber-600",
      highlight: stats?.unread && stats.unread > 0,
    },
    {
      title: "In Progress",
      value: (stats?.inProgressCount ?? 0) + (stats?.contactedCount ?? 0),
      subtext: "Active concierge follow-ups",
      icon: ClockIcon,
      color: "text-blue-600",
      bgIcon: "bg-blue-50 text-blue-600",
    },
    {
      title: "Resolved Inquiries",
      value: stats?.resolvedCount ?? 0,
      subtext: "Booked or completed",
      icon: CheckBadgeIcon,
      color: "text-emerald-600",
      bgIcon: "bg-emerald-50 text-emerald-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-[#E7E5E4] p-5 shadow-sm animate-pulse space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F4EFE9]" />
            <div className="h-6 bg-[#F4EFE9] rounded w-1/3" />
            <div className="h-3 bg-[#F4EFE9] rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
              card.highlight
                ? "border-amber-300 ring-1 ring-amber-200"
                : "border-[#E7E5E4]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bgIcon}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              <p className={`font-serif text-2xl sm:text-3xl font-bold ${card.color}`}>
                {card.value}
              </p>
              <p className="text-[11px] text-stone-500 mt-1">{card.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
