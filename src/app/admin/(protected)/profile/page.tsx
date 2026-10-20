"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import ProfileHeader, { ProfileTab } from "./components/ProfileHeader";
import ProfileEditForm from "./components/ProfileEditForm";
import ChangePasswordForm from "./components/ChangePasswordForm";
import SiteSettingsForm from "./components/SiteSettingsForm";
import SessionDetailsCard from "./components/SessionDetailsCard";
import {
  AdminUserProfile,
  SessionInfo,
  UpdateProfileDto,
  ChangePasswordDto,
  SiteSettings,
  UpdateSiteSettingsDto,
} from "@/lib/types/adminProfile";

export default function AdminProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [profile, setProfile] = useState<AdminUserProfile | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [profileRes, settingsRes] = await Promise.all([
        fetch("/api/admin/profile"),
        fetch("/api/admin/settings"),
      ]);

      const profileJson = await profileRes.json();
      const settingsJson = await settingsRes.json();

      if (!profileRes.ok || !profileJson.success) {
        throw new Error(profileJson.error || "Failed to load profile details.");
      }

      setProfile(profileJson.profile || null);
      setSession(profileJson.session || null);

      if (settingsRes.ok && settingsJson.success) {
        setSettings(settingsJson.data || null);
      }
    } catch (err: unknown) {
      console.error("Error loading profile page:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle profile edit
  const handleSaveProfile = async (data: UpdateProfileDto) => {
    const res = await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to update profile.");
    }
    setProfile(json.profile);
    showNotification("success", "Administrator profile successfully updated.");
  };

  // Handle password change
  const handleChangePassword = async (data: ChangePasswordDto) => {
    const res = await fetch("/api/admin/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to change password.");
    }
    showNotification(
      "success",
      "Password changed successfully. Your active session has been renewed."
    );
    // Reload profile session info
    await loadData();
  };

  // Handle settings update
  const handleSaveSettings = async (data: UpdateSiteSettingsDto) => {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to update website settings.");
    }
    setSettings(json.data);
    showNotification("success", "Villa website settings updated successfully.");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Global Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-sm transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <ExclamationCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium flex items-center gap-2">
          <ExclamationCircleIcon className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header with Navigation Tabs */}
      <ProfileHeader
        profile={profile}
        session={session}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content Area Based on Active Tab */}
      {isLoading && !profile ? (
        <div className="bg-white rounded-3xl border border-[#E7E5E4] p-12 text-center shadow-sm">
          <ArrowPathIcon className="w-8 h-8 text-[#C88A4B] animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-[#78716C]">
            Loading administrator profile...
          </p>
        </div>
      ) : (
        <div>
          {activeTab === "profile" && (
            <ProfileEditForm
              profile={profile}
              onSave={handleSaveProfile}
              isLoading={isLoading}
            />
          )}

          {activeTab === "security" && (
            <ChangePasswordForm onPasswordChange={handleChangePassword} />
          )}

          {activeTab === "settings" && (
            <SiteSettingsForm
              settings={settings}
              onSave={handleSaveSettings}
              isLoading={isLoading}
            />
          )}

          {activeTab === "session" && (
            <SessionDetailsCard session={session} />
          )}
        </div>
      )}
    </div>
  );
}
