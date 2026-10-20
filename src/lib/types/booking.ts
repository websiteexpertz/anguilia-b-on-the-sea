export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type PaymentStatus = "pending" | "paid" | "partially_paid" | "refunded";

export interface Booking {
  _id: string;
  bookingRef: string;
  guestName: string;
  email: string;
  phone: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  guests: number;
  accommodation: string;
  amount: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingFilterOptions {
  search?: string;
  status?: BookingStatus | "all";
  timeframe?: "all" | "upcoming" | "past";
  sortBy?: "checkIn" | "checkOut" | "createdAt" | "amount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CreateBookingDto {
  guestName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  accommodation?: string;
  amount: number;
  paymentStatus?: PaymentStatus;
  status?: BookingStatus;
  notes?: string;
}

export interface UpdateBookingDto {
  guestName?: string;
  email?: string;
  phone?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  accommodation?: string;
  amount?: number;
  paymentStatus?: PaymentStatus;
  status?: BookingStatus;
  notes?: string;
}
