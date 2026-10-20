import { getDatabase } from "../mongodb";
import {
  DashboardData,
  BookingRecord,
  InquiryRecord,
  AvailabilitySummary,
  ActivityItem,
  RevenueDataPoint,
} from "../../types/dashboard";

/**
 * Service to aggregate metrics and data for the Admin Dashboard
 */
export async function getDashboardData(
  period: "7d" | "30d" | "90d" | "1y" = "30d"
): Promise<DashboardData> {
  try {
    const db = await getDatabase();

    // 1. Fetch Bookings
    let bookings: any[] = [];
    try {
      bookings = await db
        .collection("bookings")
        .find()
        .sort({ createdAt: -1, checkIn: -1 })
        .limit(20)
        .toArray();
    } catch {
      bookings = [];
    }

    // 2. Fetch Inquiries
    let inquiries: any[] = [];
    try {
      inquiries = await db
        .collection("inquiries")
        .find()
        .sort({ date: -1, createdAt: -1 })
        .limit(20)
        .toArray();
    } catch {
      inquiries = [];
    }

    // 3. Fetch Blocked Dates / Availability records
    let blockedRecords: any[] = [];
    try {
      blockedRecords = await db
        .collection("availability")
        .find()
        .toArray();
    } catch {
      blockedRecords = [];
    }

    // 4. Fetch Activities
    let activities: any[] = [];
    try {
      activities = await db
        .collection("activities")
        .find()
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();
    } catch {
      activities = [];
    }

    // --- Calculations ---

    // Total Bookings
    const totalBookings = bookings.length;

    // Total Inquiries & Unread
    const totalInquiries = inquiries.length;
    const unreadInquiries = inquiries.filter(
      (inq) => inq.status === "new" || !inq.status
    ).length;

    // Revenue
    const confirmedOrCompletedBookings = bookings.filter(
      (b) => b.status === "confirmed" || b.status === "completed"
    );
    const totalRevenue = confirmedOrCompletedBookings.reduce(
      (sum, b) => sum + (Number(b.amount) || 0),
      0
    );

    // Availability in next 30 days
    const bookedDatesSet = new Set<string>();
    bookings.forEach((b) => {
      if (b.checkIn && b.checkOut && b.status !== "cancelled") {
        // Collect dates
        const start = new Date(b.checkIn);
        const end = new Date(b.checkOut);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            bookedDatesSet.add(d.toISOString().split("T")[0]);
          }
        }
      }
    });

    const blockedDatesSet = new Set<string>();
    blockedRecords.forEach((r) => {
      if (r.date) {
        blockedDatesSet.add(r.date);
      }
    });

    const bookedCount = bookedDatesSet.size;
    const blockedCount = blockedDatesSet.size;
    const totalDaysWindow = 30;
    const availableDates = Math.max(0, totalDaysWindow - bookedCount - blockedCount);

    // Today's Status
    const todayStr = new Date().toISOString().split("T")[0];
    let todayStatus: "available" | "booked" | "blocked" = "available";
    if (bookedDatesSet.has(todayStr)) {
      todayStatus = "booked";
    } else if (blockedDatesSet.has(todayStr)) {
      todayStatus = "blocked";
    }

    // Revenue time series points
    const revenuePoints: RevenueDataPoint[] = [];
    if (totalRevenue > 0) {
      // Group confirmed bookings by date/period
      const daysCount = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
      const step = daysCount <= 14 ? 1 : daysCount <= 30 ? 3 : daysCount <= 90 ? 7 : 30;

      const now = new Date();
      for (let i = daysCount; i >= 0; i -= step) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        // Sum amounts matching this date window
        const amount = confirmedOrCompletedBookings
          .filter((b) => {
            const bDate = b.createdAt ? new Date(b.createdAt) : new Date(b.checkIn);
            return !isNaN(bDate.getTime()) && Math.abs(bDate.getTime() - d.getTime()) < step * 86400000;
          })
          .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

        revenuePoints.push({
          date: dateStr,
          label,
          amount,
        });
      }
    }

    const recentBookings: BookingRecord[] = bookings.slice(0, 5).map((b) => ({
      _id: b._id?.toString() || Math.random().toString(36).substring(7),
      guestName: b.guestName || "Guest",
      email: b.email,
      checkIn: b.checkIn || "",
      checkOut: b.checkOut || "",
      guests: Number(b.guests) || 1,
      status: b.status || "pending",
      amount: Number(b.amount) || 0,
      createdAt: b.createdAt,
    }));

    const recentInquiries: InquiryRecord[] = inquiries.slice(0, 5).map((inq) => ({
      _id: inq._id?.toString() || Math.random().toString(36).substring(7),
      customerName: inq.customerName || inq.name || "Customer",
      email: inq.email || "",
      subject: inq.subject || "Villa Inquiries",
      messagePreview: inq.message ? inq.message.slice(0, 80) + (inq.message.length > 80 ? "..." : "") : "No message preview available",
      date: inq.date || inq.createdAt || todayStr,
      status: inq.status || "new",
    }));

    const recentActivities: ActivityItem[] = activities.slice(0, 8).map((a) => ({
      id: a._id?.toString() || a.id || Math.random().toString(36).substring(7),
      type: a.type || "booking_new",
      title: a.title || "System Activity",
      description: a.description || "",
      timestamp: a.timestamp || a.createdAt || todayStr,
    }));

    const availabilitySummary: AvailabilitySummary = {
      todayStatus,
      upcomingBookedDates: Array.from(bookedDatesSet).slice(0, 5),
      upcomingBlockedDates: Array.from(blockedDatesSet).slice(0, 5),
      nextAvailableDate: todayStatus === "available" ? "Today (Immediate)" : "Next week",
    };

    return {
      summary: {
        totalBookings,
        bookingsPeriodComparison: totalBookings > 0 ? "+0% vs last month" : null,
        bookingsTrend: "neutral",
        totalInquiries,
        unreadInquiries,
        inquiriesTrend: unreadInquiries > 0 ? "up" : "neutral",
        totalRevenue,
        revenuePeriod: period === "7d" ? "Past 7 days" : period === "30d" ? "Past 30 days" : period === "90d" ? "Past 90 days" : "Past 12 months",
        revenueTrend: "neutral",
        availableDates,
        bookedDates: bookedCount,
        blockedDates: blockedCount,
      },
      recentBookings,
      recentInquiries,
      availability: availabilitySummary,
      revenue: {
        period,
        total: totalRevenue,
        dataPoints: revenuePoints,
      },
      recentActivities,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Return empty fallback instead of crashing
    return {
      summary: {
        totalBookings: 0,
        bookingsPeriodComparison: null,
        bookingsTrend: "neutral",
        totalInquiries: 0,
        unreadInquiries: 0,
        inquiriesTrend: "neutral",
        totalRevenue: 0,
        revenuePeriod: "Past 30 days",
        revenueTrend: "neutral",
        availableDates: 30,
        bookedDates: 0,
        blockedDates: 0,
      },
      recentBookings: [],
      recentInquiries: [],
      availability: {
        todayStatus: "available",
        upcomingBookedDates: [],
        upcomingBlockedDates: [],
        nextAvailableDate: "Today (Immediate)",
      },
      revenue: {
        period,
        total: 0,
        dataPoints: [],
      },
      recentActivities: [],
    };
  }
}
