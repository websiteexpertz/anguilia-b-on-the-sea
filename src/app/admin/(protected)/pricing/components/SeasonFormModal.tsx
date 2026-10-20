'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  XMarkIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { SeasonalRule, CreateSeasonDto } from '@/lib/types/pricing';

interface SeasonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSeasonDto) => Promise<void>;
  editingSeason?: SeasonalRule | null;
}

function toDatePickerValue(value?: string): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const numericDate = /^(\d{2})-(\d{2})$/.exec(value.trim());
  const namedDate = /^([a-z]+)\s+(\d{1,2})$/i.exec(value.trim());
  let month = numericDate ? Number(numericDate[1]) : 0;
  let day = numericDate ? Number(numericDate[2]) : 0;

  if (namedDate) {
    const monthName = namedDate[1].toLowerCase();
    month =
      [
        'january',
        'february',
        'march',
        'april',
        'may',
        'june',
        'july',
        'august',
        'september',
        'october',
        'november',
        'december',
      ].findIndex((name) => name.startsWith(monthName)) + 1;
    day = Number(namedDate[2]);
  }

  const year = new Date().getFullYear();
  const date = new Date(Date.UTC(year, month - 1, day));
  if (!month || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return '';
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDateLabel(value: string): string {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(date);
}

function isMonthDay(value?: string): boolean {
  return Boolean(value && /^(\d{2}-\d{2}|[a-z]+\s+\d{1,2})$/i.test(value.trim()));
}

export default function SeasonFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingSeason,
}: SeasonFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [nightlyRate, setNightlyRate] = useState(1200);
  const [weekendNight, setWeekendNight] = useState(1400);
  const [weekly, setWeekly] = useState(7500);
  const [monthly, setMonthly] = useState<number | null>(22000);
  const [hasMonthly, setHasMonthly] = useState(true);
  const [minStay, setMinStay] = useState(3);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editingSeason) {
      setName(editingSeason.name);
      const start = toDatePickerValue(editingSeason.startDate || editingSeason.from);
      let end = toDatePickerValue(editingSeason.endDate || editingSeason.to);
      if (
        start &&
        end &&
        end <= start &&
        isMonthDay(editingSeason.startDate || editingSeason.from) &&
        isMonthDay(editingSeason.endDate || editingSeason.to)
      ) {
        const [year, month, day] = end.split('-').map(Number);
        end = `${year + 1}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
      setStartDate(start);
      setEndDate(end);

      const perNight = editingSeason.perNight ?? editingSeason.nightlyRate ?? 1200;
      setNightlyRate(perNight);
      setWeekendNight(editingSeason.weekendNight ?? perNight);
      setWeekly(editingSeason.weekly ?? Math.round(perNight * 7 * 0.9));

      if (editingSeason.monthly !== undefined && editingSeason.monthly !== null) {
        setMonthly(editingSeason.monthly);
        setHasMonthly(true);
      } else {
        setMonthly(null);
        setHasMonthly(false);
      }

      setMinStay(editingSeason.minStay || 3);
      setDescription(editingSeason.description || '');
      setIsActive(editingSeason.isActive !== false);
    } else {
      setName('');
      setStartDate('');
      setEndDate('');
      setNightlyRate(1200);
      setWeekendNight(1400);
      setWeekly(7500);
      setMonthly(22000);
      setHasMonthly(true);
      setMinStay(3);
      setDescription('');
      setIsActive(true);
    }
    setError(null);
  }, [editingSeason, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a name for this season (e.g. 'Low Season').");
      return;
    }
    if (!startDate) {
      setError('Please select a start date.');
      return;
    }
    if (!endDate) {
      setError('Please select an end date.');
      return;
    }
    if (endDate <= startDate) {
      setError('End date must be after the start date.');
      return;
    }
    if (nightlyRate <= 0) {
      setError('Per Night rate must be greater than $0.');
      return;
    }
    if (weekendNight < 0) {
      setError('Weekend rate cannot be negative.');
      return;
    }
    if (minStay < 1) {
      setError('Minimum stay must be at least 1 night.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const fromLabel = formatDateLabel(startDate);
    const toLabel = formatDateLabel(endDate);
    const dateRange = `${fromLabel} – ${toLabel}`;

    try {
      await onSubmit({
        name: name.trim(),
        from: fromLabel,
        to: toLabel,
        dateRange,
        startDate,
        endDate,
        nightlyRate: Number(nightlyRate),
        perNight: Number(nightlyRate),
        weekendNight: Number(weekendNight),
        weekly: weekly ? Number(weekly) : undefined,
        monthly: hasMonthly && monthly !== null ? Number(monthly) : null,
        minStay: Number(minStay),
        description: description.trim() || undefined,
        isActive,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save seasonal rate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-xl w-full border border-[#E7E5E4] shadow-2xl overflow-hidden animate-scale-up max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F4EFE9] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4EFE9] text-[#C88A4B] flex items-center justify-center shrink-0">
              <CalendarDaysIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                {editingSeason ? 'Edit Seasonal Rate' : 'Add Seasonal Rate'}
              </h3>
              <p className="text-xs text-[#78716C]">
                Configure rates for Low Season, High Season, Shoulder, or Holiday Peak
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#78716C] hover:bg-stone-200/60 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5">
              <ExclamationCircleIcon className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <p className="font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {/* Season Name */}
          <div>
            <label className="block font-semibold text-[#1C1917] mb-1">
              Season Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Low Season, Shoulder Season, Holiday Peak, High Season"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:border-[#C88A4B] text-[#1C1917] placeholder-stone-400"
            />
          </div>

          {/* Date Window */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1C1917] mb-1">
                From Window <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:border-[#C88A4B] text-[#1C1917]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1C1917] mb-1">
                To Window <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                min={startDate || undefined}
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:border-[#C88A4B] text-[#1C1917]"
              />
            </div>
          </div>

          {/* Rates Grid: Per Night, Weekend, Weekly, Monthly */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-semibold text-[#1C1917] mb-1">
                Per Night (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C] font-semibold">
                  $
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="50"
                  value={nightlyRate}
                  onChange={(e) => setNightlyRate(Number(e.target.value))}
                  placeholder="1200"
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:border-[#C88A4B] text-[#1C1917] font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1C1917] mb-1">Weekend (USD / nt)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C] font-semibold">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={weekendNight}
                  onChange={(e) => setWeekendNight(Number(e.target.value))}
                  placeholder="1400"
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:border-[#C88A4B] text-[#1C1917]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1C1917] mb-1">Weekly Rate (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C] font-semibold">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={weekly}
                  onChange={(e) => setWeekly(Number(e.target.value))}
                  placeholder="7500"
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:border-[#C88A4B] text-[#1C1917]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-[#1C1917]">Monthly Rate (USD)</label>
                <label className="flex items-center gap-1 cursor-pointer text-[11px] text-[#78716C]">
                  <input
                    type="checkbox"
                    checked={!hasMonthly}
                    onChange={(e) => {
                      setHasMonthly(!e.target.checked);
                      if (e.target.checked) setMonthly(null);
                      else setMonthly(22000);
                    }}
                    className="rounded border-stone-300 text-[#C88A4B]"
                  />
                  <span>None (—)</span>
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C] font-semibold">
                  $
                </span>
                <input
                  type="number"
                  disabled={!hasMonthly}
                  min="0"
                  step="500"
                  value={monthly ?? ''}
                  onChange={(e) => setMonthly(e.target.value ? Number(e.target.value) : null)}
                  placeholder="22000"
                  className={`w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:border-[#C88A4B] text-[#1C1917] ${
                    !hasMonthly ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Minimum Stay & Status */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-semibold text-[#1C1917] mb-1">
                Minimum Stay (Nights)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={minStay}
                onChange={(e) => setMinStay(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:border-[#C88A4B] text-[#1C1917]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1C1917] mb-1">Status</label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-full py-2.5 px-3.5 rounded-xl border font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-stone-100 text-stone-500 border-stone-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-stone-400'}`}
                />
                <span>{isActive ? 'Active Season' : 'Disabled Season'}</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="pt-1">
            <label className="block font-semibold text-[#1C1917] mb-1">
              Internal Notes / Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Standard summer rate tier"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:border-[#C88A4B] text-[#1C1917] placeholder-stone-400 resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-[#F4EFE9] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E7E5E4] text-[#78716C] font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#2B2623] text-white font-semibold transition-all shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting
                ? 'Saving...'
                : editingSeason
                  ? 'Update Season Rate'
                  : 'Add Season Rate'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
