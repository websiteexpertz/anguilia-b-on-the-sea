"use client";

import React, { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ListBulletIcon,
  Squares2X2Icon,
  LockClosedIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { CalendarDay, MonthAvailabilityResponse } from "@/lib/types/availability";

interface CalendarGridProps {
  data: MonthAvailabilityResponse | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onSelectDay: (day: CalendarDay) => void;
  isLoading?: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarGrid({
  data,
  onPrevMonth,
  onNextMonth,
  onToday,
  onSelectDay,
  isLoading,
}: CalendarGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "agenda">("grid");

  if (isLoading || !data) {
    return (
      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 shadow-sm animate-pulse space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-48 h-8 bg-[#F4EFE9] rounded-xl" />
          <div className="w-32 h-8 bg-[#F4EFE9] rounded-xl" />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-24 bg-[#F4EFE9] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const { monthName, year, days, summary } = data;

  const getDayStatusStyle = (day: CalendarDay) => {
    if (!day.isCurrentMonth) {
      return "opacity-35 bg-[#FDFBF7]/40 text-[#A8A29E]";
    }

    if (day.status === "booked") {
      return "bg-[#1C1917] text-white hover:bg-[#2B2623] border-[#1C1917]";
    }
    if (day.status === "blocked") {
      return "bg-stone-100 text-[#44403C] hover:bg-stone-200 border-stone-300";
    }
    if (day.status === "pending") {
      return "bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-300";
    }
    if (day.isCheckOut) {
      return "bg-amber-50/80 text-[#1C1917] hover:bg-amber-100/90 border-amber-300";
    }

    return "bg-white text-[#1C1917] hover:bg-[#FDFBF7] hover:border-[#C88A4B] border-[#E7E5E4]";
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
      {/* Calendar Header: Controls & Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#F4EFE9]">
        {/* Month Title & Nav */}
        <div className="flex items-center gap-3">
          <h3 className="font-serif text-2xl font-bold text-[#1C1917] tracking-tight">
            {monthName} {year}
          </h3>

          <div className="flex items-center gap-1 bg-[#F4EFE9] p-1 rounded-xl border border-[#E7E5E4]">
            <button
              type="button"
              onClick={onPrevMonth}
              className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-white transition-all focus:outline-none"
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onToday}
              className="px-2.5 py-1 text-xs font-semibold text-[#1C1917] hover:bg-white rounded-lg transition-all"
            >
              Today
            </button>
            <button
              type="button"
              onClick={onNextMonth}
              className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-white transition-all focus:outline-none"
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend & View Switcher */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 self-stretch md:self-auto justify-between md:justify-end">
          {/* Status Indicators */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[#78716C]">
                Available ({summary.availableCount})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1C1917]" />
              <span className="text-[#78716C]">
                Booked ({summary.bookedCount})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
              <span className="text-[#78716C]">
                Blocked ({summary.blockedCount})
              </span>
            </div>
            {summary.pendingCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[#78716C]">
                  Pending ({summary.pendingCount})
                </span>
              </div>
            )}
          </div>

          {/* Mode Switcher: Grid vs Agenda */}
          <div className="flex items-center gap-1 bg-[#F4EFE9] p-1 rounded-xl border border-[#E7E5E4]">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-white text-[#1C1917] shadow-sm font-semibold"
                  : "text-[#78716C] hover:text-[#1C1917]"
              }`}
              title="Calendar Grid"
              aria-label="Calendar Grid View"
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("agenda")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "agenda"
                  ? "bg-white text-[#1C1917] shadow-sm font-semibold"
                  : "text-[#78716C] hover:text-[#1C1917]"
              }`}
              title="Agenda View"
              aria-label="Agenda View"
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: Full Monthly Grid View */}
      {viewMode === "grid" ? (
        <div className="space-y-2">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs font-semibold uppercase tracking-wider text-[#78716C] py-1">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* 35 or 42 Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {days.map((day) => {
              const isSelected = false;

              return (
                <div
                  key={day.date}
                  onClick={() => onSelectDay(day)}
                  className={`min-h-[85px] sm:min-h-[105px] p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none relative group ${getDayStatusStyle(
                    day
                  )} ${
                    day.isToday
                      ? "ring-2 ring-[#C88A4B] ring-offset-1 font-bold"
                      : ""
                  }`}
                >
                  {/* Top: Day Number and Status Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        day.isToday ? "text-[#C88A4B]" : ""
                      }`}
                    >
                      {day.dayOfMonth}
                    </span>

                    {/* Mini indicator icon or Arrival/Departure badges */}
                    <div className="flex items-center gap-1">
                      {day.isCheckIn && day.status === "booked" && (
                        <span className="text-[8px] font-bold uppercase tracking-wider bg-[#C88A4B] text-white px-1 py-0.5 rounded leading-none">
                          Arrival
                        </span>
                      )}
                      {day.isCheckOut && (
                        <span className="text-[8px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300 px-1 py-0.5 rounded leading-none">
                          Departure
                        </span>
                      )}
                      {day.status === "booked" && !day.isCheckIn && (
                        <span className="w-2 h-2 rounded-full bg-[#C88A4B] shrink-0" />
                      )}
                      {day.status === "blocked" && (
                        <LockClosedIcon className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      )}
                      {day.status === "pending" && (
                        <ClockIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Middle / Bottom Content */}
                  <div className="mt-1 min-w-0">
                    {day.status === "booked" && day.bookingDetails && (
                      <div className="text-[10px] sm:text-[11px] leading-tight truncate">
                        <p className="font-semibold text-white truncate">
                          {day.bookingDetails.guestName}
                        </p>
                        <p className="text-[#A8A29E] truncate text-[9px]">
                          {day.bookingDetails.bookingRef}
                        </p>
                      </div>
                    )}

                    {day.status === "blocked" && day.blockDetails && (
                      <div className="text-[10px] leading-tight truncate">
                        <p className="font-semibold text-[#1C1917] truncate">
                          {day.blockDetails.reason}
                        </p>
                        <p className="text-[#78716C] truncate text-[9px]">
                          Blocked
                        </p>
                      </div>
                    )}

                    {day.status === "pending" && day.bookingDetails && (
                      <div className="text-[10px] leading-tight truncate">
                        <p className="font-semibold text-amber-900 truncate">
                          {day.bookingDetails.guestName}
                        </p>
                        <p className="text-amber-700 truncate text-[9px]">
                          Pending Hold
                        </p>
                      </div>
                    )}

                    {day.status === "available" && day.isCheckOut && day.bookingDetails && (
                      <div className="text-[10px] sm:text-[11px] leading-tight truncate">
                        <p className="font-semibold text-amber-900 truncate">
                          Out: {day.bookingDetails.guestName}
                        </p>
                        <p className="text-amber-700 truncate text-[9px]">
                          {day.bookingDetails.bookingRef}
                        </p>
                      </div>
                    )}

                    {day.status === "available" && !day.isCheckOut && day.isCurrentMonth && (
                      <div className="text-[10px] text-emerald-600 font-medium hidden sm:block">
                        Available
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW 2: Agenda / List View (Mobile-Friendly) */
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {days
            .filter((d) => d.isCurrentMonth)
            .map((day) => (
              <div
                key={day.date}
                onClick={() => onSelectDay(day)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  day.isToday
                    ? "ring-2 ring-[#C88A4B] bg-[#FDFBF7]"
                    : "bg-white hover:bg-[#FDFBF7]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold ${
                      day.status === "booked"
                        ? "bg-[#1C1917] text-[#C88A4B]"
                        : day.status === "blocked"
                        ? "bg-stone-200 text-stone-800"
                        : day.status === "pending"
                        ? "bg-amber-100 text-amber-900"
                        : day.isCheckOut
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <span className="text-sm leading-none">{day.dayOfMonth}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-[#1C1917]">
                        {day.date} {day.isToday && "(Today)"}
                      </p>
                      {day.isCheckIn && (
                        <span className="text-[9px] font-bold bg-[#C88A4B] text-white px-1.5 py-0.2 rounded">
                          Check-in
                        </span>
                      )}
                      {day.isCheckOut && (
                        <span className="text-[9px] font-bold bg-amber-200 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded">
                          Check-out
                        </span>
                      )}
                    </div>

                    {day.status === "booked" && (
                      <p className="text-[11px] text-[#78716C]">
                        Booked &bull; {day.bookingDetails?.guestName} (
                        {day.bookingDetails?.bookingRef})
                      </p>
                    )}
                    {day.status === "blocked" && (
                      <p className="text-[11px] text-[#78716C]">
                        Blocked &bull; {day.blockDetails?.reason}
                      </p>
                    )}
                    {day.status === "pending" && (
                      <p className="text-[11px] text-amber-700">
                        Pending Hold &bull; {day.bookingDetails?.guestName}
                      </p>
                    )}
                    {day.status === "available" && day.isCheckOut && day.bookingDetails && (
                      <p className="text-[11px] text-amber-800 font-medium">
                        Morning Departure: {day.bookingDetails?.guestName} ({day.bookingDetails?.bookingRef}) &bull; Afternoon Available
                      </p>
                    )}
                    {day.status === "available" && !day.isCheckOut && (
                      <p className="text-[11px] text-emerald-600">
                        Open for reservation
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    day.status === "booked"
                      ? "bg-[#1C1917] text-white"
                      : day.status === "blocked"
                      ? "bg-stone-200 text-stone-800"
                      : day.status === "pending"
                      ? "bg-amber-100 text-amber-900"
                      : day.isCheckOut
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {day.isCheckOut && day.status === "available" ? "Departure Day" : day.status}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
