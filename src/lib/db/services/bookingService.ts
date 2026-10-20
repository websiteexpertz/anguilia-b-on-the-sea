import { ObjectId } from "mongodb";
import { getDatabase } from "../mongodb";
import {
  Booking,
  BookingFilterOptions,
  CreateBookingDto,
  UpdateBookingDto,
  BookingStatus,
} from "../../types/booking";

function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

function generateBookingRef(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `VB-${year}-${random}`;
}

/**
 * Checks if the requested dates overlap with an already confirmed booking
 */
export async function checkDateConflict(
  checkIn: string,
  checkOut: string,
  excludeId?: string
): Promise<{ hasConflict: boolean; conflictingBooking?: any }> {
  const db = await getDatabase();
  const query: any = {
    status: { $in: ["confirmed", "completed"] },
    // Date overlap formula: (existing.checkIn < newCheckOut) AND (existing.checkOut > newCheckIn)
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };

  if (excludeId && ObjectId.isValid(excludeId)) {
    query._id = { $ne: new ObjectId(excludeId) };
  }

  const conflictingBooking = await db.collection("bookings").findOne(query);

  return {
    hasConflict: !!conflictingBooking,
    conflictingBooking: conflictingBooking || undefined,
  };
}

/**
 * Lists bookings with search, filter, sort, and pagination
 */
export async function listBookings(options: BookingFilterOptions = {}): Promise<{
  bookings: Booking[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const db = await getDatabase();
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(100, options.limit || 10));
  const skip = (page - 1) * limit;

  const query: any = {};
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Search
  if (options.search && options.search.trim()) {
    const searchRegex = { $regex: options.search.trim(), $options: "i" };
    query.$or = [
      { guestName: searchRegex },
      { email: searchRegex },
      { bookingRef: searchRegex },
      { phone: searchRegex },
    ];
  }

  // 2. Status Filter
  if (options.status && options.status !== "all") {
    query.status = options.status;
  }

  // 3. Timeframe Filter
  if (options.timeframe === "upcoming") {
    query.checkIn = { $gte: todayStr };
  } else if (options.timeframe === "past") {
    query.checkOut = { $lt: todayStr };
  }

  // 4. Sorting
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder === "asc" ? 1 : -1;
  const sortOptions: any = { [sortBy]: sortOrder };

  const total = await db.collection("bookings").countDocuments(query);
  const rawBookings = await db
    .collection("bookings")
    .find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .toArray();

  const bookings: Booking[] = rawBookings.map((doc) => ({
    _id: doc._id.toString(),
    bookingRef: doc.bookingRef || `VB-${doc._id.toString().substring(18).toUpperCase()}`,
    guestName: doc.guestName,
    email: doc.email,
    phone: doc.phone,
    checkIn: doc.checkIn,
    checkOut: doc.checkOut,
    nights: doc.nights || calculateNights(doc.checkIn, doc.checkOut),
    guests: doc.guests || 1,
    accommodation: doc.accommodation || "Villa B on the Sea (Full Villa)",
    amount: doc.amount || 0,
    paymentStatus: doc.paymentStatus || "pending",
    status: doc.status || "pending",
    notes: doc.notes || "",
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
  }));

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    bookings,
    total,
    page,
    totalPages,
  };
}

/**
 * Gets a single booking by ID
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  if (!ObjectId.isValid(id)) return null;

  const db = await getDatabase();
  const doc = await db.collection("bookings").findOne({ _id: new ObjectId(id) });
  if (!doc) return null;

  return {
    _id: doc._id.toString(),
    bookingRef: doc.bookingRef || `VB-${doc._id.toString().substring(18).toUpperCase()}`,
    guestName: doc.guestName,
    email: doc.email,
    phone: doc.phone,
    checkIn: doc.checkIn,
    checkOut: doc.checkOut,
    nights: doc.nights || calculateNights(doc.checkIn, doc.checkOut),
    guests: doc.guests || 1,
    accommodation: doc.accommodation || "Villa B on the Sea (Full Villa)",
    amount: doc.amount || 0,
    paymentStatus: doc.paymentStatus || "pending",
    status: doc.status || "pending",
    notes: doc.notes || "",
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
  };
}

/**
 * Creates a new booking
 */
export async function createBooking(data: CreateBookingDto): Promise<Booking> {
  const db = await getDatabase();

  // Validate dates
  if (data.checkOut <= data.checkIn) {
    throw new Error("Check-out date must be after check-in date");
  }

  // Conflict check if creating as Confirmed
  if (data.status === "confirmed") {
    const { hasConflict, conflictingBooking } = await checkDateConflict(
      data.checkIn,
      data.checkOut
    );
    if (hasConflict) {
      throw new Error(
        `Selected dates overlap with confirmed booking ${conflictingBooking.bookingRef || "record"}.`
      );
    }
  }

  const now = new Date().toISOString();
  const bookingRef = generateBookingRef();
  const nights = calculateNights(data.checkIn, data.checkOut);

  const newDoc = {
    bookingRef,
    guestName: data.guestName.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    nights,
    guests: Number(data.guests) || 1,
    accommodation: data.accommodation || "Villa B on the Sea (Full Villa)",
    amount: Number(data.amount) || 0,
    paymentStatus: data.paymentStatus || "pending",
    status: data.status || "pending",
    notes: data.notes || "",
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("bookings").insertOne(newDoc);

  // Log activity
  try {
    await db.collection("activities").insertOne({
      type: "booking_new",
      title: "New Booking Created",
      description: `Reservation ${bookingRef} created for ${data.guestName} (${data.checkIn} to ${data.checkOut}).`,
      timestamp: now,
      createdAt: now,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }

  return {
    _id: result.insertedId.toString(),
    ...newDoc,
  };
}

/**
 * Updates a booking
 */
export async function updateBooking(
  id: string,
  data: UpdateBookingDto
): Promise<Booking | null> {
  if (!ObjectId.isValid(id)) return null;

  const db = await getDatabase();
  const existing = await db.collection("bookings").findOne({ _id: new ObjectId(id) });
  if (!existing) return null;

  const targetCheckIn = data.checkIn || existing.checkIn;
  const targetCheckOut = data.checkOut || existing.checkOut;
  const targetStatus = data.status || existing.status;

  // Validate dates
  if (targetCheckOut <= targetCheckIn) {
    throw new Error("Check-out date must be after check-in date");
  }

  // If status is becoming or staying confirmed, check conflict
  if (targetStatus === "confirmed") {
    const { hasConflict, conflictingBooking } = await checkDateConflict(
      targetCheckIn,
      targetCheckOut,
      id
    );
    if (hasConflict) {
      throw new Error(
        `Selected dates overlap with confirmed booking ${conflictingBooking.bookingRef || "record"}.`
      );
    }
  }

  const nights = calculateNights(targetCheckIn, targetCheckOut);
  const now = new Date().toISOString();

  const updateFields: any = {
    updatedAt: now,
    nights,
  };

  if (data.guestName !== undefined) updateFields.guestName = data.guestName.trim();
  if (data.email !== undefined) updateFields.email = data.email.trim().toLowerCase();
  if (data.phone !== undefined) updateFields.phone = data.phone.trim();
  if (data.checkIn !== undefined) updateFields.checkIn = data.checkIn;
  if (data.checkOut !== undefined) updateFields.checkOut = data.checkOut;
  if (data.guests !== undefined) updateFields.guests = Number(data.guests);
  if (data.accommodation !== undefined) updateFields.accommodation = data.accommodation;
  if (data.amount !== undefined) updateFields.amount = Number(data.amount);
  if (data.paymentStatus !== undefined) updateFields.paymentStatus = data.paymentStatus;
  if (data.status !== undefined) updateFields.status = data.status;
  if (data.notes !== undefined) updateFields.notes = data.notes;

  await db
    .collection("bookings")
    .updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

  // Log activity if status changed
  if (data.status && data.status !== existing.status) {
    const activityType =
      data.status === "confirmed"
        ? "booking_confirmed"
        : data.status === "cancelled"
        ? "date_released"
        : "booking_new";

    try {
      await db.collection("activities").insertOne({
        type: activityType,
        title: `Booking ${data.status.toUpperCase()}`,
        description: `Booking ${existing.bookingRef} status updated to ${data.status}.`,
        timestamp: now,
        createdAt: now,
      });
    } catch (err) {
      console.error("Failed to log activity:", err);
    }
  }

  return getBookingById(id);
}

/**
 * Cancels a booking without hard-deleting the record
 */
export async function cancelBooking(id: string, reason?: string): Promise<Booking | null> {
  if (!ObjectId.isValid(id)) return null;

  const db = await getDatabase();
  const existing = await db.collection("bookings").findOne({ _id: new ObjectId(id) });
  if (!existing) return null;

  const now = new Date().toISOString();
  const notesAppend = reason
    ? `${existing.notes ? existing.notes + "\n" : ""}[Cancelled on ${now.split("T")[0]}]: ${reason}`
    : existing.notes;

  await db.collection("bookings").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        status: "cancelled",
        notes: notesAppend,
        updatedAt: now,
      },
    }
  );

  try {
    await db.collection("activities").insertOne({
      type: "date_released",
      title: "Booking Cancelled",
      description: `Reservation ${existing.bookingRef} for ${existing.guestName} was cancelled.`,
      timestamp: now,
      createdAt: now,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }

  return getBookingById(id);
}
