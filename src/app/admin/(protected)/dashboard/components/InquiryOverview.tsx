"use client";

import React from "react";
import Link from "next/link";
import {
  EnvelopeIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { InquiryRecord, InquiryStatus } from "@/lib/types/dashboard";

interface InquiryOverviewProps {
  inquiries: InquiryRecord[];
  isLoading?: boolean;
}

export default function InquiryOverview({
  inquiries,
  isLoading,
}: InquiryOverviewProps) {
  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case "new":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            New
          </span>
        );
      case "replied":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Replied
          </span>
        );
      case "archived":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600">
            Archived
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-sm animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-36 h-6 bg-[#F4EFE9] rounded" />
          <div className="w-24 h-4 bg-[#F4EFE9] rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#F4EFE9] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1C1917]">
            Guest Inquiries
          </h3>
          <p className="text-xs text-[#78716C]">
            Direct messages, quote requests, and concierge inquiries
          </p>
        </div>
        <Link
          href="/admin/inquiries"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1C1917] hover:text-[#C88A4B] transition-colors"
        >
          <span>View All Inquiries</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </Link>
      </div>

      {inquiries.length > 0 ? (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq._id}
              className="p-3.5 rounded-xl border border-[#F4EFE9] bg-[#FDFBF7] hover:border-[#C88A4B] hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-[#1C1917] truncate">
                    {inq.customerName}
                  </span>
                  <span className="text-[11px] text-[#78716C] truncate">
                    &bull; {inq.email}
                  </span>
                  <div>{getStatusBadge(inq.status)}</div>
                </div>
                <p className="text-xs font-medium text-[#44403C] truncate">
                  {inq.subject}
                </p>
                <p className="text-[11px] text-[#78716C] truncate mt-0.5">
                  {inq.messagePreview}
                </p>
              </div>

              <div className="text-[11px] text-[#78716C] shrink-0 self-start sm:self-center">
                {inq.date}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Professional Empty State */
        <div className="py-10 px-4 rounded-xl bg-[#FDFBF7] border border-dashed border-[#E7E5E4] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F4EFE9] text-[#78716C] flex items-center justify-center mb-3">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#C88A4B]" />
          </div>
          <h4 className="font-serif text-sm sm:text-base font-semibold text-[#1C1917] mb-1">
            No customer inquiries yet
          </h4>
          <p className="text-xs text-[#78716C] max-w-sm mb-4 leading-relaxed">
            When guests submit questions or reservation requests through the website contact forms, they will show up here.
          </p>
          <Link
            href="/admin/inquiries"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F4EFE9] hover:bg-[#E7E5E4] text-[#1C1917] text-xs font-semibold transition-all"
          >
            <span>Check Inquiries Inbox</span>
          </Link>
        </div>
      )}
    </div>
  );
}
