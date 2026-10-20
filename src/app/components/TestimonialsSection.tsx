import React from "react";
import Icon from "@/components/ui/AppIcon";
import { ReviewItem } from "@/lib/types/review";

interface TestimonialsSectionProps {
  reviews: ReviewItem[];
}

export default function TestimonialsSection({ reviews }: TestimonialsSectionProps) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="bg-stone-50 dark:bg-stone-950 py-24 px-6 md:px-16 border-t border-stone-200 dark:border-stone-800 relative overflow-hidden">
      <div className="max-w-screen-xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold text-amber-600 dark:text-amber-400 mb-3">
            Guest Testimonials
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-stone-900 dark:text-white tracking-tight">
            Memories Made at Villa B
          </h2>
          <p className="mt-4 text-base text-stone-600 dark:text-stone-400 leading-relaxed">
            Read what discerning travelers have shared about their stay at our secluded Caribbean estate.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.slice(0, 6).map((review) => (
            <div
              key={review._id}
              className="bg-white dark:bg-stone-900 rounded-2xl p-8 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Star rating */}
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? "text-amber-400 fill-amber-400" : "text-stone-300 dark:text-stone-700"
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
                    {review.rating}.0
                  </span>
                </div>

                {/* Review body */}
                <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed italic">
                  &ldquo;{review.reviewText}&rdquo;
                </p>
              </div>

              {/* Guest meta */}
              <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-stone-900 dark:text-white text-sm">
                    {review.guestName}
                  </h4>
                  {review.location && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {review.location}
                    </p>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Icon name="CheckCircleIcon" size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
