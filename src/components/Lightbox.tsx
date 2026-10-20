'use client';
import React, { useEffect } from 'react';
import Image from 'next/image';

type Props = {
  images: string[];
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
};

export default function Lightbox({ images, index, onClose, onNext, onPrev }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNext, onPrev]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
      <button
        className="absolute top-6 right-6 text-white text-2xl"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>
      <button
        className="absolute left-6 text-white text-3xl p-3"
        onClick={onPrev}
        aria-label="Previous"
      >
        ‹
      </button>
      <div className="max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center relative">
        <div className="relative w-full h-full">
          <Image src={images[index]} alt={`Bedroom ${index + 1}`} fill className="object-contain" />
        </div>
      </div>
      <button
        className="absolute right-6 text-white text-3xl p-3"
        onClick={onNext}
        aria-label="Next"
      >
        ›
      </button>
      <div className="absolute bottom-6 text-white text-sm">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}
