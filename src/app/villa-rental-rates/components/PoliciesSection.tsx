"use client";

import React, { useEffect, useRef } from "react";
import Icon from "@/components/ui/AppIcon";

const policies = [
  {
    icon: "BanknotesIcon",
    title: "Payment Terms",
    items: [
      "Rates are per night, per villa",
      "50% payment required at time of booking confirmation",
      "Final balance due 4 weeks prior to arrival",
      "Payments accepted via wire transfer or major credit cards",
    ],
  },
  {
    icon: "ArrowPathIcon",
    title: "Cancellation Policy",
    items: [
      "60-day notice required for full refund",
      "Cancellations within 60 days incur a 10% administrative fee",
      "Holiday period (Dec 15 – Jan 5) requires 90-day notice",
      "Travel insurance strongly recommended",
    ],
  },
  {
    icon: "DocumentTextIcon",
    title: "Booking Conditions",
    items: [
      "Minimum 3-night stay required",
      "Maximum occupancy: 10 guests",
      "Pets considered on request",
      "Security deposit of $2,000 required at check-in",
    ],
  },
];

export default function PoliciesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("active");
        });
      },
      { threshold: 0.1 },
    );
    const reveals = sectionRef.current?.querySelectorAll(".reveal") ?? [];
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-muted py-16 px-6 md:px-16">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-12 reveal">
          <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground mb-3">
            Booking Policies
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Transparent terms to make your booking process smooth and
            worry-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {policies.map((policy, i) => (
            <div
              key={policy.title}
              className={`reveal reveal-delay-${(i + 1) * 100} bg-card rounded-2xl p-7 border border-border card-shadow`}
            >
              <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-5">
                <Icon
                  name={policy.icon as "BanknotesIcon"}
                  size={22}
                  className="text-primary"
                />
              </div>
              <h3 className="font-semibold text-foreground mb-4">
                {policy.title}
              </h3>
              <ul className="space-y-3">
                {policy.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
