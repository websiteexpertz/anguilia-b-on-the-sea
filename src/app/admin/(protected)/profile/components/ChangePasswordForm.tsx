"use client";

import React, { useState } from "react";
import {
  KeyIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { ChangePasswordDto } from "@/lib/types/adminProfile";

interface ChangePasswordFormProps {
  onPasswordChange: (data: ChangePasswordDto) => Promise<void>;
}

export default function ChangePasswordForm({
  onPasswordChange,
}: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Live validation checks
  const isLengthValid = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isDifferentFromCurrent =
    newPassword.length > 0 && currentPassword.length > 0
      ? newPassword !== currentPassword
      : true;

  const isFormValid =
    currentPassword.length > 0 &&
    isLengthValid &&
    hasLetter &&
    hasNumber &&
    isMatch &&
    isDifferentFromCurrent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!currentPassword) {
      setStatusMessage({ type: "error", text: "Please enter your current password." });
      return;
    }

    if (!isLengthValid || !hasLetter || !hasNumber) {
      setStatusMessage({
        type: "error",
        text: "New password must be at least 8 characters long and contain both letters and numbers.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword === currentPassword) {
      setStatusMessage({
        type: "error",
        text: "New password must be different from your current password.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onPasswordChange({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setStatusMessage({
        type: "success",
        text: "Password successfully updated! Your cryptographic session has been refreshed.",
      });

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to change password.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="border-b border-[#F5F5F4] pb-4">
        <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#1C1917]">
          Change Administrator Password
        </h2>
        <p className="text-xs text-[#78716C] mt-0.5">
          Update your login password. Passwords are salted and hashed using scrypt.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1.5">
            Current Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
              <KeyIcon className="w-4 h-4" />
            </div>
            <input
              type={showCurrent ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password (e.g. admin123)"
              className="w-full pl-9 pr-10 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A8A29E] hover:text-[#44403C]"
            >
              {showCurrent ? (
                <EyeSlashIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1.5">
            New Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
              <LockClosedIcon className="w-4 h-4" />
            </div>
            <input
              type={showNew ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters with letters & numbers"
              className="w-full pl-9 pr-10 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A8A29E] hover:text-[#44403C]"
            >
              {showNew ? (
                <EyeSlashIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1.5">
            Confirm New Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
              <LockClosedIcon className="w-4 h-4" />
            </div>
            <input
              type={showConfirm ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="w-full pl-9 pr-10 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#C88A4B]/20 focus:border-[#C88A4B] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A8A29E] hover:text-[#44403C]"
            >
              {showConfirm ? (
                <EyeSlashIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Live Password Strength Meter */}
        <div className="p-4 bg-[#FBFBFA] border border-[#E7E5E4] rounded-2xl space-y-2">
          <div className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider mb-1">
            Password Requirements
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center gap-1.5 ${isLengthValid ? "text-emerald-700" : "text-[#A8A29E]"}`}>
              {isLengthValid ? (
                <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-[#D6D3D1]" />
              )}
              <span>At least 8 characters</span>
            </div>

            <div className={`flex items-center gap-1.5 ${hasLetter ? "text-emerald-700" : "text-[#A8A29E]"}`}>
              {hasLetter ? (
                <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-[#D6D3D1]" />
              )}
              <span>Contains letters</span>
            </div>

            <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700" : "text-[#A8A29E]"}`}>
              {hasNumber ? (
                <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-[#D6D3D1]" />
              )}
              <span>Contains numbers</span>
            </div>

            <div className={`flex items-center gap-1.5 ${isMatch ? "text-emerald-700" : "text-[#A8A29E]"}`}>
              {isMatch ? (
                <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-[#D6D3D1]" />
              )}
              <span>Passwords match</span>
            </div>
          </div>
        </div>

        {/* Informational Security Banner */}
        <div className="flex items-start gap-2.5 p-3.5 bg-[#FDFBF7] border border-[#E7E5E4] rounded-xl text-xs text-[#78716C]">
          <ShieldCheckIcon className="w-4 h-4 text-[#C88A4B] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Upon successfully changing your password, your current active session cookie will be automatically re-signed and refreshed. You will not be logged out.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C88A4B] hover:bg-[#B3783E] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <KeyIcon className="w-4 h-4" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
