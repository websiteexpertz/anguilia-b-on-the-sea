"use client";

import React from "react";
import {
  CalendarDaysIcon,
  CheckBadgeIcon,
  EnvelopeIcon,
  ChatBubbleLeftEllipsisIcon,
  NoSymbolIcon,
  SparklesIcon,
  StarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { ActivityItem, ActivityType } from "@/lib/types/dashboard";

interface RecentActivityProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

export default function RecentActivity({
  activities,
  isLoading,
}: RecentActivityProps) {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "booking_confirmed":
        return <CheckBadgeIcon className="w-4 h-4 text-emerald-600" />;
      case "booking_new":
        return <CalendarDaysIcon className="w-4 h-4 text-[#C88A4B]" />;
      case "inquiry_new":
        return <EnvelopeIcon className="w-4 h-4 text-blue-600" />;
      case "inquiry_updated":
        return <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-indigo-600" />;
      case "date_blocked":
        return <NoSymbolIcon className="w-4 h-4 text-red-600" />;
      case "date_released":
        return <SparklesIcon className="w-4 h-4 text-emerald-600" />;
      case "review_added":
        return <StarIcon className="w-4 h-4 text-amber-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-[#78716C]" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-sm animate-pulse space-y-4">
        <div className="w-32 h-6 bg-[#F4EFE9] rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F4EFE9]" />
              <div className="flex-1 space-y-1">
                <div className="w-40 h-3 bg-[#F4EFE9] rounded" />
                <div className="w-24 h-2 bg-[#F4EFE9] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1C1917]">
            Recent Activity
          </h3>
          <p className="text-xs text-[#78716C]">
            Audit log of reservation actions and customer interactions
          </p>
        </div>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#FDFBF7] transition-colors"
            >
              <div className="p-2 rounded-xl bg-[#F4EFE9] shrink-0 mt-0.5">
                {getActivityIcon(act.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#1C1917] truncate">
                  {act.title}
                </p>
                <p className="text-[11px] text-[#78716C] leading-snug">
                  {act.description}
                </p>
                <span className="text-[10px] text-[#A8A29E] mt-0.5 block">
                  {act.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-8 px-4 rounded-xl bg-[#FDFBF7] border border-dashed border-[#E7E5E4] text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-[#F4EFE9] text-[#78716C] flex items-center justify-center mb-2">
            <ClockIcon className="w-5 h-5 text-[#C88A4B]" />
          </div>
          <p className="font-serif text-xs sm:text-sm font-semibold text-[#1C1917] mb-0.5">
            No recent activity recorded
          </p>
          <p className="text-[11px] text-[#78716C] max-w-xs leading-relaxed">
            Activities such as newly confirmed bookings, inquiries, and calendar updates will log automatically.
          </p>
        </div>
      )}
    </div>
  );
}
