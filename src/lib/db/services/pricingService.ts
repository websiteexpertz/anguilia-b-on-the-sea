import { ObjectId } from "mongodb";
import { getDatabase } from "../mongodb";
import {
  BaseRateConfig,
  SeasonalRule,
  AdditionalCharge,
  CreateSeasonDto,
  CreateChargeDto,
} from "../../types/pricing";

const DEFAULT_BASE_RATE: BaseRateConfig = {
  villaName: "Villa B on the Sea (5-Bedroom Estate)",
  nightlyRate: 2500,
  minStay: 3,
  currency: "USD",
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_SEASONS: Array<Omit<SeasonalRule, "_id">> = [
  {
    name: "Low Season",
    from: "May 1",
    to: "Nov 14",
    dateRange: "May 1 – Nov 14",
    startDate: "05-01",
    endDate: "11-14",
    nightlyRate: 1200,
    perNight: 1200,
    weekendNight: 1400,
    weekly: 7500,
    monthly: 22000,
    minStay: 3,
    description: "Relaxing Caribbean summer and autumn getaway with gentle sea breezes",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Shoulder Season",
    from: "Nov 15",
    to: "Dec 14",
    dateRange: "Nov 15 – Dec 14",
    startDate: "11-15",
    endDate: "12-14",
    nightlyRate: 1800,
    perNight: 1800,
    weekendNight: 2000,
    weekly: 11500,
    monthly: 30000,
    minStay: 3,
    description: "Pre-holiday early winter period with prime calm waters and dining",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Holiday Peak",
    from: "Dec 15",
    to: "Jan 5",
    dateRange: "Dec 15 – Jan 5",
    startDate: "12-15",
    endDate: "01-05",
    nightlyRate: 3500,
    perNight: 3500,
    weekendNight: 4000,
    weekly: 22000,
    monthly: null,
    minStay: 7,
    description: "Festive Christmas & New Year celebrations in luxury oceanfront comfort",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "High Season",
    from: "Jan 6",
    to: "Apr 30",
    dateRange: "Jan 6 – Apr 30",
    startDate: "01-06",
    endDate: "04-30",
    nightlyRate: 2500,
    perNight: 2500,
    weekendNight: 2800,
    weekly: 16000,
    monthly: 42000,
    minStay: 4,
    description: "Peak Caribbean winter and spring sunshine, tranquil trade winds",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_CHARGES: Array<Omit<AdditionalCharge, "_id">> = [
  {
    name: "Government Tax",
    amount: 10,
    type: "percentage",
    appliedTo: "Applied to total rental",
    description: "Anguilla island accommodation tax",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Service Fee",
    amount: 10,
    type: "percentage",
    appliedTo: "Applied to total rental",
    description: "Villa staff service charge & dedicated concierge",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function normalizeSeasonDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const input = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const date = new Date(`${input}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === input
      ? input
      : null;
  }

  const numericMonthDay = /^(\d{2})-(\d{2})$/.exec(input);
  if (numericMonthDay) {
    const month = Number(numericMonthDay[1]);
    const day = Number(numericMonthDay[2]);
    const date = new Date(Date.UTC(2000, month - 1, day));
    if (month < 1 || month > 12 || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      return null;
    }
    return input;
  }

  const namedMonthDay = /^([a-z]+)\s+(\d{1,2})$/i.exec(input);
  if (!namedMonthDay) return null;
  const month = MONTH_NAMES.findIndex((name) =>
    name.toLowerCase().startsWith(namedMonthDay[1].toLowerCase())
  );
  const day = Number(namedMonthDay[2]);
  if (month < 0) return null;

  const date = new Date(Date.UTC(2000, month, day));
  if (date.getUTCMonth() !== month || date.getUTCDate() !== day) return null;
  return `${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isValidSeasonDateRange(startDate: string, endDate: string): boolean {
  const isRecurringWindow = /^\d{2}-\d{2}$/.test(startDate) && /^\d{2}-\d{2}$/.test(endDate);
  if (isRecurringWindow) return startDate !== endDate;
  return startDate.length === 10 && endDate.length === 10 && endDate > startDate;
}

// --- 1. Base Rate Service ---

export async function getBaseRate(): Promise<BaseRateConfig> {
  const db = await getDatabase();
  const existing = await db.collection("pricing_base").findOne({});

  if (existing) {
    return {
      villaName: existing.villaName || DEFAULT_BASE_RATE.villaName,
      nightlyRate: Number(existing.nightlyRate) || DEFAULT_BASE_RATE.nightlyRate,
      minStay: Number(existing.minStay) || DEFAULT_BASE_RATE.minStay,
      currency: existing.currency || "USD",
      updatedAt: existing.updatedAt || new Date().toISOString(),
    };
  }

  // Insert default base rate if not present
  await db.collection("pricing_base").insertOne(DEFAULT_BASE_RATE);
  return DEFAULT_BASE_RATE;
}

export async function updateBaseRate(
  data: Partial<BaseRateConfig>
): Promise<BaseRateConfig> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const updateFields: any = {
    updatedAt: now,
  };

  if (data.villaName !== undefined) updateFields.villaName = data.villaName.trim();
  if (data.nightlyRate !== undefined) updateFields.nightlyRate = Math.max(0, Number(data.nightlyRate));
  if (data.minStay !== undefined) updateFields.minStay = Math.max(1, Number(data.minStay));
  if (data.currency !== undefined) updateFields.currency = data.currency.trim().toUpperCase();

  await db.collection("pricing_base").updateOne(
    {},
    { $set: updateFields },
    { upsert: true }
  );

  return getBaseRate();
}

// --- 2. Seasonal Rules Service ---

export async function checkSeasonConflict(
  startDate: string,
  endDate: string,
  excludeId?: string
): Promise<{ hasConflict: boolean; conflictingSeason?: any }> {
  const db = await getDatabase();

  const query: any = {
    isActive: true,
    // Overlap: existing.startDate <= newEndDate AND existing.endDate >= newStartDate
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  };

  if (excludeId && ObjectId.isValid(excludeId)) {
    query._id = { $ne: new ObjectId(excludeId) };
  }

  const conflictingSeason = await db.collection("pricing_seasons").findOne(query);

  return {
    hasConflict: !!conflictingSeason,
    conflictingSeason: conflictingSeason || undefined,
  };
}

export async function listSeasonalRules(): Promise<SeasonalRule[]> {
  const db = await getDatabase();
  const count = await db.collection("pricing_seasons").countDocuments();

  if (count === 0) {
    // Seed initial villa seasonal rate defaults
    await db.collection("pricing_seasons").insertMany(DEFAULT_SEASONS as any);
  }

  const docs = await db
    .collection("pricing_seasons")
    .find({})
    .sort({ startDate: 1, createdAt: 1 })
    .toArray();

  return docs.map((doc) => {
    const nightly = Number(doc.perNight ?? doc.nightlyRate ?? 0);
    return {
      _id: doc._id.toString(),
      name: doc.name,
      startDate: doc.startDate || "",
      endDate: doc.endDate || "",
      from: doc.from || "",
      to: doc.to || "",
      dateRange: doc.dateRange || (doc.from && doc.to ? `${doc.from} – ${doc.to}` : ""),
      nightlyRate: nightly,
      perNight: nightly,
      weekendNight: doc.weekendNight !== undefined && doc.weekendNight !== null ? Number(doc.weekendNight) : undefined,
      weekly: doc.weekly !== undefined && doc.weekly !== null ? Number(doc.weekly) : undefined,
      monthly: doc.monthly !== undefined && doc.monthly !== null ? Number(doc.monthly) : null,
      minStay: Number(doc.minStay || 3),
      description: doc.description || "",
      isActive: doc.isActive !== false,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: doc.updatedAt || new Date().toISOString(),
    };
  });
}

export async function createSeasonalRule(
  dto: CreateSeasonDto
): Promise<SeasonalRule> {
  const db = await getDatabase();

  const startDate = normalizeSeasonDate(dto.startDate || dto.from) || "";
  const endDate = normalizeSeasonDate(dto.endDate || dto.to) || "";

  if ((dto.startDate || dto.from) && !startDate) {
    throw new Error("Season start must be a valid date such as Dec 19 or 2026-12-19.");
  }
  if ((dto.endDate || dto.to) && !endDate) {
    throw new Error("Season end must be a valid date such as Jan 02 or 2027-01-02.");
  }
  if (startDate && endDate && !isValidSeasonDateRange(startDate, endDate)) {
    throw new Error("Season end date must be after the start date.");
  }

  const effectiveNightly = Number(dto.perNight ?? dto.nightlyRate ?? 0);
  if (effectiveNightly < 0) {
    throw new Error("Nightly rate cannot be negative.");
  }

  // Conflict check if active and full dates are supplied
  if (dto.isActive !== false && startDate && endDate && startDate.length === 10 && endDate.length === 10) {
    const { hasConflict, conflictingSeason } = await checkSeasonConflict(
      startDate,
      endDate
    );
    if (hasConflict) {
      throw new Error(
        `Date range conflicts with active season "${conflictingSeason.name}" (${conflictingSeason.startDate} to ${conflictingSeason.endDate}).`
      );
    }
  }

  const now = new Date().toISOString();
  const fromStr = dto.from ? dto.from.trim() : "";
  const toStr = dto.to ? dto.to.trim() : "";
  const dateRangeStr = dto.dateRange
    ? dto.dateRange.trim()
    : fromStr && toStr
    ? `${fromStr} – ${toStr}`
    : startDate && endDate
    ? `${startDate} – ${endDate}`
    : "";

  const newDoc = {
    name: dto.name.trim(),
    startDate,
    endDate,
    from: fromStr,
    to: toStr,
    dateRange: dateRangeStr,
    nightlyRate: effectiveNightly,
    perNight: effectiveNightly,
    weekendNight: dto.weekendNight !== undefined && dto.weekendNight !== null ? Number(dto.weekendNight) : undefined,
    weekly: dto.weekly !== undefined && dto.weekly !== null ? Number(dto.weekly) : undefined,
    monthly: dto.monthly !== undefined && dto.monthly !== null ? Number(dto.monthly) : null,
    minStay: Math.max(1, Number(dto.minStay) || 3),
    description: dto.description ? dto.description.trim() : "",
    isActive: dto.isActive !== false,
    createdAt: now,
    updatedAt: now,
  };

  const res = await db.collection("pricing_seasons").insertOne(newDoc);

  return {
    _id: res.insertedId.toString(),
    ...newDoc,
  };
}

export async function updateSeasonalRule(
  id: string,
  dto: Partial<CreateSeasonDto>
): Promise<SeasonalRule | null> {
  if (!ObjectId.isValid(id)) return null;

  const db = await getDatabase();
  const existing = await db
    .collection("pricing_seasons")
    .findOne({ _id: new ObjectId(id) });
  if (!existing) return null;

  const targetStart = dto.startDate !== undefined
    ? normalizeSeasonDate(dto.startDate)
    : existing.startDate;
  const targetEnd = dto.endDate !== undefined
    ? normalizeSeasonDate(dto.endDate)
    : existing.endDate;
  const targetActive = dto.isActive !== undefined ? dto.isActive : existing.isActive;

  if (dto.startDate !== undefined && !targetStart) {
    throw new Error("Season start must be a valid date such as Dec 19 or 2026-12-19.");
  }
  if (dto.endDate !== undefined && !targetEnd) {
    throw new Error("Season end must be a valid date such as Jan 02 or 2027-01-02.");
  }
  if (targetStart && targetEnd && !isValidSeasonDateRange(targetStart, targetEnd)) {
    throw new Error("Season end date must be after the start date.");
  }

  // Collision check if target status is active and dates are full YYYY-MM-DD
  if (targetActive && targetStart && targetEnd && targetStart.length === 10 && targetEnd.length === 10) {
    const { hasConflict, conflictingSeason } = await checkSeasonConflict(
      targetStart,
      targetEnd,
      id
    );
    if (hasConflict) {
      throw new Error(
        `Date range conflicts with active season "${conflictingSeason.name}" (${conflictingSeason.startDate} to ${conflictingSeason.endDate}).`
      );
    }
  }

  const now = new Date().toISOString();
  const updateFields: any = {
    updatedAt: now,
  };

  if (dto.name !== undefined) updateFields.name = dto.name.trim();
  if (dto.startDate !== undefined) updateFields.startDate = targetStart;
  if (dto.endDate !== undefined) updateFields.endDate = targetEnd;
  if (dto.from !== undefined) updateFields.from = dto.from.trim();
  if (dto.to !== undefined) updateFields.to = dto.to.trim();
  if (dto.dateRange !== undefined) updateFields.dateRange = dto.dateRange.trim();
  if (dto.perNight !== undefined || dto.nightlyRate !== undefined) {
    const rate = Math.max(0, Number(dto.perNight ?? dto.nightlyRate));
    updateFields.nightlyRate = rate;
    updateFields.perNight = rate;
  }
  if (dto.weekendNight !== undefined) {
    updateFields.weekendNight = dto.weekendNight === null ? null : Math.max(0, Number(dto.weekendNight));
  }
  if (dto.weekly !== undefined) {
    updateFields.weekly = dto.weekly === null ? null : Math.max(0, Number(dto.weekly));
  }
  if (dto.monthly !== undefined) {
    updateFields.monthly = dto.monthly === null ? null : Math.max(0, Number(dto.monthly));
  }
  if (dto.minStay !== undefined) updateFields.minStay = Math.max(1, Number(dto.minStay));
  if (dto.description !== undefined) updateFields.description = dto.description.trim();
  if (dto.isActive !== undefined) updateFields.isActive = dto.isActive;

  // Auto-format dateRange if from/to provided
  if (dto.from !== undefined || dto.to !== undefined) {
    const f = dto.from !== undefined ? dto.from : existing.from;
    const t = dto.to !== undefined ? dto.to : existing.to;
    if (f && t) updateFields.dateRange = `${f} – ${t}`;
  }

  await db
    .collection("pricing_seasons")
    .updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

  const updated = await db
    .collection("pricing_seasons")
    .findOne({ _id: new ObjectId(id) });
  if (!updated) return null;

  const nightly = Number(updated.perNight ?? updated.nightlyRate ?? 0);
  return {
    _id: updated._id.toString(),
    name: updated.name,
    startDate: updated.startDate || "",
    endDate: updated.endDate || "",
    from: updated.from || "",
    to: updated.to || "",
    dateRange: updated.dateRange || (updated.from && updated.to ? `${updated.from} – ${updated.to}` : ""),
    nightlyRate: nightly,
    perNight: nightly,
    weekendNight: updated.weekendNight !== undefined && updated.weekendNight !== null ? Number(updated.weekendNight) : undefined,
    weekly: updated.weekly !== undefined && updated.weekly !== null ? Number(updated.weekly) : undefined,
    monthly: updated.monthly !== undefined && updated.monthly !== null ? Number(updated.monthly) : null,
    minStay: Number(updated.minStay || 3),
    description: updated.description || "",
    isActive: updated.isActive,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

export async function deleteSeasonalRule(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDatabase();
  const res = await db
    .collection("pricing_seasons")
    .deleteOne({ _id: new ObjectId(id) });
  return res.deletedCount > 0;
}

// --- 3. Additional Charges Service ---

export async function listAdditionalCharges(): Promise<AdditionalCharge[]> {
  const db = await getDatabase();
  const count = await db.collection("pricing_charges").countDocuments();

  if (count === 0) {
    // Seed initial villa fee defaults
    await db.collection("pricing_charges").insertMany(DEFAULT_CHARGES as any);
  }

  const docs = await db
    .collection("pricing_charges")
    .find({})
    .sort({ createdAt: 1 })
    .toArray();

  return docs.map((doc) => ({
    _id: doc._id.toString(),
    name: doc.name,
    amount: Number(doc.amount),
    type: doc.type,
    appliedTo: doc.appliedTo || (doc.type === "percentage" ? "Applied to total rental" : "Fixed standard charge"),
    description: doc.description || "",
    isActive: doc.isActive !== false,
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
  }));
}

export async function createAdditionalCharge(
  dto: CreateChargeDto
): Promise<AdditionalCharge> {
  const db = await getDatabase();

  if (!dto.name || !dto.name.trim()) {
    throw new Error("Charge name is required.");
  }

  if (dto.amount < 0) {
    throw new Error("Charge amount cannot be negative.");
  }

  const now = new Date().toISOString();
  const newDoc = {
    name: dto.name.trim(),
    amount: Number(dto.amount),
    type: dto.type,
    appliedTo: dto.appliedTo ? dto.appliedTo.trim() : (dto.type === "percentage" ? "Applied to total rental" : "Fixed standard charge"),
    description: dto.description ? dto.description.trim() : "",
    isActive: dto.isActive !== false,
    createdAt: now,
    updatedAt: now,
  };

  const res = await db.collection("pricing_charges").insertOne(newDoc);

  return {
    _id: res.insertedId.toString(),
    ...newDoc,
  };
}

export async function updateAdditionalCharge(
  id: string,
  dto: Partial<CreateChargeDto>
): Promise<AdditionalCharge | null> {
  if (!ObjectId.isValid(id)) return null;

  const db = await getDatabase();
  const now = new Date().toISOString();
  const updateFields: any = {
    updatedAt: now,
  };

  if (dto.name !== undefined) updateFields.name = dto.name.trim();
  if (dto.amount !== undefined) updateFields.amount = Math.max(0, Number(dto.amount));
  if (dto.type !== undefined) updateFields.type = dto.type;
  if (dto.appliedTo !== undefined) updateFields.appliedTo = dto.appliedTo.trim();
  if (dto.description !== undefined) updateFields.description = dto.description.trim();
  if (dto.isActive !== undefined) updateFields.isActive = dto.isActive;

  await db
    .collection("pricing_charges")
    .updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

  const updated = await db
    .collection("pricing_charges")
    .findOne({ _id: new ObjectId(id) });
  if (!updated) return null;

  return {
    _id: updated._id.toString(),
    name: updated.name,
    amount: Number(updated.amount),
    type: updated.type,
    appliedTo: updated.appliedTo || (updated.type === "percentage" ? "Applied to total rental" : "Fixed standard charge"),
    description: updated.description || "",
    isActive: updated.isActive,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

export async function deleteAdditionalCharge(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDatabase();
  const res = await db
    .collection("pricing_charges")
    .deleteOne({ _id: new ObjectId(id) });
  return res.deletedCount > 0;
}
