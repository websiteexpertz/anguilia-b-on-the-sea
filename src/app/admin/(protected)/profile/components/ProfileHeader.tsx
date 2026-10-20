"use client";

import React from "react";
import {
  UserCircleIcon,
  KeyIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { AdminUserProfile, SessionInfo } from "@/lib/types/adminProfile";

export type ProfileTab = "profile" | "security" | "settings" | "session";

interface ProfileHeaderProps {
  profile: AdminUserProfile | null;
  session: SessionInfo | null;
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

export default function ProfileHeader({
  profile,
  session,
  activeTab,
  onTabChange,
}: ProfileHeaderProps) {
  const tabs: { id: ProfileTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "profile", label: "Profile Information", icon: UserCircleIcon },
    { id: "security", label: "Security & Password", icon: KeyIcon },
    { id: "settings", label: "Villa & Site Settings", icon: Cog6ToothIcon },
    { id: "session", label: "Session & Diagnostics", icon: ShieldCheckIcon },
  ];

  const displayName = profile?.displayName || "Villa Administrator";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm space-y-6">
      {/* Top Profile Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-[#F5F5F4]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1C1917] text-[#C88A4B] flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold shadow-md shrink-0">
            {initials || "A"}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917]">
                {displayName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Session</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1">
              Username: <span className="font-mono text-[#44403C] font-semibold">{profile?.username || "admin"}</span> &bull; Role: <span className="uppercase tracking-wider font-semibold text-[#C88A4B]">Superadmin</span>
            </p>
          </div>
        </div>

        {session && (
          <div className="bg-[#FBFBFA] border border-[#E7E5E4] rounded-2xl px-4 py-2.5 text-xs text-[#78716C] shrink-0">
            <div className="font-medium text-[#44403C]">Signed Session Valid</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {session.timeRemaining}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#1C1917] text-white shadow-sm"
                  : "bg-[#F5F5F4] text-[#78716C] hover:bg-[#E7E5E4] hover:text-[#1C1917]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
