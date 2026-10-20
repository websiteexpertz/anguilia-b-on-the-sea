"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheckIcon,
  ClockIcon,
  FingerPrintIcon,
  ArrowRightOnRectangleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { SessionInfo } from "@/lib/types/adminProfile";

interface SessionDetailsCardProps {
  session: SessionInfo | null;
}

export default function SessionDetailsCard({
  session,
}: SessionDetailsCardProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  const formatDate = (timestampSec: number) => {
    try {
      return new Date(timestampSec * 1000).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="border-b border-[#F5F5F4] pb-4">
        <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#1C1917]">
          Current Session & Authentication Diagnostics
        </h2>
        <p className="text-xs text-[#78716C] mt-0.5">
          Inspect your active cryptographically signed session token and revocation controls.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Token Signature / Fingerprint */}
        <div className="p-4 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#44403C]">
            <FingerPrintIcon className="w-4 h-4 text-[#C88A4B]" />
            <span>Cryptographic Signature Fingerprint</span>
          </div>
          <div className="font-mono text-xs text-[#1C1917] bg-white border border-[#E7E5E4] px-3 py-1.5 rounded-xl inline-block mt-1">
            {session?.tokenSignaturePreview || "HMAC-SHA256-Active"}
          </div>
          <p className="text-[11px] text-[#78716C] pt-1">
            Signed via Web Crypto HMAC-SHA256 with server-side private secret.
          </p>
        </div>

        {/* Expiration and Lifetime */}
        <div className="p-4 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#44403C]">
            <ClockIcon className="w-4 h-4 text-[#C88A4B]" />
            <span>Session Expiration</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-semibold text-[#1C1917]">
              {session?.timeRemaining || "Active"}
            </span>
            <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
              Valid
            </span>
          </div>
          <p className="text-[11px] text-[#78716C] pt-1">
            Expires on {session?.exp ? formatDate(session.exp) : "in 7 days"}.
          </p>
        </div>

        {/* Issued Date */}
        <div className="p-4 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#44403C]">
            <ShieldCheckIcon className="w-4 h-4 text-[#C88A4B]" />
            <span>Session Issued At</span>
          </div>
          <p className="text-xs font-medium text-[#1C1917] mt-1">
            {session?.iat ? formatDate(session.iat) : "Current login"}
          </p>
          <p className="text-[11px] text-[#78716C] pt-1">
            Cookie Type: <span className="font-mono text-[#44403C]">admin_session</span> (HTTP-Only, SameSite=Lax)
          </p>
        </div>

        {/* Role and Permissions */}
        <div className="p-4 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#44403C]">
            <ShieldCheckIcon className="w-4 h-4 text-[#C88A4B]" />
            <span>Authorization Scope</span>
          </div>
          <p className="text-xs font-medium text-[#1C1917] mt-1">
            Full Console Administrator (<span className="font-mono text-[#C88A4B]">role: &quot;admin&quot;</span>)
          </p>
          <p className="text-[11px] text-[#78716C] pt-1">
            Unrestricted access across bookings, calendar, pricing, and assets.
          </p>
        </div>
      </div>

      {/* Revocation & Logout Section */}
      <div className="pt-4 border-t border-[#F5F5F4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#78716C]">
          <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Logging out will invalidate the active cookie and redirect you to the login screen.</span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isLoggingOut ? (
            <>
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              <span>Logging out...</span>
            </>
          ) : (
            <>
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>Terminate Session & Sign Out</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
