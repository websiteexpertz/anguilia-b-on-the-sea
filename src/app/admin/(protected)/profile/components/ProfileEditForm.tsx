"use client";

import React, { useState, useEffect } from "react";
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { AdminUserProfile, UpdateProfileDto } from "@/lib/types/adminProfile";

interface ProfileEditFormProps {
  profile: AdminUserProfile | null;
  onSave: (data: UpdateProfileDto) => Promise<void>;
  isLoading: boolean;
}

export default function ProfileEditForm({
  profile,
  onSave,
  isLoading,
}: ProfileEditFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localMessage, setLocalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalMessage(null);

    if (!displayName.trim()) {
      setLocalMessage({ type: "error", text: "Display name cannot be empty." });
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setLocalMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        displayName: displayName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      setLocalMessage({ type: "success", text: "Profile details updated successfully!" });
    } catch (err: unknown) {
      setLocalMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="border-b border-[#F5F5F4] pb-4">
        <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#1C1917]">
          Administrator Profile Details
        </h2>
        <p className="text-xs text-[#78716C] mt-0.5">
          Manage your contact details and administrator display name.
        </p>
      </div>

      {localMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold ${
            localMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {localMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1.5">
              Display Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
                <UserCircleIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Villa Administrator"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
              />
            </div>
          </div>

          {/* Username (Read Only) */}
          <div>
            <label className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1.5">
              Username <span className="text-[#A8A29E] font-normal lowercase">(read-only)</span>
            </label>
            <input
              type="text"
              readOnly
              value={profile?.username || "admin"}
              className="w-full px-3.5 py-2.5 bg-[#F5F5F4] border border-[#E7E5E4] rounded-xl text-xs text-[#78716C] font-mono cursor-not-allowed select-none"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
                <EnvelopeIcon className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@anguillabonthesea.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1.5">
              Contact Phone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
                <PhoneIcon className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (264) 497-0000"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Read-only account metadata */}
        <div className="p-4 bg-[#FBFBFA] border border-[#E7E5E4] rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-[#78716C]">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-[#C88A4B]" />
            <span>Account Role: <strong className="text-[#1C1917] font-semibold">Master Administrator</strong></span>
          </div>
          <div>
            Account Created:{" "}
            <span className="font-medium text-[#44403C]">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Active"}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1C1917] hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
