"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Squares2X2Icon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  EnvelopeIcon,
  StarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: Squares2X2Icon },
  { name: "Bookings", href: "/admin/bookings", icon: CalendarDaysIcon },
  { name: "Availability", href: "/admin/availability", icon: ClockIcon },
  { name: "Pricing", href: "/admin/pricing", icon: CurrencyDollarIcon },
  { name: "Gallery", href: "/admin/gallery", icon: PhotoIcon },
  { name: "Inquiries", href: "/admin/inquiries", icon: EnvelopeIcon },
  { name: "Reviews / Testimonials", href: "/admin/reviews", icon: StarIcon },
  { name: "Admin / Profile", href: "/admin/profile", icon: UserCircleIcon },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  adminUsername?: string;
}

export default function AdminSidebar({
  mobileOpen,
  onCloseMobile,
  adminUsername = "admin",
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
      });
      router.push("/admin/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full justify-between bg-[#1C1917] text-white select-none">
      {/* Top Brand / Header */}
      <div>
        <div className="p-6 border-b border-[#2E2926] flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88A4B] rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-[#C88A4B] text-[#1C1917] flex items-center justify-center font-serif font-bold text-lg shadow-md shrink-0">
              VB
            </div>
            <div>
              <div className="font-serif font-semibold text-base tracking-tight text-white leading-tight">
                Villa B on the Sea
              </div>
              <div className="text-[11px] uppercase tracking-widest text-[#C88A4B] font-medium">
                Admin Console
              </div>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden text-[#A8A29E] hover:text-white p-1.5 rounded-lg hover:bg-[#2E2926] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C88A4B]"
            aria-label="Close navigation menu"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5" aria-label="Admin Navigation">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            const IconComponent = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88A4B] ${
                  isActive
                    ? "bg-[#C88A4B] text-[#1C1917] font-semibold shadow-md shadow-[#C88A4B]/20"
                    : "text-[#D6D3D1] hover:text-white hover:bg-[#2A2421]"
                }`}
              >
                <IconComponent
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? "text-[#1C1917]" : "text-[#A8A29E] group-hover:text-white"
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Logout section */}
      <div className="p-4 border-t border-[#2E2926] bg-[#161413]/70 space-y-3">
        {/* Public Website Preview Link */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#A8A29E] hover:text-white hover:bg-[#2A2421] transition-colors"
        >
          <span className="flex items-center gap-2">
            <span>View Public Website</span>
          </span>
          <ArrowTopRightOnSquareIcon className="w-4 h-4 text-[#78716C]" />
        </Link>

        {/* User Card */}
        <div className="flex items-center gap-3 px-3 py-2 bg-[#231F1D] rounded-xl border border-[#2E2926]">
          <div className="w-9 h-9 rounded-full bg-[#C88A4B]/20 border border-[#C88A4B]/40 text-[#C88A4B] flex items-center justify-center font-semibold text-xs shrink-0">
            {adminUsername.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate capitalize">
              {adminUsername}
            </p>
            <p className="text-[11px] text-[#A8A29E] truncate">Administrator</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#EF4444] hover:text-white hover:bg-[#EF4444]/20 border border-[#EF4444]/30 hover:border-[#EF4444] transition-all focus:outline-none focus:ring-2 focus:ring-[#EF4444] disabled:opacity-60 cursor-pointer"
        >
          {isLoggingOut ? (
            <span>Signing out...</span>
          ) : (
            <>
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>Sign Out</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-30 shadow-2xl">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          onClick={onCloseMobile}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") onCloseMobile();
          }}
          aria-label="Close navigation drawer"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer (Slide-over) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#1C1917] transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderNavContent()}
      </div>
    </>
  );
}
