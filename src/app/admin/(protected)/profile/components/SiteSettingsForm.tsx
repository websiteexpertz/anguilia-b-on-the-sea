'use client';

import React, { useState, useEffect } from 'react';
import {
  BuildingOffice2Icon,
  EnvelopeIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  BellAlertIcon,
  CheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { SiteSettings, UpdateSiteSettingsDto } from '@/lib/types/adminProfile';

interface SiteSettingsFormProps {
  settings: SiteSettings | null;
  onSave: (data: UpdateSiteSettingsDto) => Promise<void>;
  isLoading: boolean;
}

export default function SiteSettingsForm({ settings, onSave, isLoading }: SiteSettingsFormProps) {
  const [siteName, setSiteName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('America/Anguilla');
  const [defaultBookingStatus, setDefaultBookingStatus] = useState<'pending' | 'confirmed'>(
    'pending'
  );

  const [emailOnBooking, setEmailOnBooking] = useState(true);
  const [emailOnInquiry, setEmailOnInquiry] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName || '');
      setContactEmail(settings.contactEmail || '');
      setNotificationEmail(settings.notificationEmail || settings.contactEmail || '');
      setContactPhone(settings.contactPhone || '');
      setCurrency(settings.currency || 'USD');
      setTimezone(settings.timezone || 'America/Anguilla');
      setDefaultBookingStatus(settings.defaultBookingStatus || 'pending');
      setEmailOnBooking(settings.notifications?.emailOnBooking ?? true);
      setEmailOnInquiry(settings.notifications?.emailOnInquiry ?? true);
      setDailyDigest(settings.notifications?.dailyDigest ?? false);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!siteName.trim()) {
      setStatusMessage({ type: 'error', text: 'Villa site name cannot be empty.' });
      return;
    }

    if (!contactEmail.trim() || !contactEmail.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid contact email address.' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail.trim())) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid notification email address.' });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        siteName: siteName.trim(),
        contactEmail: contactEmail.trim(),
        notificationEmail: notificationEmail.trim(),
        contactPhone: contactPhone.trim(),
        currency,
        timezone,
        defaultBookingStatus,
        notifications: {
          emailOnBooking,
          emailOnInquiry,
          dailyDigest,
        },
      });
      setStatusMessage({ type: 'success', text: 'Villa website settings updated successfully!' });
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update settings.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="border-b border-[#F5F5F4] pb-4">
        <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#1C1917]">
          Villa & Website Settings
        </h2>
        <p className="text-xs text-[#78716C] mt-0.5">
          Configure property contact details, currency, timezone, and notification preferences.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Property Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
            Property Identity & Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1.5">
                Villa Site Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
                  <BuildingOffice2Icon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Villa B on the Sea, Anguilla"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1.5">
                Official Inquiries Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
                  <EnvelopeIcon className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="reservations@anguillabonthesea.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
                  <PhoneIcon className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (264) 497-0000"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Currency, Timezone & Booking Defaults */}
        <div className="space-y-4 pt-4 border-t border-[#F5F5F4]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
            Regional & Booking Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1.5">
                Base Currency <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
                  <CurrencyDollarIcon className="w-4 h-4" />
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all cursor-pointer"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1.5">
                Timezone <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
                  <GlobeAltIcon className="w-4 h-4" />
                </div>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all cursor-pointer"
                >
                  <option value="America/Anguilla">Atlantic/Anguilla (AST / UTC-4)</option>
                  <option value="America/New_York">Eastern Time (EST / EDT)</option>
                  <option value="America/Chicago">Central Time (CST / CDT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PST / PDT)</option>
                  <option value="Europe/London">London (GMT / BST)</option>
                  <option value="Europe/Paris">Central European Time (CET)</option>
                  <option value="UTC">Universal Coordinated Time (UTC)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1.5">
                Default Booking Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={defaultBookingStatus}
                onChange={(e) => setDefaultBookingStatus(e.target.value as 'pending' | 'confirmed')}
                className="w-full px-3.5 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all cursor-pointer"
              >
                <option value="pending">Pending Admin Review</option>
                <option value="confirmed">Auto-Confirmed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4 pt-4 border-t border-[#F5F5F4]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#78716C]">
            <BellAlertIcon className="w-4 h-4 text-[#C88A4B]" />
            <span>Administrator Email Notifications</span>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#44403C]">
              Notification Recipient Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#A8A29E]">
                <EnvelopeIcon className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={notificationEmail}
                onChange={(event) => setNotificationEmail(event.target.value)}
                placeholder="hemant@infycrestsolutions.com"
                className="w-full rounded-xl border border-[#E7E5E4] bg-[#FBFBFA] py-2.5 pl-9 pr-3.5 text-xs text-[#1C1917] transition-all focus:border-[#C88A4B] focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[#78716C]">
              New inquiry alerts are sent to this address.
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] cursor-pointer hover:bg-[#F5F5F4] transition-colors">
              <input
                type="checkbox"
                checked={emailOnBooking}
                onChange={(e) => setEmailOnBooking(e.target.checked)}
                className="mt-0.5 rounded text-[#C88A4B] focus:ring-[#C88A4B] w-4 h-4"
              />
              <div>
                <span className="text-xs font-semibold text-[#1C1917] block">
                  New Booking Alerts
                </span>
                <span className="text-[11px] text-[#78716C] block mt-0.5">
                  Receive immediate email notification when a customer submits a new reservation.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] cursor-pointer hover:bg-[#F5F5F4] transition-colors">
              <input
                type="checkbox"
                checked={emailOnInquiry}
                onChange={(e) => setEmailOnInquiry(e.target.checked)}
                className="mt-0.5 rounded text-[#C88A4B] focus:ring-[#C88A4B] w-4 h-4"
              />
              <div>
                <span className="text-xs font-semibold text-[#1C1917] block">
                  New Customer Inquiries
                </span>
                <span className="text-[11px] text-[#78716C] block mt-0.5">
                  Receive immediate alert when a guest submits a contact form inquiry.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] cursor-pointer hover:bg-[#F5F5F4] transition-colors">
              <input
                type="checkbox"
                checked={dailyDigest}
                onChange={(e) => setDailyDigest(e.target.checked)}
                className="mt-0.5 rounded text-[#C88A4B] focus:ring-[#C88A4B] w-4 h-4"
              />
              <div>
                <span className="text-xs font-semibold text-[#1C1917] block">
                  Daily Villa Summary Digest
                </span>
                <span className="text-[11px] text-[#78716C] block mt-0.5">
                  Receive a daily morning email summary of upcoming arrivals, departures, and
                  pending actions.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1C1917] hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                <span>Save Villa Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
