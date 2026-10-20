"use client";

import React, { useState, useEffect, useCallback } from "react";
import BookingFilters from "./components/BookingFilters";
import BookingListTable from "./components/BookingListTable";
import BookingDetailDrawer from "./components/BookingDetailDrawer";
import BookingFormModal from "./components/BookingFormModal";
import CancelConfirmModal from "./components/CancelConfirmModal";
import {
  Booking,
  BookingStatus,
  CreateBookingDto,
  UpdateBookingDto,
} from "@/lib/types/booking";
import {
  PlusIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Sorting state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [timeframe, setTimeframe] = useState<"all" | "upcoming" | "past">("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Drawers & Modals state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchBookings = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (status !== "all") params.set("status", status);
      if (timeframe !== "all") params.set("timeframe", timeframe);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      params.set("page", page.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch bookings list");

      const json = await res.json();
      if (json.success && json.data) {
        setBookings(json.data.bookings || []);
        setTotal(json.data.total || 0);
        setPage(json.data.page || 1);
        setTotalPages(json.data.totalPages || 1);
      }
    } catch (err: any) {
      console.error("Bookings fetch error:", err);
      setErrorMessage("Unable to load bookings from database. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [search, status, timeframe, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Handle Create or Update submission
  const handleFormSubmit = async (formData: CreateBookingDto | UpdateBookingDto) => {
    if (editingBooking) {
      // Edit
      const res = await fetch(`/api/admin/bookings/${editingBooking._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update booking");
      }
      showToast(`Booking ${data.booking.bookingRef} updated successfully`);
      if (selectedBooking && selectedBooking._id === editingBooking._id) {
        setSelectedBooking(data.booking);
      }
    } else {
      // Create
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking");
      }
      showToast(`Booking ${data.booking.bookingRef} created successfully`);
    }

    setEditingBooking(null);
    setFormModalOpen(false);
    fetchBookings();
  };

  // Handle direct status change
  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Status update failed");

      showToast(`Booking status changed to ${newStatus}`);
      setSelectedBooking(data.booking);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  // Handle saving notes
  const handleNotesSave = async (id: string, newNotes: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: newNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save notes");

      showToast("Notes saved successfully");
      setSelectedBooking(data.booking);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || "Failed to save notes");
    }
  };

  // Handle cancellation confirmation
  const handleCancelConfirm = async (bookingId: string, reason?: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancellation failed");

      showToast(`Booking ${data.booking.bookingRef} cancelled`);
      if (selectedBooking && selectedBooking._id === bookingId) {
        setSelectedBooking(data.booking);
      }
      fetchBookings();
    } catch (err: any) {
      alert(err.message || "Failed to cancel booking");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-20 right-6 z-50 bg-[#1C1917] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#C88A4B]/40 flex items-center gap-3 animate-fade-in text-xs font-semibold"
        >
          <CheckCircleIcon className="w-5 h-5 text-[#C88A4B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-3"
        >
          <ExclamationCircleIcon className="w-5 h-5 text-red-500 shrink-0" />
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Page Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
            Bookings Management
          </h2>
          <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
            Manage guest reservations, check-in dates, occupancy, and payments
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => fetchBookings(true)}
            disabled={isLoading || isRefreshing}
            className="p-2.5 rounded-xl border border-[#E7E5E4] bg-white text-[#78716C] hover:text-[#1C1917] hover:bg-[#F4EFE9] transition-all focus:outline-none"
            title="Refresh Bookings"
            aria-label="Refresh Bookings"
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#C88A4B]" : ""}`}
            />
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingBooking(null);
              setFormModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#2B2623] text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
          >
            <PlusIcon className="w-4 h-4 text-[#C88A4B]" />
            <span>Add Booking</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Component */}
      <BookingFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={(st) => {
          setStatus(st);
          setPage(1);
        }}
        timeframe={timeframe}
        onTimeframeChange={(tf) => {
          setTimeframe(tf);
          setPage(1);
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(field, order) => {
          setSortBy(field);
          setSortOrder(order);
          setPage(1);
        }}
      />

      {/* Main Table / Mobile Cards */}
      <BookingListTable
        bookings={bookings}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onSelectBooking={setSelectedBooking}
        onEditBooking={(b) => {
          setEditingBooking(b);
          setFormModalOpen(true);
        }}
        onCancelBooking={(b) => {
          setBookingToCancel(b);
          setCancelModalOpen(true);
        }}
        onAddBooking={() => {
          setEditingBooking(null);
          setFormModalOpen(true);
        }}
        isLoading={isLoading}
      />

      {/* Detail Slide-over Drawer */}
      <BookingDetailDrawer
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onEdit={(b) => {
          setSelectedBooking(null);
          setEditingBooking(b);
          setFormModalOpen(true);
        }}
        onCancel={(b) => {
          setBookingToCancel(b);
          setCancelModalOpen(true);
        }}
        onStatusChange={handleStatusChange}
        onNotesSave={handleNotesSave}
      />

      {/* Create / Edit Booking Modal */}
      <BookingFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingBooking(null);
        }}
        onSubmit={handleFormSubmit}
        initialBooking={editingBooking}
      />

      {/* Cancellation Confirmation Modal */}
      <CancelConfirmModal
        booking={bookingToCancel}
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setBookingToCancel(null);
        }}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}
