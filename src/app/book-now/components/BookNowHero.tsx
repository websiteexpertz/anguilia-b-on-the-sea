import React from "react";
import AppImage from "@/components/ui/AppImage";

interface BookNowHeroProps {
  image?: string;
}

export default function BookNowHero({ image }: BookNowHeroProps) {
  return (
    <section className="relative w-full h-[50vh] min-h-[340px] overflow-hidden bg-slate-900">
      {image ? (
        <AppImage
          src={image}
          alt="Reserve Your Stay at Villa B on the Sea"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-20">
        <span className="inline-block px-4 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-white/80 uppercase tracking-widest mb-5 animate-enter">
          Reserve Your Stay
        </span>
        <h1 className="font-display text-hero-xl text-white font-light tracking-tight animate-enter delay-200">
          Book Now
        </h1>
        <p className="text-white/70 text-base mt-4 max-w-md animate-enter delay-300">
          Complete the form below and our concierge team will respond within 24
          hours with availability and pricing.
        </p>
      </div>
    </section>
  );
}
