import type { ObjectId } from "mongodb";

export interface AdminUserProfile {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  phone?: string;
  role: "admin";
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserDocument extends Omit<AdminUserProfile, "_id"> {
  _id?: ObjectId;
  passwordHash: string;
}

export interface UpdateProfileDto {
  displayName?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationPreferences {
  emailOnBooking: boolean;
  emailOnInquiry: boolean;
  dailyDigest: boolean;
}

export interface SiteSettings {
  _id?: string;
  siteName: string;
  contactEmail: string;
  notificationEmail: string;
  contactPhone: string;
  currency: string;
  timezone: string;
  defaultBookingStatus: "pending" | "confirmed";
  notifications: NotificationPreferences;
  updatedAt: string;
}

export interface UpdateSiteSettingsDto {
  siteName?: string;
  contactEmail?: string;
  notificationEmail?: string;
  contactPhone?: string;
  currency?: string;
  timezone?: string;
  defaultBookingStatus?: "pending" | "confirmed";
  notifications?: Partial<NotificationPreferences>;
}

export interface SessionInfo {
  username: string;
  role: "admin";
  iat: number;
  exp: number;
  tokenSignaturePreview?: string;
  durationDays: number;
  timeRemaining: string;
  isValid: boolean;
}
