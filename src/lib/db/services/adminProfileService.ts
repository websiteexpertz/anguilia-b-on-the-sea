import crypto from "crypto";
import { getDatabase } from "../mongodb";
import { AUTH_CONFIG } from "@/lib/auth/config";
import {
  AdminUserProfile,
  AdminUserDocument,
  UpdateProfileDto,
  SiteSettings,
  UpdateSiteSettingsDto,
} from "@/lib/types/adminProfile";

const USERS_COLLECTION = "admin_users";
const SETTINGS_COLLECTION = "site_settings";

async function getUsersCollection() {
  const db = await getDatabase();
  return db.collection<AdminUserDocument>(USERS_COLLECTION);
}

async function getSettingsCollection() {
  const db = await getDatabase();
  return db.collection<SiteSettings>(SETTINGS_COLLECTION);
}

async function logActivity(action: string, details: string) {
  try {
    const db = await getDatabase();
    await db.collection("activities").insertOne({
      action,
      details,
      timestamp: new Date().toISOString(),
      createdAt: new Date(),
    });
  } catch (err) {
    console.warn("Could not log profile activity:", err);
  }
}

/**
 * Generates a cryptographic salt + scrypt hash for passwords.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Constant-time password verification against stored scrypt hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  try {
    const [salt, hash] = storedHash.split(":");
    const keyBuffer = Buffer.from(hash, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

let seedUserPromise: Promise<void> | null = null;

/**
 * Seeds initial admin user if collection is empty.
 */
export async function ensureAdminUser(): Promise<void> {
  if (seedUserPromise) return seedUserPromise;

  seedUserPromise = (async () => {
    const collection = await getUsersCollection();
    const count = await collection.countDocuments();
    if (count > 0) return;

    const now = new Date().toISOString();
    const initialAdmin: AdminUserDocument = {
      username: AUTH_CONFIG.adminUsername,
      displayName: "Villa Administrator",
      email: "admin@anguillabonthesea.com",
      phone: "+1 (264) 497-0000",
      role: "admin",
      passwordHash: hashPassword(AUTH_CONFIG.adminPassword),
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(initialAdmin);
    await logActivity("ADMIN_INITIALIZED", "Seeded default administrator account in MongoDB");
  })();

  return seedUserPromise;
}

/**
 * Authenticates admin using MongoDB credentials with fallback to config.
 */
export async function authenticateAdmin(
  username: string,
  password: string
): Promise<{ success: boolean; user?: AdminUserProfile }> {
  try {
    await ensureAdminUser();
    const collection = await getUsersCollection();

    const cleanUsername = username.trim().toLowerCase();
    const doc = await collection.findOne({
      username: { $regex: new RegExp(`^${cleanUsername}$`, "i") },
    });

    if (doc && doc.passwordHash) {
      const isValid = verifyPassword(password, doc.passwordHash);
      if (isValid) {
        return {
          success: true,
          user: {
            _id: doc._id.toString(),
            username: doc.username,
            displayName: doc.displayName,
            email: doc.email,
            phone: doc.phone,
            role: doc.role,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
          },
        };
      }
      return { success: false };
    }

    // Fallback comparison for initial environment config
    const isUsernameValid = cleanUsername === AUTH_CONFIG.adminUsername.toLowerCase();
    const isPasswordValid = password === AUTH_CONFIG.adminPassword;
    if (isUsernameValid && isPasswordValid) {
      return {
        success: true,
        user: {
          _id: "default_admin",
          username: AUTH_CONFIG.adminUsername,
          displayName: "Villa Administrator",
          email: "admin@anguillabonthesea.com",
          role: "admin",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    return { success: false };
  } catch (error) {
    console.error("Auth error:", error);
    // Dev fallback if database unreachable
    if (
      username.trim().toLowerCase() === AUTH_CONFIG.adminUsername.toLowerCase() &&
      password === AUTH_CONFIG.adminPassword
    ) {
      return {
        success: true,
        user: {
          _id: "default_admin",
          username: AUTH_CONFIG.adminUsername,
          displayName: "Villa Administrator",
          email: "admin@anguillabonthesea.com",
          role: "admin",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }
    return { success: false };
  }
}

/**
 * Retrieves the admin user profile (sanitized, no password hash).
 */
export async function getAdminProfile(
  username: string = AUTH_CONFIG.adminUsername
): Promise<AdminUserProfile | null> {
  await ensureAdminUser();
  const collection = await getUsersCollection();

  const doc = await collection.findOne({
    username: { $regex: new RegExp(`^${username.trim()}$`, "i") },
  });

  if (!doc) return null;

  return {
    _id: doc._id.toString(),
    username: doc.username,
    displayName: doc.displayName || "Villa Administrator",
    email: doc.email || "admin@anguillabonthesea.com",
    phone: doc.phone || "+1 (264) 497-0000",
    role: doc.role || "admin",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Updates non-security profile fields.
 */
export async function updateAdminProfile(
  username: string,
  dto: UpdateProfileDto
): Promise<AdminUserProfile | null> {
  await ensureAdminUser();
  const collection = await getUsersCollection();

  const updateFields: Record<string, string> = {
    updatedAt: new Date().toISOString(),
  };

  if (dto.displayName !== undefined) updateFields.displayName = dto.displayName.trim();
  if (dto.email !== undefined) updateFields.email = dto.email.trim().toLowerCase();
  if (dto.phone !== undefined) updateFields.phone = dto.phone.trim();

  await collection.updateOne(
    { username: { $regex: new RegExp(`^${username.trim()}$`, "i") } },
    { $set: updateFields }
  );

  const updated = await getAdminProfile(username);
  if (updated) {
    await logActivity(
      "PROFILE_UPDATED",
      `Administrator profile updated (${updated.displayName})`
    );
  }
  return updated;
}

/**
 * Validates and changes the admin password.
 */
export async function changeAdminPassword(
  username: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  await ensureAdminUser();
  const collection = await getUsersCollection();

  const userDoc = await collection.findOne({
    username: { $regex: new RegExp(`^${username.trim()}$`, "i") },
  });

  if (!userDoc || !userDoc.passwordHash) {
    return { success: false, error: "Administrator account not found." };
  }

  // 1. Verify current password
  const isCurrentValid = verifyPassword(currentPassword, userDoc.passwordHash);
  if (!isCurrentValid) {
    return { success: false, error: "Incorrect current password." };
  }

  // 2. Prevent same password
  if (currentPassword === newPassword) {
    return {
      success: false,
      error: "New password must be different from your current password.",
    };
  }

  // 3. Enforce password strength: at least 8 characters, at least 1 letter, at least 1 number
  if (newPassword.length < 8) {
    return {
      success: false,
      error: "New password must be at least 8 characters long.",
    };
  }

  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasDigit = /[0-9]/.test(newPassword);
  if (!hasLetter || !hasDigit) {
    return {
      success: false,
      error: "New password must contain at least one letter and one number.",
    };
  }

  // 4. Hash new password and save
  const newHash = hashPassword(newPassword);
  await collection.updateOne(
    { _id: userDoc._id },
    {
      $set: {
        passwordHash: newHash,
        updatedAt: new Date().toISOString(),
      },
    }
  );

  await logActivity(
    "PASSWORD_CHANGED",
    `Administrator password successfully updated for user ${username}`
  );

  return { success: true };
}

let seedSettingsPromise: Promise<void> | null = null;

/**
 * Seeds initial site settings if collection is empty.
 */
export async function ensureSiteSettings(): Promise<void> {
  if (seedSettingsPromise) return seedSettingsPromise;

  seedSettingsPromise = (async () => {
    const collection = await getSettingsCollection();
    const count = await collection.countDocuments();
    if (count > 0) return;

    const defaultSettings: SiteSettings = {
      siteName: "Villa B on the Sea, Anguilla",
      contactEmail: "reservations@anguillabonthesea.com",
      notificationEmail:
        process.env.RESEND_NOTIFICATION_EMAIL || "reservations@anguillabonthesea.com",
      contactPhone: "+1 (264) 497-0000",
      currency: "USD",
      timezone: "America/Anguilla",
      defaultBookingStatus: "pending",
      notifications: {
        emailOnBooking: true,
        emailOnInquiry: true,
        dailyDigest: false,
      },
      updatedAt: new Date().toISOString(),
    };

    await collection.insertOne(defaultSettings as unknown as SiteSettings);
    await logActivity("SETTINGS_INITIALIZED", "Seeded default villa site settings in MongoDB");
  })();

  return seedSettingsPromise;
}

/**
 * Retrieves the villa site settings.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  await ensureSiteSettings();
  const collection = await getSettingsCollection();

  const doc = await collection.findOne({});
  if (!doc) {
    return {
      siteName: "Villa B on the Sea, Anguilla",
      contactEmail: "reservations@anguillabonthesea.com",
      notificationEmail:
        process.env.RESEND_NOTIFICATION_EMAIL || "reservations@anguillabonthesea.com",
      contactPhone: "+1 (264) 497-0000",
      currency: "USD",
      timezone: "America/Anguilla",
      defaultBookingStatus: "pending",
      notifications: {
        emailOnBooking: true,
        emailOnInquiry: true,
        dailyDigest: false,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    _id: doc._id?.toString(),
    siteName: doc.siteName,
    contactEmail: doc.contactEmail,
    notificationEmail:
      doc.notificationEmail ||
      process.env.RESEND_NOTIFICATION_EMAIL ||
      doc.contactEmail,
    contactPhone: doc.contactPhone,
    currency: doc.currency,
    timezone: doc.timezone,
    defaultBookingStatus: doc.defaultBookingStatus,
    notifications: doc.notifications || {
      emailOnBooking: true,
      emailOnInquiry: true,
      dailyDigest: false,
    },
    updatedAt: doc.updatedAt,
  };
}

/**
 * Updates the villa site settings.
 */
export async function updateSiteSettings(
  dto: UpdateSiteSettingsDto
): Promise<SiteSettings> {
  await ensureSiteSettings();
  const collection = await getSettingsCollection();

  const current = await getSiteSettings();

  const updatedSettings: SiteSettings = {
    ...current,
    siteName: dto.siteName !== undefined ? dto.siteName.trim() : current.siteName,
    contactEmail:
      dto.contactEmail !== undefined
        ? dto.contactEmail.trim().toLowerCase()
        : current.contactEmail,
    notificationEmail:
      dto.notificationEmail !== undefined
        ? dto.notificationEmail.trim().toLowerCase()
        : current.notificationEmail,
    contactPhone:
      dto.contactPhone !== undefined ? dto.contactPhone.trim() : current.contactPhone,
    currency: dto.currency !== undefined ? dto.currency.trim() : current.currency,
    timezone: dto.timezone !== undefined ? dto.timezone.trim() : current.timezone,
    defaultBookingStatus:
      dto.defaultBookingStatus !== undefined
        ? dto.defaultBookingStatus
        : current.defaultBookingStatus,
    notifications: {
      ...current.notifications,
      ...(dto.notifications || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  const toSave: Partial<SiteSettings> = { ...updatedSettings };
  delete toSave._id;

  await collection.updateOne({}, { $set: toSave }, { upsert: true });

  await logActivity(
    "SETTINGS_UPDATED",
    `Villa website settings updated (Site: ${updatedSettings.siteName})`
  );

  return updatedSettings;
}
