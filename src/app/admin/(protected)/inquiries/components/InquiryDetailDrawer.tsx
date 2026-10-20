"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  LockClosedIcon,
  PlusIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { CustomerInquiry, InquiryStatus } from "@/lib/types/inquiry";

interface InquiryDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: CustomerInquiry | null;
  onStatusChange: (id: string, status: InquiryStatus) => Promise<void>;
  onToggleRead: (inquiry: CustomerInquiry) => Promise<void>;
  onAddNote: (id: string, noteText: string) => Promise<void>;
  onDelete: (inquiry: CustomerInquiry) => void;
  onConfirmBooking: (inquiry: CustomerInquiry) => Promise<void>;
  onRequestReject: (inquiry: CustomerInquiry) => void;
}

export default function InquiryDetailDrawer({
  isOpen,
  onClose,
  inquiry,
  onStatusChange,
  onToggleRead,
  onAddNote,
  onDelete,
  onConfirmBooking,
  onRequestReject,
}: InquiryDetailDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !inquiry || !mounted) return null;

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSavingNote(true);
    try {
      await onAddNote(inquiry._id, newNote.trim());
      setNewNote("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleConfirmClick = async () => {
    if (
      !window.confirm(
        `Are you sure you want to confirm this booking for ${inquiry.name} from ${inquiry.checkIn} to ${inquiry.checkOut}?\n\nThis will create a confirmed booking and immediately block these dates on the live website calendar.`
      )
    ) {
      return;
    }

    setIsConfirming(true);
    try {
      await onConfirmBooking(inquiry);
    } catch (err: any) {
      alert(err.message || "Failed to confirm booking");
    } finally {
      setIsConfirming(false);
    }
  };

  const formattedDate = new Date(inquiry.createdAt).toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isConfirmed = inquiry.status === "confirmed";
  const isRejected = inquiry.status === "rejected";
  const hasDates = !!(inquiry.checkIn && inquiry.checkOut);
  const isAvailable = inquiry.availability?.isAvailable;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#E7E5E4] animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#F4EFE9] flex items-center justify-between bg-gradient-to-r from-stone-50 to-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#F4EFE9] text-[#C88A4B] flex items-center justify-center shrink-0">
              <EnvelopeIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-lg font-bold text-stone-900 truncate">
                {inquiry.name}
              </h3>
              <p className="text-xs text-stone-500 truncate">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleRead(inquiry)}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-[#F4EFE9] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title={inquiry.isRead ? "Mark as unread" : "Mark as read"}
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {inquiry.isRead ? "Read" : "Mark Read"}
              </span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-[#F4EFE9] transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Quick Contact Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                Inquiry Status
              </span>
              <select
                value={inquiry.status}
                onChange={(e) =>
                  onStatusChange(inquiry._id, e.target.value as InquiryStatus)
                }
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:border-[#C88A4B] shadow-2xs"
              >
                <option value="new">New Lead</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(
                  inquiry.subject
                )} — Villa B on the Sea`}
                className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-800 text-xs font-semibold hover:bg-stone-100 flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <EnvelopeIcon className="w-3.5 h-3.5 text-[#C88A4B]" />
                <span>Reply Email</span>
              </a>
              {inquiry.phone && (
                <a
                  href={`tel:${inquiry.phone}`}
                  className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-800 text-xs font-semibold hover:bg-stone-100 flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <PhoneIcon className="w-3.5 h-3.5 text-[#C88A4B]" />
                  <span>Call</span>
                </a>
              )}
            </div>
          </div>

          {/* Date Availability & Booking Action Banner */}
          {hasDates && (
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isConfirmed
                  ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                  : isRejected
                  ? "bg-rose-50/80 border-rose-200 text-rose-950"
                  : isAvailable
                  ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                  : "bg-amber-50/70 border-amber-200 text-amber-950"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70 mb-1">
                    Calendar Availability Check
                  </span>
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="w-4 h-4 text-[#C88A4B]" />
                    <span className="font-bold text-sm">
                      {inquiry.checkIn} → {inquiry.checkOut}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                {isConfirmed ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                    Booking Confirmed
                  </span>
                ) : isRejected ? (
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold shadow-xs">
                    Rejected
                  </span>
                ) : isAvailable ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping" />
                    Dates Available
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold shadow-xs">
                    Dates Conflict
                  </span>
                )}
              </div>

              {/* Conflict / Status details */}
              <div className="text-xs mb-4 leading-relaxed">
                {isConfirmed ? (
                  <p className="text-emerald-800 font-medium">
                    This inquiry is confirmed as booking <strong>#{inquiry.bookingRef || "CONFIRMED"}</strong>. The requested dates are now locked on the live website calendar.
                  </p>
                ) : isRejected ? (
                  <p className="text-rose-800 font-medium">
                    This inquiry was rejected. Reason: <em>&ldquo;{inquiry.rejectionReason || "Dates unavailable"}&rdquo;</em>. Dates remain open on the calendar.
                  </p>
                ) : isAvailable ? (
                  <p className="text-emerald-800">
                    Villa is 100% free with no conflicting reservations or maintenance holds. You can confirm this booking directly.
                  </p>
                ) : (
                  <p className="text-rose-800 font-medium">
                    ⚠️ {inquiry.availability?.conflictReason || "Requested dates overlap with another reservation or maintenance block."}
                  </p>
                )}
              </div>

              {/* Action Buttons if not already confirmed or rejected */}
              {!isConfirmed && !isRejected && (
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-black/5">
                  <button
                    type="button"
                    disabled={isConfirming || !isAvailable}
                    onClick={handleConfirmClick}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>
                      {isConfirming ? "Locking Dates..." : "Confirm Booking & Block Dates"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRequestReject(inquiry)}
                    className="px-4 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <XMarkIcon className="w-4 h-4 text-rose-500" />
                    <span>Reject Inquiry</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Customer Contacts */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Guest Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#FDFBF7] p-4 rounded-2xl border border-[#E7E5E4]">
              <div>
                <span className="text-stone-400 block text-[11px]">Email Address</span>
                <span className="font-semibold text-stone-800 select-all">
                  {inquiry.email}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Phone Number</span>
                <span className="font-semibold text-stone-800">
                  {inquiry.phone || "Not provided"}
                </span>
              </div>
            </div>
          </div>

          {/* Stay Parameters */}
          {(inquiry.checkIn || inquiry.guests) && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Requested Reservation Parameters
              </h4>
              <div className="flex flex-wrap items-center gap-4 bg-[#F4EFE9]/40 p-4 rounded-2xl border border-[#E7E5E4] text-xs">
                {inquiry.checkIn && (
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="w-4 h-4 text-[#C88A4B]" />
                    <span className="font-semibold text-stone-800">
                      {inquiry.checkIn} to {inquiry.checkOut || "Open"}
                    </span>
                  </div>
                )}
                {inquiry.guests && (
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="w-4 h-4 text-[#C88A4B]" />
                    <span className="font-semibold text-stone-800">
                      {inquiry.guests} Registered Guests
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message Box */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Inquiry Message
            </h4>
            <div className="p-4 rounded-2xl bg-white border border-[#E7E5E4] shadow-xs space-y-2">
              <h5 className="font-serif text-sm font-bold text-stone-900">
                {inquiry.subject}
              </h5>
              <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap">
                {inquiry.message}
              </p>
            </div>
          </div>

          {/* Internal Notes Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-stone-700">
                <LockClosedIcon className="w-4 h-4 text-[#C88A4B]" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Internal Private Notes
                </h4>
              </div>
              <span className="text-[10px] text-stone-400">Never shown to guest</span>
            </div>

            {/* Existing Notes Timeline */}
            <div className="space-y-2.5">
              {inquiry.notes && inquiry.notes.length > 0 ? (
                inquiry.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-stone-400">
                      <span className="font-bold text-[#C88A4B] uppercase">
                        {note.author}
                      </span>
                      <span>
                        {new Date(note.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-stone-700 leading-relaxed">{note.content}</p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-stone-50/60 border border-dashed border-stone-200 text-[11px] text-stone-400 text-center">
                  No internal notes recorded yet.
                </div>
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleNoteSubmit} className="space-y-2 pt-1">
              <textarea
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a private note for the team (e.g., 'Offered 10% returning guest discount')..."
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#C88A4B] focus:bg-white text-stone-800 resize-none transition-colors"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingNote || !newNote.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-800 text-white text-xs font-semibold hover:bg-stone-900 disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>{isSavingNote ? "Adding Note..." : "Add Note"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 border-t border-[#F4EFE9] flex items-center justify-between bg-stone-50/50">
          <button
            onClick={() => onDelete(inquiry)}
            className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <TrashIcon className="w-4 h-4" />
            <span>Archive / Delete</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
