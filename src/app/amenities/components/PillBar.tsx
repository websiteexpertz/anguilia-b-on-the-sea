'use client';

import React, { useCallback, useState } from 'react';

const pills = [
  { id: 'aquatic', label: 'Pool • Spa' },
  { id: 'cinema', label: 'Home Theater' },
  { id: 'culinary', label: 'Kitchens & Grill' },
  { id: 'lounging', label: 'Decks & Views' },
  { id: 'outdoor', label: 'Outdoor Living' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'hospitality', label: 'Concierge & Services' },
];

export default function PillBar() {
  const [active, setActive] = useState<string | null>(null);

  const onClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActive(id);
      setTimeout(() => setActive(null), 1800);
    }
  }, []);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-3 items-center px-2 sm:px-0">
        {pills.map((p) => (
          <button
            key={p.id}
            onClick={() => onClick(p.id)}
            className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-shadow border ${
              active === p.id
                ? 'bg-[#0369A1] text-white shadow-xl'
                : 'bg-white text-[#0F172A] shadow-sm hover:shadow-md'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#0369A1]" />
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
