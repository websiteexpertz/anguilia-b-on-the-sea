export type DateStatus = "available" | "booked" | "blocked" | "pending";

export type BlockReason =
  | "Maintenance"
  | "Owner stay"
  | "Renovation"
  | "Private booking"
  | "Seasonal closure"
  | "Other"
  | "External calendar";

export interface BlockedDateRecord {
  _id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  dates: string[]; // List of YYYY-MM-DD strings
  reason: BlockReason;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  status: DateStatus;
  isCheckIn?: boolean;
  isCheckOut?: boolean;
  bookingDetails?: {
    id: string;
    bookingRef: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    status: string;
  };
  blockDetails?: {
    id: string;
    reason: BlockReason;
    notes?: string;
    startDate: string;
    endDate: string;
  };
}

export interface CreateBlockDto {
  startDate: string;
  endDate: string;
  reason: BlockReason;
  notes?: string;
}

export interface MonthAvailabilityResponse {
  year: number;
  month: number;
  monthName: string;
  days: CalendarDay[];
  summary: {
    totalDays: number;
    availableCount: number;
    bookedCount: number;
    blockedCount: number;
    pendingCount: number;
  };
}
