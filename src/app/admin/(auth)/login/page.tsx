"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    if (!username.trim() || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(
          data?.error || "Invalid username or password. Please try again."
        );
        setIsLoading(false);
        return;
      }

      // Successful login - redirect to admin dashboard
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Unable to connect to server. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between relative overflow-hidden font-sans text-[#1C1917]">
      {/* Decorative ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#C88A4B]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#1C1917]/5 blur-3xl"
      />

      {/* Top Header Strip */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#44403C] hover:text-[#C88A4B] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88A4B] rounded px-2 py-1"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Public Website</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-medium text-[#78716C] bg-white/70 backdrop-blur border border-[#E7E5E4] px-3 py-1 rounded-full shadow-sm">
          <ShieldCheckIcon className="w-4 h-4 text-[#C88A4B]" />
          <span>Secure Admin Portal</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="w-full max-w-md mx-auto px-6 py-8 relative z-10 flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-xl shadow-stone-900/5 p-8 sm:p-10 transition-all">
          {/* Brand header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1C1917] text-[#C88A4B] mb-4 shadow-md">
              <span className="font-serif text-2xl font-bold tracking-tight">VB</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917] tracking-tight">
              Villa B on the Sea
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#78716C] mt-1.5 font-medium">
              Management Portal
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-3.5 rounded-xl bg-red-50/90 border border-red-200/80 flex items-start gap-3 text-red-700 text-sm animate-fade-in"
            >
              <ExclamationCircleIcon className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <p className="font-medium leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="admin-username"
                className="block text-xs font-semibold uppercase tracking-wider text-[#44403C] mb-2"
              >
                Username
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#78716C]">
                  <UserIcon className="h-5 h-5" />
                </div>
                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  disabled={isLoading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter administrator username"
                  className="block w-full rounded-xl border border-[#D8D2C6] bg-[#FDFBF7]/60 pl-10 pr-3.5 py-3 text-sm text-[#1C1917] placeholder-[#78716C] focus:bg-white focus:border-[#C88A4B] focus:ring-2 focus:ring-[#C88A4B]/20 transition-all outline-none disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#44403C] mb-2"
              >
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#78716C]">
                  <LockClosedIcon className="h-5 h-5" />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full rounded-xl border border-[#D8D2C6] bg-[#FDFBF7]/60 pl-10 pr-11 py-3 text-sm text-[#1C1917] placeholder-[#78716C] focus:bg-white focus:border-[#C88A4B] focus:ring-2 focus:ring-[#C88A4B]/20 transition-all outline-none disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#78716C] hover:text-[#1C1917] transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-white py-3 px-4 text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#C88A4B] focus:ring-offset-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-[#C88A4B]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Verifying credentials...</span>
                  </>
                ) : (
                  <span>Sign In to Admin Panel</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security notice footer */}
        <p className="text-center text-xs text-[#78716C] mt-6">
          Authorized personnel only. All access attempts are monitored and recorded.
        </p>
      </main>

      {/* Page Footer */}
      <footer className="w-full py-4 text-center text-xs text-[#78716C] relative z-10 border-t border-[#E7E5E4]/60">
        Villa B on the Sea &bull; Anguilla, BWI &bull; Admin Console v1.0
      </footer>
    </div>
  );
}
