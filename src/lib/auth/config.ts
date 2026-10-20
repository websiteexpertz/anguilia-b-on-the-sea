/**
 * Centralized Admin Authentication Configuration
 * 
 * Credentials and security settings for Villa B on the Sea Admin Panel.
 * Configured via environment variables with safe development defaults.
 */

export const AUTH_CONFIG = {
  adminUsername: process.env.ADMIN_USERNAME || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
  sessionSecret: process.env.ADMIN_SESSION_SECRET || "villa_b_admin_session_secret_dev_2026_anguilla",
  cookieName: "admin_session",
  // 7 days in seconds
  sessionDuration: 60 * 60 * 24 * 7,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  },
};
