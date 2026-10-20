'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExclamationTriangleIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Booking } from '@/lib/types/booking';

interface DeleteBookingConfirmModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingId: string) => Promise<void>;
}

export default function DeleteBookingConfirmModal({
  booking,
  isOpen,
  onClose,
  onConfirm,
}: DeleteBookingConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen, booking]);

  if (!isOpen || !booking || !mounted) return null;

  const handleConfirm = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm(booking._id);
      onClose();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete booking.');
    } finally {
      setIsDeleting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-booking-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <ExclamationTriangleIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 id="delete-booking-title" className="font-semibold text-stone-900">
                Delete booking permanently?
              </h2>
              <p className="mt-0.5 text-xs text-stone-500">Booking {booking.bookingRef}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close delete confirmation"
            className="rounded-md p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-50"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-4 px-5 py-5">
          <p className="text-sm leading-relaxed text-stone-700">
            This permanently removes <strong>{booking.guestName}</strong>&apos;s booking for{' '}
            {booking.checkIn} to {booking.checkOut}. This cannot be undone. To preserve the record,
            cancel the booking instead.
          </p>
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {error}
            </p>
          )}
          <footer className="flex justify-end gap-2 border-t border-stone-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
            >
              Keep booking
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <TrashIcon className="h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete permanently'}
            </button>
          </footer>
        </div>
      </section>
    </div>,
    document.body
  );
}
