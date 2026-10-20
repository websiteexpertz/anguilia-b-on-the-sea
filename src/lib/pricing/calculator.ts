import {
  BaseRateConfig,
  SeasonalRule,
  AdditionalCharge,
  PricingCalculationResult,
  NightRateBreakdown,
  ChargeBreakdown,
} from "../types/pricing";

function parseDateStr(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function findMatchedSeason(d: Date, activeSeasons: SeasonalRule[]): SeasonalRule | undefined {
  const dStr = formatDateStr(d);
  const mmdd = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  for (const s of activeSeasons) {
    // 1. Exact ISO date match
    if (s.startDate && s.endDate && s.startDate.length === 10 && s.endDate.length === 10) {
      if (s.startDate <= dStr && s.endDate >= dStr) return s;
    }

    // 2. MM-DD match (e.g. 05-01 to 11-14 or crossing year 12-15 to 01-05)
    if (s.startDate && s.endDate && s.startDate.length === 5 && s.endDate.length === 5) {
      if (s.startDate <= s.endDate) {
        if (mmdd >= s.startDate && mmdd <= s.endDate) return s;
      } else {
        if (mmdd >= s.startDate || mmdd <= s.endDate) return s;
      }
    }

    // 3. Month name matching (e.g. from: "May 1", to: "Nov 14")
    if (s.from && s.to) {
      const parseMonthDay = (str: string, year: number) => {
        const parts = str.trim().split(" ");
        if (parts.length < 2) return null;
        const monthName = parts[0];
        const dayNum = Number(parts[1]);
        const m = MONTHS.findIndex((mn) => mn.toLowerCase().startsWith(monthName.toLowerCase()));
        if (m === -1 || isNaN(dayNum)) return null;
        return new Date(year, m, dayNum);
      };

      const year = d.getFullYear();
      const start = parseMonthDay(s.from, year);
      let end = parseMonthDay(s.to, year);
      if (start && end) {
        if (end < start) end = new Date(end.getFullYear() + 1, end.getMonth(), end.getDate());
        const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        if (dt >= start && dt <= end) return s;
        const dtNext = new Date(dt.getFullYear() + 1, dt.getMonth(), dt.getDate());
        if (dtNext >= start && dtNext <= end) return s;
      }
    }
  }

  return undefined;
}

export function calculateStayQuote({
  checkIn,
  checkOut,
  guests = 2,
  baseRate,
  seasons = [],
  charges = [],
}: {
  checkIn: string;
  checkOut: string;
  guests?: number;
  baseRate: BaseRateConfig;
  seasons?: SeasonalRule[];
  charges?: AdditionalCharge[];
}): PricingCalculationResult {
  const start = parseDateStr(checkIn);
  const end = parseDateStr(checkOut);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    throw new Error("Invalid stay dates: Check-out must be after check-in.");
  }

  const activeSeasons = seasons.filter((s) => s.isActive);
  const activeCharges = charges.filter((c) => c.isActive);

  const nightlyBreakdown: NightRateBreakdown[] = [];
  let subtotal = 0;

  // Iterate night by night (from checkIn date up to day before checkOut)
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const dStr = formatDateStr(d);
    const matchedSeason = findMatchedSeason(d, activeSeasons);
    const isWeekend = d.getDay() === 5 || d.getDay() === 6; // Friday & Saturday

    let rate = Number(baseRate.nightlyRate);
    if (matchedSeason) {
      if (isWeekend && matchedSeason.weekendNight !== undefined && matchedSeason.weekendNight !== null) {
        rate = Number(matchedSeason.weekendNight);
      } else {
        rate = Number(matchedSeason.perNight ?? matchedSeason.nightlyRate);
      }
    }

    nightlyBreakdown.push({
      date: dStr,
      rate,
      seasonName: matchedSeason ? matchedSeason.name : undefined,
    });

    subtotal += rate;
  }

  const nights = nightlyBreakdown.length;
  const averageNightlyRate = nights > 0 ? Math.round(subtotal / nights) : 0;

  // Calculate additional charges
  const chargesBreakdown: ChargeBreakdown[] = activeCharges.map((charge) => {
    let calculatedAmount = 0;

    switch (charge.type) {
      case "fixed":
        calculatedAmount = Number(charge.amount);
        break;
      case "percentage":
        calculatedAmount = Math.round((subtotal * Number(charge.amount)) / 100);
        break;
      case "per_night":
        calculatedAmount = Number(charge.amount) * nights;
        break;
      case "per_guest":
        calculatedAmount = Number(charge.amount) * Math.max(1, Number(guests));
        break;
    }

    return {
      id: charge._id,
      name: charge.name,
      type: charge.type,
      rateValue: Number(charge.amount),
      calculatedAmount,
    };
  });

  const totalCharges = chargesBreakdown.reduce(
    (sum, c) => sum + c.calculatedAmount,
    0
  );
  const grandTotal = subtotal + totalCharges;

  return {
    checkIn,
    checkOut,
    nights,
    guests: Math.max(1, Number(guests)),
    nightlyBreakdown,
    subtotal,
    averageNightlyRate,
    chargesBreakdown,
    totalCharges,
    grandTotal,
  };
}
