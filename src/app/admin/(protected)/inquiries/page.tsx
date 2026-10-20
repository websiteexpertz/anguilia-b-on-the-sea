"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  EnvelopeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  CustomerInquiry,
  InquiryStatus,
  InquiryStats,
  UpdateInquiryDto,
} from "@/lib/types/inquiry";
import InquiryStatsCards from "./components/InquiryStatsCards";
import InquiryFilters from "./components/InquiryFilters";
import InquiryTable from "./components/InquiryTable";
import InquiryDetailDrawer from "./components/InquiryDetailDrawer";
import DeleteInquiryModal from "./components/DeleteInquiryModal";
import RejectInquiryModal from "./components/RejectInquiryModal";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [stats, setStats] = useState<InquiryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InquiryStatus | "all">("all");
  const [readStatus, setReadStatus] = useState<"all" | "read" | "unread">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Drawer & Modal states
  const [selectedInquiry, setSelectedInquiry] = useState<CustomerInquiry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerInquiry | null>(null);
  const [rejectTarget, setRejectTarget] = useState<CustomerInquiry | null>(null);

  // Toasts
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch inquiries from API
  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.append("status", status);
      if (readStatus !== "all") params.append("readStatus", readStatus);
      if (search.trim()) params.append("search", search.trim());
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const res = await fetch(`/api/admin/inquiries?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load inquiries");

      setInquiries(data.data || []);
      setStats(data.stats || null);

      // Refresh currently open drawer item if applicable
      if (selectedInquiry) {
        const updatedSelected = (data.data || []).find(
          (i: CustomerInquiry) => i._id === selectedInquiry._id
        );
        if (updatedSelected) {
          setSelectedInquiry(updatedSelected);
        }
      }
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Error loading inquiries",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, [status, readStatus, search, dateFrom, dateTo, selectedInquiry]);

  useEffect(() => {
    fetchInquiries();
  }, [status, readStatus, search, dateFrom, dateTo]);

  // Update inquiry status
  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setInquiries((prev) =>
        prev.map((inq) => (inq._id === id ? { ...inq, status: newStatus } : inq))
      );
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      showToast(`Inquiry marked as ${newStatus.replace("_", " ")}.`);
      fetchInquiries();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error updating status", "error");
    }
  };

  // Toggle read status
  const handleToggleRead = async (inquiry: CustomerInquiry) => {
    try {
      const nextRead = !inquiry.isRead;
      const res = await fetch(`/api/admin/inquiries/${inquiry._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: nextRead }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update read state");

      setInquiries((prev) =>
        prev.map((i) => (i._id === inquiry._id ? { ...i, isRead: nextRead } : i))
      );
      if (selectedInquiry && selectedInquiry._id === inquiry._id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, isRead: nextRead } : null));
      }

      showToast(nextRead ? "Inquiry marked as read." : "Inquiry marked as unread.");
      fetchInquiries();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error updating read state", "error");
    }
  };

  // Add internal note
  const handleAddNote = async (id: string, noteText: string) => {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addNote: noteText }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add internal note");

    showToast("Private note added to inquiry timeline.");
    await fetchInquiries();
  };

  // Archive inquiry
  const handleArchive = async (id: string) => {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to archive inquiry");

    if (selectedInquiry && selectedInquiry._id === id) {
      setSelectedInquiry(null);
    }
    showToast("Inquiry archived successfully.");
    await fetchInquiries();
  };

  // Permanently delete inquiry
  const handlePermanentDelete = async (id: string) => {
    const res = await fetch(`/api/admin/inquiries/${id}?permanent=true`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete inquiry");

    if (selectedInquiry && selectedInquiry._id === id) {
      setSelectedInquiry(null);
    }
    showToast("Inquiry permanently removed.");
    await fetchInquiries();
  };

  // Confirm inquiry booking & block dates
  const handleConfirmBooking = async (inquiry: CustomerInquiry) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry._id}/confirm`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to confirm booking.");
      }

      showToast(
        `Booking confirmed (#${data.data?.booking?.bookingRef || "NEW"})! Dates are now locked on the calendar.`
      );
      await fetchInquiries();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error confirming booking", "error");
      throw err;
    }
  };

  // Reject inquiry with reason
  const handleRejectInquiry = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reject inquiry.");
      }

      showToast("Inquiry rejected. Dates remain open on calendar.");
      setRejectTarget(null);
      await fetchInquiries();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error rejecting inquiry", "error");
      throw err;
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch("");
    setStatus("all");
    setReadStatus("all");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="space-y-7 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-medium transition-all animate-slide-up ${
            toast.type === "success"
              ? "bg-emerald-950 text-emerald-100 border-emerald-800"
              : "bg-rose-950 text-rose-100 border-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#78716C] mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#C88A4B] font-medium">Customer Inquiries</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Guest Inquiries & Leads
          </h1>
          <p className="text-xs text-[#78716C] mt-1">
            Manage customer leads, review requested dates with real-time calendar checks, and confirm or reject reservations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchInquiries()}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:bg-[#F4EFE9] transition-colors shadow-2xs cursor-pointer"
            title="Refresh list"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <InquiryStatsCards stats={stats} />

      {/* Search & Filter Controls */}
      <InquiryFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        readStatus={readStatus}
        onReadStatusChange={setReadStatus}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        stats={stats}
        onReset={handleResetFilters}
      />

      {/* Main Table / Mobile Cards */}
      <InquiryTable
        inquiries={inquiries}
        onSelectInquiry={(inq) => {
          setSelectedInquiry(inq);
          if (!inq.isRead) {
            handleToggleRead(inq);
          }
        }}
        onToggleRead={handleToggleRead}
        onStatusChange={handleStatusChange}
        onDelete={(inq) => setDeleteTarget(inq)}
        isLoading={isLoading}
      />

      {/* Detail Slide-over Drawer */}
      <InquiryDetailDrawer
        isOpen={!!selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        inquiry={selectedInquiry}
        onStatusChange={handleStatusChange}
        onToggleRead={handleToggleRead}
        onAddNote={handleAddNote}
        onDelete={(inq) => setDeleteTarget(inq)}
        onConfirmBooking={handleConfirmBooking}
        onRequestReject={(inq) => setRejectTarget(inq)}
      />

      {/* Delete / Archive Confirmation Modal */}
      <DeleteInquiryModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        inquiry={deleteTarget}
        onArchive={handleArchive}
        onPermanentDelete={handlePermanentDelete}
      />

      {/* Reject Inquiry Modal with Reason */}
      <RejectInquiryModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        inquiry={rejectTarget}
        onReject={handleRejectInquiry}
      />
    </div>
  );
}
