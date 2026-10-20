'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CalendarGrid from './components/CalendarGrid';
import DateDetailDrawer from './components/DateDetailDrawer';
import BlockDatesModal from './components/BlockDatesModal';
import UnblockConfirmModal from './components/UnblockConfirmModal';
import { CalendarDay, CreateBlockDto, MonthAvailabilityResponse } from '@/lib/types/availability';
import {
  LockClosedIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

interface CalendarSyncData {
  feedUrl: string;
  lastSyncedAt?: string;
  lastError?: string;
  importedEventCount?: number;
}

export default function AdminAvailabilityPage() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1-indexed

  const [availabilityData, setAvailabilityData] = useState<MonthAvailabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [calendarSyncData, setCalendarSyncData] = useState<CalendarSyncData | null>(null);
  const [calendarFeedUrl, setCalendarFeedUrl] = useState('');
  const [calendarSyncError, setCalendarSyncError] = useState<string | null>(null);
  const [isSavingCalendar, setIsSavingCalendar] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);

  // Drawers & Modals state
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>(undefined);
  const [unblockModalOpen, setUnblockModalOpen] = useState(false);
  const [blockToUnblock, setBlockToUnblock] = useState<{
    id: string;
    reason: string;
    dateRange: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchMonth = useCallback(async (year: number, month: number, isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/availability?year=${year}&month=${month}`);
      if (!res.ok) throw new Error('Failed to load month availability.');

      const json = await res.json();
      if (json.success && json.data) {
        setAvailabilityData(json.data);

        // If a day was selected in the drawer, keep its details updated without triggering infinite loops
        setSelectedDay((prev) => {
          if (!prev) return null;
          const updated = json.data.days.find((d: CalendarDay) => d.date === prev.date);
          return updated || prev;
        });
      }
    } catch (err: unknown) {
      console.error('Availability fetch error:', err);
      setErrorMessage('Unable to load calendar availability. Please check your connection.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMonth(currentYear, currentMonth);
  }, [currentYear, currentMonth, fetchMonth]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/calendar-sync')
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load calendar sync settings.');
        if (!cancelled && json.data) {
          setCalendarSyncData(json.data);
          setCalendarFeedUrl(json.data.feedUrl || '');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setCalendarSyncError(
            error instanceof Error ? error.message : 'Failed to load calendar sync settings.'
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
  };

  // Block dates submission
  const handleCreateBlock = async (dto: CreateBlockDto) => {
    const res = await fetch('/api/admin/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to block dates.');
    }

    showToast(`Dates blocked successfully for ${dto.reason}.`);
    fetchMonth(currentYear, currentMonth);
  };

  // Unblock dates submission
  const handleUnblockConfirm = async (blockId: string) => {
    const res = await fetch(`/api/admin/availability/${blockId}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to unblock dates.');
    }

    showToast('Dates unblocked and returned to availability.');
    setSelectedDay(null);
    fetchMonth(currentYear, currentMonth);
  };

  const handleSaveCalendar = async () => {
    setIsSavingCalendar(true);
    setCalendarSyncError(null);
    try {
      const res = await fetch('/api/admin/calendar-sync', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedUrl: calendarFeedUrl }),
      });
      const json = await res.json();
      if (json.data) setCalendarSyncData(json.data);
      if (!res.ok) throw new Error(json.error || 'Failed to save the VRBO calendar.');
      showToast(
        calendarFeedUrl.trim() ? 'VRBO calendar synchronized.' : 'VRBO calendar disconnected.'
      );
      fetchMonth(currentYear, currentMonth);
    } catch (error: unknown) {
      setCalendarSyncError(
        error instanceof Error ? error.message : 'Failed to save the VRBO calendar.'
      );
    } finally {
      setIsSavingCalendar(false);
    }
  };

  const handleSyncCalendar = async () => {
    setIsSyncingCalendar(true);
    setCalendarSyncError(null);
    try {
      const res = await fetch('/api/admin/calendar-sync', { method: 'POST' });
      const json = await res.json();
      if (json.data) setCalendarSyncData(json.data);
      if (!res.ok) throw new Error(json.error || 'Failed to refresh the VRBO calendar.');
      showToast('VRBO calendar refreshed.');
      fetchMonth(currentYear, currentMonth);
    } catch (error: unknown) {
      setCalendarSyncError(
        error instanceof Error ? error.message : 'Failed to refresh the VRBO calendar.'
      );
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-20 right-6 z-50 bg-[#1C1917] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#C88A4B]/40 flex items-center gap-3 animate-fade-in text-xs font-semibold"
        >
          <CheckCircleIcon className="w-5 h-5 text-[#C88A4B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-3"
        >
          <ExclamationCircleIcon className="w-5 h-5 text-red-500 shrink-0" />
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
            Availability Calendar
          </h2>
          <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
            Real-time occupancy schedule, guest reservations, and villa maintenance holds
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => fetchMonth(currentYear, currentMonth, true)}
            disabled={isLoading || isRefreshing}
            className="p-2.5 rounded-xl border border-[#E7E5E4] bg-white text-[#78716C] hover:text-[#1C1917] hover:bg-[#F4EFE9] transition-all focus:outline-none"
            title="Refresh Calendar"
            aria-label="Refresh Calendar"
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C88A4B]' : ''}`}
            />
          </button>

          <button
            type="button"
            onClick={() => {
              setPrefilledDate(undefined);
              setBlockModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#2B2623] text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
          >
            <LockClosedIcon className="w-4 h-4 text-[#C88A4B]" />
            <span>Block Dates</span>
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-[#E7E5E4] bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-[#C88A4B]" />
              <h3 className="text-sm font-semibold text-[#1C1917]">VRBO Calendar Sync</h3>
            </div>
            <label htmlFor="vrbo-calendar-url" className="mb-1.5 block text-xs text-[#78716C]">
              iCalendar feed URL
            </label>
            <input
              id="vrbo-calendar-url"
              type="url"
              value={calendarFeedUrl}
              onChange={(event) => setCalendarFeedUrl(event.target.value)}
              placeholder="https://www.vrbo.com/icalendar/..."
              className="w-full rounded-lg border border-[#E7E5E4] bg-white px-3 py-2.5 text-sm text-[#1C1917] outline-none transition focus:border-[#C88A4B] focus:ring-2 focus:ring-[#C88A4B]/15"
              autoComplete="url"
            />
            <p className="mt-2 text-[11px] text-[#78716C]">
              Imported dates block availability. Feeds refresh hourly and when a stale calendar is
              viewed.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveCalendar}
              disabled={isSavingCalendar || isSyncingCalendar}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1C1917] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#2B2623] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircleIcon className="h-4 w-4 text-[#C88A4B]" />
              {isSavingCalendar ? 'Saving...' : 'Save & Sync'}
            </button>
            <button
              type="button"
              onClick={handleSyncCalendar}
              disabled={!calendarSyncData?.feedUrl || isSavingCalendar || isSyncingCalendar}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E7E5E4] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#44403C] transition hover:bg-[#F4EFE9] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isSyncingCalendar ? 'animate-spin' : ''}`} />
              {isSyncingCalendar ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#F4EFE9] pt-3 text-[11px] text-[#78716C]">
          <span>
            {calendarSyncData?.feedUrl
              ? `${calendarSyncData.importedEventCount || 0} imported reservations`
              : 'No VRBO calendar connected'}
          </span>
          {calendarSyncData?.lastSyncedAt && (
            <span>Last synced {new Date(calendarSyncData.lastSyncedAt).toLocaleString()}</span>
          )}
        </div>
        {(calendarSyncError || calendarSyncData?.lastError) && (
          <p role="alert" className="mt-2 text-xs text-red-700">
            {calendarSyncError || calendarSyncData?.lastError}
          </p>
        )}
      </section>

      {/* Main Interactive Calendar Grid */}
      <CalendarGrid
        data={availabilityData}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onSelectDay={setSelectedDay}
        isLoading={isLoading}
      />

      {/* Date Details Slide-over Drawer */}
      <DateDetailDrawer
        day={selectedDay}
        onClose={() => setSelectedDay(null)}
        onBlockDate={(date) => {
          setSelectedDay(null);
          setPrefilledDate(date);
          setBlockModalOpen(true);
        }}
        onUnblockClick={(id, reason, dateRange) => {
          setBlockToUnblock({ id, reason, dateRange });
          setUnblockModalOpen(true);
        }}
      />

      {/* Block Dates Modal */}
      <BlockDatesModal
        isOpen={blockModalOpen}
        onClose={() => {
          setBlockModalOpen(false);
          setPrefilledDate(undefined);
        }}
        onSubmit={handleCreateBlock}
        prefilledStartDate={prefilledDate}
      />

      {/* Unblock Confirmation Modal */}
      <UnblockConfirmModal
        isOpen={unblockModalOpen}
        onClose={() => {
          setUnblockModalOpen(false);
          setBlockToUnblock(null);
        }}
        onConfirm={handleUnblockConfirm}
        blockId={blockToUnblock?.id || null}
        reason={blockToUnblock?.reason || ''}
        dateRange={blockToUnblock?.dateRange || ''}
      />
    </div>
  );
}
