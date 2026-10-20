import { ObjectId } from "mongodb";
import { getDatabase } from "../mongodb";
import { refreshCalendarFeedIfStale } from "./calendarSyncService";
import {
  CustomerInquiry,
  CreateInquiryDto,
  UpdateInquiryDto,
  InquiryFilterOptions,
  InquiryStats,
  InquiryNote,
  InquiryAvailability,
} from "@/lib/types/inquiry";
import { calculateStayQuote } from "@/lib/pricing/calculator";
import {
  getBaseRate,
  listSeasonalRules,
  listAdditionalCharges,
} from "@/lib/db/services/pricingService";

const COLLECTION_NAME = "inquiries";

async function getInquiryCollection() {
  const db = await getDatabase();
  return db.collection(COLLECTION_NAME);
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
    console.warn("Could not log inquiry activity:", err);
  }
}

/**
 * Seeds initial realistic inquiries if collection is empty.
 */
export async function ensureSeedInquiries(): Promise<void> {
  const collection = await getInquiryCollection();
  const count = await collection.countDocuments();
  if (count > 0) return;

  const sampleInquiries: Omit<CustomerInquiry, "_id">[] = [
    {
      name: "Eleanor & James Vance",
      email: "eleanor.vance@luxurystays.com",
      phone: "+1 (415) 890-2341",
      subject: "Luxury Honeymoon Stay & Private Catamaran Charter",
      message:
        "Hello Villa B team, my fiancé and I are planning our honeymoon in Anguilla for late December 2026. We are enchanted by the panoramic ocean views and private infinity pool. Could you confirm if personalized private chef services and airport transfer from SXM or AXA can be arranged for our stay?",
      checkIn: "2026-12-22",
      checkOut: "2026-12-29",
      guests: 2,
      status: "new",
      isRead: false,
      notes: [],
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      name: "Marcus Sterling",
      email: "m.sterling@sterlingcap.com",
      phone: "+1 (212) 555-0198",
      subject: "Full Villa Buyout — Multi-Generational Family Reunion",
      message:
        "We are looking to reserve the entire 5-bedroom estate for a milestone family gathering of 10 guests. We would appreciate detailed information regarding bedroom bedding configurations (king vs twin options) and whether daily housekeeping is included.",
      checkIn: "2026-11-14",
      checkOut: "2026-11-21",
      guests: 10,
      status: "contacted",
      isRead: true,
      notes: [
        {
          id: "note_1",
          content:
            "Spoke with Marcus via phone. Sent him our digital villa brochure, estate floorplans, and seasonal rate calculation.",
          author: "admin",
          createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 28 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      name: "Dr. Sophia Lin",
      email: "sophia.lin@wellnessfoundry.io",
      phone: "+44 20 7946 0912",
      subject: "Executive Leadership Retreat — Dates & Concierge",
      message:
        "Good morning, our executive board is exploring Villa B on the Sea for an exclusive 5-night retreat. We require high-speed reliable Wi-Fi for international videoconferencing and are interested in on-site sunrise yoga sessions.",
      checkIn: "2026-10-18",
      checkOut: "2026-10-23",
      guests: 8,
      status: "in_progress",
      isRead: true,
      notes: [
        {
          id: "note_2",
          content:
            "Confirmed Starlink satellite Wi-Fi speed (220+ Mbps). Reached out to certified local yoga instructor for morning sessions.",
          author: "admin",
          createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
    {
      name: "David K. Rothschild",
      email: "david@rothschild-advisors.ch",
      phone: "+41 22 900 1122",
      subject: "Annual Villa Anniversary Booking",
      message:
        "Returning guest inquiring about our traditional September anniversary reservation. Looking forward to enjoying the sunset deck once again.",
      checkIn: "2026-09-15",
      checkOut: "2026-09-22",
      guests: 4,
      status: "resolved",
      isRead: true,
      notes: [
        {
          id: "note_3",
          content:
            "Reservation completed and confirmed on calendar (Booking ID #BK-2026-001). Deposit secured.",
          author: "admin",
          createdAt: new Date(Date.now() - 96 * 3600000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 120 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 96 * 3600000).toISOString(),
    },
    {
      name: "Chloe Bennet",
      email: "chloe.b@eventsbychloe.com",
      phone: "+1 (305) 555-7832",
      subject: "Wedding Reception & Photography Inquiries",
      message:
        "Inquiring on behalf of a client regarding hosting an intimate 25-person wedding ceremony and cocktail reception on the oceanfront lawn.",
      status: "archived",
      isRead: true,
      notes: [
        {
          id: "note_4",
          content:
            "Informed event planner that maximum estate event occupancy is limited to registered overnight guests per island zoning rules.",
          author: "admin",
          createdAt: new Date(Date.now() - 200 * 3600000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 240 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 200 * 3600000).toISOString(),
    },
  ];

  await collection.insertMany(sampleInquiries as any);
  await logActivity(
    "INQUIRIES_SEEDED",
    `Initialized ${sampleInquiries.length} customer inquiries with notes`
  );
}

/**
 * Checks in real time whether the requested dates overlap with an existing booking or blocked date.
 */
export async function checkInquiryAvailability(
  checkIn: string,
  checkOut: string
): Promise<InquiryAvailability> {
  if (checkIn >= checkOut) {
    return {
      isAvailable: false,
      hasConflict: true,
      conflictReason: "Check-out date must be strictly after check-in date",
    };
  }

  await refreshCalendarFeedIfStale();
  const db = await getDatabase();

  // 1. Check bookings collection (confirmed, completed, pending)
  const conflictingBooking = await db.collection("bookings").findOne({
    status: { $in: ["confirmed", "completed", "pending"] },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });

  if (conflictingBooking) {
    const ref = conflictingBooking.bookingRef || "Confirmed Booking";
    return {
      isAvailable: false,
      hasConflict: true,
      conflictType: "booking",
      conflictRef: ref,
      conflictReason: `Already booked (${conflictingBooking.checkIn} → ${conflictingBooking.checkOut}) for ${conflictingBooking.guestName || "Guest"}`,
    };
  }

  // 2. Check blocked_dates collection
  const conflictingBlock = await db.collection("blocked_dates").findOne({
    startDate: { $lt: checkOut },
    endDate: { $gt: checkIn },
  });

  if (conflictingBlock) {
    const reason = conflictingBlock.reason || "Maintenance / Private hold";
    return {
      isAvailable: false,
      hasConflict: true,
      conflictType: "block",
      conflictRef: reason,
      conflictReason: `Dates blocked (${conflictingBlock.startDate} → ${conflictingBlock.endDate}): ${reason}`,
    };
  }

  // Imported iCalendar ranges store the final occupied night inclusively.
  const conflictingExternalEvent = await db.collection("external_calendar_events").findOne({
    source: "vrbo",
    startDate: { $lt: checkOut },
    endDate: { $gte: checkIn },
  });

  if (conflictingExternalEvent) {
    return {
      isAvailable: false,
      hasConflict: true,
      conflictType: "block",
      conflictRef: "VRBO calendar",
      conflictReason: `Dates are reserved on the connected VRBO calendar (${conflictingExternalEvent.startDate} to ${conflictingExternalEvent.endDate}).`,
    };
  }

  return {
    isAvailable: true,
    hasConflict: false,
  };
}

/**
 * Enriches an inquiry document with live availability status.
 */
export async function enrichInquiryWithAvailability(
  doc: any
): Promise<CustomerInquiry> {
  let availability: InquiryAvailability | undefined = undefined;

  if (doc.checkIn && doc.checkOut) {
    if (doc.status === "confirmed") {
      availability = {
        isAvailable: false,
        hasConflict: false,
        conflictReason: "Booking Confirmed & Dates Locked",
      };
    } else {
      availability = await checkInquiryAvailability(doc.checkIn, doc.checkOut);
    }
  }

  return {
    ...doc,
    _id: doc._id.toString(),
    availability,
  } as CustomerInquiry;
}

/**
 * Lists inquiries matching search and filter options.
 */
export async function listInquiries(
  filters: InquiryFilterOptions = {}
): Promise<CustomerInquiry[]> {
  await ensureSeedInquiries();
  const collection = await getInquiryCollection();

  const query: Record<string, any> = {};

  // Status filtering
  if (filters.status && filters.status !== "all") {
    query.status = filters.status;
  } else if (!filters.status || filters.status === "all") {
    // By default, hide archived unless specifically filtered
    query.status = { $ne: "archived" };
  }

  // Read status filter
  if (filters.readStatus === "read") {
    query.isRead = true;
  } else if (filters.readStatus === "unread") {
    query.isRead = false;
  }

  // Search filter
  if (filters.search && filters.search.trim()) {
    const regex = new RegExp(filters.search.trim(), "i");
    query.$or = [
      { name: regex },
      { email: regex },
      { subject: regex },
      { message: regex },
    ];
  }

  // Date range filter
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) query.createdAt.$gte = filters.dateFrom;
    if (filters.dateTo) query.createdAt.$lte = `${filters.dateTo}T23:59:59.999Z`;
  }

  const docs = await collection.find(query).sort({ createdAt: -1 }).toArray();

  return Promise.all(docs.map((doc) => enrichInquiryWithAvailability(doc)));
}

/**
 * Retrieves a single inquiry by ID with availability information.
 */
export async function getInquiryById(
  id: string
): Promise<CustomerInquiry | null> {
  const collection = await getInquiryCollection();
  if (!ObjectId.isValid(id)) return null;

  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;

  return enrichInquiryWithAvailability(doc);
}

/**
 * Confirms an inquiry, automatically creates a confirmed booking in MongoDB, and blocks the dates.
 */
export async function confirmInquiryBooking(
  inquiryId: string,
  adminAuthor = "admin"
): Promise<{ success: boolean; booking: any; inquiry: CustomerInquiry; error?: string }> {
  const collection = await getInquiryCollection();
  if (!ObjectId.isValid(inquiryId)) {
    return { success: false, booking: null, inquiry: null as any, error: "Invalid inquiry ID" };
  }

  const inquiry = await collection.findOne({ _id: new ObjectId(inquiryId) });
  if (!inquiry) {
    return { success: false, booking: null, inquiry: null as any, error: "Inquiry not found" };
  }

  if (!inquiry.checkIn || !inquiry.checkOut) {
    return {
      success: false,
      booking: null,
      inquiry: null as any,
      error: "Inquiry does not have check-in and check-out dates specified",
    };
  }

  // Check availability
  const availability = await checkInquiryAvailability(inquiry.checkIn, inquiry.checkOut);
  if (!availability.isAvailable) {
    return {
      success: false,
      booking: null,
      inquiry: null as any,
      error: `Cannot confirm booking: ${availability.conflictReason || "Dates conflict with existing reservation"}`,
    };
  }

  const db = await getDatabase();
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const bookingRef = `VB-${year}-${randomPart}`;

  // Calculate nights
  const start = new Date(inquiry.checkIn);
  const end = new Date(inquiry.checkOut);
  const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));

  // Calculate pricing amount
  let amount = 0;
  try {
    const [baseRate, seasons, charges] = await Promise.all([
      getBaseRate(),
      listSeasonalRules(),
      listAdditionalCharges(),
    ]);
    const quote = calculateStayQuote({
      checkIn: inquiry.checkIn,
      checkOut: inquiry.checkOut,
      guests: inquiry.guests || 2,
      baseRate,
      seasons,
      charges,
    });
    amount = quote.grandTotal;
  } catch {
    amount = nights * 1500;
  }

  const now = new Date().toISOString();
  const newBooking = {
    bookingRef,
    guestName: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone || "+1 (508) 633-7355",
    checkIn: inquiry.checkIn,
    checkOut: inquiry.checkOut,
    nights,
    guests: inquiry.guests || 2,
    accommodation: "Villa B on the Sea (Full Estate)",
    amount,
    paymentStatus: "pending" as const,
    status: "confirmed" as const,
    notes: `Booking confirmed from website inquiry #${inquiryId}. Guest message: "${inquiry.message}"`,
    inquiryId: inquiryId,
    createdAt: now,
    updatedAt: now,
  };

  const bookingResult = await db.collection("bookings").insertOne(newBooking);
  const bookingId = bookingResult.insertedId.toString();

  // Add confirmation note
  const confirmNote: InquiryNote = {
    id: `note_${Date.now()}_conf`,
    content: `Booking Confirmed (#${bookingRef}) by ${adminAuthor}. Dates ${inquiry.checkIn} to ${inquiry.checkOut} are now locked on the calendar.`,
    author: adminAuthor,
    createdAt: now,
  };

  await collection.updateOne(
    { _id: new ObjectId(inquiryId) },
    {
      $set: {
        status: "confirmed",
        bookingId,
        bookingRef,
        updatedAt: now,
      },
      $push: { notes: confirmNote },
    }
  );

  await logActivity(
    "BOOKING_CONFIRMED_FROM_INQUIRY",
    `Confirmed booking #${bookingRef} for ${inquiry.name} (${inquiry.checkIn} to ${inquiry.checkOut})`
  );

  const updatedDoc = await collection.findOne({ _id: new ObjectId(inquiryId) });
  const updatedInquiry = await enrichInquiryWithAvailability(updatedDoc);

  return {
    success: true,
    booking: { ...newBooking, _id: bookingId },
    inquiry: updatedInquiry,
  };
}

/**
 * Rejects an inquiry with a recorded reason without blocking any dates.
 */
export async function rejectInquiry(
  inquiryId: string,
  reason: string,
  adminAuthor = "admin"
): Promise<{ success: boolean; inquiry: CustomerInquiry; error?: string }> {
  const collection = await getInquiryCollection();
  if (!ObjectId.isValid(inquiryId)) {
    return { success: false, inquiry: null as any, error: "Invalid inquiry ID" };
  }

  const now = new Date().toISOString();
  const rejectNote: InquiryNote = {
    id: `note_${Date.now()}_rej`,
    content: `Inquiry Rejected by ${adminAuthor}. Reason: ${reason}`,
    author: adminAuthor,
    createdAt: now,
  };

  await collection.updateOne(
    { _id: new ObjectId(inquiryId) },
    {
      $set: {
        status: "rejected",
        rejectionReason: reason,
        updatedAt: now,
      },
      $push: { notes: rejectNote },
    }
  );

  await logActivity(
    "INQUIRY_REJECTED",
    `Rejected inquiry #${inquiryId}. Reason: ${reason}`
  );

  const updatedDoc = await collection.findOne({ _id: new ObjectId(inquiryId) });
  const updatedInquiry = await enrichInquiryWithAvailability(updatedDoc);

  return {
    success: true,
    inquiry: updatedInquiry,
  };
}

/**
 * Creates a new customer inquiry.
 */
export async function createInquiry(
  dto: CreateInquiryDto
): Promise<CustomerInquiry> {
  const collection = await getInquiryCollection();

  const now = new Date().toISOString();
  const newDoc = {
    name: dto.name.trim(),
    email: dto.email.trim().toLowerCase(),
    phone: dto.phone ? dto.phone.trim() : undefined,
    subject: dto.subject.trim(),
    message: dto.message.trim(),
    checkIn: dto.checkIn || undefined,
    checkOut: dto.checkOut || undefined,
    guests: dto.guests ? Number(dto.guests) : undefined,
    status: "new" as const,
    isRead: false,
    notes: [],
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(newDoc as any);
  await logActivity(
    "INQUIRY_CREATED",
    `New inquiry from ${newDoc.name}: "${newDoc.subject}"`
  );

  return {
    ...newDoc,
    _id: result.insertedId.toString(),
  };
}

/**
 * Updates status, read state, or adds an internal note to an inquiry.
 */
export async function updateInquiry(
  id: string,
  updates: UpdateInquiryDto,
  adminAuthor = "admin"
): Promise<CustomerInquiry | null> {
  const collection = await getInquiryCollection();
  if (!ObjectId.isValid(id)) return null;

  const updateFields: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };

  if (updates.status !== undefined) updateFields.status = updates.status;
  if (updates.isRead !== undefined) updateFields.isRead = updates.isRead;

  const updateOperation: Record<string, any> = {
    $set: updateFields,
  };

  // Add private internal note if provided
  if (updates.addNote && updates.addNote.trim()) {
    const newNote: InquiryNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      content: updates.addNote.trim(),
      author: adminAuthor,
      createdAt: new Date().toISOString(),
    };
    updateOperation.$push = { notes: newNote };
  }

  await collection.updateOne({ _id: new ObjectId(id) }, updateOperation);

  const updated = await collection.findOne({ _id: new ObjectId(id) });
  if (updated) {
    let details = `Updated inquiry from ${updated.name}`;
    if (updates.status) details += ` (Status: ${updates.status})`;
    if (updates.addNote) details += ` (Added internal note)`;
    await logActivity("INQUIRY_UPDATED", details);

    return {
      ...updated,
      _id: updated._id.toString(),
    } as CustomerInquiry;
  }

  return null;
}

/**
 * Archives an inquiry.
 */
export async function archiveInquiry(id: string): Promise<boolean> {
  return (await updateInquiry(id, { status: "archived" })) !== null;
}

/**
 * Permanently deletes or archives an inquiry.
 */
export async function deleteInquiry(
  id: string,
  permanent = false
): Promise<boolean> {
  const collection = await getInquiryCollection();
  if (!ObjectId.isValid(id)) return false;

  if (permanent) {
    const item = await collection.findOne({ _id: new ObjectId(id) });
    const res = await collection.deleteOne({ _id: new ObjectId(id) });
    if (res.deletedCount > 0) {
      await logActivity(
        "INQUIRY_PERMANENTLY_DELETED",
        `Permanently deleted inquiry from ${item?.name || id}`
      );
      return true;
    }
    return false;
  } else {
    return archiveInquiry(id);
  }
}

/**
 * Computes statistics for dashboard and inquiry control cards.
 */
export async function getInquiryStats(): Promise<InquiryStats> {
  await ensureSeedInquiries();
  const collection = await getInquiryCollection();

  const all = await collection.find({}).toArray();

  let unread = 0;
  let newCount = 0;
  let contactedCount = 0;
  let inProgressCount = 0;
  let confirmedCount = 0;
  let rejectedCount = 0;
  let resolvedCount = 0;
  let archivedCount = 0;

  for (const item of all) {
    if (!item.isRead) unread++;
    if (item.status === "new") newCount++;
    if (item.status === "contacted") contactedCount++;
    if (item.status === "in_progress") inProgressCount++;
    if (item.status === "confirmed") confirmedCount++;
    if (item.status === "rejected") rejectedCount++;
    if (item.status === "resolved") resolvedCount++;
    if (item.status === "archived") archivedCount++;
  }

  return {
    total: all.length,
    unread,
    newCount,
    contactedCount,
    inProgressCount,
    confirmedCount,
    rejectedCount,
    resolvedCount,
    archivedCount,
  };
}
