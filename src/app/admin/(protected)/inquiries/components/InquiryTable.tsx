"use client";

import React from "react";
import {
  EnvelopeIcon,
  EnvelopeOpenIcon,
  EyeIcon,
  TrashIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  PhoneIcon,
  ChatBubbleLeftEllipsisIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { CustomerInquiry, InquiryStatus } from "@/lib/types/inquiry";

interface InquiryTableProps {
  inquiries: CustomerInquiry[];
  onSelectInquiry: (inquiry: CustomerInquiry) => void;
  onToggleRead: (inquiry: CustomerInquiry) => void;
  onStatusChange: (id: string, newStatus: InquiryStatus) => void;
  onDelete: (inquiry: CustomerInquiry) => void;
  isLoading?: boolean;
}

export default function InquiryTable({
  inquiries,
  onSelectInquiry,
  onToggleRead,
  onStatusChange,
  onDelete,
  isLoading,
}: InquiryTableProps) {
  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case "new":
        return {
          label: "New Lead",
          classes: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "contacted":
        return {
          label: "Contacted",
          classes: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "in_progress":
        return {
          label: "In Progress",
          classes: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "resolved":
        return {
          label: "Resolved",
          classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "confirmed":
        return {
          label: "Confirmed",
          classes: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
        };
      case "rejected":
        return {
          label: "Rejected",
          classes: "bg-rose-50 text-rose-700 border-rose-200 font-semibold",
        };
      case "archived":
        return {
          label: "Archived",
          classes: "bg-stone-100 text-stone-600 border-stone-200",
        };
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-sm space-y-4 animate-pulse">
        <div className="h-6 bg-[#F4EFE9] rounded w-1/4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-[#F4EFE9] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-12 text-center max-w-lg mx-auto shadow-sm space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[#F4EFE9] text-[#C88A4B] flex items-center justify-center mx-auto">
          <EnvelopeOpenIcon className="w-7 h-7" />
        </div>
        <h3 className="font-serif text-lg font-bold text-stone-900">
          No Inquiries Found
        </h3>
        <p className="text-xs text-stone-500">
          No customer inquiries matched the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-sm overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#F4EFE9] bg-[#FDFBF7]/60 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-8"></th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Subject & Message</th>
              <th className="py-3.5 px-4">Requested Stay</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4EFE9] text-xs text-stone-700">
            {inquiries.map((inq) => {
              const badge = getStatusBadge(inq.status);
              return (
                <tr
                  key={inq._id}
                  onClick={() => onSelectInquiry(inq)}
                  className={`hover:bg-[#F4EFE9]/40 transition-colors cursor-pointer group ${
                    !inq.isRead ? "bg-[#FDFBF7] font-semibold" : ""
                  }`}
                >
                  {/* Unread indicator */}
                  <td className="py-4 px-4 text-center">
                    {!inq.isRead && (
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full bg-[#C88A4B] ring-4 ring-[#C88A4B]/20"
                        title="Unread Inquiry"
                      />
                    )}
                  </td>

                  {/* Customer */}
                  <td className="py-4 px-4">
                    <p className="font-serif text-sm font-bold text-stone-900 truncate">
                      {inq.name}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">{inq.email}</p>
                    {inq.phone && (
                      <p className="text-[11px] text-stone-400 truncate">{inq.phone}</p>
                    )}
                  </td>

                  {/* Subject & Snippet */}
                  <td className="py-4 px-4 max-w-xs">
                    <p className="font-semibold text-stone-900 truncate group-hover:text-[#C88A4B] transition-colors">
                      {inq.subject}
                    </p>
                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {inq.message}
                    </p>
                    {inq.notes && inq.notes.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-[#C88A4B] mt-1 font-semibold">
                        <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5" />
                        <span>{inq.notes.length} internal note{inq.notes.length > 1 ? "s" : ""}</span>
                      </div>
                    )}
                  </td>

                  {/* Stay details */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {inq.checkIn && inq.checkOut ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-stone-800 font-medium">
                          <CalendarDaysIcon className="w-3.5 h-3.5 text-[#C88A4B]" />
                          <span>
                            {inq.checkIn} → {inq.checkOut}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {inq.guests && (
                            <span className="text-[11px] text-stone-500">
                              {inq.guests} Guests
                            </span>
                          )}
                          {inq.status === "confirmed" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              Dates Locked
                            </span>
                          ) : inq.availability ? (
                            inq.availability.isAvailable ? (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                                title="Dates are 100% free on calendar"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Available
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200"
                                title={inq.availability.conflictReason || "Dates conflict with an existing reservation"}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Conflict: {inq.availability.conflictType === "block" ? "Blocked" : "Booked"}
                              </span>
                            )
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <span className="text-stone-400 text-[11px]">General inquiry</span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 whitespace-nowrap text-stone-500 text-[11px]">
                    {formatDate(inq.createdAt)}
                  </td>

                  {/* Status */}
                  <td
                    className="py-4 px-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={inq.status}
                      onChange={(e) =>
                        onStatusChange(inq._id, e.target.value as InquiryStatus)
                      }
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border focus:outline-none transition-colors cursor-pointer ${badge.classes}`}
                    >
                      <option value="new">New Lead</option>
                      <option value="contacted">Contacted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="rejected">Rejected</option>
                      <option value="resolved">Resolved</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td
                    className="py-4 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onToggleRead(inq)}
                        title={inq.isRead ? "Mark as unread" : "Mark as read"}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-[#F4EFE9] transition-colors cursor-pointer"
                      >
                        {inq.isRead ? (
                          <EnvelopeIcon className="w-4 h-4" />
                        ) : (
                          <EnvelopeOpenIcon className="w-4 h-4 text-[#C88A4B]" />
                        )}
                      </button>

                      <button
                        onClick={() => onSelectInquiry(inq)}
                        title="View details & notes"
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-[#F4EFE9] transition-colors cursor-pointer"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDelete(inq)}
                        title="Archive / Delete inquiry"
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden divide-y divide-[#F4EFE9]">
        {inquiries.map((inq) => {
          const badge = getStatusBadge(inq.status);
          return (
            <div
              key={inq._id}
              onClick={() => onSelectInquiry(inq)}
              className={`p-4 space-y-3 cursor-pointer ${
                !inq.isRead ? "bg-[#FDFBF7]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {!inq.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C88A4B] shrink-0" />
                  )}
                  <div>
                    <h4 className="font-serif text-sm font-bold text-stone-900">
                      {inq.name}
                    </h4>
                    <p className="text-[11px] text-stone-500">{inq.email}</p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.classes}`}
                >
                  {badge.label}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-stone-800">{inq.subject}</p>
                <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                  {inq.message}
                </p>
              </div>

              {inq.checkIn && inq.checkOut && (
                <div className="flex items-center gap-2 text-[11px] text-stone-600 bg-stone-50 p-2 rounded-xl">
                  <CalendarDaysIcon className="w-4 h-4 text-[#C88A4B]" />
                  <span>
                    {inq.checkIn} to {inq.checkOut}
                  </span>
                  {inq.guests && <span>• {inq.guests} guests</span>}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#F4EFE9] text-xs text-stone-400">
                <span>{formatDate(inq.createdAt)}</span>
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onToggleRead(inq)}
                    className="p-1 rounded text-stone-500 hover:text-stone-900"
                  >
                    {inq.isRead ? (
                      <EnvelopeIcon className="w-4 h-4" />
                    ) : (
                      <EnvelopeOpenIcon className="w-4 h-4 text-[#C88A4B]" />
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(inq)}
                    className="p-1 rounded text-rose-500"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
