export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type InquiryStatus = "new" | "replied" | "archived";

export type ActivityType =
  | "booking_new"
  | "booking_confirmed"
  | "inquiry_new"
  | "inquiry_updated"
  | "date_blocked"
  | "date_released"
  | "review_added";

export interface SummaryCardsData {
  totalBookings: number;
  bookingsPeriodComparison: string | null;
  bookingsTrend: "up" | "down" | "neutral";
  totalInquiries: number;
  unreadInquiries: number;
  inquiriesTrend: "up" | "down" | "neutral";
  totalRevenue: number;
  revenuePeriod: string;
  revenueTrend: "up" | "down" | "neutral";
  availableDates: number;
  bookedDates: number;
  blockedDates: number;
}

export interface BookingRecord {
  _id: string;
  guestName: string;
  email?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: BookingStatus;
  amount: number;
  createdAt?: string;
}

export interface InquiryRecord {
  _id: string;
  customerName: string;
  email: string;
  subject: string;
  messagePreview: string;
  date: string;
  status: InquiryStatus;
}

export interface AvailabilitySummary {
  todayStatus: "available" | "booked" | "blocked";
  upcomingBookedDates: string[];
  upcomingBlockedDates: string[];
  nextAvailableDate: string | null;
}

export interface RevenueDataPoint {
  date: string;
  label: string;
  amount: number;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
}

export interface DashboardData {
  summary: SummaryCardsData;
  recentBookings: BookingRecord[];
  recentInquiries: InquiryRecord[];
  availability: AvailabilitySummary;
  revenue: {
    period: "7d" | "30d" | "90d" | "1y";
    total: number;
    dataPoints: RevenueDataPoint[];
  };
  recentActivities: ActivityItem[];
}
